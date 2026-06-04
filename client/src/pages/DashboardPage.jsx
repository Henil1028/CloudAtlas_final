import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';
import { exportToCSV } from '../services/csvService';
import api from '../services/api';
import {
  TrendingUp,
  Database,
  FileText,
  DollarSign,
  Search,
  Filter,
  ArrowRight,
  Upload,
  Calendar,
  Layers,
  ChevronLeft,
  ChevronRight,
  Trash2,
  RefreshCw,
  Sparkles,
  BarChart4,
  Loader2
} from 'lucide-react';

export const DashboardPage = () => {
  const { user } = useAuth();

  // Summary Metrics State
  const [summary, setSummary] = useState({
    totalCost: 0,
    averageCost: 0,
    totalRecords: 0,
    totalFiles: 0,
    providerSpend: { aws: 0, azure: 0, gcp: 0 },
    serviceSpend: [],
    dailySpend: [],
    monthlySpend: [],
    recentUploads: [],
  });

  // Table Records State
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  // Filter States
  const [search, setSearch] = useState('');
  const [provider, setProvider] = useState('');
  const [service, setService] = useState('');
  const [region, setRegion] = useState('');
  const [costMin, setCostMin] = useState('');
  const [costMax, setCostMax] = useState('');
  const [dateMin, setDateMin] = useState('');
  const [dateMax, setDateMax] = useState('');

  // Sorting State
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

  // Unique services & providers for selectors
  const [uniqueServices, setUniqueServices] = useState([]);
  const [uniqueProviders, setUniqueProviders] = useState([]);

  // Fetch summary analytics
  const fetchSummary = async () => {
    try {
      const response = await api.get('/billing/summary');
      setSummary(response.data);
    } catch (err) {
      console.error('Error fetching summary:', err);
    }
  };

  // Fetch unique lists for filter selectors
  const fetchFiltersLists = async () => {
    try {
      const srvResponse = await api.get('/billing/services');
      const provResponse = await api.get('/billing/providers');
      setUniqueServices(srvResponse.data);
      setUniqueProviders(provResponse.data);
    } catch (err) {
      console.error('Error fetching filters unique list:', err);
    }
  };

  // Fetch table records
  const fetchRecords = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 10,
        sortBy,
        sortOrder,
      };

      if (search) params.search = search;
      if (provider) params.provider = provider;
      if (service) params.service = service;
      if (region) params.region = region;
      if (costMin) params.costMin = costMin;
      if (costMax) params.costMax = costMax;
      if (dateMin) params.dateMin = dateMin;
      if (dateMax) params.dateMax = dateMax;

      const response = await api.get('/billing', { params });
      setRecords(response.data.records);
      setTotalPages(response.data.pagination.pages);
      setTotalRecords(response.data.pagination.total);
    } catch (err) {
      console.error('Error fetching records:', err);
    } finally {
      setLoading(false);
    }
  };

  // Export current filtered list
  const handleExport = async () => {
    try {
      const params = {
        limit: 5000, // retrieve larger batch for export
        sortBy,
        sortOrder,
      };
      if (search) params.search = search;
      if (provider) params.provider = provider;
      if (service) params.service = service;
      if (region) params.region = region;
      if (costMin) params.costMin = costMin;
      if (costMax) params.costMax = costMax;
      if (dateMin) params.dateMin = dateMin;
      if (dateMax) params.dateMax = dateMax;

      const response = await api.get('/billing', { params });
      exportToCSV(response.data.records, `cloudatlas_billing_${provider || 'all'}_export.csv`);
    } catch (err) {
      console.error('Error exporting dataset:', err);
    }
  };

  // Delete individual record
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this billing line item?')) return;
    try {
      await api.delete(`/billing/${id}`);
      fetchRecords();
      fetchSummary();
    } catch (err) {
      console.error('Error deleting record:', err);
      alert(err.response?.data?.message || 'Failed to delete record');
    }
  };

  useEffect(() => {
    fetchSummary();
    fetchFiltersLists();
  }, []);

  useEffect(() => {
    fetchRecords();
  }, [page, provider, service, sortBy, sortOrder, dateMin, dateMax]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchRecords();
  };

  const handleResetFilters = () => {
    setSearch('');
    setProvider('');
    setService('');
    setRegion('');
    setCostMin('');
    setCostMax('');
    setDateMin('');
    setDateMax('');
    setPage(1);
    // Fetch immediately
    setTimeout(() => fetchRecords(), 50);
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
    setPage(1);
  };

  const getProviderProgressWidth = (pSpend) => {
    const total = summary.totalCost;
    if (total === 0) return '0%';
    return `${Math.round((pSpend / total) * 100)}%`;
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
  };

  const isSuperAdmin = user?.role === 'super_admin';

  return (
    <div className="min-h-screen bg-navy-dark flex flex-col grid-bg text-white relative overflow-hidden">
      {/* Floating animated glowing orbs for premium visual vibe */}
      <div className="floating-orb orb-orange w-[400px] h-[400px] -top-20 -left-20" />
      <div className="floating-orb orb-navy w-[500px] h-[500px] top-1/3 -right-20" />
      <div className="floating-orb orb-gold w-[350px] h-[350px] bottom-10 left-1/3" />

      <Navbar />

      <div className="pt-28 pb-16 flex-grow mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header Console Row */}
        <div className="mb-10 flex flex-col sm:flex-row justify-between sm:items-center gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-5 w-5 text-primary animate-pulse" />
              <span className="text-xs font-semibold text-primary uppercase tracking-widest">FinOps Analytics Panel</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">Billing Ingestion Console</h1>
            <p className="text-gray-400 text-sm mt-1">
              Welcome, <span className="font-semibold text-white capitalize">{user?.name}</span>. Access cloud statistics and predictions.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {isSuperAdmin && (
              <Link
                to="/upload"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-orange-600 px-5 py-3 text-sm font-bold text-white hover:opacity-95 shadow-lg shadow-primary/20 glow-button transition-all"
              >
                <Upload className="h-4.5 w-4.5" />
                Upload Ingestion File
              </Link>
            )}
            <button
              onClick={() => {
                fetchSummary();
                fetchRecords();
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer"
            >
              <RefreshCw className="h-4 w-4 text-gray-400" />
              Refresh Data
            </button>
          </div>
        </div>

        {/* Analytics Statistics Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          
          {/* Stat 1: Total Spend */}
          <div className="glass-card rounded-2xl p-5 border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <DollarSign className="h-16 w-16 text-primary" />
            </div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Consolidated Cloud Spend</p>
            <h3 className="text-2xl sm:text-3xl font-black text-white mt-2">
              {formatCurrency(summary.totalCost)}
            </h3>
            <p className="text-[10px] text-primary font-semibold flex items-center gap-0.5 mt-1.5">
              <TrendingUp className="h-3.5 w-3.5" /> Multi-cloud unified runrate
            </p>
          </div>

          {/* Stat 2: Total Records */}
          <div className="glass-card rounded-2xl p-5 border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <Database className="h-16 w-16 text-gold" />
            </div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Ingested Line Items</p>
            <h3 className="text-2xl sm:text-3xl font-black text-white mt-2">
              {summary.totalRecords.toLocaleString()}
            </h3>
            <p className="text-[10px] text-gold font-semibold flex items-center gap-0.5 mt-1.5">
              <Layers className="h-3.5 w-3.5" /> Normalized database items
            </p>
          </div>

          {/* Stat 3: Avg cost */}
          <div className="glass-card rounded-2xl p-5 border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <BarChart4 className="h-16 w-16 text-green-400" />
            </div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Average Item Cost</p>
            <h3 className="text-2xl sm:text-3xl font-black text-white mt-2">
              {formatCurrency(summary.averageCost)}
            </h3>
            <p className="text-[10px] text-green-400 font-semibold flex items-center gap-0.5 mt-1.5">
              Cost value per row parsed
            </p>
          </div>

          {/* Stat 4: Ingested Files */}
          <div className="glass-card rounded-2xl p-5 border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <FileText className="h-16 w-16 text-blue-400" />
            </div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Audit File Uploads</p>
            <h3 className="text-2xl sm:text-3xl font-black text-white mt-2">
              {summary.totalFiles} Files
            </h3>
            <p className="text-[10px] text-blue-400 font-semibold flex items-center gap-0.5 mt-1.5">
              CSV documents parsed
            </p>
          </div>

        </div>

        {/* Provider Breakdown & Top services section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          
          {/* Provider Progress Bars (Left column) */}
          <div className="lg:col-span-1 glass-card rounded-2xl p-6 border-white/5">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-6">
              <Layers className="h-4.5 w-4.5 text-primary" />
              Provider Spend Breakdown
            </h3>
            
            <div className="space-y-5">
              {['aws', 'azure', 'gcp'].map((p) => {
                const pSpend = summary.providerSpend[p] || 0;
                const percent = getProviderProgressWidth(pSpend);
                return (
                  <div key={p} className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-gray-300 uppercase">{p}</span>
                      <span className="font-bold text-white">
                        {formatCurrency(pSpend)} ({percent})
                      </span>
                    </div>
                    <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden border border-white/5">
                      <div
                        style={{ width: percent }}
                        className={`h-full rounded-full ${
                          p === 'aws' ? 'bg-orange-500' : p === 'azure' ? 'bg-blue-500' : 'bg-green-500'
                        }`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top Expensive Services (Right column) */}
          <div className="lg:col-span-2 glass-card rounded-2xl p-6 border-white/5">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-5">
              <TrendingUp className="h-4.5 w-4.5 text-primary" />
              Top Cloud Services by Cost
            </h3>
            
            {summary.serviceSpend.length === 0 ? (
              <p className="text-xs text-gray-500">No services data available. Upload billing CSV logs.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {summary.serviceSpend.slice(0, 6).map((srv, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all">
                    <div>
                      <span className="text-xs font-bold text-gray-500 block uppercase">RANK #{idx + 1}</span>
                      <span className="text-sm font-semibold text-white truncate max-w-[150px] block mt-0.5">{srv.service}</span>
                    </div>
                    <span className="text-sm font-black text-primary">{formatCurrency(srv.cost)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Search, filters, and records table */}
        <div className="glass-card rounded-2xl p-6 sm:p-8 border-white/5 shadow-2xl mb-8">
          
          {/* Section Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-6 mb-6">
            <div>
              <h3 className="text-lg font-bold text-white">Consolidated Line Items</h3>
              <p className="text-xs text-gray-400 mt-0.5">Filter, search, and sort logs dynamically.</p>
            </div>
            
            <button
              onClick={handleExport}
              disabled={records.length === 0}
              className="inline-flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-xs font-bold text-white hover:bg-white/10 disabled:opacity-50 transition-all cursor-pointer"
            >
              <FileText className="h-4 w-4 text-primary" />
              Export Filtered CSV
            </button>
          </div>

          {/* Filters Panel */}
          <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Search Input */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                <Search className="h-4 w-4" />
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search service, region..."
                className="block w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 transition-all"
              />
            </div>

            {/* Provider Selector */}
            <select
              value={provider}
              onChange={(e) => {
                setProvider(e.target.value);
                setPage(1);
              }}
              className="block w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-primary/50 cursor-pointer appearance-none"
            >
              <option value="" className="bg-navy-deep">All Providers</option>
              {uniqueProviders.map(p => (
                <option key={p} value={p} className="bg-navy-deep uppercase">{p}</option>
              ))}
            </select>

            {/* Service Selector */}
            <select
              value={service}
              onChange={(e) => {
                setService(e.target.value);
                setPage(1);
              }}
              className="block w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-primary/50 cursor-pointer"
            >
              <option value="" className="bg-navy-deep">All Services</option>
              {uniqueServices.map(s => (
                <option key={s} value={s} className="bg-navy-deep">{s}</option>
              ))}
            </select>

            {/* Filter buttons */}
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-grow flex items-center justify-center gap-1.5 rounded-xl bg-primary text-xs font-bold text-white hover:bg-primary-hover transition-all cursor-pointer"
              >
                <Filter className="h-3.5 w-3.5" />
                Apply
              </button>
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-4 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-xs font-semibold text-white hover:bg-white/10 transition-all cursor-pointer"
              >
                Reset
              </button>
            </div>
          </form>

          {/* Advanced filters expansion panel */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 p-4 rounded-xl bg-white/[0.01] border border-white/5">
            <div>
              <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-1.5">Date Range Start</label>
              <input
                type="date"
                value={dateMin}
                onChange={(e) => setDateMin(e.target.value)}
                className="block w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-primary/50"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-1.5">Date Range End</label>
              <input
                type="date"
                value={dateMax}
                onChange={(e) => setDateMax(e.target.value)}
                className="block w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-primary/50"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-1.5">Min Cost ($)</label>
              <input
                type="number"
                value={costMin}
                onChange={(e) => setCostMin(e.target.value)}
                placeholder="0"
                className="block w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-primary/50"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-1.5">Max Cost ($)</label>
              <input
                type="number"
                value={costMax}
                onChange={(e) => setCostMax(e.target.value)}
                placeholder="10000"
                className="block w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-primary/50"
              />
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto rounded-xl border border-white/5">
            <table className="min-w-full divide-y divide-white/5 text-left text-xs sm:text-sm">
              <thead className="bg-white/[0.02] text-gray-400 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th onClick={() => handleSort('date')} className="px-6 py-4 cursor-pointer hover:text-white transition-colors">
                    Date {sortBy === 'date' && (sortOrder === 'asc' ? '▲' : '▼')}
                  </th>
                  <th onClick={() => handleSort('provider')} className="px-6 py-4 cursor-pointer hover:text-white transition-colors">
                    Provider {sortBy === 'provider' && (sortOrder === 'asc' ? '▲' : '▼')}
                  </th>
                  <th onClick={() => handleSort('service')} className="px-6 py-4 cursor-pointer hover:text-white transition-colors">
                    Service {sortBy === 'service' && (sortOrder === 'asc' ? '▲' : '▼')}
                  </th>
                  <th className="px-6 py-4">Region</th>
                  <th className="px-6 py-4">Usage Type</th>
                  <th onClick={() => handleSort('cost')} className="px-6 py-4 cursor-pointer hover:text-white transition-colors">
                    Cost {sortBy === 'cost' && (sortOrder === 'asc' ? '▲' : '▼')}
                  </th>
                  {isSuperAdmin && <th className="px-6 py-4 text-center">Action</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <tr>
                    <td colSpan={isSuperAdmin ? 7 : 6} className="px-6 py-12 text-center text-gray-500">
                      <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto mb-2" />
                      Retrieving billing data stream...
                    </td>
                  </tr>
                ) : records.length === 0 ? (
                  <tr>
                    <td colSpan={isSuperAdmin ? 7 : 6} className="px-6 py-12 text-center text-gray-500">
                      No billing records found matching your filters.
                    </td>
                  </tr>
                ) : (
                  records.map((rec) => (
                    <tr key={rec._id} className="hover:bg-white/[0.01] transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-gray-300 font-medium">
                        {new Date(rec.date).toISOString().split('T')[0]}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          rec.provider === 'aws' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/10' :
                          rec.provider === 'azure' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/10' :
                          'bg-green-500/10 text-green-400 border border-green-500/10'
                        }`}>
                          {rec.provider}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-semibold text-white max-w-[150px] truncate">{rec.service}</td>
                      <td className="px-6 py-4 text-gray-400">{rec.region}</td>
                      <td className="px-6 py-4 text-gray-400 max-w-[150px] truncate">{rec.usageType}</td>
                      <td className="px-6 py-4 font-bold text-white whitespace-nowrap">{formatCurrency(rec.cost)}</td>
                      {isSuperAdmin && (
                        <td className="px-6 py-4 text-center whitespace-nowrap">
                          <button
                            onClick={() => handleDelete(rec._id)}
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10 p-1.5 rounded-lg transition-colors cursor-pointer"
                            title="Delete Line Item"
                          >
                            <Trash2 className="h-4.5 w-4.5" />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Table Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-6 border-t border-white/5 text-xs">
              <span className="text-gray-400">
                Showing page <span className="font-semibold text-white">{page}</span> of{' '}
                <span className="font-semibold text-white">{totalPages}</span> ({totalRecords} total items)
              </span>

              <div className="flex gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-white/5 border border-white/10 disabled:opacity-50 text-white hover:bg-white/10 transition-all cursor-pointer"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Prev
                </button>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-white/5 border border-white/10 disabled:opacity-50 text-white hover:bg-white/10 transition-all cursor-pointer"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

        </div>

      </div>

      <Footer />
    </div>
  );
};
export default DashboardPage;
