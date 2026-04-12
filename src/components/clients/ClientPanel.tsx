import React, { useState, useEffect } from "react";
import { Client } from "./ClientTable";
import { supabase } from "@/lib/supabaseClient";
import Papa from 'papaparse';

export default function ClientPanel({ 
  mode, 
  client,
  companyId,
  onSave,
  onClose 
}:{
  mode: 'create'|'edit'|'import'|null;
  client?: Client | null;
  companyId: string;
  onSave: () => void;
  onClose: () => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [ice, setIce] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (mode === 'edit' && client) {
      setName(client.name);
      setEmail(client.email || "");
      setPhone(client.phone || "");
      setAddress(client.address || "");
      setIce(client.ice || "");
    } else {
      setName("");
      setEmail("");
      setPhone("");
      setAddress("");
      setIce("");
    }
  }, [mode, client]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (mode === 'create') {
        const { error: insertError } = await supabase
          .from('clients')
          .insert({
            company_id: companyId,
            name,
            email,
            phone,
            address,
            ice
          });
        if (insertError) throw insertError;
      } else if (mode === 'edit' && client) {
        const { error: updateError } = await supabase
          .from('clients')
          .update({
            name,
            email,
            phone,
            address,
            ice
          })
          .eq('id', client.id);
        if (updateError) throw updateError;
      }
      
      
      onSave();
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (mode === 'import') {
    return (
      <div>
        <p className="text-[var(--muted)] mb-4">
          Upload a CSV file containing your clients. Expected columns: Name, Email, Phone, ICE, Address.
        </p>
        <input 
          type="file" 
          accept=".csv" 
          className="notion-input"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            setLoading(true);
            setError("");
            
            Papa.parse(file, {
              header: true,
              skipEmptyLines: true,
              complete: async (results) => {
                try {
                  const items = results.data.map((row: any) => ({
                    company_id: companyId,
                    name: row.Name || row.name || 'Unnamed',
                    email: row.Email || row.email || null,
                    phone: row.Phone || row.phone || null,
                    ice: row.ICE || row.ice || null,
                    address: row.Address || row.address || null
                  }));
                  
                  if (items.length === 0) throw new Error("No valid data found in CSV.");

                  // Insert into supabase
                  const { error: insertError } = await supabase
                    .from('clients')
                    .insert(items);
                    
                  if (insertError) throw insertError;
                  
                  onSave();
                } catch (err: any) {
                  setError("Import failed: " + err.message);
                } finally {
                  setLoading(false);
                }
              },
              error: (err: any) => {
                setError("Failed to parse CSV: " + err.message);
                setLoading(false);
              }
            });
          }}
        />
        {error && <div className="notion-error mt-4">{error}</div>}
        {loading && <div className="text-[var(--muted)] mt-2">Importing... please wait.</div>}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="notion-error">{error}</div>}
      
      <div>
        <label className="notion-label">Name *</label>
        <input 
          className="notion-input" 
          value={name} 
          onChange={e => setName(e.target.value)} 
          required 
          placeholder="Client Name"
        />
      </div>

      <div>
        <label className="notion-label">Email</label>
        <input 
          className="notion-input" 
          type="email"
          value={email} 
          onChange={e => setEmail(e.target.value)} 
          placeholder="client@example.com"
        />
      </div>

      <div>
        <label className="notion-label">Phone</label>
        <input 
          className="notion-input" 
          type="tel"
          value={phone} 
          onChange={e => setPhone(e.target.value)} 
          placeholder="+1 234 567 890"
        />
      </div>
      
      <div>
        <label className="notion-label">ICE (Company Identifier)</label>
        <input 
          className="notion-input" 
          value={ice} 
          onChange={e => setIce(e.target.value)} 
          placeholder="ICE number"
        />
      </div>

      <div>
        <label className="notion-label">Address</label>
        <textarea 
          className="notion-input" 
          value={address} 
          onChange={e => setAddress(e.target.value)} 
          rows={3}
          placeholder="Billing address"
        />
      </div>

      <div className="flex gap-2 mt-6">
        <button type="submit" disabled={loading} className="notion-btn flex-1">
          {loading ? "Saving..." : "Save Client"}
        </button>
        <button type="button" onClick={onClose} className="notion-btn notion-btn-secondary flex-1">
          Cancel
        </button>
      </div>
    </form>
  );
}
