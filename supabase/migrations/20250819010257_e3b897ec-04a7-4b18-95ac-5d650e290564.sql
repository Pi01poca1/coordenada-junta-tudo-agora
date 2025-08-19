-- Corrigir funções importantes com search_path seguro
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  select exists (
    select 1
    from public.admin_emails a
    where a.email = auth.email()
  );
$$;

-- Corrigir função handle_new_user  
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name)
  VALUES (new.id, new.raw_user_meta_data ->> 'first_name', new.raw_user_meta_data ->> 'last_name');
  RETURN new;
END;
$$;

-- Corrigir função set_chapter_author
CREATE OR REPLACE FUNCTION public.set_chapter_author()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
begin
  if new.author_id is null then
    new.author_id := auth.uid();
  end if;
  return new;
end;
$$;