"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";

export function ChatPanel({ onSendMessage }: { onSendMessage: (msg: string) => void }) {
  const [msg, setMsg] = useState("");

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!msg.trim()) return;
    onSendMessage(msg);
    setMsg("");
  };

  return (
    <form onSubmit={handleSend} className="flex gap-2 w-full max-w-2xl mx-auto mt-6">
      <Input 
        value={msg} 
        onChange={e => setMsg(e.target.value)} 
        placeholder="E.g., Remove the CTA issue..." 
        className="flex-1"
      />
      <Button type="submit" className="bg-[#0A66C2] hover:bg-blue-700">
        <Send className="w-4 h-4 mr-2" /> Send
      </Button>
    </form>
  );
}
