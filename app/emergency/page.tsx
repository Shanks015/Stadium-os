'use client';

import { useState } from 'react';

export default function EmergencyPage() {
  const [panicActive, setPanicActive] = useState(false);
  const [evacRoute, setEvacRoute] = useState('Route Alpha (North Gate)');

  return (
    <>
      <h1 className="text-4xl font-black uppercase mb-8 border-b-4 border-black pb-4 inline-block text-black">
        Emergency & Safety Control
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 max-w-7xl">
        {/* Panic Button */}
        <div className="lg:col-span-2 bento-card bg-white p-6 flex flex-col justify-between items-center text-center">
          <div>
            <h2 className="text-2xl font-black uppercase mb-2 text-black">
              Manual Emergency Broadcast
            </h2>
            <p className="text-xs font-bold text-gray-500 uppercase">
              Simulates a panic push that bypasses all validation and routes directly to database operations logs.
            </p>
          </div>

          <button
            onClick={() => setPanicActive(prev => !prev)}
            className={`w-48 h-48 rounded-full border-8 border-black text-black font-black uppercase tracking-tighter text-xl transition-all shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] active:translate-x-2 active:translate-y-2 active:shadow-none my-6 ${
              panicActive ? 'bg-[#FF4911] text-white animate-pulse' : 'bg-red-500'
            }`}
          >
            {panicActive ? 'SHUTTING DOWN' : 'TRIGGER EMERGENCY'}
          </button>

          <span className="text-xs font-bold text-black uppercase">
            Status: {panicActive ? 'EMERGENCY SHUTDOWN ACTIVE' : 'SYSTEM STANDBY'}
          </span>
        </div>

        {/* Evacuation plan */}
        <div className="lg:col-span-2 bento-card bg-black text-white p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-2xl font-black uppercase mb-4 text-[#E2FF32] border-b-4 border-white pb-2">
              Evacuation Routing
            </h2>

            <div className="space-y-4 mt-6">
              {['Route Alpha (North Gate)', 'Route Beta (East Gate)', 'Route Gamma (South Gate)'].map((route) => (
                <div
                  key={route}
                  onClick={() => setEvacRoute(route)}
                  className={`p-4 border-4 border-white cursor-pointer uppercase font-bold text-sm ${
                    evacRoute === route ? 'bg-[#E2FF32] text-black' : 'bg-gray-900 text-white'
                  }`}
                >
                  {route}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 p-4 bg-gray-900 border-2 border-white text-xs font-mono text-green-400">
            &gt; EVACUATION PROTOCOL SELECTED: {evacRoute.toUpperCase()}
          </div>
        </div>
      </div>
    </>
  );
}
