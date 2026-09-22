export interface CleanResult {
  originalInput: string;
  extractedUrl: string;
  resolvedUrl: string;
  cleanUrl: string;
  isShortUrl: boolean;
  domain: string;
  username: string | null;
  postId: string | null;
  removedParams: string[];
  timestamp?: number;
}

export interface HistoryItem extends CleanResult {
  id: string;
  timestamp: number;
}
