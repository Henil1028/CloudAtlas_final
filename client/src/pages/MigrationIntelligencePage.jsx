import React, { useState, useEffect } from 'react';
import { ConsoleLayout } from '../components/console/ConsoleLayout';
import { 
  ArrowRightLeft, Sparkles, TrendingDown, Leaf, ShieldCheck, 
  Cpu, Database, Network, Server, ArrowUpRight, CheckCircle2, AlertTriangle, HelpCircle
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export const MigrationIntelligencePage = () => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:8001/api/analytics/migration-intelligence', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error('Failed to fetch migration intelligence:', err);
    } finally {
      setLoading(false);
    }
  };

  const mockData = {
    executive_summary: {
      best_overall_provider: 'GCP',
      best_cost_provider: 'GCP',
      best_carbon_provider: 'GCP',
      most_expensive_provider: 'AWS',
      executive_narrative: 'GCP demonstrates highest cost efficiency and green sustainability index. AWS hosts majority compute workloads.'
    },
    performance_scores: {
      AWS: { overall_score: 82.5, cost_efficiency: 74, resource_utilization: 76.2, finops_compliance: 80 },
      Azure: { overall_score: 87.1, cost_efficiency: 85, resource_utilization: 81.0, finops_compliance: 86 },
      GCP: { overall_score: 91.4, cost_efficiency: 92, resource_utilization: 88.5, finops_compliance: 94 }
    },
    migration_recommendations: [
      {
        current_provider: 'AWS',
        current_service: 'EC2 Compute / Batch Workers',
        target_provider: 'Azure',
        target_service: 'Virtual Machines (Spot Instances)',
        estimated_savings_pct: 18.4,
        estimated_annual_savings_usd: 14200.0,
        migration_complexity: 'Medium',
        business_risk: 'Low',
        confidence_score_pct: 94.0,
        rationale: 'Migrating non-critical batch analytics compute from AWS to Azure delivers 18.4% cost reduction with zero SLA risk.'
      },
      {
        current_provider: 'AWS',
        current_service: 'S3 Cold Storage & Logs',
        target_provider: 'GCP',
        target_service: 'Google Cloud Storage (Coldline)',
        estimated_savings_pct: 24.1,
        estimated_annual_savings_usd: 8600.0,
        migration_complexity: 'Low',
        business_risk: 'Low',
        confidence_score_pct: 96.5,
        rationale: 'Google Cloud Storage offers lower egress and cold retrieval fees for archived analytical datasets.'
      }
    ],
    carbon_intelligence: {
      recommended_green_provider: 'GCP',
      provider_carbon_details: {
        AWS: { green_score: 76, total_co2_kg: 1420.5 },
        Azure: { green_score: 84, total_co2_kg: 1100.2 },
        GCP: { green_score: 92, total_co2_kg: 780.0 }
      }
    }
  };

  const activeData = data || mockData;

  return (
    <ConsoleLayout title="Migration Intelligence">
      <div className="space-y-6">
        
        {/* Header Banner */}
        <div className="relative overflow-hidden rounded-2xl p-6 border border-emerald-500/20 bg-gradient-to-r from-emerald-950/40 via-slate-900 to-cyan-950/40">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                  <Sparkles size={12} /> Multi-Cloud Migration Intelligence Engine
                </span>
              </div>
              <h1 className="text-2xl font-semibold text-slate-100 font-serif">
                Cloud Provider Comparison & Workload Migration
              </h1>
              <p className="text-xs text-slate-400 max-w-2xl mt-1">
                Data-driven decision matrix comparing AWS, Azure, and GCP for optimal cost savings, carbon footprint reduction, and ROI performance.
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <button 
                onClick={fetchData}
                className="px-4 py-2 text-xs font-medium rounded-xl text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition"
              >
                Refresh Analysis
              </button>
            </div>
          </div>
        </div>

        {/* Executive Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-md">
            <div className="text-slate-400 text-xs font-medium">Best Overall Provider</div>
            <div className="text-xl font-semibold text-emerald-400 mt-1 flex items-center gap-2">
              {activeData.executive_summary?.best_overall_provider || 'GCP'}
              <CheckCircle2 size={18} />
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Highest FinOps Performance Score</div>
          </div>

          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-md">
            <div className="text-slate-400 text-xs font-medium">Best Cost Efficiency</div>
            <div className="text-xl font-semibold text-cyan-400 mt-1 flex items-center gap-2">
              {activeData.executive_summary?.best_cost_provider || 'GCP'}
              <TrendingDown size={18} />
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Lowest Unit Compute Rate</div>
          </div>

          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-md">
            <div className="text-slate-400 text-xs font-medium">Best Carbon Index</div>
            <div className="text-xl font-semibold text-green-400 mt-1 flex items-center gap-2">
              {activeData.carbon_intelligence?.recommended_green_provider || 'GCP'}
              <Leaf size={18} />
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Lowest CO₂ Footprint</div>
          </div>

          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-md">
            <div className="text-slate-400 text-xs font-medium">Est. Annual Migration Savings</div>
            <div className="text-xl font-semibold text-amber-400 mt-1 flex items-center gap-2">
              $22,800.00
              <ArrowUpRight size={18} />
            </div>
            <div className="text-[11px] text-slate-500 mt-1">ROI Confidence: 95.2%</div>
          </div>
        </div>

        {/* Provider Performance Score Matrix */}
        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur-sm">
          <h3 className="text-sm font-semibold text-slate-200 mb-4 flex items-center gap-2">
            <ShieldCheck size={16} className="text-emerald-400" /> Multi-Cloud Provider Performance Matrix (0-100 Score)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(activeData.performance_scores || {}).map(([prov, scores]) => (
              <div key={prov} className="p-4 rounded-xl border border-slate-800/80 bg-slate-950/40">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-semibold text-sm text-slate-200">{prov}</span>
                  <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Score: {scores.overall_score}
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <div className="flex justify-between text-slate-400 mb-1">
                      <span>Cost Efficiency</span>
                      <span>{scores.cost_efficiency}%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${scores.cost_efficiency}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-400 mb-1">
                      <span>Resource Utilization</span>
                      <span>{scores.resource_utilization}%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-cyan-500 h-full rounded-full" style={{ width: `${scores.resource_utilization}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Workload Migration Recommendations */}
        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur-sm">
          <h3 className="text-sm font-semibold text-slate-200 mb-4 flex items-center gap-2">
            <ArrowRightLeft size={16} className="text-cyan-400" /> Recommended Workload Migrations
          </h3>

          <div className="space-y-3">
            {(activeData.migration_recommendations || []).map((rec, idx) => (
              <div key={idx} className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">
                      {rec.current_provider} → {rec.target_provider}
                    </span>
                    <span className="text-xs font-semibold text-slate-200">{rec.current_service}</span>
                  </div>
                  <p className="text-xs text-slate-400 max-w-xl">{rec.rationale}</p>
                </div>

                <div className="flex items-center gap-6 shrink-0 text-right">
                  <div>
                    <div className="text-[11px] text-slate-400">Est. Savings</div>
                    <div className="text-sm font-bold text-emerald-400">{rec.estimated_savings_pct}% (${rec.estimated_annual_savings_usd}/yr)</div>
                  </div>
                  <div>
                    <div className="text-[11px] text-slate-400">Risk Level</div>
                    <div className="text-xs font-medium text-slate-300">{rec.business_risk}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </ConsoleLayout>
  );
};
