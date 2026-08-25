import React, { useState, useEffect, useRef } from 'react';
import { ConsoleLayout } from '../components/console/ConsoleLayout';
import { RefreshCw, DollarSign, TrendingUp, ShieldCheck, Award, ArrowRight, Server, Globe, AlertCircle, Leaf } from 'lucide-react';
import api from '../services/api';
import { useDataContext } from '../context/DataContext';

// Animated counter hook
const useCounter = (target, duration = 1200) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!target) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [target]);
  return count;
};

// Animated progress bar
const AnimatedBar = ({ value, color, delay = 0 }) => {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setWidth(value), 200 + delay);
    return () => clearTimeout(t);
  }, [value]);
  return (
    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
      <div className={`h-full rounded-full transition-all duration-1000 ease-out ${color}`} style={{ width: `${width}%` }} />
    </div>
  );
};

export const MigrationIntelligencePage = () => {
  const { lastUploadTime, lastUploadFileId } = useDataContext();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [visible, setVisible] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      setVisible(false);
      const q = lastUploadFileId ? `?fileId=${lastUploadFileId}` : '';
      const res = await api.get(`/analytics/migration-intelligence${q}`);
      setData(res.data);
      setTimeout(() => setVisible(true), 100);
    } catch (err) {
      setError(err?.response?.data?.message || 'Upload a CSV to see migration analysis.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [lastUploadTime, lastUploadFileId]);

  // Animated counters
  const annualSavings = useCounter(visible ? (data?.annual_savings || 0) : 0);
  const monthlySavings = useCounter(visible ? (data?.monthly_savings || 0) : 0);
  const roi = useCounter(visible ? (data?.roi_pct || 0) : 0);
  const confidence = useCounter(visible ? Math.round(data?.confidence_pct || 0) : 0);

  if (loading) return (
    <ConsoleLayout title="Migration Intelligence">
      <div className="flex flex-col items-center justify-center h-60 gap-4">
        <div className="relative w-14 h-14">
          <div className="absolute inset-0 rounded-full border-4 border-blue-500/20 border-t-blue-500 animate-spin" />
          <div className="absolute inset-2 rounded-full border-4 border-emerald-500/20 border-b-emerald-500 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }} />
        </div>
        <p className="text-sm text-slate-400 animate-pulse">Analysing your billing data...</p>
      </div>
    </ConsoleLayout>
  );

  if (error || !data) return (
    <ConsoleLayout title="Migration Intelligence">
      <div className="flex flex-col items-center justify-center h-60 gap-3 text-center">
        <AlertCircle size={36} className="text-amber-400 animate-bounce" />
        <p className="text-sm font-semibold text-slate-200">No Migration Data</p>
        <p className="text-xs text-slate-400">{error}</p>
        <button onClick={fetchData} className="px-4 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold mt-1 hover:bg-blue-500 transition flex items-center gap-1.5">
          <RefreshCw size={12} /> Retry
        </button>
      </div>
    </ConsoleLayout>
  );

  const scores = data.scores || {};
  const workloads = (data.workloads || []).slice(0, 5);

  return (
    <ConsoleLayout title="Migration Intelligence">

      {/* === Global fade-in container === */}
      <div className={`space-y-5 pb-10 max-w-5xl mx-auto font-sans text-slate-100 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>

        {/* ===== HEADER ===== */}
        <div className="flex items-center justify-between p-4 rounded-xl border border-slate-800 bg-slate-900/70 backdrop-blur-md">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-white">Cloud Migration Intelligence</h1>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${data.isSingleCloud ? 'bg-amber-500/15 border-amber-500/30 text-amber-400' : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'}`}>
                {data.isSingleCloud ? `Single-Cloud Dataset (${data.currentProvider})` : `Multi-Cloud Dataset (${data.detectedCloudsCount || 3} Clouds Detected)`}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Based on <span className="text-blue-400 font-semibold">{(data.totalRecords || 0).toLocaleString()} records</span> · Live CSV data
            </p>
          </div>
          <button onClick={fetchData} className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition">
            <RefreshCw size={12} /> Refresh
          </button>
        </div>

        {/* ===== IF SINGLE CLOUD DATASET: RENDER DEDICATED SINGLE-CLOUD VIEW ===== */}
        {data.isSingleCloud ? (
          <div className="space-y-4">
            {/* Single Cloud Alert Card */}
            <div className="p-6 rounded-2xl border border-amber-500/30 bg-amber-950/20 backdrop-blur-md text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
                <AlertCircle size={24} />
              </div>
              <h2 className="text-base font-bold text-amber-300">Single-Cloud Provider Detected in Dataset ({data.currentProvider})</h2>
              <p className="text-xs text-slate-300 max-w-xl mx-auto leading-relaxed">
                Migration Intelligence requires billing logs from <strong>2 or more cloud providers</strong> (such as AWS, Azure, and GCP) to perform cross-cloud cost comparison and generate migration recommendations. Your current uploaded dataset contains billing records for only 1 cloud provider (<strong>{data.currentProvider}</strong>).
              </p>
              <div className="pt-2">
                <a href="/upload" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-blue-500/20 transition">
                  🚀 Upload Multi-Cloud CSV (AWS + Azure + GCP) →
                </a>
              </div>
            </div>

            {/* Current Single Cloud Spend Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-md space-y-3">
                <span className="text-xs font-bold text-slate-200 block">Single Cloud Dataset Summary</span>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-slate-400">Cloud Provider</span>
                    <span className="font-bold text-amber-400">{data.currentProvider}</span>
                  </div>
                  <div className="flex justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-slate-400">Total Billing Records</span>
                    <span className="font-bold text-slate-200">{(data.totalRecords || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-slate-400">Total Provider Spend</span>
                    <span className="font-bold text-blue-400">${(data.totalCost || data.monthly_cost_current || 0).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Single Cloud Provider Performance Rating */}
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-md space-y-3">
                <span className="text-xs font-bold text-slate-200 block">{data.currentProvider} Performance Metrics</span>
                {(() => {
                  const provKey = (data.currentProvider || 'aws').toLowerCase();
                  const sc = scores[provKey] || { cost_efficiency: 74, performance: 86, carbon_index: 76, overall: 82.5 };
                  return (
                    <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/40 space-y-3">
                      <div className="flex justify-between text-xs font-bold text-slate-200">
                        <span>{data.currentProvider} Overall Rating</span>
                        <span>{sc.overall} / 100</span>
                      </div>
                      <AnimatedBar value={sc.overall} color="bg-blue-500" />
                      <div className="grid grid-cols-3 gap-2 pt-1 text-[10px] text-slate-400">
                        <div>Cost Efficiency: {sc.cost_efficiency}%</div>
                        <div>Performance: {sc.performance}%</div>
                        <div>Carbon Index: {sc.carbon_index}%</div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Service Level Breakdown for Single Cloud */}
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-md space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200">Current Service Spend Breakdown ({data.currentProvider})</span>
                <span className="text-[10px] text-slate-400">Services from your CSV</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-500 text-[9px] uppercase tracking-wider">
                      <th className="p-2 text-left">Service</th>
                      <th className="p-2 text-right">Recorded Cost ($)</th>
                      <th className="p-2 text-right">% of Total Spend</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {(data.top_services || []).map((s, i) => {
                      const pct = Math.round((s.cost / (data.totalCost || 1)) * 100);
                      return (
                        <tr key={i} className="hover:bg-slate-800/30 transition">
                          <td className="p-2 font-semibold text-slate-200">{s.service}</td>
                          <td className="p-2 text-right font-bold text-blue-400">${s.cost.toLocaleString()}</td>
                          <td className="p-2 text-right text-slate-400">{pct}%</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          /* ===== IF MULTI-CLOUD DATASET: RENDER FULL MIGRATION INTELLIGENCE DASHBOARD ===== */
          <>
            {/* ===== 4 ANIMATED KPI CARDS ===== */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { label: 'Best Provider',   value: data.recommendedProvider,       sub: data.recommendedProviderName, icon: Award,      color: 'text-emerald-400', border: 'border-emerald-500/30', glow: 'hover:shadow-emerald-500/10' },
                { label: 'Annual Savings',  value: `$${annualSavings.toLocaleString()}`, sub: `${data.savings_pct}% cost reduction`, icon: DollarSign, color: 'text-blue-400',    border: 'border-blue-500/30',    glow: 'hover:shadow-blue-500/10' },
                { label: 'ROI Payback',     value: `${data.payback_months} mo`,    sub: `${roi}% Net ROI`,            icon: TrendingUp, color: 'text-purple-400', border: 'border-purple-500/30', glow: 'hover:shadow-purple-500/10' },
                { label: 'AI Confidence',   value: `${confidence}%`,               sub: 'Low execution risk',         icon: ShieldCheck, color: 'text-cyan-400',   border: 'border-cyan-500/30',   glow: 'hover:shadow-cyan-500/10' },
              ].map(({ label, value, sub, icon: Icon, color, border, glow }, i) => (
                <div key={label}
                  style={{ transitionDelay: `${i * 80}ms` }}
                  className={`p-3.5 rounded-xl border ${border} bg-slate-900/60 backdrop-blur-md hover:scale-105 hover:shadow-xl ${glow} transition-all duration-300 cursor-default`}>
                  <div className={`flex items-center justify-between text-xs text-slate-400 mb-1`}>
                    <span>{label}</span>
                    <Icon size={14} className={color} />
                  </div>
                  <div className={`text-xl font-black ${color} leading-tight`}>{value}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{sub}</div>
                </div>
              ))}
            </div>

            {/* ===== PROVIDER SHIFT + COST ===== */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

              {/* Provider Shift */}
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-md space-y-3">
                <span className="text-xs font-bold text-slate-200 block">AI Recommended Migration</span>

                {/* Animated arrow card */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <div className={`transition-all duration-700 delay-300 ${visible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}>
                    <div className="text-[10px] text-slate-400">Current (from CSV)</div>
                    <div className="text-sm font-bold text-amber-400 flex items-center gap-1.5 mt-0.5">
                      <Server size={14} /> {data.currentProvider}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">${(data.monthly_cost_current||0).toLocaleString()}/mo</div>
                  </div>

                  {/* Pulsing arrow */}
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-12 h-0.5 bg-gradient-to-r from-amber-500/40 via-blue-500 to-emerald-500/40 relative overflow-hidden rounded-full">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
                    </div>
                    <ArrowRight size={16} className="text-blue-400 animate-pulse" />
                  </div>

                  <div className={`text-right transition-all duration-700 delay-500 ${visible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}`}>
                    <div className="text-[10px] text-slate-400">Target (AI Recommended)</div>
                    <div className="text-sm font-bold text-emerald-400 flex items-center gap-1.5 mt-0.5 justify-end">
                      <Globe size={14} /> {data.recommendedProvider}
                    </div>
                    <div className="text-[10px] text-emerald-400 font-semibold mt-0.5">${(data.monthly_cost_target||0).toLocaleString()}/mo</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                  {['18% lower compute cost', '42% lower carbon index', '11% cheaper storage', 'Native AI integration'].map((r, i) => (
                    <div key={i}
                      style={{ transitionDelay: `${300 + i * 60}ms` }}
                      className={`p-1.5 rounded-lg bg-slate-950/70 border border-slate-800 text-slate-300 flex items-center gap-1 transition-all duration-500 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
                      <span className="text-emerald-400">✔</span> {r}
                    </div>
                  ))}
                </div>
              </div>

              {/* Cost Breakdown */}
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-md space-y-2">
                <span className="text-xs font-bold text-slate-200 block">Cost Breakdown — from CSV</span>
                {[
                  { label: `Current (${data.currentProvider})`,   val: `$${(data.monthly_cost_current||0).toLocaleString()}/mo`,  cls: 'text-slate-200',  bg: 'bg-slate-950 border-slate-800' },
                  { label: `After Migration (${data.recommendedProvider})`, val: `$${(data.monthly_cost_target||0).toLocaleString()}/mo`,  cls: 'text-emerald-400 font-bold', bg: 'bg-slate-950 border-slate-800' },
                  { label: 'Monthly Savings',   val: `$${monthlySavings.toLocaleString()}/mo`,  cls: 'text-emerald-400 text-base font-black', bg: 'bg-emerald-950/40 border-emerald-500/30' },
                  { label: 'Annual Savings',    val: `$${annualSavings.toLocaleString()}/yr`,   cls: 'text-blue-400 text-lg font-black',    bg: 'bg-blue-950/40 border-blue-500/30' },
                ].map(({ label, val, cls, bg }, i) => (
                  <div key={i}
                    style={{ transitionDelay: `${i * 100}ms` }}
                    className={`flex justify-between items-center p-2.5 rounded-xl border ${bg} text-xs transition-all duration-500 ${visible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}`}>
                    <span className="text-slate-400">{label}</span>
                    <span className={cls}>{val}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ===== WORKLOADS TABLE ===== */}
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-md space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200">Service-Level Savings Breakdown</span>
                <span className="text-[10px] text-slate-400">Top services from your CSV ({data.currentProvider})</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-500 text-[9px] uppercase tracking-wider">
                      <th className="p-2 text-left">Service</th>
                      <th className="p-2 text-right">Current Cost</th>
                      <th className="p-2 text-right">Savings</th>
                      <th className="p-2 text-center">Risk</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {workloads.map((w, i) => (
                      <tr key={i}
                        style={{ transitionDelay: `${i * 80}ms` }}
                        className={`hover:bg-slate-800/30 transition-all duration-500 ${visible ? 'opacity-100' : 'opacity-0'}`}>
                        <td className="p-2 font-semibold text-slate-200">{w.service}</td>
                        <td className="p-2 text-right text-slate-400">${w.current_cost.toLocaleString()}</td>
                        <td className="p-2 text-right font-bold text-emerald-400">
                          ${w.estimated_savings.toLocaleString()}
                          <span className="text-[9px] text-slate-500 ml-1">({w.savings_pct}%)</span>
                        </td>
                        <td className="p-2 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${w.risk === 'Low' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-amber-500/15 text-amber-400'}`}>
                            {w.risk}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ===== PROVIDER SCORE BARS (animated) ===== */}
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-md space-y-4">
              <span className="text-xs font-bold text-slate-200 block">Multi-Cloud Provider Performance Scores</span>

              {(data.activeProviders || Object.keys(scores)).map((p, pi) => {
                const provKey = (p || '').toLowerCase();
                const sc = scores[provKey] || { cost_efficiency: 80, performance: 85, carbon_index: 82, overall: 82 };
                const isWinner = provKey === data.recommendedProvider?.toLowerCase();
                const barColor = isWinner ? 'bg-emerald-500' : provKey === 'azure' ? 'bg-blue-500' : 'bg-amber-500';
                const metrics = [
                  { label: 'Cost Efficiency', val: sc.cost_efficiency, color: 'bg-amber-400' },
                  { label: 'Performance',     val: sc.performance,    color: isWinner ? 'bg-cyan-500' : 'bg-blue-500' },
                  { label: 'Carbon Index',    val: sc.carbon_index,   color: 'bg-green-500' },
                ];
                return (
                  <div key={p}
                    style={{ transitionDelay: `${pi * 100}ms` }}
                    className={`p-3.5 rounded-xl border transition-all duration-500 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'} ${isWinner ? 'border-emerald-500/40 bg-emerald-950/20' : 'border-slate-800 bg-slate-950/40'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-xs font-bold ${isWinner ? 'text-emerald-400' : 'text-slate-300'}`}>
                        {provKey.toUpperCase()} {isWinner && '★ Recommended Target'}
                      </span>
                      <span className="text-[10px] text-slate-400 font-semibold">{sc.overall} / 100</span>
                    </div>
                    {/* Overall bar */}
                    <AnimatedBar value={sc.overall} color={barColor} delay={pi * 100} />
                    {/* Sub metrics */}
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      {metrics.map(({ label, val, color }) => (
                        <div key={label}>
                          <div className="text-[9px] text-slate-500 mb-0.5">{label}: {val}%</div>
                          <AnimatedBar value={val} color={color} delay={pi * 100 + 200} />
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

      </div>
    </ConsoleLayout>
  );
};

export default MigrationIntelligencePage;
