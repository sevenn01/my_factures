"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/authContext'
import { useCompany } from '@/lib/companyContext'
import { useLanguage } from '@/lib/languageContext'
import { supabase } from '@/lib/supabaseClient'
import Link from 'next/link'
import { StatCard } from '@/components/dashboard/StatCard'
import { RevenueChart } from '@/components/dashboard/RevenueChart'
import { RecentInvoices } from '@/components/dashboard/RecentInvoices'
import { 
  Plus, 
  Users, 
  Package, 
  FileText, 
  DollarSign, 
  CreditCard, 
  AlertCircle,
  ChevronRight,
  TrendingUp,
  LayoutDashboard
} from 'lucide-react'

export default function DashboardPage() {
  const { user, loading: authLoading, signOut } = useAuth()
  const { activeCompany, loading: companyLoading } = useCompany()
  const { t } = useLanguage()
  const router = useRouter()

  const [stats, setStats] = useState({
    totalPaid: 0,
    totalUnpaid: 0,
    totalInvoices: 0,
    totalClients: 0
  })
  const [chartData, setChartData] = useState<any[]>([])
  const [recentInvoices, setRecentInvoices] = useState<any[]>([])
  const [fetching, setFetching] = useState(false)

  const fetchDashboardData = async () => {
    if (!activeCompany?.id) return
    setFetching(true)
    try {
      // 1. Fetch Invoices for Stats and Chart
      const { data: invoices, error: invError } = await supabase
        .from('invoices')
        .select(`
          *,
          clients (name)
        `)
        .eq('company_id', activeCompany.id)
        .order('created_at', { ascending: false })

      if (invError) throw invError

      // 2. Fetch Client Count
      const { count: clientCount, error: clientError } = await supabase
        .from('clients')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', activeCompany.id)

      if (clientError) throw clientError

      // Process Stats
      let paid = 0
      let unpaid = 0
      invoices?.forEach(inv => {
        const s = inv.status?.toLowerCase()
        if (s === 'paid') paid += Number(inv.total)
        else if (s === 'draft' || s === 'sent') unpaid += Number(inv.total)
      })

      setStats({
        totalPaid: paid,
        totalUnpaid: unpaid,
        totalInvoices: invoices?.length || 0,
        totalClients: clientCount || 0
      })

      // Process Recent Invoices
      setRecentInvoices(invoices?.slice(0, 5).map(inv => ({
        id: inv.id,
        client_name: inv.clients?.name || 'Unknown',
        total: Number(inv.total),
        status: inv.status,
        created_at: inv.created_at
      })) || [])

      // Process Chart Data (Last 6 Months)
      const monthlyData: Record<string, { total: number, paid: number }> = {}
      const months = []
      for (let i = 5; i >= 0; i--) {
        const d = new Date()
        d.setMonth(d.getMonth() - i)
        const label = d.toLocaleString('default', { month: 'short' })
        months.push(label)
        monthlyData[label] = { total: 0, paid: 0 }
      }

      invoices?.forEach(inv => {
        const date = new Date(inv.created_at)
        const label = date.toLocaleString('default', { month: 'short' })
        if (monthlyData[label]) {
          monthlyData[label].total += Number(inv.total)
          if (inv.status?.toLowerCase() === 'paid') {
            monthlyData[label].paid += Number(inv.total)
          }
        }
      })

      setChartData(months.map(m => ({
        name: m,
        total: monthlyData[m].total,
        paid: monthlyData[m].paid
      })))

    } catch (err) {
      console.error('Error fetching dashboard data:', err)
    } finally {
      setFetching(false)
    }
  }

  useEffect(() => {
    if (user && activeCompany) {
      fetchDashboardData()
    }
  }, [user, activeCompany?.id])

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  if (authLoading || (companyLoading && !activeCompany)) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="text-muted animate-pulse font-medium">{t('common.loading')}...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full transition-all duration-300">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 md:mb-12">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500 hidden sm:flex shadow-inner border border-blue-500/20">
              <LayoutDashboard className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <h1 className="notion-title text-3xl sm:text-4xl lg:text-5xl !mb-0 tracking-tight font-black">
              {t('dashboard.title')}
            </h1>
          </div>
          <p className="text-[var(--muted)] text-sm sm:text-base font-medium opacity-70 ml-0 sm:ml-12">
            {t('dashboard.welcome')}
          </p>
        </div>
        
        <div className="flex items-center gap-3 self-start md:self-auto w-full sm:w-auto">
          <div className="flex items-center gap-3 p-1.5 sm:p-2 bg-[var(--hover-bg)]/50 backdrop-blur-md rounded-2xl border border-[var(--border)] shadow-sm transition-all group flex-1 sm:flex-initial">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[var(--foreground)] text-[var(--background)] flex items-center justify-center font-black text-lg shadow-lg transition-transform">
              {activeCompany?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col pr-4 overflow-hidden">
              <span className="text-xs sm:text-sm font-black text-[var(--foreground)] leading-none mb-1 truncate max-w-[150px]">{activeCompany?.name}</span>
              <span className="text-[10px] text-[var(--muted)] font-bold uppercase tracking-widest opacity-60">Active Workspace</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-10 sm:mb-16">
        <StatCard 
          title={t('dashboard.totalPaid')} 
          value={`${stats.totalPaid.toFixed(2)} ${activeCompany?.currency || 'DH'}`}
          icon={DollarSign}
          color="green"
          trend={{ value: 12, isUp: true }}
        />
        <StatCard 
          title={t('dashboard.totalUnpaid')} 
          value={`${stats.totalUnpaid.toFixed(2)} ${activeCompany?.currency || 'DH'}`}
          icon={AlertCircle}
          color="orange"
        />
        <StatCard 
          title={t('dashboard.totalInvoices')} 
          value={stats.totalInvoices}
          icon={FileText}
          color="blue"
        />
        <StatCard 
          title={t('dashboard.totalClients')} 
          value={stats.totalClients}
          icon={Users}
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 sm:gap-8 mb-12 sm:mb-20">
        {/* Revenue Chart - Taking 2/3 of space on desktop */}
        <div className="xl:col-span-2">
          <RevenueChart 
            data={chartData} 
            currency={activeCompany?.currency || 'DH'} 
          />
        </div>

        {/* Recent Invoices - Taking 1/3 of space on desktop */}
        <div className="xl:col-span-1">
          <RecentInvoices 
            invoices={recentInvoices} 
            currency={activeCompany?.currency || 'DH'} 
          />
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--muted)] opacity-50 flex items-center gap-4 before:content-[''] before:h-px before:flex-1 before:bg-[var(--border)] after:content-[''] after:h-px after:flex-1 after:bg-[var(--border)]">
          Quick Actions
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/invoices/new" className="notion-box !m-0 !p-5 flex items-center gap-4 border border-[var(--border)] hover:border-blue-500 transition-all group rounded-2xl">
            <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-500 transition-transform">
              <Plus className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-sm group-hover:text-blue-500 tracking-tight">{t('dashboard.newInvoice')}</span>
              <span className="text-[10px] text-[var(--muted)] font-bold uppercase tracking-wider opacity-60">{t('dashboard.billAClient')}</span>
            </div>
          </Link>

          <Link href="/clients" className="notion-box !m-0 !p-5 flex items-center gap-4 border border-[var(--border)] hover:border-purple-500 transition-all group rounded-2xl">
            <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-900/20 text-purple-600 transition-transform">
              <Users className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-sm group-hover:text-purple-600 tracking-tight">{t('dashboard.viewClients')}</span>
              <span className="text-[10px] text-[var(--muted)] font-bold uppercase tracking-wider opacity-60">{t('dashboard.manageCrm')}</span>
            </div>
          </Link>
          
          <Link href="/products" className="notion-box !m-0 !p-5 flex items-center gap-4 border border-[var(--border)] hover:border-orange-500 transition-all group rounded-2xl">
            <div className="p-3 rounded-xl bg-orange-50 dark:bg-orange-900/20 text-orange-600 transition-transform">
              <Package className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-sm group-hover:text-orange-600 tracking-tight">{t('dashboard.manageItems')}</span>
              <span className="text-[10px] text-[var(--muted)] font-bold uppercase tracking-wider opacity-60">{t('dashboard.productsServices')}</span>
            </div>
          </Link>

          <Link href="/pricing" className="notion-box !m-0 !p-5 flex items-center gap-4 bg-[var(--hover-bg)]/30 border border-dashed border-[var(--border)] hover:border-[var(--foreground)] transition-all group rounded-2xl opacity-80 hover:opacity-100">
            <div className="p-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-[var(--muted)] group-hover:text-[var(--foreground)] transition-all">
              <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-sm tracking-tight">{t('dashboard.addWorkspace')}</span>
              <span className="text-[10px] text-blue-500 font-bold uppercase tracking-[0.2em]">{t('dashboard.upgradePro')}</span>
            </div>
          </Link>
        </div>
      </div>
    </main>
  )
}
