-- 005_rls_and_security.sql
-- Helper functions, GRANTs, RLS on all 12 tables, and function privileges.

-- ---------- helpers (SECURITY DEFINER, fixed search_path) ----------
CREATE OR REPLACE FUNCTION public.is_school_admin(_school_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT _school_id IS NOT NULL AND public.has_role(auth.uid(), 'admin') AND _school_id = public.current_school_id()
$$;

CREATE OR REPLACE FUNCTION public.is_class_teacher(_class_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.has_role(auth.uid(), 'teacher')
     AND EXISTS (SELECT 1 FROM public.classes WHERE id = _class_id AND teacher_id = auth.uid())
$$;

CREATE OR REPLACE FUNCTION public.is_class_student(_class_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.class_assignments
                  WHERE class_id = _class_id AND student_id = auth.uid() AND status = 'active')
$$;

CREATE OR REPLACE FUNCTION public.class_school(_class_id uuid)
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT school_id FROM public.classes WHERE id = _class_id
$$;

CREATE OR REPLACE FUNCTION public.lesson_class(_lesson_id uuid)
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT class_id FROM public.lessons WHERE id = _lesson_id
$$;

-- Teacher can see a student who is (or was) in one of their classes.
CREATE OR REPLACE FUNCTION public.teaches_student(_student_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.has_role(auth.uid(), 'teacher') AND EXISTS (
    SELECT 1 FROM public.class_assignments a JOIN public.classes c ON c.id = a.class_id
     WHERE a.student_id = _student_id AND c.teacher_id = auth.uid())
$$;

-- ---------- GRANTs (no anon access anywhere except reference data) ----------
GRANT SELECT ON public.languages, public.schools TO anon;
GRANT SELECT ON public.languages TO authenticated;
GRANT SELECT, UPDATE ON public.schools, public.profiles TO authenticated;
GRANT SELECT ON public.user_roles TO authenticated;
GRANT SELECT, INSERT ON public.teacher_requests TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.classes TO authenticated;
GRANT SELECT ON public.class_assignments TO authenticated;          -- writes only via functions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.lessons, public.lesson_translations, public.learning_materials TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.lesson_progress TO authenticated;
GRANT SELECT, INSERT ON public.activity_records TO authenticated;   -- append-only
GRANT ALL ON public.schools, public.languages, public.profiles, public.user_roles, public.teacher_requests,
             public.classes, public.class_assignments, public.lessons, public.lesson_translations,
             public.learning_materials, public.lesson_progress, public.activity_records TO service_role;

-- ---------- enable RLS ----------
ALTER TABLE public.schools             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.languages           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_requests    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_assignments   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_materials  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_progress     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_records    ENABLE ROW LEVEL SECURITY;

-- languages / schools: public reference data (needed on the signup screen).
CREATE POLICY languages_read ON public.languages FOR SELECT TO anon, authenticated USING (is_enabled);
CREATE POLICY schools_read   ON public.schools   FOR SELECT TO anon, authenticated USING (status = 'active');
CREATE POLICY schools_admin_update ON public.schools FOR UPDATE TO authenticated
  USING (public.is_school_admin(id)) WITH CHECK (public.is_school_admin(id));
-- Creating schools is a platform operation (service_role), not available to clients.

-- profiles
CREATE POLICY profiles_self_read ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid());
CREATE POLICY profiles_admin_read ON public.profiles FOR SELECT TO authenticated USING (public.is_school_admin(school_id));
CREATE POLICY profiles_teacher_read ON public.profiles FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'teacher') AND school_id = public.current_school_id());
CREATE POLICY profiles_self_update ON public.profiles FOR UPDATE TO authenticated
  USING (id = auth.uid()) WITH CHECK (id = auth.uid());          -- school_id guarded by trigger
CREATE POLICY profiles_admin_update ON public.profiles FOR UPDATE TO authenticated
  USING (public.is_school_admin(school_id) OR (school_id IS NULL AND public.has_role(auth.uid(), 'admin')))
  WITH CHECK (school_id IS NULL OR public.is_school_admin(school_id));

-- user_roles: read-only to clients. No INSERT/UPDATE/DELETE policy => no role escalation.
CREATE POLICY user_roles_self_read ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY user_roles_admin_read ON public.user_roles FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin')
         AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = user_roles.user_id AND public.is_school_admin(p.school_id)));

-- teacher_requests
CREATE POLICY teacher_requests_self_read ON public.teacher_requests FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY teacher_requests_admin_read ON public.teacher_requests FOR SELECT TO authenticated USING (public.is_school_admin(school_id));
CREATE POLICY teacher_requests_self_create ON public.teacher_requests FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND status = 'pending' AND reviewed_by IS NULL
              AND NOT public.has_role(auth.uid(), 'teacher'));
-- Review happens only through review_teacher_request().

-- classes
CREATE POLICY classes_read ON public.classes FOR SELECT TO authenticated
  USING (teacher_id = auth.uid() OR public.is_class_student(id) OR public.is_school_admin(school_id));
