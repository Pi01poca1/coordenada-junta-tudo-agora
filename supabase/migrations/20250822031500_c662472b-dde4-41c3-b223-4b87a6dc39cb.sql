-- Security Fix 1: Update all database functions with proper search_path
-- This prevents function hijacking attacks by ensuring functions only access public schema

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_table_of_contents()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Update existing entry or insert new one
  INSERT INTO public.table_of_contents (book_id, chapter_id, level)
  VALUES (NEW.book_id, NEW.id, 1)
  ON CONFLICT (chapter_id) 
  DO UPDATE SET updated_at = now();
  
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
STABLE 
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Check both email-based admin (existing) and role-based admin (new)
  RETURN exists (
    SELECT 1
    FROM public.admin_emails a
    WHERE a.email = auth.email()
  ) OR exists (
    SELECT 1 
    FROM public.profiles p
    WHERE p.id = auth.uid() AND p.role = 'admin'
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.get_admin_users_data()
RETURNS TABLE(id uuid, email text, created_at timestamp with time zone, last_sign_in_at timestamp with time zone, name text, first_name text, last_name text, bio text, role text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Verificar se o usuário é admin
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Access denied. Admin privileges required.';
  END IF;
  
  -- Log admin action for security monitoring
  INSERT INTO public.admin_audit_log (admin_id, action, details, created_at)
  VALUES (auth.uid(), 'view_users', 'Accessed user data list', now());
  
  -- Retornar dados de profiles
  RETURN QUERY
  SELECT 
    p.id,
    COALESCE(p.first_name || ' ' || p.last_name, p.name, 'Usuário')::text as email_display,
    p.created_at,
    p.updated_at as last_sign_in_at,
    p.name,
    p.first_name,
    p.last_name,
    p.bio,
    COALESCE(p.role, 'user')::text as role
  FROM public.profiles p
  ORDER BY p.created_at DESC;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, first_name, last_name, role)
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data ->> 'name', new.raw_user_meta_data ->> 'first_name'),
    new.raw_user_meta_data ->> 'first_name', 
    new.raw_user_meta_data ->> 'last_name',
    'user'
  );
  RETURN new;
END;
$$;

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  new.updated_at = now();
  return new;
END;
$$;

CREATE OR REPLACE FUNCTION public.set_chapter_author()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  if new.author_id is null then
    new.author_id := auth.uid();
  end if;
  return new;
END;
$$;

-- Security Fix 2: Create admin promotion function (admin-only)
CREATE OR REPLACE FUNCTION public.promote_user_to_admin(target_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Only admins can promote users
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Access denied. Admin privileges required.';
  END IF;
  
  -- Update user role to admin
  UPDATE public.profiles 
  SET role = 'admin', updated_at = now()
  WHERE id = target_user_id;
  
  -- Log the admin action
  INSERT INTO public.admin_audit_log (admin_id, action, details, target_user_id, created_at)
  VALUES (auth.uid(), 'promote_admin', 'Promoted user to admin role', target_user_id, now());
  
  RETURN FOUND;
END;
$$;

-- Security Fix 3: Create audit logging table
CREATE TABLE IF NOT EXISTS public.admin_audit_log (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id uuid NOT NULL,
  action text NOT NULL,
  details text,
  target_user_id uuid,
  ip_address text,
  user_agent text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on audit log
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admins can view audit logs" 
ON public.admin_audit_log 
FOR SELECT 
USING (is_admin());

-- System can insert audit logs
CREATE POLICY "System can insert audit logs" 
ON public.admin_audit_log 
FOR INSERT 
WITH CHECK (true);

-- Security Fix 4: Create failed login attempts tracking
CREATE TABLE IF NOT EXISTS public.failed_login_attempts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email text NOT NULL,
  ip_address text,
  user_agent text,
  attempt_time timestamp with time zone NOT NULL DEFAULT now(),
  reason text
);

-- Enable RLS on failed login attempts
ALTER TABLE public.failed_login_attempts ENABLE ROW LEVEL SECURITY;

-- Only admins can view failed login attempts
CREATE POLICY "Admins can view failed login attempts" 
ON public.failed_login_attempts 
FOR SELECT 
USING (is_admin());

-- System can insert failed login attempts
CREATE POLICY "System can insert failed login attempts" 
ON public.failed_login_attempts 
FOR INSERT 
WITH CHECK (true);

-- Security Fix 5: Add function to check for suspicious login patterns
CREATE OR REPLACE FUNCTION public.check_failed_login_attempts(user_email text, threshold integer DEFAULT 5)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  recent_failures integer;
BEGIN
  -- Count failed attempts in last 15 minutes
  SELECT COUNT(*) INTO recent_failures
  FROM public.failed_login_attempts
  WHERE email = user_email 
    AND attempt_time > (now() - interval '15 minutes');
  
  RETURN recent_failures >= threshold;
END;
$$;

-- Security Fix 6: Add indexes for performance on security tables
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_admin_id ON public.admin_audit_log(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_created_at ON public.admin_audit_log(created_at);
CREATE INDEX IF NOT EXISTS idx_failed_login_attempts_email ON public.failed_login_attempts(email);
CREATE INDEX IF NOT EXISTS idx_failed_login_attempts_time ON public.failed_login_attempts(attempt_time);