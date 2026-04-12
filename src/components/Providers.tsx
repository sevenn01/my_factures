'use client'

import { ThemeProvider } from '@/lib/themeContext'
import { LanguageProvider } from '@/lib/languageContext'
import { AuthProvider } from '@/lib/authContext'
import { CompanyProvider } from '@/lib/companyContext'

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <CompanyProvider>
            {children}
          </CompanyProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  )
}
