-- 001_initial_setup.sql
-- Extensions, enum types and shared trigger helpers. No tables.
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

CREATE TYPE public.app_role              AS ENUM ('teacher', 'student', 'admin');
CREATE TYPE public.teacher_request_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE public.record_status          AS ENUM ('active', 'archived');
CREATE TYPE public.assignment_status      AS ENUM ('active', 'ended');
CREATE TYPE public.lesson_status          AS ENUM ('draft', 'published', 'archived');
CREATE TYPE public.translation_status     AS ENUM ('pending', 'machine', 'reviewed');
CREATE TYPE public.material_kind          AS ENUM ('document', 'audio', 'video', 'image', 'link', 'other');
CREATE TYPE public.progress_status        AS ENUM ('not_started', 'in_progress', 'completed');

-- Shared updated_at trigger.
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;
