import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageSquare, X, Send, Bot, User, Sparkles,
  Volume2, VolumeX, ArrowRight, CheckCircle2, Anchor, ChevronRight, RotateCcw
} from 'lucide-react';
import { AnalysisResult, Detection, SampleItem, Statistics } from '../../types/sonar';
import { sendChatMessage } from '../../services/api';

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenUpload?: () => void;
  onOpenSamples?: () => void;
  onNavigateSection?: (sectionId: string) => void;
  onSelectDetection?: (detection: Detection) => void;
  initialQuery?: string;
  activeResult?: AnalysisResult | null;
  selectedDetection?: Detection | null;
  statistics?: Statistics | null;
  isAuvSweeping?: boolean;
  activeSample?: SampleItem | null;
}

interface Message {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: string;
  suggestedQuestions?: string[];
  action?: {
    label: string;
    sectionId?: string;
    triggerUpload?: boolean;
    triggerSamples?: boolean;
    openAssessment?: boolean;
    detectionId?: string;
  };
}

interface AssessmentState {
  depth: 'shallow' | 'shelf' | 'deep';
  shadow: 'hard' | 'diffuse' | 'minimal';
  gear: 'gillnet' | 'trawl' | 'longline' | 'trap';
  substrate: 'sand' | 'coral' | 'rock';
}

