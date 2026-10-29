'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Check, ChevronLeft, ChevronRight, Download, Eye, Search,
  Settings2, X, Users, ShoppingBag, Wallet, Clock,
} from 'lucide-react';
import { adminService } from '../services/admin.service';
import { AdminRecord } from '../types/admin.types';

type InfluencerStatus = 'ALL' | 'PENDING' | 'ACTIVE' | 'REJECTED';

type InfluencerPerformance = {
  referrals: number;
  sales: number;
  commission: number;
};

type Influencer = AdminRecord & {
  id: string;
  status?: string;
  referralCode?: string;
  commissionRate?: number | string;
  customerDiscountRate?: number | string;
  profile?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    instagramUrl?: string;
    tiktokUrl?: string;
    youtubeUrl?: string;
    facebookUrl?: string;
    xUrl?: string;
    phone?: string;
    country?: string;
    city?: string;
    occupation?: string;
    bio?: string;
    applicationNote?: string;
  };
};

const PAGE_SIZE = 10;

function money(value: number) {
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0,
  }).format(value);
}

function fullName(record: Influencer) {
  const name = [
    record.profile?.firstName,
    record.profile?.lastName,
  ].filter(Boolean).join(' ').trim();

  return name || record.profile?.email || 'Unnamed influencer';
}

function statusLabel(status?: string) {
  switch (status?.toUpperCase()) {
    case 'ACTIVE':
    case 'APPROVED':
      return 'Approved';
    case 'PENDING':
      return 'Pending';
    case 'REJECTED':
      return 'Rejected';
    default:
      return status || 'Unknown';
  }
}

function statusStyle(status?: string) {
  switch (status?.toUpperCase()) {
    case 'ACTIVE':
    case 'APPROVED':
      return 'bg-emerald-50 text-emerald-700';
    case 'PENDING':
      return 'bg-amber-50 text-amber-700';
    case 'REJECTED':
      return 'bg-red-50 text-red-700';
    default:
      return 'bg-neutral-100 text-neutral-600';
  }
}

function socialHandle(record: Influencer) {
  const url = record.profile?.instagramUrl
    || record.profile?.tiktokUrl
    || record.profile?.youtubeUrl
    || record.profile?.facebookUrl
    || record.profile?.xUrl;

  if (!url) {
    return record.referralCode
      ? `Code: ${record.referralCode}`
      : 'No social profile';
  }

  try {
    const parsed = new URL(url);
    const path = parsed.pathname.split('/').filter(Boolean).pop();

    return path
      ? `@${path.replace(/^@/, '')}`
      : parsed.hostname;
  } catch {
    return url;
  }
}

