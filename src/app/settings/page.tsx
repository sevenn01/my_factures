"use client";

import { useState, useEffect } from "react";
import { useCompany } from "@/lib/companyContext";
import { supabase } from "@/lib/supabaseClient";
import { getDirectImageUrl } from "@/lib/utils";
import { useTheme } from "@/lib/themeContext";
import { useLanguage } from "@/lib/languageContext";
import { useAuth } from "@/lib/authContext";

type Tab = 'templates' | 'preferences' | 'team' | 'workspaces';

interface InvitedUser {
  id: number;
  user_name: string;
  pwd: string;
  rule: string;
  created_at: string;
}
//55
export default function SettingsPage() {
  const { activeCompany, companies, loading: companyLoading, refreshCompanies, setActiveCompany } = useCompany();
  const { theme, toggleTheme } = useTheme();
  const { lang, setLang, t } = useLanguage();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<Tab>('templates');

  // ── Template State ──
  const [headerUrl, setHeaderUrl] = useState("");
  const [footerUrl, setFooterUrl] = useState("");
  const [watermarkUrl, setWatermarkUrl] = useState("");
  const [settingsId, setSettingsId] = useState<string | null>(null);

  // ── Team State ──
  const [invitedUsers, setInvitedUsers] = useState<InvitedUser[]>([]);
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState("viewer");

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [statusMsg, setStatusMsg] = useState("");
  const [currency, setCurrency] = useState("MAD");

  // ── Workspaces State  ──
  const [workspaceName, setWorkspaceName] = useState("");
  const [workspaceIce, setWorkspaceIce] = useState("");
  const [workspaceAddress, setWorkspaceAddress] = useState("");
  const [workspacePhone, setWorkspacePhone] = useState("");
  const [workspaceEmail, setWorkspaceEmail] = useState("");
  const [workspaceLogo, setWorkspaceLogo] = useState("");

  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  const [showNewWorkspaceForm, setShowNewWorkspaceForm] = useState(false);

  useEffect(() => {
    if (!activeCompany?.id) {
      setFetching(false);
      return;
    }

    const fetchAll = async () => {
      setFetching(true);
      try {
        // Fetch invoice settings
        const { data } = await supabase
          .from('invoice_settings')
          .select('*')
          .eq('company_id', activeCompany.id)
          .maybeSingle();

        if (data) {
          setSettingsId(data.id);
          setHeaderUrl(data.header_url || "");
          setFooterUrl(data.footer_url || "");
          setWatermarkUrl(data.watermark_url || "");
        }

        // Fetch invited users
        const { data: users } = await supabase
          .from('invite_users')
          .select('*')
          .eq('company_id', activeCompany.id);
        setInvitedUsers(users || []);
        
        if (activeCompany.currency) {
          setCurrency(activeCompany.currency);
        }

        // Initialize Workspace fields
        setWorkspaceName(activeCompany.name || "");
        setWorkspaceIce(activeCompany.ice || "");
        setWorkspaceAddress(activeCompany.address || "");
        setWorkspacePhone(activeCompany.phone || "");
        setWorkspaceEmail(activeCompany.email || "");
        setWorkspaceLogo(activeCompany.logo_url || "");

      } catch (err: any) {
        console.error("Error fetching settings: ", err);
      } finally {
        setFetching(false);
      }
    };
    fetchAll();
  }, [activeCompany?.id]);

  // ── Upload Handler ──
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'header' | 'footer' | 'watermark') => {
    const file = e.target.files?.[0];
    if (!file || !activeCompany?.id) return;

    setStatusMsg(`Uploading ${type}...`);
    setLoading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${activeCompany.id}_${type}_${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('assets')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from('assets')
        .getPublicUrl(fileName);

      if (type === 'header') setHeaderUrl(publicUrlData.publicUrl);
      else if (type === 'footer') setFooterUrl(publicUrlData.publicUrl);
      else setWatermarkUrl(publicUrlData.publicUrl);

      setStatusMsg(`${type} uploaded successfully. Don't forget to save.`);
    } catch (err: any) {
      setStatusMsg(`Error uploading: ${err.message}. Make sure 'assets' bucket exists.`);
    } finally {
      setLoading(false);
    }
  };

  // ── Save Templates ──
  const handleSaveTemplates = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCompany?.id) return;

    setLoading(true);
    setStatusMsg("");
    try {
      const payload = {
        company_id: activeCompany.id,
        header_url: headerUrl,
        footer_url: footerUrl,
        watermark_url: watermarkUrl
      };

      if (settingsId) {
        const { error } = await supabase.from('invoice_settings').update(payload).eq('id', settingsId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from('invoice_settings').insert(payload).select('id').single();
        if (error) throw error;
        setSettingsId(data.id);
      }
      setStatusMsg(t('settings.savedSuccess'));
    } catch (err: any) {
      setStatusMsg(`Error saving: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // ── Add Invited User ──
  const handleAddUser = async () => {
    if (!activeCompany?.id || !newUsername || !newPassword) return;
    setLoading(true);
    setStatusMsg("");
    try {
      const { error } = await supabase.from('invite_users').insert({
        company_id: activeCompany.id,
        user_name: newUsername,
        pwd: newPassword,
        rule: newRole
      });
      if (error) throw error;

      // Refresh list
      const { data: users } = await supabase.from('invite_users').select('*').eq('company_id', activeCompany.id);
      setInvitedUsers(users || []);
      setNewUsername("");
      setNewPassword("");
      setNewRole("viewer");
      setStatusMsg("User added successfully.");
    } catch (err: any) {
      setStatusMsg(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // ── Delete Invited User ──
  const handleDeleteUser = async (userId: number) => {
    if (!confirm(t('team.deleteConfirm'))) return;
    try {
      await supabase.from('invite_users').delete().eq('id', userId);
      setInvitedUsers(prev => prev.filter(u => u.id !== userId));
    } catch (err: any) {
      setStatusMsg(`Error: ${err.message}`);
    }
  };
  
  const handleSaveWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCompany?.id) return;
    setLoading(true);
    setStatusMsg("");
    try {
      const { error } = await supabase
        .from('companies')
        .update({
          name: workspaceName,
          ice: workspaceIce,
          address: workspaceAddress,
          phone: workspacePhone,
          email: workspaceEmail,
          logo_url: workspaceLogo
        })
        .eq('id', activeCompany.id);
      
      if (error) throw error;
      await refreshCompanies();
      setStatusMsg(t('settings.savedSuccess'));
    } catch (err: any) {
      setStatusMsg(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newWorkspaceName) return;
    setLoading(true);
    setStatusMsg("");
    try {
      // 1. Create company
      const { data: company, error: compError } = await supabase
        .from('companies')
        .insert({ 
          name: newWorkspaceName,
          owner_id: user.id
        })
        .select()
        .single();
      
      if (compError) throw compError;

      // 2. Link user to company as owner
      const { error: linkError } = await supabase
        .from('company_users')
        .insert({
          company_id: company.id,
          user_id: user.id,
          role: 'owner'
        });
      
      if (linkError) throw linkError;

      await refreshCompanies();
      setActiveCompany(company);
      setNewWorkspaceName("");
      setShowNewWorkspaceForm(false);
      setStatusMsg(t('settings.savedSuccess'));
      setActiveTab('workspaces');
    } catch (err: any) {
      setStatusMsg(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCurrency = async () => {
    if (!activeCompany?.id) return;
    setLoading(true);
    setStatusMsg("");
    try {
      const { error } = await supabase
        .from('companies')
        .update({ currency })
        .eq('id', activeCompany.id);
      
      if (error) throw error;
      await refreshCompanies();
      setStatusMsg(t('settings.savedSuccess'));
    } catch (err: any) {
      setStatusMsg(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (companyLoading || fetching) {
    return <div className="p-10 text-muted">{t('settings.loading')}</div>;
  }

  if (!activeCompany) {
    return <div className="p-10 text-muted">{t('settings.selectWorkspace')}</div>;
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: 'templates', label: t('settings.tabTemplates') },
    { key: 'preferences', label: t('settings.tabPreferences') },
    { key: 'team', label: t('settings.tabTeam') },
    { key: 'workspaces', label: t('settings.tabWorkspaces') },
  ];

  return (
    <main className="flex-1 p-10 max-w-3xl mx-auto w-full">
      <h1 className="notion-title" style={{ fontSize: "2rem", marginBottom: "1rem", textAlign: "left" }}>{t('settings.title')}</h1>

      {/* Tab Navigation */}
      <div className="flex gap-1 mb-8 border-b border-[var(--border)]">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => { setActiveTab(tab.key); setStatusMsg(""); }}
            className={`px-4 py-2.5 text-sm font-medium transition-all border-b-2 -mb-px ${
              activeTab === tab.key
                ? 'border-[var(--foreground)] text-[var(--foreground)]'
                : 'border-transparent text-[var(--muted)] hover:text-[var(--foreground)]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {statusMsg && (
        <div className={`p-4 rounded border mb-6 ${statusMsg.includes('Error') ? 'bg-red-500/10 text-red-500 border-red-500/30' : 'bg-green-500/10 text-green-500 border-green-500/30'}`}>
          {statusMsg}
        </div>
      )}

      {/* ═══════ TEMPLATES TAB ═══════ */}
      {activeTab === 'templates' && (
        <form onSubmit={handleSaveTemplates} className="space-y-8">
          <p className="text-[var(--muted)] mb-4 leading-relaxed text-sm">
            {t('settings.driveNote')}
          </p>

          <div className="space-y-6">
            {/* Header Image */}
            <div className="pb-6 border-b border-[var(--border)]">
              <label className="notion-label">{t('settings.headerImage')}</label>
              <div className="flex gap-4 items-end mt-2">
                <div className="flex-1">
                  <input className="notion-input !mb-0" value={headerUrl} onChange={e => setHeaderUrl(e.target.value)} placeholder="https://..." />
                </div>
                <div className="relative">
                  <button type="button" className="notion-btn notion-btn-secondary whitespace-nowrap">{t('settings.uploadFile')}</button>
                  <input type="file" accept="image/*" onChange={e => handleUpload(e, 'header')} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                </div>
              </div>
              {headerUrl && (
                <div className="mt-4 p-2 bg-[var(--hover-bg)] border border-[var(--border)] rounded flex justify-center">
                  <img src={getDirectImageUrl(headerUrl)} alt="Header Preview" className="max-h-24 object-contain" />
                </div>
              )}
            </div>

            {/* Footer Image */}
            <div className="pb-6 border-b border-[var(--border)]">
              <label className="notion-label">{t('settings.footerImage')}</label>
              <div className="flex gap-4 items-end mt-2">
                <div className="flex-1">
                  <input className="notion-input !mb-0" value={footerUrl} onChange={e => setFooterUrl(e.target.value)} placeholder="https://..." />
                </div>
                <div className="relative">
                  <button type="button" className="notion-btn notion-btn-secondary whitespace-nowrap">{t('settings.uploadFile')}</button>
                  <input type="file" accept="image/*" onChange={e => handleUpload(e, 'footer')} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                </div>
              </div>
              {footerUrl && (
                <div className="mt-4 p-2 bg-[var(--hover-bg)] border border-[var(--border)] rounded flex justify-center">
                  <img src={getDirectImageUrl(footerUrl)} alt="Footer Preview" className="max-h-24 object-contain" />
                </div>
              )}
            </div>

            {/* Watermark Image */}
            <div className="pb-2">
              <label className="notion-label">{t('settings.watermarkImage')}</label>
              <div className="flex gap-4 items-end mt-2">
                <div className="flex-1">
                  <input className="notion-input !mb-0" value={watermarkUrl} onChange={e => setWatermarkUrl(e.target.value)} placeholder="https://..." />
                </div>
                <div className="relative">
                  <button type="button" className="notion-btn notion-btn-secondary whitespace-nowrap">{t('settings.uploadFile')}</button>
                  <input type="file" accept="image/*" onChange={e => handleUpload(e, 'watermark')} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                </div>
              </div>
              {watermarkUrl && (
                <div className="mt-4 p-2 bg-[var(--hover-bg)] border border-[var(--border)] rounded flex justify-center">
                  <img src={getDirectImageUrl(watermarkUrl)} alt="Watermark Preview" className="max-h-24 object-contain" />
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button type="submit" disabled={loading} className="notion-btn px-8">
              {loading ? t('settings.saving') : t('settings.saveSettings')}
            </button>
          </div>
        </form>
      )}

      {/* ═══════ PREFERENCES TAB ═══════ */}
      {activeTab === 'preferences' && (
        <div className="space-y-8">
          {/* Language */}
          <div>
            <label className="notion-label mb-2 block">{t('settings.language')}</label>
            <div className="flex gap-2">
              {[
                { code: 'en' as const, label: 'English' },
                { code: 'fr' as const, label: 'Français' },
                { code: 'ar' as const, label: 'العربية' },
              ].map(l => (
                <button
                  key={l.code}
                  onClick={() => setLang(l.code)}
                  className={`px-5 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                    lang === l.code
                      ? 'bg-[var(--foreground)] text-[var(--background)] border-[var(--foreground)]'
                      : 'border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)] hover:border-[var(--foreground)]'
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>

          {/* Theme */}
          <div>
            <label className="notion-label mb-2 block">{t('settings.theme')}</label>
            <div className="flex gap-2">
              <button
                onClick={() => { if (theme !== 'light') toggleTheme(); }}
                className={`px-5 py-2.5 rounded-lg border text-sm font-medium transition-all flex items-center gap-2 ${
                  theme === 'light'
                    ? 'bg-[var(--foreground)] text-[var(--background)] border-[var(--foreground)]'
                    : 'border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)] hover:border-[var(--foreground)]'
                }`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                {t('settings.light')}
              </button>
              <button
                onClick={() => { if (theme !== 'dark') toggleTheme(); }}
                className={`px-5 py-2.5 rounded-lg border text-sm font-medium transition-all flex items-center gap-2 ${
                  theme === 'dark'
                    ? 'bg-[var(--foreground)] text-[var(--background)] border-[var(--foreground)]'
                    : 'border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)] hover:border-[var(--foreground)]'
                }`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                {t('settings.dark')}
              </button>
            </div>
          </div>

          {/* Currency */}
          <div>
            <label className="notion-label mb-2 block">{t('settings.currency')}</label>
            <div className="flex gap-2 items-center">
              <select 
                className="notion-input !mb-0 max-w-[200px]" 
                value={currency} 
                onChange={e => setCurrency(e.target.value)}
              >
                <option value="DH">DH (Dirham)</option>
                <option value="EUR">EUR (€)</option>
                <option value="USD">USD ($)</option>
              </select>
              <button 
                onClick={handleSaveCurrency} 
                disabled={loading}
                className="notion-btn notion-btn-secondary py-2"
              >
                {loading ? t('settings.saving') : t('settings.saveCurrency')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════ WORKSPACES TAB ═══════ */}
      {activeTab === 'workspaces' && (
        <div className="space-y-12">
          {/* Edit Current Workspace */}
          <form onSubmit={handleSaveWorkspace} className="space-y-6">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <span className="p-1.5 bg-[var(--foreground)] text-[var(--background)] rounded-lg">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
              </span>
              {t('settings.editWorkspace')}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 border border-[var(--border)] rounded-2xl bg-[var(--hover-bg)]/30">
              <div className="space-y-4">
                <div>
                  <label className="notion-label">{t('settings.workspaceName')}</label>
                  <input className="notion-input" value={workspaceName} onChange={e => setWorkspaceName(e.target.value)} placeholder="My Company" required />
                </div>
                <div>
                  <label className="notion-label">{t('settings.workspaceIce')}</label>
                  <input className="notion-input" value={workspaceIce} onChange={e => setWorkspaceIce(e.target.value)} placeholder="00123..." />
                </div>
                <div>
                  <label className="notion-label">{t('settings.workspaceLogo')}</label>
                  <input className="notion-input" value={workspaceLogo} onChange={e => setWorkspaceLogo(e.target.value)} placeholder="https://..." />
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="notion-label">{t('settings.workspaceEmail')}</label>
                  <input className="notion-input" type="email" value={workspaceEmail} onChange={e => setWorkspaceEmail(e.target.value)} placeholder="contact@company.com" />
                </div>
                <div>
                  <label className="notion-label">{t('settings.workspacePhone')}</label>
                  <input className="notion-input" value={workspacePhone} onChange={e => setWorkspacePhone(e.target.value)} placeholder="+212..." />
                </div>
                <div>
                  <label className="notion-label">{t('settings.workspaceAddress')}</label>
                  <textarea className="notion-input min-h-[100px]" value={workspaceAddress} onChange={e => setWorkspaceAddress(e.target.value)} placeholder="123 Street, City, Country" />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button type="submit" disabled={loading} className="notion-btn px-8">
                {loading ? t('settings.saving') : t('settings.saveSettings')}
              </button>
            </div>
          </form>

          {/* Other Workspaces List */}
          <div className="space-y-6 pt-6 border-t border-[var(--border)]">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold">{t('settings.manageOtherWorkspaces')}</h3>
              <button 
                onClick={() => setShowNewWorkspaceForm(!showNewWorkspaceForm)}
                className="notion-btn notion-btn-secondary"
              >
                {t('settings.addWorkspace')}
              </button>
            </div>

            {showNewWorkspaceForm && (
              <form onSubmit={handleCreateWorkspace} className="p-6 border border-blue-500/30 bg-blue-500/5 rounded-2xl space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
                <h4 className="font-bold">{t('settings.addWorkspace')}</h4>
                <div className="flex gap-3">
                  <input 
                    className="notion-input !mb-0" 
                    value={newWorkspaceName} 
                    onChange={e => setNewWorkspaceName(e.target.value)} 
                    placeholder={t('settings.workspaceName')}
                    required 
                  />
                  <button type="submit" disabled={loading} className="notion-btn whitespace-nowrap">
                    {loading ? t('settings.creating') : t('settings.createWorkspace')}
                  </button>
                </div>
              </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {companies.map(comp => (
                <div 
                  key={comp.id} 
                  className={`p-4 rounded-xl border transition-all flex items-center justify-between group ${
                    comp.id === activeCompany.id 
                      ? 'border-[var(--foreground)] bg-[var(--hover-bg)] shadow-md' 
                      : 'border-[var(--border)] hover:border-[var(--foreground)]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[var(--foreground)] text-[var(--background)] rounded-lg flex items-center justify-center font-bold text-lg">
                      {comp.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-bold">{comp.name}</div>
                      <div className="text-[10px] text-[var(--muted)] uppercase font-black tracking-widest">
                        {comp.id === activeCompany.id ? 'Active Workspace' : 'Workspace'}
                      </div>
                    </div>
                  </div>
                  
                  {comp.id !== activeCompany.id && (
                    <button 
                      onClick={() => setActiveCompany(comp)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-black uppercase tracking-widest hover:text-blue-500"
                    >
                      {t('settings.switchWorkspace')}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
