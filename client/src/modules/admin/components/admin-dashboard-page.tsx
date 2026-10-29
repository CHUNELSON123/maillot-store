'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  Boxes,
  CalendarDays,
  CircleDollarSign,
  ClipboardList,
  CreditCard,
  Package,
  Users,
} from 'lucide-react';

import { adminService } from '../services/admin.service';
import { AdminDashboardSummary } from '../types/admin.types';

const number = new Intl.NumberFormat('en');
const money = new Intl.NumberFormat('fr-CM', {
  maximumFractionDigits: 0,
});
const compactMoney = new Intl.NumberFormat('en', {
  notation: 'compact',
  maximumFractionDigits: 1,
});

const dateValue = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

function resolveImageUrl(imageUrl: string | null) {
  if (!imageUrl) return null;
  if (imageUrl.startsWith('http')) return imageUrl;
  if (!imageUrl.startsWith('/uploads')) return imageUrl;

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!apiUrl) return imageUrl;

  try {
    return `${new URL(apiUrl).origin}${imageUrl}`;
  } catch {
    return imageUrl;
  }
}

function Change({ value }: { value: number | null }) {
  if (value === null) {
    return (
      <span className="text-[10px] text-neutral-400">
        No previous-period baseline
      </span>
    );
  }

  const positive = value >= 0;
  const Icon = positive ? ArrowUpRight : ArrowDownRight;

  return (
    <span
      className={`inline-flex items-center gap-0.5 text-[10px] font-semibold ${
        positive ? 'text-green-700' : 'text-red-600'
      }`}
    >
      <Icon size={12} />
      {positive ? '+' : ''}
      {value}%
    </span>
  );
}

function SalesChart({
  points,
}: {
  points: AdminDashboardSummary['salesOverview'];
}) {
  const chart = useMemo(() => {
    if (!points.length) {
      return {
        current: '',
        previous: '',
        labels: [] as Array<{ x: number; label: string }>,
        axisMax: 1000,
      };
    }

    const maxValue = Math.max(
      0,
      ...points.flatMap((point) => [
        point.current,
        point.previous,
      ]),
    );

    // Keep the chart readable when sales are zero or relatively small.
    const axisMax =
      maxValue <= 1000
        ? 1000
        : Math.ceil(maxValue / 1000) * 1000;

    const x = (index: number) =>
      points.length === 1
        ? 326
        : 48 + (index * 540) / (points.length - 1);

    const y = (value: number) =>
      188 - (Math.max(0, value) / axisMax) * 150;

    const path = (key: 'current' | 'previous') =>
      points
        .map(
          (point, index) =>
            `${index === 0 ? 'M' : 'L'} ${x(index)} ${y(point[key])}`,
        )
        .join(' ');

    const stride = Math.max(1, Math.ceil(points.length / 7));

    const labels = points
      .map((point, index) => ({
        x: x(index),
        label: point.label,
      }))
      .filter(
        (_, index) =>
          index % stride === 0 || index === points.length - 1,
      );

    return {
      current: path('current'),
      previous: path('previous'),
      labels,
      axisMax,
    };
  }, [points]);

  if (!points.length) {
    return (
      <div className="grid h-64 place-items-center text-sm text-neutral-500">
        No sales data in this date range.
      </div>
    );
  }

  return (
    <div className="w-full min-w-0 overflow-hidden">
      <svg
        viewBox="0 0 640 240"
        role="img"
        aria-label="Confirmed sales comparison for the selected and previous periods"
        className="h-64 w-full"
      >
        {[0, 1, 2, 3].map((line) => {
          const y = 38 + line * 50;
          const value = Math.round(
            (chart.axisMax * (3 - line)) / 3,
          );

          return (
            <g key={line}>
              <line
                x1="42"
                x2="610"
                y1={y}
                y2={y}
                stroke="#e5e7eb"
                strokeDasharray="3 4"
              />
              <text
                x="3"
                y={y + 4}
                fill="#737373"
                fontSize="10"
              >
                {compactMoney.format(value)}
              </text>
            </g>
          );
        })}

        <path
          d={chart.previous}
          fill="none"
          stroke="#9ca3af"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <path
          d={chart.current}
          fill="none"
          stroke="#f59e0b"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {points.map((point, index) => {
          const x =
            points.length === 1
              ? 326
              : 48 + (index * 540) / (points.length - 1);

          const yCurrent =
            188 -
            (Math.max(0, point.current) / chart.axisMax) * 150;

          const yPrevious =
            188 -
            (Math.max(0, point.previous) / chart.axisMax) * 150;

          return (
            <g key={`${point.label}-${index}`}>
              <circle
                cx={x}
                cy={yCurrent}
                r="4"
                fill="#f59e0b"
              >
                <title>
                  {point.label}: {money.format(point.current)} XAF
                  selected period
                </title>
              </circle>

              <circle
                cx={x}
                cy={yPrevious}
                r="4"
                fill="#9ca3af"
              >
                <title>
                  {point.label}: {money.format(point.previous)} XAF
                  previous period
                </title>
              </circle>
            </g>
          );
        })}

        {chart.labels.map(({ x, label }) => (
          <text
            key={`${x}-${label}`}
            x={x}
            y="218"
            textAnchor="middle"
            fill="#737373"
            fontSize="10"
          >
            {label}
          </text>
        ))}
      </svg>
    </div>
  );
}

