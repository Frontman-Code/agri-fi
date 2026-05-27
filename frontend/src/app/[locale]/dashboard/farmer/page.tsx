'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { apiClient, Deal, User, MILESTONE_LABELS, Milestone } from '../../../../lib/api';
import DashboardLayout from '../../../../components/DashboardLayout';
import StatCard from '../../../../components/StatCard';
import { useToast } from '../../../../components/ui/ToastProvider';
import { CreateDealForm } from '../../../../components/deals/CreateDealForm';

const STATUS_CFG: Record<string, string> = {
  open: 'badge-green', funded: 'badge-blue', draft: 'badge-yellow',
  delivered: 'badge-purple', completed: 'badge-gray', failed: 'badge-red', cancelled: 'badge-red',
};

export default function FarmerDashboard() {
  const t = useTranslations('dashboard.farmer');
  const tc = useTranslations('common');
  const router = useRouter();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    (async () => {
      const cached = apiClient.getCurrentUser();
      if (!cached) { router.push('/login'); return; }
      let u = cached;
      try { const f = await apiClient.refreshCurrentUser(); if (f) u = f; } catch {}
      if (u.role !== 'farmer') { router.push(`/dashboard/${u.role}`); return; }
      setUser(u);
      loadDeals();
    })();
  }, [router]);

  const loadDeals = async () => {
    setLoading(true);
    try { setDeals(await apiClient.getFarmerDeals()); } catch {}
    setLoading(false);
  };

  const totalValue  = deals.reduce((s, d) => s + Number(d.total_value), 0);
  const totalFunded = deals.reduce((s, d) => s + Number(d.total_invested), 0);
  const active      = deals.filter(d => ['open','funded'].includes(d.status)).length;
  const fundingPct  = totalValue > 0 ? ((totalFunded / totalValue) * 100).toFixed(1) : '0';

  if (!user) return null;

  return (
    <DashboardLayout user={user}>
      <div className="page-content">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500 mb-1">{t('greeting')}</p>
            <h1 className="page-title">{t('title')}</h1>
          </div>
          <button onClick={() => setShowModal(true)} className="btn-primary flex-shrink-0">
            <span>+</span> {t('listCrop')}
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label={t('stats.totalProjects')} value={deals.length}                          icon="🌱" color="bg-emerald-50" />
          <StatCard label={t('stats.active')}         value={active}                                icon="📈" color="bg-blue-50" />
          <StatCard label={t('stats.totalValue')}    value={`$${totalValue.toLocaleString()}`}     icon="💰" color="bg-amber-50" />
          <StatCard label={t('stats.funded')}         value={`${fundingPct}%`}                      icon="✅" color="bg-violet-50" trend={`$${totalFunded.toLocaleString()} raised`} trendUp={totalFunded > 0} />
        </div>

        {/* KYC notice */}
        {user.kycStatus !== 'verified' && (
          <div className="alert-warning">
            <span className="text-lg">⚠️</span>
            <div>
              <p className="font-semibold">{t('kyc.title')}</p>
              <p className="text-xs mt-0.5">{t('kyc.desc')}{' '}
                <Link href="/kyc" className="underline font-semibold">{t('kyc.verifyNow')}</Link>
              </p>
            </div>
          </div>
        )}

        {/* Deals */}
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1,2,3].map(i => <div key={i} className="card h-56 skeleton" />)}
          </div>
        ) : deals.length === 0 ? (
          <div className="card p-14 text-center">
            <div className="w-16 h-16 rounded-3xl bg-emerald-50 flex items-center justify-center text-3xl mx-auto mb-5">🌾</div>
            <h3 className="font-bold text-slate-900 text-lg mb-2">{t('noProjects.title')}</h3>
            <p className="text-slate-500 text-sm mb-6 max-w-xs mx-auto">
              {t('noProjects.desc')}
            </p>
            <button onClick={() => setShowModal(true)} className="btn-primary mx-auto">
              {t('noProjects.cta')}
            </button>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="section-title">{t('projects.title')}</h2>
              <span className="muted">{t('projects.total', { count: deals.length })}</span>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {deals.map(deal => {
                const pct = deal.total_value > 0
                  ? Math.min((Number(deal.total_invested) / Number(deal.total_value)) * 100, 100) : 0;
                const latest = deal.milestones?.sort((a: any, b: any) =>
                  new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime())[0];

                return (
                  <div key={deal.id} className="card-hover flex flex-col overflow-hidden">
                    <div className="h-1 bg-gradient-to-r from-brand-400 to-emerald-500" style={{ width: `${pct}%` }} />
                    <div className="p-5 flex flex-col gap-3 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-bold text-slate-900 capitalize">{deal.commodity}</h3>
                          <p className="text-xs text-slate-400 font-mono">{deal.token_symbol}</p>
                        </div>
                        <span className={STATUS_CFG[deal.status] ?? 'badge-gray'}>{deal.status}</span>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        {[
                          ['Quantity', `${Number(deal.quantity).toLocaleString()} ${deal.quantity_unit}`],
                          ['Value',    `$${Number(deal.total_value).toLocaleString()}`],
                          ['Funded',   `$${Number(deal.total_invested).toLocaleString()}`],
                          ['Delivery', new Date(deal.delivery_date).toLocaleDateString('en', { month: 'short', day: 'numeric', year: '2-digit' })],
                        ].map(([l, v]) => (
                          <div key={l} className="bg-slate-50 rounded-xl p-2.5">
                            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">{l}</p>
                            <p className="text-sm font-bold text-slate-900 mt-0.5 truncate">{v}</p>
                          </div>
                        ))}
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-500">{t('projects.fundingProgress')}</span>
                          <span className="font-bold text-brand-600">{pct.toFixed(1)}%</span>
                        </div>
                        <div className="progress-track">
                          <div className="progress-green" style={{ width: `${pct}%` }} />
                        </div>
                      </div>

                      {latest && (
                        <div className="flex items-center gap-2 text-xs text-slate-500 pt-1 border-t border-slate-100">
                          <span className="w-1.5 h-1.5 rounded-full bg-brand-500 flex-shrink-0" />
                          <span>{MILESTONE_LABELS[latest.milestone]}</span>
                          <span className="ml-auto text-slate-400">{new Date(latest.recorded_at).toLocaleDateString()}</span>
                        </div>
                      )}

                      <Link href={`/marketplace/${deal.id}`}
                        className="btn-secondary text-xs py-2 text-center mt-auto">
                        {t('projects.viewDetails')}
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal-panel">
            <div className="modal-header">
              <div>
                <h2 className="font-bold text-slate-900 text-lg">{t('modal.title')}</h2>
                <p className="text-xs text-slate-500 mt-0.5">{t('modal.subtitle')}</p>
              </div>
              <button onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors text-lg">
                ×
              </button>
            </div>

            <div className="modal-body p-6">
              <CreateDealForm 
                onSuccess={() => {
                  toast(t('modal.success'), 'success');
                  setShowModal(false);
                  loadDeals();
                }}
                onCancel={() => setShowModal(false)}
              />
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
