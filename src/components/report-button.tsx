'use client';
import { useState } from 'react';
export function ReportButton({ reviewId }: { reviewId: string }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('spam');
  const [message, setMessage] = useState('');
  async function report() {
    const response = await fetch('/api/reports', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ reviewId, reason }) });
    if (response.status === 401) { setMessage('Sign in to report this review.'); return; }
    setMessage(response.ok ? 'Report sent to moderators. Thank you.' : 'Could not send this report.');
    if (response.ok) setOpen(false);
  }
  return <div className="report-control">{!open && <button type="button" className="text-link" onClick={() => setOpen(true)}>Report</button>}{open && <div><label>Reason <select value={reason} onChange={e => setReason(e.target.value)}><option value="spam">Spam</option><option value="harassment">Harassment</option><option value="private_info">Private information</option><option value="other">Other</option></select></label><button type="button" onClick={report}>Send report</button><button type="button" onClick={() => setOpen(false)}>Cancel</button></div>}{message && <small role="status">{message}</small>}</div>;
}
