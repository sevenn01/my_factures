import React from "react";
import { useLanguage } from "@/lib/languageContext";

export interface Client {
  id: string;
  company_id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  ice?: string;
  created_at: string;
}

export default function ClientTable({ clients, onEdit, onDelete }:{
  clients: Client[];
  onEdit: (client: Client) => void;
  onDelete: (client: Client) => void;
}) {
  const { t } = useLanguage();

  return (
    <div className="w-full overflow-x-auto pb-4">
      <table className="notion-table w-full min-w-[500px]">
        <thead>
          <tr>
            <th>{t('clients.name')}</th>
            <th>{t('clients.email')}</th>
            <th>{t('clients.phone')}</th>
            <th>{t('clients.ice')}</th>
            <th className="text-right">{t('invoices.actions')}</th>
          </tr>
        </thead>
        <tbody>
          {clients.map((c) => (
            <tr key={c.id}>
              <td className="font-medium text-foreground">{c.name}</td>
              <td className="text-muted">{c.email || '-'}</td>
              <td className="text-muted">{c.phone || '-'}</td>
              <td className="text-muted">{c.ice || '-'}</td>
              <td className="text-right whitespace-nowrap">
                <button className="text-muted hover:text-foreground transition px-2" onClick={() => onEdit(c)}>{t('invoices.edit')}</button>
                <button className="text-red-400 hover:text-red-600 transition px-2" onClick={() => onDelete(c)}>{t('invoices.delete')}</button>
              </td>
            </tr>
          ))}
          {clients.length === 0 && (
            <tr>
              <td colSpan={5} className="text-center py-8 text-muted">{t('clients.noClients')}</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
