export interface RosoutMessage {
  timestamp: number;
  node: string;
  severity: number;
  message: string;
  file?: string;
  line?: number;
  function?: string;
  topics?: string[];
}

export interface FilterConfig {
  nodeNames: Set<string>;
  severityLevels: Set<number>;
  messageKeywords: string[];
  messageRegex: string;
  filterMode: 'OR' | 'AND';
  useRegex: boolean;
}

export const SEVERITY_NAMES: Record<number, string> = {
  1: 'DEBUG',
  2: 'INFO',
  4: 'WARN',
  8: 'ERROR',
  16: 'FATAL',
};

export const SEVERITY_COLORS: Record<number, string> = {
  1: 'text-gray-400',
  2: 'text-green-500',
  4: 'text-yellow-500',
  8: 'text-red-500',
  16: 'text-red-700 font-bold',
};

export const SEVERITY_BG_COLORS: Record<number, string> = {
  1: 'bg-gray-100',
  2: 'bg-green-50',
  4: 'bg-yellow-50',
  8: 'bg-red-50',
  16: 'bg-red-100',
};
