import React, { useEffect, useRef, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { 
  ArrowRight, Play, TrendingUp, Cpu, Sparkles, Activity, Shield, AlertTriangle, 
  CheckCircle, Database, Server, RefreshCw, BarChart3, LineChart, AppWindow,
  Terminal, Code, HardDrive, Check, MessageSquare, ExternalLink, Menu, X, ArrowUpRight
} from 'lucide-react';
import { TiltCard } from '../components/common/TiltCard';
import { CinematicBackground } from '../components/landing/CinematicBackground';

gsap.registerPlugin(ScrollTrigger);

export const LandingPage = () => {
  const location = useLocation();
  const containerRef = useRef(null);
  const horizontalContainerRef = useRef(null);
  
  // Active states
  const [activeTab, setActiveTab] = useState('summary');
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Interactive Live Dashboard States
  const [liveCost, setLiveCost] = useState(64380);
  const [liveSavings, setLiveSavings] = useState(12890);
  const [cpuUsage, setCpuUsage] = useState(64);
  const [memUsage, setMemUsage] = useState(78);
  const [totalUsers, setTotalUsers] = useState(3);

  useEffect(() => {
    fetch('/api/auth/user-count')
      .then(res => res.json())
      .then(data => {
        if (data && typeof data.count === 'number') {
          setTotalUsers(data.count);
        }
      })
      .catch(err => console.error('Failed to load user count:', err));

    // Lenis Smooth Scroll Setup
    const lenis = new Lenis({
      duration: 1.4,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Shrink navbar on scroll
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);

    // Live Dashboard Update Loop
    const dashboardInterval = setInterval(() => {
      setLiveCost(prev => prev + (Math.random() > 0.5 ? 15 : -10));
      setLiveSavings(prev => prev + (Math.random() > 0.6 ? 6 : -4));
      setCpuUsage(prev => {
        const next = prev + Math.floor(Math.random() * 9) - 4;
        return Math.max(30, Math.min(95, next));
      });
      setMemUsage(prev => {
        const next = prev + Math.floor(Math.random() * 5) - 2;
        return Math.max(50, Math.min(90, next));
      });
    }, 3000);

    // GSAP ScrollTrigger Animations for KAI.S Editorial Rythm
    
    // 1. Horizontal Gallery Section
    if (horizontalContainerRef.current) {
      const scrollWidth = horizontalContainerRef.current.scrollWidth - window.innerWidth;
      gsap.to(horizontalContainerRef.current, {
        x: -scrollWidth,
        ease: 'none',
        scrollTrigger: {
          trigger: '.horizontal-gallery-section',
          start: 'top top',
          end: () => `+=${scrollWidth}`,
          pin: true,
          scrub: 1,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        }
      });
    }

    // 2. Editorial showcase fades
    gsap.utils.toArray('.editorial-block').forEach((block) => {
      gsap.fromTo(block, 
        { opacity: 0, y: 50 },
        { 
          opacity: 1, 
          y: 0, 
          duration: 1,
          scrollTrigger: {
            trigger: block,
            start: 'top 80%',
            end: 'bottom 20%',
            toggleActions: 'play none none reverse'
          }
        }
      );
    });

    return () => {
      lenis.destroy();
      window.removeEventListener('scroll', handleScroll);
      clearInterval(dashboardInterval);
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  // Framer Motion transforms for Hero parallax
  const { scrollYProgress } = useScroll();
  const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 0.94]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

  const showcases = [
    {
      category: 'Diagnostic Pipeline',
      title: 'XGBoost Prediction Engine',
      desc: 'Predict multi-cloud compute and cluster pricing vectors up to 90 days out with absolute forecast confidence.',
      stat: '98.6% Accuracy',
      color: 'from-[#3B82F6] to-[#10B981]'
    },
    {
      category: 'Resource Optimization',
      title: 'Automated Rightsizing Panel',
      desc: 'Isolate idle dev clusters, oversized DB instances, and unattached disks, deploying clean policies instantly.',
      stat: '65% Average Savings',
      color: 'from-[#3B82F6] to-[#10B981]'
    },
    {
      category: 'Security Guards',
      title: 'SecureShield Audit Log',
      desc: 'Isolate billing anomalies linked directly with security requests or misconfigured credential configurations.',
      stat: 'Zero-Trust Architecture',
      color: 'from-[#3B82F6] to-[#10B981]'
    }
  ];

  const modules = [
    { name: 'PredictIQ', desc: 'Forecast infrastructure spend anomalies.', metric: 'XGBoost Active' },
    { name: 'Budget Guardian', desc: 'Secure real-time cost alerts.', metric: '<1s Alert Delay' },
    { name: 'CostLens', desc: 'Granular multi-cloud organization tags.', metric: 'Multi-Tenant Active' },
    { name: 'SecureShield', desc: 'Identify rogue cost misconfigurations.', metric: 'Secured logs' },
    { name: 'CarbonIQ', desc: 'Optimize ecological efficiency factors.', metric: '-45% Carbon Offset' },
    { name: 'Auto Optimizer', desc: 'Actionable optimization engine policies.', metric: '90-Day Forecast' }
  ];

  const cloudProviders = [
    { name: 'Amazon Web Services', desc: 'Sync CUR clusters, spot configurations, and Compute Savings Plans.', tag: 'AWS' },
    { name: 'Microsoft Azure', desc: 'Monitor active VMs, App Services, and Enterprise Agreement pipelines.', tag: 'Azure' },
    { name: 'Google Cloud Platform', desc: 'Parse BigQuery billing buckets, GKE clusters, and persistent disks.', tag: 'GCP' },
    { name: 'Kubernetes Nodes', desc: 'Track CPU/Memory namespaces down to pod level in multi-tenant environments.', tag: 'K8s' },
    { name: 'Terraform Configs', desc: 'Predict operational cost impacts directly during Plan states.', tag: 'IaC' }
  ];

  return (
    <div ref={containerRef} className="min-h-screen text-[#F7FAFC] overflow-x-hidden relative" style={{ backgroundColor: 'var(--color-navy-dark)' }}>
      
      {/* Cinematic Animated Background */}
      <CinematicBackground />

      {/* Floating Glass Navbar */}
      <nav className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-32px)] max-w-7xl rounded-xl border transition-all duration-500 ${
        scrolled 
          ? 'bg-[#132820]/90 backdrop-blur-xl border-white/10 py-2 shadow-xl' 
          : 'bg-[#07130F]/20 backdrop-blur-md border-white/5 py-3'
      }`}>
        <div className="px-6 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-[#16A34A] via-[#22C55E] to-[#4ADE80] p-[1px] shadow-md transition-transform group-hover:scale-105">
              <div className="flex h-full w-full items-center justify-center rounded-[7px] bg-[#07130F]">
                <Activity className="h-4 w-4 text-[#22C55E] animate-pulse" />
              </div>
            </div>
            <span className="text-lg font-bold tracking-tight text-white">
              CloudAtlas <span className="text-[#22C55E]">AI</span>
            </span>
          </Link>

          {/* Nav Menu */}
          <div className="hidden md:flex items-center gap-6">
            <a href="#showcase" className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 hover:text-white transition-colors">Showcase</a>
            <a href="#modules" className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 hover:text-white transition-colors">Modules</a>
            <a href="#dashboard" className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 hover:text-white transition-colors">Interactive AI</a>
            <a href="#gallery" className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 hover:text-white transition-colors">Integrations</a>
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <Link to="/login" className="text-[10px] font-bold uppercase tracking-wider text-gray-300 hover:text-white transition-colors">Login</Link>
            <Link to="/login" className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-[#16A34A] via-[#22C55E] to-[#4ADE80] px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-white shadow-md hover:opacity-90 hover:scale-[1.02] transition-all">
              <span>Get Started</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {/* Mobile Menu Trigger */}
          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-gray-400 hover:text-white p-2">
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {/* SECTION 1: HERO */}
      <motion.section style={{ scale: heroScale, opacity: heroOpacity }} className="relative min-h-[90vh] flex items-center justify-center pt-32 pb-16 overflow-hidden z-10">
        {/* Deep luxury ambient glow blobs just behind Hero content */}
        <div className="absolute top-[20%] left-[5%] w-[350px] h-[350px] rounded-full bg-[#22C55E]/5 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-[10%] right-[10%] w-[400px] h-[400px] rounded-full bg-[#4ADE80]/5 blur-[120px] pointer-events-none" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-6 text-left space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#16A34A]/10 via-[#22C55E]/10 to-[#4ADE80]/10 border border-[#22C55E]/20 text-gray-200 text-[10px] font-bold uppercase tracking-wider mb-1">
              <Sparkles className="h-3.5 w-3.5 text-[#4ADE80] animate-pulse" />
              <span>Next-Generation FinOps Intelligence</span>
            </div>
            
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-[1.1] text-white">
              CloudAtlas AI <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#16A34A] via-[#22C55E] to-[#4ADE80] text-5xl font-black">
                Enterprise Cloud Intelligence.
              </span>
            </h1>

            <p className="text-xs sm:text-sm text-gray-300 max-w-lg leading-relaxed">
              Predict multi-cloud billing anomalies, optimize compute and storage vectors, and orchestrate zero-trust FinOps architectures with complete forecasting confidence.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <Link to="/login" className="glow-btn-primary inline-flex items-center justify-center gap-2 rounded-xl px-7 py-3.5 text-xs font-bold uppercase tracking-wider text-white transition-all hover:scale-[1.02] active:scale-[0.98]">
                <span>Access AI Console</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a href="#dashboard" className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/5 border border-white/10 px-7 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-300 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all hover:scale-[1.02]">
                <Play className="h-3.5 w-3.5 text-[#22C55E] fill-[#22C55E]/20" />
                <span>Live Sandbox Demo</span>
              </a>
            </div>
          </div>

          <div className="lg:col-span-6 relative flex items-center justify-center">
            {/* Elegant glowing background ring decoration */}
            <div className="absolute inset-0 bg-gradient-to-tr from-[#16A34A]/20 to-[#4ADE80]/20 rounded-3xl blur-[40px] opacity-40 scale-95 pointer-events-none" />

            <TiltCard className="w-full max-w-md p-[1px] rounded-2xl bg-gradient-to-b from-white/15 to-transparent border border-white/10 shadow-2xl backdrop-blur-xl relative overflow-hidden group premium-border-glow">
              <div className="relative z-10 bg-[#0D1D17]/95 rounded-[15px] p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                  <span className="text-[10px] text-gray-500 font-mono">cloudatlas-forecast.io</span>
                  <div className="flex items-center gap-2 text-[9px] font-bold text-[#22C55E] bg-[#22C55E]/10 px-2 py-0.5 rounded border border-[#22C55E]/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse-glow" />
                    Live System Active
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors">
                    <span className="text-[8px] font-bold text-gray-400 uppercase tracking-wider block truncate">Spend Run-rate</span>
                    <p className="text-sm sm:text-base font-black text-white mt-1">${liveCost.toLocaleString()}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-[#22C55E]/5 border border-[#22C55E]/15 hover:border-[#22C55E]/30 transition-colors">
                    <span className="text-[8px] font-bold text-[#22C55E] uppercase tracking-wider block truncate">Active Savings</span>
                    <p className="text-sm sm:text-base font-black text-[#22C55E] mt-1">${liveSavings.toLocaleString()}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-[#4ADE80]/5 border border-[#4ADE80]/15 hover:border-[#4ADE80]/30 transition-colors">
                    <span className="text-[8px] font-bold text-[#4ADE80] uppercase tracking-wider block truncate">Console Nodes</span>
                    <p className="text-sm sm:text-base font-black text-[#4ADE80] mt-1">{totalUsers} Active</p>
                  </div>
                </div>

                {/* Premium Mini-Graph visualization decoration */}
                <div className="pt-2 border-t border-white/5">
                  <div className="flex justify-between items-center text-[8px] text-gray-500 font-mono mb-2">
                    <span>90-Day Cost Trend</span>
                    <span className="text-[#22C55E]">Forecasting Model Validated</span>
                  </div>
                  <div className="h-10 flex items-end gap-1 px-1">
                    {[35, 45, 30, 50, 40, 65, 55, 70, 60, 85].map((val, i) => (
                      <div key={i} className="flex-1 bg-gradient-to-t from-[#16A34A] to-[#4ADE80] rounded-t-[2px] transition-all duration-500 hover:opacity-80" style={{ height: `${val}%` }} />
                    ))}
                  </div>
                </div>
              </div>
            </TiltCard>
          </div>
        </div>
      </motion.section>

      {/* SECTION 2: SHOWCASE SECTIONS */}
      <section id="showcase" className="py-16 bg-[#05070B]/50 relative border-t border-white/5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-20">
          
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Editorial Showcase</span>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Precision Design Architecture</h2>
          </div>

          {showcases.map((show, idx) => (
            <div 
              key={idx}
              className={`editorial-block grid grid-cols-1 lg:grid-cols-12 gap-8 items-center ${
                idx % 2 === 1 ? 'lg:flex-row-reverse' : ''
              }`}
            >
              {/* Image side */}
              <div className={`lg:col-span-7 ${idx % 2 === 1 ? 'lg:order-2' : ''}`}>
                <div className="glass-card rounded-2xl overflow-hidden border border-white/5 bg-[#121824]/80 p-6 h-[260px] flex items-center justify-center relative group">
                  <div className="relative z-10 text-center space-y-3">
                    <span className="text-[10px] font-bold text-primary tracking-widest uppercase border border-white/10 bg-white/5 px-2 py-0.5 rounded">
                      {show.stat}
                    </span>
                    <h3 className="text-xl font-black text-white">{show.title}</h3>
                    <p className="text-[11px] text-gray-400 max-w-md leading-relaxed">{show.desc}</p>
                  </div>
                </div>
              </div>

              {/* Text side */}
              <div className={`lg:col-span-5 text-left space-y-4 ${idx % 2 === 1 ? 'lg:order-1' : ''}`}>
                <span className="text-[10px] font-bold text-[#10B981] uppercase tracking-widest">{show.category}</span>
                <h3 className="text-xl sm:text-2xl font-black text-white leading-tight">{show.title}</h3>
                <p className="text-xs text-gray-300 leading-relaxed">{show.desc}</p>
                <div className="pt-2">
                  <Link to="/login" className="inline-flex items-center gap-1 text-[10px] font-bold text-primary uppercase tracking-wider hover:underline">
                    <span>Learn More</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>

            </div>
          ))}

        </div>
      </section>

      {/* SECTION 2.5: METEORIC ANOMALY & FORECAST PIPELINE */}
      <section className="py-20 bg-[#070b13] border-t border-white/5 relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-[10px] font-bold text-[#10B981] uppercase tracking-widest">SaaS Pipeline Mechanics</span>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">How CloudAtlas Optimizes Your Footprint</h2>
            <p className="text-xs text-gray-400">Our automated model runs telemetry loops, detects anomalies, and executes savings policies in real time.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            {[
              {
                step: '01',
                title: 'Data Ingestion & Sync',
                desc: 'Consolidate AWS Cost Usage Reports, Azure billing hubs, and GCP exports automatically into our unified metadata database every 4 hours.',
                metric: 'Multi-Cloud API'
              },
              {
                step: '02',
                title: 'One-Class SVM Scan',
                desc: 'Assess compute clusters, database queries, and storage objects using SVM outliers detection to identify anomalies within 60 seconds.',
                metric: 'SVM Detection'
              },
              {
                step: '03',
                title: 'XGBoost Forecasting',
                desc: 'Predict monthly cost trajectories and potential budget overruns over a 12-month horizon with a validated 2.4% forecasting error margin.',
                metric: 'XGBoost Regressor'
              },
              {
                step: '04',
                title: 'Automated Right-Sizing',
                desc: 'Initiate auto-scaling, scale down idle replication DB instances, and transition cold data buckets to Glacier storage archives instantly.',
                metric: 'FinOps Execution'
              }
            ].map((item, idx) => (
              <div key={idx} className="glass-card p-6 rounded-2xl border border-white/5 bg-[#121824]/60 text-left relative overflow-hidden group hover:border-[#10B981]/20 transition-all duration-300">
                <div className="absolute top-4 right-4 text-3xl font-black text-white/5 font-mono select-none group-hover:text-primary/10 transition-colors">
                  {item.step}
                </div>
                <span className="text-[8px] font-bold text-[#10B981] uppercase tracking-widest bg-[#10B981]/10 px-2 py-0.5 rounded border border-[#10B981]/20">
                  {item.metric}
                </span>
                <h3 className="text-base font-bold text-white mt-4">{item.title}</h3>
                <p className="text-xs text-gray-400 mt-2 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 3: CLOUDATLAS MODULES */}
      <section id="modules" className="py-20 bg-[#090D16] overflow-hidden border-t border-white/5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center space-y-12">
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Platform Modules</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Architectural Building Blocks</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modules.map((mod, idx) => (
              <div 
                key={idx}
                className="glass-card p-6 rounded-2xl border border-white/5 bg-[#121824]/80 text-left hover:border-primary/30 transition-all duration-300 group relative overflow-hidden"
              >
                <span className="text-[8px] font-bold text-primary uppercase tracking-widest border border-white/10 bg-white/5 px-2 py-0.5 rounded">
                  {mod.metric}
                </span>
                <h3 className="text-lg font-bold text-white mt-3">{mod.name}</h3>
                <p className="text-xs text-gray-400 mt-1 leading-relaxed">{mod.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 4: HORIZONTAL GALLERY */}
      <section id="gallery" className="horizontal-gallery-section relative min-h-[70vh] bg-[#05070B]/50 overflow-hidden flex items-center border-t border-white/5">
        <div className="w-full">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-8 text-left">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Integrations</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">Compatible Ecosystem</h2>
          </div>

          <div ref={horizontalContainerRef} className="flex gap-6 px-8 pb-8 w-max">
            {cloudProviders.map((cloud, idx) => (
              <div 
                key={idx}
                className="w-[280px] sm:w-[320px] p-6 rounded-2xl bg-[#121824]/80 border border-white/5 hover:border-primary/30 shadow-md transition-all duration-300 relative flex flex-col justify-between h-[180px]"
              >
                <div>
                  <span className="text-[10px] font-mono text-primary font-bold tracking-wider bg-white/5 border border-white/10 px-2 py-0.5 rounded">
                    {cloud.tag}
                  </span>
                  <h3 className="text-lg font-bold text-white mt-4">{cloud.name}</h3>
                  <p className="text-xs text-gray-400 leading-relaxed mt-2">{cloud.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 5: INTERACTIVE AI DASHBOARD */}
      <section id="dashboard" className="relative py-28 bg-[#090D16] overflow-hidden border-t border-white/5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full text-center">
          
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Interactive Console</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mt-2">
              Dynamic FinOps Analytics Control
            </h2>
          </div>

          <div className="glass-card rounded-[32px] border border-white/5 shadow-2xl p-6 sm:p-8 bg-[#121824]/90 relative overflow-hidden text-left max-w-5xl mx-auto">
            
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-white/5 pb-6 mb-6">
              <div>
                <span className="text-[9px] font-bold text-primary uppercase tracking-widest">Diagnostics Console</span>
                <h3 className="text-lg font-bold text-white mt-0.5">Distributed Infrastructure Overview</h3>
              </div>

              <div className="flex bg-[#090D16] p-1 rounded-xl border border-white/5 gap-1 self-start sm:self-center">
                {['summary', 'regression'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider cursor-pointer transition-all ${
                      activeTab === tab 
                        ? 'bg-primary text-white shadow-md' 
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <AnimatePresence mode="wait">
              {activeTab === 'summary' && (
                <motion.div 
                  key="summary"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-5 rounded-2xl bg-white/[0.01] border border-white/5">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Active Spend Rate</span>
                      <p className="text-2xl font-black text-white mt-2">${liveCost.toLocaleString()}</p>
                    </div>
                    <div className="p-5 rounded-2xl bg-white/[0.01] border border-white/5">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Consolidated Saving</span>
                      <p className="text-2xl font-black text-[#10B981] mt-2">${liveSavings.toLocaleString()}</p>
                    </div>
                    <div className="p-5 rounded-2xl bg-white/[0.01] border border-white/5">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">System Load</span>
                      <p className="text-2xl font-black text-white mt-2">{cpuUsage}%</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative bg-[#05070B] border-t border-white/5 py-16 z-10 text-slate-400">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full flex flex-col md:flex-row justify-between items-center gap-8 text-xs">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            <span className="font-bold text-white text-sm">CloudAtlas AI</span>
          </div>
          <div className="flex gap-8">
            <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">GitHub</a>
            <a href="#showcase" className="hover:text-white transition-colors">Documentation</a>
            <a href="#modules" className="hover:text-white transition-colors">Pricing</a>
          </div>
          <p>© 2026 CloudAtlas AI. All rights reserved.</p>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;
