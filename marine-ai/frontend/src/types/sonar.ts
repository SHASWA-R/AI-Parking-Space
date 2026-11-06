export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface BBox {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  cx?: number;
  cy?: number;
  width?: number;
  height?: number;
}

export interface StageTiming {
  name: string;
  durationMs: number;
}

export interface PeriodicityDetail {
  meshPitchCm?: number;
  strength?: number;
  resolvable?: boolean;
  samplesPerPeriod?: number;
  gearType?: string;
}

export interface LinearityDetail {
  elongation?: number;
  straightness?: number;
  orientationDeg?: number;
  approxLengthM?: number;
}

export interface CircularityDetail {
  isoperimetric?: number;
  radialConsistency?: number;
  approxRadiusM?: number;
}

export interface AngularityDetail {
  vertices?: number;
  rightAngles?: number;
  rectFill?: number;
  convexity?: number;
  edgeStraightness?: number;
  meanAngleDev?: number;
}

export interface IrregularityDetail {
  boundaryRoughness?: number;
  spectralFlatness?: number;
  elongation?: number;
}

export interface SignatureDetailMap {
  periodicity?: PeriodicityDetail;
  linearity?: LinearityDetail;
  circularity?: CircularityDetail;
  angularity?: AngularityDetail;
  irregularity?: IrregularityDetail;
  [key: string]: any;
}

export interface Detection {
  id: string;
  bbox: BBox;
  confidence: number;
  className: string;
  signature: 'periodicity' | 'linearity' | 'circularity' | 'angularity' | 'irregularity' | string;
  signatureScore: number;
  naturalScore: number;
  signatureScores: Record<string, number>;
  signatureDetail: SignatureDetailMap;
  shadowScore?: number;
  textureScore?: number;
  anomalyScore: number;
  risk: RiskLevel;
  evidence: string[];
  overrideReason?: string;
  meshPitchCm?: number;
  inferredGearType?: string;
  estimatedLengthM?: number;
  estimatedWidthM?: number;
  estimatedHeightM?: number;
}

export interface AnalysisResult {
  analysisId: string;
  sourceImage: string;
  createdAt: string;
  modelVersion: string;
  demoMode: boolean;
  imageWidth: number;
  imageHeight: number;
  stages: StageTiming[];
  detections: Detection[];
  filteredOut: number;
  warnings: string[];
}

export interface TargetGroundTruth {
  style: string;
  mesh_pitch_cm?: number;
  length_m: number;
  width_m: number;
  max_height_m: number;
  orientation_deg: number;
  centre_ground_m: number;
  centre_along_m: number;
  gear_type?: string;
  channel: 'port' | 'starboard';
  bbox_xyxy: [number, number, number, number];
  mesh_resolvable: boolean;
  type?: string;
}

export interface GroundTruthMetadata {
  background_source: string;
  synthetic: boolean;
  sonar: {
    altitude_m: number;
    slant_range_max_m: number;
    slant_res_m: number;
    along_track_res_m: number;
    width: number;
    height: number;
  };
  targets: TargetGroundTruth[];
}

export interface Statistics {
  totalImages: number;
  totalDetections: number;
  highRiskCount: number;
  naturalFeaturesFiltered: number;
  averageConfidence: number;
}

export interface SampleItem {
  id: string;
  name: string;
  title: string;
  description: string;
  imagePath: string;
  metadataPath: string;
  expectedTargets: number;
  category?: 'benchmark' | 'operational' | 'synthetic';
  sourceDataset?: string;
  location?: string;
  coordinates?: string;
  depthM?: number;
  frequencyKhz?: number;
}
