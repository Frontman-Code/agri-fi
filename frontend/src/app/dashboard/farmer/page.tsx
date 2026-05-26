'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiClient, Deal, User } from '@/lib/api';
import DashboardLayout from '@/components/DashboardLayout';
import MetricCard from '@/components/dashboard/MetricCard';
import TableSkeleton from '@/components/dashboard/TableSkeleton';
import { useToast } from '@/components/Toast';

interface CropForm {
  commodity: string;
  quantity: string;
  quantity_unit: 'kg' | 'tons';
  total_value: string;
  delivery_date: string;
}

const EMPTY: CropForm = {
  commodity: '',
  quantity: '',
  quantity_unit: 'kg',
  total_value: '',
  delivery_date: '',
};

const STATUS_CFG: Record<string, string> = {
  open: 'badge-green',
  funded: 'badge-blue',
  draft: 'badge-yellow',
  delivered: 'badge-purple',
  completed: 'badge-gray',
  failed: 'badge-red',
  cancelled: 'badge-red',
};

export default function FarmerDashboard() {
  const router = useRouter();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<CropForm>(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const cached = apiClient.getCurrentUser();
      if (!cached) {
        router.push('/login');
        return;
      }
      let u = cached;
      try {
        const f = await apiClient.refreshCurrentUser();
        if (f) u = f;
      } catch {}
      if (u.role !== 'farmer') {
        router.push(`/dashboard/${u.role}`);
        return;
      }
      setUser(u);
      loadDeals();
    })();
  }, [router]);

  const loadDeals = async () => {
    setLoading(true);
    try {
      const res = await apiClient.getFarmerDeals();
      setDeals(res);
    } catch (err: any) {
      toast('Failed to load your listed crops', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);
    try {
      await apiClient.createDeal({
        commodity: form.commodity.trim(),
        quantity: Number(form.quantity),
        quantity_unit: form.quantity_unit,
        total_value: Number(form.total_value),
        delivery_date: form.delivery_date,
      });
      toast('Crop listed successfully! 🌱', 'success');
      setShowModal(false);
      setForm(EMPTY);
      loadDeals();
    } catch (err: any) {
      setFormError(
        err?.response?.data?.message ?? err.message ?? 'Failed to list crop'
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Calculations for Key Metric Cards
  const totalDeals = deals.length;
  const activeShipments = deals.filter((d) =>
    ['funded', 'delivered'].includes(d.status)
  ).length;

  const pendingPaymentsAmount = deals
    .filter((d) => ['funded', 'delivered'].includes(d.status))
    .reduce((sum, d) => sum + Number(d.total_value), 0);

  const pendingPaymentsCount = deals.filter((d) =>
    ['funded', 'delivered'].includes(d.status)
  ).length;

  if (!user) return null;

  return (
    <DashboardLayout user={user}>
      <div className="page-content animate-fade-in">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500 mb-1">Welcome back 👋</p>
            <h1 className="page-title gradient-text">Farmer Cockpit</h1>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary flex-shrink-0 flex items-center gap-1.5 active:scale-[0.98] transition-all"
          >
            <span>+</span> List Crop
          </button>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <MetricCard
            label="Total Deals"
            value={loading ? 0 : totalDeals}
            loading={loading}
            colorTheme="emerald"
            subtext="All-time listed crops"
            icon={
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                />
              </svg>
            }
          />
          <MetricCard
            label="Active Shipments"
            value={loading ? 0 : activeShipments}
            loading={loading}
            colorTheme="blue"
            subtext="In transit or port milestones"
            icon={
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17h2m10 0h2"
                />
              </svg>
            }
          />
          <MetricCard
            label="Pending Payments"
            value={loading ? '$0' : `$${pendingPaymentsAmount.toLocaleString()}`}
            loading={loading}
            colorTheme="amber"
            subtext={`${pendingPaymentsCount} settlements pending`}
            icon={
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                />
              </svg>
            }
          />
        </div>

        {/* KYC notice */}
        {user.kycStatus !== 'verified' && (
          <div className="alert-warning shadow-sm animate-slide-up">
            <span className="text-lg">⚠️</span>
            <div>
              <p className="font-semibold text-amber-900">KYC verification required</p>
              <p className="text-xs text-amber-700 mt-0.5">
                Complete KYC to publish deals and receive payments.{' '}
                <Link href="/kyc" className="underline font-semibold hover:text-amber-900 transition-colors">
                  Verify now →
                </Link>
              </p>
            </div>
          </div>
        )}

        {/* Recent Deals Table / List */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title">Recent Deals</h2>
            {!loading && <span className="muted font-medium">{deals.length} listed</span>}
          </div>

          {loading ? (
            <TableSkeleton rows={5} />
          ) : deals.length === 0 ? (
            <div className="card p-14 text-center border-dashed border-2 border-slate-200">
              <div className="w-16 h-16 rounded-3xl bg-emerald-50 flex items-center justify-center text-3xl mx-auto mb-5 animate-bounce-sm">
                🌾
              </div>
              <h3 className="font-bold text-slate-900 text-lg mb-2">No projects yet</h3>
              <p className="text-slate-500 text-sm mb-6 max-w-xs mx-auto">
                List your first crop to start raising funding from investors worldwide.
              </p>
              <button
                onClick={() => setShowModal(true)}
                className="btn-primary mx-auto flex items-center gap-1.5 active:scale-[0.98]"
              >
                + List Your First Crop
              </button>
            </div>
          ) : (
            <div className="table-wrapper overflow-x-auto w-full shadow-card hover:shadow-card-md transition-shadow">
              <table className="w-full border-collapse">
                <thead className="table-head">
                  <tr>
                    <th className="table-th">Crop / Token</th>
                    <th className="table-th">Status</th>
                    <th className="table-th">Quantity</th>
                    <th className="table-th">Total Value</th>
                    <th className="table-th">Funding Progress</th>
                    <th className="table-th">Delivery Date</th>
                    <th className="table-th text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {deals.map((deal) => {
                    const pct =
                      deal.total_value > 0
                        ? Math.min(
                            (Number(deal.total_invested) / Number(deal.total_value)) * 100,
                            100
                          )
                        : 0;

                    return (
                      <tr key={deal.id} className="table-row">
                        {/* Crop / Token */}
                        <td className="table-td font-semibold text-slate-900">
                          <span className="capitalize">{deal.commodity}</span>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                            {deal.token_symbol}
                          </div>
                        </td>
                        {/* Status */}
                        <td className="table-td">
                          <span className={STATUS_CFG[deal.status] ?? 'badge-gray'}>
                            {deal.status}
                          </span>
                        </td>
                        {/* Quantity */}
                        <td className="table-td font-medium text-slate-800">
                          {Number(deal.quantity).toLocaleString()} {deal.quantity_unit}
                        </td>
                        {/* Total Value */}
                        <td className="table-td font-semibold text-slate-950">
                          ${Number(deal.total_value).toLocaleString()}
                        </td>
                        {/* Funding Progress */}
                        <td className="table-td min-w-[140px]">
                          <div className="flex justify-between items-center text-xs mb-1">
                            <span className="text-slate-500 font-medium">${Number(deal.total_invested).toLocaleString()} raised</span>
                            <span className="font-bold text-emerald-600">{pct.toFixed(1)}%</span>
                          </div>
                          <div className="progress-track w-full">
                            <div className="progress-green" style={{ width: `${pct}%` }} />
                          </div>
                        </td>
                        {/* Delivery Date */}
                        <td className="table-td text-slate-600 font-medium">
                          {new Date(deal.delivery_date).toLocaleDateString('en', {
                            month: 'short',
                            day: 'numeric',
                            year: '2-digit',
                          })}
                        </td>
                        {/* Action */}
                        <td className="table-td text-right">
                          <Link
                            href={`/marketplace/${deal.id}`}
                            className="btn-secondary py-1.5 px-3 text-xs inline-flex items-center hover:bg-slate-50 rounded-lg active:scale-[0.97]"
                          >
                            Details →
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div
          className="modal-overlay"
          onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
        >
          <div className="modal-panel max-w-md shadow-card-lg border border-slate-100/50">
            <div className="modal-header">
              <div>
                <h2 className="font-bold text-slate-900 text-lg">List Your Crop</h2>
                <p className="text-xs text-slate-500 mt-0.5">Create a new funding campaign</p>
              </div>
              <button
                onClick={() => {
                  setShowModal(false);
                  setForm(EMPTY);
                  setFormError(null);
                }}
                className="w-8 h-8 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors text-lg"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {formError && (
                  <div className="alert-error">
                    <span>⚠</span>
                    <span>{formError}</span>
                  </div>
                )}

                <div>
                  <label className="label">Commodity / Crop type</label>
                  <input
                    className="input"
                    required
                    placeholder="e.g. Cocoa Beans, Corn, Coffee"
                    value={form.commodity}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, commodity: e.target.value }))
                    }
                  />
                </div>

                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="label">Quantity</label>
                    <input
                      className="input"
                      type="number"
                      required
                      min={1}
                      placeholder="5000"
                      value={form.quantity}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, quantity: e.target.value }))
                      }
                    />
                  </div>
                  <div className="w-28">
                    <label className="label">Unit</label>
                    <select
                      className="select"
                      value={form.quantity_unit}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          quantity_unit: e.target.value as 'kg' | 'tons',
                        }))
                      }
                    >
                      <option value="kg">kg</option>
                      <option value="tons">tons</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="label">Total Value (USD)</label>
                  <input
                    className="input"
                    type="number"
                    required
                    min={100}
                    placeholder="75000"
                    value={form.total_value}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, total_value: e.target.value }))
                    }
                  />
                  <p className="label-hint">Min $100 · Each token = $100 · Tokens = value ÷ 100</p>
                </div>

                <div>
                  <label className="label">Expected Delivery Date</label>
                  <input
                    className="input"
                    type="date"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    value={form.delivery_date}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, delivery_date: e.target.value }))
                    }
                  />
                </div>

                {form.total_value && Number(form.total_value) >= 100 && (
                  <div className="alert-success">
                    <span>🪙</span>
                    <span>
                      This will create{' '}
                      <strong>
                        {Math.floor(Number(form.total_value) / 100).toLocaleString()}
                      </strong>{' '}
                      tokens at $100 each.
                    </span>
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setForm(EMPTY);
                    setFormError(null);
                  }}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary flex-1"
                >
                  {submitting ? 'Listing…' : '🌱 List Crop'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
