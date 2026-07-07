'use client';

import { useState } from 'react';
import FilePicker, { PickedFile } from './FilePicker';
import type { GenerateRequestBody, GenerationMode, SeedanceModel } from '@/lib/types';

interface ComposerProps {
  onSubmit: (body: GenerateRequestBody) => Promise<void>;
}

const MODES: { value: GenerationMode; label: string }[] = [
  { value: 'text-to-video', label: 'Text only' },
  { value: 'image-first-frame', label: 'First frame' },
  { value: 'image-first-last-frame', label: 'First + last' },
  { value: 'multimodal-reference', label: 'Multimodal refs' }
];

const MODELS: { value: SeedanceModel; label: string; note: string }[] = [
  { value: 'bytedance/seedance-2', label: 'Standard', note: 'Best quality' },
  { value: 'bytedance/seedance-2-fast', label: 'Fast', note: 'Quick iteration' },
  { value: 'bytedance/seedance-2-mini', label: 'Mini', note: 'Cheapest' }
];

export default function Composer({ onSubmit }: ComposerProps) {
  const [prompt, setPrompt] = useState('');
  const [mode, setMode] = useState<GenerationMode>('text-to-video');
  const [model, setModel] = useState<SeedanceModel>('bytedance/seedance-2');
  const [resolution, setResolution] = useState<'480p' | '720p' | '1080p'>('720p');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16' | '1:1' | '4:3'>('16:9');
  const [duration, setDuration] = useState(10);
  const [generateAudio, setGenerateAudio] = useState(true);
  const [returnLastFrame, setReturnLastFrame] = useState(false);
  const [webSearch, setWebSearch] = useState(false);

  const [firstFrame, setFirstFrame] = useState<PickedFile[]>([]);
  const [lastFrame, setLastFrame] = useState<PickedFile[]>([]);
  const [refImages, setRefImages] = useState<PickedFile[]>([]);
  const [refVideos, setRefVideos] = useState<PickedFile[]>([]);
  const [refAudio, setRefAudio] = useState<PickedFile[]>([]);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const needsFirstFrame = mode === 'image-first-frame' || mode === 'image-first-last-frame';
  const needsLastFrame = mode === 'image-first-last-frame';
  const needsMultimodal = mode === 'multimodal-reference';

  function resetMediaForMode(next: GenerationMode) {
    setMode(next);
    setFirstFrame([]);
    setLastFrame([]);
    setRefImages([]);
    setRefVideos([]);
    setRefAudio([]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!prompt.trim() || submitting) return;

    if (needsFirstFrame && firstFrame.length === 0) {
      setError('This mode needs a first-frame image.');
      return;
    }
    if (needsLastFrame && lastFrame.length === 0) {
      setError('This mode needs a last-frame image too.');
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      const body: GenerateRequestBody = {
        prompt,
        model,
        mode,
        resolution,
        aspectRatio,
        duration,
        generateAudio,
        returnLastFrame,
        webSearch,
        firstFrameData: firstFrame[0]?.dataUrl,
        lastFrameData: lastFrame[0]?.dataUrl,
        referenceImageData: refImages.map((f) => f.dataUrl),
        referenceVideoData: refVideos.map((f) => f.dataUrl),
        referenceAudioData: refAudio.map((f) => f.dataUrl)
      };
      await onSubmit(body);
      setPrompt('');
      resetMediaForMode(mode);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-1 gap-4 rounded-md border border-line bg-panel p-4 lg:grid-cols-[1fr_280px] lg:gap-6 lg:p-6"
    >
      {/* Main column: prompt + mode-specific reference media */}
      <div className="flex flex-col gap-4">
        <div>
          <div className="mb-1.5 flex items-baseline justify-between">
            <label htmlFor="prompt" className="text-[11px] uppercase tracking-slate text-ash">
              Prompt
            </label>
            <span className="text-[11px] font-mono text-smoke">{prompt.length}</span>
          </div>
          <textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="A tracking shot through a rain-lit alley, neon signs reflecting in puddles as @image1 walks toward camera…"
            rows={5}
            className="focus-ring w-full resize-none rounded-sm border border-line bg-canvas px-3 py-2.5 text-[14px] leading-relaxed text-paper placeholder:text-smoke"
          />
        </div>

        <div>
          <div className="mb-1.5 text-[11px] uppercase tracking-slate text-ash">Mode</div>
          <div className="flex flex-wrap gap-1.5">
            {MODES.map((m) => (
              <button
                key={m.value}
                type="button"
                onClick={() => resetMediaForMode(m.value)}
                className={`focus-ring rounded-sm border px-2.5 py-1.5 text-[12px] transition-colors ${
                  mode === m.value
                    ? 'border-tally bg-tally/10 text-tally'
                    : 'border-line text-ash hover:border-line-strong hover:text-paper'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {mode === 'text-to-video' && (
          <p className="text-[12px] text-smoke">
            Pure text-to-video — no reference media required. Switch modes above to steer
            with a first frame or with multimodal references.
          </p>
        )}

        {needsFirstFrame && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <FilePicker
              label="First frame"
              hint="1 image"
              accept="image/*"
              max={1}
              items={firstFrame}
              onChange={setFirstFrame}
            />
            {needsLastFrame && (
              <FilePicker
                label="Last frame"
                hint="1 image"
                accept="image/*"
                max={1}
                items={lastFrame}
                onChange={setLastFrame}
              />
            )}
          </div>
        )}

        {needsMultimodal && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <FilePicker
              label="Reference images"
              hint="up to 9"
              accept="image/*"
              max={9}
              items={refImages}
              onChange={setRefImages}
            />
            <FilePicker
              label="Reference videos"
              hint="up to 3, 15s each"
              accept="video/*"
              max={3}
              items={refVideos}
              onChange={setRefVideos}
            />
            <FilePicker
              label="Reference audio"
              hint="up to 3, 15s each"
              accept="audio/*"
              max={3}
              items={refAudio}
              onChange={setRefAudio}
            />
          </div>
        )}
      </div>

      {/* Right rail: generation settings */}
      <div className="flex flex-col gap-4 border-t border-line pt-4 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
        <Field label="Model">
          <select
            value={model}
            onChange={(e) => setModel(e.target.value as SeedanceModel)}
            className="focus-ring w-full rounded-sm border border-line bg-canvas px-2.5 py-1.5 text-[13px] text-paper"
          >
            {MODELS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label} — {m.note}
              </option>
            ))}
          </select>
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Resolution">
            <select
              value={resolution}
              onChange={(e) => setResolution(e.target.value as typeof resolution)}
              className="focus-ring w-full rounded-sm border border-line bg-canvas px-2.5 py-1.5 text-[13px] text-paper"
            >
              <option value="480p">480p</option>
              <option value="720p">720p</option>
              <option value="1080p">1080p</option>
            </select>
          </Field>
          <Field label="Aspect">
            <select
              value={aspectRatio}
              onChange={(e) => setAspectRatio(e.target.value as typeof aspectRatio)}
              className="focus-ring w-full rounded-sm border border-line bg-canvas px-2.5 py-1.5 text-[13px] text-paper"
            >
              <option value="16:9">16:9</option>
              <option value="9:16">9:16</option>
              <option value="1:1">1:1</option>
              <option value="4:3">4:3</option>
            </select>
          </Field>
        </div>

        <Field label="Duration (sec)">
          <input
            type="number"
            min={4}
            max={15}
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            className="focus-ring w-full rounded-sm border border-line bg-canvas px-2.5 py-1.5 text-[13px] font-mono text-paper"
          />
        </Field>

        <div className="flex flex-col gap-2">
          <Toggle label="Generate synchronized audio" checked={generateAudio} onChange={setGenerateAudio} />
          <Toggle
            label="Return last frame"
            hint="for chaining the next shot"
            checked={returnLastFrame}
            onChange={setReturnLastFrame}
          />
          <Toggle label="Allow web search for context" checked={webSearch} onChange={setWebSearch} />
        </div>

        {error && (
          <p className="rounded-sm border border-fail/40 bg-fail/10 px-2.5 py-2 text-[12px] text-fail">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting || !prompt.trim()}
          className="focus-ring mt-auto rounded-sm bg-tally px-3 py-2.5 text-[13px] font-medium text-canvas transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {submitting ? 'Sending to Kie.ai…' : 'Generate video'}
        </button>
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] uppercase tracking-slate text-ash">
        {label}
      </span>
      {children}
    </label>
  );
}

function Toggle({
  label,
  hint,
  checked,
  onChange
}: {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-2 text-[12px] text-ash">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="focus-ring mt-0.5 accent-tally"
      />
      <span>
        {label}
        {hint && <span className="ml-1 text-smoke">— {hint}</span>}
      </span>
    </label>
  );
}
