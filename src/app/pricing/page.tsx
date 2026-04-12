"use client"

import Link from 'next/link'

export default function PricingPage() {
  return (
    <main className="flex-1 p-10 max-w-5xl mx-auto w-full">
      <Link href="/dashboard" className="text-[var(--muted)] hover:text-[var(--foreground)] mb-8 inline-flex items-center gap-2 text-sm transition">
        &larr; Back to Dashboard
      </Link>
      
      <div className="text-center mb-12">
        <h1 className="notion-title" style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>Upgrade your Plan</h1>
        <p className="text-[var(--muted)]">Add more workspaces and manage multiple companies from one account.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
        
        {/* Free Plan */}
        <div className="notion-box !m-0 w-full flex flex-col border border-[var(--border)] shadow-sm opacity-80">
          <h2 className="text-xl font-bold mb-2">Free</h2>
          <div className="text-3xl font-bold mb-6">$0<span className="text-[var(--muted)] text-lg font-normal"> /mo</span></div>
          <ul className="text-[var(--muted)] text-sm space-y-3 mb-8 flex-1">
            <li className="flex gap-2 items-center"><svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> 1 Workspace</li>
            <li className="flex gap-2 items-center"><svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> Unlimited Invoices</li>
            <li className="flex gap-2 items-center"><svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> Unlimited Clients</li>
          </ul>
          <button className="notion-btn notion-btn-secondary w-full cursor-default" disabled>Current Plan</button>
        </div>

        {/* Pro Plan */}
        <div className="notion-box !m-0 w-full flex flex-col border-2 border-[var(--foreground)] shadow-lg relative">
          <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-2 bg-[var(--foreground)] text-[var(--background)] px-2 py-1 text-xs font-bold rounded">RECOMMENDED</div>
          <h2 className="text-xl font-bold mb-2">Pro</h2>
          <div className="text-3xl font-bold mb-6">$19<span className="text-[var(--muted)] text-lg font-normal"> /mo</span></div>
          <ul className="text-[var(--foreground)] text-sm space-y-3 mb-8 flex-1">
            <li className="flex gap-2 items-center"><svg className="w-4 h-4 text-[#2383e2]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> Unlimited Workspaces</li>
            <li className="flex gap-2 items-center"><svg className="w-4 h-4 text-[#2383e2]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> API Access</li>
            <li className="flex gap-2 items-center"><svg className="w-4 h-4 text-[#2383e2]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> Custom Invoice Themes</li>
          </ul>
          <button className="notion-btn w-full" onClick={() => alert("Subscription integration coming soon!")}>Upgrade to Pro</button>
        </div>

      </div>
    </main>
  )
}
