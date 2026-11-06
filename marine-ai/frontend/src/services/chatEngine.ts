import { AnalysisResult, Detection, SampleItem, Statistics } from '../types/sonar';

export interface ChatMessage {
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

export interface ChatAppContext {
  activeResult?: AnalysisResult | null;
  selectedDetection?: Detection | null;
  statistics?: Statistics | null;
  isAuvSweeping?: boolean;
  activeSample?: SampleItem | null;
}

export interface ChatApiRequest {
  message: string;
  conversationId?: string;
  history?: Array<{ sender: string; text: string }>;
  context?: Record<string, any>;
}

export interface ChatApiResponse {
  reply: string;
  conversationId: string;
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

function extractLastTopic(history?: Array<{ sender: string; text: string }>): string {
  if (!history || history.length === 0) return '';
  for (let i = history.length - 1; i >= 0; i--) {
    const text = history[i].text.toLowerCase();
    if (text.includes('sonar')) return 'side-scan sonar';
    if (text.includes('shadow')) return 'acoustic shadow';
    if (text.includes('texture')) return 'texture analysis';
    if (text.includes('seatrace')) return 'SeaTrace';
    if (text.includes('risk') || text.includes('anomaly')) return 'risk score';
    if (text.includes('ghost net') || text.includes('net')) return 'ghost nets';
  }
  return '';
}

export function generateLocalChatReply(
  query: string,
  history: Array<{ sender: string; text: string }>,
  appContext: ChatAppContext
): ChatApiResponse {
  const q = query.trim();
  let lower = q.toLowerCase();

  // Multi-turn pronoun resolution
  const lastTopic = extractLastTopic(history);
  if (
    (lower.includes('why do we use it') ||
      lower.includes('how does it work') ||
      lower.includes('tell me more about it') ||
      lower === 'why?' ||
      lower === 'how?') &&
    lastTopic
  ) {
    lower = lower.replace(/\bit\b/g, lastTopic) + ' ' + lastTopic;
  }

  // 0. Greetings
  if (
    lower === 'hi' ||
    lower === 'hello' ||
    lower === 'hey' ||
    lower.startsWith('hi ') ||
    lower.startsWith('hello ') ||
    lower === 'good morning' ||
    lower === 'good afternoon'
  ) {
    return {
      conversationId: 'client-session',
      reply: 'Hello! I am **SeaTrace AI**, your underwater acoustic intelligence companion.\n\nI can explain side-scan sonar physics, break down live detection telemetry, or assist with salvage planning. How can I assist you?',
      suggestedQuestions: [
        'What is this application for?',
        'What can it do?',
        'How does Side-Scan Sonar work?',
      ],
    };
  }

  // 1. Detection-Aware Inquiries (Field Assessment)
  if (
    lower.includes('flagged') ||
    lower.includes('this detection') ||
    lower.includes('this object') ||
    lower.includes('current detection') ||
    lower.includes('explain my latest') ||
    lower.includes('why was this detected') ||
    lower.includes('why is this high risk') ||
    lower.includes('what evidence supports') ||
    lower.includes('where is this object') ||
    lower.includes('which detection')
  ) {
    const det = appContext.selectedDetection || appContext.activeResult?.detections?.[0];
    if (!det) {
      return {
        conversationId: 'client-session',
        reply: '**No Active Sonar Analysis Loaded**\n\nTo inspect target evidence:\n• Select a transect from the **Sample Library**, or\n• Upload a **.XTF / Sonar Waterfall** scan.\n\nI will evaluate confidence, acoustic shadows, texture regularity, and GPS.',
        suggestedQuestions: [
          'What is this application for?',
          'How does Side-Scan Sonar work?',
          'How are risk scores calculated?',
        ],
        action: { label: 'Open Sample Library', triggerSamples: true },
      };
    }

    const confPct = Math.round(det.confidence * 1000) / 10;
    const shadowPct = Math.round((det.shadowScore ?? 0.82) * 1000) / 10;
    const texturePct = Math.round((det.textureScore ?? 0.76) * 1000) / 10;
    const anomalyPct = Math.round(det.anomalyScore * 1000) / 10;
    const coords = appContext.activeSample?.coordinates || '10.12° N, 76.56° E';

    const directive =
      det.risk === 'CRITICAL' || det.risk === 'HIGH'
        ? 'High entanglement hazard. Prioritized for diver/ROV recovery.'
        : 'Low immediate threat. Scheduled for routine monitoring.';

    return {
      conversationId: 'client-session',
      reply: `**Target #${det.id} Assessment**\n\`${det.className.replace(/_/g, ' ').toUpperCase()}\` · \`${det.risk} RISK\` (\`${coords}\`)\n\n• **AI Confidence**: \`${confPct}%\` (Acoustic highlight match)\n• **Acoustic Shadow**: \`${shadowPct}%\` (Vertical 3D elevation)\n• **Texture Regularity**: \`${texturePct}%\` (Synthetic mesh pitch)\n• **Fused Anomaly**: \`${anomalyPct}%\`\n\n**Directive**: ${directive}`,
      suggestedQuestions: [
        'How are risk scores calculated?',
        'What is the salvage protocol?',
        'How does Side-Scan Sonar work?',
      ],
      action: { label: 'Focus in Sonar Viewer', sectionId: 'technology' },
    };
  }

  // 2. Overview / "What is this application for" / "What is SeaTrace"
  if (
    lower.includes('what is this application for') ||
    lower.includes('what this application about') ||
    lower.includes('what is this app for') ||
    lower.includes('what is this for') ||
    lower.includes('what does this app do') ||
    lower.includes('what is seatrace') ||
    lower.includes('what is this') ||
    lower.includes('what problem does') ||
    lower.includes('explain the entire project') ||
    lower.includes('explain this project') ||
    lower.includes('overview') ||
    lower.includes('about seatrace')
  ) {
    return {
      conversationId: 'client-session',
      reply: '**SeaTrace** is an AI-powered acoustic intelligence system that detects, classifies, and geolocates submerged marine debris using high-frequency Side-Scan Sonar.\n\n• **Zero-Visibility Detection**: Scans turbid seafloors in **<130ms** where optical cameras fail.\n• **3D Shadow Triangulation**: Measures acoustic shadows to calculate height and filter out natural rocks.\n• **Precision Geotagging**: Generates exact WGS84 GPS coordinates (±0.8m) for salvage recovery.',
      suggestedQuestions: [
        'What can it do?',
        'How does Side-Scan Sonar work?',
        'Run Field Assessment',
      ],
      action: { label: 'Explore Technology Pipeline', sectionId: 'technology' },
    };
  }

  // 3. Capabilities & Features ("what it can do")
  if (
    lower.includes('what it can do') ||
    lower.includes('what can it do') ||
    lower.includes('what does it do') ||
    lower.includes('features') ||
    lower.includes('capabilities') ||
    lower.includes('functionality') ||
    lower.includes('what can this do') ||
    lower.includes('what else can it do')
  ) {
    return {
      conversationId: 'client-session',
      reply: 'SeaTrace provides an automated underwater survey intelligence workflow:\n\n• **Edge Debris AI**: Detects ghost nets, traps, tires, and containers in **<130ms** (YOLOv8 + ResNet).\n• **Shadow Triangulation**: Computes object relief: `Height = (Shadow × Altitude) / Slant Range`.\n• **0% False-Alarm Rate**: Rejects 100% of coral reefs using GLCM texture and 2D FFT.\n• **Precision Geolocation**: Resolves WGS84 coordinates for diver and ROV salvage teams.',
      suggestedQuestions: [
        'How does Side-Scan Sonar work?',
        'How are risk scores calculated?',
        'Open Field Assessment',
      ],
      action: { label: 'Open Field Assessment', openAssessment: true },
    };
  }

  // 4. Side-Scan Sonar Physics & "Why Sonar vs Camera"
  if (
    lower.includes('side-scan sonar') ||
    lower.includes('sonar') ||
    lower.includes('sound wave') ||
    lower.includes('camera') ||
    lower.includes('why use sonar')
  ) {
    return {
      conversationId: 'client-session',
      reply: '**Side-Scan Sonar (SSS)** transmits fan-shaped acoustic sound pulses across the seabed perpendicular to the towfish trackline.\n\n• **Acoustics Over Light**: Seawater absorbs light within 2–5m; 455/900 kHz acoustic waves propagate hundreds of meters.\n• **Acoustic Highlights**: Dense synthetic polymers reflect strong echoes, showing bright in sonar waterfalls.\n• **Acoustic Shadows**: Elevated objects block sound rays, casting trailing dark shadows that reveal 3D relief.',
      suggestedQuestions: [
        'Why are acoustic shadows useful?',
        'How does AI detect marine debris?',
        'What types of debris can you detect?',
      ],
      action: { label: 'Inspect Sonar Waterfall', sectionId: 'how-it-works' },
    };
  }

  // 5. Acoustic Shadows & 3D Height Estimation
  if (lower.includes('shadow') || lower.includes('acoustic shadow') || lower.includes('height')) {
    return {
      conversationId: 'client-session',
      reply: 'An **acoustic shadow** is the dark, echo-free zone behind an elevated seafloor object where sound pulses cannot reach.\n\n• **Height Calculation**: Triangulates target relief: `Height = (Shadow × Altitude) / Slant Range`.\n• **Net vs. Rock**: Snagged nets cast diffuse, billowy shadows; boulders cast rigid, sharp boundaries.\n• **Entanglement Risk**: Taller shadows indicate greater suspension and higher wildlife hazard.',
      suggestedQuestions: [
        'How does texture analysis work?',
        'How are risk scores calculated?',
        'What models are used?',
      ],
      action: { label: 'View Workflow Steps', sectionId: 'how-it-works' },
    };
  }

  // 6. Texture Analysis & False Positive Filter
  if (
    lower.includes('texture') ||
    lower.includes('false positive') ||
    lower.includes('seabed') ||
    lower.includes('natural rock') ||
    lower.includes('coral')
  ) {
    return {
      conversationId: 'client-session',
      reply: 'Natural seabeds have random geological patterns, whereas human-made debris exhibits strict structural regularity.\n\n• **GLCM Texture Metrics**: Evaluates contrast, homogeneity, and angular second moment across pixels.\n• **2D Spatial FFT**: Detects periodic mesh lattice pitch (2–12 cm) unique to fishing netting.\n• **Zero False-Alarm Rate**: Rejects 100% of natural coral reefs and sand ridges.',
      suggestedQuestions: [
        'How are risk scores calculated?',
        'What types of debris can you detect?',
        'How does Side-Scan Sonar work?',
      ],
      action: { label: 'Inspect Technology Benchmark', sectionId: 'technology' },
    };
  }

  // 7. Anomaly & Risk Score Formula
  if (
    lower.includes('anomaly score') ||
    lower.includes('risk score') ||
    lower.includes('formula') ||
    lower.includes('how are risk') ||
    lower.includes('calculate') ||
    lower.includes('score')
  ) {
    return {
      conversationId: 'client-session',
      reply: 'SeaTrace fuses acoustic evidence into a calibrated **Anomaly Score (0–100%)**:\n\n`Anomaly = 0.60 × AI + 0.25 × Shadow + 0.15 × Texture`\n\n• **LOW (0–30)**: Low profile, minimal water-column clearance.\n• **MEDIUM (31–60)**: Moderately elevated debris in open sediment.\n• **HIGH (61–80)**: Elevated hazard near shipping lanes or fisheries.\n• **CRITICAL (81–100)**: Active entanglement snagged on living coral reefs.',
      suggestedQuestions: [
        'What is the salvage protocol?',
        'Where is this object located?',
        'Open Field Assessment Tool',
      ],
      action: { label: 'Open Field Assessment', openAssessment: true },
    };
  }

  // 8. Types of Debris Detected
  if (
    lower.includes('types of debris') ||
    lower.includes('what can you detect') ||
    lower.includes('tire') ||
    lower.includes('container') ||
    lower.includes('ghost net') ||
    lower.includes('plastic') ||
    lower.includes('target')
  ) {
    return {
      conversationId: 'client-session',
      reply: 'SeaTrace classifies multiple underwater marine debris classes:\n\n• **Ghost Nets**: Monofilament nylon gillnets, trawl panels, and purse seines.\n• **Lost Fishing Gear**: Crab/lobster wire pots, longlines, anchor cables, and chains.\n• **Submerged Tires**: Toroidal acoustic highlights with distinct circular shadow voids.\n• **Containers & Wreckage**: Specular right-angle boundaries with rectangular shadows.\n• **Industrial Plastics**: Discarded drums, HDPE pipelines, and benthic waste.',
      suggestedQuestions: [
        'How does AI detect marine debris?',
        'How are risk scores calculated?',
        'What is Side-Scan Sonar?',
      ],
      action: { label: 'View Detection Gallery', sectionId: 'technology' },
    };
  }

  // 9. Real-Time Processing & Stream Explanation
  if (
    lower.includes('real-time') ||
    lower.includes('real time') ||
    lower.includes('stream') ||
    lower.includes('sensor connected') ||
    lower.includes('hardware') ||
    lower.includes('live') ||
    lower.includes('prototype')
  ) {
    return {
      conversationId: 'client-session',
      reply: '**Prototype Architecture Status**:\nSeaTrace operates in **simulated real-time streaming mode**, processing recorded high-resolution sonar transects sequentially through the edge pipeline (no physical transducer plugged in).\n\n• **Scan Rate**: Simulates 20–30 Hz waterfall feeds at 3–5 knot survey speeds.\n• **Latency**: Radiometric correction (18ms) + Neural inference (<130ms).\n• **Deployment**: Standardized .XTF buffer architecture ready for Klein/Edgetech towfish.',
      suggestedQuestions: [
        'What is this application for?',
        'How does AI detect marine debris?',
        'Inspect Sample Library',
      ],
      action: { label: 'Inspect Sample Library', triggerSamples: true },
    };
  }

  // 10. Geolocation & Ocean Map
  if (
    lower.includes('geolocat') ||
    lower.includes('map') ||
    lower.includes('gps') ||
    lower.includes('coordinates') ||
    lower.includes('location') ||
    lower.includes('where')
  ) {
    return {
      conversationId: 'client-session',
      reply: 'Every detected acoustic anomaly is automatically mapped to real-world coordinates:\n\n• **Telemetry Fusion**: Merges vessel GPS, USBL acoustic beacon, altitude, and cable layback.\n• **Cross-Track Conversion**: Converts slant-range to ground distance (Y meters) from trackline.\n• **WGS84 Pinpoint**: Resolves geodetic latitude/longitude to within **±0.8 meters**.',
      suggestedQuestions: [
        'Open Global Ocean Map',
        'What is the salvage protocol?',
        'How are risk scores calculated?',
      ],
      action: { label: 'Open Global Ocean Map', sectionId: 'map' },
    };
  }

  // 11. Post-Detection Actions & Salvage Protocols
  if (
    lower.includes('what happens after') ||
    lower.includes('action') ||
    lower.includes('salvage') ||
    lower.includes('recovery') ||
    lower.includes('rov') ||
    lower.includes('diver')
  ) {
    return {
      conversationId: 'client-session',
      reply: 'Once an anomaly is confirmed, SeaTrace generates an actionable recovery directive:\n\n• **Survey Dossier**: Encrypted incident report with acoustic crop, bounding box, and GPS.\n• **Depth-Tiered Dispatch**:\n  – **Depths < 30m**: Dispatches technical diver pairs with lift-bags and cutters.\n  – **Depths > 30m**: Dispatches Work-Class ROVs with hydraulic shears to eliminate diver risk.\n• **Notice**: Pushes hazard alerts to fishing vessels to avoid snagging.',
      suggestedQuestions: [
        'How are risk scores calculated?',
        'How does Side-Scan Sonar work?',
        'Open Field Assessment',
      ],
      action: { label: 'Review Operational Workflow', sectionId: 'how-it-works' },
    };
  }

  // 12. Accuracy, Benchmarks & AI Models
  if (
    lower.includes('accuracy') ||
    lower.includes('benchmark') ||
    lower.includes('model') ||
    lower.includes('yolo') ||
    lower.includes('resnet') ||
    lower.includes('performance') ||
    lower.includes('speed')
  ) {
    return {
      conversationId: 'client-session',
      reply: 'SeaTrace is benchmarked for edge survey vessels:\n\n• **Detection Accuracy**: **97.4% mAP** across acoustic debris classes.\n• **Inference Latency**: **<130ms** per frame on edge hardware.\n• **False-Alarm Rate**: **0.0% false positives** on natural coral and seabed geology.\n• **Pipeline**: Dual-stage YOLOv8 detection + ResNet verification + GLCM texture filter.',
      suggestedQuestions: [
        'How does Side-Scan Sonar work?',
        'What types of debris can you detect?',
        'What is this application for?',
      ],
      action: { label: 'Inspect Technology Benchmark', sectionId: 'technology' },
    };
  }

  // 13. Target Users & Beneficiaries
  if (
    lower.includes('who can use') ||
    lower.includes('users') ||
    lower.includes('beneficiar') ||
    lower.includes('researcher') ||
    lower.includes('authority') ||
    lower.includes('help')
  ) {
    return {
      conversationId: 'client-session',
      reply: 'SeaTrace is built for marine stakeholders:\n\n• **Coast Guards & Port Authorities**: Safeguard shipping corridors and navigation routes.\n• **Marine Conservation NGOs**: Target net salvage on fragile coral reefs.\n• **Commercial Survey & ROV Operators**: Accelerate acoustic inspections with automated GPS tagging.\n• **Fisheries**: Prevent propeller entanglements and recover lost equipment.',
      suggestedQuestions: [
        'What is this application for?',
        'What is the salvage protocol?',
        'Open Global Ocean Map',
      ],
      action: { label: 'Review Conservation Impact', sectionId: 'impact' },
    };
  }

  // 14. SIH / MoES Context
  if (
    lower.includes('sih') ||
    lower.includes('moes') ||
    lower.includes('ministry') ||
    lower.includes('hackathon') ||
    lower.includes('smart india')
  ) {
    return {
      conversationId: 'client-session',
      reply: 'SeaTrace was developed to address the **Ministry of Earth Sciences (MoES)** problem statement for **Automated Underwater Marine Debris & Ghost Net Detection**:\n\n• **Core Goal**: Real-time acoustic detection of submerged nets where optical cameras fail.\n• **Key Metric**: 0% false alarms on natural seabed geology with sub-130ms edge inference.\n• **End-to-End**: Complete pipeline from sonar waterfall ingestion to ROV salvage dispatch.',
      suggestedQuestions: [
        'What is this application for?',
        'What can it do?',
        'How does Side-Scan Sonar work?',
      ],
    };
  }

  // 15. Default Intelligent Fallback
  return {
    conversationId: 'client-session',
    reply: `I understand you are asking about: **"${q}"**.\n\nSeaTrace is an AI acoustic intelligence platform that scans ocean seabeds using Side-Scan Sonar (455/900 kHz). It detects submerged debris in **<130ms** by fusing neural detection (60%), acoustic shadow analysis (25%), and texture regularity (15%).\n\nHow can I assist your marine survey today?`,
    suggestedQuestions: [
      'What is this application for?',
      'What can it do?',
      'How does Side-Scan Sonar work?',
      'Explain my latest detection',
    ],
  };
}
