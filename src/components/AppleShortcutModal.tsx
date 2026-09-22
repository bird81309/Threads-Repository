import React, { useState } from 'react';
import { Apple, Copy, Check, X, ExternalLink, Zap } from 'lucide-react';

interface AppleShortcutModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiOrigin: string;
}

export const AppleShortcutModal: React.FC<AppleShortcutModalProps> = ({
  isOpen,
  onClose,
  apiOrigin,
}) => {
  const [copiedUrl, setCopiedUrl] = useState(false);

  if (!isOpen) return null;

  const endpointUrl = `${apiOrigin}/api/clean?url=`;

  const copyEndpoint = () => {
    navigator.clipboard.writeText(endpointUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl bg-neutral-900 border border-neutral-800 p-5 shadow-2xl text-neutral-200 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <Apple className="w-5 h-5 text-white" />
            <h3 className="text-base font-semibold text-white">iPhone / iPad iOS 捷徑配置</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:bg-neutral-800 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-4 space-y-3.5 text-xs text-neutral-300">
          <p className="text-neutral-300 leading-relaxed">
            在 iOS 上，您可以建立一個「分享表單捷徑」，在 Threads 點選分享時直接選該捷徑，系統將全自動獲取純淨網址並複製到 iPhone 剪貼簿！
          </p>

          <div className="rounded-xl bg-neutral-950 border border-neutral-800 p-3 space-y-2">
            <div className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" />
              捷徑設定 3 步驟（只需 30 秒）：
            </div>
            <ol className="list-decimal list-inside space-y-2 text-neutral-400 pl-1">
              <li>
                打開 iPhone 的 <strong className="text-neutral-200">「捷徑」App</strong> ➜ 點右上角 <strong className="text-neutral-200">+ 新增捷徑</strong>。
              </li>
              <li>
                點選捷徑下方的詳細資訊（<strong className="text-neutral-200">ⓘ</strong>）➜ 開啟 <strong className="text-neutral-200">「在分享表單中顯示」</strong>。
              </li>
              <li>
                加入以下 3 個動作：
                <div className="mt-2 ml-4 space-y-1.5 text-[11px] font-mono text-neutral-300 bg-neutral-900 p-2.5 rounded-lg border border-neutral-800">
                  <div className="text-emerald-400">1. 取得網址的內容 (Get Contents of URL):</div>
                  <div className="text-neutral-400 truncate pl-3">
                    URL: {endpointUrl}[捷徑輸入]
                  </div>
                  <div className="text-emerald-400 mt-1">2. 取得字典值 (Get Dictionary Value):</div>
                  <div className="text-neutral-400 pl-3">鍵: <code className="text-white">data.cleanUrl</code></div>
                  <div className="text-emerald-400 mt-1">3. 拷貝至剪貼簿 (Copy to Clipboard)</div>
                </div>
              </li>
            </ol>
          </div>

          <div className="rounded-xl bg-neutral-950 p-3 border border-neutral-800 flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <div className="text-[11px] text-neutral-500">API 請求端點網址：</div>
              <div className="font-mono text-xs text-emerald-400 truncate">{endpointUrl}</div>
            </div>
            <button
              onClick={copyEndpoint}
              className="flex items-center gap-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 px-3 py-1.5 text-xs text-neutral-200 shrink-0 transition"
            >
              {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedUrl ? '已複製' : '複製 API'}
            </button>
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-5 w-full rounded-xl bg-neutral-800 hover:bg-neutral-700 py-2.5 text-xs font-medium text-white transition"
        >
          完成
        </button>
      </div>
    </div>
  );
};
