export interface PaperSummary {
  id: string;
  title: string;
  authors: string[];
  category?: string;
  abstract?: string;
  updated?: string;
  url: string;
  pdfUrl: string;
}

export interface Paper extends PaperSummary {
  submitted?: string;
  version?: string;
  keywords: string[];
}

export interface SearchResult {
  total: number;
  papers: PaperSummary[];
  queryUrl: string;
}
