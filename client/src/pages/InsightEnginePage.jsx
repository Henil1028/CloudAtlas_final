import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Bot, Send, Sparkles, TrendingUp, ShieldAlert, DollarSign, FileText,
  Download, RotateCcw, Paperclip, Copy, Check, Trash2, FileDown, AlertTriangle
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { ConsoleLayout } from '../components/console/ConsoleLayout';
import { PageHeader } from '../components/console/PageHeader';
import api from '../services/api';

// Visual Colors
const COLORS = ['#7C3AED', '#06B6D4', '#22C55E', '#F59E0B', '#EF4444', '#EC4899'];

const PROMPT_BUTTONS = [
  { key: 'cost', label: 'AWS vs Azure Costs', icon: DollarSign, color: '#06B6D4', prompt: 'Compare AWS vs Azure spending' },
  { key: 'prediction', label: 'Predict Next Month', icon: TrendingUp, color: '#8B5CF6', prompt: 'Predict next month\'s bill' },
  { key: 'risk', label: 'Cost Anomalies', icon: ShieldAlert, color: '#EF4444', prompt: 'Find cost anomalies' },
  { key: 'recommend', label: 'Suggest Optimizations', icon: Sparkles, color: '#22C55E', prompt: 'Suggest cost optimizations' },
];

const TypingIndicator = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '12px 16px' }}>
    {[0, 0.2, 0.4].map((d, i) => (
      <div key={i} style={{
        width: '6px', height: '6px', borderRadius: '50%',
        background: '#7C3AED', opacity: 0.6,
        animation: 'pulse-glow 1.2s ease-in-out infinite',
        animationDelay: `${d}s`,
      }} />
    ))}
    <style>{`
      @keyframes pulse-glow {
        0%, 100% { transform: scale(0.8); opacity: 0.4; }
        50% { transform: scale(1.3); opacity: 1; }
      }
    `}</style>
  </div>
);

