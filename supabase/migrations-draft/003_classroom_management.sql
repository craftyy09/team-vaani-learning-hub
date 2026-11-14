-- 003_classroom_management.sql
-- classes, class_assignments (history-preserving) + atomic assignment function.

CREATE TABLE public.classes (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id     uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  teacher_id    uuid NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  name          text NOT NULL CHECK (length(trim(name)) BETWEEN 1 AND 120),
  grade         text CHECK (length(grade) <= 40),
  language_code text NOT NULL DEFAULT 'en' REFERENCES public.languages(code),
  status        public.record_status NOT NULL DEFAULT 'active',
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE (school_id, name)
);
CREATE INDEX classes_teacher_idx ON public.classes(teacher_id);
CREATE TRIGGER classes_updated_at BEFORE UPDATE ON public.classes FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Rows are never deleted: ending an assignment sets status='ended' to keep history.
CREATE TABLE public.class_assignments (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id  uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  class_id    uuid NOT NULL REFERENCES public.classes(id) ON DELETE RESTRICT,
  status      public.assignment_status NOT NULL DEFAULT 'active',
  assigned_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  started_at  timestamptz NOT NULL DEFAULT now(),
  ended_at    timestamptz,
  ended_by    uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  reason      text CHECK (length(reason) <= 500),
  is_admin_override boolean NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now(),
  CHECK ((status = 'active') = (ended_at IS NULL)),
  CHECK (ended_at IS NULL OR ended_at >= started_at)
);
-- Enforces one active class per student.
CREATE UNIQUE INDEX class_assignments_one_active
  ON public.class_assignments(student_id) WHERE status = 'active';
CREATE INDEX class_assignments_class_idx ON public.class_assignments(class_id) WHERE status = 'active';

-- Atomic teacher-controlled assignment with admin override.
-- Teacher: must own the (active) class. Admin: same school, flagged as override.
-- Student must hold the student role and belong to the class's school.
CREATE OR REPLACE FUNCTION public.assign_student_to_class(_student_id uuid, _class_id uuid, _reason text DEFAULT NULL)
RETURNS public.class_assignments LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _caller uuid := auth.uid();
  _class  public.classes;
  _is_admin boolean;
  _row public.class_assignments;
BEGIN
  IF _caller IS NULL THEN RAISE EXCEPTION 'not authenticated' USING ERRCODE = '42501'; END IF;

  SELECT * INTO _class FROM public.classes WHERE id = _class_id AND status = 'active';
  IF NOT FOUND THEN RAISE EXCEPTION 'class not found or archived'; END IF;

  _is_admin := public.has_role(_caller, 'admin') AND _class.school_id = public.current_school_id();
  IF NOT (_is_admin OR (_class.teacher_id = _caller AND public.has_role(_caller, 'teacher'))) THEN
    RAISE EXCEPTION 'not authorized' USING ERRCODE = '42501';
  END IF;

  IF NOT public.has_role(_student_id, 'student') THEN RAISE EXCEPTION 'target is not a student'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = _student_id AND school_id = _class.school_id) THEN
    RAISE EXCEPTION 'student is not in this school' USING ERRCODE = '42501';
  END IF;

  -- Serialize concurrent assignments for the same student.
  PERFORM pg_advisory_xact_lock(hashtext('class_assignment:' || _student_id::text));

  -- A teacher may only move a student whose current class they also teach.
  IF NOT _is_admin AND EXISTS (
       SELECT 1 FROM public.class_assignments a JOIN public.classes c ON c.id = a.class_id
        WHERE a.student_id = _student_id AND a.status = 'active' AND c.teacher_id <> _caller) THEN
    RAISE EXCEPTION 'student is assigned to another teacher''s class; admin override required' USING ERRCODE = '42501';
  END IF;

  UPDATE public.class_assignments
     SET status = 'ended', ended_at = now(), ended_by = _caller
   WHERE student_id = _student_id AND status = 'active';

  INSERT INTO public.class_assignments (student_id, class_id, assigned_by, reason, is_admin_override)
  VALUES (_student_id, _class_id, _caller, _reason, _is_admin AND _class.teacher_id <> _caller)
  RETURNING * INTO _row;
  RETURN _row;
END;
$$;

CREATE OR REPLACE FUNCTION public.end_class_assignment(_student_id uuid, _reason text DEFAULT NULL)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _caller uuid := auth.uid(); _a public.class_assignments; _c public.classes;
BEGIN
  SELECT * INTO _a FROM public.class_assignments WHERE student_id = _student_id AND status = 'active' FOR UPDATE;
  IF NOT FOUND THEN RETURN; END IF;
  SELECT * INTO _c FROM public.classes WHERE id = _a.class_id;
  IF NOT ((_c.teacher_id = _caller AND public.has_role(_caller, 'teacher'))
       OR (public.has_role(_caller, 'admin') AND _c.school_id = public.current_school_id())) THEN
    RAISE EXCEPTION 'not authorized' USING ERRCODE = '42501';
  END IF;
  UPDATE public.class_assignments
     SET status = 'ended', ended_at = now(), ended_by = _caller, reason = coalesce(_reason, reason)
   WHERE id = _a.id;
END;
$$;
