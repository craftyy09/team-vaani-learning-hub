-- 004_learning_management.sql
-- lessons, lesson_translations, learning_materials, lesson_progress, activity_records.

CREATE TABLE public.lessons (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id        uuid NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  author_id       uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  source_language text NOT NULL REFERENCES public.languages(code),
  title           text NOT NULL CHECK (length(trim(title)) BETWEEN 1 AND 200),
  content         text NOT NULL DEFAULT '' CHECK (length(content) <= 100000),
  status          public.lesson_status NOT NULL DEFAULT 'draft',
  published_at    timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  CHECK (status <> 'published' OR published_at IS NOT NULL)
);
CREATE INDEX lessons_class_idx ON public.lessons(class_id, status);

-- Filled later by a real translation provider or a human reviewer; never faked.
CREATE TABLE public.lesson_translations (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id     uuid NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  language_code text NOT NULL REFERENCES public.languages(code),
  title         text,
  content       text CHECK (length(content) <= 100000),
  status        public.translation_status NOT NULL DEFAULT 'pending',
  reviewed_by   uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE (lesson_id, language_code),
  CHECK (status = 'pending' OR content IS NOT NULL)
);

-- storage_path convention: <school_id>/<class_id>/<file>  in private bucket 'learning-materials'.
CREATE TABLE public.learning_materials (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id      uuid NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  lesson_id     uuid REFERENCES public.lessons(id) ON DELETE SET NULL,
  uploaded_by   uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  title         text NOT NULL CHECK (length(trim(title)) BETWEEN 1 AND 200),
  kind          public.material_kind NOT NULL DEFAULT 'document',
  language_code text REFERENCES public.languages(code),
  storage_path  text,
  external_url  text CHECK (external_url IS NULL OR external_url ~ '^https://'),
  size_bytes    bigint CHECK (size_bytes IS NULL OR size_bytes BETWEEN 0 AND 104857600),
  status        public.record_status NOT NULL DEFAULT 'active',
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  CHECK ((storage_path IS NOT NULL) <> (external_url IS NOT NULL)),
  UNIQUE (storage_path)
);
CREATE INDEX learning_materials_class_idx ON public.learning_materials(class_id);

CREATE TABLE public.lesson_progress (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id    uuid NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  student_id   uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status       public.progress_status NOT NULL DEFAULT 'not_started',
  percent      smallint NOT NULL DEFAULT 0 CHECK (percent BETWEEN 0 AND 100),
  completed_at timestamptz,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (lesson_id, student_id),
  CHECK ((status = 'completed') = (completed_at IS NOT NULL))
);
CREATE INDEX lesson_progress_student_idx ON public.lesson_progress(student_id);

-- Append-only audit/activity log.
CREATE TABLE public.activity_records (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id    uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  school_id   uuid REFERENCES public.schools(id) ON DELETE CASCADE,
  class_id    uuid REFERENCES public.classes(id) ON DELETE SET NULL,
  action      text NOT NULL CHECK (action ~ '^[a-z_.]{3,64}$'),
  entity_type text CHECK (length(entity_type) <= 64),
  entity_id   uuid,
  metadata    jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX activity_records_school_idx ON public.activity_records(school_id, created_at DESC);
CREATE INDEX activity_records_class_idx  ON public.activity_records(class_id, created_at DESC);

CREATE TRIGGER lessons_updated_at             BEFORE UPDATE ON public.lessons             FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER lesson_translations_updated_at BEFORE UPDATE ON public.lesson_translations FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER learning_materials_updated_at  BEFORE UPDATE ON public.learning_materials  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER lesson_progress_updated_at     BEFORE UPDATE ON public.lesson_progress     FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Audit every class-assignment change automatically.
CREATE OR REPLACE FUNCTION public.log_class_assignment()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.activity_records (actor_id, school_id, class_id, action, entity_type, entity_id, metadata)
  SELECT coalesce(NEW.ended_by, NEW.assigned_by), c.school_id, NEW.class_id,
         CASE WHEN TG_OP = 'INSERT' THEN 'class.assigned' ELSE 'class.unassigned' END,
         'class_assignment', NEW.id,
         jsonb_build_object('student_id', NEW.student_id, 'admin_override', NEW.is_admin_override)
    FROM public.classes c WHERE c.id = NEW.class_id;
  RETURN NEW;
END;
$$;
CREATE TRIGGER class_assignments_audit AFTER INSERT OR UPDATE OF status ON public.class_assignments
  FOR EACH ROW EXECUTE FUNCTION public.log_class_assignment();
