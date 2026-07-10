'use client';

import { useState, useMemo } from 'react';

export default function SectorsPage() {
  const [activeSector, setActiveSector] = useState('Alpha');

  const sectors = [
    { name: 'Alpha', capacity: '24,500', guards: 12, cameras: 8, status: 'NORMAL', bg: '#B497FF' },
    { name: 'Beta', capacity: '18,200', guards: 8, cameras: 6, status: 'NORMAL', bg: '#E2FF32' },
    { name: 'Gamma', capacity: '22,400', guards: 15, cameras: 10, status: 'WARNING', bg: '#00E5FF' },
    { name: 'Delta', capacity: '17,300', guards: 6, cameras: 4, status: 'NORMAL', bg: '#FFFFFF' },
  ];

  const activeSectorData = useMemo(() => {
    return sectors.find(s => s.name === activeSector) || sectors[0];
  }, [activeSector]);

  return (
    <>
      <h1 className="text-4xl font-black uppercase mb-8 border-b-4 border-black pb-4 inline-block text-black">
        Stadium Sectors Map
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 max-w-7xl">
        {/* Left: Sectors List */}
        <div className="lg:col-span-2 space-y-4">
          {sectors.map((sec) => (
            <div
              key={sec.name}
              onClick={() => setActiveSector(sec.name)}
              className={`p-6 bento-card cursor-pointer transition-all ${
                activeSector === sec.name ? 'translate-x-2' : ''
              }`}
              style={{ backgroundColor: sec.bg }}
            >
              <div className="flex justify-between items-start text-black">
                <div>
                  <h2 className="text-3xl font-black uppercase">Sector {sec.name}</h2>
                  <p className="font-bold text-sm uppercase mt-1">Capacity: {sec.capacity}</p>
                </div>
                <span className={`px-3 py-1 font-bold text-xs uppercase border-2 border-black ${
                  sec.status === 'WARNING' ? 'bg-[#FF4911] text-white animate-pulse' : 'bg-white text-black'
                }`}>
                  {sec.status}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Right: Detailed Live View */}
        <div className="lg:col-span-2 bento-card bg-black text-white p-6 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center border-b-4 border-white pb-4 mb-6">
              <h3 className="text-2xl font-black uppercase tracking-tighter text-[#E2FF32]">
                Sector {activeSector} Telemetry
              </h3>
              <span className="material-symbols-outlined text-3xl text-green-400">videocam</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white text-black border-2 border-white p-4">
                <span className="text-xs text-gray-500 uppercase font-bold block">Active Guards</span>
                <p className="text-4xl font-black">
                  {activeSectorData.guards} Units
                </p>
              </div>
              <div className="bg-white text-black border-2 border-white p-4">
                <span className="text-xs text-gray-500 uppercase font-bold block">CCTV Feeds</span>
                <p className="text-4xl font-black">
                  {activeSectorData.cameras} Online
                </p>
              </div>
            </div>

            {/* Mock Video Feed */}
            <div className="mt-6 border-4 border-white aspect-video bg-gray-900 flex items-center justify-center relative overflow-hidden">
              <div className="absolute top-4 left-4 bg-red-600 text-white font-bold px-2 py-1 text-xs uppercase animate-pulse border border-black">
                LIVE - CAM 0{activeSectorData.cameras}
              </div>
              <p className="text-gray-500 font-mono text-xs select-none uppercase">
                [NO INCIDENTS DETECTED IN SECTOR {activeSector}]
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
