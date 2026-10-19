import React from 'react';
import {
  Search,
  RotateCcw
} from 'lucide-react';
import type { Currency } from '../types';
import { formatPrice } from '../services/api';

export interface FilterState {
  search: string;
  developer: string;
  status: string;
  region: string;
  maxPrice: number;
  quickTag: string;
}

interface FilterBarProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  developers: Array<{ id: string | number; name: string }>;
  currency: Currency;
  totalCount: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  setFilters,
  developers,
  currency,
  totalCount
}) => {
  const handleReset = () => {
    setFilters({
      search: '',
      developer: '',
      status: '',
      region: '',
      maxPrice: 100000000,
      quickTag: ''
    });
  };

  const quickTags = [
    { label: 'All Portfolios', value: '' },
    { label: '🌊 Waterfront & Marina', value: 'waterfront' },
    { label: '🏎️ Branded Luxury (Bugatti/Bvlgari)', value: 'branded' },
    { label: '👑 Sky Penthouses', value: 'penthouse' },
    { label: '💎 High-Yield Off-Plan', value: 'yield' }
  ];

  return (
    <div className="glass-panel" style={{
      padding: '16px 24px',
      borderBottom: '1px solid var(--border-light)',
      display: 'flex',
      flexDirection: 'column',
      gap: '14px'
    }}>
      {/* Top Row: Search input + Dropdowns + Stats */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        flexWrap: 'wrap'
      }}>
        {/* Search Input */}
        <div style={{
          flex: '1 1 260px',
          position: 'relative',
          display: 'flex',
          alignItems: 'center'
        }}>
          <Search
            size={16}
            color="var(--gold-light)"
            style={{ position: 'absolute', left: '14px' }}
          />
          <input
            type="text"
            placeholder="Search projects, districts (e.g. Dubai Harbour, Downtown, Sobha)..."
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            style={{
              width: '100%',
              background: 'rgba(18, 22, 34, 0.95)',
              border: '1px solid var(--border-gold)',
              borderRadius: '8px',
              padding: '9px 14px 9px 40px',
              color: '#fff',
              fontSize: '13px',
              fontFamily: 'var(--font-sans)',
              outline: 'none',
              boxShadow: '0 2px 10px rgba(0,0,0,0.3)'
            }}
          />
        </div>

        {/* Developer Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <select
            value={filters.developer}
            onChange={(e) => setFilters(prev => ({ ...prev, developer: e.target.value }))}
            style={{
              background: 'rgba(18, 22, 34, 0.95)',
              border: '1px solid var(--border-light)',
              borderRadius: '8px',
              padding: '9px 14px',
              color: filters.developer ? 'var(--gold-light)' : 'var(--text-muted)',
              fontSize: '13px',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="">All Developers ({developers.length})</option>
            {developers.map(d => (
              <option key={d.id} value={d.name}>{d.name}</option>
            ))}
          </select>
        </div>

        {/* Status Selector */}
        <div>
          <select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            style={{
              background: 'rgba(18, 22, 34, 0.95)',
              border: '1px solid var(--border-light)',
              borderRadius: '8px',
              padding: '9px 14px',
              color: filters.status ? 'var(--gold-light)' : 'var(--text-muted)',
              fontSize: '13px',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="">Construction Status: All</option>
            <option value="Under Construction">Under Construction</option>
            <option value="Completed">Completed Ready</option>
            <option value="Off-Plan">Off-Plan</option>
          </select>
        </div>

        {/* Region Selector */}
        <div>
          <select
            value={filters.region}
            onChange={(e) => setFilters(prev => ({ ...prev, region: e.target.value }))}
            style={{
              background: 'rgba(18, 22, 34, 0.95)',
              border: '1px solid var(--border-light)',
              borderRadius: '8px',
              padding: '9px 14px',
              color: filters.region ? 'var(--gold-light)' : 'var(--text-muted)',
              fontSize: '13px',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="">Region: Dubai & All UAE</option>
            <option value="Dubai">Dubai</option>
            <option value="Abu Dhabi">Abu Dhabi</option>
            <option value="Ras Al Khaimah">Ras Al Khaimah</option>
          </select>
        </div>

        {/* Max Price Quick Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.04)', padding: '6px 14px', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Max:</span>
          <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--gold-light)', minWidth: '100px' }}>
            {filters.maxPrice >= 100000000 ? 'Any Budget' : formatPrice(filters.maxPrice, currency)}
          </span>
          <input
            type="range"
            min={1500000}
            max={100000000}
            step={1000000}
            value={filters.maxPrice}
            onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: Number(e.target.value) }))}
            style={{ width: '90px', accentColor: '#c5a059', cursor: 'pointer' }}
          />
        </div>

        {/* Reset Button */}
        {(filters.search || filters.developer || filters.status || filters.region || filters.maxPrice < 100000000 || filters.quickTag) && (
          <button
            onClick={handleReset}
            className="btn-secondary"
            style={{ padding: '8px 12px', fontSize: '12px' }}
            title="Reset Filters"
          >
            <RotateCcw size={13} /> Reset
          </button>
        )}

        {/* Count Counter */}
        <div style={{ marginLeft: 'auto', fontSize: '13px', color: 'var(--text-muted)' }}>
          Showing <strong style={{ color: 'var(--gold-light)' }}>{totalCount}</strong> luxury assets
        </div>
      </div>

      {/* Bottom Row: Luxury Category Chips */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflowX: 'auto', paddingBottom: '2px' }}>
        <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>
          CURATED COLLECTIONS:
        </span>
        {quickTags.map((tag) => (
          <button
            key={tag.value}
            onClick={() => setFilters(prev => ({ ...prev, quickTag: tag.value }))}
            style={{
              background: filters.quickTag === tag.value ? 'var(--gold-subtle)' : 'rgba(255,255,255,0.03)',
              color: filters.quickTag === tag.value ? 'var(--gold-light)' : 'var(--text-muted)',
              border: `1px solid ${filters.quickTag === tag.value ? 'var(--border-gold-bright)' : 'var(--border-light)'}`,
              borderRadius: '20px',
              padding: '4px 12px',
              fontSize: '11px',
              fontWeight: filters.quickTag === tag.value ? 700 : 500,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'var(--transition-smooth)'
            }}
          >
            {tag.label}
          </button>
        ))}
      </div>
    </div>
  );
};
