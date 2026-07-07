'use client';

import { useRef } from 'react';

export interface PickedFile {
  name: string;
  dataUrl: string;
}

interface FilePickerProps {
  label: string;
  hint: string;
  accept: string;
  max: number;
  items: PickedFile[];
  onChange: (items: PickedFile[]) => void;
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export default function FilePicker({
  label,
  hint,
  accept,
  max,
  items,
  onChange
}: FilePickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const atLimit = items.length >= max;

  async function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    const remaining = max - items.length;
    const files = Array.from(fileList).slice(0, remaining);
    const picked = await Promise.all(
      files.map(async (file) => ({
        name: file.name,
        dataUrl: await readAsDataUrl(file)
      }))
    );
    onChange([...items, ...picked]);
    if (inputRef.current) inputRef.current.value = '';
  }

  function removeAt(index: number) {
    onChange(items.filter((_, i) => i !== index));
  }

  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between">
        <span className="text-[11px] uppercase tracking-slate text-ash">
          {label}
        </span>
        <span className="text-[11px] font-mono text-smoke">
          {items.length}/{max}
        </span>
      </div>

      <button
        type="button"
        disabled={atLimit}
        onClick={() => inputRef.current?.click()}
        className="focus-ring w-full rounded-sm border border-dashed border-line px-3 py-2.5 text-left text-[13px] text-ash transition-colors hover:border-line-strong hover:text-paper disabled:cursor-not-allowed disabled:opacity-40"
      >
        {atLimit ? 'Limit reached' : `Add ${max > 1 ? 'files' : 'a file'} — ${hint}`}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={max > 1}
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {items.length > 0 && (
        <ul className="mt-2 space-y-1">
          {items.map((item, i) => (
            <li
              key={`${item.name}-${i}`}
              className="flex items-center justify-between gap-2 rounded-sm bg-panel-raised px-2 py-1 text-[12px]"
            >
              <span className="truncate text-ash">{item.name}</span>
              <button
                type="button"
                onClick={() => removeAt(i)}
                aria-label={`Remove ${item.name}`}
                className="focus-ring shrink-0 text-smoke hover:text-fail"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