const activityIcon = {
  order: ClipboardList,
  payment: CreditCard,
  influencer: Users,
  inventory: Boxes,
} as const;

const paymentStyles: Record<string, string> = {
  PAID: 'bg-green-100 text-green-800',
  PENDING: 'bg-amber-100 text-amber-800',
  FAILED: 'bg-red-100 text-red-800',
  REFUNDED: 'bg-neutral-100 text-neutral-700',
  PROCESSING: 'bg-blue-100 text-blue-800',
};

function formatStatus(status: string | null) {
  if (!status) return 'Not recorded';

  return status
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

export function AdminDashboardPage() {
  const [summary, setSummary] =
    useState<AdminDashboardSummary | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAllActivities, setShowAllActivities] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    const end = new Date();
    const start = new Date(end);

    start.setDate(start.getDate() - 6);

    setStartDate(dateValue(start));
    setEndDate(dateValue(end));
  }, []);

  useEffect(() => {
    if (!startDate || !endDate) return;

    if (startDate > endDate) {
      setError('Start date must be on or before end date.');
      setLoading(false);
      return;
    }

    let cancelled = false;

    setLoading(true);
    setError('');

    adminService
      .getDashboard(startDate, endDate)
      .then((result) => {
        if (!cancelled) {
          setSummary(result);
        }
      })
      .catch((cause: unknown) => {
        if (!cancelled) {
          setError(
            cause instanceof Error
              ? cause.message
              : 'Could not load dashboard data.',
          );
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [startDate, endDate]);

  const cards = summary
    ? [
        {
          label: 'Total Sales (XAF)',
          value: money.format(summary.totalSales),
          change: summary.changes.totalSales,
          icon: CircleDollarSign,
          accent: 'text-orange-600',
          detail: 'Confirmed sales in selected period',
        },
        {
          label: 'Total Orders',
          value: number.format(summary.totalOrders),
          change: summary.changes.totalOrders,
          icon: ClipboardList,
          accent: 'text-amber-700',
          detail: 'Orders in selected period',
        },
        {
          label: 'Total Customers',
          value: number.format(summary.totalCustomers),
          change: summary.changes.totalCustomers,
          icon: Users,
          accent: 'text-blue-600',
          detail: 'Customers registered in selected period',
        },
        {
          label: 'Total Influencers',
          value: number.format(summary.totalInfluencers),
          change: summary.changes.totalInfluencers,
          icon: Users,
          accent: 'text-orange-600',
          detail: 'Influencers registered in selected period',
        },
        {
          label: 'Low Stock Items',
          value: number.format(summary.lowStockItems),
          change: null,
          icon: Boxes,
          accent: 'text-red-600',
          detail: 'At or below stock threshold',
        },
      ]
    : [];

  return (
    <div className="mx-auto max-w-[1500px] space-y-5">
      {/* Dashboard heading and date filter */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs text-neutral-500">
            Administration / Dashboard
          </p>
          <h1 className="mt-1 text-2xl font-black tracking-tight">
            Welcome back, Admin! 👋
          </h1>
          <p className="mt-1 text-sm text-neutral-600">
            Here&apos;s what&apos;s happening with your store today.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 rounded border border-neutral-200 bg-white p-2 shadow-sm">
          <CalendarDays
            size={16}
            className="shrink-0 text-neutral-500"
          />

          <label className="sr-only" htmlFor="dashboard-start-date">
            Start date
          </label>
          <input
            id="dashboard-start-date"
            type="date"
            value={startDate}
            max={endDate || dateValue(new Date())}
            onChange={(event) => setStartDate(event.target.value)}
            className="min-w-0 bg-transparent text-xs outline-none"
          />

          <span className="text-neutral-400">–</span>

          <label className="sr-only" htmlFor="dashboard-end-date">
            End date
          </label>
          <input
            id="dashboard-end-date"
            type="date"
            value={endDate}
            min={startDate}
            max={dateValue(new Date())}
            onChange={(event) => setEndDate(event.target.value)}
            className="min-w-0 bg-transparent text-xs outline-none"
          />
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="flex items-start justify-between gap-3 border border-red-200 bg-red-50 p-3 text-sm text-red-700"
        >
          <span>{error}</span>
          <button
            type="button"
            onClick={() => {
              if (startDate && endDate) {
                setStartDate('');
                setTimeout(() => setStartDate(startDate), 0);
              }
            }}
            className="shrink-0 font-semibold underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* KPI cards */}
      <section
        aria-label="Store metrics"
        className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5"
      >
        {loading && !summary
          ? Array.from({ length: 5 }, (_, index) => (
              <div
                key={index}
                className="h-32 animate-pulse border border-neutral-200 bg-white"
              />
            ))
          : cards.map(
              ({
                label,
                value,
                change,
                icon: Icon,
                accent,
                detail,
              }) => (
                <article
                  key={label}
                  className="min-w-0 border border-neutral-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-medium text-neutral-600">
                      {label}
                    </span>
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-neutral-50">
                      <Icon size={17} className={accent} />
                    </span>
                  </div>

                  <strong className="mt-2 block break-words text-2xl font-black tracking-tight text-neutral-950">
                    {value}
                  </strong>

                  <div className="mt-1 flex flex-wrap items-center gap-1">
                    <Change value={change} />
                    {change !== null && (
                      <span className="text-[10px] text-neutral-400">
                        vs previous period
                      </span>
                    )}
                  </div>

                  <p className="mt-2 text-[10px] leading-4 text-neutral-500">
                    {detail}
                  </p>
                </article>
              ),
            )}
      </section>

      {/* Sales chart and recent orders */}
      <section className="grid min-w-0 gap-4 xl:grid-cols-[1.15fr_1fr]">
        <article className="min-w-0 border border-neutral-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="font-bold text-neutral-950">
                Sales Overview (XAF)
              </h2>
              <p className="mt-1 text-[11px] text-neutral-500">
                Confirmed sales compared with the previous period.
              </p>
            </div>

            <div className="flex flex-wrap gap-3 text-[10px]">
              <span className="inline-flex items-center gap-1.5">
                <i className="h-2 w-2 rounded-full bg-amber-500" />
                Selected period
              </span>
              <span className="inline-flex items-center gap-1.5 text-neutral-500">
                <i className="h-2 w-2 rounded-full bg-neutral-400" />
                Previous period
              </span>
            </div>
          </div>

          {loading && !summary ? (
            <div className="mt-4 h-64 animate-pulse bg-neutral-50" />
          ) : summary ? (
            <SalesChart points={summary.salesOverview} />
          ) : (
            <div className="grid h-64 place-items-center text-center text-sm text-neutral-500">
              Dashboard data could not be loaded.
            </div>
          )}
        </article>

        <article className="min-w-0 border border-neutral-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <h2 className="font-bold text-neutral-950">
                Recent Orders
              </h2>
              <p className="mt-1 text-[11px] text-neutral-500">
                Latest orders across all dates.
              </p>
            </div>

            <Link
              href="/admin/orders"
              className="shrink-0 text-xs font-semibold text-blue-700 hover:underline"
            >
              View all
            </Link>
          </div>

          {loading && !summary ? (
            <p className="py-10 text-center text-sm text-neutral-500">
              Loading orders…
            </p>
          ) : !summary?.recentOrders.length ? (
            <div className="flex min-h-40 flex-col items-center justify-center gap-2 text-center">
              <Package size={24} className="text-neutral-300" />
              <p className="text-sm text-neutral-500">
                No orders have been recorded yet.
              </p>
            </div>
          ) : (
            <div className="w-full min-w-0">
              <table className="w-full table-fixed text-left text-xs">
                <thead className="text-[10px] uppercase text-neutral-500">
                  <tr>
                    <th className="w-[34%] py-2 pr-2 font-medium">
                      Order #
                    </th>
                    <th className="w-[24%] py-2 pr-2 font-medium">
                      Customer
                    </th>
                    <th className="w-[23%] py-2 text-right font-medium">
                      Total
                    </th>
                    <th className="w-[19%] py-2 pl-2 text-right font-medium">
                      Payment
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-neutral-100">
                  {summary.recentOrders.map((order) => {
                    const status = order.paymentStatus ?? '';
                    const badgeStyle =
                      paymentStyles[status] ??
                      'bg-neutral-100 text-neutral-700';

                    return (
                      <tr key={order.id}>
                        <td
                          className="truncate py-3 pr-2 font-semibold"
                          title={order.orderNumber}
                        >
                          #{order.orderNumber}
                        </td>
                        <td
                          className="truncate py-3 pr-2"
                          title={order.customerName}
                        >
                          {order.customerName}
                        </td>
                        <td className="whitespace-nowrap py-3 text-right">
                          {money.format(order.totalAmount)}
                        </td>
                        <td className="py-3 pl-2 text-right">
                          <span
                            title={formatStatus(order.paymentStatus)}
                            className={`inline-block max-w-full truncate rounded px-1.5 py-1 text-[9px] font-semibold ${badgeStyle}`}
                          >
                            {formatStatus(order.paymentStatus)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </article>
      </section>

      {/* Low stock and recent activity */}
      <section className="grid min-w-0 gap-4 xl:grid-cols-2">
        <article className="min-w-0 border border-neutral-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <h2 className="font-bold text-neutral-950">
                Low Stock Alerts
              </h2>
              <p className="mt-1 text-[11px] text-neutral-500">
                Variants at or below their configured minimum.
              </p>
            </div>

            <Link
              href="/admin/inventory"
              className="shrink-0 text-xs font-semibold text-blue-700 hover:underline"
            >
              View all
            </Link>
          </div>

          {loading && !summary ? (
            <p className="py-8 text-center text-sm text-neutral-500">
              Loading inventory…
            </p>
          ) : !summary?.lowStockAlerts.length ? (
            <div className="flex min-h-36 flex-col items-center justify-center gap-2 text-center">
              <Package size={26} className="text-neutral-300" />
              <p className="text-sm font-medium text-neutral-700">
                No low stock items.
              </p>
              <p className="text-xs text-neutral-500">
                Stock alerts will appear here when inventory reaches its configured minimum.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-neutral-100">
              {summary.lowStockAlerts.map((item) => {
                const imageUrl = resolveImageUrl(item.imageUrl);

                return (
                  <li
                    key={item.id}
                    className="flex items-center justify-between gap-3 py-3"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="relative grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded bg-neutral-100">
                        {imageUrl ? (
                          <Image
                            src={imageUrl}
                            alt={item.productName}
                            fill
                            sizes="40px"
                            unoptimized
                            className="object-cover"
                          />
                        ) : (
                          <Package
                            size={17}
                            className="text-neutral-500"
                          />
                        )}
                      </span>

                      <div className="min-w-0">
                        <p className="truncate text-xs font-semibold">
                          {item.productName}
                        </p>
                        <p className="truncate text-[10px] text-neutral-500">
                          {item.variantLabel} · {item.sku}
                        </p>
                        <p className="text-[10px] text-neutral-400">
                          Minimum stock: {item.minStock}
                        </p>
                      </div>
                    </div>

                    <span className="shrink-0 text-xs font-bold text-orange-700">
                      {item.quantity} left
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </article>

        <article className="min-w-0 border border-neutral-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <h2 className="font-bold text-neutral-950">
                Recent Activities
              </h2>
              <p className="mt-1 text-[11px] text-neutral-500">
                Recent orders, payments, applications, and stock movements.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setShowAllActivities((current) => !current)
              }
              className="shrink-0 text-xs font-semibold text-blue-700 hover:underline"
            >
              {showAllActivities ? 'Show less' : 'View all'}
            </button>
          </div>

          {loading && !summary ? (
            <p className="py-8 text-center text-sm text-neutral-500">
              Loading activity…
            </p>
          ) : !summary?.recentActivities.length ? (
            <div className="flex min-h-36 flex-col items-center justify-center gap-2 text-center">
              <Activity size={26} className="text-neutral-300" />
              <p className="text-sm text-neutral-500">
                No recent activities.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-neutral-100">
              {summary.recentActivities
                .slice(0, showAllActivities ? 20 : 4)
                .map((activity) => {
                  const Icon = activityIcon[activity.type];

                  return (
                    <li
                      key={activity.id}
                      className="flex items-start justify-between gap-3 py-3"
                    >
                      <span className="flex min-w-0 items-start gap-2 text-xs">
                        <Icon
                          size={15}
                          className="mt-0.5 shrink-0 text-[#b4830b]"
                        />
                        <span className="break-words">
                          {activity.message}
                        </span>
                      </span>

                      <time
                        className="shrink-0 text-right text-[10px] text-neutral-500"
                        dateTime={activity.createdAt}
                        title={new Date(
                          activity.createdAt,
                        ).toLocaleString()}
                      >
                        {new Date(
                          activity.createdAt,
                        ).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                        })}
                        <span className="block">
                          {new Date(
                            activity.createdAt,
                          ).toLocaleTimeString('en-GB', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </time>
                    </li>
                  );
                })}
            </ul>
          )}
        </article>
      </section>
    </div>
  );
}