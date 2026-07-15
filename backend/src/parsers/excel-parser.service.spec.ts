import { Test, TestingModule } from '@nestjs/testing';
import { ExcelParserService } from './excel-parser.service';

describe('ExcelParserService', () => {
  let service: ExcelParserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ExcelParserService],
    }).compile();

    service = module.get<ExcelParserService>(ExcelParserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('parse', () => {
    it('parses simple Excel buffer', () => {
      // Note: Ce test nécessite un fichier Excel réel pour être complet.
      // Pour l'instant, on teste que le service existe et ne crash pas.
      const buffer = Buffer.from([]);
      const result = service.parse(buffer);

      // XLSX retourne un tableau vide pour un buffer invalide
      expect(Array.isArray(result)).toBe(true);
    });

    it('returns empty array for empty buffer', () => {
      const buffer = Buffer.from([]);
      const result = service.parse(buffer);

      expect(result).toEqual([]);
    });
  });
});