export function AdminInfluencersPage() {
  const [records, setRecords] = useState<Influencer[]>([]);
  const [performance, setPerformance] = useState<
    Record<string, InfluencerPerformance>
  >({});
  const [performanceLoading, setPerformanceLoading] = useState(true);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<InfluencerStatus>('ALL');
  const [page, setPage] = useState(1);

  const [selected, setSelected] = useState<Influencer | null>(null);
  const [referrals, setReferrals] = useState<AdminRecord[]>([]);
  const [commissions, setCommissions] = useState<AdminRecord[]>([]);
  const [withdrawals, setWithdrawals] = useState<AdminRecord[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const [decision, setDecision] = useState('');
  const [commissionRate, setCommissionRate] = useState('0');
  const [discountRate, setDiscountRate] = useState('0');
  const [working, setWorking] = useState(false);
  const [actionError, setActionError] = useState('');

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [defaultCommission, setDefaultCommission] = useState('0');
  const [defaultDiscount, setDefaultDiscount] = useState('0');
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsMessage, setSettingsMessage] = useState('');

  const loadRecords = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const response = await adminService.getSection(
        'influencers',
        1,
        '',
      );

      setRecords(response.items as Influencer[]);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : 'Could not load influencers.',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadRecords();
  }, [loadRecords]);

  // Load referral and commission figures for each influencer.
  useEffect(() => {
    let cancelled = false;

    async function loadPerformance() {
      setPerformanceLoading(true);

      try {
        const results = await Promise.all(
          records.map(async (record) => {
            try {
              const [referrals, commissions] = await Promise.all([
                adminService.getInfluencerReferrals(record.id),
                adminService.getInfluencerCommissions(record.id),
              ]);

              // Count sales from delivered orders only.
              const sales = referrals.reduce((sum, referral) => {
                const orderStatus = String(
                  referral.orderStatus ?? '',
                ).toUpperCase();

                if (orderStatus !== 'DELIVERED') {
                  return sum;
                }

                const amount = Number(referral.saleAmount ?? 0);

                return sum + (
                  Number.isFinite(amount) ? amount : 0
                );
              }, 0);

              // Sum all recorded commission amounts.
              const commission = commissions.reduce((sum, item) => {
                const amount = Number(item.amount ?? 0);

                return sum + (
                  Number.isFinite(amount) ? amount : 0
                );
              }, 0);

              return {
                id: record.id,
                value: {
                  referrals: referrals.length,
                  sales,
                  commission,
                } as InfluencerPerformance,
              };
            } catch {
              // If an endpoint fails, don't misrepresent the data as zero.
              return {
                id: record.id,
                value: null,
              };
            }
          }),
        );

        if (cancelled) return;

        const next: Record<string, InfluencerPerformance> = {};

        for (const result of results) {
          if (result.value) {
            next[result.id] = result.value;
          }
        }

        setPerformance(next);
      } finally {
        if (!cancelled) {
          setPerformanceLoading(false);
        }
      }
    }

    if (records.length === 0) {
      setPerformance({});
      setPerformanceLoading(false);

      return () => {
        cancelled = true;
      };
    }

    void loadPerformance();

    return () => {
      cancelled = true;
    };
  }, [records]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();

    return records.filter((record) => {
      const status = record.status?.toUpperCase() || '';

      const matchesStatus =
        filter === 'ALL'
        || (filter === 'PENDING' && status === 'PENDING')
        || (
          filter === 'ACTIVE'
          && ['ACTIVE', 'APPROVED'].includes(status)
        )
        || (filter === 'REJECTED' && status === 'REJECTED');

      const searchable = [
        fullName(record),
        record.profile?.email,
        socialHandle(record),
        record.referralCode,
        record.status,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return matchesStatus && (!term || searchable.includes(term));
    });
  }, [records, filter, search]);

  useEffect(() => {
    setPage(1);
  }, [filter, search]);

  const totalPages = Math.max(
    1,
    Math.ceil(filtered.length / PAGE_SIZE),
  );

  const pageRecords = filtered.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );

  const stats = useMemo(() => ({
    all: records.length,

    pending: records.filter(
      (item) => item.status?.toUpperCase() === 'PENDING',
    ).length,

    approved: records.filter(
      (item) =>
        ['ACTIVE', 'APPROVED'].includes(
          item.status?.toUpperCase() || '',
        ),
    ).length,

    rejected: records.filter(
      (item) => item.status?.toUpperCase() === 'REJECTED',
    ).length,
  }), [records]);

  const openDetails = async (record: Influencer) => {
    setSelected(record);
    setDecision('');
    setCommissionRate(String(record.commissionRate ?? 0));
    setDiscountRate(String(record.customerDiscountRate ?? 0));
    setActionError('');

    setReferrals([]);
    setCommissions([]);
    setWithdrawals([]);
    setHistoryLoading(true);

    try {
      const [
        nextReferrals,
        nextCommissions,
        nextWithdrawals,
      ] = await Promise.all([
        adminService.getInfluencerReferrals(record.id),
        adminService.getInfluencerCommissions(record.id),
        adminService.getInfluencerWithdrawals(record.id),
      ]);

      setReferrals(nextReferrals);
      setCommissions(nextCommissions);
      setWithdrawals(nextWithdrawals);
    } catch (cause) {
      setActionError(
        cause instanceof Error
          ? cause.message
          : 'Could not load influencer activity.',
      );
    } finally {
      setHistoryLoading(false);
    }
  };

  const saveInfluencer = async () => {
    if (!selected) return;

    const commission = Number(commissionRate);
    const discount = Number(discountRate);

    if (
      commissionRate.trim() === ''
      || !Number.isFinite(commission)
      || commission < 0
      || commission > 100
    ) {
      setActionError(
        'Commission rate must be between 0 and 100.',
      );
      return;
    }

    if (
      discountRate.trim() === ''
      || !Number.isFinite(discount)
      || discount < 0
      || discount > 100
    ) {
      setActionError(
        'Customer discount must be between 0 and 100.',
      );
      return;
    }

    setWorking(true);
    setActionError('');

    try {
      const currentStatus = selected.status?.toUpperCase();

      if (
        decision === 'APPROVED'
        && currentStatus === 'PENDING'
      ) {
        await adminService.approveInfluencer(selected.id);
      } else if (
        decision === 'REJECTED'
        && currentStatus === 'PENDING'
      ) {
        await adminService.updateInfluencer(selected.id, {
          status: 'REJECTED',
        });
      }

      if (
        commission !== Number(selected.commissionRate ?? 0)
        || discount !== Number(selected.customerDiscountRate ?? 0)
      ) {
        await adminService.updateInfluencer(selected.id, {
          commissionRate: commission,
          customerDiscountRate: discount,
        });
      }

      setSelected(null);
      await loadRecords();
    } catch (cause) {
      setActionError(
        cause instanceof Error
          ? cause.message
          : 'Could not save changes.',
      );
    } finally {
      setWorking(false);
    }
  };

  const exportCsv = () => {
    const headers = [
      'Influencer',
      'Email',
      'Social handle',
      'Status',
      'Referral code',
      'Commission rate (%)',
      'Customer discount (%)',
      'Total referrals',
      'Total sales (XAF)',
      'Commission earned (XAF)',
    ];

    const rows = filtered.map((record) => [
      fullName(record),
      record.profile?.email ?? '',
      socialHandle(record),
      statusLabel(record.status),
      record.referralCode ?? '',
      String(record.commissionRate ?? ''),
      String(record.customerDiscountRate ?? ''),
      String(performance[record.id]?.referrals ?? ''),
      String(performance[record.id]?.sales ?? ''),
      String(performance[record.id]?.commission ?? ''),
    ]);

    const csvCell = (value: string) =>
      `"${value.replace(/"/g, '""')}"`;

    const csv = [headers, ...rows]
      .map((row) => row.map(csvCell).join(','))
      .join('\r\n');

    const url = URL.createObjectURL(
      new Blob([csv], { type: 'text/csv;charset=utf-8;' }),
    );

    const anchor = document.createElement('a');

    anchor.href = url;
    anchor.download = 'maillot-store-influencers.csv';
    anchor.click();

    URL.revokeObjectURL(url);
  };

  // Load saved default rates from the backend.
  const loadDefaultSettings = async () => {
    setSettingsLoading(true);
    setSettingsMessage('');

    try {
      const response = await adminService.getSection('settings');

      const commissionSetting = response.items.find(
        (item) => item.key === 'influencer_default_commission_rate',
      );

      const discountSetting = response.items.find(
        (item) => item.key === 'influencer_default_customer_discount_rate',
      );

      setDefaultCommission(String(commissionSetting?.value ?? '0'));
      setDefaultDiscount(String(discountSetting?.value ?? '0'));
    } catch (cause) {
      setSettingsMessage(
        cause instanceof Error
          ? cause.message
          : 'Could not load commission settings.',
      );
    } finally {
      setSettingsLoading(false);
    }
  };

  // Save default rates for new influencer registrations.
  const saveDefaultSettings = async () => {
    const commission = Number(defaultCommission);
    const discount = Number(defaultDiscount);

    if (
      defaultCommission.trim() === ''
      || defaultDiscount.trim() === ''
      || !Number.isFinite(commission)
      || commission < 0
      || commission > 100
      || !Number.isFinite(discount)
      || discount < 0
      || discount > 100
    ) {
      setSettingsMessage('Both rates must be between 0 and 100.');
      return;
    }

    setSettingsSaving(true);
    setSettingsMessage('');

    try {
      await Promise.all([
        adminService.updateSetting(
          'influencer_default_commission_rate',
          String(commission),
          'Default commission rate for new influencers',
        ),
        adminService.updateSetting(
          'influencer_default_customer_discount_rate',
          String(discount),
          'Default customer discount rate for new influencers',
        ),
      ]);

      setSettingsMessage('Default rates saved successfully.');
    } catch (cause) {
      setSettingsMessage(
        cause instanceof Error
          ? cause.message
          : 'Could not save the default rates.',
      );
    } finally {
      setSettingsSaving(false);
    }
  };

  const salesTotal = referrals.reduce((sum, referral) => {
    const amount = Number(
      referral.saleAmount
      ?? referral.orderTotal
      ?? referral.totalAmount
      ?? 0,
    );

    return sum + (
      Number.isFinite(amount) ? amount : 0
    );
  }, 0);

  const earnedTotal = commissions.reduce((sum, commission) => {
    const amount = Number(commission.amount ?? 0);

    return sum + (
      Number.isFinite(amount) ? amount : 0
    );
  }, 0);

  return (
    <div className="mx-auto max-w-[1500px] space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs text-neutral-500">
            Administration / Influencers
          </p>

          <h1 className="mt-1 text-3xl font-black tracking-tight">
            Influencers
          </h1>

          <p className="mt-1 text-sm text-neutral-600">
            Review applications, monitor referrals, and manage commissions.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              setSettingsOpen(true);
              void loadDefaultSettings();
            }}
            className="inline-flex h-10 items-center gap-2 border border-neutral-300 bg-white px-4 text-xs font-bold hover:border-[#D4AF37]"
          >
            <Settings2 size={15} />
            Commission Settings
          </button>

          <button
            type="button"
            onClick={exportCsv}
            disabled={filtered.length === 0}
            className="inline-flex h-10 items-center gap-2 bg-[#D4AF37] px-4 text-xs font-bold text-black disabled:opacity-50"
          >
            <Download size={15} />
            Export
          </button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'All Influencers', value: stats.all, icon: Users },
          { label: 'Pending Approval', value: stats.pending, icon: Clock },
          { label: 'Approved', value: stats.approved, icon: Check },
          { label: 'Rejected', value: stats.rejected, icon: X },
        ].map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className="border border-neutral-200 bg-white p-4 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-neutral-500">
                {label}
              </p>
              <Icon size={17} className="text-neutral-400" />
            </div>

            <p className="mt-3 text-2xl font-black">
              {value.toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      <section className="border border-neutral-200 bg-white shadow-sm">
        <div className="border-b border-neutral-200 px-4 pt-4 sm:px-5">
          <div className="flex flex-wrap gap-5">
            {[
              {
                id: 'ALL' as const,
                label: 'All Influencers',
                count: stats.all,
              },
              {
                id: 'PENDING' as const,
                label: 'Pending Approval',
                count: stats.pending,
              },
              {
                id: 'ACTIVE' as const,
                label: 'Approved',
                count: stats.approved,
              },
              {
                id: 'REJECTED' as const,
                label: 'Rejected',
                count: stats.rejected,
              },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilter(tab.id)}
                className={`border-b-2 pb-3 text-xs font-bold transition ${
                  filter === tab.id
                    ? 'border-[#D4AF37] text-neutral-950'
                    : 'border-transparent text-neutral-500 hover:text-neutral-900'
                }`}
              >
                {tab.label}
                <span className="ml-1 text-neutral-400">
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <label className="flex h-10 w-full max-w-md items-center gap-2 border border-neutral-200 px-3">
            <Search size={15} className="text-neutral-400" />

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search influencers, email, or handle..."
              className="min-w-0 flex-1 text-sm outline-none"
            />
          </label>

          <select
            aria-label="Filter influencer status"
            value={filter}
            onChange={(event) =>
              setFilter(event.target.value as InfluencerStatus)
            }
            className="h-10 border border-neutral-200 bg-white px-3 text-xs"
          >
            <option value="ALL">All statuses</option>
            <option value="PENDING">Pending approval</option>
            <option value="ACTIVE">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>

        {error ? (
          <div className="p-8 text-sm text-red-700">
            {error}
          </div>
        ) : loading ? (
          <div className="p-12 text-center text-sm text-neutral-500">
            Loading influencers...
          </div>
        ) : pageRecords.length === 0 ? (
          <div className="p-12 text-center">
            <Users size={28} className="mx-auto text-neutral-300" />

            <p className="mt-3 text-sm font-semibold text-neutral-700">
              No influencers found
            </p>

            <p className="mt-1 text-xs text-neutral-500">
              Try a different search or status filter.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px] text-left text-xs">
              <thead className="bg-neutral-50 text-[10px] uppercase tracking-wide text-neutral-500">
                <tr>
                  {[
                    'Influencer',
                    'Email',
                    'Status',
                    'Total Referrals',
                    'Total Sales (XAF)',
                    'Commission Earned (XAF)',
                    'Actions',
                  ].map((heading) => (
                    <th
                      key={heading}
                      className="whitespace-nowrap px-4 py-4 font-semibold sm:px-5"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-neutral-100">
                {pageRecords.map((record) => (
                  <tr
                    key={record.id}
                    className="hover:bg-neutral-50/70"
                  >
                    <td className="px-4 py-4 sm:px-5">
                      <div className="flex items-center gap-3">
                        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-neutral-100 text-sm font-bold text-neutral-600">
                          {fullName(record).slice(0, 1).toUpperCase()}
                        </div>

                        <div>
                          <p className="font-bold text-neutral-900">
                            {fullName(record)}
                          </p>

                          <p className="mt-1 text-[11px] text-neutral-500">
                            {socialHandle(record)}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-4 text-neutral-600 sm:px-5">
                      {record.profile?.email || 'â€”'}
                    </td>

                    <td className="px-4 py-4 sm:px-5">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold ${statusStyle(record.status)}`}
                      >
                        {statusLabel(record.status)}
                      </span>
                    </td>

                    <td className="px-4 py-4 text-neutral-700 sm:px-5">
                      {performanceLoading
                        ? 'â€¦'
                        : performance[record.id]
                          ? performance[record.id].referrals.toLocaleString('en-US')
                          : 'â€”'}
                    </td>

                    <td className="px-4 py-4 text-neutral-700 sm:px-5">
                      {performanceLoading
                        ? 'â€¦'
                        : performance[record.id]
                          ? money(performance[record.id].sales)
                          : 'â€”'}
                    </td>

                    <td className="px-4 py-4 text-neutral-700 sm:px-5">
                      {performanceLoading
                        ? 'â€¦'
                        : performance[record.id]
                          ? money(performance[record.id].commission)
                          : 'â€”'}
                    </td>

                    <td className="px-4 py-4 sm:px-5">
                      <button
                        type="button"
                        onClick={() => void openDetails(record)}
                        className="inline-flex items-center gap-1.5 border border-neutral-300 px-3 py-2 text-[11px] font-bold hover:border-[#D4AF37]"
                      >
                        <Eye size={14} />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <footer className="flex items-center justify-between border-t border-neutral-100 px-4 py-3 text-xs text-neutral-500 sm:px-5">
          <span>
            Showing {filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}
            {'â€“'}
            {Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Previous page"
              disabled={page <= 1}
              onClick={() =>
                setPage((current) => Math.max(1, current - 1))
              }
              className="border border-neutral-200 p-2 disabled:opacity-40"
            >
              <ChevronLeft size={14} />
            </button>

            <span>
              {page} / {totalPages}
            </span>

            <button
              type="button"
              aria-label="Next page"
              disabled={page >= totalPages}
              onClick={() =>
                setPage((current) => Math.min(totalPages, current + 1))
              }
              className="border border-neutral-200 p-2 disabled:opacity-40"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </footer>
      </section>

      {selected && (
        <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/50 p-4">
          <section className="my-6 max-h-[90vh] w-full max-w-2xl overflow-y-auto border border-neutral-200 bg-white shadow-xl">
            <header className="sticky top-0 flex items-center justify-between border-b border-neutral-200 bg-white px-5 py-4">
              <div>
                <h2 className="text-lg font-black">
                  Influencer details
                </h2>

                <p className="mt-1 text-xs text-neutral-500">
                  {selected.profile?.email || selected.id}
                </p>
              </div>

              <button
                type="button"
                aria-label="Close details"
                onClick={() => setSelected(null)}
              >
                <X size={19} />
              </button>
            </header>

            <div className="space-y-5 p-5">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="border border-neutral-200 p-3">
                  <p className="text-[10px] uppercase tracking-wide text-neutral-500">
                    Influencer
                  </p>

                  <p className="mt-1 text-sm font-bold">
                    {fullName(selected)}
                  </p>

                  <p className="mt-1 text-xs text-neutral-500">
                    {socialHandle(selected)}
                  </p>
                </div>

                <div className="border border-neutral-200 p-3">
                  <p className="text-[10px] uppercase tracking-wide text-neutral-500">
                    Referral code
                  </p>

                  <p className="mt-1 text-sm font-bold">
                    {selected.referralCode || 'â€”'}
                  </p>

                  <p className="mt-1 text-xs text-neutral-500">
                    Status: {statusLabel(selected.status)}
                  </p>
                </div>
              </div>

              <section>
                <h3 className="text-sm font-bold">
                  Application information
                </h3>

                <dl className="mt-3 grid gap-3 text-xs sm:grid-cols-2">
                  {[
                    ['Phone', selected.profile?.phone],
                    [
                      'Location',
                      [
                        selected.profile?.city,
                        selected.profile?.country,
                      ].filter(Boolean).join(', '),
                    ],
                    ['Occupation', selected.profile?.occupation],
                    ['Bio', selected.profile?.bio],
                    ['Application note', selected.profile?.applicationNote],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="border border-neutral-100 p-3"
                    >
                      <dt className="text-neutral-500">
                        {label}
                      </dt>

                      <dd className="mt-1 whitespace-pre-wrap font-medium text-neutral-800">
                        {value || 'â€”'}
                      </dd>
                    </div>
                  ))}
                </dl>
              </section>

              {selected.status?.toUpperCase() === 'PENDING' && (
                <label className="block text-xs font-semibold">
                  Application decision

                  <select
                    value={decision}
                    onChange={(event) => setDecision(event.target.value)}
                    className="mt-1 block w-full border border-neutral-300 bg-white px-3 py-2.5 text-sm"
                  >
                    <option value="">No decision</option>
                    <option value="APPROVED">Approve application</option>
                    <option value="REJECTED">Reject application</option>
                  </select>
                </label>
              )}

              <section className="border-t border-neutral-200 pt-4">
                <h3 className="text-sm font-bold">
                  Commission configuration
                </h3>

                <p className="mt-1 text-xs text-neutral-500">
                  Rate changes affect future eligible commissions.
                </p>

                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <label className="text-xs font-semibold">
                    Commission rate (%)

                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={commissionRate}
                      onChange={(event) =>
                        setCommissionRate(event.target.value)
                      }
                      className="mt-1 block w-full border border-neutral-300 px-3 py-2.5 text-sm"
                    />
                  </label>

                  <label className="text-xs font-semibold">
                    Customer discount (%)

                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={discountRate}
                      onChange={(event) =>
                        setDiscountRate(event.target.value)
                      }
                      className="mt-1 block w-full border border-neutral-300 px-3 py-2.5 text-sm"
                    />
                  </label>
                </div>
              </section>

              <section className="border-t border-neutral-200 pt-4">
                <h3 className="text-sm font-bold">
                  Performance summary
                </h3>

                {historyLoading ? (
                  <p className="mt-3 text-xs text-neutral-500">
                    Loading referral and commission history...
                  </p>
                ) : (
                  <>
                    <div className="mt-3 grid gap-3 sm:grid-cols-3">
                      <div className="border border-neutral-200 p-3">
                        <ShoppingBag size={16} className="text-neutral-500" />

                        <p className="mt-2 text-[10px] text-neutral-500">
                          Referrals
                        </p>

                        <p className="mt-1 text-lg font-black">
                          {referrals.length}
                        </p>
                      </div>

                      <div className="border border-neutral-200 p-3">
                        <Wallet size={16} className="text-neutral-500" />

                        <p className="mt-2 text-[10px] text-neutral-500">
                          Sales (XAF)
                        </p>

                        <p className="mt-1 text-lg font-black">
                          {money(salesTotal)}
                        </p>
                      </div>

                      <div className="border border-neutral-200 p-3">
                        <Wallet size={16} className="text-neutral-500" />

                        <p className="mt-2 text-[10px] text-neutral-500">
                          Commission records (XAF)
                        </p>

                        <p className="mt-1 text-lg font-black">
                          {money(earnedTotal)}
                        </p>
                      </div>
                    </div>

                    <p className="mt-2 text-[10px] text-neutral-500">
                      Commission total includes all recorded commission
                      statuses; it is not a payout balance.
                    </p>
                  </>
                )}
              </section>

              {actionError && (
                <p role="alert" className="text-xs text-red-700">
                  {actionError}
                </p>
              )}

              <footer className="flex flex-wrap justify-end gap-2 border-t border-neutral-200 pt-4">
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="border border-neutral-300 px-4 py-2.5 text-xs font-bold"
                >
                  Close
                </button>

                <button
                  type="button"
                  disabled={working}
                  onClick={() => void saveInfluencer()}
                  className="inline-flex items-center gap-2 bg-[#D4AF37] px-4 py-2.5 text-xs font-bold text-black disabled:opacity-50"
                >
                  <Check size={14} />
                  {working ? 'Saving...' : 'Save changes'}
                </button>
              </footer>
            </div>
          </section>
        </div>
      )}

      {settingsOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4">
          <section className="w-full max-w-md border border-neutral-200 bg-white shadow-xl">
            <header className="flex items-center justify-between border-b border-neutral-200 px-5 py-4">
              <h2 className="font-black">
                Commission settings
              </h2>

              <button
                type="button"
                aria-label="Close commission settings"
                disabled={settingsSaving}
                onClick={() => setSettingsOpen(false)}
                className="disabled:opacity-50"
              >
                <X size={18} />
              </button>
            </header>

            <div className="space-y-4 p-5">
              <p className="text-xs leading-5 text-neutral-600">
                Set the default commission and customer discount for new influencer
                registrations. Existing influencers&apos; rates will not be changed.
              </p>

              {settingsLoading ? (
                <p className="text-xs text-neutral-500">
                  Loading saved settings...
                </p>
              ) : null}

              {settingsMessage ? (
                <p
                  role="status"
                  className="text-xs leading-5 text-neutral-700"
                >
                  {settingsMessage}
                </p>
              ) : null}

              <label className="block text-xs font-semibold">
                Default commission rate (%)

                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  disabled={settingsLoading || settingsSaving}
                  value={defaultCommission}
                  onChange={(event) =>
                    setDefaultCommission(event.target.value)
                  }
                  className="mt-1 block w-full border border-neutral-300 px-3 py-2.5 text-sm disabled:opacity-50"
                />
              </label>

              <label className="block text-xs font-semibold">
                Default customer discount (%)

                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  disabled={settingsLoading || settingsSaving}
                  value={defaultDiscount}
                  onChange={(event) =>
                    setDefaultDiscount(event.target.value)
                  }
                  className="mt-1 block w-full border border-neutral-300 px-3 py-2.5 text-sm disabled:opacity-50"
                />
              </label>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  disabled={settingsSaving}
                  onClick={() => setSettingsOpen(false)}
                  className="border border-neutral-300 px-4 py-2 text-xs font-bold disabled:opacity-50"
                >
                  Close
                </button>

                <button
                  type="button"
                  disabled={settingsSaving || settingsLoading}
                  onClick={() => void saveDefaultSettings()}
                  className="bg-[#D4AF37] px-4 py-2 text-xs font-bold text-black disabled:opacity-50"
                >
                  {settingsSaving ? 'Saving...' : 'Save settings'}
                </button>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
