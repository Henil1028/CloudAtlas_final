import React, { useState, useMemo, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';
import {
  FileText, Download, Calendar, TrendingUp, DollarSign,
  FileSpreadsheet, AlertTriangle
} from 'lucide-react';
import { ConsoleLayout } from '../components/console/ConsoleLayout';
import { ChartCard } from '../components/console/ChartCard';
import { PageHeader } from '../components/console/PageHeader';
import api from '../services/api';

/* ═══════════════════════════════════════════════════════════════
   SINGLE SOURCE OF TRUTH — raw cost records
   All monthly / quarterly / yearly views are derived from this.
   ═══════════════════════════════════════════════════════════════ */
const RAW_DATA = [
  // ── 2021 ──
  { date: '2021-01', provider: 'AWS', cost: 38000 },
  { date: '2021-01', provider: 'Azure', cost: 18000 },
  { date: '2021-01', provider: 'GCP', cost: 9000 },
  { date: '2021-04', provider: 'AWS', cost: 40000 },
  { date: '2021-04', provider: 'Azure', cost: 19500 },
  { date: '2021-04', provider: 'GCP', cost: 9500 },
  { date: '2021-07', provider: 'AWS', cost: 42000 },
  { date: '2021-07', provider: 'Azure', cost: 20000 },
  { date: '2021-07', provider: 'GCP', cost: 10200 },
  { date: '2021-10', provider: 'AWS', cost: 43000 },
  { date: '2021-10', provider: 'Azure', cost: 21000 },
  { date: '2021-10', provider: 'GCP', cost: 10800 },
  // ── 2022 ──
  { date: '2022-01', provider: 'AWS', cost: 45000 },
  { date: '2022-01', provider: 'Azure', cost: 22000 },
  { date: '2022-01', provider: 'GCP', cost: 11000 },
  { date: '2022-04', provider: 'AWS', cost: 48000 },
  { date: '2022-04', provider: 'Azure', cost: 24000 },
  { date: '2022-04', provider: 'GCP', cost: 12000 },
  { date: '2022-07', provider: 'AWS', cost: 50000 },
  { date: '2022-07', provider: 'Azure', cost: 26000 },
  { date: '2022-07', provider: 'GCP', cost: 13000 },
  { date: '2022-10', provider: 'AWS', cost: 52000 },
  { date: '2022-10', provider: 'Azure', cost: 27000 },
  { date: '2022-10', provider: 'GCP', cost: 13500 },
  // ── 2023 ──
  { date: '2023-01', provider: 'AWS', cost: 54000 },
  { date: '2023-01', provider: 'Azure', cost: 28000 },
  { date: '2023-01', provider: 'GCP', cost: 14000 },
  { date: '2023-04', provider: 'AWS', cost: 58000 },
  { date: '2023-04', provider: 'Azure', cost: 31000 },
  { date: '2023-04', provider: 'GCP', cost: 15500 },
  { date: '2023-07', provider: 'AWS', cost: 62000 },
  { date: '2023-07', provider: 'Azure', cost: 33000 },
  { date: '2023-07', provider: 'GCP', cost: 17000 },
  { date: '2023-10', provider: 'AWS', cost: 65000 },
  { date: '2023-10', provider: 'Azure', cost: 35000 },
  { date: '2023-10', provider: 'GCP', cost: 18000 },
  // ── 2024 ──
  { date: '2024-01', provider: 'AWS', cost: 68000 },
  { date: '2024-01', provider: 'Azure', cost: 37000 },
  { date: '2024-01', provider: 'GCP', cost: 19000 },
  { date: '2024-02', provider: 'AWS', cost: 70000 },
  { date: '2024-02', provider: 'Azure', cost: 38000 },
  { date: '2024-02', provider: 'GCP', cost: 19500 },
  { date: '2024-03', provider: 'AWS', cost: 72000 },
  { date: '2024-03', provider: 'Azure', cost: 39000 },
  { date: '2024-03', provider: 'GCP', cost: 20000 },
  { date: '2024-04', provider: 'AWS', cost: 71000 },
  { date: '2024-04', provider: 'Azure', cost: 38500 },
  { date: '2024-04', provider: 'GCP', cost: 19800 },
  { date: '2024-05', provider: 'AWS', cost: 74000 },
  { date: '2024-05', provider: 'Azure', cost: 40000 },
  { date: '2024-05', provider: 'GCP', cost: 20500 },
  { date: '2024-06', provider: 'AWS', cost: 76000 },
  { date: '2024-06', provider: 'Azure', cost: 41000 },
  { date: '2024-06', provider: 'GCP', cost: 21000 },
  { date: '2024-07', provider: 'AWS', cost: 78000 },
  { date: '2024-07', provider: 'Azure', cost: 42000 },
  { date: '2024-07', provider: 'GCP', cost: 22000 },
  { date: '2024-08', provider: 'AWS', cost: 77000 },
  { date: '2024-08', provider: 'Azure', cost: 41500 },
  { date: '2024-08', provider: 'GCP', cost: 21500 },
  { date: '2024-09', provider: 'AWS', cost: 80000 },
  { date: '2024-09', provider: 'Azure', cost: 43000 },
  { date: '2024-09', provider: 'GCP', cost: 22500 },
  { date: '2024-10', provider: 'AWS', cost: 82000 },
  { date: '2024-10', provider: 'Azure', cost: 44000 },
  { date: '2024-10', provider: 'GCP', cost: 23000 },
  { date: '2024-11', provider: 'AWS', cost: 84000 },
  { date: '2024-11', provider: 'Azure', cost: 45000 },
  { date: '2024-11', provider: 'GCP', cost: 23500 },
  { date: '2024-12', provider: 'AWS', cost: 86000 },
  { date: '2024-12', provider: 'Azure', cost: 46000 },
  { date: '2024-12', provider: 'GCP', cost: 24000 },
  // ── 2025 (current year, up to June) ──
  { date: '2025-01', provider: 'AWS', cost: 78000 },
  { date: '2025-01', provider: 'Azure', cost: 42000 },
  { date: '2025-01', provider: 'GCP', cost: 22000 },
  { date: '2025-02', provider: 'AWS', cost: 82000 },
  { date: '2025-02', provider: 'Azure', cost: 44000 },
  { date: '2025-02', provider: 'GCP', cost: 24000 },
  { date: '2025-03', provider: 'AWS', cost: 91000 },
  { date: '2025-03', provider: 'Azure', cost: 48000 },
  { date: '2025-03', provider: 'GCP', cost: 27000 },
  { date: '2025-04', provider: 'AWS', cost: 79000 },
  { date: '2025-04', provider: 'Azure', cost: 41000 },
  { date: '2025-04', provider: 'GCP', cost: 21000 },
  { date: '2025-05', provider: 'AWS', cost: 95000 },
  { date: '2025-05', provider: 'Azure', cost: 52000 },
  { date: '2025-05', provider: 'GCP', cost: 29000 },
  { date: '2025-06', provider: 'AWS', cost: 102000 },
  { date: '2025-06', provider: 'Azure', cost: 56000 },
  { date: '2025-06', provider: 'GCP', cost: 32000 },
];

/* ═══════════════════════════════════════════════════════════════
   HELPERS — aggregate from RAW_DATA
   ═══════════════════════════════════════════════════════════════ */
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function aggregateMonthly(data) {
  const map = {};
  data.forEach(({ date, provider, cost }) => {
    const [y, m] = date.split('-');
    const key = `${y}-${m}`;
    if (!map[key]) map[key] = { key, label: `${MONTH_NAMES[+m - 1]} ${y}`, aws: 0, azure: 0, gcp: 0 };
    map[key][provider.toLowerCase()] += cost;
  });
  return Object.values(map).sort((a, b) => a.key.localeCompare(b.key));
}

function aggregateQuarterly(data) {
  const map = {};
  data.forEach(({ date, provider, cost }) => {
    const [y, m] = date.split('-');
    const q = Math.ceil(+m / 3);
    const key = `${y}-Q${q}`;
    if (!map[key]) map[key] = { key, label: `Q${q} ${y}`, aws: 0, azure: 0, gcp: 0 };
    map[key][provider.toLowerCase()] += cost;
  });
  return Object.values(map).sort((a, b) => a.key.localeCompare(b.key));
}

function aggregateYearly(data) {
  const map = {};
  data.forEach(({ date, provider, cost }) => {
    const y = date.split('-')[0];
    if (!map[y]) map[y] = { key: y, label: y, aws: 0, azure: 0, gcp: 0 };
    map[y][provider.toLowerCase()] += cost;
  });
  return Object.values(map).sort((a, b) => a.key.localeCompare(b.key));
}

function sumRow(r) { return r.aws + r.azure + r.gcp; }

function fmt(v) {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(2)}M`;
  if (v >= 1000) return `$${(v / 1000).toFixed(0)}K`;
  return `$${v}`;
}

function pctChange(cur, prev) {
  if (!prev) return '+0.0%';
  const pct = ((cur - prev) / prev * 100).toFixed(1);
  return pct >= 0 ? `+${pct}%` : `${pct}%`;
}

/* ═══════════════════════════════════════════════════════════════
   CUSTOM TOOLTIP
   ═══════════════════════════════════════════════════════════════ */
const ReportsTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const total = payload.reduce((s, e) => s + e.value, 0);
  return (
    <div style={{
      background: '#0B1023', border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '12px', padding: '12px 16px',
      boxShadow: '0 12px 40px rgba(0,0,0,0.5)', minWidth: 160,
    }}>
      <p style={{ margin: '0 0 8px', fontSize: '12px', color: '#64748B', fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>{label}</p>
      {payload.map((entry, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: entry.color, flexShrink: 0 }} />
          <span style={{ fontSize: '12px', color: '#94A3B8', fontFamily: 'Inter', flex: 1 }}>{entry.name}</span>
          <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#F1F5F9', fontFamily: 'Space Grotesk, monospace' }}>
            {fmt(entry.value)}
          </span>
        </div>
      ))}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: '6px', paddingTop: '6px', display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '11px', color: '#64748B', fontFamily: 'Inter' }}>Total</span>
        <span style={{ fontSize: '12.5px', fontWeight: 800, color: '#8B5CF6', fontFamily: 'Space Grotesk, monospace' }}>{fmt(total)}</span>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   CUSTOM LEGEND
   ═══════════════════════════════════════════════════════════════ */
const ProviderLegend = () => (
  <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '12px' }}>
    {[
      { name: 'AWS', color: '#F59E0B' },
      { name: 'Azure', color: '#3B82F6' },
      { name: 'GCP', color: '#22C55E' },
    ].map(p => (
      <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <span style={{ width: 10, height: 10, borderRadius: '3px', background: p.color, opacity: 0.85 }} />
        <span style={{ fontSize: '11.5px', color: '#64748B', fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>{p.name}</span>
      </div>
    ))}
  </div>
);

/* ═══════════════════════════════════════════════════════════════
   DOWNLOAD BUTTON
   ═══════════════════════════════════════════════════════════════ */
const DownloadBtn = ({ label, icon: Icon, color }) => {
  const [isLoading, setIsLoading] = useState(false);
  const handleClick = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1500);
  };
  return (
    <button
      onClick={handleClick}
      style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        padding: '10px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: 600,
        background: `${color}12`, border: `1px solid ${color}25`,
        color, cursor: isLoading ? 'default' : 'pointer', fontFamily: 'Inter, sans-serif',
        transition: 'all 0.2s', width: '100%', justifyContent: 'center',
      }}
      onMouseEnter={e => { if (!isLoading) e.currentTarget.style.background = `${color}22`; }}
      onMouseLeave={e => { e.currentTarget.style.background = `${color}12`; }}
    >
      {isLoading ? (
        <span style={{
          width: '13px', height: '13px', border: `2px solid ${color}40`,
          borderTopColor: color, borderRadius: '50%',
          animation: 'spin-slow 0.6s linear infinite', display: 'inline-block',
        }} />
      ) : (
        <Icon size={14} />
      )}
      {isLoading ? 'Generating...' : label}
    </button>
  );
};

/* ═══════════════════════════════════════════════════════════════
   TABS CONFIG
   ═══════════════════════════════════════════════════════════════ */
const TABS = ['Monthly', 'Quarterly', 'Yearly'];

const TAB_CONFIG = {
  Monthly: {
    chartTitle: 'Monthly Cloud Spend',
    chartSubtitle: 'Cost breakdown by provider — last 6 months',
    badgeText: '6 Months',
    badgeColor: 'cyan',
    sliceCount: 6,
    periodLabel: 'month',
  },
  Quarterly: {
    chartTitle: 'Quarterly Cloud Spend',
    chartSubtitle: 'Cost breakdown by provider — last 4 quarters',
    badgeText: '4 Quarters',
    badgeColor: 'purple',
    sliceCount: 4,
    periodLabel: 'quarter',
  },
  Yearly: {
    chartTitle: 'Annual Cloud Spend',
    chartSubtitle: 'Cost breakdown by provider — last 5 years',
    badgeText: '5 Years',
    badgeColor: 'success',
    sliceCount: 5,
    periodLabel: 'year',
  },
};

/* ═══════════════════════════════════════════════════════════════
   REPORTS PAGE COMPONENT
   ═══════════════════════════════════════════════════════════════ */
export const ReportsPage = () => {
  const [activeTab, setActiveTab] = useState('Monthly');

  const [dataSummary, setDataSummary] = useState(null);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    api.get('/billing/summary')
      .then(res => {
        setDataSummary(res.data);
        setDataLoading(false);
      })
      .catch(err => {
        console.error(err);
        setDataLoading(false);
      });
  }, []);



  // ── Aggregate all views from single source ──
  const allMonthly = useMemo(() => aggregateMonthly(RAW_DATA), []);
  const allQuarterly = useMemo(() => aggregateQuarterly(RAW_DATA), []);
  const allYearly = useMemo(() => aggregateYearly(RAW_DATA), []);

  // ── Get sliced chart data for the active tab ──
  const { chartData, allData } = useMemo(() => {
    const cfg = TAB_CONFIG[activeTab];
    let all;
    if (activeTab === 'Monthly') all = allMonthly;
    else if (activeTab === 'Quarterly') all = allQuarterly;
    else all = allYearly;
    return { chartData: all.slice(-cfg.sliceCount), allData: all };
  }, [activeTab, allMonthly, allQuarterly, allYearly]);

  // ── Summary KPIs (always visible, not tab-dependent) ──
  const kpis = useMemo(() => {
    // This Month vs prior month
    const curMonth = allMonthly[allMonthly.length - 1];
    const prevMonth = allMonthly[allMonthly.length - 2];
    const curMonthTotal = curMonth ? sumRow(curMonth) : 0;
    const prevMonthTotal = prevMonth ? sumRow(prevMonth) : 0;

    // This Quarter vs prior quarter
    const curQ = allQuarterly[allQuarterly.length - 1];
    const prevQ = allQuarterly[allQuarterly.length - 2];
    const curQTotal = curQ ? sumRow(curQ) : 0;
    const prevQTotal = prevQ ? sumRow(prevQ) : 0;

    // This Year vs prior year
    const curY = allYearly[allYearly.length - 1];
    const prevY = allYearly[allYearly.length - 2];
    const curYTotal = curY ? sumRow(curY) : 0;
    const prevYTotal = prevY ? sumRow(prevY) : 0;

    return [
      { label: 'This Month', val: fmt(curMonthTotal), trend: pctChange(curMonthTotal, prevMonthTotal), icon: Calendar, color: '#06B6D4' },
      { label: 'This Quarter', val: fmt(curQTotal), trend: pctChange(curQTotal, prevQTotal), icon: TrendingUp, color: '#8B5CF6' },
      { label: 'This Year (Total)', val: fmt(curYTotal), trend: pctChange(curYTotal, prevYTotal), icon: DollarSign, color: '#22C55E' },
    ];
  }, [allMonthly, allQuarterly, allYearly]);

  // ── Report Summary (changes with active tab) ──
  const reportSummary = useMemo(() => {
    const totalSpend = chartData.reduce((s, r) => s + sumRow(r), 0);

    // Highest-spending provider
    const providerTotals = { AWS: 0, Azure: 0, GCP: 0 };
    chartData.forEach(r => { providerTotals.AWS += r.aws; providerTotals.Azure += r.azure; providerTotals.GCP += r.gcp; });
    const highestProvider = Object.entries(providerTotals).sort((a, b) => b[1] - a[1])[0];

    // Highest-spending period
    let highestPeriod = chartData[0];
    chartData.forEach(r => { if (sumRow(r) > sumRow(highestPeriod)) highestPeriod = r; });

    // % change for insight
    const lastTwo = chartData.slice(-2);
    let changeText = '';
    if (lastTwo.length === 2) {
      const prev = sumRow(lastTwo[0]);
      const cur = sumRow(lastTwo[1]);
      const pct = ((cur - prev) / prev * 100).toFixed(1);
      const direction = pct >= 0 ? 'increased' : 'decreased';
      // Find which provider changed the most
      const provDiffs = [
        { name: 'AWS', diff: Math.abs(lastTwo[1].aws - lastTwo[0].aws) },
        { name: 'Azure', diff: Math.abs(lastTwo[1].azure - lastTwo[0].azure) },
        { name: 'GCP', diff: Math.abs(lastTwo[1].gcp - lastTwo[0].gcp) },
      ].sort((a, b) => b.diff - a.diff);
      changeText = `Spend ${direction} ${Math.abs(pct)}% due to higher ${provDiffs[0].name} usage`;
    }

    const cfg = TAB_CONFIG[activeTab];

    return {
      totalSpend: fmt(totalSpend),
      highestProvider: `${highestProvider[0]} (${fmt(highestProvider[1])})`,
      highestPeriod: highestPeriod?.label || '—',
      insight: changeText,
      periodLabel: cfg.periodLabel,
    };
  }, [chartData, activeTab]);

  if (dataLoading) {
    return (
      <ConsoleLayout title="Reports">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
          <div style={{ width: '40px', height: '40px', border: '3px solid rgba(255,255,255,0.05)', borderTopColor: '#7C3AED', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        </div>
        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </ConsoleLayout>
    );
  }

  if (!dataLoading && (!dataSummary || dataSummary.totalRecords === 0)) {
    return (
      <ConsoleLayout title="Reports">
        <PageHeader
          title="Executive Cost Reports"
          subtitle="Generate, preview, and export executive billing summaries"
          icon={FileText}
          breadcrumb={['CloudAtlas AI', 'Reports']}
        />
        <div className="glass-card" style={{ padding: '40px', textAlign: 'center', marginTop: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
            <AlertTriangle size={48} color="#F59E0B" />
          </div>
          <h3 style={{ fontFamily: 'Outfit, sans-serif', color: '#F1F5F9', marginBottom: '8px', fontSize: '18px', fontWeight: 600 }}>No Cost Reports Found</h3>
          <p style={{ fontSize: '14px', color: '#94A3B8', maxWidth: '500px', margin: '0 auto 20px', lineHeight: 1.6 }}>
            Report builders require historical billing logs to compile monthly, quarterly, and annual spend aggregates.
          </p>
          <a href="/upload" style={{
            display: 'inline-block', padding: '10px 20px', borderRadius: '8px',
            background: 'linear-gradient(135deg, #7C3AED, #6D28D9)', color: '#fff',
            textDecoration: 'none', fontWeight: 600, fontSize: '13px'
          }}>
            Ingest CSV Dataset
          </a>
        </div>
      </ConsoleLayout>
    );
  }

  const cfg = TAB_CONFIG[activeTab];

  return (
    <ConsoleLayout title="Reports">
      <PageHeader
        title="Reports & Analytics"
        subtitle="Download comprehensive cloud spend reports in PDF and Excel formats"
        icon={FileText}
        iconColor="#3B82F6"
        breadcrumb={['CloudAtlas AI', 'Data', 'Reports']}
      />

      {/* ── Summary KPIs — always visible ── */}
      <div
        style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}
        className="reports-kpi-grid"
      >
        {kpis.map((k, i) => {
          const isPositive = k.trend.startsWith('+');
          return (
            <div
              key={i}
              className="kpi-card"
              style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', animationDelay: `${i * 100}ms` }}
            >
              <div>
                <div style={{ fontSize: '11px', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'Inter, sans-serif', marginBottom: '8px' }}>
                  {k.label}
                </div>
                <div style={{ fontFamily: 'Space Grotesk, monospace', fontWeight: 800, fontSize: '28px', color: k.color, lineHeight: 1 }}>
                  {k.val}
                </div>
                <div style={{
                  fontSize: '11.5px',
                  color: isPositive ? '#EF4444' : '#22C55E',
                  fontWeight: 600, marginTop: '6px', fontFamily: 'Inter, sans-serif',
                  display: 'flex', alignItems: 'center', gap: '3px',
                }}>
                  <span>{isPositive ? '↑' : '↓'}</span>
                  <span>{k.trend} vs prior period</span>
                </div>
              </div>
              <div style={{
                width: '44px', height: '44px', borderRadius: '12px',
                background: `${k.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: `1px solid ${k.color}20`,
              }}>
                <k.icon size={20} color={k.color} />
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Tab Switcher ── */}
      <div style={{
        display: 'flex', gap: '6px', marginBottom: '20px',
        borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '16px',
      }}>
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '9px 22px', borderRadius: '9px', fontSize: '13px', fontWeight: 600,
              cursor: 'pointer', fontFamily: 'Inter, sans-serif', transition: 'all 0.2s',
              background: activeTab === tab ? 'rgba(124,58,237,0.15)' : 'rgba(255,255,255,0.03)',
              border: activeTab === tab ? '1px solid rgba(124,58,237,0.3)' : '1px solid rgba(255,255,255,0.06)',
              color: activeTab === tab ? '#8B5CF6' : '#64748B',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ── Chart + Export Panel ── */}
      <div
        style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '20px' }}
        className="reports-main-grid"
      >
        {/* Chart */}
        <ChartCard
          title={cfg.chartTitle}
          subtitle={cfg.chartSubtitle}
          badge={{ text: cfg.badgeText, color: cfg.badgeColor }}
          minHeight={320}
        >
          <ResponsiveContainer width="100%" height={310}>
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="awsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F59E0B" stopOpacity={0.95} />
                  <stop offset="100%" stopColor="#F59E0B" stopOpacity={0.7} />
                </linearGradient>
                <linearGradient id="azureGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.95} />
                  <stop offset="100%" stopColor="#3B82F6" stopOpacity={0.7} />
                </linearGradient>
                <linearGradient id="gcpGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22C55E" stopOpacity={0.95} />
                  <stop offset="100%" stopColor="#22C55E" stopOpacity={0.7} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis
                dataKey="label"
                tick={{ fill: '#475569', fontSize: 11, fontFamily: 'Inter, sans-serif' }}
                axisLine={false} tickLine={false}
              />
              <YAxis
                tick={{ fill: '#475569', fontSize: 10, fontFamily: 'Inter, sans-serif' }}
                axisLine={false} tickLine={false}
                tickFormatter={v => v >= 1_000_000 ? `$${(v / 1_000_000).toFixed(1)}M` : `$${v / 1000}K`}
              />
              <Tooltip content={<ReportsTooltip />} cursor={{ fill: 'rgba(124,58,237,0.06)' }} />
              <Bar dataKey="aws" stackId="stack" fill="url(#awsGrad)" name="AWS" radius={[0, 0, 0, 0]} />
              <Bar dataKey="azure" stackId="stack" fill="url(#azureGrad)" name="Azure" radius={[0, 0, 0, 0]} />
              <Bar dataKey="gcp" stackId="stack" fill="url(#gcpGrad)" name="GCP" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <ProviderLegend />
        </ChartCard>

        {/* Right-side Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Export Panel */}
          <div className="glass-card" style={{ padding: '22px' }}>
            <div style={{
              fontFamily: 'Outfit, sans-serif', fontWeight: 600, fontSize: '15px',
              color: '#F1F5F9', marginBottom: '18px',
              display: 'flex', alignItems: 'center', gap: '8px',
            }}>
              <div style={{
                width: '28px', height: '28px', borderRadius: '8px',
                background: 'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(6,182,212,0.2))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '1px solid rgba(124,58,237,0.15)',
              }}>
                <Download size={13} color="#8B5CF6" />
              </div>
              Export {activeTab} Report
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <DownloadBtn label="Download PDF" icon={FileText} color="#EF4444" />
              <DownloadBtn label="Download Excel" icon={FileSpreadsheet} color="#22C55E" />
              <DownloadBtn label="Download CSV" icon={Download} color="#3B82F6" />
            </div>
          </div>

          {/* Report Summary */}
          <div className="glass-card" style={{ padding: '22px' }}>
            <div style={{
              fontFamily: 'Outfit, sans-serif', fontWeight: 600, fontSize: '15px',
              color: '#F1F5F9', marginBottom: '16px',
              display: 'flex', alignItems: 'center', gap: '8px',
            }}>
              <div style={{
                width: '28px', height: '28px', borderRadius: '8px',
                background: 'rgba(6,182,212,0.12)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '1px solid rgba(6,182,212,0.15)',
              }}>
                <TrendingUp size={13} color="#06B6D4" />
              </div>
              Report Summary
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
              {[
                { label: 'Total Spend', val: reportSummary.totalSpend },
                { label: 'Highest Provider', val: reportSummary.highestProvider },
                { label: `Highest ${reportSummary.periodLabel.charAt(0).toUpperCase() + reportSummary.periodLabel.slice(1)}`, val: reportSummary.highestPeriod },
              ].map((r, i) => (
                <div key={i} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.04)',
                }}>
                  <span style={{ fontSize: '12.5px', color: '#64748B', fontFamily: 'Inter, sans-serif' }}>{r.label}</span>
                  <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#F1F5F9', fontFamily: 'Space Grotesk, monospace', textAlign: 'right' }}>{r.val}</span>
                </div>
              ))}
            </div>

            {/* Insight */}
            {reportSummary.insight && (
              <div style={{
                marginTop: '14px', padding: '12px 14px',
                background: 'rgba(124,58,237,0.08)', borderRadius: '10px',
                borderLeft: '3px solid #7C3AED',
              }}>
                <div style={{ fontSize: '10px', fontWeight: 700, color: '#8B5CF6', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px', fontFamily: 'Inter, sans-serif' }}>
                  AI Insight
                </div>
                <div style={{ fontSize: '12.5px', color: '#94A3B8', lineHeight: 1.5, fontFamily: 'Inter, sans-serif' }}>
                  {reportSummary.insight}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Responsive ── */}
      <style>{`
        @media (max-width: 1024px) {
          .reports-kpi-grid { grid-template-columns: 1fr 1fr !important; }
          .reports-main-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 640px) {
          .reports-kpi-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </ConsoleLayout>
  );
};

export default ReportsPage;
