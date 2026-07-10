'use client';

import { useState, useCallback } from 'react';

interface GateState {
  id: string;
  status: 'OPEN' | 'LOCKED';
  bg: string;
}

/**
 * GateControlPage — physical gates state administration dashboard.
 * Simulates direct security locks and global lockdown overrides.
 */
export default function GateControlPage() {
  const [gates, setGates] = useState<GateState[]>([
    { id: 'Gate-A', status: 'OPEN', bg: '#B497FF' },
    { id: 'Gate-B', status: 'OPEN', bg: '#E2FF32' },
    { id: 'Gate-C', status: 'LOCKED', bg: '#FF4911' },
    { id: 'Gate-D', status: 'OPEN', bg: '#00E5FF' },
  ]);

  const toggleGate = useCallback((id: string) => {
    setGates((prev) =>
      prev.map((gate) => {
        if (gate.id === id) {
          const nextStatus = gate.status === 'OPEN' ? 'LOCKED' : 'OPEN';
          return {
            ...gate,
            status: nextStatus,
            bg: nextStatus === 'LOCKED' ? '#FF4911' : '#E2FF32',
          };
        }
        return gate;
      })
    );
  }, []);

  const forceLockAll = useCallback(() => {
    setGates((prev) =>
      prev.map((g) => ({ ...g, status: 'LOCKED', bg: '#FF4911' }))
    );
  }, []);

  const releaseAllGates = useCallback(() => {
    setGates((prev) =>
      prev.map((g) => ({ ...g, status: 'OPEN', bg: '#E2FF32' }))
    );
  }, []);

  return (
    <>
      <h1 className="text-4xl font-black uppercase mb-8 border-b-4 border-black pb-4 inline-block text-black">
        Physical Gate Control
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 max-w-7xl">
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
          {gates.map((gate) => (
            <div
              key={gate.id}
              className="bento-card p-6 flex flex-col justify-between min-h-48"
              style={{ backgroundColor: gate.bg }}
            >
              <div className="flex justify-between items-start text-black">
                <h3 className="text-3xl font-black uppercase">{gate.id}</h3>
                <span className="px-3 py-1 font-bold text-xs uppercase border-2 border-black bg-white" role="status">
                  {gate.status}
                </span>
              </div>

              <button
                onClick={() => toggleGate(gate.id)}
                aria-label={`Toggle lock state of ${gate.id}`}
                className="w-fit bg-black text-white hover:bg-white hover:text-black transition-colors font-bold uppercase text-xs px-6 py-3 border-4 border-black mt-6"
              >
                TOGGLE {gate.status === 'OPEN' ? 'LOCKDOWN' : 'UNLOCK'}
              </button>
            </div>
          ))}
        </div>

        <div className="lg:col-span-1 bento-card bg-black text-white p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-xl font-black uppercase mb-4 text-[#E2FF32] border-b-4 border-white pb-2">
              Safety Override
            </h2>
            <p className="text-xs font-bold text-gray-400 mb-6 uppercase">
              Immediately locks or unlocks all entry points across the stadium perimeter.
            </p>

            <button
              onClick={forceLockAll}
              aria-label="Force lock all gates"
              className="w-full bg-[#FF4911] text-white font-black uppercase py-4 border-4 border-white mb-4 hover:translate-x-1 hover:translate-y-1 transition-all"
            >
              FORCE LOCK ALL
            </button>
            <button
              onClick={releaseAllGates}
              aria-label="Release lockdown on all gates"
              className="w-full bg-white text-black font-black uppercase py-4 border-4 border-black hover:translate-x-1 hover:translate-y-1 transition-all"
            >
              RELEASE ALL GATES
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
