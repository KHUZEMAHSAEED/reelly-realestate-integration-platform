import { useState, useEffect, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { BitrixBar } from './components/BitrixBar';
import { FilterBar } from './components/FilterBar';
import type { FilterState } from './components/FilterBar';
import { ProjectCard } from './components/ProjectCard';
import { MapView } from './components/MapView';
import { ProjectModal } from './components/ProjectModal';
import { SettingsModal } from './components/SettingsModal';
import { BitrixTimelineModal } from './components/BitrixTimelineModal';
import type {
  Currency,
  ViewMode,
  AppMode,
  ReellyProject,
  BitrixDealContext
} from './types';
import { api } from './services/api';
import {
  RefreshCw,
  CheckCircle2
} from 'lucide-react';

export function App() {
  // Query param detection for Bitrix iframe / embedded mode
  const searchParams = new URLSearchParams(window.location.search);
  const initialMode: AppMode = searchParams.get('mode') === 'bitrix' ? 'bitrix' : 'portal';
  const initialDealId = searchParams.get('dealId') || '101';

  const [appMode, setAppMode] = useState<AppMode>(initialMode);
  const [currency, setCurrency] = useState<Currency>('AED');
  const [viewMode, setViewMode] = useState<ViewMode>('split');

  const [projects, setProjects] = useState<ReellyProject[]>([]);
  const [developers, setDevelopers] = useState<Array<{ id: string | number; name: string }>>([]);
  const [selectedProject, setSelectedProject] = useState<ReellyProject | null>(null);
  const [activeModalProject, setActiveModalProject] = useState<ReellyProject | null>(null);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isTimelineOpen, setIsTimelineOpen] = useState(false);
  const [apiKeyStatus, setApiKeyStatus] = useState<{ isConfigured: boolean; maskedKey: string | null; hasEnvKey?: boolean }>({
    isConfigured: false,
    maskedKey: null
  });

  const [bitrixDeals, setBitrixDeals] = useState<BitrixDealContext[]>([]);
  const [activeDealId, setActiveDealId] = useState<string>(initialDealId);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);

  const [filters, setFilters] = useState<FilterState>({
    search: '',
    developer: '',
    status: '',
    region: '',
    maxPrice: 100000000,
    quickTag: ''
  });

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  // Load Initial Data
  const loadData = async () => {
    setLoading(true);
    try {
      const [keyRes, dealsRes, devsRes, projRes] = await Promise.all([
        api.getApiKeyStatus().catch(() => ({ isConfigured: false, maskedKey: null, hasEnvKey: false })),
        api.getBitrixDeals().catch(() => []),
        api.getDevelopers().catch(() => ({ results: [] })),
        api.getProjects().catch(() => ({ results: [] }))
      ]);

      setApiKeyStatus(keyRes);
      setBitrixDeals(dealsRes);
      setDevelopers(devsRes.results || []);
      setProjects(projRes.results || []);
      if (projRes.results?.length > 0) {
        setSelectedProject(projRes.results[0]);
      }
    } catch (err: any) {
      console.error('Initialization error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Current active Bitrix deal
  const activeDeal = useMemo(() => {
    return bitrixDeals.find(d => String(d.deal_id) === String(activeDealId)) || bitrixDeals[0] || null;
  }, [bitrixDeals, activeDealId]);

  // Client-side filtering across curated collections and user controls
  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      // Search
      if (filters.search) {
        const q = filters.search.toLowerCase();
        const matchesName = p.name ? p.name.toLowerCase().includes(q) : false;
        const matchesDev = p.developer?.name ? p.developer.name.toLowerCase().includes(q) : false;
        const matchesDist = p.district ? p.district.toLowerCase().includes(q) : false;
        if (!matchesName && !matchesDev && !matchesDist) return false;
      }
      // Developer
      if (filters.developer && p.developer?.name?.toLowerCase() !== filters.developer.toLowerCase()) {
        return false;
      }
      // Status
      if (filters.status && p.status?.toLowerCase() !== filters.status.toLowerCase()) {
        return false;
      }
      // Region
      if (filters.region && p.region?.toLowerCase() !== filters.region.toLowerCase()) {
        return false;
      }
      // Price
      if (filters.maxPrice < 100000000 && p.price_from > filters.maxPrice) {
        return false;
      }
      // Quick tags
      if (filters.quickTag === 'waterfront') {
        const text = `${p.name || ''} ${p.district || ''} ${p.overview || ''}`.toLowerCase();
        if (!text.includes('harbour') && !text.includes('marina') && !text.includes('waterfront') && !text.includes('bay') && !text.includes('sea')) {
          return false;
        }
      } else if (filters.quickTag === 'branded') {
        const text = `${p.name || ''} ${p.overview || ''}`.toLowerCase();
        if (!text.includes('bugatti') && !text.includes('bvlgari') && !text.includes('dorchester')) {
          return false;
        }
      } else if (filters.quickTag === 'penthouse') {
        const hasPenthouse = p.unit_types?.some(u => u.name.toLowerCase().includes('penthouse') || u.name.toLowerCase().includes('sky'));
        if (!hasPenthouse) return false;
      } else if (filters.quickTag === 'yield') {
        if (p.price_from > 15000000) return false;
      }

      return true;
    });
  }, [projects, filters]);

  // Bitrix attach action
  const handleAttachToDeal = async (projectId: string | number, unitId?: string | number, notes?: string) => {
    if (!activeDeal) return;
    try {
      const res = await api.attachProjectToDeal({
        dealId: activeDeal.deal_id,
        projectId,
        unitId,
        agentNotes: notes
      });
      // update local deal state
      setBitrixDeals(prev => prev.map(d => String(d.deal_id) === String(activeDeal.deal_id) ? res.deal : d));
      showToast(res.message || `Project attached to Bitrix Deal #${activeDeal.deal_id}`);
    } catch (err: any) {
      showToast(`Error: ${err.message}`);
    }
  };

  // Bitrix proposal send action
  const handleSendProposal = async (projectId: string | number, channel: 'whatsapp' | 'email', customMsg: string) => {
    if (!activeDeal) return;
    try {
      const res = await api.sendProposal({
        dealId: activeDeal.deal_id,
        projectId,
        channel,
        customMessage: customMsg
      });
      setBitrixDeals(prev => prev.map(d => String(d.deal_id) === String(activeDeal.deal_id) ? res.deal : d));
      showToast(`VIP Proposal dispatched via ${channel.toUpperCase()} to ${activeDeal.contact_name}!`);
    } catch (err: any) {
      showToast(`Error sending proposal: ${err.message}`);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-primary)' }}>
      {/* Toast Notification */}
      {toast && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 3000,
          background: 'linear-gradient(135deg, rgba(20, 25, 38, 0.98) 0%, rgba(10, 12, 18, 0.98) 100%)',
          border: '1px solid var(--border-gold-bright)',
          color: '#fff',
          padding: '14px 22px',
          borderRadius: '12px',
          boxShadow: 'var(--shadow-luxury)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '13px',
          fontWeight: 600
        }}>
          <CheckCircle2 size={18} color="var(--gold-light)" />
          <span>{toast}</span>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar
        appMode={appMode}
        setAppMode={setAppMode}
        currency={currency}
        setCurrency={setCurrency}
        viewMode={viewMode}
        setViewMode={setViewMode}
        onOpenSettings={() => setIsSettingsOpen(true)}
        apiKeyStatus={apiKeyStatus}
        bitrixDeals={bitrixDeals}
        activeDealId={activeDealId}
        setActiveDealId={setActiveDealId}
        onOpenTimeline={() => setIsTimelineOpen(true)}
      />

      {/* Bitrix CRM Deal Status Bar (shown when in Bitrix Mode) */}
      {appMode === 'bitrix' && (
        <BitrixBar
          deal={activeDeal}
          currency={currency}
          onOpenTimeline={() => setIsTimelineOpen(true)}
        />
      )}

      {/* Filters & Curated Collections */}
      <FilterBar
        filters={filters}
        setFilters={setFilters}
        developers={developers}
        currency={currency}
        totalCount={filteredProjects.length}
      />

      {/* Main View Area */}
      <main style={{ flex: 1, display: 'flex', position: 'relative', overflow: 'hidden' }}>
        {loading ? (
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '16px',
            color: 'var(--gold-light)'
          }}>
            <RefreshCw size={36} className="animate-spin" />
            <div className="font-serif" style={{ fontSize: '18px', letterSpacing: '0.08em' }}>
              Loading Luxury Portfolios...
            </div>
          </div>
        ) : (
          <>
            {/* View Mode 1: Split View (Map on Right, Scrollable Cards on Left) */}
            {viewMode === 'split' && (
              <div style={{ flex: 1, display: 'flex', height: 'calc(100vh - 170px)' }}>
                {/* Scrollable Project Cards List */}
                <div style={{
                  width: '520px',
                  maxWidth: '100%',
                  overflowY: 'auto',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  borderRight: '1px solid var(--border-light)'
                }}>
                  {filteredProjects.map((p) => {
                    const isAttached = activeDeal?.attachedProjects?.some(ap => String(ap.projectId) === String(p.id)) || false;
                    return (
                      <ProjectCard
                        key={p.id}
                        project={p}
                        currency={currency}
                        appMode={appMode}
                        activeDeal={activeDeal}
                        isSelected={selectedProject?.id === p.id}
                        onSelect={() => setSelectedProject(p)}
                        onOpenDetails={() => setActiveModalProject(p)}
                        onAttachToDeal={() => handleAttachToDeal(p.id)}
                        onSendProposal={() => handleSendProposal(p.id, 'whatsapp', 'Luxury Portfolio review')}
                        isAttachedToDeal={isAttached}
                      />
                    );
                  })}
                </div>

                {/* Interactive Leaflet Map */}
                <div style={{ flex: 1, height: '100%' }}>
                  <MapView
                    projects={filteredProjects}
                    selectedProject={selectedProject}
                    onSelectProject={(p) => setSelectedProject(p)}
                    onOpenDetails={(p) => setActiveModalProject(p)}
                    currency={currency}
                  />
                </div>
              </div>
            )}

            {/* View Mode 2: Grid View (All Luxury Cards in Responsive Grid) */}
            {viewMode === 'grid' && (
              <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: '28px',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
                gap: '24px',
                alignContent: 'start'
              }}>
                {filteredProjects.map((p) => {
                  const isAttached = activeDeal?.attachedProjects?.some(ap => String(ap.projectId) === String(p.id)) || false;
                  return (
                    <ProjectCard
                      key={p.id}
                      project={p}
                      currency={currency}
                      appMode={appMode}
                      activeDeal={activeDeal}
                      isSelected={selectedProject?.id === p.id}
                      onSelect={() => setSelectedProject(p)}
                      onOpenDetails={() => setActiveModalProject(p)}
                      onAttachToDeal={() => handleAttachToDeal(p.id)}
                      onSendProposal={() => handleSendProposal(p.id, 'whatsapp', 'Luxury Portfolio review')}
                      isAttachedToDeal={isAttached}
                    />
                  );
                })}
              </div>
            )}

            {/* View Mode 3: Map Only View */}
            {viewMode === 'map' && (
              <div style={{ flex: 1, height: 'calc(100vh - 170px)' }}>
                <MapView
                  projects={filteredProjects}
                  selectedProject={selectedProject}
                  onSelectProject={(p) => setSelectedProject(p)}
                  onOpenDetails={(p) => setActiveModalProject(p)}
                  currency={currency}
                />
              </div>
            )}
          </>
        )}
      </main>

      {/* Project Dossier Modal */}
      <ProjectModal
        project={activeModalProject}
        isOpen={!!activeModalProject}
        onClose={() => setActiveModalProject(null)}
        currency={currency}
        appMode={appMode}
        activeDeal={activeDeal}
        onAttachToDeal={async (unitId, notes) => {
          if (activeModalProject) {
            await handleAttachToDeal(activeModalProject.id, unitId, notes);
          }
        }}
        onSendProposal={async (channel, message) => {
          if (activeModalProject) {
            await handleSendProposal(activeModalProject.id, channel, message);
          }
        }}
        isAttached={activeDeal?.attachedProjects?.some(ap => String(ap.projectId) === String(activeModalProject?.id)) || false}
      />

      {/* Settings & Reelly API Key Diagnostics Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        apiKeyStatus={apiKeyStatus}
        onStatusUpdated={loadData}
      />

      {/* Bitrix24 Deal Timeline & CRM History Modal */}
      <BitrixTimelineModal
        isOpen={isTimelineOpen}
        onClose={() => setIsTimelineOpen(false)}
        deal={activeDeal}
        currency={currency}
        onOpenProject={async (projId) => {
          const found = projects.find(p => String(p.id) === String(projId));
          if (found) {
            setActiveModalProject(found);
          } else {
            const fetched = await api.getProject(projId);
            setActiveModalProject(fetched);
          }
        }}
      />
    </div>
  );
}

export default App;
