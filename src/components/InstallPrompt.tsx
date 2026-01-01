import { useEffect, useState } from 'react';

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 rounded-xl bg-slate-900 text-white p-4 shadow-lg flex items-center justify-between">
      <div className="text-sm">
        <div className="font-semibold">Install NexVeris</div>
        <div className="opacity-80">Add to home screen for app-like access</div>
      </div>
      <button
        className="ml-4 px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-sm"
        onClick={async () => {
          deferredPrompt.prompt();
          const choice = await deferredPrompt.userChoice;
          if (choice.outcome === 'accepted') {
            setVisible(false);
          }
        }}
      >
        Install
      </button>
    </div>
  );
}
