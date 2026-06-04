import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';
import api from '../services/api';
import {
  TrendingUp,
  Activity,
  FileText,
  DollarSign,
  Filter,
  RefreshCw,
  Sparkles,
  PieChart as PieChartIcon,
  BarChart3,
  Grid3X3,
  Calendar,
  Layers,
  Download,
  AlertTriangle,
  Info,
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend
} from 'recharts';

export const AnalyticsPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Tab/view state for charts
  const [trendsTab, setTrendsTab] = useState('daily'); // 'daily' or 'monthly'

  // Analytics API states
  const [summaryData, setSummaryData] = useState({
    totalCost: 0,
    averageCost: 0,
    statistics: {},
    insights: []
  });
  const [qualityReport, setQualityReport] = useState({
    totalRecords: 0,
    cleanedRecords: 0,
    missingValues: 0,
    duplicateRecords: 0,
    nullPercentage: 0,
    qualityScore: 100
  });
  const [trendsData, setTrendsData] = useState({
    dailySpend: [],
    monthlySpend: []
  });
  const [providerSpend, setProviderSpend] = useState({});
  const [topServices, setTopServices] = useState([]);
  const [correlationMatrix, setCorrelationMatrix] = useState({});
  
  // Filter lists from main Node database
  const [uniqueServices, setUniqueServices] = useState([]);
  const [uniqueProviders, setUniqueProviders] = useState([]);

  // Active filters
  const [filters, setFilters] = useState({
    provider: '',
    service: '',
    region: '',
    usageType: '',
    costMin: '',
    costMax: '',
    dateMin: '',
    dateMax: '',
  });

  const [isFilterExpanded, setIsFilterExpanded] = useState(true);

  // Fetch unique service/provider list from Node server
  const fetchFilterLists = async () => {
    try {
      const [srvRes, provRes] = await Promise.all([
        api.get('/billing/services'),
        api.get('/billing/providers')
      ]);
      setUniqueServices(srvRes.data || []);
      setUniqueProviders(provRes.data || []);
    } catch (err) {
      console.error('Error fetching dynamic filter lists:', err);
    }
  };

  // Main analytics fetch
  const fetchAnalytics = async (currentFilters = filters) => {
    setLoading(true);
    setError(null);
    
    // Build query params
    const params = {};
    Object.keys(currentFilters).forEach(key => {
      if (currentFilters[key]) {
        params[key] = currentFilters[key];
      }
    });

    try {
      const [summaryRes, qualityRes, trendsRes, providersRes, servicesRes, correlationRes] = 
        await Promise.all([
          api.get('/analytics/summary', { params }),
          api.get('/analytics/quality', { params }),
          api.get('/analytics/trends', { params }),
          api.get('/analytics/providers', { params }),
          api.get('/analytics/services', { params }),
          api.get('/analytics/correlation', { params })
        ]);

      setSummaryData(summaryRes.data);
      setQualityReport(qualityRes.data);
      setTrendsData(trendsRes.data);
      setProviderSpend(providersRes.data);
      setTopServices(servicesRes.data);
      setCorrelationMatrix(correlationRes.data);
    } catch (err) {
      console.error('Error loading analytics engine data:', err);
      if (err.response?.status === 429) {
        setError(err.response?.data?.message || 'Analytics request limit exceeded. Try again later.');
      } else {
        setError(err.response?.data?.message || 'Failed to communicate with Django Analytics microservice.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFilterLists();
    fetchAnalytics();
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleApplyFilters = (e) => {
    e.preventDefault();
    fetchAnalytics(filters);
  };

  const handleResetFilters = () => {
    const reset = {
      provider: '',
      service: '',
      region: '',
      usageType: '',
      costMin: '',
      costMax: '',
      dateMin: '',
      dateMax: '',
    };
    setFilters(reset);
    fetchAnalytics(reset);
  };

  // Secured CSV/JSON Downloads using Auth token and Blob
  const handleExport = async (format) => {
    try {
      const params = { format };
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          params[key] = filters[key];
        }
      });

      const response = await api.get('/analytics/export', {
        params,
        responseType: format === 'csv' ? 'blob' : 'json'
      });

      if (format === 'csv') {
        const blob = new Blob([response.data], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `cloudatlas_analytics_${Date.now()}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      } else {
        const jsonStr = JSON.stringify(response.data, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `cloudatlas_analytics_${Date.now()}.json`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error('Export download failure:', err);
      if (err.response?.status === 429) {
        alert(err.response?.data?.message || 'Export limit exceeded.');
      } else {
        alert('Failed to export dataset. Please check backend rate limit.');
      }
    }
  };

  // Format currency values
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val || 0);
  };

  // Recharts Provider Pie formatting
  const pieColors = {
    aws: '#E87F24', // Sunset orange
    azure: '#3b82f6', // Ocean blue
    gcp: '#22c55e', // Grass green
    unknown: '#6b7280' // Gray
  };

  const getPieChartData = () => {
    if (!providerSpend || Object.keys(providerSpend).length === 0) return [];
    return Object.keys(providerSpend).map(provider => ({
      name: provider.toUpperCase(),
      value: providerSpend[provider] || 0,
      color: pieColors[provider] || '#e2a84b'
    })).filter(item => item.value > 0);
  };

  // Rendering circular data quality SVG gauge
  const renderQualityGauge = (score) => {
    const radius = 55;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (score / 100) * circumference;

    let scoreColorClass = 'text-primary';
    if (score >= 90) scoreColorClass = 'text-orange-500';
    else if (score >= 75) scoreColorClass = 'text-gold';
    else scoreColorClass = 'text-red-500';

    return (
      <div className="relative flex flex-col items-center justify-center">
        <svg className="w-36 h-36 transform -rotate-90">
          {/* Background circle */}
          <circle
            cx="72"
            cy="72"
            r={radius}
            className="stroke-navy-light"
            strokeWidth="10"
            fill="transparent"
          />
          {/* Foreground circle with stroke-dashoffset */}
          <circle
            cx="72"
            cy="72"
            r={radius}
            className="stroke-primary"
            strokeWidth="10"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center">
          <span className={`text-3xl font-black ${scoreColorClass} glow-text`}>{score}</span>
          <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">SCORE</span>
        </div>
      </div>
    );
  };

  // Variables list for correlation heatmap grid
  const correlationVariables = [
    { key: 'cost', label: 'Cost' },
    { key: 'day', label: 'Day' },
    { key: 'month', label: 'Month' },
    { key: 'year', label: 'Year' },
    { key: 'week_number', label: 'Week #' },
    { key: 'is_weekend', label: 'Weekend' },
    { key: 'provider_code', label: 'Provider' },
    { key: 'service_code', label: 'Service' },
    { key: 'region_code', label: 'Region' }
  ];

  return (
    <div className="min-h-screen bg-navy-dark flex flex-col grid-bg text-white">
      <Navbar />

      <div className="pt-28 pb-16 flex-grow mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Main Title Row */}
        <div className="mb-8 flex flex-col md:flex-row justify-between md:items-center gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-5 w-5 text-primary animate-pulse" />
              <span className="text-xs font-bold text-primary uppercase tracking-widest">
                FinOps Analytics Architect
              </span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">
              CloudAtlas <span className="text-primary glow-text">AI</span> Analytics Engine
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Data Cleaning, Exploratory Data Analysis, Feature Engineering pipeline & ML datasets.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setIsFilterExpanded(!isFilterExpanded)}
              className="inline-flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 px-5 py-3 text-sm font-semibold hover:bg-white/10 transition-all cursor-pointer"
            >
              <Filter className="h-4.5 w-4.5 text-primary" />
              {isFilterExpanded ? 'Hide Filters' : 'Show Filters'}
            </button>
            <button
              onClick={() => {
                fetchFilterLists();
                fetchAnalytics();
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 px-5 py-3 text-sm font-semibold hover:bg-white/10 transition-all cursor-pointer"
            >
              <RefreshCw className="h-4 w-4 text-gray-400" />
              Refresh Analytics
            </button>
          </div>
        </div>

        {/* Global Error Banner */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold">{error}</p>
              <p className="text-xs text-red-400 mt-0.5">Please check system limits or try again later.</p>
            </div>
          </div>
        )}

        {/* Dynamic Filters Form */}
        {isFilterExpanded && (
          <form onSubmit={handleApplyFilters} className="glass-card rounded-2xl p-6 border-white/5 mb-8 transition-all">
            <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
              <span className="text-sm font-bold flex items-center gap-2">
                <Filter className="h-4.5 w-4.5 text-primary" />
                Filter Engine Pipeline
              </span>
              <span className="text-xs text-gray-400">Apply criteria to clean and analyze specific segments.</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              {/* Provider Selection */}
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Provider</label>
                <select
                  name="provider"
                  value={filters.provider}
                  onChange={handleFilterChange}
                  className="block w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-primary/50 cursor-pointer"
                >
                  <option value="" className="bg-navy-deep">All Providers</option>
                  {uniqueProviders.map(p => (
                    <option key={p} value={p} className="bg-navy-deep uppercase">{p}</option>
                  ))}
                </select>
              </div>

              {/* Service Selection */}
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Service</label>
                <select
                  name="service"
                  value={filters.service}
                  onChange={handleFilterChange}
                  className="block w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-primary/50 cursor-pointer"
                >
                  <option value="" className="bg-navy-deep">All Services</option>
                  {uniqueServices.map(s => (
                    <option key={s} value={s} className="bg-navy-deep">{s}</option>
                  ))}
                </select>
              </div>

              {/* Region Search */}
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Region</label>
                <input
                  type="text"
                  name="region"
                  placeholder="e.g. us-east-1"
                  value={filters.region}
                  onChange={handleFilterChange}
                  className="block w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-primary/50"
                />
              </div>

              {/* Usage Type Search */}
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Usage Type</label>
                <input
                  type="text"
                  name="usageType"
                  placeholder="e.g. ComputeInstance"
                  value={filters.usageType}
                  onChange={handleFilterChange}
                  className="block w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-primary/50"
                />
              </div>

              {/* Date Min */}
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Date Range Start</label>
                <input
                  type="date"
                  name="dateMin"
                  value={filters.dateMin}
                  onChange={handleFilterChange}
                  className="block w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-primary/50"
                />
              </div>

              {/* Date Max */}
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Date Range End</label>
                <input
                  type="date"
                  name="dateMax"
                  value={filters.dateMax}
                  onChange={handleFilterChange}
                  className="block w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-primary/50"
                />
              </div>

              {/* Min Cost */}
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Min Cost ($)</label>
                <input
                  type="number"
                  name="costMin"
                  placeholder="0"
                  value={filters.costMin}
                  onChange={handleFilterChange}
                  className="block w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-primary/50"
                />
              </div>

              {/* Max Cost */}
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Max Cost ($)</label>
                <input
                  type="number"
                  name="costMax"
                  placeholder="5000"
                  value={filters.costMax}
                  onChange={handleFilterChange}
                  className="block w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-primary/50"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold hover:bg-white/10 transition-all cursor-pointer"
              >
                Clear
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-primary text-xs font-bold text-white hover:bg-primary-hover shadow-lg shadow-primary/20 glow-button transition-all cursor-pointer"
              >
                Execute Pipeline
              </button>
            </div>
          </form>
        )}

        {/* Loading Spinner */}
        {loading ? (
          <div className="glass-card rounded-2xl p-20 text-center border-white/5">
            <RefreshCw className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
            <p className="text-gray-300 font-semibold text-lg">Running Analytics Pipeline...</p>
            <p className="text-gray-500 text-xs mt-1">
              Pandas is cleaning data, running feature engineering, and computing statistics.
            </p>
          </div>
        ) : (
          <>
            {/* Summary statistics row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Card 1: Spend overview */}
              <div className="glass-card rounded-2xl p-6 border-white/5 flex flex-col justify-between relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <DollarSign className="h-20 w-20 text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      Analyzed Pipeline Spend
                    </span>
                  </div>
                  <h3 className="text-3xl font-black text-white mt-2 glow-text">
                    {formatCurrency(summaryData.totalCost)}
                  </h3>
                  <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-white/5">
                    <div>
                      <span className="text-[10px] font-medium text-gray-500 block uppercase">Average cost</span>
                      <span className="text-base font-bold text-white">{formatCurrency(summaryData.averageCost)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-medium text-gray-500 block uppercase">Median cost</span>
                      <span className="text-base font-bold text-white">{formatCurrency(summaryData.statistics?.median)}</span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 text-[10px] text-primary font-semibold flex items-center gap-1">
                  <TrendingUp className="h-3.5 w-3.5" /> Derived from {qualityReport.cleanedRecords} cleaned items
                </div>
              </div>

              {/* Card 2: Descriptive stats */}
              <div className="glass-card rounded-2xl p-6 border-white/5 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Activity className="h-20 w-20 text-gold" />
                </div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Statistical Dispersion
                </span>
                <div className="grid grid-cols-2 gap-x-4 gap-y-3 mt-4">
                  <div className="p-2.5 rounded-xl bg-white/[0.01] border border-white/5">
                    <span className="text-[9px] text-gray-500 uppercase block font-semibold">Standard Dev</span>
                    <span className="text-sm font-bold text-white">{formatCurrency(summaryData.statistics?.std_dev)}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/[0.01] border border-white/5">
                    <span className="text-[9px] text-gray-500 uppercase block font-semibold">Variance</span>
                    <span className="text-sm font-bold text-white">{(summaryData.statistics?.variance || 0).toLocaleString()}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/[0.01] border border-white/5">
                    <span className="text-[9px] text-gray-500 uppercase block font-semibold">Min Cost</span>
                    <span className="text-sm font-bold text-white">{formatCurrency(summaryData.statistics?.min)}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/[0.01] border border-white/5">
                    <span className="text-[9px] text-gray-500 uppercase block font-semibold">Max Cost</span>
                    <span className="text-sm font-bold text-white">{formatCurrency(summaryData.statistics?.max)}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/[0.01] border border-white/5">
                    <span className="text-[9px] text-gray-500 uppercase block font-semibold">25th Percentile</span>
                    <span className="text-sm font-bold text-white">{formatCurrency(summaryData.statistics?.percentile_25)}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/[0.01] border border-white/5">
                    <span className="text-[9px] text-gray-500 uppercase block font-semibold">75th Percentile</span>
                    <span className="text-sm font-bold text-white">{formatCurrency(summaryData.statistics?.percentile_75)}</span>
                  </div>
                </div>
              </div>

              {/* Card 3: Data Quality Circular score */}
              <div className="glass-card rounded-2xl p-6 border-white/5 flex flex-col md:flex-row items-center gap-6">
                <div className="flex-shrink-0">
                  {renderQualityGauge(qualityReport.qualityScore)}
                </div>
                <div className="flex-grow w-full space-y-2.5">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400">Data Quality Report</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex justify-between border-b border-white/5 pb-1">
                      <span className="text-gray-500 font-medium">Raw Records:</span>
                      <span className="font-bold text-white">{qualityReport.totalRecords}</span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-1">
                      <span className="text-gray-500 font-medium">Cleaned Rows:</span>
                      <span className="font-bold text-white">{qualityReport.cleanedRecords}</span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-1">
                      <span className="text-gray-500 font-medium">Duplicates:</span>
                      <span className="font-bold text-orange-400">{qualityReport.duplicateRecords}</span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-1">
                      <span className="text-gray-500 font-medium">Missing Fixed:</span>
                      <span className="font-bold text-yellow-400">{qualityReport.missingValues}</span>
                    </div>
                  </div>
                  <div className="pt-1.5 flex items-center gap-1.5 text-[10px] text-green-400 font-semibold">
                    <CheckCircle className="h-3.5 w-3.5" /> Pipeline Status: ML-Ready Dataset
                  </div>
                </div>
              </div>
            </div>

            {/* Trends visualization section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              
              {/* Cost trends plot */}
              <div className="lg:col-span-2 glass-card rounded-2xl p-6 border-white/5">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                  <div>
                    <h3 className="text-sm font-bold flex items-center gap-2">
                      <TrendingUp className="h-4.5 w-4.5 text-primary" />
                      Cost Trends Timeline
                    </h3>
                    <p className="text-[10px] text-gray-400 mt-0.5">Exploratory Data Analysis over time scales</p>
                  </div>
                  <div className="flex rounded-xl bg-white/5 p-1 border border-white/5">
                    <button
                      onClick={() => setTrendsTab('daily')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        trendsTab === 'daily' ? 'bg-primary text-white' : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      Daily
                    </button>
                    <button
                      onClick={() => setTrendsTab('monthly')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        trendsTab === 'monthly' ? 'bg-primary text-white' : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      Monthly
                    </button>
                  </div>
                </div>

                <div className="h-72 w-full">
                  {trendsTab === 'daily' ? (
                    trendsData.dailySpend?.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={trendsData.dailySpend}>
                          <defs>
                            <linearGradient id="colorDaily" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#E87F24" stopOpacity={0.4}/>
                              <stop offset="95%" stopColor="#E87F24" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                          <XAxis 
                            dataKey="date" 
                            stroke="#6b7280" 
                            fontSize={10}
                            tickLine={false}
                          />
                          <YAxis 
                            stroke="#6b7280" 
                            fontSize={10} 
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(val) => `$${val}`}
                          />
                          <Tooltip 
                            contentStyle={{ background: '#0f0f1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                            labelStyle={{ color: '#9ca3af', fontWeight: 'bold' }}
                            itemStyle={{ color: '#E87F24' }}
                            formatter={(value) => [formatCurrency(value), 'Spend']}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="cost" 
                            stroke="#E87F24" 
                            strokeWidth={2}
                            fillOpacity={1} 
                            fill="url(#colorDaily)" 
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-xs text-gray-500">
                        No daily trends logs. Please upload CSV records.
                      </div>
                    )
                  ) : (
                    trendsData.monthlySpend?.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={trendsData.monthlySpend}>
                          <defs>
                            <linearGradient id="colorMonthly" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#e2a84b" stopOpacity={0.4}/>
                              <stop offset="95%" stopColor="#e2a84b" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                          <XAxis 
                            dataKey="month" 
                            stroke="#6b7280" 
                            fontSize={10}
                            tickLine={false}
                          />
                          <YAxis 
                            stroke="#6b7280" 
                            fontSize={10} 
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(val) => `$${val}`}
                          />
                          <Tooltip 
                            contentStyle={{ background: '#0f0f1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                            labelStyle={{ color: '#9ca3af', fontWeight: 'bold' }}
                            itemStyle={{ color: '#e2a84b' }}
                            formatter={(value) => [formatCurrency(value), 'Spend']}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="cost" 
                            stroke="#e2a84b" 
                            strokeWidth={2}
                            fillOpacity={1} 
                            fill="url(#colorMonthly)" 
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-xs text-gray-500">
                        No monthly spend aggregates found.
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* Provider spend share (Pie Chart) */}
              <div className="glass-card rounded-2xl p-6 border-white/5 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold flex items-center gap-2 mb-2">
                    <PieChartIcon className="h-4.5 w-4.5 text-primary" />
                    Provider Allocation
                  </h3>
                  <p className="text-[10px] text-gray-400 mb-4">Cost footprint ratios across public clouds</p>
                </div>

                <div className="h-56 w-full relative flex items-center justify-center">
                  {getPieChartData().length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={getPieChartData()}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {getPieChartData().map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{ background: '#0f0f1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                          itemStyle={{ color: '#fff' }}
                          formatter={(value) => [formatCurrency(value), 'Allocated']}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <span className="text-xs text-gray-500">No multi-provider spend shares.</span>
                  )}
                  {/* Center percentage summary text */}
                  {getPieChartData().length > 0 && (
                    <div className="absolute flex flex-col items-center justify-center">
                      <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Ratio</span>
                      <span className="text-sm font-bold text-white">Consolidated</span>
                    </div>
                  )}
                </div>

                {/* Pie legend color markers */}
                <div className="flex justify-center gap-4 text-xs mt-4 pt-4 border-t border-white/5">
                  {getPieChartData().map((entry, idx) => (
                    <div key={idx} className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                      <span className="text-gray-300 font-semibold uppercase">{entry.name}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Top spending services + custom Heatmap row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              
              {/* Top Services ranking chart */}
              <div className="glass-card rounded-2xl p-6 border-white/5 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold flex items-center gap-2 mb-2">
                    <BarChart3 className="h-4.5 w-4.5 text-primary" />
                    Top Spending Service Modules
                  </h3>
                  <p className="text-[10px] text-gray-400 mb-6">Bar ranking for heavy cloud service modules</p>
                </div>

                <div className="h-80 w-full">
                  {topServices?.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={topServices.slice(0, 7)}
                        layout="vertical"
                        margin={{ left: 10, right: 30, top: 10, bottom: 10 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" horizontal={false} />
                        <XAxis type="number" stroke="#6b7280" fontSize={10} tickFormatter={(val) => `$${val}`} />
                        <YAxis dataKey="service" type="category" stroke="#6b7280" fontSize={10} width={80} tickLine={false} />
                        <Tooltip
                          contentStyle={{ background: '#0f0f1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                          formatter={(value) => [formatCurrency(value), 'Spend']}
                        />
                        <Bar dataKey="cost" fill="#E87F24" radius={[0, 8, 8, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-xs text-gray-500">
                      No services logs calculated.
                    </div>
                  )}
                </div>
              </div>

              {/* Correlation Matrix Custom Heatmap Grid */}
              <div className="glass-card rounded-2xl p-6 border-white/5 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold flex items-center gap-2 mb-2">
                    <Grid3X3 className="h-4.5 w-4.5 text-primary" />
                    Feature Correlation Matrix
                  </h3>
                  <p className="text-[10px] text-gray-400 mb-6">
                    Correlation coefficients for regression forecasting and feature selection.
                  </p>
                </div>

                {correlationMatrix && Object.keys(correlationMatrix).length > 0 ? (
                  <div className="flex-grow flex flex-col justify-center items-center">
                    <div className="overflow-x-auto w-full">
                      <div className="min-w-[400px] flex flex-col">
                        
                        {/* Headers row */}
                        <div className="flex items-center text-center">
                          <div className="w-20 flex-shrink-0 text-left text-[9px] font-bold text-gray-500 uppercase">Variable</div>
                          {correlationVariables.map((v, idx) => (
                            <div key={idx} className="flex-1 text-[9px] font-bold text-gray-400 uppercase py-1 truncate" title={v.label}>
                              {v.label}
                            </div>
                          ))}
                        </div>

                        {/* Matrix Rows */}
                        <div className="flex flex-col gap-1 mt-1">
                          {correlationVariables.map((rowVar, rIdx) => (
                            <div key={rIdx} className="flex items-center text-center h-8">
                              {/* Row Label */}
                              <div className="w-20 flex-shrink-0 text-left text-[9px] font-bold text-gray-300 truncate" title={rowVar.label}>
                                {rowVar.label}
                              </div>

                              {/* Columns for this Row */}
                              {correlationVariables.map((colVar, cIdx) => {
                                const val = correlationMatrix[rowVar.key]?.[colVar.key] ?? 0;
                                const absVal = Math.abs(val);
                                
                                // Color shading mapping
                                let cellBg = 'rgba(255, 255, 255, 0.03)';
                                if (val > 0) {
                                  // Positive correlation = Sunset Orange style
                                  cellBg = `rgba(232, 127, 36, ${absVal * 0.8})`;
                                } else if (val < 0) {
                                  // Negative correlation = Ocean Blue style
                                  cellBg = `rgba(59, 130, 246, ${absVal * 0.8})`;
                                }

                                return (
                                  <div
                                    key={cIdx}
                                    style={{ backgroundColor: cellBg }}
                                    className="flex-1 h-full rounded border border-navy-dark flex items-center justify-center text-xs font-bold text-white relative group/cell cursor-help"
                                  >
                                    <span>{val.toFixed(2)}</span>

                                    {/* Hover cell helper explanation */}
                                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover/cell:block z-50 w-48 bg-navy-surface border border-white/10 p-2.5 rounded-xl text-left text-[10px] text-gray-300 shadow-2xl">
                                      <p className="font-bold text-white border-b border-white/5 pb-1 mb-1 uppercase">
                                        {rowVar.label} × {colVar.label}
                                      </p>
                                      <p className="mb-1">Correlation: <span className="font-bold text-primary">{val.toFixed(3)}</span></p>
                                      <p className="text-gray-400 font-medium">
                                        {val === 1 ? 'Perfect positive correlation' :
                                         val > 0.5 ? 'Strong positive relation' :
                                         val > 0.1 ? 'Subtle positive relation' :
                                         val < -0.5 ? 'Strong negative relation' :
                                         val < -0.1 ? 'Subtle negative relation' :
                                         'Negligible relationship'}
                                      </p>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          ))}
                        </div>

                      </div>
                    </div>
                    {/* Visual Color Guide */}
                    <div className="flex gap-4 text-[10px] font-semibold text-gray-400 mt-4">
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-blue-500/50 rounded" />
                        <span>Negative (-1)</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-white/10 rounded" />
                        <span>Zero (0)</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-primary/70 rounded" />
                        <span>Positive (+1)</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-gray-500">
                    Correlation matrix unavailable.
                  </div>
                )}
              </div>

            </div>

            {/* Business Insights executive report */}
            <div className="glass-card rounded-2xl p-6 sm:p-8 border-white/5 mb-8">
              <div className="border-b border-white/5 pb-4 mb-5">
                <h3 className="text-sm font-bold flex items-center gap-2">
                  <Sparkles className="h-4.5 w-4.5 text-primary" />
                  Business Insights Engine (Executive Summary)
                </h3>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  Natural language insights generated automatically by Python Pandas parsing
                </p>
              </div>

              {summaryData.insights?.length > 0 ? (
                <ul className="space-y-3.5">
                  {summaryData.insights.map((insight, idx) => (
                    <li key={idx} className="flex gap-3 items-start p-3.5 rounded-xl bg-white/[0.01] border border-white/5 hover:border-white/10 transition-all">
                      <div className="mt-0.5 flex-shrink-0 flex h-5 w-5 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 text-primary">
                        <Sparkles className="h-3 w-3 animate-pulse" />
                      </div>
                      <p className="text-sm text-gray-300 font-medium leading-relaxed">
                        {insight}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-gray-500">No automated insights produced. Ingest billing records to calculate patterns.</p>
              )}
            </div>

            {/* Exporters panel */}
            <div className="glass-card rounded-2xl p-6 sm:p-8 border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <h3 className="text-base font-extrabold flex items-center gap-2">
                  <Download className="h-5 w-5 text-primary" />
                  Export Machine Learning Dataset
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  Download feature-engineered, cleaned ML-ready billing datasets.
                </p>
                <div className="flex flex-wrap gap-x-6 gap-y-2 mt-3 text-[10px] font-semibold text-gray-500">
                  <span className="flex items-center gap-1">
                    <Info className="h-3.5 w-3.5 text-primary" /> Features included: year, month, day, is_weekend, week_number, quarter
                  </span>
                  <span className="flex items-center gap-1">
                    <Info className="h-3.5 w-3.5 text-primary" /> Target: cost, provider_code, service_code, region_code
                  </span>
                </div>
              </div>

              <div className="flex gap-3 w-full md:w-auto">
                <button
                  onClick={() => handleExport('json')}
                  disabled={qualityReport.cleanedRecords === 0}
                  className="flex-grow md:flex-grow-0 inline-flex items-center justify-center gap-2 rounded-xl bg-white/5 border border-white/10 px-5 py-3 text-xs font-bold text-white hover:bg-white/10 disabled:opacity-50 transition-all cursor-pointer"
                >
                  <FileText className="h-4.5 w-4.5 text-orange-400" />
                  Export JSON
                </button>
                <button
                  onClick={() => handleExport('csv')}
                  disabled={qualityReport.cleanedRecords === 0}
                  className="flex-grow md:flex-grow-0 inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-xs font-bold text-white hover:bg-primary-hover shadow-lg shadow-primary/20 glow-button disabled:opacity-50 transition-all cursor-pointer"
                >
                  <Download className="h-4.5 w-4.5 text-white" />
                  Export Cleaned CSV
                </button>
              </div>
            </div>
          </>
        )}

      </div>
      
      <Footer />
    </div>
  );
};

export default AnalyticsPage;
