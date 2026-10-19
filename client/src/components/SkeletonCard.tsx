import React from 'react';

export const SkeletonCard: React.FC = () => {
  return (
    <div
      className="glass-panel"
      style={{
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        boxShadow: 'var(--shadow-card)',
        minHeight: '380px'
      }}
    >
      {/* Cover Skeleton */}
      <div className="skeleton-shimmer" style={{ width: '100%', height: '220px' }} />

      {/* Body Skeleton */}
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px', flex: 1 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div className="skeleton-shimmer" style={{ width: '35%', height: '10px', borderRadius: '4px' }} />
          <div className="skeleton-shimmer" style={{ width: '80%', height: '20px', borderRadius: '4px' }} />
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <div className="skeleton-shimmer" style={{ width: '110px', height: '24px', borderRadius: '6px' }} />
          <div className="skeleton-shimmer" style={{ width: '90px', height: '24px', borderRadius: '6px' }} />
        </div>

        <div style={{
          marginTop: 'auto',
          paddingTop: '14px',
          borderTop: '1px solid var(--border-light)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div className="skeleton-shimmer" style={{ width: '50px', height: '8px', borderRadius: '4px' }} />
            <div className="skeleton-shimmer" style={{ width: '120px', height: '22px', borderRadius: '4px' }} />
          </div>
          <div className="skeleton-shimmer" style={{ width: '85px', height: '32px', borderRadius: '8px' }} />
        </div>
      </div>
    </div>
  );
};
