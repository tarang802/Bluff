import { useState } from 'react';
import { Check, Copy, EllipsisVertical, Menu, Share, SquarePlus } from 'lucide-react';
import Modal from './Modal.jsx';
import { copyText } from '../lib/share.js';

const Icon = ({ as: As }) => <As size={14} strokeWidth={2} className="mx-0.5 inline-block align-[-2px] text-gold-bright" aria-hidden="true" />;

// Where the "install / add to home screen" option lives on each phone and browser.
const GUIDES = {
  'android-chrome': {
    title: 'Chrome on Android',
    steps: [
      <>Tap the <Icon as={EllipsisVertical} /> menu at the top-right.</>,
      <>Tap <strong>Install app</strong> (or <strong>Add to Home screen</strong>).</>,
      <>Tap <strong>Install</strong>. Bluff Night appears with your apps.</>,
    ],
  },
  'android-samsung': {
    title: 'Samsung Internet',
    steps: [
      <>Tap the <Icon as={Menu} /> menu at the bottom-right.</>,
      <>Tap <strong>Add page to</strong>, then <strong>Home screen</strong>.</>,
      <>Tap <strong>Add</strong>.</>,
    ],
  },
  'android-firefox': {
    title: 'Firefox on Android',
    steps: [
      <>Tap the <Icon as={EllipsisVertical} /> menu.</>,
      <>Tap <strong>Install</strong> (or <strong>Add to Home screen</strong>).</>,
      <>Confirm with <strong>Add</strong>.</>,
    ],
  },
  'android-inapp': {
    title: 'Opened inside WhatsApp or another app',
    note: "This page is open inside another app's built-in browser, which can't install apps. Open it in Chrome first.",
    steps: [
      <>Tap the <Icon as={EllipsisVertical} /> menu at the top-right.</>,
      <>Tap <strong>Open in Chrome</strong> (or <strong>Open in browser</strong>).</>,
      <>In Chrome, tap <strong>Install App</strong> again.</>,
    ],
    copyLink: true,
  },
  'ios-safari': {
    title: 'Safari on iPhone or iPad',
    steps: [
      <>Tap the <Icon as={Share} /> <strong>Share</strong> button (bottom of the screen on iPhone, top on iPad).</>,
      <>Scroll down and tap <Icon as={SquarePlus} /> <strong>Add to Home Screen</strong>.</>,
      <>Tap <strong>Add</strong>. Open Bluff Night from your home screen from now on.</>,
    ],
  },
  'ios-other': {
    title: 'Chrome or Firefox on iPhone',
    steps: [
      <>Tap the <Icon as={Share} /> <strong>Share</strong> button in the address bar or menu.</>,
      <>Tap <Icon as={SquarePlus} /> <strong>Add to Home Screen</strong>, then <strong>Add</strong>.</>,
      <>Don&apos;t see it? Open this page in <strong>Safari</strong> and use Share there.</>,
    ],
    copyLink: true,
  },
  'ios-inapp': {
    title: 'Opened inside WhatsApp or another app',
    note: "This page is open inside another app's built-in browser, which can't add it to your home screen. Open it in Safari first.",
    steps: [
      <>Tap <strong>Open in Safari</strong> (the compass, or the <Icon as={EllipsisVertical} /> / ⋯ menu).</>,
      <>In Safari, tap <Icon as={Share} /> <strong>Share</strong>.</>,
      <>Tap <Icon as={SquarePlus} /> <strong>Add to Home Screen</strong>, then <strong>Add</strong>.</>,
    ],
    copyLink: true,
  },
  'desktop-chromium': {
    title: 'Chrome or Edge on a computer',
    steps: [
      <>Click the install icon at the right end of the address bar.</>,
      <>Or open the <Icon as={EllipsisVertical} /> menu and choose <strong>Install Bluff Night</strong> (under <em>Cast, save and share</em> in Chrome).</>,
    ],
  },
  'desktop-safari': {
    title: 'Safari on a Mac',
    steps: [<>In the menu bar choose <strong>File → Add to Dock</strong>.</>],
  },
  'desktop-other': {
    title: 'This browser',
    note: "This browser can't install web apps. Open the page in Chrome, Edge or Safari, or on your phone.",
    steps: [],
    copyLink: true,
  },
};

export default function InstallGuide({ open, onClose, platform }) {
  const guide = GUIDES[platform] ?? GUIDES['desktop-other'];
  const [copied, setCopied] = useState(false);

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="sm"
      eyebrow="Install the app"
      title="Put Bluff Night on your home screen"
      description="It opens full-screen like an app, works without internet, and keeps your scores safer."
      footer={
        <button type="button" className="btn btn-gold w-full sm:w-auto" onClick={onClose}>
          Got it
        </button>
      }
    >
      <p className="eyebrow mb-3 text-[0.58rem] text-smoke">{guide.title}</p>
      {guide.note && <p className="notice mb-4 px-4 py-3 text-sm leading-relaxed text-ivory/85">{guide.note}</p>}
      {guide.steps.length > 0 && (
        <ol className="space-y-3">
          {guide.steps.map((step, i) => (
            <li key={i} className="card flex items-start gap-3 px-4 py-3">
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-gold/50 font-display text-sm font-semibold text-gold-bright">
                {i + 1}
              </span>
              <span className="pt-0.5 text-sm leading-relaxed text-ivory/90">{step}</span>
            </li>
          ))}
        </ol>
      )}
      {guide.copyLink && (
        <button
          type="button"
          className="btn btn-outline mt-4 w-full"
          onClick={async () => {
            if (await copyText(window.location.origin)) {
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }
          }}
        >
          {copied ? <Check size={15} aria-hidden="true" /> : <Copy size={15} aria-hidden="true" />}
          {copied ? 'Link copied' : 'Copy the link'}
        </button>
      )}
    </Modal>
  );
}
