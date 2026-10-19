import React from 'react';
import { SearchX, RotateCcw } from 'lucide-react';

interface EmptyStateProps {
  onReset: () => void;
  searchQuery?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ onReset, searchQuery }) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '60px 24px',
      textAlign: 'center',
      margin: 'auto',
      maxWidth: '500px'
    }}>
      <div style={{
        width: '70px',
        height: '70px',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, rgba(197, 160, 89, 0.15) 0%, rgba(10, 11, 16, 0.8) 100%)',
        border: '1px solid var(--border-gold)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '20px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.6)'
      }}>
        <SearchX size={32} color="var(--gold-light)" />
      </div>

      <h3 className="font-serif" style={{ fontSize: '22px', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>
        No Exclusive Residences Found
      </h3>

      <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.6, marginBottom: '24px' }}>
        {searchQuery
          ? `We couldn't find any off-plan portfolios matching "${searchQuery}". Try broadening your search or adjusting your price ceiling.`
          : 'No projects match your active filter criteria. Try adjusting region, developer, or budget parameters.'}
      </p>

      <div style={{ display: 'flex', gap: '12px' }}>
        <button
          onClick={onReset}
          className="btn-gold"
          style={{ padding: '10px 22px' }}
        >
          <RotateCcw size={15} /> Reset All Filters
        </button>
      </div>
    </div>
  );
};
