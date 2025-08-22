import { useAuth } from "@/contexts/AuthContext"
import { useEffect, useState } from "react"
import { supabase } from "@/integrations/supabase/client"

export function useIsAdmin() {
  const { user } = useAuth()
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkAdmin() {
      console.log('🔍 Checking admin status for user:', user?.email)
      
      if (!user) {
        console.log('❌ No user found')
        setIsAdmin(false)
        setLoading(false)
        return
      }

      try {
        console.log('🔍 Calling is_admin function...')
        // Check if user is admin via database function
        const { data, error } = await supabase.rpc('is_admin')
        
        if (error) {
          console.error('❌ Error checking admin status:', error)
          setIsAdmin(false)
        } else {
          console.log('✅ Admin check result:', data)
          setIsAdmin(data === true)
        }
      } catch (error) {
        console.error('❌ Exception checking admin status:', error)
        setIsAdmin(false)
      } finally {
        setLoading(false)
      }
    }

    checkAdmin()
  }, [user])

  console.log('🎯 useIsAdmin returning:', { isAdmin, loading })
  return { isAdmin, loading }
}
