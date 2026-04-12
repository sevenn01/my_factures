import React, { useState, useEffect } from "react";
import { Product } from "./ProductTable";
import { supabase } from "@/lib/supabaseClient";
import Papa from 'papaparse';

export default function ProductPanel({ 
  mode, 
  product,
  companyId,
  onSave,
  onClose 
}:{
  mode: 'create'|'edit'|'import'|null;
  product?: Product | null;
  companyId: string;
  onSave: () => void;
  onClose: () => void;
}) {
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [salesTaxes, setSalesTaxes] = useState("0");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (mode === 'edit' && product) {
      setName(product.name);
      setType(product.type);
      setDescription(product.description || "");
      setPrice(product.price.toString());
      setSalesTaxes(product.sales_taxes?.toString() || "0");
    } else {
      setName("");
      setType("Service");
      setDescription("");
      setPrice("0");
      setSalesTaxes("0");
    }
  }, [mode, product]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const priceNum = parseFloat(price);
      if (isNaN(priceNum)) {
        throw new Error("Price must be a valid number");
      }

      if (mode === 'create') {
        const { error: insertError } = await supabase
          .from('products')
          .insert({
            company_id: companyId,
            name,
            type,
            description,
            price: priceNum,
            sales_taxes: parseFloat(salesTaxes)
          });
        if (insertError) throw insertError;
      } else if (mode === 'edit' && product) {
        const { error: updateError } = await supabase
          .from('products')
          .update({
            name,
            type,
            description,
            price: priceNum,
            sales_taxes: parseFloat(salesTaxes)
          })
          .eq('id', product.id);
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
          Upload a CSV file containing your products. Expected columns: Name, Type, Price, Description.
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
                    type: row.Type || row.type || 'Service',
                    price: parseFloat(row.Price || row.price || '0'),
                    description: row.Description || row.description || ''
                  }));
                  
                  if (items.length === 0) throw new Error("No valid data found in CSV.");

                  // Insert into supabase
                  const { error: insertError } = await supabase
                    .from('products')
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
        <label className="notion-label">Name</label>
        <input 
          className="notion-input" 
          value={name} 
          onChange={e => setName(e.target.value)} 
          required 
          placeholder="Product or Service Name"
        />
      </div>

      <div>
        <label className="notion-label">Type</label>
        <select 
          className="notion-input" 
          value={type} 
          onChange={e => setType(e.target.value)}
        >
          <option value="Service">Service</option>
          <option value="Physical">Physical Product</option>
          <option value="Digital">Digital Product</option>
        </select>
      </div>

      <div>
        <label className="notion-label">Price</label>
        <input 
          className="notion-input" 
          type="number"
          step="0.01"
          value={price} 
          onChange={e => setPrice(e.target.value)} 
          required 
        />
      </div>

      <div>
        <label className="notion-label">Sales Taxes (%)</label>
        <select 
          className="notion-input" 
          value={salesTaxes} 
          onChange={e => setSalesTaxes(e.target.value)}
        >
          <option value="0">0%</option>
          <option value="7">7%</option>
          <option value="10">10%</option>
          <option value="14">14%</option>
          <option value="20">20%</option>
        </select>
      </div>

      <div>
        <label className="notion-label">Description</label>
        <textarea 
          className="notion-input" 
          value={description} 
          onChange={e => setDescription(e.target.value)} 
          rows={4}
          placeholder="Optional description"
        />
      </div>

      <div className="flex gap-2 mt-6">
        <button type="submit" disabled={loading} className="notion-btn flex-1">
          {loading ? "Saving..." : "Save Product"}
        </button>
        <button type="button" onClick={onClose} className="notion-btn notion-btn-secondary flex-1">
          Cancel
        </button>
      </div>
    </form>
  );
}
