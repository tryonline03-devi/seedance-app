export type GenerationMode =
  | 'text-to-video'
  | 'image-first-frame'
  | 'image-first-last-frame'
  | 'multimodal-reference';

export type JobState =
  | 'waiting'
  | 'queuing'
  | 'generating'
  | 'success'
  | 'fail';

export type SeedanceModel =
  | 'bytedance/seedance-2'
  | 'bytedance/seedance-2-fast'
  | 'bytedance/seedance-2-mini';

export interface GenerateRequestBody {
  prompt: string;
  model: SeedanceModel;
  mode: GenerationMode;
  resolution: '480p' | '720p' | '1080p';
  aspectRatio: '16:9' | '9:16' | '1:1' | '4:3';
  duration: number;
  generateAudio: boolean;
  returnLastFrame: boolean;
  webSearch: boolean;
  // Data URLs (base64) captured client-side via FileReader.
  firstFrameData?: string;
  lastFrameData?: string;
  referenceImageData?: string[];
  referenceVideoData?: string[];
  referenceAudioData?: string[];
}

export interface Job {
  id: string;
  taskId: string;
  model: SeedanceModel;
  mode: GenerationMode;
  prompt: string;
  state: JobState;
  progress?: number;
  resultUrls?: string[];
  failMsg?: string;
  createdAt: number;
  updatedAt: number;
  input: Record<string, unknown>;
}
