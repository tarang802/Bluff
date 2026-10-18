import { useRef } from 'react';
import { TriangleAlert } from 'lucide-react';
import Modal from './Modal.jsx';

/**
 * `config` is null when closed. The last config is kept so the dialog's
 * text doesn't vanish mid exit-animation. `config.warnings` (optional) lists
 * what will happen, shown in a warning card.
 */
export default function ConfirmationDialog({ config, onCancel, onConfirm }) {
  const last = useRef(config);
  if (config) last.current = config;
  const c = config ?? last.current ?? {};
  const cancelRef = useRef(null);

  return (
    <Modal
      open={Boolean(config)}
      onClose={onCancel}
      role="alertdialog"
      size="sm"
      eyebrow={c.eyebrow ?? 'A word before you deal'}
      title={c.title}
      description={c.message}
      initialFocusRef={cancelRef}
      footer={
        <>
          <button ref={cancelRef} type="button" className="btn btn-ghost flex-1 sm:flex-none" onClick={onCancel}>
            {c.cancelLabel ?? 'Not yet'}
          </button>
          <button
            type="button"
            className={`btn flex-1 sm:flex-none ${c.tone === 'danger' ? 'btn-wine' : 'btn-gold'}`}
            onClick={onConfirm}
          >
            {c.confirmLabel ?? 'Confirm'}
          </button>
        </>
      }
    >
      {c.warnings?.length > 0 && (
        <div className="border border-wine-bright/40 bg-wine/15 px-4 py-3.5">
          <p className="mb-2.5 flex items-center gap-2 font-caps text-[0.62rem] font-semibold tracking-[0.2em] text-[#f0b7c1] uppercase">
            <TriangleAlert size={14} strokeWidth={2} aria-hidden="true" />
            {c.warningTitle ?? 'What happens next'}
          </p>
          <ul className="space-y-2 text-sm leading-snug text-ivory/85">
            {c.warnings.map((w) => (
              <li key={w} className="flex gap-2.5">
                <span aria-hidden="true" className="mt-[0.45rem] h-1 w-1 shrink-0 rotate-45 bg-gold" />
                <span>{w}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Modal>
  );
}
