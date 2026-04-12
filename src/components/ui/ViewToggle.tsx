'use client';

import React from 'react';

interface ViewToggleProps {
  view: 'list' | 'grid';
  onChange: (view: 'list' | 'grid') => void;
}

export function ViewToggle({ view, onChange }: ViewToggleProps) {
  return (
    <div className="flex bg-hover-bg p-1 rounded-md border border-border shadow-sm">
      <button
        onClick={() => onChange('list')}
        className={`p-1.5 rounded transition-all flex items-center justify-center ${
          view === 'list' 
            ? 'bg-background shadow-sm text-[#2383e2] ring-1 ring-black/5' 
            : 'text-muted hover:text-foreground bg-transparent'
        }`}
        title="List View"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      <button
        onClick={() => onChange('grid')}
        className={`p-1.5 rounded transition-all flex items-center justify-center ${
          view === 'grid' 
            ? 'bg-background shadow-sm text-[#2383e2] ring-1 ring-black/5' 
            : 'text-muted hover:text-foreground bg-transparent'
        }`}
        title="Grid View"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
        </svg>
      </button>
    </div>
  );
}
