import React from 'react';
import {
  Search,
  RotateCcw,
  Waves,
  Gem,
  Crown,
  TrendingUp,
  LayoutGrid,
  X
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

const ANY_BUDGET = 100000000;

const quickTags = [
  { label: 'All Residences', value: '', icon: LayoutGrid },
  { label: 'Waterfront & Marina', value: 'waterfront', icon: Waves },
  { label: 'Branded Residences', value: 'branded', icon: Gem },
  { label: 'Sky Penthouses', value: 'penthouse', icon: Crown },
  { label: 'High-Yield Investments', value: 'yield', icon: TrendingUp }
];

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
      maxPrice: ANY_BUDGET,
      quickTag: ''
    });
  };

  const hasActiveFilters = Boolean(
    filters.search || filters.developer || filters.status || filters.region || filters.maxPrice < ANY_BUDGET || filters.quickTag
  );

  return (
    <div className="glass-panel filter-bar">
      {/* Search */}
      <div className="filter-row">
        <div className="filter-search" style={{ flex: '1 1 280px', position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Search
            size={16}
            color="var(--gold-light)"
            style={{ position: 'absolute', left: '14px', pointerEvents: 'none' }}
          />
          <input
            type="search"
            aria-label="Search residences"
            placeholder="Search by project, district or developer"
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            className="control"
            style={{
              width: '100%',
              padding: '0 36px 0 40px',
              color: '#fff',
              cursor: 'text',
              borderColor: 'var(--border-gold)'
            }}
          />
          {filters.search && (
            <button
              onClick={() => setFilters(prev => ({ ...prev, search: '' }))}
              aria-label="Clear search"
              style={{ position: 'absolute', right: '10px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex' }}
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* Count Counter */}
        <div className="hide-sm" style={{ marginLeft: 'auto', fontSize: '13px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }} aria-live="polite">
          <strong className="tabular-nums" style={{ color: 'var(--gold-light)' }}>{totalCount}</strong> {totalCount === 1 ? 'residence' : 'residences'} found
        </div>
      </div>

      {/* Refinements */}
      <div className="filter-row">
        <select
          aria-label="Developer"
          value={filters.developer}
          onChange={(e) => setFilters(prev => ({ ...prev, developer: e.target.value }))}
          className={`control ${filters.developer ? 'is-active' : ''}`}
        >
          <option value="">All Developers</option>
          {developers.map(d => (
            <option key={d.id} value={d.name}>{d.name}</option>
          ))}
        </select>

        <select
          aria-label="Construction status"
          value={filters.status}
          onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
          className={`control ${filters.status ? 'is-active' : ''}`}
        >
          <option value="">Any Status</option>
          <option value="Under Construction">Under Construction</option>
          <option value="Completed">Ready to Move In</option>
          <option value="Off-Plan">Off-Plan</option>
        </select>

        <select
          aria-label="Region"
          value={filters.region}
          onChange={(e) => setFilters(prev => ({ ...prev, region: e.target.value }))}
          className={`control ${filters.region ? 'is-active' : ''}`}
        >
          <option value="">All Emirates</option>
          <option value="Dubai">Dubai</option>
          <option value="Abu Dhabi">Abu Dhabi</option>
          <option value="Ras Al Khaimah">Ras Al Khaimah</option>
        </select>

        {/* Max Price Quick Filter */}
        <label
          className={`control ${filters.maxPrice < ANY_BUDGET ? 'is-active' : ''}`}
          style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'default' }}
        >
          <span style={{ fontSize: '12px' }}>Budget</span>
          <span className="tabular-nums" style={{ fontSize: '12px', fontWeight: 600, color: 'var(--gold-light)', minWidth: '96px' }}>
            {filters.maxPrice >= ANY_BUDGET ? 'Any' : `Up to ${formatPrice(filters.maxPrice, currency)}`}
          </span>
          <input
            type="range"
            aria-label="Maximum budget"
            min={1500000}
            max={ANY_BUDGET}
            step={1000000}
            value={filters.maxPrice}
            onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: Number(e.target.value) }))}
            style={{ width: '96px', accentColor: '#c5a059', cursor: 'pointer' }}
          />
        </label>

        <span aria-hidden="true" className="hide-sm" style={{ width: 1, height: 24, background: 'var(--border-light)', margin: '0 4px' }} />

        {/* Curated collections */}
        <div className="chip-row" role="group" aria-label="Curated collections">
          {quickTags.map(({ label, value, icon: Icon }) => (
            <button
              key={value}
              onClick={() => setFilters(prev => ({ ...prev, quickTag: value }))}
              className={`chip ${filters.quickTag === value ? 'is-active' : ''}`}
              aria-pressed={filters.quickTag === value}
            >
              <Icon size={13} />
              {label}
            </button>
          ))}
        </div>

        {hasActiveFilters && (
          <button
            onClick={handleReset}
            className="btn-secondary"
            style={{ padding: '0 14px', height: '40px', fontSize: '12px', flexShrink: 0 }}
          >
            <RotateCcw size={13} /> Reset
          </button>
        )}
      </div>
    </div>
  );
};
