'use client';

import { useState } from 'react';

export default function Dropzone() {
  const [status, setStatus] = useState<'IDLE' | 'UPLOADING' | 'SUCCESS' | 'ERROR'>('IDLE');

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setStatus('UPLOADING');
    
    const file = e.dataTransfer.files[0];
    if (!file) {
      setStatus('ERROR');
      return;
    }

    try {
      const text = await file.text();
      const payload = JSON.parse(text);

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
      }
    } catch (err) {
      console.error(err);
      setStatus('ERROR');
    }
  };

  const handleClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      setStatus('UPLOADING');
      try {
        const text = await file.text();
        const payload = JSON.parse(text);

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
        }
      } catch (err) {
        console.error(err);
        setStatus('ERROR');
      }
    };
    input.click();
  };

  return (
    <section
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      onClick={handleClick}
      className="lg:col-span-4 bg-[#00E5FF] border-4 border-dashed border-black h-48 flex items-center justify-center cursor-pointer hover:bg-black hover:text-white transition-all group shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:translate-x-1 relative overflow-hidden"
    >
      <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px] group-hover:bg-[radial-gradient(#fff_1px,transparent_1px)]"></div>
      <div className="flex flex-col items-center gap-4 relative z-10">
        <span className="material-symbols-outlined text-4xl group-hover:animate-bounce">
          {status === 'SUCCESS' ? 'check_circle' : status === 'ERROR' ? 'error' : 'upload'}
        </span>
        <h2 className="font-headline-lg text-headline-lg font-extrabold uppercase text-center text-black group-hover:text-white">
          {status === 'IDLE' && 'DROP SYNTHETIC PAYLOAD (JSON)'}
          {status === 'UPLOADING' && 'INGESTING TELEMETRY...'}
          {status === 'SUCCESS' && 'PAYLOAD INGESTED SUCCESSFULLY!'}
          {status === 'ERROR' && 'INGESTION ERROR - TRY AGAIN'}
        </h2>
      </div>
    </section>
  );
}
