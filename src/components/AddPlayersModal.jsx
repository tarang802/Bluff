import { useEffect, useId, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus, X } from 'lucide-react';
import Modal from './Modal.jsx';
import { Avatar } from './Ornaments.jsx';
import { MAX_NAME_LENGTH, MAX_PLAYERS, MIN_PLAYERS, pad2 } from '../lib/game.js';

export default function AddPlayersModal({ open, onClose, players, scores, inProgress, onAdd, onRemove }) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const inputRef = useRef(null);
  const inputId = useId();
  const errorId = useId();
  const full = players.length >= MAX_PLAYERS;
  const needed = Math.max(0, MIN_PLAYERS - players.length);

  useEffect(() => {
    if (open) {
      setName('');
      setError('');
      setNotice('');
    }
  }, [open]);

  const submit = (e) => {
    e.preventDefault();
    const result = onAdd(name);
    if (result.ok) {
      setName('');
      setError('');
      setNotice(`${result.name} takes a seat.`);
    } else {
      setError(result.error);
      setNotice('');
    }
    inputRef.current?.focus();
  };

  // Mid-game removals go through a confirmation in App; before the first
  // round they happen at once.
  const remove = (id) => {
    const result = onRemove(id);
    if (result?.removed) {
      setError('');
      setNotice(`${result.name} left the table.`);
      inputRef.current?.focus();
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      eyebrow={inProgress ? 'Game in progress' : 'Seat the table'}
      title="Add or Remove Players"
      description={
        inProgress
          ? 'Latecomers can pull up a chair at 0 points. Anyone leaving takes their points with them; their rounds stay in the history.'
          : `Seat between ${MIN_PLAYERS} and ${MAX_PLAYERS} friends. Press Enter to add each name quickly.`
      }
      initialFocusRef={inputRef}
      footer={
        <>
          <p className="mr-auto font-caps text-[0.62rem] tracking-[0.2em] text-smoke uppercase">
            <span className="text-gold-bright">{players.length}</span> / {MAX_PLAYERS} seated
          </p>
          <button type="button" className={`btn ${needed === 0 ? 'btn-gold' : 'btn-ghost'}`} onClick={onClose}>
            {needed === 0 ? 'Take Your Seats' : 'Done'}
          </button>
        </>
      }
    >
      <form onSubmit={submit} className="flex gap-2" noValidate>
        <label htmlFor={inputId} className="sr-only">
          Player name
        </label>
        <input
          ref={inputRef}
          id={inputId}
          className="input-luxe flex-1"
          placeholder={full ? 'The table is full' : 'Player name'}
          value={name}
          maxLength={MAX_NAME_LENGTH + 5}
          autoComplete="off"
          autoCapitalize="words"
          enterKeyHint="done"
          spellCheck={false}
          disabled={full}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? errorId : undefined}
          onChange={(e) => {
            setName(e.target.value);
            if (error) setError('');
          }}
        />
        <button type="submit" className="btn btn-gold shrink-0 !px-4 sm:!px-5" disabled={full}>
          <Plus size={16} strokeWidth={2} aria-hidden="true" />
          <span className="hidden sm:inline">Add Player</span>
          <span className="sm:hidden">Add</span>
        </button>
      </form>
      <p id={errorId} aria-live="polite" className={`mt-2 min-h-5 text-sm ${error ? 'text-[#f0a3b1]' : 'text-gold-bright/90'}`}>
        {error || notice}
      </p>

      <div className="mt-3">
        <div className="mb-2 flex items-center justify-between">
          <p className="eyebrow text-[0.58rem] text-smoke">At the table</p>
          {needed > 0 && (
            <p className="text-xs text-ash">
              {needed} more {needed === 1 ? 'player' : 'players'} to start
            </p>
          )}
        </div>

        {players.length === 0 ? (
          <p className="border border-dashed border-ivory/10 px-4 py-8 text-center font-display text-lg text-ash italic">
            No one has sat down yet.
          </p>
        ) : (
          <ol className="divide-y divide-ivory/6 border-y border-ivory/6">
            <AnimatePresence initial={false}>
              {players.map((p, i) => (
                <motion.li
                  key={p.id}
                  layout="position"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <div className="flex items-center gap-3 py-2.5">
                    <span className="w-6 font-caps text-[0.6rem] tracking-[0.15em] text-ash">{pad2(i + 1)}</span>
                    <Avatar name={p.name} size="sm" />
                    <span className="min-w-0 flex-1 truncate text-ivory/90">{p.name}</span>
                    {inProgress && (
                      <span className="font-caps text-[0.58rem] tracking-[0.18em] text-ash uppercase">
                        <span className="text-ivory/70">{scores.get(p.id) ?? 0}</span> pts
                      </span>
                    )}
                    <button type="button" className="icon-btn" aria-label={`Remove ${p.name}`} title="Remove player" onClick={() => remove(p.id)}>
                      <X size={16} strokeWidth={1.7} />
                    </button>
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </ol>
        )}
      </div>
    </Modal>
  );
}
