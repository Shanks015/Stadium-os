'use client';

export default function AnalyticsPage() {
  return (
    <>
      <h1 className="text-4xl font-black uppercase mb-8 border-b-4 border-black pb-4 inline-block text-black">
        Operational Analytics
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 max-w-7xl">
        {/* Metric Cards */}
        <div className="lg:col-span-4 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bento-card p-6 bg-[#B497FF] text-black">
            <span className="text-xs uppercase font-bold text-black opacity-80 block mb-1">Peak Attendance Time</span>
            <p className="text-5xl font-black">19:45 PM</p>
          </div>
          <div className="bento-card p-6 bg-[#E2FF32] text-black">
            <span className="text-xs uppercase font-bold text-black opacity-80 block mb-1">Average Flow Rate</span>
            <p className="text-5xl font-black">342/min</p>
          </div>
          <div className="bento-card p-6 bg-[#00E5FF] text-black">
            <span className="text-xs uppercase font-bold text-black opacity-80 block mb-1">AI Alarm Precision</span>
            <p className="text-5xl font-black">98.4%</p>
          </div>
        </div>

        {/* Charts using CSS Grids */}
        <div className="lg:col-span-3 bento-card bg-white p-6">
          <h2 className="text-2xl font-black uppercase mb-6 text-black border-b-4 border-black pb-2">
            Ingress Flow Rate (Last 6 Hours)
          </h2>
          <div className="h-64 flex items-end gap-6 border-b-4 border-l-4 border-black p-4">
            <div className="bg-[#B497FF] border-2 border-black w-full" style={{ height: '30%' }}>
              <span className="text-xs font-black block text-center mt-[-20px] text-black">16:00</span>
            </div>
            <div className="bg-[#E2FF32] border-2 border-black w-full" style={{ height: '50%' }}>
              <span className="text-xs font-black block text-center mt-[-20px] text-black">17:00</span>
            </div>
            <div className="bg-[#00E5FF] border-2 border-black w-full" style={{ height: '80%' }}>
              <span className="text-xs font-black block text-center mt-[-20px] text-black">18:00</span>
            </div>
            <div className="bg-[#FF4911] border-2 border-black w-full" style={{ height: '95%' }}>
              <span className="text-xs font-black block text-center mt-[-20px] text-black">19:00</span>
            </div>
            <div className="bg-[#B497FF] border-2 border-black w-full" style={{ height: '60%' }}>
              <span className="text-xs font-black block text-center mt-[-20px] text-black">20:00</span>
            </div>
            <div className="bg-white border-2 border-black w-full" style={{ height: '20%' }}>
              <span className="text-xs font-black block text-center mt-[-20px] text-black">21:00</span>
            </div>
          </div>
        </div>

        {/* System Diagnostics */}
        <div className="lg:col-span-1 bento-card bg-black text-white p-6">
          <h2 className="text-xl font-black uppercase mb-4 text-[#E2FF32] border-b-4 border-white pb-2">
            Diagnostics
          </h2>
          <div className="space-y-4 font-mono text-xs">
            <div className="flex justify-between border-b border-gray-800 pb-2">
              <span>Postgres latency:</span>
              <span className="text-green-400">14ms</span>
            </div>
            <div className="flex justify-between border-b border-gray-800 pb-2">
              <span>Websocket buffer:</span>
              <span className="text-green-400">0.02%</span>
            </div>
            <div className="flex justify-between border-b border-gray-800 pb-2">
              <span>Gemini RTT:</span>
              <span className="text-[#E2FF32]">840ms</span>
            </div>
            <div className="flex justify-between">
              <span>Memory usage:</span>
              <span className="text-green-400">42MB</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
