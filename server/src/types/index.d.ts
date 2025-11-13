// Shared types
export type Side = 'A' | 'B';

export interface Argument {
  id: string;
  caseId: string;
  side: Side;
  text: string;
  createdAt: Date;
}

export interface Verdict {
  id: string;
  caseId: string;
  argumentId: string;
  verdict: string;
  reasoning: string;
  createdAt: Date;
}

export interface Case {
  id: string;
  title: string;
  description?: string;
  context?: string; // from uploaded file or raw text
  arguments: Argument[];
  verdicts: Verdict[];
  createdAt: Date;
  updatedAt: Date;
}
