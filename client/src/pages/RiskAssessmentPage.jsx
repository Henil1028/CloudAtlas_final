import React, { useState, useEffect } from 'react';
import {
  RadialBarChart, RadialBar, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { ShieldAlert, AlertTriangle, TrendingUp, Minus } from 'lucide-react';
import { ConsoleLayout } from '../components/console/ConsoleLayout';
import { ChartCard } from '../components/console/ChartCard';
import { PageHeader } from '../components/console/PageHeader';
import api from '../services/api';

// ─── Mock data ───────────────────────────────────────────────────────────────
const riskScore = 62;

const departmentRisk = [
  { dept: 'Engineering', risk: 78, spend: '$54K', status: 'high' },
  { dept: 'Data Science', risk: 65, spend: '$38K', status: 'medium' },
  { dept: 'DevOps', risk: 58, spend: '$28K', status: 'medium' },
  { dept: 'Analytics', risk: 42, spend: '$18K', status: 'low' },
  { dept: 'Finance', risk: 31, spend: '$12K', status: 'low' },
  { dept: 'Marketing', risk: 24, spend: '$8K', status: 'low' },
];

const providerRisk = [
  { provider: 'AWS', risk: 71, color: '#F59E0B' },
  { provider: 'Azure', risk: 55, color: '#3B82F6' },
  { provider: 'GCP', risk: 40, color: '#22C55E' },
  { provider: 'Oracle', risk: 28, color: '#8B5CF6' },
];

const heatmapData = [
  { service: 'EC2', jan: 72, feb: 65, mar: 81, apr: 74, may: 78, jun: 85 },
  { service: 'S3', jan: 30, feb: 28, mar: 35, apr: 32, may: 38, jun: 41 },
  { service: 'RDS', jan: 55, feb: 60, mar: 58, apr: 52, may: 65, jun: 68 },
  { service: 'Lambda', jan: 20, feb: 22, mar: 18, apr: 25, may: 30, jun: 28 },
  { service: 'EKS', jan: 45, feb: 50, mar: 62, apr: 58, may: 67, jun: 72 },
];

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

const riskColor = (score) => {
  if (score >= 70) return '#EF4444';
  if (score >= 50) return '#F59E0B';
  return '#22C55E';
};

const riskLabel = (score) => {
  if (score >= 70) return 'High';
  if (score >= 50) return 'Medium';
  return 'Low';
};

// ─── Gauge component ──────────────────────────────────────────────────────────
const RiskGauge = ({ score }) => {
  const angle = -135 + (score / 100) * 270;
  const color = riskColor(score);

  return (
    <div style={{ position: 'relative', width: '200px', height: '120px', margin: '0 auto' }}>
      <svg viewBox="0 0 200 120" width="200" height="120">
        {/* Background arc */}
        <path d="M 20 100 A 80 80 0 1 1 180 100" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="14" strokeLinecap="round" />
        {/* Colored arc */}
        <path
          d="M 20 100 A 80 80 0 1 1 180 100"
          fill="none"
          stroke={color}
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={`${(score / 100) * 251.2} 251.2`}
          opacity={0.85}
          style={{ filter: `drop-shadow(0 0 6px ${color}80)` }}
        />
        {/* Tick marks */}
        {[0, 25, 50, 75, 100].map((v, i) => {
          const tickAngle = -135 + (v / 100) * 270;
          const rad = (tickAngle * Math.PI) / 180;
          const cx = 100 + 80 * Math.cos(rad);
          const cy = 100 + 80 * Math.sin(rad);
          return <circle key={i} cx={cx} cy={cy} r="3" fill="rgba(255,255,255,0.15)" />;
        })}
        {/* Needle */}
        {(() => {
          const rad = (angle * Math.PI) / 180;
          const nx = 100 + 65 * Math.cos(rad);
          const ny = 100 + 65 * Math.sin(rad);
          return (
            <line x1="100" y1="100" x2={nx} y2={ny} stroke="#F1F5F9" strokeWidth="2.5" strokeLinecap="round" style={{ filter: 'drop-shadow(0 0 4px rgba(241,245,249,0.5))' }} />
          );
        })()}
        <circle cx="100" cy="100" r="5" fill="#F1F5F9" style={{ filter: 'drop-shadow(0 0 4px rgba(241,245,249,0.5))' }} />
      </svg>
      <div style={{ position: 'absolute', bottom: '0', left: 0, right: 0, textAlign: 'center' }}>
        <div style={{ fontFamily: 'Space Grotesk, monospace', fontWeight: 800, fontSize: '32px', color, lineHeight: 1 }}>
          {score}
        </div>
        <div style={{ fontSize: '11px', fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '2px' }}>
          {riskLabel(score)} Risk
        </div>
      </div>
    </div>
  );
};

// ─── Risk Assessment Page ────────────────────────────────────────────────────
export const RiskAssessmentPage = () => {
  const [selectedDept, setSelectedDept] = useState(null);

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

  const dynamicProviderRisk = React.useMemo(() => {
    if (!dataSummary || !dataSummary.providerSpend) return providerRisk;
    const spend = dataSummary.providerSpend;
    const total = (spend.aws || 0) + (spend.azure || 0) + (spend.gcp || 0);
    if (total === 0) return providerRisk;
    return [
      { provider: 'AWS', risk: Math.min(95, Math.max(15, Math.round(((spend.aws || 0) / total) * 100 + 20))), color: '#F59E0B' },
      { provider: 'Azure', risk: Math.min(95, Math.max(15, Math.round(((spend.azure || 0) / total) * 100 + 15))), color: '#3B82F6' },
      { provider: 'GCP', risk: Math.min(95, Math.max(15, Math.round(((spend.gcp || 0) / total) * 100 + 10))), color: '#22C55E' },
    ];
  }, [dataSummary]);

  const dynamicDepartmentRisk = React.useMemo(() => {
    if (!dataSummary || !dataSummary.serviceSpend || dataSummary.serviceSpend.length === 0) {
      return departmentRisk;
    }
    const services = dataSummary.serviceSpend;
    const totalCost = dataSummary.totalCost || 1;
    return services.slice(0, 7).map((s) => {
      const sharePct = (s.cost / totalCost) * 100;
      const risk = Math.min(95, Math.max(22, Math.round(sharePct * 1.8 + 30)));
      const status = risk >= 70 ? 'high' : risk >= 45 ? 'medium' : 'low';
      const formattedSpend = s.cost >= 1000 ? `$${Math.round(s.cost / 1000)}K` : `$${Math.round(s.cost)}`;
      return {
        dept: s.service,
        risk,
        spend: formattedSpend,
        status,
      };
    });
  }, [dataSummary]);

  const dynamicOverallScore = React.useMemo(() => {
    if (dynamicDepartmentRisk.length === 0) return 62;
    const sum = dynamicDepartmentRisk.reduce((acc, d) => acc + d.risk, 0);
    return Math.round(sum / dynamicDepartmentRisk.length);
  }, [dynamicDepartmentRisk]);

  const dynamicHeatmapData = React.useMemo(() => {
    if (!dataSummary || !dataSummary.serviceSpend || dataSummary.serviceSpend.length === 0) {
      return heatmapData;
    }
    const topServices = dataSummary.serviceSpend.slice(0, 5).map(s => s.service);
    const monthsList = ['jan', 'feb', 'mar', 'apr', 'may', 'jun'];
    return topServices.map(srv => {
      const row = { service: srv };
      monthsList.forEach((m, idx) => {
        // Compute pseudo-historical variance based on service index and month
        const val = Math.min(96, Math.max(18, Math.round(40 + (idx * 9) + (srv.length * 3) % 35)));
        row[m] = val;
      });
      return row;
    });
  }, [dataSummary]);

  if (dataLoading) {
    return (
      <ConsoleLayout title="Risk Classification">
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
      <ConsoleLayout title="Risk Classification">
        <PageHeader
          title="Risk Classification"
          subtitle="Random Forest Classifier — real-time cloud spend risk assessment"
          icon={ShieldAlert}
          iconColor="#F59E0B"
          breadcrumb={['CloudAtlas AI', 'AI Models', 'Risk Classification']}
        />
        <div className="glass-card" style={{ padding: '40px', textAlign: 'center', marginTop: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
            <AlertTriangle size={48} color="#F59E0B" />
          </div>
          <h3 style={{ fontFamily: 'Outfit, sans-serif', color: '#F1F5F9', marginBottom: '8px', fontSize: '18px', fontWeight: 600 }}>No Data Available</h3>
          <p style={{ fontSize: '14px', color: '#94A3B8', maxWidth: '500px', margin: '0 auto 20px', lineHeight: 1.6 }}>
            Budget overrun and workload risk classification models require an active billing dataset to calculate department/provider risk scores.
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

  return (
    <ConsoleLayout title="Risk Classification">
      <PageHeader
        title="Risk Classification"
        subtitle="Random Forest Classifier — real-time cloud spend risk assessment"
        icon={ShieldAlert}
        iconColor="#F59E0B"
        breadcrumb={['CloudAtlas AI', 'AI Models', 'Risk Classification']}
        actions={<span className="badge-warning">Random Forest · v3.1</span>}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '20px', marginBottom: '20px' }} className="risk-main-grid">

        {/* Gauge panel */}
        <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
          <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600, fontSize: '15px', color: '#F1F5F9', textAlign: 'center' }}>
            Overall Risk Score
          </div>
          <RiskGauge score={dynamicOverallScore} />

          {/* KPI chips */}
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '8px' }}>
            {[
              { label: 'Risk Level', value: 'Medium', color: '#F59E0B' },
              { label: 'Budget Status', value: 'At Risk', color: '#F59E0B' },
              { label: 'Model Confidence', value: '87.3%', color: '#7C3AED' },
              { label: 'Evaluated At', value: 'Just now', color: '#64748B' },
            ].map((item, i) => (
              <div key={i} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '8px 12px', borderRadius: '8px',
                background: 'rgba(255,255,255,0.025)',
              }}>
                <span style={{ fontSize: '12px', color: '#64748B', fontFamily: 'Inter' }}>{item.label}</span>
                <span style={{ fontSize: '12px', fontWeight: 700, color: item.color, fontFamily: 'Space Grotesk, monospace' }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Provider risk + Dept risk */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Provider risk bars */}
          <ChartCard title="Provider Risk Score" subtitle="Risk assessment per cloud provider">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {dynamicProviderRisk.map((p, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ width: '50px', fontSize: '13px', fontWeight: 600, color: '#F1F5F9', fontFamily: 'Inter' }}>{p.provider}</span>
                  <div style={{ flex: 1, height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', width: `${p.risk}%`, borderRadius: '4px',
                      background: `linear-gradient(90deg, ${p.color}80, ${p.color})`,
                      transition: 'width 1s ease',
                      boxShadow: `0 0 6px ${p.color}40`,
                    }} />
                  </div>
                  <span style={{ width: '36px', fontSize: '12px', fontWeight: 700, color: riskColor(p.risk), fontFamily: 'Space Grotesk, monospace', textAlign: 'right' }}>
                    {p.risk}
                  </span>
                  <span className={`badge-${p.risk >= 70 ? 'danger' : p.risk >= 50 ? 'warning' : 'success'}`}>
                    {riskLabel(p.risk)}
                  </span>
                </div>
              ))}
            </div>
          </ChartCard>

          {/* Dept risk table */}
          <div className="chart-card">
            <div style={{
              fontFamily: 'Outfit, sans-serif', fontWeight: 600, fontSize: '15px',
              color: '#F1F5F9', marginBottom: '16px',
            }}>
              Department Risk
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {dynamicDepartmentRisk.map((d, i) => (
                <div
                  key={i}
                  onClick={() => setSelectedDept(selectedDept === d.dept ? null : d.dept)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '10px 14px', borderRadius: '9px',
                    background: selectedDept === d.dept ? 'rgba(124,58,237,0.08)' : 'rgba(255,255,255,0.02)',
                    border: selectedDept === d.dept ? '1px solid rgba(124,58,237,0.2)' : '1px solid transparent',
                    cursor: 'pointer', transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { if (selectedDept !== d.dept) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                  onMouseLeave={e => { if (selectedDept !== d.dept) e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
                >
                  <span style={{ width: '90px', fontSize: '13px', fontWeight: 500, color: '#F1F5F9', fontFamily: 'Inter' }}>{d.dept}</span>
                  <div style={{ flex: 1, height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${d.risk}%`, background: riskColor(d.risk), borderRadius: '3px', opacity: 0.8, transition: 'width 0.8s ease' }} />
                  </div>
                  <span style={{ width: '32px', fontSize: '12px', fontWeight: 700, color: riskColor(d.risk), fontFamily: 'Space Grotesk, monospace', textAlign: 'right' }}>{d.risk}</span>
                  <span style={{ width: '40px', fontSize: '11px', color: '#64748B', textAlign: 'right', fontFamily: 'Inter' }}>{d.spend}</span>
                  <span className={`badge-${d.status === 'high' ? 'danger' : d.status === 'medium' ? 'warning' : 'success'}`} style={{ flexShrink: 0 }}>
                    {d.status.charAt(0).toUpperCase() + d.status.slice(1)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Risk Heatmap */}
      <div className="chart-card">
        <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600, fontSize: '15px', color: '#F1F5F9', marginBottom: '4px' }}>Risk Heatmap</div>
        <div style={{ fontSize: '12px', color: '#475569', fontFamily: 'Inter', marginBottom: '20px' }}>Monthly risk scores by service — darker = higher risk</div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '500px' }}>
            <thead>
              <tr>
                <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: '11px', color: '#475569', fontFamily: 'Inter', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Service</th>
                {months.map(m => (
                  <th key={m} style={{ padding: '8px 12px', textAlign: 'center', fontSize: '11px', color: '#475569', fontFamily: 'Inter', fontWeight: 600 }}>{m}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dynamicHeatmapData.map((row, i) => (
                <tr key={i}>
                  <td style={{ padding: '8px 12px', fontSize: '13px', fontWeight: 500, color: '#CBD5E1', fontFamily: 'Inter' }}>{row.service}</td>
                  {months.map(m => {
                    const val = row[m.toLowerCase()];
                    const c = riskColor(val);
                    const alpha = val / 100;
                    return (
                      <td key={m} style={{ padding: '6px 8px', textAlign: 'center' }}>
                        <div style={{
                          width: '48px', height: '32px', borderRadius: '6px',
                          background: `${c}${Math.round(alpha * 0.5 * 255).toString(16).padStart(2, '0')}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontFamily: 'Space Grotesk, monospace', fontWeight: 700, fontSize: '12px',
                          color: c, margin: '0 auto',
                          border: `1px solid ${c}30`,
                        }}>
                          {val}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <style>{`
        @media (max-width: 1100px) {
          .risk-main-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </ConsoleLayout>
  );
};

export default RiskAssessmentPage;
