'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import AIOperationsTerminal from './components/AIOperationsTerminal';
import GateHeatmap from './components/GateHeatmap';
import Dropzone from './components/Dropzone';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export default function Home() {
  const [dbStatus, setDbStatus] = useState<'CONNECTED' | 'DISCONNECTED'>('DISCONNECTED');

  useEffect(() => {
    const testConnection = async () => {
      const { data, error } = await supabase.from('stadium_metrics_ledger').select('id').limit(1);
      if (!error) setDbStatus('CONNECTED');
    };
    testConnection();
  }, []);

  return (
    <div className="flex pt-16 min-h-screen">
      {/* Top Navigation */}
      <header className="w-full h-16 border-b-4 border-black bg-[#F4F4F0] flex justify-between items-center px-8 fixed top-0 left-0 z-50 shadow-[0_4px_0_0_#000]">
        <div className="flex items-center gap-8 h-full">
          <span className="font-bold tracking-widest text-black uppercase">STADIUM OS v1.0</span>
          <nav className="hidden md:flex h-full items-end gap-6 pb-1">
            <a className="text-black border-b-4 border-black pb-1 uppercase font-bold text-sm" href="#">Operations</a>
            <a className="text-gray-500 uppercase hover:bg-gray-200 transition-colors px-2 py-1 font-bold text-sm" href="#">Sectors</a>
            <a className="text-gray-500 uppercase hover:bg-gray-200 transition-colors px-2 py-1 font-bold text-sm" href="#">Security</a>
            <a className="text-gray-500 uppercase hover:bg-gray-200 transition-colors px-2 py-1 font-bold text-sm" href="#">Analytics</a>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <button className="w-8 h-8 flex items-center justify-center hover:bg-gray-200 border-2 border-black"><span className="material-symbols-outlined text-black">notifications</span></button>
          <button className="w-8 h-8 flex items-center justify-center hover:bg-gray-200 border-2 border-black"><span className="material-symbols-outlined text-black">settings</span></button>
          <div aria-label="Administrator profile" className="w-8 h-8 bg-black border-2 border-black"></div>
        </div>
      </header>

      {/* Side Navigation */}
      <aside className="hidden md:flex flex-col h-screen border-r-4 border-black pt-16 w-64 fixed left-0 top-0 bg-[#F4F4F0] z-40">
        <div className="p-6 border-b-4 border-black bg-[#E2FF32]">
          <h2 className="text-2xl font-black uppercase text-black">SECTOR ALPHA</h2>
          <div className="flex items-center gap-2 mt-2 font-bold text-xs uppercase text-black">
            <span className="w-3 h-3 bg-green-500 rounded-none pulse-dot border border-black"></span>
            <span>Live Stream Enabled</span>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto">
          <a className="flex items-center gap-4 px-6 py-4 bg-black text-white border-b-2 border-black hover:bg-[#E2FF32] hover:text-black transition-colors uppercase font-bold text-sm group" href="#">
            <span className="material-symbols-outlined group-hover:text-black">dashboard</span> Dashboard
          </a>
          <a className="flex items-center gap-4 px-6 py-4 text-black border-b-2 border-black hover:bg-[#E2FF32] hover:text-black transition-colors uppercase font-bold text-sm group" href="#">
            <span className="material-symbols-outlined group-hover:text-black">door_front</span> Gate Control
          </a>
          <a className="flex items-center gap-4 px-6 py-4 text-black border-b-2 border-black hover:bg-[#E2FF32] hover:text-black transition-colors uppercase font-bold text-sm group" href="#">
            <span className="material-symbols-outlined group-hover:text-black">psychology</span> Crowd AI
          </a>
          <a className="flex items-center gap-4 px-6 py-4 text-black border-b-2 border-black hover:bg-[#E2FF32] hover:text-black transition-colors uppercase font-bold text-sm group" href="#">
            <span className="material-symbols-outlined group-hover:text-black text-[#FF4911]">emergency_home</span> Emergency
          </a>
          <a className="flex items-center gap-4 px-6 py-4 text-black border-b-2 border-black hover:bg-[#E2FF32] hover:text-black transition-colors uppercase font-bold text-sm group" href="#">
            <span className="material-symbols-outlined group-hover:text-black">terminal</span> System Logs
          </a>
        </nav>
        <div className="p-4 border-t-4 border-black bg-white">
          <a className="flex items-center justify-center gap-4 px-6 py-4 text-black hover:bg-black hover:text-white transition-colors border-4 border-black font-bold uppercase text-sm" href="#">
            <span className="material-symbols-outlined">logout</span> Logout
          </a>
        </div>
      </aside>

      {/* Main Content */}
      <main className="w-full md:ml-64 p-8 overflow-y-auto bg-[#F4F4F0]">
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
      </main>
    </div>
  );
}
