import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ConsoleLayout } from '../components/console/ConsoleLayout';
import { PageHeader } from '../components/console/PageHeader';
import { Upload, FileText, CheckCircle, AlertCircle, ArrowLeft, Loader2, Database } from 'lucide-react';
import api from '../services/api';
import { useDataContext } from '../context/DataContext';

export const UploadPage = () => {
  const [theme, setTheme] = useState('neon-noir-theme');

  React.useEffect(() => {
    const savedTheme = localStorage.getItem('console-theme');
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  const [provider, setProvider] = useState('aws');
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  
  // Status states
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [errorList, setErrorList] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [success, setSuccess] = useState(false);
  const [insertedCount, setInsertedCount] = useState(0);

  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const { notifyUpload } = useDataContext();

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.name.endsWith('.csv')) {
        setFile(droppedFile);
        resetStatuses();
      } else {
        setErrorMessage('Only CSV files are supported.');
      }
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      resetStatuses();
    }
  };

  const resetStatuses = () => {
    setSuccess(false);
    setErrorMessage('');
    setErrorList([]);
    setProgress(0);
  };

  const removeFile = () => {
    setFile(null);
    resetStatuses();
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setErrorMessage('Please select a CSV file first.');
      return;
    }

    setUploading(true);
    setProgress(15);
    setErrorMessage('');
    setErrorList([]);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('provider', provider);

    try {
      setProgress(40);
      const response = await api.post('/billing/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          // Scale from 40 to 90
          setProgress(Math.min(90, 40 + Math.round(percentCompleted * 0.5)));
        }
      });

      setProgress(100);
      setSuccess(true);
      setInsertedCount(response.data.recordsInserted);
      setFile(null);

      // Notify all pages to re-fetch with the new file's data
      const newFileId = response.data.file?._id;
      notifyUpload(newFileId);
      
      // Auto-redirect to predictions page to check forecast results
      setTimeout(() => {
        navigate('/predictions');
      }, 2000);
    } catch (err) {
      setProgress(0);
      const data = err.response?.data;
      if (data && data.errors) {
        setErrorList(data.errors);
      } else {
        setErrorMessage(data?.message || 'Server error during ingestion. Please check database connectivity.');
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <ConsoleLayout title="Ingest Billing Data">
      <PageHeader
        title="Ingest Billing Logs"
        subtitle="Upload multi-cloud billing log sheets for machine learning analytics and forecasting"
        icon={Upload}
        breadcrumb={['CloudAtlas AI', 'Data', 'Ingest Logs']}
      />

      <div className="mx-auto max-w-4xl w-full py-6 relative z-10">

        {/* Upload Container */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Instructions Sidebar */}
          <div className="lg:col-span-1 space-y-6">

            {/* Ingestion Rules */}
            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Database className="h-4.5 w-4.5 text-primary" />
                Ingestion Schemas
              </h3>
              
              <ul className="text-xs text-gray-400 space-y-2.5 list-disc pl-4">
                <li>Files must be in **CSV** format.</li>
                <li>Maximum file size limit: **2 GB**.</li>
                <li>Required columns:
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {['date', 'service', 'cost', 'region', 'usage_type', 'provider'].map((col) => (
                      <span key={col} className="bg-white/5 border border-white/10 px-1.5 py-0.5 rounded text-[10px] text-gray-300 font-mono">
                        {col}
                      </span>
                    ))}
                  </div>
                </li>
                <li>Costs must be numeric values.</li>
                <li>Providers must map to `aws`, `azure`, or `gcp`.</li>
              </ul>
            </div>
          </div>

          {/* Main Upload Box */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-card rounded-2xl p-6 sm:p-8 border-white/5 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

              {/* Status messages */}
              {success && (
                <div className="mb-6 flex items-start gap-3 rounded-xl bg-green-500/10 border border-green-500/20 p-4 text-green-400">
                  <CheckCircle className="h-5.5 w-5.5 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-sm">Upload Ingestion Completed</h4>
                    <p className="text-xs text-green-500/80 mt-1">
                      Successfully parsed and stored **{insertedCount} records** inside the CloudAtlas forecasting databases.
                    </p>
                  </div>
                </div>
              )}

              {errorMessage && (
                <div className="mb-6 flex items-start gap-3 rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-red-400">
                  <AlertCircle className="h-5.5 w-5.5 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-sm">Ingestion Error</h4>
                    <p className="text-xs text-red-500/80 mt-1">{errorMessage}</p>
                  </div>
                </div>
              )}

              {errorList.length > 0 && (
                <div className="mb-6 rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-red-400 space-y-2">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-5.5 w-5.5 shrink-0" />
                    <h4 className="font-bold text-sm">Validation Errors ({errorList.length})</h4>
                  </div>
                  <div className="max-h-[150px] overflow-y-auto pr-2 space-y-1 text-xs font-mono text-red-300">
                    {errorList.map((err, idx) => (
                      <p key={idx}>• {err}</p>
                    ))}
                  </div>
                </div>
              )}

              <form onSubmit={handleUploadSubmit} className="space-y-6">
                
                {/* Provider Selector */}
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-3">
                    Cloud Infrastructure Provider
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {['aws', 'azure', 'gcp'].map((p) => (
                      <button
                        type="button"
                        key={p}
                        onClick={() => setProvider(p)}
                        className={`py-3.5 rounded-xl border text-sm font-bold uppercase tracking-wider transition-all cursor-pointer ${
                          provider === p
                            ? 'bg-[#06B6D4]/10 border-[#06B6D4] text-[#06B6D4] shadow-lg shadow-[#06B6D4]/10'
                            : 'bg-white/5 border-white/5 text-gray-400 hover:border-white/10 hover:text-white'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Drag and Drop Zone */}
                <div className="relative">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  <div
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    onClick={triggerFileInput}
                    className={`flex flex-col items-center justify-center border-2 border-dashed rounded-2xl py-12 px-6 text-center cursor-pointer transition-all duration-300 ${
                      dragActive
                        ? 'border-[#06B6D4] bg-[#06B6D4]/5'
                        : 'border-white/10 bg-white/[0.01] hover:border-[#8B5CF6]/40 hover:bg-white/[0.02]'
                    }`}
                  >
                    <div className="h-14 w-14 flex items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-[#06B6D4] mb-4">
                      <Upload className="h-6 w-6" />
                    </div>

                    <p className="text-sm font-bold text-white mb-1.5">
                      Drag & drop your billing CSV here
                    </p>
                    <p className="text-xs text-gray-400">
                      or click to browse local directory
                    </p>
                  </div>
                </div>

                {/* File Preview Card */}
                {file && (
                  <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-[#06B6D4]/10 text-[#06B6D4] shrink-0">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-white truncate">{file.name}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {(file.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={removeFile}
                      className="text-xs font-bold text-red-400 hover:text-red-300 hover:underline px-3 py-1 cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                )}

                {/* Progress Indicators */}
                {uploading && (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-400 font-semibold flex items-center gap-1.5">
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-[#06B6D4]" />
                        Analyzing & mapping records...
                      </span>
                      <span className="text-[#06B6D4] font-bold">{progress}%</span>
                    </div>
                    <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden border border-white/5">
                      <div
                        style={{ width: `${progress}%` }}
                        className="bg-gradient-to-r from-[#22C55E] via-[#06B6D4] to-[#8B5CF6] h-full rounded-full transition-all duration-300"
                      />
                    </div>
                  </div>
                )}

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={!file || uploading}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#22C55E] via-[#06B6D4] to-[#8B5CF6] py-4 text-sm font-bold text-white hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed glow-button transition-all cursor-pointer"
                >
                  {uploading ? 'Ingesting Data...' : 'Begin Ingestion Pipeline'}
                </button>

              </form>
            </div>
          </div>

        </div>

      </div>
    </ConsoleLayout>
  );
};
export default UploadPage;
