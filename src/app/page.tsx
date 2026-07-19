"use client";

import { useState, useEffect } from "react";
import { AuditForm } from "@/components/AuditForm";
import { IssueSummary } from "@/components/IssueSummary";
import { ChatPanel } from "@/components/ChatPanel";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { startAudit, getAuditStatus, sendChatMessage } from "@/lib/api";
import { DownloadCloud } from "lucide-react";

export default function Home() {
  const [jobId, setJobId] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("");
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    if (!jobId || status === "completed" || status === "failed") return;

    const interval = setInterval(async () => {
      try {
        const job = await getAuditStatus(jobId);
        setStatus(job.status);
        setProgress(job.progress);
        if (job.status === "completed") {
          setResult(job.result);
        } else if (job.status === "failed") {
          alert("Audit failed. Check console.");
        }
      } catch (err) {
        console.error(err);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [jobId, status]);

  const handleStartAudit = async (data: any) => {
    try {
      setStatus("pending");
      setProgress(0);
      setResult(null);
      const res = await startAudit(data.clientUrl, data.competitorUrls, data.customInstructions);
      setJobId(res.jobId);
      
      // Frontend orchestration: Drive the steps explicitly to bypass QStash/Vercel background timeouts
      try {
        await fetch('/api/worker/crawl', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ jobId: res.jobId }) });
        await fetch('/api/worker/analyze', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ jobId: res.jobId }) });
        await fetch('/api/worker/generate', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ jobId: res.jobId }) });
      } catch (stepErr) {
        console.error("Pipeline step failed:", stepErr);
      }
    } catch (err) {
      alert("Failed to start audit.");
    }
  };

  const handleChat = async (msg: string) => {
    if (!jobId) return;
    await sendChatMessage(jobId, 'chat', { message: msg });
    alert("Chat instruction sent!");
  };

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900 pb-20">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-[#0A66C2]">CRO-X</h1>
          <span className="text-sm font-medium text-gray-500">Commerce Pundit</span>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 mt-12">
        {!jobId && (
          <div>
            <div className="text-center mb-10">
              <h2 className="text-4xl font-extrabold tracking-tight mb-4">Start a new CRO Audit</h2>
              <p className="text-gray-500 text-lg">Generate deterministic, evidence-backed insights in minutes.</p>
            </div>
            <AuditForm onSubmit={handleStartAudit} isLoading={status === 'pending'} />
          </div>
        )}

        {jobId && status !== 'completed' && status !== 'failed' && (
          <div className="max-w-xl mx-auto text-center mt-20">
            <h3 className="text-2xl font-bold mb-6 text-gray-800">
              {status === 'crawling' ? 'Crawling pages...' : status === 'analyzing' ? 'Running heuristics...' : status === 'generating' ? 'Building presentation...' : 'Initializing...'}
            </h3>
            <Progress value={progress} className="h-4 w-full bg-gray-200" />
            <p className="mt-4 text-gray-500 font-medium">{progress}% Complete</p>
          </div>
        )}

        {status === 'completed' && result && (
          <div className="mt-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex justify-between items-end mb-8 border-b pb-4">
              <div>
                <h2 className="text-3xl font-bold">Audit Completed</h2>
                <p className="text-gray-500 mt-2">Found {result.issues?.length || 0} optimization opportunities.</p>
              </div>
              <Button onClick={() => window.open(result.downloadUrl, '_blank')} className="bg-[#0A66C2] hover:bg-blue-700 text-white" size="lg">
                <DownloadCloud className="w-5 h-5 mr-2" /> Download PPT
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {result.issues?.map((issue: any, idx: number) => (
                <IssueSummary key={idx} issue={issue} />
              ))}
            </div>

            <div className="mt-16 bg-white p-6 rounded-xl border shadow-sm text-center">
              <h3 className="text-lg font-bold mb-2">Want to refine the presentation?</h3>
              <p className="text-gray-500 mb-4">Use the chat below to instruct the AI engine to modify the slides.</p>
              <ChatPanel onSendMessage={handleChat} />
            </div>
            
            <div className="mt-8 text-center">
              <Button variant="ghost" onClick={() => { setJobId(null); setStatus(""); }}>Start a New Audit</Button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
