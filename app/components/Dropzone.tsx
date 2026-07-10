'use client';

import { useState, useCallback } from 'react';

type DropzoneStatus = 'IDLE' | 'UPLOADING' | 'SUCCESS' | 'ERROR';

/**
 * Dropzone — drag-and-drop / click-to-upload component for ingesting
 * synthetic JSON telemetry payloads via `/api/ingest`.
 */
export default function Dropzone() {
  const [status, setStatus] = useState<DropzoneStatus>('IDLE');

  /** Shared ingestion handler for both drag-drop and file picker flows */
  const ingestFile = useCallback(async (file: File) => {
    setStatus('UPLOADING');
    try {
      const text = await file.text();
      const payload: unknown = JSON.parse(text);

      const res = await fetch('/api/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setStatus('SUCCESS');
        setTimeout(() => setStatus('IDLE'), 3000);
      } else {
        setStatus('ERROR');
        setTimeout(() => setStatus('IDLE'), 5000);
      }
    } catch {
      setStatus('ERROR');
      setTimeout(() => setStatus('IDLE'), 5000);
    }
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file) {
      setStatus('ERROR');
      return;
    }
    await ingestFile(file);
  }, [ingestFile]);

  const handleClick = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      await ingestFile(file);
    };
    input.click();
  }, [ingestFile]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  }, [handleClick]);

  const statusConfig: Record<DropzoneStatus, { icon: string; label: string }> = {
    IDLE: { icon: 'upload', label: 'DROP SYNTHETIC PAYLOAD (JSON)' },
    UPLOADING: { icon: 'hourglass_top', label: 'INGESTING TELEMETRY...' },
    SUCCESS: { icon: 'check_circle', label: 'PAYLOAD INGESTED SUCCESSFULLY!' },
    ERROR: { icon: 'error', label: 'INGESTION ERROR - TRY AGAIN' },
  };

  return (
    <section
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label="Upload telemetry payload JSON file"
      className="lg:col-span-4 bg-[#00E5FF] border-4 border-dashed border-black h-48 flex items-center justify-center cursor-pointer hover:bg-black hover:text-white transition-all group shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:translate-x-1 relative overflow-hidden"
    >
      <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px] group-hover:bg-[radial-gradient(#fff_1px,transparent_1px)]"></div>
      <div className="flex flex-col items-center gap-4 relative z-10">
        <span className="material-symbols-outlined text-4xl group-hover:animate-bounce" aria-hidden="true">
          {statusConfig[status].icon}
        </span>
        <h2 className="font-headline-lg text-headline-lg font-extrabold uppercase text-center text-black group-hover:text-white">
          {statusConfig[status].label}
        </h2>
      </div>
    </section>
  );
}
