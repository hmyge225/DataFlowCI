export interface DashboardData {
  totalImports: number;
  successCount: number;
  partialCount: number;
  failedCount: number;
  avgProcessingTime: number;
  topSources: Array<{
    sourceId: string;
    sourceName: string;
    count: number;
  }>;
  importsByDay: Array<{
    date: string;
    count: number;
  }>;
}
