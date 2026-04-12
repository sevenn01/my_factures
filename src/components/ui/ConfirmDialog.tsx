'use client';

import React, { useEffect } from 'react';
import { useLanguage } from '@/lib/languageContext';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'info' | 'warning';
  hideCancel?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  cancelText,
  type = 'danger',
  hideCancel = false
}: ConfirmDialogProps) {
  const { t } = useLanguage();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const getButtonClass = () => {
    switch (type) {
      case 'danger': return 'bg-red-500 hover:bg-red-600 border-red-500 text-white';
      case 'warning': return 'bg-amber-500 hover:bg-amber-600 border-amber-500 text-white';
      default: return 'notion-btn';
    }
  };

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/40 z-[60] slide-in-overlay flex items-center justify-center p-4 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-[var(--background)] shadow-2xl z-[70] rounded-lg border border-[var(--border)] overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            {type === 'danger' && (
              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            )}
            {type === 'warning' && (
              <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            )}
            {type === 'info' && (
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            )}
            <h3 className="text-xl font-bold text-[var(--foreground)] tracking-tight">{title}</h3>
          </div>
          <p className="text-[var(--muted)] text-base leading-relaxed mb-8">
            {message}
          </p>
          <div className="flex justify-end gap-3">
            {!hideCancel && (
              <button 
                onClick={onClose}
                className="notion-btn notion-btn-secondary px-4 py-2"
              >
                {cancelText || t('common.cancel')}
              </button>
            )}
            <button 
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`${getButtonClass()} px-4 py-2 rounded font-medium transition-colors`}
            >
              {confirmText || (hideCancel ? t('common.ok') : t('common.confirm'))}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
