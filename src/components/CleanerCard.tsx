import React, { useState } from 'react';
import { CleanResult } from '../types';
import {
  Link2,
  Copy,
  Check,
  ExternalLink,
  Trash2,
  Sparkles,
  ClipboardPaste,
  AlertCircle,
  RefreshCw,
  Share2,
} from 'lucide-react';

interface CleanerCardProps {
  inputUrl: string;
  setInputUrl: (val: string) => void;
  result: CleanResult | null;
  loading: boolean;
  error: string | null;
  onConvert: (overrideUrl?: string) => Promise<void>;
  onReset: () => void;
  copied: boolean;
  onCopyText: (text: string) => void;
}

export const CleanerCard: React.FC<CleanerCardProps> = ({
  inputUrl,
  setInputUrl,
  result,
  loading,
  error,
  onConvert,
  onReset,
  copied,
  onCopyText,
}) => {
  const [justCopied, setJustCopied] = useState(false);

  const handleCopy = (text: string) => {
    onCopyText(text);
    setJustCopied(true);
    setTimeout(() => setJustCopied(false), 2000);
  };

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setInputUrl(text);
        onConvert(text);
      }
    } catch {
      const el = document.getElementById('threads-input') as HTMLInputElement | null;
      el?.focus();
    }
  };

  const isCopiedState = justCopied || copied;
  const displayCleanUrl = result?.cleanUrl || '';

  return (
    <div id="cleaner-card" className="space-y-4">
      {/* 原始貼網址的欄位 */}
      <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-4 shadow-xl">
        <div className="flex items-center justify-between mb-2">
          <label
            htmlFor="threads-input"
            className="text-xs font-semibold uppercase tracking-wider text-neutral-400"
          >
            原始網址
          </label>
          {inputUrl && (
            <button
              onClick={() => {
                setInputUrl('');
                onReset();
              }}
              className="text-xs text-neutral-500 hover:text-neutral-300 flex items-center gap-1 transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              清空
            </button>
          )}
        </div>

        <div className="relative">
          <textarea
            id="threads-input"
            rows={3}
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            placeholder="貼上 Threads 原始網址 (例如 https://www.threads.com/share/BAUrrPYy7i/)"
            className="w-full resize-none rounded-xl bg-neutral-950 border border-neutral-800 p-3.5 text-sm text-neutral-100 placeholder:text-neutral-600 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition font-mono leading-relaxed"
          />
        </div>

        {/* 快捷操作列 */}
        <div className="mt-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              id="paste-convert-btn"
              onClick={handlePasteFromClipboard}
              className="flex items-center gap-1.5 rounded-xl border border-neutral-700 bg-neutral-800 hover:bg-neutral-700 px-3.5 py-2 text-xs font-medium text-neutral-200 transition active:scale-95 shadow-sm"
            >
              <ClipboardPaste className="w-4 h-4 text-emerald-400" />
              貼上並轉換
            </button>

            <button
              id="sample-demo-btn"
              onClick={() => {
                const sample = 'https://www.threads.com/share/BAUrrPYy7i/';
                setInputUrl(sample);
                onConvert(sample);
              }}
              className="rounded-xl border border-neutral-800 bg-neutral-950 hover:bg-neutral-800 px-3 py-2 text-xs text-neutral-400 hover:text-neutral-200 transition"
            >
              帶入範例
            </button>
          </div>

          <button
            id="convert-submit-btn"
            disabled={loading || !inputUrl.trim()}
            onClick={() => onConvert()}
            className="flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-neutral-800 disabled:text-neutral-600 disabled:cursor-not-allowed px-4 py-2 text-xs font-semibold text-white transition active:scale-95 shadow-md"
          >
            {loading ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                解析中...
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                轉換
              </>
            )}
          </button>
        </div>

        {/* 錯誤提示 */}
        {error && (
          <div className="mt-3 flex items-start gap-2 rounded-xl bg-rose-950/40 border border-rose-900/60 p-3 text-xs text-rose-300">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* 最終純淨網址與大顆複製鍵 */}
      {result && (
        <div
          id="result-card"
          className="rounded-2xl bg-neutral-900 border border-neutral-800 p-5 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200"
        >
          {/* 純淨網址展示區 */}
          <div>
            <div className="flex items-center justify-between text-xs text-neutral-400 mb-2">
              <span className="font-semibold text-neutral-200 flex items-center gap-1.5">
                <Link2 className="w-4 h-4 text-emerald-400" />
                最終純淨網址
              </span>
              {result.username && (
                <span className="text-neutral-400 text-xs">
                  作者: <strong className="text-neutral-200 font-mono">@{result.username}</strong>
                </span>
              )}
            </div>

            <div className="rounded-xl bg-neutral-950 border border-neutral-800 p-3.5 font-mono text-sm text-emerald-400 break-all select-all font-medium leading-relaxed">
              {displayCleanUrl}
            </div>
          </div>

          {/* 大顆的複製鍵 */}
          <button
            id="big-copy-clean-url-btn"
            onClick={() => handleCopy(displayCleanUrl)}
            className={`w-full py-4 px-6 rounded-2xl flex items-center justify-center gap-2.5 text-base font-bold shadow-lg transition-all duration-150 active:scale-[0.98] ${
              isCopiedState
                ? 'bg-emerald-500 text-neutral-950 ring-2 ring-emerald-400'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white hover:shadow-emerald-900/20'
            }`}
          >
            {isCopiedState ? (
              <>
                <Check className="w-6 h-6 stroke-[2.5]" />
                <span>純淨網址已複製！</span>
              </>
            ) : (
              <>
                <Copy className="w-5 h-5" />
                <span>複製純淨網址</span>
              </>
            )}
          </button>

          {/* 次要輔助按鈕：開啟與分享 */}
          <div className="flex items-center justify-end gap-2 pt-1">
            <a
              href={displayCleanUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-neutral-200 px-3 py-1.5 rounded-lg hover:bg-neutral-800 transition"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              開啟網址
            </a>

            {typeof navigator !== 'undefined' && 'share' in navigator && (
              <button
                onClick={() => {
                  navigator.share?.({
                    title: '純淨 Threads 網址',
                    url: displayCleanUrl,
                  });
                }}
                className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-neutral-200 px-3 py-1.5 rounded-lg hover:bg-neutral-800 transition"
              >
                <Share2 className="w-3.5 h-3.5" />
                分享
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
