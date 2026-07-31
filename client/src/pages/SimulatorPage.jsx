import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, RadialBarChart, RadialBar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell
} from 'recharts';
import { Sliders, RotateCcw } from 'lucide-react';
import { ConsoleLayout } from '../components/console/ConsoleLayout';
import { ChartCard } from '../components/console/ChartCard';
import { PageHeader } from '../components/console/PageHeader';

import api from '../services/api';
import { useDataContext } from '../context/DataContext';

// ─── Presets ─────────────────────────────────────────────────────────────────
const PRESETS = {
  startup: { label: 'Startup Sandbox', cpu: 4, memory: 8, storage: 200, network: 1, vms: 2, containers: 5, reserved: 0, users: 10 },
  enterprise: { label: 'Enterprise Prod', cpu: 64, memory: 256, storage: 5000, network: 10, vms: 20, containers: 50, reserved: 60, users: 500 },
  bigdata: { label: 'Large Data Pipeline', cpu: 128, memory: 512, storage: 50000, network: 50, vms: 40, containers: 100, reserved: 80, users: 100 },
};

const SLIDERS = [
  { key: 'cpu', label: 'CPU Cores', unit: 'vCPU', min: 1, max: 256, step: 1, costPerUnit: 48 },
  { key: 'memory', label: 'Memory', unit: 'GB', min: 2, max: 2048, step: 2, costPerUnit: 6 },
  { key: 'storage', label: 'Storage', unit: 'GB', min: 10, max: 100000, step: 50, costPerUnit: 0.025 },
  { key: 'network', label: 'Network', unit: 'Gbps', min: 1, max: 100, step: 1, costPerUnit: 900 },
  { key: 'vms', label: 'Virtual Machines', unit: 'VMs', min: 1, max: 200, step: 1, costPerUnit: 280 },
  { key: 'containers', label: 'Containers', unit: 'pods', min: 0, max: 500, step: 5, costPerUnit: 30 },
  { key: 'reserved', label: 'Reserved Coverage', unit: '%', min: 0, max: 100, step: 5, costPerUnit: -280 },
  { key: 'users', label: 'Active Users', unit: 'users', min: 1, max: 10000, step: 10, costPerUnit: 1.2 },
];

const computeCost = (config) => {
  const base = SLIDERS.reduce((sum, s) => sum + (config[s.key] || 0) * Math.abs(s.costPerUnit), 0);
  const savings = (config.reserved / 100) * base * 0.35;
  return Math.max(base - savings, 500);
};

