-- 006_storage_policies.sql
-- Private bucket policies for 'learning-materials'.
-- The bucket itself must be created separately as PRIVATE (bucket creation is not done in SQL here).
-- Object path convention: <school_id>/<class_id>/<filename>

CREATE OR REPLACE FUNCTION public.storage_class_id(_name text)
RETURNS uuid LANGUAGE plpgsql IMMUTABLE SET search_path = public AS $$
BEGIN
  RETURN split_part(_name, '/', 2)::uuid;
EXCEPTION WHEN invalid_text_representation THEN
  RETURN NULL;
END;
$$;

CREATE OR REPLACE FUNCTION public.storage_path_valid(_name text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.storage_class_id(_name) IS NOT NULL
     AND public.class_school(public.storage_class_id(_name))::text = split_part(_name, '/', 1)
$$;

CREATE POLICY learning_materials_obj_read ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'learning-materials' AND public.storage_path_valid(name) AND (
         public.is_class_teacher(public.storage_class_id(name))
      OR public.is_class_student(public.storage_class_id(name))
      OR public.is_school_admin(public.class_school(public.storage_class_id(name)))));

CREATE POLICY learning_materials_obj_insert ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'learning-materials' AND public.storage_path_valid(name)
              AND public.is_class_teacher(public.storage_class_id(name)));

CREATE POLICY learning_materials_obj_update ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'learning-materials' AND public.is_class_teacher(public.storage_class_id(name)))
  WITH CHECK (bucket_id = 'learning-materials' AND public.storage_path_valid(name)
              AND public.is_class_teacher(public.storage_class_id(name)));

CREATE POLICY learning_materials_obj_delete ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'learning-materials' AND (
         public.is_class_teacher(public.storage_class_id(name))
      OR public.is_school_admin(public.class_school(public.storage_class_id(name)))));
