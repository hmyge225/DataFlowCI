import { Test, TestingModule } from '@nestjs/testing';
import { CsvParserService } from './csv-parser.service';

describe('CsvParserService', () => {
  let service: CsvParserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CsvParserService],
    }).compile();

    service = module.get<CsvParserService>(CsvParserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('parse', () => {
    it('parses simple CSV without quotes', () => {
      const csv = 'name,age\nJohn,25\nJane,30';
      const buffer = Buffer.from(csv);
      const result = service.parse(buffer);

      expect(result).toEqual([
        { name: 'John', age: '25' },
        { name: 'Jane', age: '30' },
      ]);
    });

    it('parses CSV with quoted fields', () => {
      const csv = 'name,description\nJohn,"Hello, world"\nJane,"Test, comma"';
      const buffer = Buffer.from(csv);
      const result = service.parse(buffer);

      expect(result).toEqual([
        { name: 'John', description: 'Hello, world' },
        { name: 'Jane', description: 'Test, comma' },
      ]);
    });

    it('handles empty lines', () => {
      const csv = 'name,age\n\nJohn,25\n\nJane,30\n';
      const buffer = Buffer.from(csv);
      const result = service.parse(buffer);

      expect(result).toEqual([
        { name: 'John', age: '25' },
        { name: 'Jane', age: '30' },
      ]);
    });

    it('returns empty array for empty CSV', () => {
      const csv = '';
      const buffer = Buffer.from(csv);
      const result = service.parse(buffer);

      expect(result).toEqual([]);
    });

    it('handles CSV with only headers', () => {
      const csv = 'name,age';
      const buffer = Buffer.from(csv);
      const result = service.parse(buffer);

      expect(result).toEqual([]);
    });

    it('handles trailing commas', () => {
      const csv = 'name,age,\nJohn,25,\nJane,30,';
      const buffer = Buffer.from(csv);
      const result = service.parse(buffer);

      expect(result).toEqual([
        { name: 'John', age: '25', '': '' },
        { name: 'Jane', age: '30', '': '' },
      ]);
    });
  });
});
