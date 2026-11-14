-- 002_identity_and_roles.sql
-- schools, languages, profiles, user_roles, teacher_requests + signup and approval logic.

CREATE TABLE public.schools (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL CHECK (length(trim(name)) BETWEEN 2 AND 200),
  code        text NOT NULL UNIQUE CHECK (code ~ '^[A-Z0-9-]{3,32}$'),
  region      text,
  status      public.record_status NOT NULL DEFAULT 'active',
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.languages (
  code         text PRIMARY KEY CHECK (code ~ '^[a-z]{2,3}(-[A-Z]{2})?$'),
  english_name text NOT NULL,
  native_name  text NOT NULL,
  is_enabled   boolean NOT NULL DEFAULT true,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.languages (code, english_name, native_name) VALUES
  ('en','English','English'), ('hi','Hindi','हिन्दी'), ('bn','Bengali','বাংলা'),
  ('ta','Tamil','தமிழ்'), ('te','Telugu','తెలుగు'), ('mr','Marathi','मराठी'),
  ('gu','Gujarati','ગુજરાતી'), ('kn','Kannada','ಕನ್ನಡ');

-- Profile holds display data only. Roles are NEVER stored here.
CREATE TABLE public.profiles (
  id                 uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name          text NOT NULL DEFAULT '' CHECK (length(full_name) <= 120),
  school_id          uuid REFERENCES public.schools(id) ON DELETE SET NULL,
  preferred_language text NOT NULL DEFAULT 'en' REFERENCES public.languages(code),
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX profiles_school_idx ON public.profiles(school_id);

-- Roles live in their own table to prevent privilege escalation.
CREATE TABLE public.user_roles (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role       public.app_role NOT NULL,
  granted_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

CREATE TABLE public.teacher_requests (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  school_id    uuid REFERENCES public.schools(id) ON DELETE SET NULL,
  message      text CHECK (length(message) <= 1000),
  status       public.teacher_request_status NOT NULL DEFAULT 'pending',
  reviewed_by  uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  reviewed_at  timestamptz,
  review_note  text CHECK (length(review_note) <= 1000),
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now(),
  CHECK ((status = 'pending') = (reviewed_at IS NULL))
);
-- Only one open request per user.
CREATE UNIQUE INDEX teacher_requests_one_pending
  ON public.teacher_requests(user_id) WHERE status = 'pending';

CREATE TRIGGER schools_updated_at   BEFORE UPDATE ON public.schools   FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER languages_updated_at BEFORE UPDATE ON public.languages FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER profiles_updated_at  BEFORE UPDATE ON public.profiles  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER teacher_requests_updated_at BEFORE UPDATE ON public.teacher_requests FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Role check (SECURITY DEFINER avoids RLS recursion).
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.current_school_id()
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT school_id FROM public.profiles WHERE id = auth.uid()
$$;

-- Secure profile creation on signup.
-- Every new user gets a profile and the 'student' role only.
-- Asking to be a teacher (metadata requested_role = 'teacher') creates a PENDING
-- request; it never grants the role. Metadata is user-controlled and is never trusted for privileges.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _lang text := NEW.raw_user_meta_data ->> 'preferred_language';
BEGIN
  IF _lang IS NULL OR NOT EXISTS (SELECT 1 FROM public.languages WHERE code = _lang AND is_enabled) THEN
    _lang := 'en';
  END IF;

  INSERT INTO public.profiles (id, full_name, preferred_language)
  VALUES (NEW.id, left(coalesce(NEW.raw_user_meta_data ->> 'full_name', ''), 120), _lang);

  IF NEW.raw_user_meta_data ->> 'requested_role' = 'teacher' THEN
    INSERT INTO public.teacher_requests (user_id) VALUES (NEW.id);
  ELSE
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'student');
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Users may edit name/language only; school_id changes require an admin.
CREATE OR REPLACE FUNCTION public.guard_profile_update()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.id <> OLD.id THEN RAISE EXCEPTION 'profile id is immutable'; END IF;
  IF NEW.school_id IS DISTINCT FROM OLD.school_id
     AND auth.uid() IS NOT NULL
     AND NOT (public.has_role(auth.uid(), 'admin')
              AND (OLD.school_id IS NULL OR OLD.school_id = public.current_school_id())
              AND (NEW.school_id IS NULL OR NEW.school_id = public.current_school_id())) THEN
    RAISE EXCEPTION 'only a school admin can change school membership';
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER profiles_guard BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.guard_profile_update();

-- Teacher approval: admin of the same school only. Atomic.
CREATE OR REPLACE FUNCTION public.review_teacher_request(_request_id uuid, _approve boolean, _note text DEFAULT NULL)
RETURNS public.teacher_requests LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _req public.teacher_requests;
  _admin uuid := auth.uid();
BEGIN
  IF _admin IS NULL OR NOT public.has_role(_admin, 'admin') THEN
    RAISE EXCEPTION 'not authorized' USING ERRCODE = '42501';
  END IF;

  SELECT * INTO _req FROM public.teacher_requests WHERE id = _request_id FOR UPDATE;
  IF NOT FOUND OR _req.status <> 'pending' THEN RAISE EXCEPTION 'request not pending'; END IF;
  IF _req.school_id IS DISTINCT FROM public.current_school_id() THEN
    RAISE EXCEPTION 'cross-school review not allowed' USING ERRCODE = '42501';
  END IF;
  IF _req.user_id = _admin THEN RAISE EXCEPTION 'cannot review own request'; END IF;

  UPDATE public.teacher_requests
     SET status = CASE WHEN _approve THEN 'approved'::public.teacher_request_status ELSE 'rejected' END,
         reviewed_by = _admin, reviewed_at = now(), review_note = _note
   WHERE id = _request_id RETURNING * INTO _req;

  IF _approve THEN
    INSERT INTO public.user_roles (user_id, role, granted_by) VALUES (_req.user_id, 'teacher', _admin)
    ON CONFLICT (user_id, role) DO NOTHING;
    UPDATE public.profiles SET school_id = _req.school_id WHERE id = _req.user_id;
  END IF;
  RETURN _req;
END;
$$;