export const AIAssistantModal: React.FC<AIAssistantModalProps> = ({
  isOpen,
  onClose,
  onOpenUpload,
  onOpenSamples,
  onNavigateSection,
  initialQuery,
  activeResult,
  selectedDetection,
  statistics,
  isAuvSweeping,
  activeSample,
}) => {
  const [activeTab, setActiveTab] = useState<'chat' | 'assessment'>('chat');
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isAudioEnabled, setIsAudioEnabled] = useState<boolean>(false);
  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Chat message history
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'bot',
      text: "Welcome! I am your SeaTrace Acoustic AI Companion Guide. Across our marine survey sectors, we monitor 358 verified ghost net clusters with 94.7% acoustic classification accuracy. Dual-frequency side-scan sonar (455/900 kHz) penetrates zero-visibility turbid waters, isolating synthetic net lattices from seabed rocks with 0% natural false positives.",
      timestamp: 'Just now',
    },
  ]);

  // Assessment parameters
  const [assessment, setAssessment] = useState<AssessmentState>({
    depth: 'shelf',
    shadow: 'hard',
    gear: 'gillnet',
    substrate: 'coral',
  });
  const [assessmentResult, setAssessmentResult] = useState<{
    threatIndex: number;
    confidence: number;
    method: string;
    urgency: string;
    rationale: string;
  } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Speech synthesis helper
  const speakText = (text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window && isAudioEnabled) {
      window.speechSynthesis.cancel();
      const cleanText = text.replace(/[*_#`]/g, '');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 1.0;
      utterance.pitch = 1.05;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Quick prompt suggestions with icons
  const suggestedPrompts = [
    'What is this application for?',
    'What can it do?',
    'How does Side-Scan Sonar work?',
    'How are risk scores calculated?',
    'What types of debris can you detect?',
    'Explain the false-positive filter',
  ];

  // Guided walkthrough steps
  const steps = [
    {
      id: 1,
      title: 'Sonar Overview',
      nextLabel: 'Next: 2. Field Assessment',
      onNext: () => {
        setCurrentStep(2);
        setActiveTab('assessment');
      },
    },
    {
      id: 2,
      title: 'Field Assessment',
      nextLabel: 'Next: 3. Ocean Hotspots',
      onNext: () => {
        setCurrentStep(3);
        setActiveTab('chat');
        onNavigateSection?.('map');
      },
    },
    {
      id: 3,
      title: 'Ocean Hotspots',
      nextLabel: 'Next: 4. Sonar Ingestion',
      onNext: () => {
        setCurrentStep(4);
        onOpenUpload?.();
      },
    },
    {
      id: 4,
      title: 'Sonar Ingestion',
      nextLabel: 'Restart Tour: 1. Sonar Overview',
      onNext: () => {
        setCurrentStep(1);
        setActiveTab('chat');
      },
    },
  ];

  useEffect(() => {
    if (isOpen && initialQuery) {
      handleSend(initialQuery);
    }
  }, [isOpen, initialQuery]);

  useEffect(() => {
    if (messages.length <= 3) {
      if (messagesContainerRef.current) {
        messagesContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else {
      const latestTurn = messagesContainerRef.current?.querySelector('[data-latest-turn="true"]');
      if (latestTurn) {
        latestTurn.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [messages, isTyping]);

  // Handle sending message via AI conversational engine
  const handleSend = async (textToSend?: string) => {
    const q = (textToSend || inputQuery).trim();
    if (!q) return;

    const ts = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: q,
      timestamp: ts,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsTyping(true);

    try {
      const historyForApi = messages.map((m) => ({
        sender: m.sender,
        text: m.text,
      }));

      const res = await sendChatMessage(
        {
          message: q,
          history: historyForApi,
        },
        {
          activeResult,
          selectedDetection,
          statistics,
          isAuvSweeping,
          activeSample,
        }
      );

      const botReply: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: res.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        action: res.action,
        suggestedQuestions: res.suggestedQuestions,
      };

      setMessages((prev) => [...prev, botReply]);
      speakText(res.reply);
    } catch {
      const fallbackMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: "SeaTrace AI unites high-frequency acoustic sonar with edge neural networks to detect submerged marine debris. How can I assist your survey?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSayHi = () => {
    const hiText = "Hello! I am your SeaTrace Acoustic AI Companion. I can help evaluate sonar scans, analyze debris entanglement risk, or guide your marine survey.";
    const userHi: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: "👋 Hi SeaTrace AI!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    const botHi: Message = {
      id: (Date.now() + 1).toString(),
      sender: 'bot',
      text: hiText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, userHi, botHi]);
    speakText(hiText);
  };

  // Run Personal Assessment
  const runAssessmentCalculation = () => {
    let baseThreat = 50;
    let baseConfidence = 80;
    let method = 'Autonomous Work-Class ROV';
    let urgency = 'Standard Priority';
    let rationale = '';

    if (assessment.depth === 'shallow') {
      baseThreat += 20;
      method = 'Technical Diver Team with Lift Bags (Depth <20m)';
      rationale += 'Shallow coastal zone poses immediate risk to small fishing vessels and shallow coral. ';
    } else if (assessment.depth === 'shelf') {
      baseThreat += 15;
      method = 'Observation ROV with Snag Line Cutter (Depth 20-60m)';
      rationale += 'Continental shelf depth is prime habitat for pelagic drift and demersal marine life. ';
    } else {
      baseThreat += 5;
      method = 'Heavy Class III Work ROV with Hydraulic Shears (Depth >60m)';
      rationale += 'Deep seabed location requires tethered robotic intervention. ';
    }

    if (assessment.shadow === 'hard') {
      baseConfidence += 16;
      rationale += 'Prominent acoustic shadow confirms tall profile suspended in the water column. ';
    } else if (assessment.shadow === 'diffuse') {
      baseConfidence += 10;
      rationale += 'Diffuse shadow suggests loose draped webbing over seafloor topography. ';
    } else {
      baseConfidence -= 15;
      rationale += 'Minimal shadow indicates flattened or partially silt-buried gear. ';
    }

    if (assessment.substrate === 'coral') {
      baseThreat += 20;
      urgency = 'CRITICAL · High Ecological Threat';
      rationale += 'Snagged on living coral reef causing structural fragmentation. ';
    } else if (assessment.substrate === 'rock') {
      baseThreat += 10;
      urgency = 'HIGH · Entanglement Hazard';
    } else {
      urgency = 'MODERATE · Sediment Encroachment';
    }

    const threat = Math.min(Math.max(baseThreat, 30), 98);
    const conf = Math.min(Math.max(baseConfidence, 65), 97.4);

    setAssessmentResult({
      threatIndex: threat,
      confidence: conf,
      method,
      urgency,
      rationale,
    });
  };

  // Helper to render formatted markdown
  const renderFormattedText = (text: string) => {
    return text.split('\n\n').map((paragraph, pIdx) => {
      if (paragraph.startsWith('### ') || paragraph.startsWith('#### ')) {
        const title = paragraph.replace(/^#+\s*/, '');
        return (
          <h4 key={pIdx} className="font-semibold text-cyan-300 dark:text-cyan-300 light:text-cyan-800 text-xs mt-2 mb-1 font-sans tracking-tight">
            {title}
          </h4>
        );
      }
      if (paragraph.startsWith('- ') || paragraph.startsWith('* ') || paragraph.startsWith('• ') || /^\d+\./.test(paragraph)) {
        const items = paragraph.split('\n');
        return (
          <ul key={pIdx} className="space-y-1.5 my-1.5 pl-1">
            {items.map((item, iIdx) => {
              const cleanItem = item.replace(/^[-*•\d.]+\s*/, '');
              return (
                <li key={iIdx} className="text-[11.5px] leading-relaxed flex items-start gap-2 text-neutral-200 dark:text-neutral-200 light:text-slate-800">
                  <span className="text-cyan-400 font-bold shrink-0 mt-0.5">•</span>
                  <span className="flex-1">{renderInlineText(cleanItem)}</span>
                </li>
              );
            })}
          </ul>
        );
      }
      return (
        <p key={pIdx} className="my-1.5 text-[11.5px] leading-relaxed text-neutral-200 dark:text-neutral-200 light:text-slate-800 font-normal">
          {renderInlineText(paragraph)}
        </p>
      );
    });
  };

  const renderInlineText = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*|`.*?`|\$\$.*?\$\$|\$.*?\$|\*.*?\*)/g);
    return parts.map((part, idx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={idx} className="font-semibold text-white dark:text-white light:text-slate-950">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code key={idx} className="px-1.5 py-0.5 rounded bg-cyan-950/60 dark:bg-cyan-950/60 light:bg-cyan-100/80 text-cyan-300 dark:text-cyan-300 light:text-cyan-900 font-mono text-[10.5px] border border-cyan-500/20">
            {part.slice(1, -1)}
          </code>
        );
      }
      if (part.startsWith('$') && part.endsWith('$')) {
        return (
          <code key={idx} className="px-1.5 py-0.5 rounded bg-cyan-950/60 dark:bg-cyan-950/60 light:bg-cyan-100/80 text-cyan-300 dark:text-cyan-300 light:text-cyan-900 font-mono text-[10.5px] border border-cyan-500/20">
            {part.replace(/^\$+|\$+$/g, '')}
          </code>
        );
      }
      if (part.startsWith('*') && part.endsWith('*')) {
        return <span key={idx} className="text-cyan-200/90 dark:text-cyan-200/90 light:text-cyan-800 italic">{part.slice(1, -1)}</span>;
      }
      return part;
    });
  };

  if (!isOpen) return null;

  const currentStepData = steps.find((s) => s.id === currentStep) || steps[0];

  return (
    <div
      className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[410px] max-w-[calc(100vw-24px)] h-[620px] max-h-[calc(100vh-80px)] flex flex-col rounded-3xl bg-[#091122]/95 dark:bg-[#091122]/95 light:bg-white/95 text-white dark:text-white light:text-slate-900 border border-cyan-500/35 dark:border-cyan-500/30 light:border-cyan-600/30 shadow-[0_25px_70px_rgba(0,0,0,0.85)] dark:shadow-[0_25px_70px_rgba(0,0,0,0.85)] light:shadow-[0_20px_50px_rgba(0,100,120,0.2)] backdrop-blur-2xl animate-in zoom-in-95 slide-in-from-bottom-5 duration-300 ease-out overflow-hidden font-sans"
      role="dialog"
      aria-label="SeaTrace AI Pop-out Companion"
    >
      {/* ========================================================
          CARD HEADER (Matching Reference UI)
         ======================================================== */}
      <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 border-b border-cyan-500/20 dark:border-cyan-500/20 light:border-slate-200 bg-[#070e1b]/90 dark:bg-[#070e1b]/90 light:bg-slate-50/90 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          {/* Squircle Avatar with glowing eyes/robot */}
          <div className="w-10 h-10 rounded-2xl bg-[#07192c] border border-cyan-400/50 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)] shrink-0">
            <Bot className="w-5 h-5 text-cyan-400" />
          </div>

          <div className="truncate leading-tight">
            <div className="flex items-baseline gap-1.5">
              <span className="text-sm font-bold text-white dark:text-white light:text-slate-900 tracking-tight">
                SeaTrace AI
              </span>
              <span className="text-xs font-semibold text-cyan-400 dark:text-cyan-400 light:text-cyan-700">
                Companion
              </span>
            </div>
            <p className="text-[10px] text-cyan-200/60 dark:text-cyan-200/60 light:text-slate-500 font-mono truncate mt-0.5">
              Acoustic Sonar & Field Guide
            </p>
          </div>
        </div>

        {/* Right Action Badges & Buttons */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Live Guide Pill Badge */}
          <div className="hidden xs:flex px-2 py-0.5 rounded-lg border border-cyan-500/40 bg-cyan-500/10 text-cyan-400 dark:text-cyan-400 light:text-cyan-700 text-[10px] font-mono font-semibold tracking-wider">
            Live Guide
          </div>

          {/* Audio Speaker Toggle */}
          <button
            onClick={() => {
              const next = !isAudioEnabled;
              setIsAudioEnabled(next);
              if (next) {
                speakText("Audio guide enabled. SeaTrace AI is listening.");
              } else if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                window.speechSynthesis.cancel();
              }
            }}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              isAudioEnabled
                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                : 'bg-white/5 dark:bg-white/5 light:bg-slate-100 border-white/10 dark:border-white/10 light:border-slate-200 text-neutral-400 hover:text-cyan-300 hover:border-cyan-500/40'
            }`}
            title={isAudioEnabled ? 'Mute Speech' : 'Enable Speech Guide'}
            aria-label="Toggle Audio Guide"
          >
            {isAudioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* New Chat Reset Button (Visible when conversing) */}
          {messages.length > 1 && (
            <button
              onClick={() => setMessages(messages.slice(0, 1))}
              className="px-2 py-1.5 rounded-xl bg-white/5 hover:bg-cyan-500/20 border border-white/10 hover:border-cyan-500/40 text-neutral-300 hover:text-cyan-300 text-xs font-medium flex items-center gap-1 transition-all cursor-pointer"
              title="Start New Conversation"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="text-[10px] font-mono">New</span>
            </button>
          )}

          {/* 👋 Hi! Button */}
          <button
            onClick={handleSayHi}
            className="px-2.5 py-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 text-cyan-300 dark:text-cyan-300 light:text-cyan-700 text-xs font-bold flex items-center gap-1 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            title="Say Hi"
          >
            <span className="text-xs">👋</span>
            <span className="text-[11px]">Hi!</span>
          </button>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 dark:bg-white/5 light:bg-slate-100 border border-white/10 dark:border-white/10 light:border-slate-200 text-neutral-400 hover:text-white dark:hover:text-white light:hover:text-slate-900 hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close Assistant Pop-out"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ========================================================
          SEGMENTED MODE TABS (Companion Chat vs Field Assessment)
         ======================================================== */}
      <div className="px-4 pt-2.5 pb-1 flex items-center justify-between border-b border-cyan-500/15 dark:border-cyan-500/15 light:border-slate-200 bg-[#081220]/60 dark:bg-[#081220]/60 light:bg-slate-100/70 shrink-0">
        <div className="flex w-full p-1 rounded-2xl bg-black/40 dark:bg-black/40 light:bg-slate-200/80 border border-cyan-500/20 dark:border-cyan-500/20 light:border-slate-300 text-xs font-mono">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex-1 py-1.5 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 font-bold cursor-pointer ${
              activeTab === 'chat'
                ? 'bg-cyan-500 text-black shadow-[0_0_15px_rgba(6,182,212,0.4)] dark:bg-cyan-500 dark:text-black light:bg-cyan-600 light:text-white'
                : 'text-neutral-400 hover:text-white dark:text-neutral-400 dark:hover:text-white light:text-slate-600 light:hover:text-slate-900'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Companion Chat</span>
          </button>
          <button
            onClick={() => setActiveTab('assessment')}
            className={`flex-1 py-1.5 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 font-bold cursor-pointer ${
              activeTab === 'assessment'
                ? 'bg-cyan-500 text-black shadow-[0_0_15px_rgba(6,182,212,0.4)] dark:bg-cyan-500 dark:text-black light:bg-cyan-600 light:text-white'
                : 'text-neutral-400 hover:text-white dark:text-neutral-400 dark:hover:text-white light:text-slate-600 light:hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Field Assessment</span>
          </button>
        </div>
      </div>

      {/* ========================================================
          TAB 1: COMPANION CHAT & GUIDANCE
         ======================================================== */}
      {activeTab === 'chat' && (
        <div className="flex-1 flex flex-col justify-between overflow-hidden p-3.5 sm:p-4">
          {/* Scrollable Conversation Stream */}
          <div ref={messagesContainerRef} className="flex-1 overflow-y-auto space-y-3.5 pr-1">
            {/* Show Welcome & Suggested Inquiries only before conversation starts */}
            {messages.length <= 1 && (
              <>
                <div className="p-4 rounded-2xl bg-[#0e1d2f]/90 dark:bg-[#0e1d2f]/90 light:bg-cyan-50/80 border border-cyan-500/30 dark:border-cyan-500/30 light:border-cyan-200/80 text-xs leading-relaxed text-cyan-100/90 dark:text-cyan-100/90 light:text-slate-800 shadow-inner">
                  <p>
                    Welcome! I am your <strong className="text-cyan-300 dark:text-cyan-300 light:text-cyan-800">SeaTrace Acoustic AI Companion Guide</strong>. 
                    Across our marine survey sectors, we monitor <strong className="text-white dark:text-white light:text-slate-900">358 verified ghost net clusters</strong> with <strong className="text-cyan-400 dark:text-cyan-400 light:text-cyan-700">94.7% acoustic classification accuracy</strong>. 
                    Dual-frequency side-scan sonar (455/900 kHz) penetrates zero-visibility turbid waters, isolating synthetic net lattices from seabed rocks with 0% natural false positives.
                  </p>

                  {/* Stat Chips */}
                  <div className="grid grid-cols-3 gap-1.5 mt-3 pt-3 border-t border-cyan-500/20 dark:border-cyan-500/20 light:border-cyan-200">
                    <div className="p-1.5 rounded-xl bg-cyan-950/40 dark:bg-cyan-950/40 light:bg-white text-center border border-cyan-500/20">
                      <div className="text-[9px] font-mono text-cyan-400/80 dark:text-cyan-400/80 light:text-cyan-700 font-bold uppercase">CLUSTERS</div>
                      <div className="text-xs font-black font-mono text-white dark:text-white light:text-slate-900">358 Net Sites</div>
                    </div>
                    <div className="p-1.5 rounded-xl bg-cyan-950/40 dark:bg-cyan-950/40 light:bg-white text-center border border-cyan-500/20">
                      <div className="text-[9px] font-mono text-cyan-400/80 dark:text-cyan-400/80 light:text-cyan-700 font-bold uppercase">PRECISION</div>
                      <div className="text-xs font-black font-mono text-cyan-300 dark:text-cyan-300 light:text-emerald-600">94.7% Conf</div>
                    </div>
                    <div className="p-1.5 rounded-xl bg-cyan-950/40 dark:bg-cyan-950/40 light:bg-white text-center border border-cyan-500/20">
                      <div className="text-[9px] font-mono text-cyan-400/80 dark:text-cyan-400/80 light:text-cyan-700 font-bold uppercase">FALSE POS</div>
                      <div className="text-xs font-black font-mono text-white dark:text-white light:text-slate-900">0.0% Reef FP</div>
                    </div>
                  </div>
                </div>

                {/* Quick Question Prompts */}
                <div className="space-y-1.5 pt-1">
                  <div className="text-[10px] font-mono text-cyan-400/80 dark:text-cyan-400/80 light:text-cyan-700 font-bold uppercase tracking-wider px-1">
                    Suggested Inquiries:
                  </div>
                  {suggestedPrompts.slice(0, 4).map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => handleSend(prompt)}
                      className="w-full text-left p-2.5 rounded-xl bg-white/5 dark:bg-white/5 light:bg-slate-100 hover:bg-cyan-500/10 dark:hover:bg-cyan-500/10 light:hover:bg-cyan-100/70 border border-white/10 dark:border-white/10 light:border-slate-200 hover:border-cyan-400/40 dark:hover:border-cyan-400/40 light:hover:border-cyan-400 transition-all cursor-pointer flex items-center gap-2 text-xs text-neutral-300 dark:text-neutral-300 light:text-slate-800 group"
                    >
                      <span className="text-cyan-400 group-hover:scale-110 transition-transform">💬</span>
                      <span className="truncate flex-1 font-medium">{prompt}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-neutral-500 group-hover:text-cyan-400 transition-colors shrink-0" />
                    </button>
                  ))}
                </div>
              </>
            )}

            {/* Message Thread (User and Bot Replies) */}
            {messages.slice(1).map((msg, idx) => {
              const isLatestTurn = msg.sender === 'user' && idx >= messages.length - 3;
              return (
                <div
                  key={msg.id}
                  data-latest-turn={isLatestTurn ? 'true' : undefined}
                  className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                {msg.sender === 'bot' && (
                  <div className="w-7 h-7 rounded-xl bg-[#082035] border border-cyan-400/40 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}

                <div
                  className={`max-w-[86%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-cyan-500 text-black font-medium rounded-tr-none shadow-[0_0_15px_rgba(6,182,212,0.25)] dark:bg-cyan-500 dark:text-black light:bg-cyan-600 light:text-white'
                      : 'bg-[#0b1728]/95 dark:bg-[#0b1728]/95 light:bg-slate-100 border border-cyan-500/25 dark:border-cyan-500/25 light:border-slate-200 text-neutral-100 dark:text-neutral-100 light:text-slate-800 rounded-tl-none font-normal shadow-md'
                  }`}
                >
                  {renderFormattedText(msg.text)}

                  {msg.suggestedQuestions && msg.suggestedQuestions.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-cyan-500/15 flex flex-wrap gap-1.5">
                      {msg.suggestedQuestions.map((sq) => (
                        <button
                          key={sq}
                          onClick={() => handleSend(sq)}
                          className="text-[11px] font-sans font-medium px-2.5 py-1 rounded-full bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/25 hover:border-cyan-400/70 text-cyan-300 transition-all cursor-pointer shadow-sm text-left flex items-center gap-1 active:scale-95"
                        >
                          <span>{sq}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Optional Action Button */}
                  {msg.action && (
                    <div className="mt-2 pt-1.5 border-t border-cyan-500/15">
                      <button
                        onClick={() => {
                          if (msg.action?.openAssessment) {
                            setActiveTab('assessment');
                          } else if (msg.action?.triggerUpload && onOpenUpload) {
                            onClose();
                            onOpenUpload();
                          } else if (msg.action?.sectionId && onNavigateSection) {
                            onClose();
                            onNavigateSection(msg.action.sectionId);
                          }
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-400/40 text-cyan-300 font-sans text-[11px] font-semibold hover:bg-cyan-500 hover:text-black transition-all cursor-pointer shadow-sm"
                      >
                        <span>{msg.action.label}</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  )}

                  <span className={`block text-[9px] font-mono mt-1 text-right ${
                    msg.sender === 'user' 
                      ? 'text-black/60 dark:text-black/60 light:text-white/80' 
                      : 'text-cyan-400/60 dark:text-cyan-400/60 light:text-slate-500'
                  }`}>
                    {msg.timestamp}
                  </span>
                </div>

                {msg.sender === 'user' && (
                  <div className="w-7 h-7 rounded-xl bg-neutral-800 dark:bg-white/10 light:bg-cyan-100 border border-neutral-700 dark:border-white/20 light:border-cyan-300 flex items-center justify-center text-white dark:text-white light:text-cyan-800 shrink-0 mt-0.5">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            );
          })}

            {isTyping && (
              <div className="flex gap-2.5 justify-start">
                <div className="w-7 h-7 rounded-xl bg-[#082035] border border-cyan-400/40 flex items-center justify-center text-cyan-400 shrink-0">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div className="bg-[#0f1f33]/90 dark:bg-[#0f1f33]/90 light:bg-slate-100 border border-cyan-500/25 dark:border-cyan-500/25 light:border-slate-200 px-3.5 py-2 rounded-2xl rounded-tl-none flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Pill Input Bar Matching Reference Image */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="relative mt-2 flex items-center shrink-0"
          >
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Ask me anything about SeaTrace sonar..."
              className="w-full pl-4 pr-11 py-2.5 rounded-full bg-[#0a1525] dark:bg-[#0a1525] light:bg-slate-50 border border-cyan-500/30 dark:border-cyan-500/30 light:border-slate-300 focus:border-cyan-400 dark:focus:border-cyan-400 light:focus:border-cyan-500 text-xs text-white dark:text-white light:text-slate-900 placeholder-neutral-400 dark:placeholder-neutral-500 light:placeholder-slate-400 outline-none transition-all shadow-inner"
            />
            <button
              type="submit"
              disabled={!inputQuery.trim()}
              className="absolute right-1 p-2 rounded-full bg-cyan-500 dark:bg-cyan-500 light:bg-cyan-600 text-black dark:text-black light:text-white disabled:opacity-30 hover:scale-105 transition-all cursor-pointer shadow-[0_0_10px_rgba(6,182,212,0.4)]"
              title="Send Message"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}

      {/* ========================================================
          TAB 2: PERSONAL HYDROGRAPHIC FIELD ASSESSMENT
         ======================================================== */}
      {activeTab === 'assessment' && (
        <div className="flex-1 p-3.5 sm:p-4 overflow-y-auto space-y-3.5">
          <div className="p-3 rounded-2xl bg-cyan-950/20 dark:bg-cyan-950/20 light:bg-cyan-50 border border-cyan-500/20">
            <div className="text-[10px] font-mono text-cyan-400 dark:text-cyan-400 light:text-cyan-700 font-bold uppercase tracking-widest">
              SURVEY RISK EVALUATOR
            </div>
            <h4 className="text-sm font-bold text-white dark:text-white light:text-slate-900 uppercase tracking-tight mt-0.5">
              Field Acoustic Assessment
            </h4>
            <p className="text-[11px] text-neutral-300 dark:text-neutral-300 light:text-slate-600 font-light mt-1 leading-relaxed">
              Configure parameters to estimate ghost net risk and salvage protocols.
            </p>
          </div>

          {/* 4 Parameter Selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Depth */}
            <div className="p-2.5 rounded-xl border border-white/10 dark:border-white/10 light:border-slate-200 bg-black/40 dark:bg-black/40 light:bg-white">
              <label className="text-[9px] font-mono text-neutral-400 dark:text-neutral-400 light:text-slate-500 uppercase tracking-wider block mb-1.5 font-bold">
                1. WATER DEPTH
              </label>
              <div className="grid grid-cols-3 gap-1">
                {(['shallow', 'shelf', 'deep'] as const).map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setAssessment({ ...assessment, depth: d })}
                    className={`py-1 px-1 rounded-lg text-[10px] font-mono uppercase transition-all cursor-pointer ${
                      assessment.depth === d
                        ? 'bg-cyan-500 text-black font-bold shadow-sm'
                        : 'bg-white/5 border border-white/10 text-neutral-400 hover:text-white'
                    }`}
                  >
                    {d === 'shallow' ? '<20m' : d === 'shelf' ? '20-60m' : '>60m'}
                  </button>
                ))}
              </div>
            </div>

            {/* Acoustic Shadow */}
            <div className="p-2.5 rounded-xl border border-white/10 dark:border-white/10 light:border-slate-200 bg-black/40 dark:bg-black/40 light:bg-white">
              <label className="text-[9px] font-mono text-neutral-400 dark:text-neutral-400 light:text-slate-500 uppercase tracking-wider block mb-1.5 font-bold">
                2. SHADOW PROFILE
              </label>
              <div className="grid grid-cols-3 gap-1">
                {(['hard', 'diffuse', 'minimal'] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setAssessment({ ...assessment, shadow: s })}
                    className={`py-1 px-1 rounded-lg text-[10px] font-mono uppercase transition-all cursor-pointer ${
                      assessment.shadow === s
                        ? 'bg-cyan-500 text-black font-bold shadow-sm'
                        : 'bg-white/5 border border-white/10 text-neutral-400 hover:text-white'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Gear Class */}
            <div className="p-2.5 rounded-xl border border-white/10 dark:border-white/10 light:border-slate-200 bg-black/40 dark:bg-black/40 light:bg-white">
              <label className="text-[9px] font-mono text-neutral-400 dark:text-neutral-400 light:text-slate-500 uppercase tracking-wider block mb-1.5 font-bold">
                3. GEAR TYPE
              </label>
              <select
                value={assessment.gear}
                onChange={(e) => setAssessment({ ...assessment, gear: e.target.value as any })}
                className="w-full py-1.5 px-2 rounded-lg bg-black dark:bg-black light:bg-slate-50 border border-white/15 dark:border-white/15 light:border-slate-300 text-[11px] font-mono text-white dark:text-white light:text-slate-900 outline-none focus:border-cyan-400"
              >
                <option value="gillnet">Monofilament Gillnet</option>
                <option value="trawl">Heavy Trawl Webbing</option>
                <option value="longline">Longline / Trap Harness</option>
                <option value="trap">Collapsible Wire Pot</option>
              </select>
            </div>

            {/* Substrate */}
            <div className="p-2.5 rounded-xl border border-white/10 dark:border-white/10 light:border-slate-200 bg-black/40 dark:bg-black/40 light:bg-white">
              <label className="text-[9px] font-mono text-neutral-400 dark:text-neutral-400 light:text-slate-500 uppercase tracking-wider block mb-1.5 font-bold">
                4. SEAFLOOR SUBSTRATE
              </label>
              <select
                value={assessment.substrate}
                onChange={(e) => setAssessment({ ...assessment, substrate: e.target.value as any })}
                className="w-full py-1.5 px-2 rounded-lg bg-black dark:bg-black light:bg-slate-50 border border-white/15 dark:border-white/15 light:border-slate-300 text-[11px] font-mono text-white dark:text-white light:text-slate-900 outline-none focus:border-cyan-400"
              >
                <option value="coral">Rocky Reef / Living Coral</option>
                <option value="sand">Smooth Sand / Silt</option>
                <option value="rock">Gravel & Boulders</option>
              </select>
            </div>
          </div>

          {/* Calculate Button */}
          <button
            onClick={runAssessmentCalculation}
            className="w-full py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs uppercase tracking-wider transition-all duration-200 shadow-[0_0_15px_rgba(6,182,212,0.3)] cursor-pointer flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Calculate Risk Index</span>
          </button>

          {/* Assessment Scorecard Output */}
          {assessmentResult && (
            <div className="p-3.5 rounded-2xl border border-cyan-500/40 bg-[#0c192c]/90 dark:bg-[#0c192c]/90 light:bg-slate-50 space-y-2.5 animate-in fade-in slide-in-from-bottom-2">
              <div className="flex items-center justify-between pb-2 border-b border-cyan-500/20">
                <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> ASSESSMENT COMPLETE
                </span>
                <span className="text-[11px] font-mono font-bold text-cyan-300">
                  {assessmentResult.urgency}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 rounded-xl bg-black/40 border border-white/10">
                  <div className="text-[9px] font-mono text-neutral-400 uppercase font-bold">THREAT INDEX</div>
                  <div className="text-xl font-black font-mono text-rose-400 mt-0.5">
                    {assessmentResult.threatIndex}/100
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-black/40 border border-white/10">
                  <div className="text-[9px] font-mono text-neutral-400 uppercase font-bold">CONFIDENCE</div>
                  <div className="text-xl font-black font-mono text-cyan-400 mt-0.5">
                    {assessmentResult.confidence}%
                  </div>
                </div>
              </div>

              <div className="p-2 rounded-xl bg-cyan-950/40 border border-cyan-500/20 text-xs font-mono text-neutral-200 flex items-center gap-2">
                <Anchor className="w-4 h-4 text-cyan-400 shrink-0" />
                <span className="truncate">{assessmentResult.method}</span>
              </div>

              <p className="text-[11px] text-neutral-300 dark:text-neutral-300 light:text-slate-700 font-light leading-relaxed">
                {assessmentResult.rationale}
              </p>

              <div className="pt-1 flex gap-2">
                <button
                  onClick={() => {
                    onClose();
                    onNavigateSection?.('technology');
                  }}
                  className="flex-1 py-1.5 rounded-full border border-cyan-500/40 hover:bg-cyan-500/20 text-xs font-mono text-cyan-300 text-center transition-colors cursor-pointer"
                >
                  View Sonar Analysis →
                </button>
                <button
                  onClick={() => setAssessmentResult(null)}
                  className="px-3 py-1.5 rounded-full bg-white/5 text-xs font-mono text-neutral-400 hover:text-white cursor-pointer"
                >
                  Reset
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          BOTTOM STEP NAVIGATION FOOTER (Matching Reference Layout)
         ======================================================== */}
      <div className="px-4 py-2 border-t border-cyan-500/20 dark:border-cyan-500/20 light:border-slate-200 bg-[#070e1b]/95 dark:bg-[#070e1b]/95 light:bg-slate-50/95 flex items-center justify-between shrink-0">
        <div className="text-xs font-mono text-neutral-400 dark:text-neutral-400 light:text-slate-600">
          <span className="text-cyan-400 font-bold">Step {currentStep} of {steps.length}</span>
          <span className="hidden xs:inline"> · {currentStepData.title}</span>
        </div>

        <button
          onClick={currentStepData.onNext}
          className="px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs font-mono flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 shadow-[0_0_12px_rgba(6,182,212,0.3)] cursor-pointer"
        >
          <span>{currentStepData.nextLabel}</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

export default AIAssistantModal;
