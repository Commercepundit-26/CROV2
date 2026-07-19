"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function AuditForm({ onSubmit, isLoading }: { onSubmit: (data: any) => void, isLoading: boolean }) {
  const [clientUrl, setClientUrl] = useState("");
  const [competitorUrls, setCompetitorUrls] = useState<string[]>([""]);
  const [customInstructions, setCustomInstructions] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ clientUrl, competitorUrls: competitorUrls.filter(u => u), customInstructions });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-xl mx-auto bg-white p-8 rounded-xl shadow-sm border">
      <div>
        <label className="block text-sm font-medium mb-2 text-gray-700">Client Website URL</label>
        <Input required type="url" placeholder="https://example.com" value={clientUrl} onChange={e => setClientUrl(e.target.value)} />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2 text-gray-700">Competitor URLs (Optional)</label>
        {competitorUrls.map((url, i) => (
          <div key={i} className="flex mb-2 gap-2">
            <Input type="url" placeholder="https://competitor.com" value={url} onChange={e => {
              const newUrls = [...competitorUrls];
              newUrls[i] = e.target.value;
              setCompetitorUrls(newUrls);
            }} />
            {i === competitorUrls.length - 1 && (
              <Button type="button" variant="outline" onClick={() => setCompetitorUrls([...competitorUrls, ""])}>+</Button>
            )}
          </div>
        ))}
      </div>

      <div>
        <label className="block text-sm font-medium mb-2 text-gray-700">Custom Instructions (Optional)</label>
        <Textarea placeholder="E.g., Focus specifically on mobile checkout..." value={customInstructions} onChange={e => setCustomInstructions(e.target.value)} />
      </div>

      <Button type="submit" disabled={isLoading} className="w-full bg-[#0A66C2] hover:bg-blue-700 text-white">
        {isLoading ? "Starting Audit..." : "Generate Audit"}
      </Button>
    </form>
  );
}
