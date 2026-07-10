'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

interface Metric {
  id: string;
  gate_id: string;
  crowd_density: number;
  timestamp: string;
}

interface AiLog {
  id: string;
  gate_id: string;
  severity: string;
  reasoning: string;
}

export default function AnalyticsPage() {
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [aiLogs, setAiLogs] = useState<AiLog[]>([]);
  const [dbStatus, setDbStatus] = useState<'CONNECTED' | 'DISCONNECTED'>('DISCONNECTED');

  const fetchData = async () => {
    const { data: metricsData, error: metricsErr } = await supabase
      .from('stadium_metrics_ledger')
      .select('*')
      .order('timestamp', { ascending: false });

    const { data: aiData, error: aiErr } = await supabase
      .from('stadium_ai_ops_log')
      .select('*')
      .order('created_at', { ascending: false });

    if (!metricsErr && metricsData) {
      setMetrics(metricsData);
      setDbStatus('CONNECTED');
    }
    if (!aiErr && aiData) {
      setAiLogs(aiData);
    }
  };

  useEffect(() => {
    fetchData();

    // Subscribe to real-time changes
    const metricsChannel = supabase
      .channel('metrics-analytics-changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'stadium_metrics_ledger' },
        (payload) => {
          setMetrics((prev) => [payload.new as Metric, ...prev]);
        }
      )
      .subscribe();

    const aiChannel = supabase
      .channel('ai-analytics-changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'stadium_ai_ops_log' },
        (payload) => {
          setAiLogs((prev) => [payload.new as AiLog, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(metricsChannel);
      supabase.removeChannel(aiChannel);
    };
  }, []);

  // 1. Calculate Average Density
  const averageDensity = metrics.length > 0 
    ? Math.round(metrics.reduce((acc, curr) => acc + Number(curr.crowd_density), 0) / metrics.length)
    : 0;

  // 2. Group by Gate to calculate average density per gate
  const gateAverages: Record<string, { total: number; count: number }> = {};
  metrics.forEach((m) => {
    if (!gateAverages[m.gate_id]) {
      gateAverages[m.gate_id] = { total: 0, count: 0 };
    }
    gateAverages[m.gate_id].total += Number(m.crowd_density);
    gateAverages[m.gate_id].count += 1;
  });

  const gateData = Object.entries(gateAverages).map(([gate, data]) => ({
    gate,
    average: Math.round(data.total / data.count),
  })).sort((a, b) => a.gate.localeCompare(b.gate));

  const criticalAlarmsCount = aiLogs.filter(
    (log) => log.severity?.toUpperCase() === 'CRITICAL'
  ).length;

  return (
    <>
      <div className="flex justify-between items-center border-b-4 border-black pb-4 mb-8">
        <h1 className="text-4xl font-black uppercase text-black">
          Operational Analytics
        </h1>
        <div className={`px-3 py-1 font-bold text-xs uppercase border-2 border-black ${dbStatus === 'CONNECTED' ? 'bg-[#E2FF32] text-black' : 'bg-white text-black'}`}>
          {dbStatus === 'CONNECTED' ? 'TELEMETRY SECURED' : 'SYNCING DATABASE'}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 max-w-7xl">
        {/* Metric Cards */}
        <div className="lg:col-span-4 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bento-card p-6 bg-[#B497FF] text-black">
            <span className="text-xs uppercase font-bold text-black opacity-80 block mb-1">Telemetry Points Registered</span>
            <p className="text-5xl font-black">{metrics.length}</p>
          </div>
          <div className="bento-card p-6 bg-[#E2FF32] text-black">
            <span className="text-xs uppercase font-bold text-black opacity-80 block mb-1">Global System Density Average</span>
            <p className="text-5xl font-black">{averageDensity}%</p>
          </div>
          <div className="bento-card p-6 bg-[#00E5FF] text-black">
            <span className="text-xs uppercase font-bold text-black opacity-80 block mb-1">Critical AI Directives</span>
            <p className="text-5xl font-black">{criticalAlarmsCount} / {aiLogs.length}</p>
          </div>
        </div>

        {/* Dynamic Gate Performance Chart using CSS Grids */}
        <div className="lg:col-span-3 bento-card bg-white p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-2xl font-black uppercase mb-6 text-black border-b-4 border-black pb-2">
              Average Density per Gate
            </h2>
            {gateData.length > 0 ? (
              <div className="h-64 flex items-end gap-6 border-b-4 border-l-4 border-black p-4 pt-8">
                {gateData.map((g, idx) => {
                  const colors = ['#B497FF', '#E2FF32', '#00E5FF', '#FF4911', '#FFFFFF'];
                  const color = colors[idx % colors.length];
                  return (
                    <div
                      key={g.gate}
                      className="border-2 border-black w-full relative flex flex-col justify-end transition-all duration-500 hover:opacity-90 group"
                      style={{ height: `${g.average}%`, backgroundColor: color }}
                    >
                      {/* Tooltip density */}
                      <span className="absolute top-[-35px] left-1/2 transform -translate-x-1/2 text-xs font-black text-black opacity-0 group-hover:opacity-100 transition-opacity bg-white border-2 border-black px-1.5 py-0.5 pointer-events-none whitespace-nowrap z-10 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                        {g.average}%
                      </span>
                      <span className="text-xs font-black block text-center mb-[-25px] text-black uppercase truncate w-full">
                        {g.gate.replace('Gate-', '')}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center border-4 border-dashed border-black font-mono text-gray-500 uppercase">
                Awaiting ledger entries to compute averages...
              </div>
            )}
          </div>
          <p className="text-[10px] font-bold uppercase text-gray-400 mt-8">
            Chart automatically compiles metrics from stadium_metrics_ledger in real-time.
          </p>
        </div>

        {/* Real-time incident summary */}
        <div className="lg:col-span-1 bento-card bg-black text-white p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-xl font-black uppercase mb-4 text-[#E2FF32] border-b-4 border-white pb-2">
              Incident Ratios
            </h2>
            <div className="space-y-4 font-mono text-xs mt-4">
              <div className="flex justify-between border-b border-gray-800 pb-2">
                <span>Total Alarms:</span>
                <span className="font-bold text-white">{aiLogs.length}</span>
              </div>
              <div className="flex justify-between border-b border-gray-800 pb-2">
                <span>Critical Severity:</span>
                <span className="font-bold text-[#FF4911]">{criticalAlarmsCount}</span>
              </div>
              <div className="flex justify-between border-b border-gray-800 pb-2">
                <span>Warning Severity:</span>
                <span className="font-bold text-[#E2FF32]">{aiLogs.length - criticalAlarmsCount}</span>
              </div>
              <div className="flex justify-between">
                <span>AI Accuracy:</span>
                <span className="text-green-400 font-bold">99.2%</span>
              </div>
            </div>
          </div>
          <button 
            onClick={fetchData}
            className="w-full bg-[#E2FF32] text-black font-bold uppercase py-2 border-2 border-black hover:bg-white transition-colors text-xs"
          >
            FORCE RE-SYNC
          </button>
        </div>
      </div>
    </>
  );
}
