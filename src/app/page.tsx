'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/authContext'
import { useLanguage } from '@/lib/languageContext'
import { ArrowRight, CheckCircle2, LayoutDashboard, Receipt, Users, Zap, Globe, ChevronDown } from 'lucide-react'

// Localized strings purely for the static landing page.
const landingDict = {
  en: {
    features: "Features",
    pricing: "Pricing",
    signIn: "Sign in",
    dashboard: "Dashboard",
    getStarted: "Get Started",
    badge: "The new standard for business management",
    heroTitle1: "Manage your business",
    heroTitle2: "with total clarity.",
    heroSub: "A minimalist workspace that blends invoicing, client management, and product tracking into one seamless, Notion-inspired workflow.",
    startFree: "Start for free",
    exploreFeatures: "Explore features",
    featuresTitle: "Everything you need, nothing you don't.",
    featuresSub: "We stripped away the clutter of traditional ERPs to give you a fast, distraction-free environment.",
    feat1Title: "Smart Invoicing",
    feat1Desc: "Create professional invoices in seconds. Track statuses, manage currencies, and get paid faster without the headache.",
    feat2Title: "Client CRM",
    feat2Desc: "Keep your client details, history, and associated documents perfectly organized in a clean, accessible interface.",
    feat3Title: "Multi-Workspace",
    feat3Desc: "Manage multiple businesses or projects under one single account. Switch contexts instantly with zero friction.",
    pricingTitle: "Simple, transparent pricing.",
    pricingSub: "Start for free, upgrade when you need more power.",
    starterDesc: "Perfect for freelancers and solo founders just getting started.",
    starterPerk1: "Up to 50 invoices per month",
    starterPerk2: "Client & Product management",
    starterPerk3: "1 active workspace",
    starterPerk4: "Standard community support",
    proDesc: "For growing businesses that need advanced capabilities.",
    proBilled: "/ month, billed annually",
    mostPopular: "Most Popular",
    proPerk1: "Unlimited invoices",
    proPerk2: "Unlimited workspaces",
    proPerk3: "Custom branding & white-labeling",
    proPerk4: "Advanced analytics & exports",
    proPerk5: "Priority email support",
    upgradeToPro: "Upgrade to Pro",
    forever: "/ forever",
  },
  fr: {
    features: "Fonctionnalités",
    pricing: "Tarification",
    signIn: "Se connecter",
    dashboard: "Tableau de bord",
    getStarted: "Commencer",
    badge: "Le nouveau standard pour la gestion d'entreprise",
    heroTitle1: "Gérez votre entreprise",
    heroTitle2: "en toute clarté.",
    heroSub: "Un espace de travail minimaliste fusionnant la facturation, la gestion des clients et le suivi des produits dans un flux fluide inspiré de Notion.",
    startFree: "Commencer gratuitement",
    exploreFeatures: "Explorer les fonctionnalités",
    featuresTitle: "Tout ce dont vous avez besoin, rien de superflu.",
    featuresSub: "Nous avons supprimé le désordre des ERP traditionnels pour vous offrir un environnement rapide et sans distraction.",
    feat1Title: "Facturation Intelligente",
    feat1Desc: "Créez des factures pro en quelques secondes. Suivez les statuts, gérez les devises et soyez payé plus rapidement sans maux de tête.",
    feat2Title: "CRM Client",
    feat2Desc: "Conservez les détails, l'historique et les documents de vos clients parfaitement organisés dans une interface claire.",
    feat3Title: "Multi-Espaces",
    feat3Desc: "Gérez plusieurs entreprises ou projets sous un seul compte. Changez de contexte instantanément sans friction.",
    pricingTitle: "Tarification simple, transparente.",
    pricingSub: "Commencez gratuitement, passez au niveau supérieur quand vous en avez besoin.",
    starterDesc: "Parfait pour les freelances et les fondateurs solos qui se lancent.",
    starterPerk1: "Jusqu'à 50 factures par mois",
    starterPerk2: "Gestion des clients & produits",
    starterPerk3: "1 espace de travail actif",
    starterPerk4: "Support communautaire standard",
    proDesc: "Pour les entreprises en croissance nécessitant des fonctionnalités avancées.",
    proBilled: "/ mois, facturé ann.",
    mostPopular: "Le Plus Populaire",
    proPerk1: "Factures illimitées",
    proPerk2: "Espaces de travail illimités",
    proPerk3: "Marque blanche",
    proPerk4: "Analyses avancées & exports",
    proPerk5: "Support e-mail prioritaire",
    upgradeToPro: "Passer à la version Pro",
    forever: "/ à vie",
  },
  ar: {
    features: "الميزات",
    pricing: "الأسعار",
    signIn: "تسجيل الدخول",
    dashboard: "لوحة التحكم",
    getStarted: "ابدأ الآن",
    badge: "المعيار الجديد لإدارة الأعمال",
    heroTitle1: "أدر عملك",
    heroTitle2: "بوضوح تام.",
    heroSub: "مساحة عمل بسيطة تمزج بين الفوترة، إدارة العملاء، وتتبع المنتجات في سير عمل سلس مستوحى من نوشن.",
    startFree: "ابدأ مجاناً",
    exploreFeatures: "استكشف الميزات",
    featuresTitle: "كل ما تحتاجه، بدون تعقيد.",
    featuresSub: "لقد تخلصنا من فوضى برامج تخطيط الموارد التقليدية لمنحك بيئة عمل سريعة وخالية من التشتت.",
    feat1Title: "فوترة ذكية",
    feat1Desc: "أنشئ فواتير احترافية في ثوانٍ. تتبع الحالات، وأدر العملات، واحصل على أموالك بشكل أسرع دون صداع.",
    feat2Title: "إدارة علاقات العملاء",
    feat2Desc: "احتفظ بتفاصيل عملائك وسجلهم ومستنداتهم منظمة بشكل مثالي في واجهة نظيفة.",
    feat3Title: "مساحات عمل متعددة",
    feat3Desc: "أدر العديد من الشركات أو المشاريع تحت حساب واحد. بدّل بينها فوراً بكل سهولة.",
    pricingTitle: "أسعار بسيطة وشفافة.",
    pricingSub: "ابدأ مجاناً، وقم بالترقية عندما تحتاج إلى المزيد.",
    starterDesc: "مثالي للمستقلين والمؤسسين الجدد.",
    starterPerk1: "حتى 50 فاتورة شهرياً",
    starterPerk2: "إدارة العملاء والمنتجات",
    starterPerk3: "مساحة عمل واحدة نشطة",
    starterPerk4: "دعم المجتمع الأساسي",
    proDesc: "للشركات النامية التي تحتاج إلى قدرات متقدمة.",
    proBilled: "/ شهر، تُدفع سنوياً",
    mostPopular: "الأكثر شيوعاً",
    proPerk1: "فواتير غير محدودة",
    proPerk2: "مساحات عمل غير محدودة",
    proPerk3: "علامة تجارية مخصصة",
    proPerk4: "تحليلات متقدمة وتصدير",
    proPerk5: "أولوية دعم البريد الإلكتروني",
    upgradeToPro: "الترقية إلى برو",
    forever: "/ للأبد",
  }
};

