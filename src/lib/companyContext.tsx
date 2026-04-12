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
  const [activeCompany, setActiveCompany] = useState<Company | null>(null)
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)

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
        // Map the tricky join structure to a flat company array
        const fetchedCompanies = data
          .map((item: any) => item.companies)
          .filter(Boolean) as Company[]
        
        setCompanies(fetchedCompanies)

        // Select the first company if no active company is set or if active doesn't exist anymore
        if (fetchedCompanies.length > 0 && !activeCompany) {
          setActiveCompany(fetchedCompanies[0])
        }
      } else {
        setCompanies([])
        setActiveCompany(null)
      }
    } catch (error) {
      console.error('Error fetching companies:', error)
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