// Dynamic Chart Renderer Component
const AIChartRenderer = ({ data, functionCalled }) => {
  if (!data) return null;

  try {
    if (functionCalled === 'getProviderCost()' && data.providerSpend) {
      return (
        <div style={{ height: '240px', marginTop: '16px', background: 'rgba(255,255,255,0.01)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)' }}>
          <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748B', display: 'block', marginBottom: '8px' }}>Provider Share Breakdown (USD)</span>
          <ResponsiveContainer width="100%" height="90%">
            <PieChart>
              <Pie
                data={data.providerSpend}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="cost"
                nameKey="provider"
              >
                {data.providerSpend.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Cost']} contentStyle={{ background: '#0F172A', borderColor: 'rgba(255,255,255,0.1)' }} />
              <Legend verticalAlign="bottom" height={36} formatter={(value) => <span style={{ color: '#94A3B8', fontSize: '11px' }}>{value}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      );
    }

    if (functionCalled === 'getTopServices()' && data.topServices) {
      return (
        <div style={{ height: '240px', marginTop: '16px', background: 'rgba(255,255,255,0.01)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)' }}>
          <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748B', display: 'block', marginBottom: '8px' }}>Top Services Cost Breakdown</span>
          <ResponsiveContainer width="100%" height="90%">
            <BarChart data={data.topServices.slice(0, 5)}>
              <XAxis dataKey="service" tick={{ fill: '#64748B', fontSize: 10 }} />
              <YAxis tick={{ fill: '#64748B', fontSize: 10 }} />
              <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Cost']} contentStyle={{ background: '#0F172A', borderColor: 'rgba(255,255,255,0.1)' }} />
              <Bar dataKey="cost" fill="#7C3AED" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      );
    }

    if (functionCalled === 'getTopRegions()' && data.topRegions) {
      return (
        <div style={{ height: '240px', marginTop: '16px', background: 'rgba(255,255,255,0.01)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)' }}>
          <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748B', display: 'block', marginBottom: '8px' }}>Top Regions Cost Breakdown</span>
          <ResponsiveContainer width="100%" height="90%">
            <BarChart data={data.topRegions.slice(0, 5)} layout="vertical">
              <XAxis type="number" tick={{ fill: '#64748B', fontSize: 10 }} />
              <YAxis dataKey="region" type="category" tick={{ fill: '#64748B', fontSize: 10 }} width={80} />
              <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Cost']} contentStyle={{ background: '#0F172A', borderColor: 'rgba(255,255,255,0.1)' }} />
              <Bar dataKey="cost" fill="#06B6D4" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      );
    }

    if (functionCalled === 'getDailyCost()' && data.dailySpend) {
      return (
        <div style={{ height: '240px', marginTop: '16px', background: 'rgba(255,255,255,0.01)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)' }}>
          <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748B', display: 'block', marginBottom: '8px' }}>Daily Cost Trend (Last 15 Days)</span>
          <ResponsiveContainer width="100%" height="90%">
            <AreaChart data={data.dailySpend}>
              <XAxis dataKey="date" tick={{ fill: '#64748B', fontSize: 10 }} />
              <YAxis tick={{ fill: '#64748B', fontSize: 10 }} />
              <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Cost']} contentStyle={{ background: '#0F172A', borderColor: 'rgba(255,255,255,0.1)' }} />
              <Area type="monotone" dataKey="cost" stroke="#8B5CF6" fill="rgba(139, 92, 246, 0.15)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      );
    }

    if (functionCalled === 'getForecast()' && data.forecast) {
      // Create simple projection line chart
      const chartData = [
        { name: 'Baseline Spend', Cost: data.forecast.predictedMonthSpend * 0.85 },
        { name: 'Forecasted Target', Cost: data.forecast.predictedMonthSpend },
      ];
      return (
        <div style={{ height: '200px', marginTop: '16px', background: 'rgba(255,255,255,0.01)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)' }}>
          <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748B', display: 'block', marginBottom: '8px' }}>ML Cost Forecasting Profile</span>
          <ResponsiveContainer width="100%" height="90%">
            <LineChart data={chartData}>
              <XAxis dataKey="name" tick={{ fill: '#64748B', fontSize: 10 }} />
              <YAxis tick={{ fill: '#64748B', fontSize: 10 }} />
              <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Cost']} contentStyle={{ background: '#0F172A', borderColor: 'rgba(255,255,255,0.1)' }} />
              <Line type="monotone" dataKey="Cost" stroke="#22C55E" strokeWidth={3} activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      );
    }

    if (functionCalled === 'getMonthlyComparison()' && data.monthlySpend) {
      return (
        <div style={{ height: '240px', marginTop: '16px', background: 'rgba(255,255,255,0.01)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)' }}>
          <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748B', display: 'block', marginBottom: '8px' }}>Month over Month (MoM) Spend Comparison</span>
          <ResponsiveContainer width="100%" height="90%">
            <BarChart data={data.monthlySpend}>
              <XAxis dataKey="month" tick={{ fill: '#64748B', fontSize: 10 }} />
              <YAxis tick={{ fill: '#64748B', fontSize: 10 }} />
              <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Cost']} contentStyle={{ background: '#0F172A', borderColor: 'rgba(255,255,255,0.1)' }} />
              <Bar dataKey="cost" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      );
    }
  } catch (e) {
    console.error('Failed rendering inline chart:', e);
  }
  return null;
};

export const InsightEnginePage = () => {
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem('cloudatlas_chat_history');
    return saved ? JSON.parse(saved) : [
      {
        role: 'assistant',
        text: "Hello! I'm your CloudAtlas AI FinOps Consultant. I can help analyze your cloud cost predictions, budgets, anomalies, and provide recommendations. Ask me anything!",
        functionCalled: 'none',
        confidenceScore: null,
        estimatedSavings: null,
        data: null
      }
    ];
  });
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);

  const bottomRef = useRef(null);
  const fileInputRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    localStorage.setItem('cloudatlas_chat_history', JSON.stringify(messages));
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const triggerSearchQuery = (promptText) => {
    sendPrompt(promptText);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedFile({
        name: file.name,
        size: (file.size / 1024).toFixed(1) + ' KB',
      });
    }
  };

  const clearChat = () => {
    const defaultMsg = [
      {
        role: 'assistant',
        text: "Hello! I'm your CloudAtlas AI FinOps Consultant. I can help analyze your cloud cost predictions, budgets, anomalies, and provide recommendations. Ask me anything!",
        functionCalled: 'none',
        confidenceScore: null,
        estimatedSavings: null,
        data: null
      }
    ];
    setMessages(defaultMsg);
    localStorage.setItem('cloudatlas_chat_history', JSON.stringify(defaultMsg));
    setUploadedFile(null);
  };

  const copyToClipboard = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const exportChat = (format) => {
    const exportContent = messages.map(m => `[${m.role.toUpperCase()}]\n${m.text || ''}\n`).join('\n---\n\n');
    const blob = new Blob([exportContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `cloudatlas_chat_export.${format === 'json' ? 'json' : 'txt'}`;
    link.click();
  };

  const sendPrompt = async (promptOverride) => {
    const promptText = promptOverride || input;
    if (!promptText.trim()) return;

    let fullPrompt = promptText;
    if (uploadedFile) {
      fullPrompt = `[Attached File: ${uploadedFile.name} (${uploadedFile.size})]\n\n${promptText}`;
    }

    const userMsg = { role: 'user', text: fullPrompt };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setUploadedFile(null);
    setTyping(true);
    setShowAlert(true);

    try {
      const response = await api.post('/chat', {
        message: promptText,
        history: messages.slice(-10) // Send recent context history
      });

      const aiMsg = {
        role: 'assistant',
        text: response.data.text,
        functionCalled: response.data.functionCalled,
        confidenceScore: response.data.confidenceScore,
        estimatedSavings: response.data.estimatedSavings,
        data: response.data.data
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, {
        role: 'assistant',
        text: "I encountered an error connecting to the CloudAtlas AI reasoning gateway. Please check that the server is online and try again.",
        functionCalled: 'none'
      }]);
    } finally {
      setTyping(false);
      setShowAlert(false);
    }
  };

  const regenerateResponse = () => {
    // Find the last user message
    const userMsgs = messages.filter(m => m.role === 'user');
    if (userMsgs.length > 0) {
      const lastUserText = userMsgs[userMsgs.length - 1].text;
      sendPrompt(lastUserText);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const query = params.get('q');
    if (query) {
      sendPrompt(query);
    }
  }, [location.search]);

  return (
    <ConsoleLayout title="AI Assistant">
      <PageHeader
        title="AI Assistant"
        subtitle="ChatGPT-style professional FinOps copilot powered by CloudAtlas RAG pipelines"
        icon={Bot}
        iconColor="#7C3AED"
        breadcrumb={['CloudAtlas AI', 'FinOps Workspace', 'AI Assistant']}
        actions={
          <div style={{ display: 'flex', gap: '8px' }}>
            <span className="badge-purple">GPT / RAG Active</span>
            <button
              onClick={clearChat}
              style={{
                display: 'flex', alignItems: 'center', gap: '5px',
                padding: '5px 12px', borderRadius: '7px', fontSize: '12px',
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
                color: '#A0AEC0', cursor: 'pointer', fontFamily: 'Inter',
              }}
            >
              <RotateCcw size={11} />
              Reset Chat
            </button>
          </div>
        }
      />

      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '20px', height: 'calc(100vh - 240px)', minHeight: '520px' }} className="insight-grid">
        
        {/* Suggested Actions Sidebar */}
        <div className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px', height: 'fit-content' }}>
          <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600, fontSize: '13px', color: '#F1F5F9', marginBottom: '8px' }}>
            Suggested Prompts
          </div>
          {PROMPT_BUTTONS.map(pb => (
            <button
              key={pb.key}
              onClick={() => triggerSearchQuery(pb.prompt)}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '10px 12px', borderRadius: '9px', width: '100%',
                background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)',
                color: '#94A3B8', cursor: 'pointer', textAlign: 'left',
                fontSize: '12.5px', fontFamily: 'Inter', fontWeight: 500,
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = `${pb.color}30`; e.currentTarget.style.background = `${pb.color}08`; e.currentTarget.style.color = pb.color; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.background = 'rgba(255,255,255,0.025)'; e.currentTarget.style.color = '#94A3B8'; }}
            >
              <pb.icon size={14} style={{ flexShrink: 0, color: pb.color }} />
              {pb.label}
            </button>
          ))}

          <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)', margin: '8px 0' }} />
          <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600, fontSize: '13px', color: '#F1F5F9', marginBottom: '4px' }}>
            Export Chat
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <button onClick={() => exportChat('txt')} style={{
              display: 'flex', alignItems: 'center', justify: 'center', gap: '5px',
              padding: '8px 10px', borderRadius: '8px',
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
              color: '#A0AEC0', cursor: 'pointer', fontSize: '11px', fontFamily: 'Inter', fontWeight: 500,
            }}>
              <FileDown size={12} />
              TEXT
            </button>
            <button onClick={() => exportChat('json')} style={{
              display: 'flex', alignItems: 'center', justify: 'center', gap: '5px',
              padding: '8px 10px', borderRadius: '8px',
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
              color: '#A0AEC0', cursor: 'pointer', fontSize: '11px', fontFamily: 'Inter', fontWeight: 500,
            }}>
              <FileText size={12} />
              JSON
            </button>
          </div>
        </div>

        {/* Chat Body */}
        <div style={{
          display: 'flex', flexDirection: 'column',
          background: 'rgba(15,23,42,0.4)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '16px',
          overflow: 'hidden',
        }}>
          {/* Conversation Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {messages.map((msg, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start', gap: '8px' }}>
                {msg.role === 'user' ? (
                  <div style={{
                    maxWidth: '75%', padding: '12px 16px',
                    background: 'rgba(124,58,237,0.15)',
                    border: '1px solid rgba(124,58,237,0.25)',
                    borderRadius: '12px 12px 4px 12px',
                    fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#F1F5F9', lineHeight: 1.5,
                  }}>
                    {msg.text}
                  </div>
                ) : (
                  <div style={{ maxWidth: '85%', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                    <div style={{
                      width: '32px', height: '32px', borderRadius: '10px', flexShrink: 0,
                      background: 'linear-gradient(135deg, #7C3AED, #06B6D4)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '2px',
                    }}>
                      <Bot size={15} color="#fff" />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div className="markdown-chat-body" style={{
                        padding: '14px 18px',
                        background: 'rgba(255,255,255,0.025)',
                        border: '1px solid rgba(255,255,255,0.05)',
                        borderRadius: '4px 14px 14px 14px',
                        fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#94A3B8', lineHeight: 1.6,
                      }}>
                        <ReactMarkdown>{msg.text}</ReactMarkdown>
                        
                        {/* Render inline Recharts visualizations */}
                        <AIChartRenderer data={msg.data} functionCalled={msg.functionCalled} />
                      </div>

                      {/* Message Meta Info & Toolbar */}
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', paddingLeft: '8px', fontSize: '11px', color: '#64748B' }}>
                        {msg.functionCalled && msg.functionCalled !== 'none' && (
                          <span style={{ fontFamily: 'monospace', color: '#A78BFA' }}>RAG: {msg.functionCalled}</span>
                        )}
                        {msg.confidenceScore && (
                          <span>Score: {msg.confidenceScore}</span>
                        )}
                        {msg.estimatedSavings && (
                          <span style={{ color: '#22C55E', fontWeight: 600 }}>Est. Savings: {msg.estimatedSavings}</span>
                        )}
                        <button
                          onClick={() => copyToClipboard(msg.text, i)}
                          style={{
                            background: 'none', border: 'none', color: '#4A5568', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: '3px', transition: 'color 0.2s'
                          }}
                          onMouseEnter={e => e.currentTarget.style.color = '#CBD5E0'}
                          onMouseLeave={e => e.currentTarget.style.color = '#4A5568'}
                        >
                          {copiedIndex === i ? <Check size={11} color="#22C55E" /> : <Copy size={11} />}
                          {copiedIndex === i ? 'Copied' : 'Copy'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {typing && (
              <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '10px', flexShrink: 0, background: 'linear-gradient(135deg, #7C3AED, #06B6D4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Sparkles size={14} color="#fff" />
                </div>
                <div style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '4px 14px 14px 14px' }}>
                  <TypingIndicator />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Upload preview */}
          {uploadedFile && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '8px 20px', background: 'rgba(124,58,237,0.08)',
              borderTop: '1px solid rgba(124,58,237,0.15)',
              fontSize: '12px', color: '#A78BFA',
            }}>
              <FileText size={13} />
              <span>Attached: <strong>{uploadedFile.name}</strong> ({uploadedFile.size})</span>
              <button
                onClick={() => setUploadedFile(null)}
                style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer' }}
              >
                <Trash2 size={13} />
              </button>
            </div>
          )}

          {/* Message Input Box */}
          <div style={{
            padding: '16px 20px',
            borderTop: '1px solid rgba(255,255,255,0.06)',
            background: 'rgba(8,17,31,0.4)',
            display: 'flex', gap: '10px', alignItems: 'flex-end',
          }}>
            <button
              onClick={() => fileInputRef.current.click()}
              style={{
                width: '42px', height: '42px', borderRadius: '10px',
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                color: '#A0AEC0', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.2s', flexShrink: 0,
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
            >
              <Paperclip size={16} />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              style={{ display: 'none' }}
              accept=".csv,.pdf"
            />

            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendPrompt(); } }}
              placeholder="Ask a cloud billing or FinOps optimization question... (Enter to send)"
              rows={2}
              style={{
                flex: 1, background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px',
                padding: '10px 14px', color: '#F1F5F9', fontSize: '14px',
                fontFamily: 'Inter, sans-serif', outline: 'none', resize: 'none',
                lineHeight: 1.5,
              }}
              onFocus={e => { e.target.style.borderColor = 'rgba(124,58,237,0.4)'; }}
              onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; }}
            />

            <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
              {messages.length > 2 && (
                <button
                  onClick={regenerateResponse}
                  title="Regenerate Last Response"
                  style={{
                    width: '42px', height: '42px', borderRadius: '10px',
                    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                    color: '#A0AEC0', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                >
                  <RotateCcw size={15} />
                </button>
              )}

              <button
                onClick={() => sendPrompt()}
                disabled={!input.trim() && !uploadedFile || typing}
                style={{
                  width: '42px', height: '42px', borderRadius: '10px',
                  background: (input.trim() || uploadedFile) && !typing ? 'linear-gradient(135deg, #7C3AED, #6D28D9)' : 'rgba(255,255,255,0.03)',
                  border: 'none', color: (input.trim() || uploadedFile) && !typing ? '#fff' : '#4A5568',
                  cursor: (input.trim() || uploadedFile) && !typing ? 'pointer' : 'not-allowed',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.2s',
                }}
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Processing Alert */}
      {showAlert && (
        <div style={{
          position: 'fixed',
          top: '80px',
          right: '24px',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '12px 20px',
          background: 'rgba(124, 58, 237, 0.15)',
          border: '1px solid rgba(124, 58, 237, 0.3)',
          borderRadius: '12px',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 10px 30px rgba(124, 58, 237, 0.25)',
          color: '#fff',
          fontFamily: 'Inter, sans-serif',
          fontSize: '13px',
          fontWeight: 600,
          animation: 'slide-in-alert 0.4s cubic-bezier(0.16, 1, 0.3, 1) both'
        }}>
          <Sparkles size={16} className="animate-pulse" style={{ color: '#A78BFA' }} />
          <span>CloudAtlas AI is analyzing records...</span>
        </div>
      )}

      {/* Embedded Styles */}
      <style>{`
        @keyframes slide-in-alert {
          from { transform: translateX(120%) scale(0.9); opacity: 0; }
          to { transform: translateX(0) scale(1); opacity: 1; }
        }
        .markdown-chat-body table {
          width: 100%;
          border-collapse: collapse;
          margin: 12px 0;
          font-size: 13px;
        }
        .markdown-chat-body th, .markdown-chat-body td {
          border: 1px solid rgba(255,255,255,0.06);
          padding: 8px 10px;
          text-align: left;
        }
        .markdown-chat-body th {
          background: rgba(255,255,255,0.03);
          color: #F1F5F9;
        }
        .markdown-chat-body td {
          color: #94A3B8;
        }
        .markdown-chat-body ul, .markdown-chat-body ol {
          padding-left: 20px;
          margin: 8px 0;
        }
        .markdown-chat-body li {
          margin-bottom: 4px;
        }
        .markdown-chat-body h3 {
          font-family: Outfit, sans-serif;
          font-weight: 700;
          color: #F1F5F9;
          margin-top: 14px;
          margin-bottom: 8px;
          font-size: 15px;
        }
        .markdown-chat-body p {
          margin-top: 0;
          margin-bottom: 8px;
        }
        @media (max-width: 1024px) {
          .insight-grid { grid-template-columns: 1fr !important; height: auto !important; }
        }
      `}</style>
    </ConsoleLayout>
  );
};

export default InsightEnginePage;
