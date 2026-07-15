import { Injectable } from '@nestjs/common';

// Service pur de parsing CSV : convertit un buffer CSV en tableau d'objets.
// Testable isolément sans DB ni queue.
@Injectable()
export class CsvParserService {
  parse(buffer: Buffer): Record<string, unknown>[] {
    const content = buffer.toString('utf-8');
    const lines = content.split('\n').filter((line) => line.trim() !== '');

    if (lines.length === 0) {
      return [];
    }

    const headers = this.parseCsvLine(lines[0]);
    const rows: Record<string, unknown>[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = this.parseCsvLine(lines[i]);
      const row: Record<string, unknown> = {};

      for (let j = 0; j < headers.length; j++) {
        const header = headers[j];
        const value = values[j] ?? '';
        row[header] = value;
      }

      rows.push(row);
    }

    return rows;
  }

  private parseCsvLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }

    result.push(current.trim());
    return result;
  }
}
