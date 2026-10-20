import { useEffect, useRef, useState } from 'react';
import './StudioContactLinks.css';

type Contact = { label: string; href: string };
type CopyStatus = 'idle' | 'copying' | 'copied' | 'failed';

function copyWithSelection(text: string) {
  const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  const selection = window.getSelection();
  const ranges = selection ? Array.from({ length: selection.rangeCount }, (_, index) => selection.getRangeAt(index).cloneRange()) : [];
  const field = document.createElement('textarea');
  field.value = text;
  field.readOnly = true;
  field.tabIndex = -1;
  field.setAttribute('aria-hidden', 'true');
  field.style.cssText = 'position:fixed;left:-9999px;top:0;opacity:0;pointer-events:none';
  document.body.append(field);
  try {
    field.focus({ preventScroll: true });
    field.select();
    field.setSelectionRange(0, field.value.length);
    return document.execCommand('copy');
  } catch {
    return false;
  } finally {
    field.remove();
    try {
      selection?.removeAllRanges();
      ranges.forEach(range => selection?.addRange(range));
      if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
    } catch {
      // A selection can disappear while an async clipboard request is pending.
    }
  }
}

function ContactRow({ contact }: { contact: Contact }) {
  const [status, setStatus] = useState<CopyStatus>('idle');
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const request = useRef(0);

  useEffect(() => () => {
    request.current += 1;
    clearTimeout(timer.current);
  }, []);

  async function copy() {
    const attempt = ++request.current;
    clearTimeout(timer.current);
    setStatus('copying');
    let copied = false;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(contact.label);
        copied = true;
      }
    } catch {
      // The selection fallback also works on local HTTP and restricted contexts.
    }
    if (attempt !== request.current) return;
    if (!copied) copied = copyWithSelection(contact.label);
    setStatus(copied ? 'copied' : 'failed');
    timer.current = setTimeout(() => setStatus('idle'), copied ? 1800 : 4500);
  }

  const feedback = status === 'copied' ? `已复制 ${contact.label}`
    : status === 'failed' ? `未能复制 ${contact.label}，请选中联系方式手动复制。` : '';

  return <div className="studio-contact-row">
    <a className="studio-contact-link" href={contact.href} target={/^https?:/.test(contact.href) ? '_blank' : undefined} rel={/^https?:/.test(contact.href) ? 'noopener noreferrer' : undefined}>
      <span className="studio-contact-label">{contact.label}</span><span className="studio-contact-arrow" aria-hidden="true">↗</span>
    </a>
    <button className="studio-contact-copy" type="button" aria-label={`复制 ${contact.label}`} title={status === 'copied' ? '已复制' : '复制联系方式'} aria-busy={status === 'copying'} aria-disabled={status === 'copying'} onClick={() => { if (status !== 'copying') void copy(); }}>
      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {status === 'copied' ? <path d="m5 12 4 4L19 6" /> : <><rect x="8" y="8" width="12" height="12" rx="2" /><path d="M16 8V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h4" /></>}
      </svg>
    </button>
    <span className="studio-sr-only" role="status" aria-live="polite">{feedback}</span>
    {status === 'failed' && <span className="studio-contact-copy-error" aria-hidden="true">未能复制，可选中联系方式手动复制。</span>}
  </div>;
}

export default function StudioContactLinks({ contacts }: { contacts: Contact[] }) {
  return <div className="studio-contact-links studio-contact-links--copyable">
    {contacts.length ? contacts.map(contact => <ContactRow key={`${contact.label}-${contact.href}`} contact={contact} />)
      : <p className="studio-empty-field">联系信息待补充</p>}
  </div>;
}
