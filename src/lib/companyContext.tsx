'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useAuth } from './authContext'
import { supabase } from './supabaseClient'

export interface Company {
  id: string
  name: string
  ice?: string
  address?: string
  phone?: string
  email?: string
  logo_url?: string
  currency?: string
}

interface CompanyContextType {
  activeCompany: Company | null
  companies: Company[]
  loading: boolean
  setActiveCompany: (company: Company | null) => void
  refreshCompanies: () => Promise<void>
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined)

export function CompanyProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [activeCompany, _setActiveCompany] = useState<Company | null>(null)
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)

  // Wrapped setActiveCompany to save to local storage
  const setActiveCompany = (company: Company | null) => {
    _setActiveCompany(company)
    if (company) {
      localStorage.setItem('monfactures_active_company_id', company.id)
    }
  }

  const fetchCompanies = async () => {
    if (!user) {
      setCompanies([])
      setActiveCompany(null)
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase
        .from('company_users')
        .select(`
          company_id,
          companies:companies (*)
        `)
        .eq('user_id', user.id)

      if (error) throw error

      if (data && data.length > 0) {
        const fetchedCompanies = data
          .map((item: any) => item.companies)
          .filter(Boolean) as Company[]
        
        setCompanies(fetchedCompanies)

        // Persistence Logic: Restore from localStorage if available
        const savedId = typeof window !== 'undefined' ? localStorage.getItem('monfactures_active_company_id') : null
        
        let target = null
        if (savedId) {
          target = fetchedCompanies.find(c => c.id === savedId)
        }

        // Fallback or Initial Selection
        if (!target && fetchedCompanies.length > 0) {
          target = fetchedCompanies[0]
        }

        if (target) {
          // Use _setActiveCompany to avoid redundant localStorage.set in this initial fetch
          _setActiveCompany(target)
        }
        
      } else {
        setCompanies([])
        setActiveCompany(null)
      }
    } catch (error) {
      console.error('[CompanyContext] Error fetching companies:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCompanies()
  }, [user])

  return (
    <CompanyContext.Provider
      value={{
        activeCompany,
        companies,
        loading,
        setActiveCompany,
        refreshCompanies: fetchCompanies
      }}
    >
      {children}
    </CompanyContext.Provider>
  )
}

export function useCompany() {
  const context = useContext(CompanyContext)
  if (context === undefined) {
    throw new Error('useCompany must be used within a CompanyProvider')
  }
  return context
}
