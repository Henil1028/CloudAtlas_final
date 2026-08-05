import React, { useEffect, useRef, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { 
  ArrowRight, Play, TrendingUp, Cpu, Sparkles, Activity, Shield, AlertTriangle, 
  CheckCircle, Database, Server, RefreshCw, BarChart3, LineChart, AppWindow,
  Terminal, Code, HardDrive, Check, MessageSquare, ExternalLink, Menu, X, ArrowUpRight,
  Zap, Sliders, Search, FileText, Users, Lock, Layers, ChevronDown, ChevronUp,
  DollarSign, PieChart, Bell, Award, Download, Cloud, Settings, Radio
} from 'lucide-react';
import { TiltCard } from '../components/common/TiltCard';
import { CinematicBackground } from '../components/landing/CinematicBackground';

gsap.registerPlugin(ScrollTrigger);

export const LandingPage = () => {
  const containerRef = useRef(null);
  const horizontalContainerRef = useRef(null);
  
  // Navigation & UI States
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('forecast');
  const [openFaq, setOpenFaq] = useState(0);

  // Live Telemetry Demo States
  const [liveCost, setLiveCost] = useState(64380);
  const [liveSavings, setLiveSavings] = useState(12890);
  const [cpuUsage, setCpuUsage] = useState(64);
  const [memUsage, setMemUsage] = useState(78);
  const [totalUsers, setTotalUsers] = useState(3);
  const [activeAnomaly, setActiveAnomaly] = useState(false);

  // Interactive ROI Calculator States
  const [monthlySpend, setMonthlySpend] = useState(50000);
  const [rightsizeRatio, setRightsizeRatio] = useState(25);
  const [spotRatio, setSpotRatio] = useState(20);
  const [storageRatio, setStorageRatio] = useState(15);

  // Prompt Engine Simulation State
  const [selectedPrompt, setSelectedPrompt] = useState('ec2_spike');

  useEffect(() => {
    // Fetch live user count from API if server is online
    fetch('/api/auth/user-count')
      .then(res => res.json())
      .then(data => {
        if (data && typeof data.count === 'number') {
          setTotalUsers(data.count);
        }
      })
      .catch(() => {
        // Fallback gracefully
        setTotalUsers(4);
      });

    // Lenis Smooth Scroll Setup
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Navbar shrink listener
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);

    // Live Telemetry Loop
    const telemetryInterval = setInterval(() => {
      setLiveCost(prev => prev + (Math.random() > 0.45 ? 18 : -12));
      setLiveSavings(prev => prev + (Math.random() > 0.5 ? 8 : -5));
      setCpuUsage(prev => {
        const next = prev + Math.floor(Math.random() * 9) - 4;
        return Math.max(35, Math.min(92, next));
      });
      setMemUsage(prev => {
        const next = prev + Math.floor(Math.random() * 5) - 2;
        return Math.max(52, Math.min(88, next));
      });
      setActiveAnomaly(Math.random() > 0.7);
    }, 2800);

    // GSAP Horizontal Gallery Animation
    if (horizontalContainerRef.current) {
      const scrollWidth = horizontalContainerRef.current.scrollWidth - window.innerWidth;
      gsap.to(horizontalContainerRef.current, {
        x: -scrollWidth,
        ease: 'none',
        scrollTrigger: {
          trigger: '.horizontal-gallery-section',
          start: 'top top',
          end: () => `+=${scrollWidth + 100}`,
          pin: true,
          scrub: 1,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        }
      });
    }

    return () => {
      lenis.destroy();
      window.removeEventListener('scroll', handleScroll);
      clearInterval(telemetryInterval);
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  // Hero Parallax Scroll Effect
  const { scrollYProgress } = useScroll();
  const heroScale = useTransform(scrollYProgress, [0, 0.18], [1, 0.94]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.18], [1, 0]);

  // Calculations for ROI Calculator
  const estimatedSavingsPct = Math.min(65, Math.max(20, Math.round(rightsizeRatio * 0.5 + spotRatio * 0.4 + storageRatio * 0.3)));
  const annualSavings = Math.round((monthlySpend * 12) * (estimatedSavingsPct / 100));
  const monthlySavings = Math.round(annualSavings / 12);

  // Platform Modules
  const modules = [
    {
      id: 'predict',
      name: 'PredictIQ Forecast Engine',
      path: '/predictions',
      tag: 'XGBoost & Prophet ML',
      desc: 'Predict multi-cloud compute, cluster, and storage costs up to 90 days in advance with 98.6% validated accuracy.',
      icon: LineChart,
      color: 'from-[#22C55E] to-[#10B981]'
    },
    {
      id: 'anomaly',
      name: 'One-Class SVM Anomaly Shield',
      path: '/anomalies',
      tag: '<60s Alert Latency',
      desc: 'Detect rogue lambda loops, untracked NAT gateway traffic, unattached EBS volumes, and runaway cluster spikes instantly.',
      icon: AlertTriangle,
      color: 'from-[#EF4444] to-[#F59E0B]'
    },
    {
      id: 'simulator',
      name: 'What-If Scenario Simulator',
      path: '/simulator',
      tag: 'IaC Cost Modeling',
      desc: 'Simulate instance right-sizing, spot migration, and regional failovers before deploying Terraform configurations.',
      icon: Sliders,
      color: 'from-[#06B6D4] to-[#3B82F6]'
    },
    {
      id: 'risk',
      name: 'FinOps Risk & Security Scorecard',
      path: '/risk-assessment',
      tag: 'Zero-Trust Audit',
      desc: 'Continuous scanning for unattached disks, untagged resources, public S3 buckets, and non-compliant cloud configurations.',
      icon: Shield,
      color: 'from-[#8B5CF6] to-[#EC4899]'
    },
    {
      id: 'insights',
      name: 'AI Insight Engine & Copilot',
      path: '/insights',
      tag: 'Natural Language FinOps',
      desc: 'Ask complex billing questions in plain English and receive instant structured recommendations with one-click remediation scripts.',
      icon: Sparkles,
      color: 'from-[#3B82F6] to-[#8B5CF6]'
    },
    {
      id: 'training',
      name: 'Custom Model Training Studio',
      path: '/model-training',
      tag: 'Hyperparameter Tuning',
      desc: 'Train custom XGBoost and Random Forest regression models on your enterprise dataset with real-time loss curves.',
      icon: Cpu,
      color: 'from-[#10B981] to-[#06B6D4]'
    },
    {
      id: 'reports',
      name: 'Executive PDF & CSV Reports',
      path: '/reports',
      tag: 'Automated Delivery',
      desc: 'Generate CFO and VP-ready cost allocation reports, variance summaries, and unit economics breakdowns in seconds.',
      icon: FileText,
      color: 'from-[#F59E0B] to-[#EF4444]'
    },
    {
      id: 'governance',
      name: 'Multi-Tenant Governance & RBAC',
      path: '/users',
      tag: 'Enterprise JWT Guard',
      desc: 'Role-based access control for DevOps, Finance Managers, and Admins with granular workspace permissions and audit logs.',
      icon: Lock,
      color: 'from-[#6366F1] to-[#a78bfa]'
    }
  ];

  // Cloud Integrations
  const cloudIntegrations = [
    { name: 'Amazon Web Services', desc: 'Sync CUR 2.0, Spot configurations, Savings Plans, and S3 Lifecycle rules.', tag: 'AWS CUR', color: '#FF9900' },
    { name: 'Microsoft Azure', desc: 'Enterprise Agreement pipelines, App Service plans, and Azure Advisor metrics.', tag: 'Azure EA', color: '#0089D6' },
    { name: 'Google Cloud Platform', desc: 'BigQuery export sinks, GKE cluster node tracking, and Persistent Disk optimization.', tag: 'GCP BigQuery', color: '#4285F4' },
    { name: 'Kubernetes Nodes', desc: 'Pod & namespace level cost allocation for multi-tenant EKS, AKS, and GKE clusters.', tag: 'Kube-Cost', color: '#326CE5' },
    { name: 'Terraform & IaC', desc: 'Predict operational billing impacts directly during terraform plan state execution.', tag: 'IaC Sentinel', color: '#844FBA' },
    { name: 'Snowflake & Databricks', desc: 'Monitor virtual warehouse credit consumption, auto-suspend triggers, and query costs.', tag: 'Data Warehouse', color: '#29B5E8' }
  ];

  // FAQ Items
  const faqList = [
    {
      q: 'How does CloudAtlas AI achieve 98.6% forecast accuracy?',
      a: 'We combine XGBoost Gradient Boosted Trees with Prophet time-series models trained on multi-cloud billing datasets (AWS CUR, Azure EA, GCP BigQuery). Our models capture seasonality, daily spikes, and regional price adjustments automatically.'
    },
    {
      q: 'Is my cloud billing data secure?',
      a: 'Absolutely. CloudAtlas AI uses end-to-end TLS 1.3 encryption in transit and AES-256 at rest. We support read-only cloud permissions, zero-trust token authentication, and optional self-hosted deployments for strict compliance.'
    },
    {
      q: 'Can I import raw billing files manually?',
      a: 'Yes! You can connect AWS/Azure/GCP APIs directly or upload raw CSV/JSON billing exports via our Upload Page. Our automatic parser cleans, normalizes, and validates schemas across all provider formats.'
    },
    {
      q: 'How quickly does the One-Class SVM detect cost anomalies?',
      a: 'Our streaming telemetry engine evaluates billing data in 4-hour micro-batches and raises high-severity alerts within 60 seconds of detecting an unexpected spike in compute, network, or storage spend.'
    },
    {
      q: 'Can I train custom ML models on my company data?',
      a: 'Yes. Our Model Training Studio allows you to train, evaluate, and deploy custom regression models with custom hyperparameters, train/test split ratios, and loss monitoring.'
    }
  ];

  return (
    <div ref={containerRef} className="min-h-screen text-[#F7FAFC] overflow-x-hidden relative font-sans" style={{ backgroundColor: '#07130F' }}>
      
      {/* 1. Cinematic Dynamic Canvas Background */}
      <CinematicBackground />

      {/* 2. Floating Sticky Header Navigation */}
      <nav className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-32px)] max-w-7xl rounded-2xl border transition-all duration-500 ${
        scrolled 
          ? 'bg-[#0A1612]/90 backdrop-blur-2xl border-white/10 py-2.5 shadow-[0_10px_30px_rgba(0,0,0,0.8)]' 
          : 'bg-[#07130F]/40 backdrop-blur-md border-white/5 py-3.5'
      }`}>
        <div className="px-6 flex items-center justify-between">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-[#16A34A] via-[#22C55E] to-[#4ADE80] p-[1px] shadow-[0_0_15px_rgba(34,197,94,0.4)] transition-transform group-hover:scale-105">
              <div className="flex h-full w-full items-center justify-center rounded-[11px] bg-[#07130F]">
                <Activity className="h-4 sm:h-5 w-4 sm:w-5 text-[#22C55E] animate-pulse" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-base font-extrabold tracking-tight text-white flex items-center gap-1">
                CloudAtlas <span className="text-[#22C55E]">AI</span>
              </span>
              <span className="text-[9px] text-gray-400 font-mono tracking-widest uppercase hidden sm:block">Enterprise FinOps</span>
            </div>
          </Link>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-7">
            <a href="#sandbox" className="text-xs font-semibold uppercase tracking-wider text-gray-300 hover:text-[#22C55E] transition-colors">AI Sandbox</a>
            <a href="#modules" className="text-xs font-semibold uppercase tracking-wider text-gray-300 hover:text-[#22C55E] transition-colors">Modules</a>
            <a href="#calculator" className="text-xs font-semibold uppercase tracking-wider text-gray-300 hover:text-[#22C55E] transition-colors">ROI Calculator</a>
            <a href="#pipeline" className="text-xs font-semibold uppercase tracking-wider text-gray-300 hover:text-[#22C55E] transition-colors">Pipeline</a>
            <a href="#integrations" className="text-xs font-semibold uppercase tracking-wider text-gray-300 hover:text-[#22C55E] transition-colors">Ecosystem</a>
            <a href="#faq" className="text-xs font-semibold uppercase tracking-wider text-gray-300 hover:text-[#22C55E] transition-colors">FAQ</a>
          </div>

          {/* Action CTAs */}
          <div className="hidden md:flex items-center gap-3">
            <Link to="/login" className="text-xs font-bold uppercase tracking-wider text-gray-300 hover:text-white px-3 py-2 transition-colors">
              Sign In
            </Link>
            <Link to="/dashboard" className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#16A34A] via-[#22C55E] to-[#4ADE80] px-4 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:shadow-[0_0_30px_rgba(34,197,94,0.5)] hover:scale-[1.02] active:scale-[0.98] transition-all">
              <span>Launch Console</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Mobile Menu Trigger */}
          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-gray-300 hover:text-white p-2">
            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Dropdown */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-white/10 px-6 py-4 space-y-3 bg-[#07130F]/95 backdrop-blur-2xl rounded-b-2xl"
            >
              <a href="#sandbox" onClick={() => setMenuOpen(false)} className="block text-xs font-bold uppercase tracking-wider text-gray-300 py-1">AI Sandbox</a>
              <a href="#modules" onClick={() => setMenuOpen(false)} className="block text-xs font-bold uppercase tracking-wider text-gray-300 py-1">Platform Modules</a>
              <a href="#calculator" onClick={() => setMenuOpen(false)} className="block text-xs font-bold uppercase tracking-wider text-gray-300 py-1">ROI Savings Calculator</a>
              <a href="#pipeline" onClick={() => setMenuOpen(false)} className="block text-xs font-bold uppercase tracking-wider text-gray-300 py-1">How It Works</a>
              <a href="#integrations" onClick={() => setMenuOpen(false)} className="block text-xs font-bold uppercase tracking-wider text-gray-300 py-1">Cloud Ecosystem</a>
              <a href="#faq" onClick={() => setMenuOpen(false)} className="block text-xs font-bold uppercase tracking-wider text-gray-300 py-1">FAQ</a>
              <div className="pt-3 border-t border-white/10 flex flex-col gap-2">
                <Link to="/login" className="w-full text-center py-2.5 text-xs font-bold uppercase tracking-wider text-white bg-white/5 rounded-xl border border-white/10">Sign In</Link>
                <Link to="/dashboard" className="w-full text-center py-2.5 text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-r from-[#16A34A] to-[#22C55E] rounded-xl shadow-md">Launch Console</Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* 3. HERO SECTION */}
      <motion.section style={{ scale: heroScale, opacity: heroOpacity }} className="relative min-h-[92vh] flex items-center justify-center pt-36 pb-20 overflow-hidden z-10">
        
        {/* Glow ambient spots */}
        <div className="absolute top-[20%] left-[8%] w-[420px] h-[420px] rounded-full bg-[#22C55E]/10 blur-[130px] pointer-events-none" />
        <div className="absolute bottom-[15%] right-[10%] w-[480px] h-[480px] rounded-full bg-[#06B6D4]/10 blur-[150px] pointer-events-none" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Hero Left Content */}
          <div className="lg:col-span-6 text-left space-y-6">
            
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-[#16A34A]/15 via-[#22C55E]/15 to-[#4ADE80]/15 border border-[#22C55E]/30 text-gray-200 text-xs font-bold uppercase tracking-wider shadow-sm">
              <Sparkles className="h-3.5 w-3.5 text-[#4ADE80] animate-pulse" />
              <span>Next-Gen Multi-Cloud FinOps Intelligence v3.4</span>
            </div>
            
            <h1 className="text-4xl sm:text-6xl lg:text-6xl font-black tracking-tight leading-[1.1] text-white">
              Predict, Detect & <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#16A34A] via-[#22C55E] to-[#4ADE80]">
                Optimize Cloud Spend.
              </span>
            </h1>

            <p className="text-sm sm:text-base text-gray-300 max-w-xl leading-relaxed">
              Eliminate billing surprises across AWS, Azure, GCP, and Kubernetes. Powered by XGBoost 90-day cost forecasting, One-Class SVM anomaly alerts, and automated right-sizing.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4 pt-2">
              <Link to="/dashboard" className="inline-flex items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-[#16A34A] via-[#22C55E] to-[#4ADE80] px-7 py-4 text-xs font-extrabold uppercase tracking-wider text-white shadow-[0_0_25px_rgba(34,197,94,0.4)] hover:shadow-[0_0_35px_rgba(34,197,94,0.6)] hover:scale-[1.02] active:scale-[0.98] transition-all">
                <Activity className="h-4 w-4" />
                <span>Explore AI Console</span>
                <ArrowRight className="h-4 w-4" />
              </Link>

              <a href="#sandbox" className="inline-flex items-center justify-center gap-2.5 rounded-xl bg-white/5 border border-white/10 px-6 py-4 text-xs font-extrabold uppercase tracking-wider text-gray-200 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all hover:scale-[1.02]">
                <Play className="h-3.5 w-3.5 text-[#22C55E] fill-[#22C55E]/30" />
                <span>Try Interactive Demo</span>
              </a>
            </div>

            {/* Quick Feature Badges */}
            <div className="pt-4 border-t border-white/10 grid grid-cols-3 gap-4 text-left">
              <div>
                <div className="flex items-center gap-1.5 text-[#22C55E] font-bold text-xs uppercase tracking-wider">
                  <CheckCircle className="h-3.5 w-3.5" />
                  <span>98.6% Accuracy</span>
                </div>
                <p className="text-[10px] text-gray-400 mt-0.5">XGBoost & Prophet ML</p>
              </div>
              <div>
                <div className="flex items-center gap-1.5 text-[#06B6D4] font-bold text-xs uppercase tracking-wider">
                  <Zap className="h-3.5 w-3.5" />
                  <span>&lt;60s Spikes</span>
                </div>
                <p className="text-[10px] text-gray-400 mt-0.5">One-Class SVM Scan</p>
              </div>
              <div>
                <div className="flex items-center gap-1.5 text-[#8B5CF6] font-bold text-xs uppercase tracking-wider">
                  <Shield className="h-3.5 w-3.5" />
                  <span>Zero-Trust</span>
                </div>
                <p className="text-[10px] text-gray-400 mt-0.5">Role-based RBAC</p>
              </div>
            </div>

          </div>

          {/* Hero Right Visual Tilt Widget */}
          <div className="lg:col-span-6 relative flex items-center justify-center">
            
            {/* Glowing background ring */}
            <div className="absolute inset-0 bg-gradient-to-tr from-[#16A34A]/25 via-[#22C55E]/20 to-[#06B6D4]/20 rounded-3xl blur-[50px] opacity-60 scale-95 pointer-events-none" />

            <TiltCard className="w-full max-w-lg p-[1px] rounded-3xl bg-gradient-to-b from-white/20 via-white/5 to-transparent border border-white/15 shadow-[0_20px_60px_rgba(0,0,0,0.8)] backdrop-blur-2xl relative overflow-hidden group">
              <div className="relative z-10 bg-[#0C1A14]/95 rounded-[23px] p-6 space-y-5">
                
                {/* Console Bar Header */}
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
                    <span className="w-3 h-3 rounded-full bg-yellow-500/80 inline-block" />
                    <span className="w-3 h-3 rounded-full bg-green-500/80 inline-block" />
                    <span className="text-[10px] text-gray-400 font-mono ml-2">cloudatlas-telemetry.v3</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-[10px] font-bold text-[#22C55E] bg-[#22C55E]/10 px-2.5 py-1 rounded-full border border-[#22C55E]/30">
                    <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
                    ML Model Active
                  </div>
                </div>

                {/* Live Metrics Grid */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors">
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">Spend Run-rate</span>
                    <p className="text-base sm:text-lg font-black text-white mt-1 font-mono">${liveCost.toLocaleString()}</p>
                    <span className="text-[8px] text-[#22C55E] flex items-center gap-0.5 mt-0.5"><TrendingUp className="h-2.5 w-2.5" /> +2.4% trend</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#22C55E]/10 border border-[#22C55E]/20 hover:border-[#22C55E]/40 transition-colors">
                    <span className="text-[9px] font-bold text-[#22C55E] uppercase tracking-wider block">Active Savings</span>
                    <p className="text-base sm:text-lg font-black text-[#22C55E] mt-1 font-mono">${liveSavings.toLocaleString()}</p>
                    <span className="text-[8px] text-gray-400 mt-0.5 block">Optimized AWS/GCP</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#06B6D4]/10 border border-[#06B6D4]/20 hover:border-[#06B6D4]/40 transition-colors">
                    <span className="text-[9px] font-bold text-[#06B6D4] uppercase tracking-wider block">Cluster Load</span>
                    <p className="text-base sm:text-lg font-black text-[#06B6D4] mt-1 font-mono">{cpuUsage}%</p>
                    <span className="text-[8px] text-gray-400 mt-0.5 block">RAM: {memUsage}%</span>
                  </div>
                </div>

                {/* Live Anomaly Banner Alert */}
                <div className={`p-3 rounded-xl border transition-all duration-500 flex items-center justify-between ${
                  activeAnomaly 
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-300' 
                    : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                }`}>
                  <div className="flex items-center gap-2.5 text-xs">
                    {activeAnomaly ? (
                      <AlertTriangle className="h-4 w-4 text-amber-400 animate-bounce" />
                    ) : (
                      <CheckCircle className="h-4 w-4 text-emerald-400" />
                    )}
                    <div>
                      <span className="font-bold block text-[11px]">
                        {activeAnomaly ? 'Anomaly Detected in AWS us-east-1 (EC2)' : 'All 4 Cloud Clusters Operating Within Budget'}
                      </span>
                      <span className="text-[9px] opacity-80 font-mono">
                        {activeAnomaly ? 'One-Class SVM flagged +$340/hr spike' : 'Zero budget overruns predicted for next 30 days'}
                      </span>
                    </div>
                  </div>
                  <Link to="/anomalies" className="text-[9px] font-bold uppercase tracking-wider underline hover:opacity-80">
                    Details
                  </Link>
                </div>

                {/* Live Sparkline Graph */}
                <div className="pt-2 border-t border-white/5">
                  <div className="flex justify-between items-center text-[9px] text-gray-400 font-mono mb-2">
                    <span>90-Day Cost & Trajectory Forecast</span>
                    <span className="text-[#22C55E] font-bold">XGBoost Regressor</span>
                  </div>
                  <div className="h-14 flex items-end gap-1.5 px-1 pt-1">
                    {[38, 48, 35, 55, 42, 68, 58, 75, 62, 88, 72, 94, 82, 100].map((val, i) => (
                      <div key={i} className="flex-1 group relative">
                        <div 
                          className={`w-full rounded-t-[3px] transition-all duration-500 ${
                            i > 10 
                              ? 'bg-gradient-to-t from-[#06B6D4] to-[#4ADE80] border-t border-white/40' 
                              : 'bg-gradient-to-t from-[#16A34A] to-[#22C55E]'
                          }`} 
                          style={{ height: `${val}%` }} 
                        />
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </TiltCard>

          </div>

        </div>
      </motion.section>

      {/* 4. ENTERPRISE KPI STATS TICKER */}
      <section className="py-12 bg-[#091510]/80 border-y border-white/10 relative z-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
              <span className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#22C55E] to-[#4ADE80] font-mono">
                98.6%
              </span>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-300 mt-1">Forecast Accuracy</p>
              <span className="text-[10px] text-gray-400">XGBoost ML Regressor</span>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
              <span className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#06B6D4] to-[#3B82F6] font-mono">
                $4.2M+
              </span>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-300 mt-1">Cloud Spend Analyzed</p>
              <span className="text-[10px] text-gray-400">Multi-tenant Accounts</span>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
              <span className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] font-mono">
                &lt;60s
              </span>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-300 mt-1">Anomaly Alert Latency</p>
              <span className="text-[10px] text-gray-400">One-Class SVM Engine</span>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
              <span className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#F59E0B] to-[#EF4444] font-mono">
                35%-65%
              </span>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-300 mt-1">Average Cost Savings</p>
              <span className="text-[10px] text-gray-400">Automated Right-sizing</span>
            </div>

          </div>
        </div>
      </section>

      {/* 5. INTERACTIVE FINOPS SANDBOX (TABS & DEMO CONTROLS) */}
      <section id="sandbox" className="py-24 bg-[#07130F] relative border-b border-white/10 overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-bold text-[#22C55E] uppercase tracking-widest bg-[#22C55E]/10 px-3 py-1 rounded-full border border-[#22C55E]/20">
              Interactive Platform Sandbox
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Test CloudAtlas AI Capabilities Live
            </h2>
            <p className="text-sm text-gray-300">
              Switch between predictive analytics, real-time anomaly isolation, scenario simulation, and natural language FinOps copilot below.
            </p>
          </div>

          {/* Sandbox Tabs */}
          <div className="flex flex-wrap justify-center gap-2 bg-[#0C1A14] p-1.5 rounded-2xl border border-white/10 max-w-4xl mx-auto">
            {[
              { id: 'forecast', label: 'PredictIQ Forecast', icon: LineChart },
              { id: 'anomaly', label: 'Anomaly Shield', icon: AlertTriangle },
              { id: 'simulator', label: 'Scenario Simulator', icon: Sliders },
              { id: 'insights', label: 'AI Copilot', icon: MessageSquare },
              { id: 'ingestion', label: 'Data Pipeline', icon: Database }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer transition-all ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-[#16A34A] to-[#22C55E] text-white shadow-md'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Sandbox Content Panel */}
          <div className="glass-card rounded-3xl border border-white/10 p-6 sm:p-8 bg-[#0D1D17]/90 max-w-5xl mx-auto shadow-2xl relative">
            <AnimatePresence mode="wait">
              
              {/* TAB 1: PREDICTIQ FORECAST */}
              {activeTab === 'forecast' && (
                <motion.div
                  key="forecast"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="space-y-6"
                >
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-white/10 pb-4">
                    <div>
                      <span className="text-[10px] font-bold text-[#22C55E] uppercase tracking-widest">Model: XGBoost Regressor v3</span>
                      <h3 className="text-xl font-bold text-white mt-1">90-Day Enterprise Spend Projection</h3>
                    </div>
                    <Link to="/predictions" className="inline-flex items-center gap-1.5 text-xs font-bold text-[#22C55E] hover:underline">
                      <span>Open Predictions Page</span>
                      <ArrowUpRight className="h-4 w-4" />
                    </Link>
                  </div>

                  {/* Forecast Graph & Stats */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-8 bg-[#07130F] p-5 rounded-2xl border border-white/5 space-y-4">
                      <div className="flex justify-between items-center text-xs text-gray-400 font-mono">
                        <span>Spend Trend ($USD)</span>
                        <div className="flex gap-4">
                          <span className="flex items-center gap-1 text-[#22C55E]"><span className="w-2 h-2 rounded-full bg-[#22C55E]" /> Historical</span>
                          <span className="flex items-center gap-1 text-[#06B6D4]"><span className="w-2 h-2 rounded-full bg-[#06B6D4]" /> 90-Day Forecast</span>
                        </div>
                      </div>

                      {/* Mock Chart Visualization */}
                      <div className="h-48 flex items-end gap-2 px-2 pt-4">
                        {[
                          { month: 'Jan', val: 42, type: 'hist' },
                          { month: 'Feb', val: 48, type: 'hist' },
                          { month: 'Mar', val: 45, type: 'hist' },
                          { month: 'Apr', val: 58, type: 'hist' },
                          { month: 'May', val: 62, type: 'hist' },
                          { month: 'Jun', val: 64, type: 'hist' },
                          { month: 'Jul', val: 72, type: 'pred' },
                          { month: 'Aug', val: 78, type: 'pred' },
                          { month: 'Sep', val: 84, type: 'pred' },
                          { month: 'Oct', val: 92, type: 'pred' },
                        ].map((bar, i) => (
                          <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                            <div className="text-[9px] font-mono text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                              ${bar.val}k
                            </div>
                            <div 
                              className={`w-full rounded-t-md transition-all duration-300 ${
                                bar.type === 'hist'
                                  ? 'bg-gradient-to-t from-[#16A34A] to-[#22C55E]'
                                  : 'bg-gradient-to-t from-[#06B6D4] to-[#3B82F6] border-t-2 border-white/60'
                              }`}
                              style={{ height: `${bar.val * 1.8}px` }}
                            />
                            <span className="text-[10px] text-gray-400 font-mono">{bar.month}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="lg:col-span-4 space-y-4">
                      <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Confidence Interval</span>
                        <p className="text-xl font-bold text-white mt-1">98.6% Match</p>
                        <p className="text-[10px] text-gray-400 mt-1">Trained on 2,000+ billing rows</p>
                      </div>

                      <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Predicted Q3 Spend</span>
                        <p className="text-xl font-bold text-[#06B6D4] mt-1">$254,000</p>
                        <p className="text-[10px] text-gray-400 mt-1">AWS EC2 (52%), Azure VM (28%)</p>
                      </div>

                      <div className="p-4 rounded-xl bg-[#22C55E]/10 border border-[#22C55E]/20">
                        <span className="text-[10px] font-bold text-[#22C55E] uppercase tracking-widest block">Actionable Recommendation</span>
                        <p className="text-xs text-gray-200 mt-1 font-medium">Switch 8 idle r5.2xlarge EC2 instances to Savings Plans to save $14,200/mo.</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* TAB 2: ANOMALY SHIELD */}
              {activeTab === 'anomaly' && (
                <motion.div
                  key="anomaly"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="space-y-6"
                >
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-white/10 pb-4">
                    <div>
                      <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest">Engine: One-Class SVM & Isolation Forest</span>
                      <h3 className="text-xl font-bold text-white mt-1">Real-Time Billing Anomaly Feed</h3>
                    </div>
                    <Link to="/anomalies" className="inline-flex items-center gap-1.5 text-xs font-bold text-red-400 hover:underline">
                      <span>View All Anomalies</span>
                      <ArrowUpRight className="h-4 w-4" />
                    </Link>
                  </div>

                  <div className="space-y-3">
                    {[
                      {
                        title: 'Unthrottled AWS Lambda Execution Loop',
                        service: 'AWS Lambda (us-west-2)',
                        costImpact: '+$420 / hour',
                        severity: 'CRITICAL',
                        time: '12 mins ago',
                        color: 'border-red-500/30 bg-red-500/10 text-red-300'
                      },
                      {
                        title: 'Orphaned Azure Unattached Disk Snapshot',
                        service: 'Azure Managed Disks (East US)',
                        costImpact: '+$1,850 / month',
                        severity: 'HIGH',
                        time: '1 hour ago',
                        color: 'border-amber-500/30 bg-amber-500/10 text-amber-300'
                      },
                      {
                        title: 'Unexpected GCP BigQuery Query Spike',
                        service: 'Google Cloud BigQuery',
                        costImpact: '+$890 / day',
                        severity: 'MEDIUM',
                        time: '3 hours ago',
                        color: 'border-yellow-500/30 bg-yellow-500/10 text-yellow-300'
                      }
                    ].map((anom, idx) => (
                      <div key={idx} className={`p-4 rounded-xl border flex flex-col sm:flex-row justify-between sm:items-center gap-4 ${anom.color}`}>
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-white">{anom.title}</span>
                              <span className="text-[9px] font-black tracking-widest px-2 py-0.5 rounded bg-black/40 border border-white/10 uppercase">
                                {anom.severity}
                              </span>
                            </div>
                            <p className="text-xs opacity-90 mt-0.5">{anom.service} • Flagged by One-Class SVM outlier algorithm</p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                          <span className="font-mono font-black text-sm text-white">{anom.costImpact}</span>
                          <button className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-all cursor-pointer">
                            Mitigate
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* TAB 3: SCENARIO SIMULATOR */}
              {activeTab === 'simulator' && (
                <motion.div
                  key="simulator"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="space-y-6"
                >
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-white/10 pb-4">
                    <div>
                      <span className="text-[10px] font-bold text-[#06B6D4] uppercase tracking-widest">Interactive What-If Modeling</span>
                      <h3 className="text-xl font-bold text-white mt-1">Infrastructure Optimization Simulator</h3>
                    </div>
                    <Link to="/simulator" className="inline-flex items-center gap-1.5 text-xs font-bold text-[#06B6D4] hover:underline">
                      <span>Launch Full Simulator</span>
                      <ArrowUpRight className="h-4 w-4" />
                    </Link>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                    
                    {/* Controls */}
                    <div className="lg:col-span-6 space-y-5">
                      <div>
                        <div className="flex justify-between text-xs font-bold text-gray-200 mb-2">
                          <span>Instance Right-Sizing Ratio</span>
                          <span className="text-[#22C55E] font-mono">{rightsizeRatio}%</span>
                        </div>
                        <input 
                          type="range" 
                          min="0" 
                          max="60" 
                          value={rightsizeRatio}
                          onChange={(e) => setRightsizeRatio(Number(e.target.value))}
                          className="w-full accent-[#22C55E] cursor-pointer"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between text-xs font-bold text-gray-200 mb-2">
                          <span>Spot Instance Offloading</span>
                          <span className="text-[#06B6D4] font-mono">{spotRatio}%</span>
                        </div>
                        <input 
                          type="range" 
                          min="0" 
                          max="50" 
                          value={spotRatio}
                          onChange={(e) => setSpotRatio(Number(e.target.value))}
                          className="w-full accent-[#06B6D4] cursor-pointer"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between text-xs font-bold text-gray-200 mb-2">
                          <span>Cold Archive Storage Tiering</span>
                          <span className="text-[#8B5CF6] font-mono">{storageRatio}%</span>
                        </div>
                        <input 
                          type="range" 
                          min="0" 
                          max="40" 
                          value={storageRatio}
                          onChange={(e) => setStorageRatio(Number(e.target.value))}
                          className="w-full accent-[#8B5CF6] cursor-pointer"
                        />
                      </div>
                    </div>

                    {/* Result Output */}
                    <div className="lg:col-span-6 bg-[#07130F] p-6 rounded-2xl border border-white/10 text-center space-y-4">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Projected Annual FinOps Savings</span>
                      <p className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#22C55E] via-[#06B6D4] to-[#4ADE80] font-mono">
                        ${(Math.round((50000 * 12) * ((rightsizeRatio * 0.5 + spotRatio * 0.4 + storageRatio * 0.3) / 100))).toLocaleString()} / yr
                      </p>
                      <p className="text-xs text-gray-300 max-w-xs mx-auto">
                        Based on optimized AWS EC2/RDS cluster rightsizing and automated S3 Glacier lifecycle triggers.
                      </p>
                    </div>

                  </div>
                </motion.div>
              )}

              {/* TAB 4: AI INSIGHT COPILOT */}
              {activeTab === 'insights' && (
                <motion.div
                  key="insights"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="space-y-6"
                >
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-white/10 pb-4">
                    <div>
                      <span className="text-[10px] font-bold text-[#8B5CF6] uppercase tracking-widest">Natural Language FinOps Assistant</span>
                      <h3 className="text-xl font-bold text-white mt-1">CloudAtlas AI Insight Engine</h3>
                    </div>
                    <Link to="/insights" className="inline-flex items-center gap-1.5 text-xs font-bold text-[#8B5CF6] hover:underline">
                      <span>Chat with Copilot</span>
                      <ArrowUpRight className="h-4 w-4" />
                    </Link>
                  </div>

                  {/* Sample Prompt Selector */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { id: 'ec2_spike', text: 'Why did AWS EC2 spike in us-east-1 last Tuesday?' },
                      { id: 'cut_azure', text: 'How can I reduce Azure App Service costs by $5k/mo?' },
                      { id: 'untagged', text: 'Identify all untagged EC2 & RDS resources in production.' }
                    ].map(p => (
                      <button
                        key={p.id}
                        onClick={() => setSelectedPrompt(p.id)}
                        className={`p-3 rounded-xl text-xs text-left border transition-all cursor-pointer ${
                          selectedPrompt === p.id 
                            ? 'bg-[#8B5CF6]/20 border-[#8B5CF6]/50 text-white font-semibold' 
                            : 'bg-white/[0.02] border-white/5 text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        "{p.text}"
                      </button>
                    ))}
                  </div>

                  {/* Prompt Output Answer */}
                  <div className="p-5 rounded-2xl bg-[#07130F] border border-white/10 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#8B5CF6]">
                      <Sparkles className="h-4 w-4" />
                      <span>CloudAtlas AI Response</span>
                    </div>

                    {selectedPrompt === 'ec2_spike' && (
                      <div className="text-xs text-gray-200 space-y-2 leading-relaxed">
                        <p>Analysis of AWS CUR logs indicates an un-throttled batch job spun up 12 <code className="text-[#22C55E] bg-white/5 px-1 py-0.5 rounded font-mono">c5.9xlarge</code> compute instances in us-east-1 on Tuesday at 14:22 UTC.</p>
                        <p className="text-[#06B6D4] font-medium">✨ Recommendation: Enforce auto-termination lifecycle policy after 4 hours of idle CPU &lt; 5% to prevent future $4,200/day runaway charges.</p>
                      </div>
                    )}

                    {selectedPrompt === 'cut_azure' && (
                      <div className="text-xs text-gray-200 space-y-2 leading-relaxed">
                        <p>Found 4 Azure App Service instances running on <code className="text-[#22C55E] bg-white/5 px-1 py-0.5 rounded font-mono">P3v2</code> premium tier with average memory utilization below 22% over the last 30 days.</p>
                        <p className="text-[#06B6D4] font-medium">✨ Recommendation: Downgrade to <code className="text-[#22C55E] bg-white/5 px-1 py-0.5 rounded font-mono">P1v2</code> standard tier saving an estimated $5,120 / month instantly.</p>
                      </div>
                    )}

                    {selectedPrompt === 'untagged' && (
                      <div className="text-xs text-gray-200 space-y-2 leading-relaxed">
                        <p>Scan complete: 18 untagged resources detected across AWS us-east-1 (12 EC2, 4 EBS volumes, 2 RDS DB snapshots) consuming $3,450/mo without owner tags.</p>
                        <p className="text-[#06B6D4] font-medium">✨ Recommendation: Deploy Tag-Enforcement Terraform Sentinel rule to block untagged provisioning.</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* TAB 5: DATA PIPELINE */}
              {activeTab === 'ingestion' && (
                <motion.div
                  key="ingestion"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="space-y-6"
                >
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-white/10 pb-4">
                    <div>
                      <span className="text-[10px] font-bold text-[#F59E0B] uppercase tracking-widest">Multi-Cloud Ingestion Engine</span>
                      <h3 className="text-xl font-bold text-white mt-1">Billing Data Schema & Parser</h3>
                    </div>
                    <Link to="/upload" className="inline-flex items-center gap-1.5 text-xs font-bold text-[#F59E0B] hover:underline">
                      <span>Upload Billing Dataset</span>
                      <ArrowUpRight className="h-4 w-4" />
                    </Link>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 text-left space-y-2">
                      <div className="text-xs font-bold text-[#22C55E] flex items-center gap-1.5">
                        <CheckCircle className="h-4 w-4" /> AWS CUR 2.0 Parser
                      </div>
                      <p className="text-[11px] text-gray-400">Parses line_item_UnblendedCost, usage_type, and product_code automatically.</p>
                    </div>

                    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 text-left space-y-2">
                      <div className="text-xs font-bold text-[#06B6D4] flex items-center gap-1.5">
                        <CheckCircle className="h-4 w-4" /> Azure Cost Management
                      </div>
                      <p className="text-[11px] text-gray-400">Ingests Enterprise Agreement CSV exports and subscription invoice lines.</p>
                    </div>

                    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 text-left space-y-2">
                      <div className="text-xs font-bold text-[#8B5CF6] flex items-center gap-1.5">
                        <CheckCircle className="h-4 w-4" /> GCP BigQuery Billing
                      </div>
                      <p className="text-[11px] text-gray-400">Extracts service.description, cost, credits, and project labels in real-time.</p>
                    </div>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>

        </div>
      </section>

      {/* 6. PLATFORM MODULES SHOWCASE (ALL PROJECT FEATURES) */}
      <section id="modules" className="py-24 bg-[#091510] relative border-b border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-16">
          
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-bold text-[#22C55E] uppercase tracking-widest">Platform Core Architecture</span>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              8 Powerful Modules for End-to-End FinOps Control
            </h2>
            <p className="text-sm text-gray-300">
              Every detail of CloudAtlas AI is engineered to give engineering teams, finance leads, and executive board members total clarity over cloud expenditure.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {modules.map((mod) => {
              const Icon = mod.icon;
              return (
                <div 
                  key={mod.id}
                  className="glass-card p-6 rounded-2xl border border-white/10 bg-[#0C1A14]/80 text-left hover:border-[#22C55E]/40 transition-all duration-300 group flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className={`p-3 rounded-xl bg-gradient-to-tr ${mod.color} text-white shadow-md`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest bg-white/5 border border-white/10 px-2 py-0.5 rounded">
                        {mod.tag}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white group-hover:text-[#22C55E] transition-colors">{mod.name}</h3>
                    <p className="text-xs text-gray-400 leading-relaxed">{mod.desc}</p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-white/5">
                    <Link to={mod.path} className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-300 group-hover:text-[#22C55E] transition-colors">
                      <span>Explore Module</span>
                      <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* 7. INTERACTIVE ROI SAVINGS CALCULATOR */}
      <section id="calculator" className="py-24 bg-[#07130F] relative border-b border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="glass-card rounded-3xl border border-white/10 p-8 sm:p-12 bg-gradient-to-br from-[#0C1A14] to-[#07130F] max-w-5xl mx-auto shadow-2xl space-y-10">
            
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <span className="text-xs font-bold text-[#06B6D4] uppercase tracking-widest bg-[#06B6D4]/10 px-3 py-1 rounded-full border border-[#06B6D4]/20">
                Interactive ROI Calculator
              </span>
              <h2 className="text-3xl font-black text-white">Estimate Your Cloud Savings Potential</h2>
              <p className="text-xs text-gray-300">
                Drag the monthly cloud spend slider to compute your enterprise annual cost reduction.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              {/* Slider Input */}
              <div className="lg:col-span-7 space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-300">Current Monthly Cloud Spend</span>
                    <span className="text-2xl font-black text-white font-mono">${monthlySpend.toLocaleString()} / mo</span>
                  </div>
                  <input 
                    type="range"
                    min="5000"
                    max="500000"
                    step="5000"
                    value={monthlySpend}
                    onChange={(e) => setMonthlySpend(Number(e.target.value))}
                    className="w-full h-3 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#22C55E]"
                  />
                  <div className="flex justify-between text-[10px] text-gray-400 font-mono mt-2">
                    <span>$5,000</span>
                    <span>$250,000</span>
                    <span>$500,000+</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-left">
                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Estimated Monthly Savings</span>
                    <p className="text-xl font-black text-[#22C55E] mt-1 font-mono">${monthlySavings.toLocaleString()}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Cost Reduction Pct</span>
                    <p className="text-xl font-black text-[#06B6D4] mt-1 font-mono">{estimatedSavingsPct}%</p>
                  </div>
                </div>
              </div>

              {/* Annual Savings Card Result */}
              <div className="lg:col-span-5 bg-gradient-to-tr from-[#16A34A]/20 via-[#22C55E]/15 to-[#06B6D4]/10 p-8 rounded-2xl border border-[#22C55E]/30 text-center space-y-4">
                <span className="text-xs font-bold uppercase tracking-widest text-[#22C55E]">Projected Annual Net Savings</span>
                <p className="text-4xl sm:text-5xl font-black text-white font-mono">${annualSavings.toLocaleString()}</p>
                <p className="text-xs text-gray-300 leading-relaxed">
                  Calculated based on average 35%-65% savings achieved across AWS EC2/RDS, Azure VMs, and GCP BigQuery optimizations.
                </p>
                <Link to="/register" className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#16A34A] to-[#22C55E] px-6 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-md hover:scale-[1.02] transition-all w-full justify-center">
                  <span>Start Free FinOps Trial</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* 8. PIPELINE WORKFLOW MECHANICS (HOW IT WORKS) */}
      <section id="pipeline" className="py-24 bg-[#091510] relative border-b border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-16">
          
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-bold text-[#8B5CF6] uppercase tracking-widest">SaaS Pipeline Mechanics</span>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">How CloudAtlas AI Optimizes Your Footprint</h2>
            <p className="text-sm text-gray-300">Automated multi-cloud telemetry ingestion to policy execution in 4 seamless steps.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            {[
              {
                step: '01',
                title: 'Data Ingestion & Sync',
                desc: 'Consolidate AWS Cost Usage Reports, Azure billing hubs, and GCP exports automatically into our unified metadata database every 4 hours.',
                icon: Database,
                tag: 'Multi-Cloud API'
              },
              {
                step: '02',
                title: 'One-Class SVM Scan',
                desc: 'Assess compute clusters, database queries, and storage objects using SVM outlier detection to identify cost anomalies within 60 seconds.',
                icon: AlertTriangle,
                tag: 'SVM Detection'
              },
              {
                step: '03',
                title: 'XGBoost Forecasting',
                desc: 'Predict monthly cost trajectories and potential budget overruns over a 90-day horizon with a validated 98.6% forecasting accuracy margin.',
                icon: TrendingUp,
                tag: 'XGBoost Regressor'
              },
              {
                step: '04',
                title: 'Automated Right-Sizing',
                desc: 'Initiate auto-scaling, scale down idle replication DB instances, and transition cold data buckets to Glacier storage archives instantly.',
                icon: CheckCircle,
                tag: 'FinOps Execution'
              }
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="glass-card p-6 rounded-2xl border border-white/10 bg-[#0C1A14]/80 text-left relative overflow-hidden group hover:border-[#22C55E]/30 transition-all duration-300">
                  <div className="flex justify-between items-center mb-4">
                    <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-[#22C55E]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-3xl font-black text-white/10 font-mono group-hover:text-[#22C55E]/20 transition-colors">
                      {item.step}
                    </span>
                  </div>
                  <span className="text-[9px] font-bold text-[#22C55E] uppercase tracking-widest bg-[#22C55E]/10 px-2 py-0.5 rounded border border-[#22C55E]/20">
                    {item.tag}
                  </span>
                  <h3 className="text-base font-bold text-white mt-3">{item.title}</h3>
                  <p className="text-xs text-gray-400 mt-2 leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* 9. CLOUD ECOSYSTEM INTEGRATIONS (HORIZONTAL GALLERY) */}
      <section id="integrations" className="horizontal-gallery-section relative min-h-[60vh] bg-[#07130F] overflow-hidden flex items-center border-b border-white/10 py-16">
        <div className="w-full space-y-8">
          
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-left space-y-2">
            <span className="text-xs font-bold text-[#06B6D4] uppercase tracking-widest">Enterprise Ecosystem</span>
            <h2 className="text-3xl font-black text-white tracking-tight">Compatible Across All Major Cloud Providers</h2>
          </div>

          <div ref={horizontalContainerRef} className="flex gap-6 px-8 pb-4 w-max">
            {cloudIntegrations.map((cloud, idx) => (
              <div 
                key={idx}
                className="w-[300px] sm:w-[340px] p-6 rounded-2xl bg-[#0C1A14]/90 border border-white/10 hover:border-[#22C55E]/40 shadow-xl transition-all duration-300 relative flex flex-col justify-between h-[200px]"
              >
                <div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-mono text-[#22C55E] font-bold tracking-wider bg-white/5 border border-white/10 px-2.5 py-1 rounded-full">
                      {cloud.tag}
                    </span>
                    <Cloud className="h-5 w-5 text-gray-400" style={{ color: cloud.color }} />
                  </div>
                  <h3 className="text-lg font-bold text-white mt-4">{cloud.name}</h3>
                  <p className="text-xs text-gray-400 leading-relaxed mt-2">{cloud.desc}</p>
                </div>

                <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-300 uppercase tracking-wider">
                  <CheckCircle className="h-3.5 w-3.5 text-[#22C55E]" />
                  <span>Native Telemetry Connector</span>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 10. ZERO-TRUST SECURITY & COMPLIANCE SHIELD */}
      <section className="py-20 bg-[#091510] relative border-b border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            <div className="lg:col-span-6 space-y-6 text-left">
              <span className="text-xs font-bold text-[#8B5CF6] uppercase tracking-widest bg-[#8B5CF6]/10 px-3 py-1 rounded-full border border-[#8B5CF6]/20">
                Enterprise-Grade Security
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                Zero-Trust FinOps Architecture Built for Compliance
              </h2>
              <p className="text-sm text-gray-300 leading-relaxed">
                CloudAtlas AI operates on strict read-only cloud permissions, stateless JWT token authorization, and full audit logging. Your infrastructure credentials are never exposed.
              </p>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center gap-3">
                  <Lock className="h-5 w-5 text-[#22C55E]" />
                  <span className="text-xs font-bold text-gray-200">AES-256 Encryption</span>
                </div>
                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center gap-3">
                  <Shield className="h-5 w-5 text-[#06B6D4]" />
                  <span className="text-xs font-bold text-gray-200">Role-Based Access</span>
                </div>
                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center gap-3">
                  <Bell className="h-5 w-5 text-[#8B5CF6]" />
                  <span className="text-xs font-bold text-gray-200">Webhook Alerts</span>
                </div>
                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center gap-3">
                  <Award className="h-5 w-5 text-[#F59E0B]" />
                  <span className="text-xs font-bold text-gray-200">SOC2 & ISO Ready</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="glass-card p-6 rounded-2xl border border-white/10 bg-[#0C1A14]/90 space-y-4 font-mono text-left">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <span className="text-xs text-[#22C55E] font-bold">SECURITY_AUDIT_LOG_STREAM</span>
                  <span className="text-[10px] text-gray-400">STATUS: SECURE</span>
                </div>
                <div className="space-y-2 text-[11px] text-gray-300">
                  <p><span className="text-gray-500">[16:18:02]</span> AUTH_JWT: Bearer token verified for devops_admin@company.com</p>
                  <p><span className="text-gray-500">[16:18:05]</span> AWS_CUR: Read-only STS AssumeRole established (us-east-1)</p>
                  <p><span className="text-gray-500">[16:18:10]</span> SVM_MODEL: Evaluated 2,400 billing vectors. Zero security breaches found.</p>
                  <p><span className="text-[#22C55E]">[16:18:15] PASS: All zero-trust policy assertions validated cleanly.</span></p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 11. FAQ ACCORDION */}
      <section id="faq" className="py-24 bg-[#07130F] relative border-b border-white/10">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center space-y-3">
            <span className="text-xs font-bold text-[#22C55E] uppercase tracking-widest">Frequently Asked Questions</span>
            <h2 className="text-3xl font-black text-white tracking-tight">Everything You Need to Know</h2>
          </div>

          <div className="space-y-4 text-left">
            {faqList.map((item, idx) => (
              <div 
                key={idx}
                className="glass-card rounded-2xl border border-white/10 bg-[#0C1A14]/80 overflow-hidden transition-all duration-300"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? -1 : idx)}
                  className="w-full p-6 flex justify-between items-center text-left font-bold text-sm sm:text-base text-white hover:text-[#22C55E] transition-colors cursor-pointer"
                >
                  <span>{item.q}</span>
                  {openFaq === idx ? (
                    <ChevronUp className="h-5 w-5 text-[#22C55E] shrink-0" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-400 shrink-0" />
                  )}
                </button>

                <AnimatePresence>
                  {openFaq === idx && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-6 pb-6 text-xs sm:text-sm text-gray-300 leading-relaxed border-t border-white/5 pt-4"
                    >
                      {item.a}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 12. CALL TO ACTION (CTA) BANNER */}
      <section className="py-24 bg-[#091510] relative z-20 overflow-hidden">
        
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#22C55E]/10 blur-[160px] pointer-events-none" />

        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-8">
          <div className="glass-card rounded-3xl border border-[#22C55E]/30 p-10 sm:p-16 bg-gradient-to-b from-[#0C1A14]/90 to-[#07130F]/95 shadow-[0_0_50px_rgba(34,197,94,0.15)] space-y-6">
            
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#22C55E]/10 border border-[#22C55E]/30 text-[#22C55E] text-xs font-bold uppercase tracking-wider">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Ready for Total FinOps Control?</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
              Start Optimizing Multi-Cloud Spend <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#16A34A] via-[#22C55E] to-[#4ADE80]">
                With AI Precision Today.
              </span>
            </h2>

            <p className="text-sm text-gray-300 max-w-xl mx-auto leading-relaxed">
              Join engineering teams reducing monthly AWS, Azure, and GCP bills by up to 65% with XGBoost predictions and One-Class SVM anomaly protection.
            </p>

            <div className="flex flex-wrap justify-center gap-4 pt-4">
              <Link to="/register" className="inline-flex items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-[#16A34A] via-[#22C55E] to-[#4ADE80] px-8 py-4 text-xs font-extrabold uppercase tracking-wider text-white shadow-[0_0_30px_rgba(34,197,94,0.4)] hover:scale-[1.03] transition-all">
                <span>Create Free Account</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              
              <Link to="/dashboard" className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/5 border border-white/10 px-8 py-4 text-xs font-extrabold uppercase tracking-wider text-gray-200 hover:text-white hover:bg-white/10 transition-all">
                <Activity className="h-4 w-4 text-[#22C55E]" />
                <span>Launch Console</span>
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* 13. FOOTER */}
      <footer className="relative bg-[#050B08] border-t border-white/10 py-16 z-20 text-gray-400">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12 text-left">
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            
            <div className="space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-[#16A34A] to-[#22C55E] p-[1px]">
                  <div className="flex h-full w-full items-center justify-center rounded-[7px] bg-[#07130F]">
                    <Activity className="h-4 w-4 text-[#22C55E]" />
                  </div>
                </div>
                <span className="font-black text-white text-base">CloudAtlas AI</span>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">
                Enterprise AI-driven multi-cloud billing prediction, FinOps cost optimization, and real-time anomaly detection.
              </p>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Core Modules</h4>
              <ul className="space-y-2 text-xs">
                <li><Link to="/predictions" className="hover:text-[#22C55E] transition-colors">PredictIQ Forecasts</Link></li>
                <li><Link to="/anomalies" className="hover:text-[#22C55E] transition-colors">Anomaly Detection</Link></li>
                <li><Link to="/simulator" className="hover:text-[#22C55E] transition-colors">Scenario Simulator</Link></li>
                <li><Link to="/risk-assessment" className="hover:text-[#22C55E] transition-colors">Risk & Security Score</Link></li>
                <li><Link to="/insights" className="hover:text-[#22C55E] transition-colors">AI FinOps Copilot</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Platform Services</h4>
              <ul className="space-y-2 text-xs">
                <li><Link to="/upload" className="hover:text-[#22C55E] transition-colors">Data Ingestion Upload</Link></li>
                <li><Link to="/datasets" className="hover:text-[#22C55E] transition-colors">Datasets Repository</Link></li>
                <li><Link to="/model-training" className="hover:text-[#22C55E] transition-colors">Model Training Studio</Link></li>
                <li><Link to="/reports" className="hover:text-[#22C55E] transition-colors">Executive PDF Reports</Link></li>
                <li><Link to="/users" className="hover:text-[#22C55E] transition-colors">Team Governance & RBAC</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Authentication & Access</h4>
              <ul className="space-y-2 text-xs">
                <li><Link to="/login" className="hover:text-[#22C55E] transition-colors">User Sign In</Link></li>
                <li><Link to="/register" className="hover:text-[#22C55E] transition-colors">Account Registration</Link></li>
                <li><Link to="/admin/login" className="hover:text-[#22C55E] transition-colors">Super Admin Portal</Link></li>
                <li><Link to="/profile" className="hover:text-[#22C55E] transition-colors">API Keys & Settings</Link></li>
              </ul>
            </div>

          </div>

          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
            <p>© 2026 CloudAtlas AI. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#sandbox" className="hover:text-white transition-colors">Documentation</a>
              <a href="#calculator" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#faq" className="hover:text-white transition-colors">Security Audit</a>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
};

export default LandingPage;
