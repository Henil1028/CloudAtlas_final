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
            <h1 className="text-base font-bold text-white">Cloud Migration Intelligence</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Based on <span className="text-blue-400 font-semibold">{(data.totalRecords || 0).toLocaleString()} records</span> · Live CSV data
            </p>
          </div>
          <button onClick={fetchData} className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition">
            <RefreshCw size={12} /> Refresh
          </button>
        </div>

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
                <div className="text-[10px] text-slate-400">Current</div>
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
                <div className="text-[10px] text-slate-400">Target</div>
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
            <span className="text-[10px] text-slate-400">Top services from your CSV</span>
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
          <span className="text-xs font-bold text-slate-200 block">Provider Performance Scores</span>

          {['gcp', 'azure', 'aws'].map((p, pi) => {
            const sc = scores[p] || {};
            const isWinner = p === data.recommendedProvider?.toLowerCase();
            const barColor = isWinner ? 'bg-emerald-500' : p === 'azure' ? 'bg-blue-500' : 'bg-amber-500';
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
                    {p.toUpperCase()} {isWinner && '★ Recommended'}
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

      </div>
    </ConsoleLayout>
  );
};

export default MigrationIntelligencePage;
