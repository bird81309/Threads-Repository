import React, { useState } from 'react';
import { usePWAInstall } from './usePWAInstall';
import { Download, Share2, Smartphone, X, CheckCircle2, ChevronRight, HelpCircle } from 'lucide-react';

export const PWAInstallBanner: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  if (isInstalled) {
    return (
      <div id="pwa-installed-badge" className="flex items-center justify-between gap-2 px-3.5 py-2 rounded-xl bg-emerald-950/40 border border-emerald-800/40 text-emerald-400 text-xs">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>已安裝為應用程式，隨時可透過手機分享選單使用</span>
        </div>
        <button
          onClick={() => setShowGuide(true)}
          className="text-emerald-300 underline underline-offset-2 hover:text-emerald-200"
        >
          查看分享技巧
        </button>

        {showGuide && (
          <GuideModal onClose={() => setShowGuide(false)} isIOS={isIOS} />
        )}
      </div>
    );
  }

  return (
    <>
      <div id="pwa-install-banner" className="relative overflow-hidden rounded-2xl bg-neutral-900 border border-neutral-800 p-4 shadow-lg">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-neutral-800 text-white">
              <Smartphone className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-neutral-100 flex items-center gap-1.5">
                將此工具加到手機
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  一鍵分享即複製
                </span>
              </h4>
              <p className="text-xs text-neutral-400 mt-0.5">
                安裝後，在 Threads 點「分享」就會出現在選項中，點擊直接自動複製純淨網址！
              </p>
            </div>
          </div>
          <button
            onClick={() => setDismissed(true)}
            className="text-neutral-500 hover:text-neutral-300 p-1 -mr-1"
            title="暫時關閉"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          {isInstallable && (
            <button
              id="install-pwa-btn"
              onClick={install}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 px-3.5 py-2 text-xs font-medium text-white transition active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              立即安裝到手機
            </button>
          )}

          <button
            id="how-to-share-btn"
            onClick={() => setShowGuide(true)}
            className="flex items-center gap-1.5 rounded-lg border border-neutral-700 bg-neutral-800/80 hover:bg-neutral-800 px-3 py-2 text-xs font-medium text-neutral-200 transition"
          >
            <HelpCircle className="w-3.5 h-3.5 text-neutral-400" />
            {isIOS ? 'iPhone / iOS 設定教學' : '手機分享步驟說明'}
          </button>
        </div>
      </div>

      {showGuide && (
        <GuideModal onClose={() => setShowGuide(false)} isIOS={isIOS} />
      )}
    </>
  );
};

interface GuideModalProps {
  onClose: () => void;
  isIOS: boolean;
}

const GuideModal: React.FC<GuideModalProps> = ({ onClose, isIOS }) => {
  const [tab, setTab] = useState<'android' | 'ios'>(isIOS ? 'ios' : 'android');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-neutral-900 border border-neutral-800 p-5 shadow-2xl text-neutral-200 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-semibold text-white">手機一鍵分享教學</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:bg-neutral-800 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex rounded-lg bg-neutral-950 p-1 mt-4 border border-neutral-800">
          <button
            onClick={() => setTab('android')}
            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition ${
              tab === 'android' ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Android (Chrome)
          </button>
          <button
            onClick={() => setTab('ios')}
            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition ${
              tab === 'ios' ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-white'
            }`}
          >
            iPhone (iOS Safari / 捷徑)
          </button>
        </div>

        <div className="mt-4 space-y-3.5 text-xs text-neutral-300">
          {tab === 'android' ? (
            <>
              <div className="flex gap-3">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[11px]">
                  1
                </span>
                <div>
                  <p className="font-semibold text-white">安裝此 App</p>
                  <p className="text-neutral-400 mt-0.5">
                    在 Chrome 瀏覽器點擊網址列右側選單（三個點）➜ 選擇「安裝應用程式」或「加到主畫面」。
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[11px]">
                  2
                </span>
                <div>
                  <p className="font-semibold text-white">在 Threads 點「分享」</p>
                  <p className="text-neutral-400 mt-0.5">
                    打開 Threads App，瀏覽到任何貼文，點擊右下角的「分享」按鈕。
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[11px]">
                  3
                </span>
                <div>
                  <p className="font-semibold text-white">選擇【Threads轉換】</p>
                  <p className="text-neutral-400 mt-0.5">
                    在手機彈出的分享面板中選擇「Threads轉換」，App 會自動開啟、解除短網址追蹤，並直接將純淨網址複製到剪貼簿！
                  </p>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="flex gap-3">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[11px]">
                  1
                </span>
                <div>
                  <p className="font-semibold text-white">加到 iPhone 主畫面 (PWA)</p>
                  <p className="text-neutral-400 mt-0.5">
                    在 Safari 下方點擊「分享」圖示 ➜ 往下滾動選擇「加入主畫面」。
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[11px]">
                  2
                </span>
                <div>
                  <p className="font-semibold text-white">自動貼上與轉換</p>
                  <p className="text-neutral-400 mt-0.5">
                    在 Threads 複製分享連結後，點開主畫面的 App，點選「讀取剪貼簿」即可自動取得純淨連結並再次複製。
                  </p>
                </div>
              </div>

              <div className="rounded-xl bg-neutral-950 border border-neutral-800 p-3 mt-2">
                <p className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                  💡 iOS 分享選單小撇步
                </p>
                <p className="text-[11px] text-neutral-400 mt-1 leading-relaxed">
                  iOS 可搭配「捷徑」App，設定分享表單接收 URL 並呼叫此轉換 API，即可在 Threads 分享選單中一鍵自動處理！
                </p>
              </div>
            </>
          )}
        </div>

        <button
          onClick={onClose}
          className="mt-5 w-full rounded-xl bg-neutral-800 hover:bg-neutral-700 py-2.5 text-xs font-medium text-white transition"
        >
          我知道了
        </button>
      </div>
    </div>
  );
};
