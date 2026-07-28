import React, { useState } from 'react';
import {
  BarChart, Bar, PieChart, Pie, Cell, Treemap,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { BarChart3, ArrowUpRight, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';
import { ConsoleLayout } from '../components/console/ConsoleLayout';
import { ChartCard } from '../components/console/ChartCard';
import { PageHeader } from '../components/console/PageHeader';
import api from '../services/api';

// ─── Mock data ───────────────────────────────────────────────────────────────
const shapData = [
  { feature: 'instance_type', shap: 0.38, direction: 'positive' },
  { feature: 'region', shap: 0.22, direction: 'positive' },
  { feature: 'storage_gb', shap: 0.17, direction: 'positive' },
  { feature: 'network_transfer', shap: 0.12, direction: 'positive' },
  { feature: 'data_transfer_out', shap: 0.09, direction: 'negative' },
  { feature: 'reserved_usage', shap: -0.18, direction: 'negative' },
  { feature: 'spot_usage', shap: -0.22, direction: 'negative' },
  { feature: 'savings_plan', shap: -0.28, direction: 'negative' },
];

const serviceData = [
  { name: 'EC2 Compute', cost: 89200, pct: 47, color: '#7C3AED' },
  { name: 'S3 Storage', cost: 24100, pct: 13, color: '#06B6D4' },
  { name: 'RDS Database', cost: 22800, pct: 12, color: '#3B82F6' },
  { name: 'CloudFront', cost: 15200, pct: 8, color: '#22C55E' },
  { name: 'Lambda', cost: 11400, pct: 6, color: '#F59E0B' },
  { name: 'EKS', cost: 9500, pct: 5, color: '#EF4444' },
  { name: 'Other', cost: 13800, pct: 7, color: '#64748B' },
];

const regionData = [
  { region: 'US East', cost: 82000 },
  { region: 'US West', cost: 48000 },
  { region: 'EU West', cost: 31000 },
  { region: 'AP Southeast', cost: 14000 },
  { region: 'AP Northeast', cost: 10000 },
];

const treemapData = [
  { name: 'EC2', size: 89200, fill: '#7C3AED' },
  { name: 'S3', size: 24100, fill: '#06B6D4' },
  { name: 'RDS', size: 22800, fill: '#3B82F6' },
  { name: 'CloudFront', size: 15200, fill: '#22C55E' },
  { name: 'Lambda', size: 11400, fill: '#F59E0B' },
  { name: 'EKS', size: 9500, fill: '#EF4444' },
  { name: 'Redshift', size: 7200, fill: '#8B5CF6' },
  { name: 'SageMaker', size: 5800, fill: '#06B6D4' },
  { name: 'Other', size: 14000, fill: '#334155' },
];

const CustomTreemapContent = ({ x, y, width, height, name, fill, size }) => {
  if (width < 40 || height < 30) return null;
  return (
    <g>
      <rect x={x + 1} y={y + 1} width={width - 2} height={height - 2} rx={4} fill={fill} fillOpacity={0.8} stroke="rgba(255,255,255,0.08)" strokeWidth={1} />
      {width > 60 && height > 40 && (
        <>
          <text x={x + 10} y={y + 22} fill="#fff" fontSize={12} fontWeight={600} fontFamily="Outfit">{name}</text>
          {height > 55 && (
            <text x={x + 10} y={y + 38} fill="rgba(255,255,255,0.65)" fontSize={10} fontFamily="Inter">
              ${(size / 1000).toFixed(1)}K
            </text>
          )}
        </>
      )}
    </g>
  );
};

// ─── Analytics / Cost Driver Analysis Page ─────────────────────────────────────────────
export const AnalyticsPage = () => {
  const [drilldown, setDrilldown] = useState(null);
  const [showShap, setShowShap] = useState(false);

  const [dataSummary, setDataSummary] = useState(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [liveServices, setLiveServices] = useState([]);
  const [liveRegions, setLiveRegions] = useState([]);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

  const SERVICE_COLORS = ['#7C3AED', '#06B6D4', '#3B82F6', '#22C55E', '#F59E0B', '#EF4444', '#64748B'];

  React.useEffect(() => {
    api.get('/billing/summary')
      .then(res => {
        setDataSummary(res.data);
        setDataLoading(false);
      })
      .catch(err => {
        console.error(err);
        setDataLoading(false);
      });

    api.get('/analytics/services')
      .then(res => {
        const raw = Array.isArray(res.data) ? res.data : [];
        const total = raw.reduce((s, x) => s + x.cost, 0);
        const mapped = raw.slice(0, 7).map((s, i) => ({
          name: s.service,
          cost: Math.round(s.cost),
          pct: total > 0 ? Math.round((s.cost / total) * 100) : 0,
          color: SERVICE_COLORS[i % SERVICE_COLORS.length],
        }));
        setLiveServices(mapped);
      })
      .catch(() => {});

    api.get('/analytics/trends')
      .then(res => {
        // Extract top regions from top regions array in trends API
        const topRegions = res.data?.topRegions || [];
        const mapped = topRegions.slice(0, 5).map(r => ({
          region: r.region,
          cost: Math.round(r.cost),
        }));
        setLiveRegions(mapped);
      })
      .catch(() => {})
      .finally(() => setAnalyticsLoading(false));
  }, []);

  if (dataLoading || analyticsLoading) {
    return (
      <ConsoleLayout title="Cost Driver Analysis">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', flexDirection: 'column', gap: '16px' }}>
          <div style={{ width: '40px', height: '40px', border: '3px solid rgba(255,255,255,0.05)', borderTopColor: '#7C3AED', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          <div style={{ fontSize: '13px', color: '#475569', fontFamily: 'Inter, sans-serif' }}>Analyzing cost drivers…</div>
        </div>
        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </ConsoleLayout>
    );
  }

  if (!dataLoading && (!dataSummary || dataSummary.totalRecords === 0)) {
    return (
      <ConsoleLayout title="Cost Driver Analysis">
        <PageHeader
          title="Cost Driver Analysis"
          subtitle="SHAP-powered attribution — understand exactly what's driving your cloud bill"
          icon={BarChart3}
          iconColor="#06B6D4"
          breadcrumb={['CloudAtlas AI', 'AI Models', 'Cost Driver Analysis']}
        />
        <div className="glass-card" style={{ padding: '40px', textAlign: 'center', marginTop: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
            <AlertTriangle size={48} color="#F59E0B" />
          </div>
          <h3 style={{ fontFamily: 'Outfit, sans-serif', color: '#F1F5F9', marginBottom: '8px', fontSize: '18px', fontWeight: 600 }}>No Data Available</h3>
          <p style={{ fontSize: '14px', color: '#94A3B8', maxWidth: '500px', margin: '0 auto 20px', lineHeight: 1.6 }}>
            Attrbution explainer models require an active billing dataset to analyze feature contributions, SHAP values, and service/region dimensions.
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

  // Only show content once both billing summary AND analytics have loaded
  const isFullyLoaded = !dataLoading && !analyticsLoading;

  const displayServices = liveServices;
  const displayRegions = liveRegions;
  const displayTreemap = displayServices.map(s => ({ name: s.name, size: s.cost, fill: s.color }));

  const topService = displayServices[0];
  const topRegion = displayRegions[0];
  const totalCost = dataSummary?.totalCost || 0;

  const topDriverCards = [
    { label: 'Top Cost Driver', value: 'Service Type', detail: `${topService?.pct || 0}% impact`, color: '#7C3AED' },
    { label: 'Top Service', value: topService?.name || 'N/A', detail: `$${((topService?.cost || 0) / 1000).toFixed(1)}K / ${topService?.pct || 0}%`, color: '#06B6D4' },
    { label: 'Top Region', value: topRegion?.region || 'N/A', detail: `$${((topRegion?.cost || 0) / 1000).toFixed(1)}K spend`, color: '#3B82F6' },
    { label: 'Total Records', value: (dataSummary?.totalRecords || 0).toLocaleString(), detail: `$${totalCost.toLocaleString()} total`, color: '#F59E0B' },
  ];

  return (
    <ConsoleLayout title="Cost Driver Analysis">
      <PageHeader
        title="Cost Driver Analysis"
        subtitle="SHAP-powered attribution — understand exactly what's driving your cloud bill"
        icon={BarChart3}
        iconColor="#06B6D4"
        breadcrumb={['CloudAtlas AI', 'AI Models', 'Cost Driver Analysis']}
        actions={<span className="badge-cyan">SHAP · XGBoost Explainer</span>}
      />

      {/* Top driver cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '24px' }} className="driver-top-grid">
        {topDriverCards.map((c, i) => (
          <div key={i} className="kpi-card animate-fade-in-up" style={{ animationDelay: `${i * 80}ms`, animationFillMode: 'both' }}>
            <div style={{ fontSize: '10px', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.07em', fontFamily: 'Inter', marginBottom: '8px' }}>
              {c.label}
            </div>
            <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '20px', color: c.color, marginBottom: '4px' }}>
              {c.value}
            </div>
            <div style={{ fontSize: '12px', color: '#64748B', fontFamily: 'Inter' }}>{c.detail}</div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '16px', marginBottom: '20px' }} className="driver-chart-grid">
        {/* Treemap */}
        <ChartCard title="Cost Treemap" subtitle="Service cost allocation — area = spend share">
          <ResponsiveContainer width="100%" height={300}>
            <Treemap
              data={displayTreemap}
              dataKey="size"
              aspectRatio={4 / 3}
              content={<CustomTreemapContent />}
            />
          </ResponsiveContainer>
        </ChartCard>

        {/* Pie */}
        <ChartCard title="Service Breakdown" subtitle="Cost share by cloud service">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={displayServices}
                cx="50%"
                cy="45%"
                innerRadius={60}
                outerRadius={95}
                paddingAngle={3}
                dataKey="cost"
              >
                {displayServices.map((entry, i) => (
                  <Cell key={i} fill={entry.color} opacity={0.85} stroke="transparent" />
                ))}
              </Pie>
              <Tooltip
                formatter={v => [`$${(v / 1000).toFixed(1)}K`]}
                contentStyle={{ background: '#0B1023', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', fontSize: '12px', color: '#F1F5F9' }}
              />
              <Legend
                layout="vertical" align="right" verticalAlign="middle"
                formatter={(value, entry) => (
                  <span style={{ color: '#94A3B8', fontSize: '11px', fontFamily: 'Inter' }}>
                    {value} ({entry.payload.pct}%)
                  </span>
                )}
                iconType="circle" iconSize={8}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Region bar + SHAP */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }} className="driver-bottom-grid">
        {/* Region bar */}
        <ChartCard title="Cost by Region" subtitle="Horizontal spend breakdown by deployment region">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={displayRegions} layout="vertical" margin={{ top: 0, right: 20, left: 60, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
              <XAxis type="number" tick={{ fill: '#475569', fontSize: 10, fontFamily: 'Inter' }} axisLine={false} tickLine={false} tickFormatter={v => `$${v / 1000}K`} />
              <YAxis type="category" dataKey="region" tick={{ fill: '#94A3B8', fontSize: 12, fontFamily: 'Inter' }} axisLine={false} tickLine={false} />
              <Tooltip formatter={v => [`$${(v / 1000).toFixed(1)}K`, 'Cost']} contentStyle={{ background: '#0B1023', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', fontSize: '12px', color: '#F1F5F9' }} />
              <Bar dataKey="cost" fill="#7C3AED" radius={[0, 6, 6, 0]} opacity={0.8} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* SHAP Explanation */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <button
            onClick={() => setShowShap(!showShap)}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: 'none', border: 'none', cursor: 'pointer', marginBottom: showShap ? '16px' : 0,
            }}
          >
            <div>
              <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600, fontSize: '15px', color: '#F1F5F9', textAlign: 'left' }}>
                SHAP Feature Importance
              </div>
              <div style={{ fontSize: '12px', color: '#475569', fontFamily: 'Inter', textAlign: 'left', marginTop: '2px' }}>
                Feature impact on cost prediction
              </div>
            </div>
            {showShap ? <ChevronUp size={16} color="#64748B" /> : <ChevronDown size={16} color="#64748B" />}
          </button>

          {showShap && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {shapData.map((f, i) => {
                const isPos = f.shap > 0;
                const w = Math.abs(f.shap) / 0.38 * 100;
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '120px', fontSize: '12px', color: '#94A3B8', fontFamily: 'Inter', textAlign: 'right', flexShrink: 0 }}>
                      {f.feature.replace('_', ' ')}
                    </div>
                    <div style={{ flex: 1, height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', width: `${w}%`,
                        background: isPos ? 'linear-gradient(90deg, #7C3AED, #EF4444)' : 'linear-gradient(90deg, #22C55E, #06B6D4)',
                        borderRadius: '4px',
                        marginLeft: isPos ? 0 : 'auto',
                        transition: 'width 0.8s ease',
                      }} />
                    </div>
                    <div style={{
                      width: '44px', fontSize: '11px', fontFamily: 'Space Grotesk, monospace',
                      fontWeight: 700, color: isPos ? '#EF4444' : '#22C55E', textAlign: 'right', flexShrink: 0,
                    }}>
                      {isPos ? '+' : ''}{(f.shap * 100).toFixed(0)}%
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {!showShap && (
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '12px' }}>
              {shapData.slice(0, 4).map((f, i) => (
                <span key={i} style={{
                  padding: '4px 10px', borderRadius: '6px', fontSize: '11px',
                  background: f.shap > 0 ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)',
                  color: f.shap > 0 ? '#EF4444' : '#22C55E',
                  border: `1px solid ${f.shap > 0 ? 'rgba(239,68,68,0.2)' : 'rgba(34,197,94,0.2)'}`,
                  fontFamily: 'Inter', fontWeight: 500,
                }}>
                  {f.feature.replace(/_/g, ' ')}
                </span>
              ))}
              <button
                onClick={() => setShowShap(true)}
                style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '11px', background: 'rgba(124,58,237,0.1)', color: '#8B5CF6', border: '1px solid rgba(124,58,237,0.2)', fontFamily: 'Inter', cursor: 'pointer' }}
              >
                View all →
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 1100px) {
          .driver-top-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .driver-chart-grid { grid-template-columns: 1fr !important; }
          .driver-bottom-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 640px) {
          .driver-top-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </ConsoleLayout>
  );
};

export default AnalyticsPage;
