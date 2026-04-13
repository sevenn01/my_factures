'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/authContext'
import { ArrowRight, CheckCircle2, ChevronRight, LayoutDashboard, Receipt, Users, Zap } from 'lucide-react'

export default function Home() {
  const { user, loading } = useAuth()
  const router = useRouter()

  const handleProClick = (e: React.MouseEvent) => {
    e.preventDefault()
    alert("Coming soon!")
  }

  return (
    <div className="min-h-screen bg-[#fafafa] text-[#111827] font-sans selection:bg-neutral-200">
      {/* Navigation */}
      <nav className="fixed w-full top-0 z-50 bg-[#fafafa]/80 backdrop-blur-md border-b border-neutral-200/50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-neutral-900 rounded-lg flex items-center justify-center">
              <Receipt className="w-5 h-5 text-white" />
            </div>
            <span className="font-medium text-lg tracking-tight">Monfactures</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-neutral-600">
            <a href="#features" className="hover:text-neutral-900 transition-colors">Features</a>
            <a href="#pricing" className="hover:text-neutral-900 transition-colors">Pricing</a>
          </div>
          <div className="flex items-center gap-4">
            {!loading && user ? (
              <Link 
                href="/dashboard"
                className="text-sm font-medium hover:text-neutral-600 transition-colors"
              >
                Dashboard
              </Link>
            ) : (
              <Link 
                href="/login"
                className="text-sm font-medium hover:text-neutral-600 transition-colors"
              >
                Sign in
              </Link>
            )}
            <Link 
              href={user ? "/dashboard" : "/login"}
              className="bg-neutral-900 text-white px-4 py-2 text-sm font-medium rounded-md hover:bg-neutral-800 transition-colors flex items-center gap-1.5"
            >
              Get Started <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </nav>

      <main className="pt-32 pb-24 px-4">
        {/* Hero Section */}
        <section className="max-w-5xl mx-auto text-center mt-12 mb-32">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-neutral-100 text-neutral-600 text-sm font-medium rounded-full mb-8 border border-neutral-200">
            <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span>The new standard for business management</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-neutral-900 mb-6 leading-[1.1]">
            Manage your business <br className="hidden md:block"/> 
            with total clarity.
          </h1>
          <p className="text-xl text-neutral-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            A minimalist workspace that blends invoicing, client management, and product tracking into one seamless, Notion-inspired workflow.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href={user ? "/dashboard" : "/login"}
              className="w-full sm:w-auto bg-neutral-900 text-white px-8 py-4 text-base font-medium rounded-lg hover:bg-neutral-800 transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
            >
              Start for free <ArrowRight className="w-5 h-5" />
            </Link>
            <a 
              href="#features"
              className="w-full sm:w-auto bg-white border border-neutral-200 text-neutral-700 px-8 py-4 text-base font-medium rounded-lg hover:bg-neutral-50 transition-colors flex items-center justify-center"
            >
              Explore features
            </a>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="max-w-6xl mx-auto mb-32 scroll-mt-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight mb-4 text-neutral-900">Everything you need, nothing you don't.</h2>
            <p className="text-lg text-neutral-500 max-w-2xl mx-auto">
              We stripped away the clutter of traditional ERPs to give you a fast, distraction-free environment.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl border border-neutral-200/60 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-6">
                <Receipt className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Smart Invoicing</h3>
              <p className="text-neutral-500 leading-relaxed">Create professional invoices in seconds. Track statuses, manage currencies, and get paid faster without the headache.</p>
            </div>
            <div className="bg-white p-8 rounded-2xl border border-neutral-200/60 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-6">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Client CRM</h3>
              <p className="text-neutral-500 leading-relaxed">Keep your client details, history, and associated documents perfectly organized in a clean, accessible interface.</p>
            </div>
            <div className="bg-white p-8 rounded-2xl border border-neutral-200/60 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-6">
                <LayoutDashboard className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Multi-Workspace</h3>
              <p className="text-neutral-500 leading-relaxed">Manage multiple businesses or projects under one single account. Switch contexts instantly with zero friction.</p>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="max-w-5xl mx-auto mb-32 scroll-mt-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight mb-4 text-neutral-900">Simple, transparent pricing.</h2>
            <p className="text-lg text-neutral-500">Start for free, upgrade when you need more power.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Plan */}
            <div className="bg-white p-10 rounded-3xl border border-neutral-200 shadow-sm flex flex-col relative">
              <h3 className="text-2xl font-semibold mb-2">Starter</h3>
              <p className="text-neutral-500 mb-6">Perfect for freelancers and solo founders just getting started.</p>
              <div className="mb-8">
                <span className="text-5xl font-bold tracking-tight">$0</span>
                <span className="text-neutral-500 font-medium">/ forever</span>
              </div>
              <ul className="space-y-4 mb-10 flex-1">
                <li className="flex items-start gap-3 text-neutral-600">
                  <CheckCircle2 className="w-5 h-5 text-neutral-900 shrink-0" />
                  <span>Up to 50 invoices per month</span>
                </li>
                <li className="flex items-start gap-3 text-neutral-600">
                  <CheckCircle2 className="w-5 h-5 text-neutral-900 shrink-0" />
                  <span>Client & Product management</span>
                </li>
                <li className="flex items-start gap-3 text-neutral-600">
                  <CheckCircle2 className="w-5 h-5 text-neutral-900 shrink-0" />
                  <span>1 active workspace</span>
                </li>
                <li className="flex items-start gap-3 text-neutral-600">
                  <CheckCircle2 className="w-5 h-5 text-neutral-900 shrink-0" />
                  <span>Standard community support</span>
                </li>
              </ul>
              <Link 
                href="/login"
                className="w-full bg-neutral-100 text-neutral-900 px-6 py-3.5 rounded-xl font-medium hover:bg-neutral-200 transition-colors text-center"
              >
                Get Started
              </Link>
            </div>

            {/* Pro Plan */}
            <div className="bg-neutral-900 text-white p-10 rounded-3xl border border-neutral-800 shadow-xl flex flex-col relative ring-1 ring-neutral-800">
              <div className="absolute -top-4 right-8 bg-amber-400 text-amber-950 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Most Popular
              </div>
              <h3 className="text-2xl font-semibold mb-2">Pro</h3>
              <p className="text-neutral-400 mb-6">For growing businesses that need advanced capabilities.</p>
              <div className="mb-8">
                <span className="text-5xl font-bold tracking-tight">$12</span>
                <span className="text-neutral-400 font-medium whitespace-nowrap">/ month, billed annually</span>
              </div>
              <ul className="space-y-4 mb-10 flex-1">
                <li className="flex items-start gap-3 text-neutral-300">
                  <CheckCircle2 className="w-5 h-5 text-white shrink-0" />
                  <span>Unlimited invoices</span>
                </li>
                <li className="flex items-start gap-3 text-neutral-300">
                  <CheckCircle2 className="w-5 h-5 text-white shrink-0" />
                  <span>Unlimited workspaces</span>
                </li>
                <li className="flex items-start gap-3 text-neutral-300">
                  <CheckCircle2 className="w-5 h-5 text-white shrink-0" />
                  <span>Custom branding & white-labeling</span>
                </li>
                <li className="flex items-start gap-3 text-neutral-300">
                  <CheckCircle2 className="w-5 h-5 text-white shrink-0" />
                  <span>Advanced analytics & exports</span>
                </li>
                <li className="flex items-start gap-3 text-neutral-300">
                  <CheckCircle2 className="w-5 h-5 text-white shrink-0" />
                  <span>Priority email support</span>
                </li>
              </ul>
              <button 
                onClick={handleProClick}
                className="w-full bg-white text-neutral-900 px-6 py-3.5 rounded-xl font-medium hover:bg-neutral-100 transition-colors text-center"
              >
                Upgrade to Pro
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-200/60 bg-white py-12">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-neutral-900 rounded-md flex items-center justify-center">
              <Receipt className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-semibold text-neutral-900">Monfactures</span>
          </div>
          <p className="text-sm text-neutral-500">
            © {new Date().getFullYear()} Monfactures. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