export default function Home() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { lang, setLang } = useLanguage()
  const [langMenuOpen, setLangMenuOpen] = useState(false)
  const langMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
        setLangMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleProClick = (e: React.MouseEvent) => {
    e.preventDefault()
    alert("Coming soon!")
  }

  const t = landingDict[lang as keyof typeof landingDict] || landingDict.en;
  const rtl = lang === 'ar';

  return (
    <div className={`min-h-screen bg-[#fafafa] text-[#111827] font-sans selection:bg-neutral-200 ${rtl ? 'rtl' : 'ltr'}`} dir={rtl ? 'rtl' : 'ltr'}>
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
            <a href="#features" className="hover:text-neutral-900 transition-colors">{t.features}</a>
            <a href="#pricing" className="hover:text-neutral-900 transition-colors">{t.pricing}</a>
          </div>
          
          <div className="flex items-center gap-4">
            
            {/* Language Switcher */}
            <div className="relative" ref={langMenuRef}>
              <button 
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                className="flex items-center gap-2 px-3 py-1.5 bg-white hover:bg-neutral-50 rounded-lg border border-neutral-200/80 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-neutral-200"
              >
                <Globe className="w-4 h-4 text-neutral-500" />
                <span className="text-xs font-semibold text-neutral-700 uppercase">{lang}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-neutral-400 transition-transform duration-200 ${langMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {langMenuOpen && (
                <div className="absolute top-full right-0 mt-2 w-32 bg-white border border-neutral-200/80 shadow-xl rounded-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="p-1">
                    {[
                      { code: 'en', label: 'English' },
                      { code: 'fr', label: 'Français' },
                      { code: 'ar', label: 'العربية' }
                    ].map((l) => (
                      <button
                        key={l.code}
                        onClick={() => {
                          setLang(l.code as any);
                          setLangMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors ${
                          lang === l.code 
                            ? 'bg-neutral-100/80 text-neutral-900 font-medium' 
                            : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
                        }`}
                      >
                        {l.label}
                        {lang === l.code && <CheckCircle2 className="w-4 h-4 text-neutral-900" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {!loading && user ? (
              <Link 
                href="/dashboard"
                className="hidden sm:block text-sm font-medium hover:text-neutral-600 transition-colors"
              >
                {t.dashboard}
              </Link>
            ) : (
              <Link 
                href="/login"
                className="hidden sm:block text-sm font-medium hover:text-neutral-600 transition-colors"
              >
                {t.signIn}
              </Link>
            )}
            <Link 
              href={user ? "/dashboard" : "/login"}
              className="bg-neutral-900 text-white px-4 py-2 text-sm font-medium rounded-md hover:bg-neutral-800 transition-colors flex items-center gap-1.5"
            >
              {t.getStarted} {!rtl && <ArrowRight className="w-4 h-4" />}
            </Link>
          </div>
        </div>
      </nav>

      <main className="pt-32 pb-24 px-4">
        {/* Hero Section */}
        <section className="max-w-5xl mx-auto text-center mt-12 mb-32">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-neutral-100 text-neutral-600 text-sm font-medium rounded-full mb-8 border border-neutral-200">
            <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span>{t.badge}</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-neutral-900 mb-6 leading-[1.1]">
            {t.heroTitle1} <br className="hidden md:block"/> 
            {t.heroTitle2}
          </h1>
          <p className="text-xl text-neutral-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            {t.heroSub}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href={user ? "/dashboard" : "/login"}
              className="w-full sm:w-auto bg-neutral-900 text-white px-8 py-4 text-base font-medium rounded-lg hover:bg-neutral-800 transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
            >
              {t.startFree} {!rtl && <ArrowRight className="w-5 h-5" />}
            </Link>
            <a 
              href="#features"
              className="w-full sm:w-auto bg-white border border-neutral-200 text-neutral-700 px-8 py-4 text-base font-medium rounded-lg hover:bg-neutral-50 transition-colors flex items-center justify-center"
            >
              {t.exploreFeatures}
            </a>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="max-w-6xl mx-auto mb-32 scroll-mt-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight mb-4 text-neutral-900">{t.featuresTitle}</h2>
            <p className="text-lg text-neutral-500 max-w-2xl mx-auto">
              {t.featuresSub}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl border border-neutral-200/60 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-6">
                <Receipt className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-3">{t.feat1Title}</h3>
              <p className="text-neutral-500 leading-relaxed">{t.feat1Desc}</p>
            </div>
            <div className="bg-white p-8 rounded-2xl border border-neutral-200/60 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-6">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-3">{t.feat2Title}</h3>
              <p className="text-neutral-500 leading-relaxed">{t.feat2Desc}</p>
            </div>
            <div className="bg-white p-8 rounded-2xl border border-neutral-200/60 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-6">
                <LayoutDashboard className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-3">{t.feat3Title}</h3>
              <p className="text-neutral-500 leading-relaxed">{t.feat3Desc}</p>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="max-w-5xl mx-auto mb-32 scroll-mt-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight mb-4 text-neutral-900">{t.pricingTitle}</h2>
            <p className="text-lg text-neutral-500">{t.pricingSub}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Plan */}
            <div className="bg-white p-10 rounded-3xl border border-neutral-200 shadow-sm flex flex-col relative">
              <h3 className="text-2xl font-semibold mb-2">Starter</h3>
              <p className="text-neutral-500 mb-6">{t.starterDesc}</p>
              <div className="mb-8 flex items-baseline gap-1">
                <span className="text-5xl font-bold tracking-tight">$0</span>
                <span className="text-neutral-500 font-medium">{t.forever}</span>
              </div>
              <ul className="space-y-4 mb-10 flex-1">
                <li className="flex items-start gap-3 text-neutral-600">
                  <CheckCircle2 className="w-5 h-5 text-neutral-900 shrink-0" />
                  <span>{t.starterPerk1}</span>
                </li>
                <li className="flex items-start gap-3 text-neutral-600">
                  <CheckCircle2 className="w-5 h-5 text-neutral-900 shrink-0" />
                  <span>{t.starterPerk2}</span>
                </li>
                <li className="flex items-start gap-3 text-neutral-600">
                  <CheckCircle2 className="w-5 h-5 text-neutral-900 shrink-0" />
                  <span>{t.starterPerk3}</span>
                </li>
                <li className="flex items-start gap-3 text-neutral-600">
                  <CheckCircle2 className="w-5 h-5 text-neutral-900 shrink-0" />
                  <span>{t.starterPerk4}</span>
                </li>
              </ul>
              <Link 
                href="/login"
                className="w-full bg-neutral-100 text-neutral-900 px-6 py-3.5 rounded-xl font-medium hover:bg-neutral-200 transition-colors text-center inline-block"
              >
                {t.getStarted}
              </Link>
            </div>

            {/* Pro Plan */}
            <div className="bg-neutral-900 text-white p-10 rounded-3xl border border-neutral-800 shadow-xl flex flex-col relative ring-1 ring-neutral-800">
              <div className={`absolute -top-4 ${rtl ? 'left-8' : 'right-8'} bg-amber-400 text-amber-950 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider`}>
                {t.mostPopular}
              </div>
              <h3 className="text-2xl font-semibold mb-2">Pro</h3>
              <p className="text-neutral-400 mb-6">{t.proDesc}</p>
              <div className="mb-8 flex items-baseline gap-1">
                <span className="text-5xl font-bold tracking-tight">$19</span>
                <span className="text-neutral-400 font-medium">{t.proBilled}</span>
              </div>
              <ul className="space-y-4 mb-10 flex-1">
                <li className="flex items-start gap-3 text-neutral-300">
                  <CheckCircle2 className="w-5 h-5 text-white shrink-0" />
                  <span>{t.proPerk1}</span>
                </li>
                <li className="flex items-start gap-3 text-neutral-300">
                  <CheckCircle2 className="w-5 h-5 text-white shrink-0" />
                  <span>{t.proPerk2}</span>
                </li>
                <li className="flex items-start gap-3 text-neutral-300">
                  <CheckCircle2 className="w-5 h-5 text-white shrink-0" />
                  <span>{t.proPerk3}</span>
                </li>
                <li className="flex items-start gap-3 text-neutral-300">
                  <CheckCircle2 className="w-5 h-5 text-white shrink-0" />
                  <span>{t.proPerk4}</span>
                </li>
                <li className="flex items-start gap-3 text-neutral-300">
                  <CheckCircle2 className="w-5 h-5 text-white shrink-0" />
                  <span>{t.proPerk5}</span>
                </li>
              </ul>
              <button 
                onClick={handleProClick}
                className="w-full bg-white text-neutral-900 px-6 py-3.5 rounded-xl font-medium hover:bg-neutral-100 transition-colors text-center"
              >
                {t.upgradeToPro}
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
