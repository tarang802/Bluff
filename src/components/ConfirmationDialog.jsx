import { useRef } from 'react';
import Modal from './Modal.jsx';

/**
 * `config` is null when closed. The last config is kept so the dialog's
 * text doesn't vanish mid exit-animation.
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
    />
  );
}
