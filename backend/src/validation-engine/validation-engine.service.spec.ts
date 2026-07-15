import { Test, TestingModule } from '@nestjs/testing';
import { ValidationEngineService } from './validation-engine.service';
import type { ValidationSchema } from './interfaces/validation-error.interface';

describe('ValidationEngineService', () => {
  let service: ValidationEngineService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ValidationEngineService],
    }).compile();

    service = module.get<ValidationEngineService>(ValidationEngineService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validate', () => {
    const schema: ValidationSchema = {
      fields: [
        {
          name: 'email',
          type: 'string',
          required: true,
          pattern: '^\\S+@\\S+\\.\\S+$',
        },
        { name: 'age', type: 'integer', required: true, min: 0, max: 120 },
        { name: 'isActive', type: 'boolean', required: false },
        {
          name: 'status',
          type: 'enum',
          required: true,
          enum: ['active', 'inactive'],
        },
        { name: 'createdAt', type: 'date', required: true },
      ],
    };

    it('returns empty array for valid row', () => {
      const row = {
        email: 'test@example.com',
        age: 25,
        isActive: true,
        status: 'active',
        createdAt: '2024-01-01',
      };
      const errors = service.validate(schema, row);
      expect(errors).toEqual([]);
    });

    it('validates required fields', () => {
      const row = { email: 'test@example.com' };
      const errors = service.validate(schema, row);
      expect(errors.length).toBeGreaterThan(0);
      expect(
        errors.some((e) => e.column === 'age' && e.message.includes('requis')),
      ).toBe(true);
      expect(
        errors.some(
          (e) => e.column === 'status' && e.message.includes('requis'),
        ),
      ).toBe(true);
      expect(
        errors.some(
          (e) => e.column === 'createdAt' && e.message.includes('requis'),
        ),
      ).toBe(true);
    });

    it('validates type string', () => {
      const row = {
        email: 123,
        age: 25,
        status: 'active',
        createdAt: '2024-01-01',
      };
      const errors = service.validate(schema, row);
      expect(
        errors.some(
          (e) => e.column === 'email' && e.message.includes('chaîne'),
        ),
      ).toBe(true);
    });

    it('validates type integer', () => {
      const row = {
        email: 'test@example.com',
        age: 'not-a-number',
        status: 'active',
        createdAt: '2024-01-01',
      };
      const errors = service.validate(schema, row);
      expect(
        errors.some((e) => e.column === 'age' && e.message.includes('entier')),
      ).toBe(true);
    });

    it('validates type boolean', () => {
      const row = {
        email: 'test@example.com',
        age: 25,
        isActive: 'true',
        status: 'active',
        createdAt: '2024-01-01',
      };
      const errors = service.validate(schema, row);
      expect(
        errors.some(
          (e) => e.column === 'isActive' && e.message.includes('booléen'),
        ),
      ).toBe(true);
    });

    it('validates pattern (regex)', () => {
      const row = {
        email: 'invalid-email',
        age: 25,
        status: 'active',
        createdAt: '2024-01-01',
      };
      const errors = service.validate(schema, row);
      expect(
        errors.some(
          (e) => e.column === 'email' && e.message.includes('pattern'),
        ),
      ).toBe(true);
    });

    it('validates min constraint', () => {
      const row = {
        email: 'test@example.com',
        age: -5,
        status: 'active',
        createdAt: '2024-01-01',
      };
      const errors = service.validate(schema, row);
      expect(
        errors.some((e) => e.column === 'age' && e.message.includes('>= 0')),
      ).toBe(true);
    });

    it('validates max constraint', () => {
      const row = {
        email: 'test@example.com',
        age: 150,
        status: 'active',
        createdAt: '2024-01-01',
      };
      const errors = service.validate(schema, row);
      expect(
        errors.some((e) => e.column === 'age' && e.message.includes('<= 120')),
      ).toBe(true);
    });

    it('validates enum values', () => {
      const row = {
        email: 'test@example.com',
        age: 25,
        status: 'pending',
        createdAt: '2024-01-01',
      };
      const errors = service.validate(schema, row);
      expect(
        errors.some(
          (e) => e.column === 'status' && e.message.includes('valeurs'),
        ),
      ).toBe(true);
    });

    it('validates date format', () => {
      const row = {
        email: 'test@example.com',
        age: 25,
        status: 'active',
        createdAt: 'not-a-date',
      };
      const errors = service.validate(schema, row);
      expect(
        errors.some(
          (e) => e.column === 'createdAt' && e.message.includes('date valide'),
        ),
      ).toBe(true);
    });

    it('allows optional field to be missing', () => {
      const row = {
        email: 'test@example.com',
        age: 25,
        status: 'active',
        createdAt: '2024-01-01',
      };
      const errors = service.validate(schema, row);
      expect(errors).toEqual([]);
    });

    it('allows optional field to be present and valid', () => {
      const row = {
        email: 'test@example.com',
        age: 25,
        isActive: false,
        status: 'active',
        createdAt: '2024-01-01',
      };
      const errors = service.validate(schema, row);
      expect(errors).toEqual([]);
    });

    it('returns multiple errors for multiple invalid fields', () => {
      const row = {
        email: 'invalid',
        age: -5,
        status: 'invalid',
        createdAt: 'bad-date',
      };
      const errors = service.validate(schema, row);
      expect(errors.length).toBeGreaterThan(1);
    });
  });
});
