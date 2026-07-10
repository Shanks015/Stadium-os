'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export default function GateHeatmap() {
  const [metrics, setMetrics] = useState<Record<string, number>>({
    'Gate-A': 42,
    'Gate-B': 58,
    'Gate-C': 87,
  });

  useEffect(() => {
    const fetchMetrics = async () => {
      const { data, error } = await supabase
        .from('stadium_metrics_ledger')
        .select('gate_id, crowd_density, timestamp')
        .order('timestamp', { ascending: false });

      if (!error && data) {
        const latest: Record<string, number> = {};
        data.forEach((row) => {
          if (!latest[row.gate_id]) {
            latest[row.gate_id] = Number(row.crowd_density);
          }
        });
        setMetrics(prev => ({ ...prev, ...latest }));
      }
    };

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
          const newMetric = payload.new;
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
  }, []);

  return (
    <section className="lg:col-span-1 bento-card bg-white flex flex-col">
      <header className="p-4 border-b-4 border-black bg-[#E2FF32] text-black">
        <h2 className="font-body-md font-bold uppercase flex items-center gap-2">
          <span className="material-symbols-outlined">local_fire_department</span>
          Gate Heatmap
        </h2>
      </header>
      <div className="p-6 flex-1 flex flex-col gap-6 justify-center">
        {Object.entries(metrics).map(([gate, density]) => {
          const isCritical = density >= 80;
          return (
            <div key={gate}>
              <div className={`flex justify-between font-label-xs-caps uppercase mb-2 font-bold ${isCritical ? 'text-[#FF4911]' : ''}`}>
                <span>{gate} {isCritical ? '(CRITICAL)' : ''}</span>
                <span>{density}%</span>
              </div>
              <div className="h-8 border-4 border-black bg-gray-200 w-full">
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
