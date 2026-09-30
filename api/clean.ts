// Helper to extract specifically the Threads share or post link from arbitrary shared text
function extractUrl(input: string): string | null {
  if (!input) return null;

  // 1. 優先精準抓取 Threads 分享短網址 (threads.net/share/..., threads.com/share/..., threads.net/t/...)
  const shareMatch = input.match(/https?:\/\/(www\.)?threads\.(net|com)\/(share|t)\/[a-zA-Z0-9_-]+/i);
  if (shareMatch) {
    return shareMatch[0];
  }

  // 2. 其次抓取 Threads 原始貼文網址 (threads.net/@user/post/...)
  const postMatch = input.match(/https?:\/\/(www\.)?threads\.(net|com)\/@[^\s<>"'\/]+\/post\/[a-zA-Z0-9_-]+/i);
  if (postMatch) {
    return postMatch[0];
  }

  // 3. 再次抓取任何 Threads 網域連結 (threads.net 或 threads.com)
  const anyThreadsMatch = input.match(/https?:\/\/(www\.)?threads\.(net|com)[^\s<>"']*/i);
  if (anyThreadsMatch) {
    return anyThreadsMatch[0];
  }

  // 4. 最後退回一般網址比對
  const fallbackMatch = input.match(/https?:\/\/[^\s<>"']+/i);
  return fallbackMatch ? fallbackMatch[0] : null;
}

// Function to resolve short URL and strip tracking params
async function resolveAndCleanThreadsUrl(rawInput: string) {
  const extracted = extractUrl(rawInput);
  if (!extracted) {
    throw new Error('未在輸入內容中找到有效的 Threads 網址');
  }

  let currentUrl = extracted;
  let isShortUrl = false;
  let resolvedUrl = extracted;
  const removedParams: string[] = [];

  const isThreadsShort = /threads\.(net|com)\/(share|t)\/[a-zA-Z0-9_-]+/i.test(currentUrl);

  if (isThreadsShort) {
    isShortUrl = true;
    try {
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

      if (!resolvedUrl.includes('/post/')) {
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
    }
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(resolvedUrl);
  } catch {
    parsedUrl = new URL(currentUrl);
  }

  for (const [key] of parsedUrl.searchParams.entries()) {
    removedParams.push(key);
  }

  const cleanPath = parsedUrl.pathname.replace(/\/+$/, '');
  const cleanUrl = `${parsedUrl.protocol}//${parsedUrl.host}${cleanPath}`;

  let username: string | null = null;
  let postId: string | null = null;

  const matchPost = cleanPath.match(/\/@([^\/]+)\/post\/([^\/]+)/);
  if (matchPost) {
    username = matchPost[1];
    postId = matchPost[2];
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

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const body = req.body;
  const parsedBody = typeof body === 'string' ? JSON.parse(body || '{}') : body;

  const input =
    (req.method === 'POST' ? parsedBody?.url || parsedBody?.text : null) ||
    req.query?.url ||
    req.query?.text;

  if (!input || typeof input !== 'string') {
    return res.status(400).json({
      success: false,
      error: '請提供要轉換的 Threads 網址或分享文字 (url 或 text)',
    });
  }

  try {
    const result = await resolveAndCleanThreadsUrl(input.trim());
    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    return res.status(422).json({
      success: false,
      error: error.message || '網址解析失敗，請確認是否為有效的 Threads 連結',
    });
  }
}
