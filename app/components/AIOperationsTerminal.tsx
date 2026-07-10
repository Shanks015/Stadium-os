'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { supabaseClient as supabase } from '../lib/supabase';
import type { AiOpsLogEntry } from '../lib/types';

/**
 * AI Operations Terminal — displays the latest AI reasoning output
 * from `stadium_ai_ops_log` with real-time WebSocket updates.
 */
export default function AIOperationsTerminal() {
  const [aiLog, setAiLog] = useState<AiOpsLogEntry | null>(null);
  const [status, setStatus] = useState<'CONNECTING' | 'LIVE' | 'ERROR'>('CONNECTING');

  const fetchInitialState = useCallback(async () => {
    const { data, error } = await supabase
      .from('stadium_ai_ops_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (!error && data) setAiLog(data as AiOpsLogEntry);
  }, []);

  useEffect(() => {
    fetchInitialState();

    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'stadium_ai_ops_log',
        },
        (payload) => {
          setAiLog(payload.new as AiOpsLogEntry);
        }
      )
      .subscribe((event) => {
        if (event === 'SUBSCRIBED') setStatus('LIVE');
        if (event === 'CHANNEL_ERROR') setStatus('ERROR');
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchInitialState]);

  /** Memoize the action script rendering to avoid unnecessary recalculations */
  const renderedActionScript = useMemo(() => {
    if (!aiLog?.action_script) return null;
    if (typeof aiLog.action_script === 'string') return aiLog.action_script;
    return Object.values(aiLog.action_script).map(val => `> ${val}`).join('\n');
  }, [aiLog?.action_script]);

  return (
    <section className="lg:col-span-3 bento-card bg-black text-white flex flex-col" aria-label="AI reasoning terminal">
      <header className="p-4 border-b-4 border-white bg-white text-black flex justify-between items-center">
        <h2 className="font-body-md font-bold uppercase flex items-center gap-2">
          <span className="material-symbols-outlined" aria-hidden="true">psychology</span>
          AI Reasoning &amp; Operations Engine
        </h2>
        <div
          role="status"
          aria-live="polite"
          className={`px-3 py-1 font-bold text-xs uppercase border-2 border-black ${status === 'LIVE' ? 'bg-[#E2FF32] text-black' : 'bg-white text-black'}`}
        >
          {status}
        </div>
      </header>

      {aiLog ? (
        <div className="p-6 flex-1 flex flex-col gap-4 font-body-md terminal-text">
          <div className="bg-[#FF4911] text-white p-3 border-2 border-white w-fit font-bold uppercase flex items-center gap-2" role="alert">
            <span className="material-symbols-outlined" aria-hidden="true">warning</span> SEVERITY: {aiLog.severity?.toUpperCase()}
          </div>
          
          <div className="border-l-4 border-[#E2FF32] pl-4">
            <span className="text-gray-400 block mb-1 uppercase font-label-xs-caps text-xs">Reasoning</span>
            <p className="text-[#E2FF32]">&quot;{aiLog.reasoning}&quot;</p>
          </div>

          <div className="border-l-4 border-green-500 pl-4 mt-auto">
            <span className="text-gray-400 block mb-1 uppercase font-label-xs-caps text-xs">Action Script</span>
            <p className="text-green-400 whitespace-pre-line leading-tight">
              {renderedActionScript}
            </p>
          </div>
        </div>
      ) : (
        <div className="p-6 flex-1 flex items-center justify-center text-gray-500 font-bold uppercase tracking-widest" role="status">
          Awaiting live telemetry...
        </div>
      )}
    </section>
  );
}
