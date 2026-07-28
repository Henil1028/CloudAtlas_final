import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';
import api from '../services/api';
import {
  TrendingUp,
  Cpu,
  Database,
  Layers,
  Sparkles,
  ArrowLeft,
  RefreshCw,
  Award,
  Zap,
  Clock,
  AlertTriangle,
  Play,
  Gauge,
  CheckCircle,
  HelpCircle
} from 'lucide-react';

export const ModelTrainingPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [trainingState, setTrainingState] = useState(false);
  const [error, setError] = useState(null);
  
  // Model training run outputs
  const [runsHistory, setRunsHistory] = useState([]);
  const [comparisonData, setComparisonData] = useState([]);
  const [bestModelMeta, setBestModelMeta] = useState({
    best_model: 'XGBoost Regressor',
    accuracy: 94.2,
    rmse: 12.45,
    mae: 8.12,
    training_time: 0.12,
    trained_at: 'N/A'
  });

  const fetchTrainingData = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch runs history comparison
      const runsRes = await api.get('/ml/runs');
      const runs = runsRes.data || [];
      setRunsHistory(runs);

      if (runs.length > 0) {
        // Group runs by date to find latest run comparison details
        // Or reconstruct a clean baseline to show compared models
        // Let's populate the comparison grid based on the unique models trained
        // Set the champion model metadata based on latest run
        const sortedRuns = [...runs].sort((a, b) => b.trained_at.localeCompare(a.trained_at));
        const latestTime = sortedRuns[0].trained_at;
        
        // Find all models trained in this latest training batch
        const latestBatch = sortedRuns.filter(r => r.trained_at === latestTime);
        setComparisonData(latestBatch);

        // Best model is the one with highest accuracy / lowest RMSE in this batch
        const champion = [...latestBatch].sort((a, b) => a.rmse - b.rmse)[0];
        if (champion) {
          setBestModelMeta({
            best_model: champion.model_name,
            accuracy: champion.accuracy,
            rmse: champion.rmse,
            mae: champion.mae,
            training_time: champion.training_time,
            trained_at: latestTime
          });
        }
      }
    } catch (err) {
      console.error('Error fetching training logs:', err);
      if (err.response?.status === 429) {
        setError(err.response?.data?.message || 'Training limit exceeded (Max 5 runs per 24 hours).');
      } else {
        setError('Failed to fetch machine learning training history.');
      }
    } finally {
      setLoading(false);
    }
  };

  const triggerTraining = async (isRetrain = false) => {
    setTrainingState(true);
    setError(null);
    try {
      const endpoint = isRetrain ? '/ml/retrain' : '/ml/train';
      const response = await api.post(endpoint, {});
      
      alert(isRetrain ? 'Model retrained successfully!' : 'Model training complete!');
      await fetchTrainingData();
    } catch (err) {
      console.error('Model training trigger error:', err);
      if (err.response?.status === 429) {
        setError(err.response?.data?.message || 'Training Limit Exceeded (5 request max per 24 hours).');
      } else {
        setError('Model training pipeline failed. Please check your billing dataset rows.');
      }
    } finally {
      setTrainingState(false);
    }
  };

  useEffect(() => {
    fetchTrainingData();
  }, []);

  return (
    <div className="min-h-screen bg-navy-dark flex flex-col grid-bg text-white">
      
      <Navbar />

      {/* Main Container */}
      <div className="pt-28 pb-16 flex-grow mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Page Titles */}
        <div className="mb-8 flex flex-col sm:flex-row justify-between sm:items-center gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Sparkles className="h-4.5 w-4.5 text-primary animate-pulse" />
              <span className="text-xs font-bold text-primary uppercase tracking-widest">
                AI Pipeline Controller
              </span>
            </div>
            <h1 className="text-2xl font-black">AI Model Training Center</h1>
            <p className="text-gray-400 text-xs mt-0.5">
              Train, compare, and hot-swap cost regression forecasting models dynamically.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => triggerTraining(false)}
              disabled={trainingState}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-orange-600 px-5 py-3 text-xs font-bold text-white hover:opacity-95 shadow-lg shadow-primary/20 glow-button transition-all cursor-pointer disabled:opacity-50"
            >
              <Play className="h-3.5 w-3.5 fill-white" />
              Train Models
            </button>
            <button
              onClick={() => triggerTraining(true)}
              disabled={trainingState}
              className="inline-flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 px-5 py-3 text-xs font-bold hover:bg-white/10 transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Retrain Model
            </button>
          </div>
        </div>

        {/* Global Error Banner */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0" />
            <div className="text-xs">
              <p className="font-semibold">{error}</p>
              <p className="text-red-400 mt-0.5">Please ensure MongoDB billing data is loaded or retry later.</p>
            </div>
          </div>
        )}

        {/* Training Progress Simulator Banner */}
        {trainingState && (
          <div className="mb-8 glass-card rounded-2xl p-6 border-primary/20 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-2/3 h-1 bg-gradient-to-r from-primary to-orange-500 animate-pulse" />
            <div className="flex items-center gap-4">
              <RefreshCw className="h-8 w-8 text-primary animate-spin" />
              <div>
                <h4 className="text-sm font-bold">Fitting Scikit-Learn & XGBoost Regressors...</h4>
                <p className="text-xs text-gray-400 mt-0.5">
                  Removing duplicates, scaling features, generating weekend ratios, and running 80/20 train-test split.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* METRICS DASHBOARD CARDS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          
          {/* Card 1: Best Model */}
          <div className="glass-card rounded-2xl p-5 border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <Award className="h-16 w-16 text-primary" />
            </div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Saved Winner</span>
            <h3 className="text-xl sm:text-2xl font-black text-white mt-1.5">{bestModelMeta.best_model}</h3>
            <span className="text-[10px] text-primary font-semibold block mt-1.5 flex items-center gap-0.5">
              <Zap className="h-3 w-3" /> Selected automatically (Lowest RMSE)
            </span>
          </div>

          {/* Card 2: Accuracy */}
          <div className="glass-card rounded-2xl p-5 border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <Gauge className="h-16 w-16 text-gold" />
            </div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Champion Accuracy</span>
            <h3 className="text-xl sm:text-2xl font-black text-white mt-1.5">{bestModelMeta.accuracy.toFixed(2)}%</h3>
            <span className="text-[10px] text-gold font-semibold block mt-1.5">R² coefficient comparison</span>
          </div>

          {/* Card 3: Model RMSE */}
          <div className="glass-card rounded-2xl p-5 border-white/5 relative overflow-hidden group">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Champion RMSE</span>
            <h3 className="text-xl sm:text-2xl font-black text-white mt-1.5">${bestModelMeta.rmse.toFixed(2)}</h3>
            <span className="text-[10px] text-gray-500 block mt-1.5">Root Mean Squared Error</span>
          </div>

          {/* Card 4: Last training date */}
          <div className="glass-card rounded-2xl p-5 border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <Clock className="h-16 w-16 text-blue-400" />
            </div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Last Execution Date</span>
            <h3 className="text-sm sm:text-base font-black text-white mt-4">{bestModelMeta.trained_at}</h3>
            <span className="text-[10px] text-blue-400 font-semibold block mt-2 flex items-center gap-0.5">
              Training duration: {bestModelMeta.training_time.toFixed(4)}s
            </span>
          </div>

        </div>

        {/* COMPARISON TABLE */}
        <div className="glass-card rounded-2xl p-6 sm:p-8 border-white/5 mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-6 mb-6">
            <div>
              <h3 className="text-base font-bold text-white">Model Comparison matrix</h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Evaluation results across all 5 candidate regression architectures.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-green-500/10 text-green-400 border border-green-500/20 flex items-center gap-1.5">
              <CheckCircle className="h-3.5 w-3.5" /> Pipeline Status: Stable
            </span>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto rounded-xl border border-white/5">
            <table className="min-w-full divide-y divide-white/5 text-left text-xs sm:text-sm">
              <thead className="bg-white/[0.02] text-gray-400 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-6 py-4">Model Name</th>
                  <th className="px-6 py-4">Accuracy (R² %)</th>
                  <th className="px-6 py-4">RMSE</th>
                  <th className="px-6 py-4">MAE</th>
                  <th className="px-6 py-4">Training Time</th>
                  <th className="px-6 py-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      <RefreshCw className="h-6 w-6 animate-spin text-primary mx-auto mb-2" />
                      Loading pipeline comparison matrix...
                    </td>
                  </tr>
                ) : comparisonData.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      No models have been trained. Click the **Train Models** button above.
                    </td>
                  </tr>
                ) : (
                  comparisonData.map((row, idx) => {
                    const isWinner = row.model_name === bestModelMeta.best_model;
                    return (
                      <tr key={idx} className={`hover:bg-white/[0.01] transition-colors ${isWinner ? 'bg-primary/5 font-semibold' : ''}`}>
                        <td className="px-6 py-4 whitespace-nowrap text-white font-bold flex items-center gap-2">
                          {row.model_name}
                          {isWinner && (
                            <span className="px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider bg-primary/20 text-primary border border-primary/30">
                              CHAMPION
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                          {row.accuracy?.toFixed(2)}%
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                          ${row.rmse?.toFixed(4)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                          ${row.mae?.toFixed(4)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-400">
                          {row.training_time?.toFixed(4)}s
                        </td>
                        <td className="px-6 py-4 text-center whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                            isWinner ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-gray-500/10 text-gray-400'
                          }`}>
                            {isWinner ? 'Saved & Active' : 'Evaluated'}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* TRAINING LOGS RUNS LIST */}
        <div className="glass-card rounded-2xl p-6 sm:p-8 border-white/5">
          <h3 className="text-sm font-bold flex items-center gap-2 border-b border-white/5 pb-4 mb-4">
            <RefreshCw className="h-4.5 w-4.5 text-primary" />
            Previous Pipeline Runs (MongoDB ModelTraining log)
          </h3>
          
          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
            {runsHistory.length === 0 ? (
              <p className="text-xs text-gray-500">No training logs recorded in database.</p>
            ) : (
              runsHistory.slice(0, 10).map((run, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-white/[0.01] border border-white/5 text-xs flex justify-between items-center hover:border-white/10 transition-all">
                  <div>
                    <span className="font-bold text-white block">{run.model_name}</span>
                    <span className="text-[10px] text-gray-500 block mt-1">Trained: {run.trained_at}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-gray-300 font-bold block">R² Accuracy: {run.accuracy?.toFixed(2)}%</span>
                    <span className="text-[10px] text-gray-500 block">RMSE: {run.rmse?.toFixed(4)} | Time: {run.training_time?.toFixed(3)}s</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      <Footer />
    </div>
  );
};

export default ModelTrainingPage;
