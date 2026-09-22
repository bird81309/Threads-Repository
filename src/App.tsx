/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { CleanResult } from './types';
import { PWAInstallBanner } from './components/PWAInstallBanner';
import { CleanerCard } from './components/CleanerCard';
import { AppleShortcutModal } from './components/AppleShortcutModal';
import { Apple } from 'lucide-react';

export default function App() {
  const [inputUrl, setInputUrl] = useState('');
  const [result, setResult] = useState<CleanResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showShortcutModal, setShowShortcutModal] = useState(false);

  // Register service worker on mount
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch((err) => {
        console.warn('SW registration failed:', err);
      });
    }
  }, []);

  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      if ('vibrate' in navigator) {
        navigator.vibrate?.([40, 60, 40]);
      }
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.warn('Clipboard write failed:', err);
    }
  }, []);

  // Main conversion function
  const handleConvert = useCallback(
    async (overrideInput?: string) => {
      const target = (overrideInput ?? inputUrl).trim();
      if (!target) return;

      setLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/clean', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: target }),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || '解析失敗，請確認是否為有效的 Threads 網址');
        }

        const resData: CleanResult = data.data;
        setResult(resData);

        // Auto copy to clipboard
        await copyToClipboard(resData.cleanUrl);
      } catch (err: any) {
        setError(err.message || '連線或轉換發生問題，請稍後再試');
      } finally {
        setLoading(false);
      }
    },
    [inputUrl, copyToClipboard]
  );

  // Handle incoming Web Share Target parameters (?url=... or ?text=...)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sharedUrl = params.get('url');
    const sharedText = params.get('text');
    const sharedTitle = params.get('title');

    const incoming = sharedUrl || sharedText || sharedTitle;

    if (incoming) {
      const decoded = decodeURIComponent(incoming);
      setInputUrl(decoded);
      // Clean query params from address bar without reloading
      window.history.replaceState({}, '', window.location.pathname);
      // Trigger automatic conversion
      handleConvert(decoded);
    } else {
      // Auto check clipboard if empty
      const checkClipboard = async () => {
        try {
          if (navigator.clipboard && navigator.clipboard.readText) {
            const text = await navigator.clipboard.readText();
            if (text && /threads\.(net|com)/i.test(text) && !inputUrl) {
              setInputUrl(text);
              handleConvert(text);
            }
          }
        } catch {
          // Ignore permission denial
        }
      };
      checkClipboard();
    }
  }, [handleConvert]);

  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : '';

  return (
    <div className="min-h-screen bg-[#0c0c0e] text-neutral-100 flex flex-col antialiased selection:bg-emerald-600/30 selection:text-white">
      {/* Top Header */}
      <header className="sticky top-0 z-40 w-full border-b border-neutral-800/80 bg-[#0c0c0e]/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-lg items-center justify-between px-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-neutral-800 text-white shadow-inner border border-neutral-700/60">
              <span className="font-bold text-sm tracking-tighter text-emerald-400">@</span>
            </div>
            <h1 className="text-sm font-bold tracking-tight text-white">
              Threads 網址轉換器
            </h1>
          </div>

          <button
            onClick={() => setShowShortcutModal(true)}
            className="flex items-center gap-1.5 rounded-lg border border-neutral-800 bg-neutral-900 hover:bg-neutral-800 px-2.5 py-1.5 text-xs text-neutral-400 hover:text-neutral-200 transition"
            title="iOS 捷徑設定教學"
          >
            <Apple className="w-3.5 h-3.5" />
            <span className="text-xs">iOS 捷徑</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 w-full max-w-lg mx-auto px-4 py-5 space-y-4">
        {/* PWA Install Notification */}
        <PWAInstallBanner />

        {/* Core Conversion Panel: Input + Clean URL + Big Copy Button */}
        <CleanerCard
          inputUrl={inputUrl}
          setInputUrl={setInputUrl}
          result={result}
          loading={loading}
          error={error}
          onConvert={handleConvert}
          onReset={() => {
            setResult(null);
            setError(null);
          }}
          copied={copied}
          onCopyText={copyToClipboard}
        />
      </main>

      {/* iOS Shortcuts Modal */}
      <AppleShortcutModal
        isOpen={showShortcutModal}
        onClose={() => setShowShortcutModal(false)}
        apiOrigin={currentOrigin}
      />
    </div>
  );
}
