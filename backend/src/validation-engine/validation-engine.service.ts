import { Injectable } from '@nestjs/common';
import type {
  ValidationError,
  SchemaField,
  ValidationSchema,
} from './interfaces/validation-error.interface';

// Service pur de validation : aucune dépendance à la DB ou à la queue.
// Testable isolément avec des schémas et des lignes mockées.
@Injectable()
export class ValidationEngineService {
  validate(
    schema: ValidationSchema,
    row: Record<string, unknown>,
  ): ValidationError[] {
    const errors: ValidationError[] = [];

    for (const field of schema.fields) {
      const value = row[field.name];

      // Validation required
      if (
        field.required &&
        (value === undefined || value === null || value === '')
      ) {
        errors.push({
          column: field.name,
          message: `Le champ '${field.name}' est requis`,
          value,
        });
        continue;
      }

      // Si la valeur est absente et non requise, on passe aux autres champs
      if (value === undefined || value === null || value === '') {
        continue;
      }

      // Validation type
      const typeError = this.validateType(field, value);
      if (typeError) {
        errors.push(typeError);
        continue;
      }

      // Validation pattern (string)
      if (field.type === 'string' && field.pattern) {
        const regex = new RegExp(field.pattern);
        const strValue =
          typeof value === 'object' ? JSON.stringify(value) : String(value);
        if (!regex.test(strValue)) {
          errors.push({
            column: field.name,
            message: `Le champ '${field.name}' ne correspond pas au pattern attendu`,
            value: typeof value === 'object' ? JSON.stringify(value) : value,
          });
        }
      }

      // Validation min/max (number, integer)
      if (field.type === 'number' || field.type === 'integer') {
        const num = Number(value);
        if (field.min !== undefined && num < field.min) {
          errors.push({
            column: field.name,
            message: `Le champ '${field.name}' doit être >= ${field.min}`,
            value,
          });
        }
        if (field.max !== undefined && num > field.max) {
          errors.push({
            column: field.name,
            message: `Le champ '${field.name}' doit être <= ${field.max}`,
            value,
          });
        }
      }

      // Validation enum
      if (field.type === 'enum' && field.enum && !field.enum.includes(value)) {
        errors.push({
          column: field.name,
          message: `Le champ '${field.name}' doit être l'une des valeurs : ${field.enum.join(', ')}`,
          value,
        });
      }

      // Validation date (format ISO)
      if (field.type === 'date') {
        const strValue =
          typeof value === 'object' ? JSON.stringify(value) : String(value);
        if (isNaN(Date.parse(strValue))) {
          errors.push({
            column: field.name,
            message: `Le champ '${field.name}' doit être une date valide`,
            value,
          });
        }
      }
    }

    return errors;
  }

  private validateType(
    field: SchemaField,
    value: unknown,
  ): ValidationError | null {
    switch (field.type) {
      case 'string':
        if (typeof value !== 'string') {
          return {
            column: field.name,
            message: `Le champ '${field.name}' doit être une chaîne de caractères`,
            value,
          };
        }
        break;
      case 'integer':
        if (!Number.isInteger(Number(value))) {
          return {
            column: field.name,
            message: `Le champ '${field.name}' doit être un entier`,
            value,
          };
        }
        break;
      case 'number':
        if (typeof value !== 'number' && isNaN(Number(value))) {
          return {
            column: field.name,
            message: `Le champ '${field.name}' doit être un nombre`,
            value,
          };
        }
        break;
      case 'boolean':
        if (typeof value !== 'boolean') {
          return {
            column: field.name,
            message: `Le champ '${field.name}' doit être un booléen`,
            value,
          };
        }
        break;
      case 'date':
        if (typeof value !== 'string' && !(value instanceof Date)) {
          return {
            column: field.name,
            message: `Le champ '${field.name}' doit être une date (string ou Date)`,
            value,
          };
        }
        break;
      case 'enum':
        // La validation enum se fait après (vérification de l'appartenance à la liste)
        break;
    }
    return null;
  }
}