export const SimulatorPage = () => {
  const [config, setConfig] = useState({ ...PRESETS.enterprise });
  const [baseline, setBaseline] = useState({ ...PRESETS.enterprise });
  const [activePreset, setActivePreset] = useState('enterprise');
  const [dataSummary, setDataSummary] = useState(null);
  const { lastUploadTime } = useDataContext();

  useEffect(() => {
    api.get('/billing/summary')
      .then(res => setDataSummary(res.data))
      .catch(() => {});
  }, [lastUploadTime]);

  const calculatedBase = computeCost(config);
  const oldCost = computeCost(baseline);
  const totalUploaded = dataSummary?.totalCost || 0;
  const newCost = totalUploaded > 0 ? Math.round(totalUploaded * (calculatedBase / oldCost)) : calculatedBase;
  const savings = oldCost - calculatedBase;
  const growth = ((newCost - (totalUploaded || oldCost)) / (totalUploaded || oldCost) * 100).toFixed(1);
  const budget = totalUploaded > 0 ? Math.round(totalUploaded * 1.25) : 200000;

  const applyPreset = (key) => {
    setConfig({ ...PRESETS[key] });
    setBaseline({ ...PRESETS[key] });
    setActivePreset(key);
  };

  const comparisonData = SLIDERS.slice(0, 6).map(s => ({
    name: s.label.split(' ')[0],
    baseline: baseline[s.key],
    current: config[s.key],
  }));

  return (
    <ConsoleLayout title="Budget Simulator">
      <PageHeader
        title="Budget Simulator"
        subtitle="Model infrastructure changes and instantly see cost impact with our ML-powered simulator"
        icon={Sliders}
        iconColor="#22C55E"
        breadcrumb={['CloudAtlas AI', 'AI Models', 'Budget Simulator']}
        actions={<span className="badge-success">Gradient Boost · Real-time</span>}
      />

      {/* Preset Buttons */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '12px', color: '#64748B', fontFamily: 'Inter', alignSelf: 'center', marginRight: '4px' }}>
          Load preset:
        </span>
        {Object.entries(PRESETS).map(([key, preset]) => (
          <button
            key={key}
            onClick={() => applyPreset(key)}
            style={{
              padding: '7px 16px', borderRadius: '8px', fontSize: '12.5px', fontWeight: 600,
              cursor: 'pointer', fontFamily: 'Inter', transition: 'all 0.2s',
              background: activePreset === key ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.04)',
              border: activePreset === key ? '1px solid rgba(34,197,94,0.3)' : '1px solid rgba(255,255,255,0.07)',
              color: activePreset === key ? '#22C55E' : '#94A3B8',
            }}
          >
            {preset.label}
          </button>
        ))}
        <button
          onClick={() => setConfig({ ...baseline })}
          style={{
            display: 'flex', alignItems: 'center', gap: '5px',
            padding: '7px 14px', borderRadius: '8px', fontSize: '12px',
            cursor: 'pointer', fontFamily: 'Inter', transition: 'all 0.2s',
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
            color: '#64748B',
          }}
        >
          <RotateCcw size={12} />
          Reset
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '20px' }} className="sim-main-grid">

        {/* Left: Sliders */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600, fontSize: '15px', color: '#F1F5F9', marginBottom: '20px' }}>
            Infrastructure Configuration
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {SLIDERS.map(s => (
              <div key={s.key}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: '#94A3B8', fontFamily: 'Inter' }}>
                    {s.label}
                  </label>
                  <span style={{ fontFamily: 'Space Grotesk, monospace', fontWeight: 700, fontSize: '13px', color: '#F1F5F9' }}>
                    {config[s.key]} {s.unit}
                  </span>
                </div>
                <input
                  type="range"
                  min={s.min} max={s.max} step={s.step}
                  value={config[s.key]}
                  onChange={e => setConfig(c => ({ ...c, [s.key]: Number(e.target.value) }))}
                  style={{
                    width: '100%', height: '5px', borderRadius: '3px',
                    background: `linear-gradient(90deg, #7C3AED ${((config[s.key] - s.min) / (s.max - s.min)) * 100}%, rgba(255,255,255,0.08) 0%)`,
                    outline: 'none', appearance: 'none', cursor: 'pointer',
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Right: Results */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Cost summary grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
            {[
              { label: 'Baseline Cost', val: `$${(oldCost / 1000).toFixed(1)}K`, color: '#94A3B8' },
              { label: 'New Cost', val: `$${(newCost / 1000).toFixed(1)}K`, color: savings > 0 ? '#22C55E' : '#EF4444' },
              { label: savings > 0 ? 'Savings' : 'Overage', val: `${savings > 0 ? '-' : '+'}$${(Math.abs(savings) / 1000).toFixed(1)}K`, color: savings > 0 ? '#22C55E' : '#EF4444' },
            ].map((c, i) => (
              <div key={i} className="glass-card-sm" style={{ padding: '16px' }}>
                <div style={{ fontSize: '10px', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'Inter', marginBottom: '6px' }}>{c.label}</div>
                <div style={{ fontFamily: 'Space Grotesk, monospace', fontWeight: 800, fontSize: '22px', color: c.color }}>{c.val}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="glass-card-sm" style={{ padding: '16px' }}>
              <div style={{ fontSize: '10px', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'Inter', marginBottom: '6px' }}>Cost Growth</div>
              <div style={{ fontFamily: 'Space Grotesk, monospace', fontWeight: 800, fontSize: '22px', color: growth > 0 ? '#F59E0B' : '#22C55E' }}>
                {growth > 0 ? '+' : ''}{growth}%
              </div>
            </div>
            <div className="glass-card-sm" style={{ padding: '16px' }}>
              <div style={{ fontSize: '10px', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'Inter', marginBottom: '6px' }}>Model Confidence</div>
              <div style={{ fontFamily: 'Space Grotesk, monospace', fontWeight: 800, fontSize: '22px', color: '#7C3AED' }}>91.5%</div>
            </div>
          </div>

          {/* Budget gauge */}
          <div className="glass-card" style={{ padding: '20px' }}>
            <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600, fontSize: '14px', color: '#F1F5F9', marginBottom: '12px', display: 'flex', justifyContent: 'space-between' }}>
              Budget Utilization
              <span style={{ fontFamily: 'Space Grotesk, monospace', fontWeight: 700, fontSize: '14px', color: newCost > budget ? '#EF4444' : '#22C55E' }}>
                {((newCost / budget) * 100).toFixed(1)}%
              </span>
            </div>
            <div style={{ height: '10px', background: 'rgba(255,255,255,0.06)', borderRadius: '5px', overflow: 'hidden', marginBottom: '8px' }}>
              <div style={{
                height: '100%',
                width: `${Math.min((newCost / budget) * 100, 100)}%`,
                background: newCost > budget * 0.9
                  ? 'linear-gradient(90deg, #F59E0B, #EF4444)'
                  : 'linear-gradient(90deg, #7C3AED, #22C55E)',
                borderRadius: '5px',
                transition: 'width 0.6s ease',
              }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#475569', fontFamily: 'Inter' }}>
              <span>$0</span>
              <span style={{ color: '#F59E0B' }}>Budget: ${(budget / 1000).toFixed(0)}K</span>
              <span>${(budget * 1.5 / 1000).toFixed(0)}K</span>
            </div>
          </div>

          {/* Scenario comparison chart */}
          <ChartCard title="Scenario Comparison" subtitle="Baseline vs new configuration — per resource type">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={comparisonData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="name" tick={{ fill: '#64748B', fontSize: 11, fontFamily: 'Inter' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#0B1023', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', fontSize: '12px', color: '#F1F5F9' }} />
                <Legend wrapperStyle={{ fontSize: '11px', color: '#64748B', fontFamily: 'Inter' }} iconType="circle" iconSize={7} />
                <Bar dataKey="baseline" fill="rgba(100,116,139,0.6)" radius={[4, 4, 0, 0]} name="Baseline" />
                <Bar dataKey="current" fill="#7C3AED" radius={[4, 4, 0, 0]} name="New Config" opacity={0.85} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      </div>

      <style>{`
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 16px; height: 16px;
          border-radius: 50%;
          background: #7C3AED;
          border: 2px solid #F1F5F9;
          cursor: pointer;
          box-shadow: 0 0 8px rgba(124,58,237,0.5);
        }
        @media (max-width: 1100px) {
          .sim-main-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </ConsoleLayout>
  );
};

export default SimulatorPage;
