import React, { useState, useEffect, useRef, useCallback } from 'react';
// SEATRACE · AI-Powered Ghost Net Sonar Intelligence
import { Navbar } from './components/ghostnet/Navbar';
import { HeroSection } from './components/ghostnet/HeroSection';
import { BeginnerEducationSection } from './components/ghostnet/BeginnerEducationSection';
import { ProblemSection } from './components/ghostnet/ProblemSection';
import { WorkflowSection } from './components/ghostnet/WorkflowSection';
import { SonarAnalysisViewer } from './components/ghostnet/SonarAnalysisViewer';
import { GlobalOceanMap } from './components/ghostnet/GlobalOceanMap';
import { ImpactSection } from './components/ghostnet/ImpactSection';
import { AboutSection } from './components/ghostnet/AboutSection';
import { TechnologySection } from './components/ghostnet/TechnologySection';
import { Footer } from './components/ghostnet/Footer';
import { UploadModal } from './components/ghostnet/UploadModal';
import { AIAssistantModal } from './components/ghostnet/AIAssistantModal';
import { AppEntranceDive } from './components/ghostnet/AppEntranceDive';
import { AcousticTransectReel } from './components/ghostnet/AcousticTransectReel';
import { InteractiveSonarRipple } from './components/ghostnet/InteractiveSonarRipple';

// Tactical Sonar Console Components
import { Header } from './components/Header';
import { TelemetryBar } from './components/TelemetryBar';
import { SonarCanvas, SonarCanvasHandle } from './components/SonarCanvas';
import { ExplainableAIPanel } from './components/ExplainableAIPanel';
import { PipelineTimeline } from './components/PipelineTimeline';
import { DetectionsTable } from './components/DetectionsTable';
import { LimitationsModal } from './components/LimitationsModal';
import { ReportModal } from './components/ReportModal';
import { SampleLibrary } from './components/SampleLibrary';
import { AuvMissionHud } from './components/AuvMissionHud';
import { ShortcutsModal } from './components/ShortcutsModal';

// Types & Services
import { AnalysisResult, Detection, GroundTruthMetadata, SampleItem, Statistics } from './types/sonar';
import { SAMPLE_DATASETS, MOCK_HISTORY } from './services/mockEngine';
import { analyzeSonarImage, checkBackendHealth, fetchStatistics } from './services/api';
import { ArrowLeft, Radio, Compass, Loader2, Bot } from 'lucide-react';

