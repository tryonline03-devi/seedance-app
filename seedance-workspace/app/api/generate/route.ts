import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { createTask, uploadBase64 } from '@/lib/kie';
import { createJob } from '@/lib/store';
import type { GenerateRequestBody, Job } from '@/lib/types';

export async function POST(req: NextRequest) {
  let body: GenerateRequestBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!body.prompt?.trim()) {
    return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
  }

  try {
    // Reference media arrives as data URLs from the browser. Kie.ai's task
    // API wants public URLs, so each one gets uploaded to Kie.ai's
    // temporary file host first.
    const [firstFrameUrl, lastFrameUrl, referenceImageUrls, referenceVideoUrls, referenceAudioUrls] =
      await Promise.all([
        body.firstFrameData
          ? uploadBase64(body.firstFrameData, `first-${randomUUID()}.png`)
          : Promise.resolve(undefined),
        body.lastFrameData
          ? uploadBase64(body.lastFrameData, `last-${randomUUID()}.png`)
          : Promise.resolve(undefined),
        Promise.all(
          (body.referenceImageData ?? []).map((d, i) =>
            uploadBase64(d, `ref-image-${i}-${randomUUID()}.png`)
          )
        ),
        Promise.all(
          (body.referenceVideoData ?? []).map((d, i) =>
            uploadBase64(d, `ref-video-${i}-${randomUUID()}.mp4`)
          )
        ),
        Promise.all(
          (body.referenceAudioData ?? []).map((d, i) =>
            uploadBase64(d, `ref-audio-${i}-${randomUUID()}.mp3`)
          )
        )
      ]);

    // The Kie.ai / Seedance 2.0 API treats first-frame, first+last-frame,
    // and multimodal-reference as mutually exclusive input modes — only
    // send the fields that belong to the selected mode.
    const input: Record<string, unknown> = {
      prompt: body.prompt.trim(),
      resolution: body.resolution,
      aspect_ratio: body.aspectRatio,
      duration: body.duration,
      generate_audio: body.generateAudio,
      web_search: body.webSearch
    };

    if (body.mode === 'image-first-frame' && firstFrameUrl) {
      input.first_frame_url = firstFrameUrl;
      input.return_last_frame = body.returnLastFrame;
    }

    if (body.mode === 'image-first-last-frame' && firstFrameUrl && lastFrameUrl) {
      input.first_frame_url = firstFrameUrl;
      input.last_frame_url = lastFrameUrl;
    }

    if (body.mode === 'multimodal-reference') {
      if (referenceImageUrls.length) input.reference_image_urls = referenceImageUrls;
      if (referenceVideoUrls.length) input.reference_video_urls = referenceVideoUrls;
      if (referenceAudioUrls.length) input.reference_audio_urls = referenceAudioUrls;
      input.return_last_frame = body.returnLastFrame;
    }

    const taskId = await createTask(body.model, input);

    const job: Job = {
      id: randomUUID(),
      taskId,
      model: body.model,
      mode: body.mode,
      prompt: body.prompt.trim(),
      state: 'waiting',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      input
    };

    createJob(job);
    return NextResponse.json(job, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
