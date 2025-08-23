-- Security Fix 8: Create security monitoring functions for admins (corrected)
-- Functions can have security controls, views cannot have RLS policies

-- Drop the problematic view first
DROP VIEW IF EXISTS public.security_overview;

-- Create security monitoring function instead
CREATE OR REPLACE FUNCTION public.get_security_overview()
RETURNS TABLE(metric text, value text, description text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
    -- Only admins can access security overview
    IF NOT is_admin() THEN
        RAISE EXCEPTION 'Access denied. Admin privileges required.';
    END IF;
    
    RETURN QUERY
    SELECT 
        'failed_logins_last_24h'::text as metric,
        COUNT(*)::text as value,
        'Failed login attempts in last 24 hours'::text as description
    FROM public.failed_login_attempts 
    WHERE attempt_time > now() - interval '24 hours'

    UNION ALL

    SELECT 
        'admin_actions_last_24h'::text as metric,
        COUNT(*)::text as value,
        'Admin actions in last 24 hours'::text as description
    FROM public.admin_audit_log 
    WHERE created_at > now() - interval '24 hours'

    UNION ALL

    SELECT 
        'total_users'::text as metric,
        COUNT(*)::text as value,
        'Total registered users'::text as description
    FROM public.profiles

    UNION ALL

    SELECT 
        'admin_users'::text as metric,
        COUNT(*)::text as value,
        'Total admin users'::text as description
    FROM public.profiles 
    WHERE role = 'admin';
    
    -- Log access to security overview
    INSERT INTO public.admin_audit_log (admin_id, action, details, created_at)
    VALUES (auth.uid(), 'view_security_overview', 'Accessed security dashboard', now());
END;
$$;

-- Security Fix 9: Create function to log failed login attempts (for frontend integration)
CREATE OR REPLACE FUNCTION public.log_failed_login_attempt(
    user_email text, 
    failure_reason text DEFAULT 'Authentication failed',
    user_ip text DEFAULT NULL,
    user_agent_string text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
    INSERT INTO public.failed_login_attempts (email, reason, ip_address, user_agent, attempt_time)
    VALUES (user_email, failure_reason, user_ip, user_agent_string, now());
END;
$$;

-- Security Fix 10: Create comprehensive security audit function
CREATE OR REPLACE FUNCTION public.run_security_audit()
RETURNS TABLE(
    category text, 
    check_name text, 
    status text, 
    message text, 
    recommendation text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
    -- Only admins can run security audit
    IF NOT is_admin() THEN
        RAISE EXCEPTION 'Access denied. Admin privileges required.';
    END IF;
    
    -- Check for users with multiple failed login attempts
    RETURN QUERY
    WITH recent_failures AS (
        SELECT email, COUNT(*) as failure_count
        FROM public.failed_login_attempts 
        WHERE attempt_time > now() - interval '24 hours'
        GROUP BY email
        HAVING COUNT(*) >= 3
    )
    SELECT 
        'Authentication'::text as category,
        'Multiple Failed Logins'::text as check_name,
        CASE WHEN EXISTS (SELECT 1 FROM recent_failures) THEN 'WARNING' ELSE 'OK' END::text as status,
        COALESCE((SELECT COUNT(*)::text || ' users with 3+ failed login attempts in 24h' FROM recent_failures), '0 users with excessive failed logins')::text as message,
        'Monitor these accounts for potential brute force attacks'::text as recommendation
    
    UNION ALL
    
    -- Check admin activity levels
    SELECT 
        'Administration'::text as category,
        'Admin Activity'::text as check_name,
        CASE 
            WHEN (SELECT COUNT(*) FROM public.admin_audit_log WHERE created_at > now() - interval '1 hour') > 100 THEN 'WARNING'
            ELSE 'OK'
        END::text as status,
        (SELECT COUNT(*)::text || ' admin actions in the last hour' FROM public.admin_audit_log WHERE created_at > now() - interval '1 hour')::text as message,
        'Unusual admin activity detected - verify legitimacy'::text as recommendation
    
    UNION ALL
    
    -- Check for admin users
    SELECT 
        'Access Control'::text as category,
        'Admin Users Count'::text as check_name,
        'INFO'::text as status,
        (SELECT COUNT(*)::text || ' admin users configured' FROM public.profiles WHERE role = 'admin')::text as message,
        'Regularly audit admin access privileges'::text as recommendation;
    
    -- Log security audit execution
    INSERT INTO public.admin_audit_log (admin_id, action, details, created_at)
    VALUES (auth.uid(), 'security_audit', 'Executed comprehensive security audit', now());
END;
$$;