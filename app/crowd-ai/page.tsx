'use client';

export default function CrowdAiPage() {
  const modelConfig = {
    model: 'gemini-2.5-flash',
    role: 'Stadium Operations Director',
    temperature: 0.1,
    mimeType: 'application/json',
  };

  const systemPrompt = `You are a Stadium Operations Director. Analyze the following high-density gate data:
Gate ID: {{gate_id}}
Crowd Density: {{crowd_density}}%
Timestamp: {{timestamp}}

You must return a strict JSON structure exactly matching this schema:
{
  "severity": "High" | "Critical",
  "reasoning": "Explanation of why the action is needed",
  "action_script": { "type": "string", "details": "action details" }
}`;

  return (
    <>
      <h1 className="text-4xl font-black uppercase mb-8 border-b-4 border-black pb-4 inline-block text-black">
        Generative AI Configuration
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 max-w-7xl">
        {/* Model Configurations */}
        <div className="lg:col-span-2 bento-card bg-white p-6">
          <h2 className="text-2xl font-black uppercase mb-4 text-black border-b-4 border-black pb-2">
            Active LLM Model
          </h2>
          <div className="space-y-4">
            {Object.entries(modelConfig).map(([key, val]) => (
              <div key={key} className="flex justify-between items-center border-b-2 border-black py-2 font-body-md text-black">
                <span className="font-bold uppercase text-xs text-gray-500">{key}</span>
                <span className="font-mono text-sm">{val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Prompt configuration */}
        <div className="lg:col-span-2 bento-card bg-black text-white p-6 flex flex-col">
          <h2 className="text-2xl font-black uppercase mb-4 text-[#E2FF32] border-b-4 border-white pb-2">
            System Prompt Template
          </h2>
          <pre className="bg-gray-900 border-2 border-white p-4 font-mono text-xs overflow-x-auto text-green-400 whitespace-pre-wrap flex-1">
            {systemPrompt}
          </pre>
        </div>
      </div>
    </>
  );
}
