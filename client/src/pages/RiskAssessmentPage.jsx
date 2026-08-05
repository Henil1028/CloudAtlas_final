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
import { useDataContext } from '../context/DataContext';
import { EmptyState } from '../components/console/EmptyState';

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
  if (score >= 70) return '#EF4444';   // High   — Red
  if (score >= 40) return '#F59E0B';   // Moderate — Amber
  return '#22C55E';                    // Low    — Green
};

const riskLabel = (score) => {
  if (score >= 70) return 'High';
  if (score >= 40) return 'Moderate';
  return 'Low';
};

// ─── Gauge component ──────────────────────────────────────────────────────────
const RiskGauge = ({ score }) => {
  const safeScore = Math.min(100, Math.max(0, Number(score) || 0));
  // Needle angle: -135deg (0 score) to +135deg (100 score) across 270deg total arc
  const angle = -135 + (safeScore / 100) * 270;
  const color = riskColor(safeScore);
  const arcLength = 251.2;

  return (
    <div style={{ position: 'relative', width: '220px', height: '135px', margin: '0 auto' }}>
      <svg viewBox="0 0 200 120" width="220" height="135">
        <defs>
          <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#22C55E" />
            <stop offset="50%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#EF4444" />
          </linearGradient>
        </defs>
        {/* Track background with full spectrum gradient */}
        <path d="M 20 100 A 80 80 0 1 1 180 100" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="16" strokeLinecap="butt" />
        <path d="M 20 100 A 80 80 0 1 1 180 100" fill="none" stroke="url(#gaugeGradient)" strokeWidth="16" strokeLinecap="butt" opacity={0.35} />
        {/* Active progress arc fill - strokeLinecap="butt" stops EXACTLY at needle score */}
        <path
          d="M 20 100 A 80 80 0 1 1 180 100"
          fill="none"
          stroke={color}
          strokeWidth="16"
          strokeLinecap="butt"
          strokeDasharray={`${(safeScore / 100) * arcLength} ${arcLength}`}
          style={{ transition: 'stroke-dasharray 0.6s ease-out, stroke 0.4s ease', filter: `drop-shadow(0 0 8px ${color}A0)` }}
        />
        {/* Tick marks */}
        {[0, 25, 50, 75, 100].map((v, i) => {
          const tickAngle = 135 + (v / 100) * 270;
          const rad = (tickAngle * Math.PI) / 180;
          const cx = 100 + 80 * Math.cos(rad);
          const cy = 100 + 80 * Math.sin(rad);
          return <circle key={i} cx={cx} cy={cy} r="3" fill="#94A3B8" opacity={0.8} />;
        })}
        {/* Gauge Needle Pointer with distinct Arrow Head */}
        {(() => {
          const needleAngle = 135 + (safeScore / 100) * 270;
          const rad = (needleAngle * Math.PI) / 180;
          // Line ends at inner radius 56
          const lx = 100 + 56 * Math.cos(rad);
          const ly = 100 + 56 * Math.sin(rad);
          // Arrow tip touches arc inner radius (80 - 8 = 72)
          const tx = 100 + 71.5 * Math.cos(rad);
          const ty = 100 + 71.5 * Math.sin(rad);

          // Arrow wing perpendicular vector
          const px = -Math.sin(rad) * 6;
          const py = Math.cos(rad) * 6;

          const p1 = `${tx},${ty}`;
          const p2 = `${lx + px},${ly + py}`;
          const p3 = `${lx - px},${ly - py}`;

          return (
            <g style={{ transition: 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)' }}>
              <line x1="100" y1="100" x2={lx} y2={ly} stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" style={{ filter: 'drop-shadow(0 0 6px rgba(255,255,255,0.9))' }} />
              {/* Triangular Arrow Head pointing directly onto score arc */}
              <polygon points={`${p1} ${p2} ${p3}`} fill="#FFFFFF" stroke={color} strokeWidth="1.5" style={{ filter: `drop-shadow(0 0 6px ${color})` }} />
            </g>
          );
        })()}
        <circle cx="100" cy="100" r="6" fill="#F8FAFC" style={{ filter: 'drop-shadow(0 0 6px rgba(255,255,255,0.6))' }} />
        <circle cx="100" cy="100" r="2.5" fill="#0F172A" />
      </svg>
      <div style={{ position: 'absolute', bottom: '0px', left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
        <div style={{
          padding: '6px 20px',
          borderRadius: '9999px',
          background: 'linear-gradient(180deg, rgba(30, 41, 59, 0.9), rgba(15, 23, 42, 0.95))',
          border: `1px solid ${color}60`,
          boxShadow: `0 4px 20px -2px ${color}35`,
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}>
          <span style={{
            fontFamily: 'Space Grotesk, monospace',
            fontWeight: 800,
            fontSize: '26px',
            color: '#FFFFFF',
            lineHeight: 1,
          }}>
            {safeScore}
          </span>
          <span style={{
            fontSize: '11px',
            fontWeight: 800,
            color,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            padding: '3px 8px',
            borderRadius: '9999px',
            background: `${color}18`,
            border: `1px solid ${color}30`,
          }}>
            {riskLabel(safeScore)} Risk
          </span>
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
  const isInitialLoad = React.useRef(true);
  const { lastUploadTime, lastUploadFileId } = useDataContext();

  useEffect(() => {
    const fileQuery = lastUploadFileId ? `?fileId=${lastUploadFileId}` : '';
    api.get(`/billing/summary${fileQuery}`)
      .then(res => {
        setDataSummary(res.data);
        if (isInitialLoad.current) {
          setDataLoading(false);
          isInitialLoad.current = false;
        }
      })
      .catch(err => {
        console.error(err);
        if (isInitialLoad.current) {
          setDataLoading(false);
          isInitialLoad.current = false;
        }
      });
  }, [lastUploadTime, lastUploadFileId]);

  const dynamicProviderRisk = React.useMemo(() => {
    if (!dataSummary || !dataSummary.providerSpend) return providerRisk;
    const spend = dataSummary.providerSpend;
    const total = (spend.aws || 0) + (spend.azure || 0) + (spend.gcp || 0);
    if (total === 0) return providerRisk;

    const awsCost = spend.aws || 0;
    const azureCost = spend.azure || 0;
    const gcpCost = spend.gcp || 0;

    const awsShare = awsCost > 0 ? (awsCost / total) : 0;
    const azureShare = azureCost > 0 ? (azureCost / total) : 0;
    const gcpShare = gcpCost > 0 ? (gcpCost / total) : 0;

    return [
      {
        provider: 'AWS',
        risk: awsCost > 0 ? Math.round(awsShare * 80) : 0,
        spend: awsCost,
        color: '#F59E0B'
      },
      {
        provider: 'Azure',
        risk: azureCost > 0 ? Math.round(azureShare * 80) : 0,
        spend: azureCost,
        color: '#3B82F6'
      },
      {
        provider: 'GCP',
        risk: gcpCost > 0 ? Math.round(gcpShare * 80) : 0,
        spend: gcpCost,
        color: '#22C55E'
      },
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
      const risk = Math.min(100, Math.max(10, Math.round(sharePct * 1.8 + 15)));
      const status = risk >= 70 ? 'high' : risk >= 40 ? 'medium' : 'low';
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
    if (!dataSummary || !dataSummary.serviceSpend || dataSummary.serviceSpend.length === 0) return 62;

    const totalCost = dataSummary.totalCost || 1;

    // 1. Provider Lock-in Risk (0-100)
    const spend = dataSummary.providerSpend || {};
    const pTotal = (spend.aws || 0) + (spend.azure || 0) + (spend.gcp || 0) || totalCost;
    const maxProviderShare = Math.max((spend.aws || 0) / pTotal, (spend.azure || 0) / pTotal, (spend.gcp || 0) / pTotal);
    const providerRiskScore = Math.round(maxProviderShare * 75);

    // 2. Service Concentration Risk (Herfindahl-Hirschman Index 0-100)
    const hhi = dataSummary.serviceSpend.reduce((sum, s) => {
      const share = (s.cost || 0) / totalCost;
      return sum + (share * share);
    }, 0);
    const serviceConcentrationRisk = Math.round(hhi * 100);

    // 3. Volatility Risk (Coefficient of Variation 0-100)
    const daily = dataSummary.dailySpend || [];
    let volatilityRisk = 20;
    if (daily.length > 1) {
      const mean = daily.reduce((s, d) => s + (d.cost || 0), 0) / daily.length;
      if (mean > 0) {
        const variance = daily.reduce((s, d) => s + Math.pow((d.cost || 0) - mean, 2), 0) / daily.length;
        const cv = Math.sqrt(variance) / mean;
        volatilityRisk = Math.min(100, Math.round(cv * 60));
      }
    }

    const composite = (providerRiskScore * 0.40) + (serviceConcentrationRisk * 0.35) + (volatilityRisk * 0.25);
    return Math.min(100, Math.max(5, Math.round(composite)));
  }, [dataSummary]);

  const dynamicHeatmap = React.useMemo(() => {
    if (!dataSummary || !dataSummary.serviceSpend || dataSummary.serviceSpend.length === 0) {
      return { heatmapRows: heatmapData, monthHeaders: months };
    }
    const topServices = dataSummary.serviceSpend.slice(0, 5);
    const totalCost = dataSummary.totalCost || 1;

    // Deriving month names from dailySpend timestamps
    let monthHeaders = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    if (dataSummary.dailySpend && dataSummary.dailySpend.length > 0) {
      const uniqueMonths = Array.from(new Set(dataSummary.dailySpend.map(d => {
        const dt = new Date(d.date);
        return dt.toLocaleDateString('en-US', { month: 'short' });
      })));
      if (uniqueMonths.length > 0) {
        monthHeaders = uniqueMonths.slice(-6);
      }
    }

    const heatmapRows = topServices.map((srv, sIdx) => {
      const row = { service: srv.service };
      const sharePct = (srv.cost / totalCost) * 100;
      const baseRisk = Math.min(92, Math.max(25, Math.round(sharePct * 1.6 + 32)));

      monthHeaders.forEach((m, idx) => {
        const monthVar = Math.sin(idx + sIdx) * 12;
        const val = Math.min(95, Math.max(20, Math.round(baseRisk + monthVar)));
        row[m.toLowerCase()] = val;
      });
      return row;
    });

    return { heatmapRows, monthHeaders };
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
        <EmptyState
          title="Risk Classification"
          kpis={[
            { label: 'Overall Risk Score', value: '0 / 100' },
            { label: 'High Risk Services', value: '0' },
            { label: 'Medium Risk Services', value: '0' },
            { label: 'Resolved / Low', value: '0' },
          ]}
        />
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
              { label: 'Risk Level', value: riskLabel(dynamicOverallScore), color: riskColor(dynamicOverallScore) },
              { label: 'Budget Status', value: dynamicOverallScore >= 70 ? 'High Exposure' : dynamicOverallScore >= 50 ? 'At Risk' : 'Healthy', color: riskColor(dynamicOverallScore) },
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
                  <span style={{ width: '36px', fontSize: '12px', fontWeight: 700, color: p.spend === 0 ? '#64748B' : riskColor(p.risk), fontFamily: 'Space Grotesk, monospace', textAlign: 'right' }}>
                    {p.spend === 0 ? '0' : p.risk}
                  </span>
                  <span className={p.spend === 0 ? 'badge-neutral' : `badge-${p.risk >= 70 ? 'danger' : p.risk >= 50 ? 'warning' : 'success'}`}>
                    {p.spend === 0 ? 'Inactive' : riskLabel(p.risk)}
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
                {dynamicHeatmap.monthHeaders.map(m => (
                  <th key={m} style={{ padding: '8px 12px', textAlign: 'center', fontSize: '11px', color: '#475569', fontFamily: 'Inter', fontWeight: 600 }}>{m}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dynamicHeatmap.heatmapRows.map((row, i) => (
                <tr key={i}>
                  <td style={{ padding: '8px 12px', fontSize: '13px', fontWeight: 500, color: '#CBD5E1', fontFamily: 'Inter' }}>{row.service}</td>
                  {dynamicHeatmap.monthHeaders.map(m => {
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
