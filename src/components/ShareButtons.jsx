import { Copy, Send } from 'lucide-react';
import { copyText, shareOnWhatsApp } from '../lib/share.js';
import { useToast } from './ToastNotifications.jsx';

/** "Share on WhatsApp" plus a copy button. `getText` builds the message at click time. */
export default function ShareButtons({ getText, label = 'Share on WhatsApp', className = '', size = '' }) {
  const toast = useToast();

  const copy = async () => {
    const ok = await copyText(getText());
    if (ok) toast.success('Standings copied', { message: 'Paste them into any chat.' });
    else toast.error('Could not copy', { message: 'Your browser blocked the clipboard. Use Share on WhatsApp instead.' });
  };

  return (
    <div className={`flex gap-2 ${className}`}>
      <button type="button" className={`btn btn-outline min-w-0 flex-1 ${size}`} onClick={() => shareOnWhatsApp(getText())}>
        <Send size={14} strokeWidth={1.8} aria-hidden="true" />
        {label}
      </button>
      <button type="button" className={`btn btn-ghost shrink-0 !px-3.5 ${size}`} onClick={copy} aria-label="Copy standings as text" title="Copy as text">
        <Copy size={15} strokeWidth={1.8} aria-hidden="true" />
      </button>
    </div>
  );
}
