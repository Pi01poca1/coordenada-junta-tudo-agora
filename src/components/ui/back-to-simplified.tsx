import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export const BackToSimplified = () => {
  const location = useLocation()
  
  // Show back button if we came from simplified routes or if current path suggests simplified usage
  const showBackButton = location.pathname.includes('/simplified') || 
                         location.state?.from?.includes('/simplified') ||
                         // Check if accessed via simplified panel (stored in sessionStorage)
                         sessionStorage.getItem('fromSimplified') === 'true'

  if (!showBackButton) return null

  const handleClick = () => {
    // Clear the simplified flag when going back
    sessionStorage.removeItem('fromSimplified')
  }

  return (
    <div className="mb-4">
      <Link to="/simplified" onClick={handleClick}>
        <Button variant="outline" size="sm">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar ao Painel Simplificado
        </Button>
      </Link>
    </div>
  )
}