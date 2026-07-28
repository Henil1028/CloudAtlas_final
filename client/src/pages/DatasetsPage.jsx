import React, { useState, useEffect, useCallback } from 'react';
import { Database, Eye, Trash2, Download, Play, Search, FileText, Calendar, CheckCircle2, XCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import { ConsoleLayout } from '../components/console/ConsoleLayout';
import { PageHeader } from '../components/console/PageHeader';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const PROVIDER_COLORS = { AWS: '#F59E0B', Azure: '#3B82F6', GCP: '#22C55E', Oracle: '#EF4444' };
const PROVIDER_LABELS = { aws: 'AWS', azure: 'Azure', gcp: 'GCP' };

const fmtSize = (bytes) => {
  if (!bytes) return 'N/A';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const fmtDate = (d) => {
  if (!d) return 'N/A';
  return new Date(d).toLocaleDateString('en-US', {
    weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
  });
};

export const DatasetsPage = () => {
  const [search, setSearch] = useState('');
  const [previewDs, setPreviewDs] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();

  const [datasets, setDatasets] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadFiles = useCallback(async (silent = false) => {
    if (!silent) setDataLoading(true);
    else setRefreshing(true);
    setError(null);
    try {
      const res = await api.get('/billing/files');
      const files = (res.data?.files || []).map(f => ({
        id: f._id,
        name: f.filename,
        provider: PROVIDER_LABELS[f.provider?.toLowerCase()] || (f.provider?.toUpperCase() || 'AWS'),
        rows: f.recordCount || 0,
        cols: 8,
        size: fmtSize(f.size),
        date: fmtDate(f.uploadDate || f.createdAt),
        status: f.status === 'success' ? 'processed' : (f.status || 'processed'),
        missingVals: 0,
        duplicates: 0,
        raw: f,
      }));
      setDatasets(files);
    } catch (err) {
      console.error(err);
      setError('Failed to load datasets. Please try again.');
    } finally {
      setDataLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadFiles(); }, [loadFiles]);

  const handleDelete = async (id) => {
    setDeleting(true);
    try {
      await api.delete(`/billing/files/${id}`);
      // Remove from local state only after server confirms deletion
      setDatasets(prev => prev.filter(d => d.id !== id));
      setDeleteId(null);
    } catch (err) {
      console.error('Delete failed:', err);
      // Show error but still close modal
      setDeleteId(null);
    } finally {
      setDeleting(false);
    }
  };


  if (dataLoading) {
    return (
      <ConsoleLayout title="Datasets">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
          <div style={{ width: '40px', height: '40px', border: '3px solid rgba(255,255,255,0.05)', borderTopColor: '#7C3AED', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        </div>
        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </ConsoleLayout>
    );
  }

  if (!dataLoading && datasets.length === 0) {
    return (
      <ConsoleLayout title="Datasets">
        <PageHeader
          title="Datasets"
          subtitle="Manage your uploaded cloud billing datasets and run AI analysis"
          icon={Database}
          iconColor="#3B82F6"
          breadcrumb={['CloudAtlas AI', 'Data', 'Datasets']}
          actions={
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => loadFiles(true)} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <RefreshCw size={13} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
                Refresh
              </button>
              <button onClick={() => navigate('/upload')} className="btn-primary ripple">
                + Upload New Dataset
              </button>
            </div>
          }
        />
        <div className="glass-card" style={{ padding: '40px', textAlign: 'center', marginTop: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
            <AlertTriangle size={48} color="#F59E0B" />
          </div>
          {error ? (
            <h3 style={{ fontFamily: 'Outfit, sans-serif', color: '#EF4444', marginBottom: '8px', fontSize: '18px', fontWeight: 600 }}>{error}</h3>
          ) : (
            <>
              <h3 style={{ fontFamily: 'Outfit, sans-serif', color: '#F1F5F9', marginBottom: '8px', fontSize: '18px', fontWeight: 600 }}>No Datasets Uploaded</h3>
              <p style={{ fontSize: '14px', color: '#94A3B8', maxWidth: '500px', margin: '0 auto 20px', lineHeight: 1.6 }}>
                No cloud billing files have been ingested yet. Navigate to the upload section to submit your first CSV report.
              </p>
            </>
          )}
          <a href="/upload" style={{
            display: 'inline-block', padding: '10px 20px', borderRadius: '8px',
            background: 'linear-gradient(135deg, #7C3AED, #6D28D9)', color: '#fff',
            textDecoration: 'none', fontWeight: 600, fontSize: '13px'
          }}>
            Ingest CSV Dataset
          </a>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </ConsoleLayout>
    );
  }

  const filtered = datasets.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.provider.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <ConsoleLayout title="Datasets">
      <PageHeader
        title="Datasets"
        subtitle="Manage your uploaded cloud billing datasets and run AI analysis"
        icon={Database}
        iconColor="#3B82F6"
        breadcrumb={['CloudAtlas AI', 'Data', 'Datasets']}
        actions={
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => loadFiles(true)} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <RefreshCw size={13} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
              Refresh
            </button>
            <button onClick={() => navigate('/upload')} className="btn-primary ripple">
              + Upload New Dataset
            </button>
          </div>
        }
      />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '24px' }} className="ds-stats-grid">
        {[
          { label: 'Total Datasets', val: datasets.length, color: '#3B82F6' },
          { label: 'Total Rows', val: datasets.reduce((s, d) => s + d.rows, 0).toLocaleString(), color: '#7C3AED' },
          { label: 'Processed', val: datasets.filter(d => d.status === 'processed').length, color: '#22C55E' },
          { label: 'Errors', val: datasets.filter(d => d.status === 'error').length, color: '#EF4444' },
        ].map((s, i) => (
          <div key={i} className="glass-card-sm" style={{ padding: '16px' }}>
            <div style={{ fontSize: '10px', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'Inter', marginBottom: '6px' }}>{s.label}</div>
            <div style={{ fontFamily: 'Space Grotesk, monospace', fontWeight: 800, fontSize: '22px', color: s.color }}>{s.val}</div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        <div style={{ flex: 1, maxWidth: '360px', position: 'relative' }}>
          <Search size={14} color="#475569" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            className="input-field"
            placeholder="Search datasets..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: '36px' }}
          />
        </div>
        <span style={{ fontSize: '12px', color: '#475569', fontFamily: 'Inter' }}>
          {filtered.length} dataset{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Dataset table */}
      <div className="chart-card" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.01)' }}>
                {['Dataset', 'Provider', 'Rows', 'Columns', 'Size', 'Uploaded', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', color: '#475569', fontFamily: 'Inter', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(ds => (
                <tr
                  key={ds.id}
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.15s', cursor: 'default' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '32px', height: '32px', borderRadius: '8px', flexShrink: 0,
                        background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <FileText size={14} color="#3B82F6" />
                      </div>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: '#F1F5F9', fontFamily: 'Inter' }}>{ds.name}</div>
                        <div style={{ fontSize: '11px', color: '#475569', fontFamily: 'Inter' }}>
                          {ds.missingVals > 0 ? `${ds.missingVals} missing values` : 'No issues'}
                          {ds.duplicates > 0 ? ` · ${ds.duplicates} duplicates` : ''}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{
                      padding: '3px 10px', borderRadius: '6px', fontSize: '11.5px', fontWeight: 600,
                      background: `${PROVIDER_COLORS[ds.provider]}18`,
                      color: PROVIDER_COLORS[ds.provider],
                      border: `1px solid ${PROVIDER_COLORS[ds.provider]}28`,
                    }}>
                      {ds.provider}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px', fontFamily: 'Space Grotesk, monospace', fontWeight: 600, fontSize: '13px', color: '#CBD5E1' }}>
                    {ds.rows.toLocaleString()}
                  </td>
                  <td style={{ padding: '14px 16px', fontFamily: 'Space Grotesk, monospace', fontSize: '13px', color: '#94A3B8' }}>{ds.cols}</td>
                  <td style={{ padding: '14px 16px', fontSize: '12.5px', color: '#94A3B8', fontFamily: 'Inter' }}>{ds.size}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Calendar size={11} color="#475569" />
                      <span style={{ fontSize: '12px', color: '#64748B', fontFamily: 'Inter' }}>{ds.date}</span>
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    {ds.status === 'processed' ? (
                      <span className="badge-success"><CheckCircle2 size={9} /> Processed</span>
                    ) : (
                      <span className="badge-danger"><XCircle size={9} /> Error</span>
                    )}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        onClick={() => setPreviewDs(ds)}
                        title="Preview"
                        style={{
                          width: '30px', height: '30px', borderRadius: '7px',
                          background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)',
                          color: '#3B82F6', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          transition: 'all 0.15s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(59,130,246,0.2)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(59,130,246,0.1)'}
                      >
                        <Eye size={13} />
                      </button>
                      <button
                        title="Run Again"
                        onClick={() => navigate('/predictions')}
                        style={{
                          width: '30px', height: '30px', borderRadius: '7px',
                          background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)',
                          color: '#8B5CF6', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          transition: 'all 0.15s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(124,58,237,0.2)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(124,58,237,0.1)'}
                      >
                        <Play size={13} />
                      </button>
                      <button
                        title="Download"
                        style={{
                          width: '30px', height: '30px', borderRadius: '7px',
                          background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)',
                          color: '#22C55E', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          transition: 'all 0.15s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(34,197,94,0.2)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(34,197,94,0.1)'}
                      >
                        <Download size={13} />
                      </button>
                      <button
                        title="Delete"
                        onClick={() => setDeleteId(ds.id)}
                        style={{
                          width: '30px', height: '30px', borderRadius: '7px',
                          background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)',
                          color: '#EF4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          transition: 'all 0.15s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.18)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {previewDs && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 100,
          background: 'rgba(5,8,22,0.8)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px',
        }}
          onClick={() => setPreviewDs(null)}
        >
          <div
            className="animate-scale-in"
            style={{
              background: '#0B1023', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '20px', width: '100%', maxWidth: '680px',
              boxShadow: '0 40px 80px rgba(0,0,0,0.6)',
              overflow: 'hidden',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600, fontSize: '16px', color: '#F1F5F9' }}>{previewDs.name}</div>
                <div style={{ fontSize: '12px', color: '#475569', fontFamily: 'Inter', marginTop: '2px' }}>
                  {previewDs.rows.toLocaleString()} records · {previewDs.size} · Uploaded {previewDs.date}
                </div>
              </div>
              <button onClick={() => setPreviewDs(null)} style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer', fontSize: '20px' }}>✕</button>
            </div>
            <div style={{ padding: '24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {[
                { label: 'Filename', value: previewDs.name },
                { label: 'Provider', value: previewDs.provider },
                { label: 'Total Records', value: previewDs.rows.toLocaleString() },
                { label: 'File Size', value: previewDs.size },
                { label: 'Upload Date', value: previewDs.date },
                { label: 'Status', value: previewDs.status === 'processed' ? '✓ Processed' : '✗ Error' },
              ].map((item, i) => (
                <div key={i} style={{ padding: '12px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ fontSize: '10px', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'Inter', marginBottom: '6px' }}>{item.label}</div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#F1F5F9', fontFamily: 'Outfit, sans-serif' }}>{item.value}</div>
                </div>
              ))}
            </div>
            <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button onClick={() => setPreviewDs(null)} className="btn-secondary" style={{ padding: '8px 18px', fontSize: '13px' }}>Close</button>
              <button onClick={() => navigate('/predictions')} className="btn-primary ripple" style={{ padding: '8px 18px', fontSize: '13px' }}>
                <Play size={13} />
                Run AI Models
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 100,
          background: 'rgba(5,8,22,0.8)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px',
        }}
          onClick={() => setDeleteId(null)}
        >
          <div
            className="animate-scale-in"
            style={{
              background: '#0B1023', border: '1px solid rgba(239,68,68,0.2)',
              borderRadius: '16px', width: '100%', maxWidth: '420px',
              boxShadow: '0 40px 80px rgba(0,0,0,0.6)',
              padding: '28px',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Trash2 size={18} color="#EF4444" />
              </div>
              <div>
                <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600, fontSize: '15px', color: '#F1F5F9' }}>Remove Dataset</div>
                <div style={{ fontSize: '12px', color: '#64748B', fontFamily: 'Inter', marginTop: '2px' }}>This action cannot be undone</div>
              </div>
            </div>
            <p style={{ fontSize: '13px', color: '#94A3B8', lineHeight: 1.6, marginBottom: '20px', fontFamily: 'Inter' }}>
              Are you sure you want to remove <strong style={{ color: '#F1F5F9' }}>{datasets.find(d => d.id === deleteId)?.name}</strong> from your datasets list?
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button onClick={() => setDeleteId(null)} className="btn-secondary" style={{ padding: '8px 18px', fontSize: '13px' }}>Cancel</button>
              <button
                onClick={() => handleDelete(deleteId)}
                disabled={deleting}
                style={{
                  padding: '8px 18px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                  background: 'linear-gradient(135deg, #EF4444, #DC2626)', color: '#fff',
                  border: 'none', opacity: deleting ? 0.6 : 1,
                }}
              >
                {deleting ? 'Removing…' : 'Yes, Remove'}
              </button>
            </div>
          </div>
        </div>
      )}
      <style>{`
        @media (max-width: 900px) {
          .ds-stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </ConsoleLayout>
  );
};

export default DatasetsPage;
