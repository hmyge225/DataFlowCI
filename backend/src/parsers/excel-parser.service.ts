import { Injectable } from '@nestjs/common';
import * as XLSX from 'xlsx';

// Service pur de parsing Excel : convertit un buffer Excel en tableau d'objets.
// Testable isolément sans DB ni queue.
@Injectable()
export class ExcelParserService {
  parse(buffer: Buffer): Record<string, unknown>[] {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];

    if (!sheetName) {
      return [];
    }

    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, {
      defval: '',
    });

    return jsonData as Record<string, unknown>[];
  }
}
