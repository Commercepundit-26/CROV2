export async function startAudit(clientUrl: string, competitorUrls: string[], customInstructions: string) {
  const res = await fetch('/api/audit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ clientUrl, competitorUrls, customInstructions })
  });
  if (!res.ok) throw new Error('Failed to start audit');
  return res.json();
}

export async function getAuditStatus(id: string) {
  const res = await fetch(`/api/audit?id=${id}`);
  if (!res.ok) throw new Error('Failed to get status');
  return res.json();
}

export async function sendChatMessage(id: string, action: string, payload: any) {
  const res = await fetch(`/api/audit/${id}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, payload })
  });
  if (!res.ok) throw new Error('Failed to send message');
  return res.json();
}
