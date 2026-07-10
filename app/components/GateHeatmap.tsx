'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { supabaseClient as supabase } from '../lib/supabase';
import type { GateMetric } from '../lib/types';

/**
 * GateHeatmap — displays real-time crowd density per gate
 * with color-coded progress bars and critical threshold alerts.
 * Subscribes to Supabase Realtime for live updates.
 */
export default function GateHeatmap() {
  const [metrics, setMetrics] = useState<Record<string, number>>({
    'Gate-A': 42,
    'Gate-B': 58,
    'Gate-C': 87,
  });

  const fetchMetrics = useCallback(async () => {
    const { data, error } = await supabase
      .from('stadium_metrics_ledger')
      .select('gate_id, crowd_density, timestamp')
      .order('timestamp', { ascending: false })
      .limit(40);

    if (!error && data) {
      const latest: Record<string, number> = {};
      data.forEach((row: { gate_id: string; crowd_density: number }) => {
        if (!latest[row.gate_id]) {
          latest[row.gate_id] = Number(row.crowd_density);
        }
      });
      setMetrics(prev => ({ ...prev, ...latest }));
    }
  }, []);

  useEffect(() => {
    fetchMetrics();

    const channel = supabase
      .channel('heatmap-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'stadium_metrics_ledger',
        },
        (payload) => {
          const newMetric = payload.new as GateMetric;
          setMetrics((prev) => ({
            ...prev,
            [newMetric.gate_id]: Number(newMetric.crowd_density),
          }));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchMetrics]);

  /** Memoize sorted entries to avoid re-sorting on every render */
  const sortedEntries = useMemo(
    () => Object.entries(metrics).sort(([a], [b]) => a.localeCompare(b)),
    [metrics]
  );

  return (
    <section className="lg:col-span-1 bento-card bg-white flex flex-col" aria-label="Gate density heatmap">
      <header className="p-4 border-b-4 border-black bg-[#E2FF32] text-black">
        <h2 className="font-body-md font-bold uppercase flex items-center gap-2">
          <span className="material-symbols-outlined" aria-hidden="true">local_fire_department</span>
          Gate Heatmap
        </h2>
      </header>
      <div className="p-6 flex-1 flex flex-col gap-6 justify-center" role="list" aria-label="Gate density readings">
        {sortedEntries.map(([gate, density]) => {
          const isCritical = density >= 80;
          return (
            <div key={gate} role="listitem">
              <div className={`flex justify-between font-label-xs-caps uppercase mb-2 font-bold ${isCritical ? 'text-[#FF4911]' : ''}`}>
                <span>{gate} {isCritical ? '(CRITICAL)' : ''}</span>
                <span>{density}%</span>
              </div>
              <div
                className="h-8 border-4 border-black bg-gray-200 w-full"
                role="progressbar"
                aria-valuenow={density}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${gate} crowd density: ${density}%`}
              >
                <div
                  className={`h-full border-r-4 border-black transition-all duration-500 ${isCritical ? 'bg-[#FF4911]' : 'bg-[#E2FF32]'}`}
                  style={{ width: `${Math.min(density, 100)}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
