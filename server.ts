import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Helper to extract first valid URL from arbitrary text
function extractUrl(input: string): string | null {
  if (!input) return null;
  const match = input.match(/https?:\/\/[^\s<>"']+/i);
  return match ? match[0] : null;
}

// Function to resolve short URL and strip tracking params
async function resolveAndCleanThreadsUrl(rawInput: string) {
  const extracted = extractUrl(rawInput);
  if (!extracted) {
    throw new Error('未在輸入內容中找到有效的網址');
  }

  let currentUrl = extracted;
  let isShortUrl = false;
  let resolvedUrl = extracted;
  const removedParams: string[] = [];

  // Check if it's a Threads short link (e.g., threads.net/t/... or threads.com/share/... or threads.net/share/...)
  const isThreadsShort = /threads\.(net|com)\/(share|t)\/[a-zA-Z0-9_-]+/i.test(currentUrl);

  if (isThreadsShort) {
    isShortUrl = true;
    try {
      // Follow redirects to find the target post
      const response = await fetch(currentUrl, {
        method: 'GET',
        redirect: 'follow',
        headers: {
          'User-Agent':
            'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'zh-TW,zh;q=0.9,en-US;q=0.8,en;q=0.7',
        },
        signal: AbortSignal.timeout(8000),
      });

      resolvedUrl = response.url;

      // If redirected to post page, we have our URL
      if (!resolvedUrl.includes('/post/')) {
        // Fallback: Inspect HTML content for canonical link or og:url
        const html = await response.text();
        const ogUrlMatch = html.match(/<meta\s+property=["']og:url["']\s+content=["']([^"']+)["']/i);
        const canonicalMatch = html.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i);

        if (ogUrlMatch && ogUrlMatch[1]) {
          resolvedUrl = ogUrlMatch[1];
        } else if (canonicalMatch && canonicalMatch[1]) {
          resolvedUrl = canonicalMatch[1];
        }
      }
    } catch (err: any) {
      console.warn('Redirect resolution encountered an issue:', err.message);
      // Fallback: keep current URL if network/timeout occurs
    }
  }

  // Parse resolved or input URL
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(resolvedUrl);
  } catch {
    parsedUrl = new URL(currentUrl);
  }

  // Collect removed query params
  for (const [key] of parsedUrl.searchParams.entries()) {
    removedParams.push(key);
  }

  // Build clean URL (protocol + host + pathname without trailing slash)
  const cleanPath = parsedUrl.pathname.replace(/\/+$/, '');
  const cleanUrl = `${parsedUrl.protocol}//${parsedUrl.host}${cleanPath}`;

  // Extract username and post ID if present
  let username: string | null = null;
  let postId: string | null = null;

  // Format: /@username/post/POST_ID or /@username
  const postMatch = cleanPath.match(/\/@([^\/]+)\/post\/([^\/]+)/);
  if (postMatch) {
    username = postMatch[1];
    postId = postMatch[2];
  } else {
    const userMatch = cleanPath.match(/\/@([^\/]+)/);
    if (userMatch) {
      username = userMatch[1];
    }
  }

  return {
    originalInput: rawInput,
    extractedUrl: extracted,
    resolvedUrl,
    cleanUrl,
    isShortUrl,
    domain: parsedUrl.host,
    username,
    postId,
    removedParams,
  };
}

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Clean URL Endpoint (GET & POST supported)
app.all('/api/clean', async (req, res) => {
  const input =
    (req.method === 'POST' ? req.body?.url || req.body?.text : null) ||
    (req.query?.url as string) ||
    (req.query?.text as string);

  if (!input || typeof input !== 'string') {
    return res.status(400).json({
      success: false,
      error: '請提供要轉換的 Threads 網址或分享文字 (url 或 text)',
    });
  }

  try {
    const result = await resolveAndCleanThreadsUrl(input.trim());
    return res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    return res.status(422).json({
      success: false,
      error: error.message || '網址解析失敗，請確認是否為有效的 Threads 連結',
    });
  }
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
