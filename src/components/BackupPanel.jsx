import { useRef } from 'react';
import { Download, Smartphone, Upload } from 'lucide-react';
import { SectionTitle } from './Ornaments.jsx';

/** Save every game to a file, or bring one back (merged, never overwritten). */
export default function BackupPanel({ onBackup, onRestoreFile, onInstall, showInstall }) {
  const fileRef = useRef(null);

  return (
    <section aria-labelledby="backup-title">
      <SectionTitle id="backup-title" eyebrow="The Vault" title="BACKUP & RESTORE" suit="♥" />
      <div className="panel frame-corners px-5 py-6 sm:px-7">
        <p className="max-w-xl text-sm leading-relaxed text-smoke">
          Scores live only on this phone. Save a backup file to keep them safe, or restore one on a new phone. Restoring
          merges with what&apos;s here — nothing is deleted.
        </p>
        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <button type="button" className="btn btn-outline flex-1 sm:flex-none" onClick={onBackup}>
            <Download size={15} strokeWidth={1.8} aria-hidden="true" />
            Save Backup
          </button>
          <button type="button" className="btn btn-ghost flex-1 sm:flex-none" onClick={() => fileRef.current?.click()}>
            <Upload size={15} strokeWidth={1.8} aria-hidden="true" />
            Restore from File
          </button>
          {showInstall && (
            <button type="button" className="btn btn-gold flex-1 sm:flex-none" onClick={onInstall}>
              <Smartphone size={15} strokeWidth={1.8} aria-hidden="true" />
              Install App
            </button>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              e.target.value = ''; // allow picking the same file again
              if (file) onRestoreFile(file);
            }}
          />
        </div>
      </div>
    </section>
  );
}