export function App() {
  // Theme state: 'dark' | 'light' (Default to 'dark' for cinematic black aesthetic)
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const params = new URLSearchParams(window.location.search);
    const themeParam = params.get('theme') as 'dark' | 'light' | null;
    if (themeParam === 'light' || themeParam === 'dark') return themeParam;
    return (localStorage.getItem('ghostnet_theme') as 'dark' | 'light') || 'dark';
  });

  // View mode: 'ghostnet' (main editorial/3D experience) | 'console' (hydrographic workbench)
  const [currentView, setCurrentView] = useState<'ghostnet' | 'console'>(() => {
    const params = new URLSearchParams(window.location.search);
    const viewParam = params.get('view') as 'ghostnet' | 'console' | null;
    if (viewParam === 'ghostnet' || viewParam === 'console') return viewParam;
    return 'ghostnet';
  });

  // Sonar analysis state for tactical console & models
  const [activeSample, setActiveSample] = useState<SampleItem>(SAMPLE_DATASETS[0]);
  const [currentImageSrc, setCurrentImageSrc] = useState<string>(SAMPLE_DATASETS[0].imagePath);
  const [groundTruth, setGroundTruth] = useState<GroundTruthMetadata | null>(null);
  const [showGroundTruth, setShowGroundTruth] = useState<boolean>(true);

  const [analysis, setAnalysis] = useState<AnalysisResult | null>(MOCK_HISTORY[0]);
  const [selectedDetection, setSelectedDetection] = useState<Detection | null>(MOCK_HISTORY[0].detections[0]);
  const [statistics, setStatistics] = useState<Statistics>({
    totalImages: 358,
    totalDetections: 12,
    highRiskCount: 4,
    naturalFeaturesFiltered: 84,
    averageConfidence: 94.7,
  });

  const [isBackendLive, setIsBackendLive] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isAuvSweeping, setIsAuvSweeping] = useState<boolean>(false);

  // Modals
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  const [isAssistantOpen, setIsAssistantOpen] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('assistant') === 'open';
    }
    return false;
  });
  const [assistantInitialQuery, setAssistantInitialQuery] = useState<string>('');
  const [isLimitationsOpen, setIsLimitationsOpen] = useState<boolean>(false);
  const [isReportOpen, setIsReportOpen] = useState<boolean>(false);
  const [isSamplesOpen, setIsSamplesOpen] = useState<boolean>(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState<boolean>(false);

  // Outside-to-Inside Entrance Animation State
  const [showEntranceDive, setShowEntranceDive] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('intro') === 'false') return false;
    }
    return true;
  });
  const [entranceTrigger, setEntranceTrigger] = useState<number>(1);

  const replayEntranceDive = useCallback(() => {
    setShowEntranceDive(true);
    setEntranceTrigger((prev) => prev + 1);
  }, []);

  const sonarCanvasRef = useRef<SonarCanvasHandle | null>(null);

  // Apply theme class to document body
  useEffect(() => {
    document.body.className = theme === 'dark' ? 'dark bg-black text-white' : 'light bg-[#f8fafc] text-[#09090b]';
    localStorage.setItem('ghostnet_theme', theme);
  }, [theme]);

  // Initial check & load
  useEffect(() => {
    async function init() {
      const live = await checkBackendHealth();
      setIsBackendLive(live);
      loadSample(SAMPLE_DATASETS[0], false);

      const params = new URLSearchParams(window.location.search);
      const urlTheme = params.get('theme');
      if (urlTheme === 'light' || urlTheme === 'dark') {
        setTheme(urlTheme);
      }
    }
    init();
  }, []);

  // Keyboard shortcuts listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

      if (e.key === '?') {
        setIsShortcutsOpen((prev) => !prev);
      } else if (e.code === 'Space') {
        e.preventDefault();
        setIsAuvSweeping((prev) => !prev);
      } else if (e.key.toLowerCase() === 'p') {
        sonarCanvasRef.current?.cycleTheme();
      } else if (e.key.toLowerCase() === 'f') {
        sonarCanvasRef.current?.fitToScreen();
      } else if (e.key.toLowerCase() === 'g') {
        setShowGroundTruth((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Load sample transect
  const loadSample = async (sample: SampleItem, switchView: boolean = true) => {
    if (switchView) {
      setIsLoading(true);
      setCurrentView('console');
    }
    setActiveSample(sample);
    setCurrentImageSrc(sample.imagePath);

    let currentMeta: GroundTruthMetadata | null = null;
    try {
      if (sample.metadataPath) {
        const res = await fetch(sample.metadataPath);
        if (res.ok) {
          currentMeta = await res.json();
          setGroundTruth(currentMeta);
        }
      }
    } catch {
      // Keep existing
    }

    try {
      const { result } = await analyzeSonarImage(sample, currentMeta || undefined);
      setAnalysis(result);
      if (result.detections.length > 0) {
        setSelectedDetection(result.detections[0]);
      } else {
        setSelectedDetection(null);
      }
    } catch {
      const mockRes = MOCK_HISTORY[0];
      setAnalysis(mockRes);
      setSelectedDetection(mockRes.detections[0]);
    } finally {
      if (switchView) {
        setIsLoading(false);
      }
    }
  };

  // Upload file handler
  const handleUploadFile = (file: File) => {
    setIsLoading(true);
    const objectUrl = URL.createObjectURL(file);
    setCurrentImageSrc(objectUrl);
    // Switch to Tactical Console immediately
    setCurrentView('console');

    const newSample: SampleItem = {
      id: `custom_${Date.now()}`,
      name: file.name,
      title: file.name,
      description: 'User uploaded sonar file',
      imagePath: objectUrl,
      metadataPath: '',
      expectedTargets: 1,
    };
    setActiveSample(newSample);

    analyzeSonarImage(file)
      .then(({ result }) => {
        setAnalysis(result);
        if (result.detections.length > 0) {
          setSelectedDetection(result.detections[0]);
        }
      })
      .catch(() => {
        const mockRes = MOCK_HISTORY[0];
        setAnalysis(mockRes);
        setSelectedDetection(mockRes.detections[0]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handleFocusTarget = (detection: Detection) => {
    setSelectedDetection(detection);
    const cx = detection.bbox.cx ?? (detection.bbox.x1 + detection.bbox.x2) / 2;
    const cy = detection.bbox.cy ?? (detection.bbox.y1 + detection.bbox.y2) / 2;
    sonarCanvasRef.current?.centerOn(cx, cy, 2.5);
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans ${theme === 'dark' ? 'bg-black text-white' : 'bg-[#f8fafc] text-neutral-900'}`}>
      {/* Interactive Global Click Acoustic Sonar Ripple */}
      <InteractiveSonarRipple />

      {/* Outside-to-Inside Entrance Dive Animation */}
      {showEntranceDive && (
        <AppEntranceDive
          onComplete={() => setShowEntranceDive(false)}
          theme={theme}
        />
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center">
          <div className="flex flex-col items-center gap-4 p-8 rounded-2xl bg-neutral-950 border border-white/15">
            <Loader2 className="w-8 h-8 text-[#00ff88] animate-spin" />
            <p className="font-mono text-xs text-neutral-300 uppercase tracking-widest">
              ACOUSTIC BEAM DECONVOLUTION IN PROGRESS...
            </p>
          </div>
        </div>
      )}

      {/* ========================================================
          VIEW 1: SEATRACE EDITORIAL & 3D EXPERIENCE
         ======================================================== */}
      {currentView === 'ghostnet' && (
        <>
          {/* Fixed Minimal Navigation */}
          <Navbar
            theme={theme}
            onToggleTheme={toggleTheme}
            onOpenUpload={() => setIsUploadModalOpen(true)}
            onSwitchToConsole={() => setCurrentView('console')}
            onOpenAssistant={() => {
              setAssistantInitialQuery('');
              setIsAssistantOpen(true);
            }}
            onOpenDatasets={() => setIsSamplesOpen(true)}
            onSelectSample={loadSample}
          />

          <main className="flex-1 w-full overflow-x-hidden">
            {/* 3. Hero Section with 3D Earth Globe */}
            <HeroSection
              theme={theme}
              onOpenUpload={() => setIsUploadModalOpen(true)}
              onSwitchToConsole={() => setCurrentView('console')}
              onReplayDive={replayEntranceDive}
              entranceTrigger={entranceTrigger}
              onOpenAssistant={() => {
                setAssistantInitialQuery('');
                setIsAssistantOpen(true);
              }}
            />

            {/* Live Acoustic Transect Sonar Stream Reel */}
            <AcousticTransectReel
              theme={theme}
              onInspectTarget={() => {
                const mapEl = document.getElementById('map');
                mapEl?.scrollIntoView({ behavior: 'smooth' });
              }}
            />

            {/* Beginner Education: Ghost Nets 101, Interactive Vision Slider & Mini-Game */}
            <BeginnerEducationSection theme={theme} />

            {/* 4. Problem Section: "THE OCEAN REMEMBERS WHAT WE LOSE." */}
            <ProblemSection />

            {/* 5. How It Works: "FROM SONAR TO DISCOVERY." */}
            <WorkflowSection />

            {/* 6 & 7. Sonar AI Analysis & Inspector: "TEACHING MACHINES TO SEE UNDERWATER." */}
            <SonarAnalysisViewer
              onViewOnMap={(lat, lon) => {
                const mapEl = document.getElementById('map');
                mapEl?.scrollIntoView({ behavior: 'smooth' });
              }}
              onOpenAssistantWithTarget={(query) => {
                setAssistantInitialQuery(query);
                setIsAssistantOpen(true);
              }}
            />

            {/* 8. Global Ocean Map: "WHERE THE OCEAN NEEDS US." */}
            <GlobalOceanMap />

            {/* 9. Impact Section: "EVERY DETECTION CAN BECOME A RECOVERY." */}
            <ImpactSection />

            {/* 13. About Section: "WE ARE ALL IN THIS TOGETHER." */}
            <AboutSection />

            {/* 14. Technology Architecture Pipeline */}
            <TechnologySection />
          </main>

          {/* 15. Minimal Black Footer */}
          <Footer />

          {/* 10, 11, 12. Upload Sonar Modal & AI Processing Flow */}
          <UploadModal
            isOpen={isUploadModalOpen}
            onClose={() => setIsUploadModalOpen(false)}
            onViewOnMap={() => {
              setIsUploadModalOpen(false);
              const mapEl = document.getElementById('map');
              mapEl?.scrollIntoView({ behavior: 'smooth' });
            }}
          />
        </>
      )}

      {/* ========================================================
          VIEW 2: TACTICAL HYDROGRAPHIC CONSOLE WORKBENCH
         ======================================================== */}
      {currentView === 'console' && (
        <div className="flex-1 flex flex-col p-4 md:p-6 lg:p-8 space-y-4 w-full max-w-[1720px] 2xl:max-w-[1880px] mx-auto animate-entrance-zoom">
          {/* Tactical Header with Switch Back to SeaTrace */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-neutral-950 border border-white/10 dark:bg-neutral-950 dark:border-white/10 light:bg-white light:border-slate-200 light:shadow-sm transition-colors">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCurrentView('ghostnet')}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-white hover:bg-[#00ff88] text-black text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer dark:bg-white dark:text-black dark:hover:bg-[#00ff88] light:bg-slate-900 light:text-white light:hover:bg-emerald-600"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Return to SeaTrace Portal</span>
              </button>

              <div className="h-4 w-px bg-white/10 dark:bg-white/10 light:bg-slate-200 hidden sm:block" />

              <div className="flex items-center gap-2 text-xs font-mono text-neutral-400 dark:text-neutral-400 light:text-slate-600">
                <Radio className="w-3.5 h-3.5 text-[#00ff88] dark:text-[#00ff88] light:text-emerald-600" />
                <span className="text-white dark:text-white light:text-slate-900 font-bold">TACTICAL HYDROGRAPHIC WORKBENCH</span>
              </div>
            </div>

            <Header
              isDark={theme === 'dark'}
              onToggleTheme={toggleTheme}
              isBackendLive={isBackendLive}
              onOpenLimitations={() => setIsLimitationsOpen(true)}
              onOpenReport={() => setIsReportOpen(true)}
              onOpenSamples={() => setIsSamplesOpen(true)}
              onOpenShortcuts={() => setIsShortcutsOpen(true)}
              currentView="console"
              onSelectView={(v) => {
                if (v === 'portal') setCurrentView('ghostnet');
              }}
            />
          </div>

          {/* Telemetry Stats Bar */}
          <TelemetryBar
            stats={statistics}
            currentFilename={analysis?.sourceImage || activeSample.name}
            filteredOutCurrent={analysis?.filteredOut || 9}
          />

          {/* AUV Mission Telemetry & Cruise Control */}
          <AuvMissionHud
            isStreaming={isAuvSweeping}
            onToggleStream={() => setIsAuvSweeping((prev) => !prev)}
            headingDeg={42}
            speedKnots={3.2}
            altitudeM={3.5}
            depthM={48.2}
            pingRateHz={15}
          />

          {/* Interactive Workspace Split */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
            {/* Sonar Canvas & Pipeline (Left 8 Cols) */}
            <div className="lg:col-span-8 flex flex-col space-y-4">
              <div className="h-[580px] xl:h-[640px]">
                <SonarCanvas
                  ref={sonarCanvasRef}
                  imageSrc={currentImageSrc}
                  detections={analysis?.detections || []}
                  groundTruthTargets={groundTruth?.targets || []}
                  selectedDetection={selectedDetection}
                  onSelectDetection={(det) => setSelectedDetection(det)}
                  showGroundTruth={showGroundTruth}
                  onToggleGroundTruth={setShowGroundTruth}
                  isAuvSweeping={isAuvSweeping}
                />
              </div>

              {/* Pipeline Execution Timeline */}
              <PipelineTimeline stages={analysis?.stages || []} />
            </div>

            {/* Explainable AI 5-Signature Inspector (Right 4 Cols) */}
            <div className="lg:col-span-4 h-full min-h-[580px] xl:min-h-[640px]">
              <ExplainableAIPanel detection={selectedDetection} />
            </div>
          </div>

          {/* Confirmed Debris Inventory Table */}
          <DetectionsTable
            detections={analysis?.detections || []}
            selectedDetection={selectedDetection}
            onSelectDetection={(det) => setSelectedDetection(det)}
            onFocusDetection={handleFocusTarget}
          />
        </div>
      )}

      {/* Modals for Tactical Console */}
      <LimitationsModal
        isOpen={isLimitationsOpen}
        onClose={() => setIsLimitationsOpen(false)}
      />

      <ReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        analysis={analysis}
      />

      <SampleLibrary
        isOpen={isSamplesOpen}
        onClose={() => setIsSamplesOpen(false)}
        activeSampleId={activeSample.id}
        onSelectSample={loadSample}
        onUploadFile={handleUploadFile}
      />

      <ShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />

      {/* Floating AI Assistant Trigger Widget (Bottom-Right) */}
      <div className={`fixed bottom-6 right-6 z-40 transition-all duration-300 ${isAssistantOpen ? 'opacity-0 pointer-events-none translate-y-4' : 'opacity-100 translate-y-0'}`}>
        <button
          onClick={() => {
            setAssistantInitialQuery('');
            setIsAssistantOpen(true);
          }}
          className="relative group flex items-center gap-2.5 px-4 py-3 rounded-full bg-black/90 dark:bg-black/90 light:bg-white/95 border border-[#00ff88]/60 dark:border-[#00ff88]/60 light:border-emerald-400 text-white dark:text-white light:text-slate-900 shadow-[0_0_25px_rgba(0,255,136,0.3)] dark:shadow-[0_0_25px_rgba(0,255,136,0.3)] light:shadow-lg hover:shadow-[0_0_35px_rgba(0,255,136,0.5)] hover:border-[#00ff88] transition-all duration-300 hover:scale-105 cursor-pointer backdrop-blur-md"
          aria-label="Open Marine AI Assistant"
        >
          <span className="absolute -inset-1 rounded-full border border-[#00ff88] animate-ping opacity-30 pointer-events-none" />
          <div className="w-7 h-7 rounded-full bg-[#00ff88]/20 border border-[#00ff88]/40 flex items-center justify-center text-[#00ff88] dark:text-[#00ff88] light:text-emerald-700">
            <Bot className="w-4 h-4" />
          </div>
          <div className="hidden sm:flex flex-col text-left pr-1">
            <span className="text-[10px] font-mono tracking-wider font-bold text-[#00ff88] dark:text-[#00ff88] light:text-emerald-700 uppercase">
              AI ASSISTANT
            </span>
            <span className="text-[9px] font-mono text-neutral-400 dark:text-neutral-400 light:text-slate-600 font-medium">
              Personal Assessment
            </span>
          </div>
        </button>
      </div>

      {/* Global AI Assistant & Personal Assessment Modal */}
      <AIAssistantModal
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
        initialQuery={assistantInitialQuery}
        activeResult={analysis}
        selectedDetection={selectedDetection}
        statistics={statistics}
        isAuvSweeping={isAuvSweeping}
        activeSample={activeSample}
        onSelectDetection={setSelectedDetection}
        onOpenUpload={() => setIsUploadModalOpen(true)}
        onOpenSamples={() => setIsSamplesOpen(true)}
        onNavigateSection={(secId) => {
          const el = document.getElementById(secId);
          el?.scrollIntoView({ behavior: 'smooth' });
        }}
      />
    </div>
  );
}

export default App;
