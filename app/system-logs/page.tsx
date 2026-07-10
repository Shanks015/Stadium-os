'use client';

import { useEffect, useState } from 'react';
import { supabaseClient as supabase } from '../lib/supabase';

export default function SystemLogsPage() {
  const [metrics, setMetrics] = useState<any[]>([]);
  const [aiLogs, setAiLogs] = useState<any[]>([]);

  useEffect(() => {
    const fetchLogs = async () => {
      const { data: metricsData } = await supabase
        .from('stadium_metrics_ledger')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(10);
      if (metricsData) setMetrics(metricsData);

      const { data: aiData } = await supabase
        .from('stadium_ai_ops_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      if (aiData) setAiLogs(aiData);
    };

    fetchLogs();
  }, []);

  return (
    <>
      <h1 className="text-4xl font-black uppercase mb-8 border-b-4 border-black pb-4 inline-block text-black">
        Terminal Logs
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 max-w-7xl">
        {/* Gate metrics */}
        <div className="lg:col-span-2 bento-card bg-white p-6 text-black">
          <h2 className="text-2xl font-black uppercase mb-4 border-b-4 border-black pb-2">
            Raw Telemetry Ledger
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead>
                <tr className="border-b-2 border-black uppercase font-bold text-gray-500">
                  <th className="py-2">Gate</th>
                  <th className="py-2">Density</th>
                  <th className="py-2">Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {metrics.map((log) => (
                  <tr key={log.id} className="border-b border-gray-200">
                    <td className="py-2 font-bold">{log.gate_id}</td>
                    <td className="py-2">{log.crowd_density}%</td>
                    <td className="py-2 text-[10px]">{log.timestamp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* AI Action scripts */}
        <div className="lg:col-span-2 bento-card bg-black text-white p-6">
          <h2 className="text-2xl font-black uppercase mb-4 text-[#E2FF32] border-b-4 border-white pb-2">
            AI Operations Log
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead>
                <tr className="border-b-2 border-white uppercase font-bold text-gray-400">
                  <th className="py-2">Gate</th>
                  <th className="py-2">Severity</th>
                  <th className="py-2">Reasoning</th>
                </tr>
              </thead>
              <tbody>
                {aiLogs.map((log) => (
                  <tr key={log.id} className="border-b border-gray-800">
                    <td className="py-2 font-bold text-[#E2FF32]">{log.gate_id}</td>
                    <td className={`py-2 font-bold ${log.severity?.toUpperCase() === 'CRITICAL' ? 'text-[#FF4911]' : 'text-white'}`}>
                      {log.severity}
                    </td>
                    <td className="py-2 text-gray-300 max-w-[200px] truncate">{log.reasoning}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
