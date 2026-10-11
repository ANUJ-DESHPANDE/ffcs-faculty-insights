import { VerificationPreview } from '@/components/verification-preview';
export default function VerificationLab() {
  return <main className="page-wrap"><div className="page-intro"><span className="eyebrow">RESEARCH PREVIEW</span><h1>Explore a safer verification flow.</h1><p>This local experiment helps identify course and faculty names in text you choose to paste. It does not verify enrollment or save anything.</p></div><div className="context-note"><strong>Privacy first</strong><p>Never paste a password, session token, registration number, grades or another student’s details. Redact personal information before trying this. The text stays in this browser tab and disappears when you leave.</p></div><VerificationPreview /></main>;
}
