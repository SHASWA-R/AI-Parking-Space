import { AnalysisResult, GroundTruthMetadata, SampleItem, Statistics } from '../types/sonar';
import { computeMockStatistics, MOCK_HISTORY, simulateAnalysis } from './mockEngine';

const API_BASE = '/api';

export async function checkBackendHealth(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1200);
    const res = await fetch(`${API_BASE}/statistics`, { credentials: 'omit', signal: controller.signal });
    clearTimeout(timeoutId);
    return res.ok;
  } catch {
    return false;
  }
}

export async function analyzeSonarImage(
  fileOrSample: File | SampleItem,
  groundTruth?: GroundTruthMetadata
): Promise<{ result: AnalysisResult; isLive: boolean }> {
  // If it's a File uploaded by the user, attempt real backend first
  if (fileOrSample instanceof File) {
    try {
      const formData = new FormData();
      formData.append('image', fileOrSample);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);
      const res = await fetch(`${API_BASE}/analyze`, {
        method: 'POST',
        body: formData,
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        return { result: data, isLive: true };
      }
    } catch {
      console.warn('Live backend unreachable or failed, falling back to simulated forward model.');
    }
  }

  // Use simulation engine
  const simulated = await simulateAnalysis(fileOrSample, groundTruth);
  return { result: simulated, isLive: false };
}

export async function fetchStatistics(cachedHistory: AnalysisResult[]): Promise<{ stats: Statistics; isLive: boolean }> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1500);
    const res = await fetch(`${API_BASE}/statistics`, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (res.ok) {
      const data = await res.json();
      return { stats: data, isLive: true };
    }
  } catch {
    // Fall back to local statistics
  }

  return { stats: computeMockStatistics(cachedHistory.length > 0 ? cachedHistory : MOCK_HISTORY), isLive: false };
}

export async function fetchDetections(): Promise<{ detections: AnalysisResult[]; isLive: boolean }> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1500);
    const res = await fetch(`${API_BASE}/detections`, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (res.ok) {
      const data = await res.json();
      return { detections: data, isLive: true };
    }
  } catch {
    // Fall back
  }

  return { detections: MOCK_HISTORY, isLive: false };
}

export async function sendChatMessage(
  request: import('./chatEngine').ChatApiRequest,
  appContext: import('./chatEngine').ChatAppContext
): Promise<import('./chatEngine').ChatApiResponse> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);
    const res = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (res.ok) {
      const data = await res.json();
      return data;
    }
  } catch {
    // Graceful fallback to client-side SeaTrace AI conversational engine
  }

  const { generateLocalChatReply } = await import('./chatEngine');
  return generateLocalChatReply(request.message, request.history || [], appContext);
}

