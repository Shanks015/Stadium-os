'use client';

import { useState } from 'react';

export default function SecurityPage() {
  const [agents, setAgents] = useState([
    { id: 'SEC-101', name: 'Officer Miller', zone: 'Sector Alpha', status: 'ACTIVE', bg: '#B497FF' },
    { id: 'SEC-102', name: 'Officer Chen', zone: 'Sector Beta', status: 'ON_BREAK', bg: '#E2FF32' },
    { id: 'SEC-103', name: 'Officer Davis', zone: 'Sector Gamma', status: 'DISPATCHED', bg: '#00E5FF' },
  ]);

  const [dispatchZone, setDispatchZone] = useState('Sector Alpha');

  const handleDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    setAgents(prev => [
      ...prev,
      {
        id: `SEC-${Math.floor(100 + Math.random() * 900)}`,
        name: 'Officer Recruited',
        zone: dispatchZone,
        status: 'DISPATCHED',
        bg: '#FFFFFF'
      }
    ]);
  };

  return (
    <>
      <h1 className="text-4xl font-black uppercase mb-8 border-b-4 border-black pb-4 inline-block text-black">
        Security Operations
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 max-w-7xl">
        {/* Officers list */}
        <div className="lg:col-span-2 bento-card bg-white p-6">
          <h2 className="text-2xl font-black uppercase mb-4 text-black border-b-4 border-black pb-2">
            Active Roster
          </h2>
          <div className="space-y-4">
            {agents.map((agent) => (
              <div
                key={agent.id}
                className="p-4 border-4 border-black flex justify-between items-center text-black"
                style={{ backgroundColor: agent.bg }}
              >
                <div>
                  <h3 className="font-black text-lg uppercase">{agent.name}</h3>
                  <p className="text-xs font-bold uppercase">{agent.id} | {agent.zone}</p>
                </div>
                <span className={`px-2 py-1 font-bold text-xs uppercase border-2 border-black bg-white`}>
                  {agent.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Dispatch terminal */}
        <div className="lg:col-span-2 bento-card bg-black text-white p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-2xl font-black uppercase mb-4 text-[#E2FF32] border-b-4 border-white pb-2">
              Dispatch Terminal
            </h2>
            <form onSubmit={handleDispatch} className="space-y-6">
              <div>
                <label className="text-xs font-bold uppercase text-gray-400 block mb-2">
                  Target Zone
                </label>
                <select
                  value={dispatchZone}
                  onChange={(e) => setDispatchZone(e.target.value)}
                  className="w-full p-3 border-4 border-white bg-white text-black font-bold uppercase"
                >
                  <option>Sector Alpha</option>
                  <option>Sector Beta</option>
                  <option>Sector Gamma</option>
                  <option>Sector Delta</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-[#E2FF32] text-black font-black uppercase py-4 border-4 border-white shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
              >
                DISPATCH SECURITY TEAM
              </button>
            </form>
          </div>

          <div className="mt-8 p-4 bg-gray-900 border-2 border-white font-mono text-xs text-[#00E5FF]">
            &gt; WAITING FOR TELEMETRY...<br />
            &gt; SYSTEM SECURE.
          </div>
        </div>
      </div>
    </>
  );
}
