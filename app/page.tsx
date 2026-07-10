'use client';

import { useEffect, useState } from 'react';
import { supabaseClient as supabase } from './lib/supabase';
import AIOperationsTerminal from './components/AIOperationsTerminal';
import GateHeatmap from './components/GateHeatmap';
import Dropzone from './components/Dropzone';

export default function Home() {
  const [dbStatus, setDbStatus] = useState<'CONNECTED' | 'DISCONNECTED'>('DISCONNECTED');

  useEffect(() => {
    const testConnection = async () => {
      const { error } = await supabase.from('stadium_metrics_ledger').select('id').limit(1);
      if (!error) setDbStatus('CONNECTED');
    };
    testConnection();
  }, []);

  return (
    <>
      <h1 className="text-4xl font-black uppercase mb-8 border-b-4 border-black pb-4 inline-block text-black">
        Operations Control Center
      </h1>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 max-w-7xl">
        {/* 1. Operations Overview */}
        <section className="lg:col-span-4 bento-card flex flex-col md:flex-row bg-white">
          <div className="flex-1 p-6 border-b-4 md:border-b-0 md:border-r-4 border-black bg-[#B497FF] flex flex-col justify-center">
            <h3 className="font-bold text-xs uppercase mb-2 text-black">Total Stadium Capacity</h3>
            <p className="text-7xl font-black text-black">82,400</p>
          </div>
          <div className="flex-1 p-6 border-b-4 md:border-b-0 md:border-r-4 border-black bg-white flex flex-col justify-center">
            <h3 className="font-bold text-xs uppercase mb-2 text-gray-500">Active Gates</h3>
            <div className="flex items-center gap-4">
              <p className="text-5xl font-black text-black">4/4</p>
              <span className="material-symbols-outlined text-5xl text-green-500">door_front</span>
            </div>
          </div>
          <div className="flex-1 p-6 bg-black text-white flex flex-col justify-center">
            <h3 className="font-bold text-xs uppercase mb-4 text-gray-400">System Status</h3>
            <div className="flex items-center gap-4">
              <div className={`w-6 h-6 border-2 border-white pulse-dot rounded-none ${dbStatus === 'CONNECTED' ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className={`font-bold uppercase text-sm ${dbStatus === 'CONNECTED' ? 'text-green-400' : 'text-red-400'}`}>
                {dbStatus === 'CONNECTED' ? 'WEBSOCKET LIVE' : 'CONNECTING TO DB'}
              </span>
            </div>
          </div>
        </section>

        {/* 2. AI Reasoning Terminal */}
        <AIOperationsTerminal />

        {/* 3. Gate Heatmap */}
        <GateHeatmap />

        {/* 4. Dropzone */}
        <Dropzone />
      </div>
    </>
  );
}