CREATE POLICY classes_teacher_create ON public.classes FOR INSERT TO authenticated
  WITH CHECK (teacher_id = auth.uid() AND public.has_role(auth.uid(), 'teacher')
              AND school_id = public.current_school_id());
CREATE POLICY classes_teacher_update ON public.classes FOR UPDATE TO authenticated
  USING (teacher_id = auth.uid() AND public.has_role(auth.uid(), 'teacher'))
  WITH CHECK (teacher_id = auth.uid() AND school_id = public.current_school_id());
CREATE POLICY classes_admin_update ON public.classes FOR UPDATE TO authenticated
  USING (public.is_school_admin(school_id)) WITH CHECK (public.is_school_admin(school_id));

-- class_assignments: read-only; writes only via assign_student_to_class / end_class_assignment.
CREATE POLICY class_assignments_student_read ON public.class_assignments FOR SELECT TO authenticated USING (student_id = auth.uid());
CREATE POLICY class_assignments_teacher_read ON public.class_assignments FOR SELECT TO authenticated USING (public.is_class_teacher(class_id));
CREATE POLICY class_assignments_admin_read ON public.class_assignments FOR SELECT TO authenticated USING (public.is_school_admin(public.class_school(class_id)));

-- lessons
CREATE POLICY lessons_staff_all ON public.lessons FOR ALL TO authenticated
  USING (public.is_class_teacher(class_id) OR public.is_school_admin(public.class_school(class_id)))
  WITH CHECK (public.is_class_teacher(class_id) OR public.is_school_admin(public.class_school(class_id)));
CREATE POLICY lessons_student_read ON public.lessons FOR SELECT TO authenticated
  USING (status = 'published' AND public.is_class_student(class_id));

-- lesson_translations
CREATE POLICY lesson_translations_staff_all ON public.lesson_translations FOR ALL TO authenticated
  USING (public.is_class_teacher(public.lesson_class(lesson_id)) OR public.is_school_admin(public.class_school(public.lesson_class(lesson_id))))
  WITH CHECK (public.is_class_teacher(public.lesson_class(lesson_id)) OR public.is_school_admin(public.class_school(public.lesson_class(lesson_id))));
CREATE POLICY lesson_translations_student_read ON public.lesson_translations FOR SELECT TO authenticated
  USING (status <> 'pending' AND EXISTS (SELECT 1 FROM public.lessons l
          WHERE l.id = lesson_id AND l.status = 'published' AND public.is_class_student(l.class_id)));

-- learning_materials
CREATE POLICY learning_materials_staff_all ON public.learning_materials FOR ALL TO authenticated
  USING (public.is_class_teacher(class_id) OR public.is_school_admin(public.class_school(class_id)))
  WITH CHECK (public.is_class_teacher(class_id) OR public.is_school_admin(public.class_school(class_id)));
CREATE POLICY learning_materials_student_read ON public.learning_materials FOR SELECT TO authenticated
  USING (status = 'active' AND public.is_class_student(class_id));

-- lesson_progress: students write their own progress for lessons in their active class.
CREATE POLICY lesson_progress_student_read ON public.lesson_progress FOR SELECT TO authenticated USING (student_id = auth.uid());
CREATE POLICY lesson_progress_student_insert ON public.lesson_progress FOR INSERT TO authenticated
  WITH CHECK (student_id = auth.uid() AND public.is_class_student(public.lesson_class(lesson_id)));
CREATE POLICY lesson_progress_student_update ON public.lesson_progress FOR UPDATE TO authenticated
  USING (student_id = auth.uid())
  WITH CHECK (student_id = auth.uid() AND public.is_class_student(public.lesson_class(lesson_id)));
CREATE POLICY lesson_progress_staff_read ON public.lesson_progress FOR SELECT TO authenticated
  USING (public.is_class_teacher(public.lesson_class(lesson_id)) OR public.is_school_admin(public.class_school(public.lesson_class(lesson_id))));

-- activity_records: append-only, actor must be caller, scoped to caller's school.
CREATE POLICY activity_self_read ON public.activity_records FOR SELECT TO authenticated USING (actor_id = auth.uid());
CREATE POLICY activity_teacher_read ON public.activity_records FOR SELECT TO authenticated USING (class_id IS NOT NULL AND public.is_class_teacher(class_id));
CREATE POLICY activity_admin_read ON public.activity_records FOR SELECT TO authenticated USING (public.is_school_admin(school_id));
CREATE POLICY activity_insert ON public.activity_records FOR INSERT TO authenticated
  WITH CHECK (actor_id = auth.uid() AND school_id = public.current_school_id()
              AND (class_id IS NULL OR public.class_school(class_id) = school_id));

-- ---------- function privileges ----------
REVOKE EXECUTE ON FUNCTION public.handle_new_user(), public.guard_profile_update(),
  public.log_class_assignment(), public.set_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.review_teacher_request(uuid, boolean, text),
  public.assign_student_to_class(uuid, uuid, text), public.end_class_assignment(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.review_teacher_request(uuid, boolean, text),
  public.assign_student_to_class(uuid, uuid, text), public.end_class_assignment(uuid, text) TO authenticated;
