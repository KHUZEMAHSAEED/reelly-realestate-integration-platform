import React, { useState } from 'react';
import {
  X,
  MapPin,
  Sparkles,
  Send,
  PlusCircle,
  Bed,
  Bath,
  Maximize2
} from 'lucide-react';
import type { ReellyProject, ReellyUnitType, Currency, AppMode, BitrixDealContext } from '../types';
import { formatPrice } from '../services/api';

interface ProjectModalProps {
  project: ReellyProject | null;
  isOpen: boolean;
  onClose: () => void;
  currency: Currency;
  appMode: AppMode;
  activeDeal: BitrixDealContext | null;
  onAttachToDeal: (unitId?: string | number, notes?: string) => Promise<void>;
  onSendProposal: (channel: 'whatsapp' | 'email', message: string) => Promise<void>;
  isAttached: boolean;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({
  project,
  isOpen,
  onClose,
  currency,
  appMode,
  activeDeal,
  onAttachToDeal,
  onSendProposal,
  isAttached
}) => {
  if (!isOpen || !project) return null;

  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [selectedUnit, setSelectedUnit] = useState<ReellyUnitType | null>(null);
  const [brokerNotes, setBrokerNotes] = useState('');
  const [isAttaching, setIsAttaching] = useState(false);
  const [proposalChannel, setProposalChannel] = useState<'whatsapp' | 'email'>('whatsapp');
  const [customMsg, setCustomMsg] = useState('Exclusive presentation prepared for your portfolio review.');
  const [isSendingProposal, setIsSendingProposal] = useState(false);
  const [proposalSuccess, setProposalSuccess] = useState(false);

  const handleAttach = async (unit?: ReellyUnitType) => {
    setIsAttaching(true);
    try {
      await onAttachToDeal(unit?.id || selectedUnit?.id, brokerNotes);
    } finally {
      setIsAttaching(false);
    }
  };

  const handleSend = async () => {
    setIsSendingProposal(true);
    try {
      await onSendProposal(proposalChannel, customMsg);
      setProposalSuccess(true);
      setTimeout(() => setProposalSuccess(false), 4000);
    } finally {
      setIsSendingProposal(false);
    }
  };

  const photos = (project.photos && project.photos.length > 0)
    ? project.photos
    : [{ url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=85' }];

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 2000,
      backgroundColor: 'rgba(5, 6, 10, 0.85)',
      backdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px'
    }} onClick={onClose}>
      <div
        className="glass-panel"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '1100px',
          maxHeight: '92vh',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border-gold)',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          boxShadow: 'var(--shadow-luxury)'
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            zIndex: 50,
            background: 'rgba(0,0,0,0.6)',
            border: '1px solid var(--border-light)',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            cursor: 'pointer',
            transition: 'var(--transition-smooth)'
          }}
          title="Close Dossier"
        >
          <X size={20} />
        </button>

        {/* Gallery Hero Section */}
        <div style={{ position: 'relative', width: '100%', height: '420px', background: '#000' }}>
          <img
            src={photos[activePhotoIdx]?.url}
            alt={project.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, rgba(10, 11, 16, 0.1) 0%, rgba(10, 11, 16, 0.95) 100%)'
          }} />

          {/* Thumbnail Strip */}
          {photos.length > 1 && (
            <div style={{
              position: 'absolute',
              bottom: '16px',
              left: '24px',
              right: '24px',
              display: 'flex',
              gap: '10px',
              overflowX: 'auto',
              padding: '6px'
            }}>
              {photos.map((ph, idx) => (
                <img
                  key={idx}
                  src={ph.url}
                  alt=""
                  onClick={() => setActivePhotoIdx(idx)}
                  style={{
                    width: '64px',
                    height: '48px',
                    borderRadius: '6px',
                    objectFit: 'cover',
                    cursor: 'pointer',
                    border: activePhotoIdx === idx ? '2px solid var(--gold-light)' : '1px solid rgba(255,255,255,0.2)',
                    opacity: activePhotoIdx === idx ? 1 : 0.6,
                    transition: 'var(--transition-smooth)'
                  }}
                />
              ))}
            </div>
          )}

          {/* Overlay Title & Status */}
          <div style={{ position: 'absolute', bottom: photos.length > 1 ? '80px' : '24px', left: '28px', right: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <span className="badge-gold">{project.sale_status}</span>
              <span className="badge-gold" style={{ background: 'rgba(255,255,255,0.08)', color: '#fff' }}>
                {project.status}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: '#e5c583' }}>
                <MapPin size={14} />
                <span>{project.district ? `${project.district}, ${project.region}` : project.region}</span>
              </div>
            </div>

            <h1 className="font-serif" style={{ fontSize: '34px', fontWeight: 800, color: '#fff', margin: 0 }}>
              {project.name}
            </h1>
          </div>
        </div>

        {/* Content Body */}
        <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {/* Key Specs Bar */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '16px',
            background: 'rgba(255,255,255,0.03)',
            padding: '20px',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-light)'
          }}>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Starting Price</div>
              <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--gold-light)', marginTop: '2px' }}>
                {formatPrice(project.price_from, currency)}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Developer</div>
              <div style={{ fontSize: '16px', fontWeight: 600, color: '#fff', marginTop: '4px' }}>
                {project.developer?.name || 'Exclusive Developer'}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Estimated Handover</div>
              <div style={{ fontSize: '16px', fontWeight: 600, color: '#fff', marginTop: '4px' }}>
                {project.handover_date || 'Q4 2026'}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Floors</div>
              <div style={{ fontSize: '16px', fontWeight: 600, color: '#fff', marginTop: '4px' }}>
                {project.floors || 50} Levels
              </div>
            </div>
          </div>

          {/* Overview Narrative */}
          <div>
            <h3 className="font-serif" style={{ fontSize: '20px', color: '#fff', marginBottom: '12px' }}>
              Architectural Vision & Overview
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '15px', lineHeight: '1.7' }}>
              {project.overview}
            </p>
          </div>

          {/* Amenities Grid */}
          {project.amenities && project.amenities.length > 0 && (
            <div>
              <h3 className="font-serif" style={{ fontSize: '20px', color: '#fff', marginBottom: '16px' }}>
                Curated Amenities & Lifestyle
              </h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '12px'
              }}>
                {project.amenities.map((am, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      background: 'rgba(197, 160, 89, 0.05)',
                      padding: '12px 16px',
                      borderRadius: '10px',
                      border: '1px solid var(--border-gold)',
                      fontSize: '13px',
                      color: '#f3f4f8'
                    }}
                  >
                    <Sparkles size={16} color="var(--gold-light)" />
                    <span>{am}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Unit Types & Floor Plans */}
          {project.unit_types && project.unit_types.length > 0 && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 className="font-serif" style={{ fontSize: '20px', color: '#fff', margin: 0 }}>
                  Available Residences & Floor Plans
                </h3>
                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  {project.unit_types.length} Configurations Available
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {project.unit_types.map((u) => {
                  const isUnitSelected = selectedUnit?.id === u.id;
                  return (
                    <div
                      key={u.id}
                      onClick={() => setSelectedUnit(isUnitSelected ? null : u)}
                      style={{
                        background: isUnitSelected ? 'rgba(197, 160, 89, 0.12)' : 'rgba(255,255,255,0.03)',
                        border: isUnitSelected ? '1px solid var(--border-gold-bright)' : '1px solid var(--border-light)',
                        borderRadius: 'var(--radius-md)',
                        padding: '16px 20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '16px',
                        cursor: 'pointer',
                        transition: 'var(--transition-smooth)'
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '16px', fontWeight: 600, color: '#fff' }}>
                          {u.name}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '6px', fontSize: '13px', color: 'var(--text-muted)' }}>
                          {u.bedrooms !== undefined && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Bed size={14} color="var(--gold-light)" /> {u.bedrooms} Bedrooms
                            </span>
                          )}
                          {u.bathrooms !== undefined && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Bath size={14} color="var(--gold-light)" /> {u.bathrooms} Baths
                            </span>
                          )}
                          {u.area_sqft !== undefined && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Maximize2 size={14} color="var(--gold-light)" /> {u.area_sqft} sq.ft ({u.area_sqm} m²)
                            </span>
                          )}
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>STARTING FROM</div>
                          <div style={{ fontSize: '17px', fontWeight: 700, color: 'var(--gold-light)' }}>
                            {formatPrice(u.price_from, currency)}
                          </div>
                        </div>

                        {appMode === 'bitrix' && activeDeal && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAttach(u);
                            }}
                            className="btn-bitrix"
                            style={{ padding: '6px 12px', fontSize: '11px' }}
                          >
                            <PlusCircle size={13} /> Select for Deal
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Bitrix24 CRM Action Hub (if in CRM mode) */}
          {appMode === 'bitrix' && activeDeal && (
            <div style={{
              background: 'linear-gradient(135deg, rgba(0, 162, 232, 0.1) 0%, rgba(18, 22, 34, 0.95) 100%)',
              border: '1px solid rgba(0, 162, 232, 0.4)',
              borderRadius: 'var(--radius-lg)',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '18px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span className="badge-bitrix">BITRIX24 INTEGRATION ACTION HUB</span>
                  <span style={{ fontSize: '13px', color: '#fff' }}>
                    Active Deal: <strong>#{activeDeal.deal_id} - {activeDeal.contact_name}</strong>
                  </span>
                </div>
              </div>

              {/* Attach Section */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '16px', alignItems: 'center' }}>
                <input
                  type="text"
                  placeholder="Private Advisor note (e.g. Recommended unit with sunset marina view)..."
                  value={brokerNotes}
                  onChange={(e) => setBrokerNotes(e.target.value)}
                  style={{
                    background: 'rgba(0,0,0,0.4)',
                    border: '1px solid rgba(0, 162, 232, 0.3)',
                    borderRadius: '8px',
                    padding: '10px 16px',
                    color: '#fff',
                    fontSize: '13px',
                    outline: 'none'
                  }}
                />

                <button
                  onClick={() => handleAttach(selectedUnit || undefined)}
                  disabled={isAttaching}
                  className="btn-bitrix"
                  style={{ padding: '10px 20px' }}
                >
                  <PlusCircle size={15} />
                  {isAttaching ? 'Attaching...' : isAttached ? 'Update Attached Unit' : 'Attach Project to Deal'}
                </button>
              </div>

              {/* Client Proposal Dispatcher */}
              <div style={{
                marginTop: '10px',
                paddingTop: '16px',
                borderTop: '1px solid rgba(255,255,255,0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Send via:</span>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      onClick={() => setProposalChannel('whatsapp')}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        border: 'none',
                        background: proposalChannel === 'whatsapp' ? '#25d366' : 'rgba(255,255,255,0.06)',
                        color: proposalChannel === 'whatsapp' ? '#000' : '#fff',
                        fontWeight: 600,
                        fontSize: '11px',
                        cursor: 'pointer'
                      }}
                    >
                      WhatsApp ({activeDeal.contact_phone || 'Client'})
                    </button>
                    <button
                      onClick={() => setProposalChannel('email')}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        border: 'none',
                        background: proposalChannel === 'email' ? 'var(--bitrix-blue)' : 'rgba(255,255,255,0.06)',
                        color: '#fff',
                        fontWeight: 600,
                        fontSize: '11px',
                        cursor: 'pointer'
                      }}
                    >
                      Email ({activeDeal.contact_email || 'Client'})
                    </button>
                  </div>

                  <input
                    type="text"
                    value={customMsg}
                    onChange={(e) => setCustomMsg(e.target.value)}
                    placeholder="Proposal notes..."
                    style={{
                      flex: 1,
                      background: 'rgba(0,0,0,0.3)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '6px',
                      padding: '6px 10px',
                      color: '#fff',
                      fontSize: '11px',
                      outline: 'none',
                      marginLeft: '8px'
                    }}
                  />
                </div>

                <button
                  onClick={handleSend}
                  disabled={isSendingProposal}
                  className="btn-gold"
                  style={{ padding: '8px 16px', fontSize: '13px' }}
                >
                  <Send size={14} />
                  {isSendingProposal ? 'Dispatching...' : proposalSuccess ? 'Proposal Sent to CRM!' : 'Send VIP Client Proposal'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
