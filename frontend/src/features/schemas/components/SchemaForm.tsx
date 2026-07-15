import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Plus, Trash2 } from 'lucide-react';
import { useCreateSchemaVersion } from '../hooks/useSchemas';
import type { SchemaField } from '../types';

const FIELD_TYPES = [
  'string',
  'integer',
  'date',
  'boolean',
  'number',
  'enum',
] as const;

export default function SchemaForm() {
  const { id: sourceId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const createMutation = useCreateSchemaVersion(sourceId ?? '');

  const [fields, setFields] = useState<SchemaField[]>([
    { name: '', type: 'string', required: true },
  ]);

  const addField = () => {
    setFields([...fields, { name: '', type: 'string', required: true }]);
  };

  const removeField = (index: number) => {
    if (fields.length > 1) {
      setFields(fields.filter((_, i) => i !== index));
    }
  };

  const updateField = (index: number, updates: Partial<SchemaField>) => {
    setFields(
      fields.map((f, i) => (i === index ? { ...f, ...updates } : f)),
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceId) return;

    const validFields = fields.filter((f) => f.name.trim() !== '');
    if (validFields.length === 0) {
      alert('Ajoutez au moins un champ avec un nom');
      return;
    }

    createMutation.mutate(
      { fields: validFields },
      {
        onSuccess: () => navigate(`/sources/${sourceId}/schemas`),
      },
    );
  };

  const isPending = createMutation.isPending;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(`/sources/${sourceId}/schemas`)}
          className="rounded-lg p-2 text-white/60 hover:bg-white/10 hover:text-white"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-2xl font-bold text-white">
          Nouvelle version de schéma
        </h1>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mx-auto max-w-2xl space-y-5 rounded-xl border border-white/10 bg-white/5 p-6"
      >
        <div className="space-y-4">
          {fields.map((field, index) => (
            <div
              key={index}
              className="flex flex-col gap-3 rounded-lg border border-white/10 bg-white/5 p-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-white/80">
                  Champ {index + 1}
                </span>
                {fields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeField(index)}
                    className="rounded p-1 text-red-400 hover:bg-red-500/20"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-white/60">Nom</label>
                  <input
                    type="text"
                    value={field.name}
                    onChange={(e) =>
                      updateField(index, { name: e.target.value })
                    }
                    required
                    className="w-full rounded border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/30 focus:border-emerald-400 focus:outline-none"
                    placeholder="ex: email"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-white/60">Type</label>
                  <select
                    value={field.type}
                    onChange={(e) =>
                      updateField(index, {
                        type: e.target.value as SchemaField['type'],
                      })
                    }
                    className="w-full rounded border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-emerald-400 focus:outline-none"
                  >
                    {FIELD_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-sm text-white/80">
                  <input
                    type="checkbox"
                    checked={field.required}
                    onChange={(e) =>
                      updateField(index, { required: e.target.checked })
                    }
                    className="h-4 w-4 rounded border-white/20 bg-white/5 accent-emerald-500"
                  />
                  Requis
                </label>

                {(field.type === 'string' || field.type === 'integer') && (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={field.min ?? ''}
                      onChange={(e) =>
                        updateField(index, {
                          min: e.target.value
                            ? Number(e.target.value)
                            : undefined,
                        })
                      }
                      className="w-20 rounded border border-white/10 bg-white/5 px-2 py-1 text-sm text-white placeholder-white/30 focus:border-emerald-400 focus:outline-none"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={field.max ?? ''}
                      onChange={(e) =>
                        updateField(index, {
                          max: e.target.value
                            ? Number(e.target.value)
                            : undefined,
                        })
                      }
                      className="w-20 rounded border border-white/10 bg-white/5 px-2 py-1 text-sm text-white placeholder-white/30 focus:border-emerald-400 focus:outline-none"
                    />
                  </div>
                )}

                {field.type === 'string' && (
                  <input
                    type="text"
                    placeholder="Pattern (regex)"
                    value={field.pattern ?? ''}
                    onChange={(e) =>
                      updateField(index, { pattern: e.target.value })
                    }
                    className="flex-1 rounded border border-white/10 bg-white/5 px-3 py-1 text-sm text-white placeholder-white/30 focus:border-emerald-400 focus:outline-none"
                  />
                )}
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={addField}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-white/20 py-3 text-sm text-white/70 hover:bg-white/5"
          >
            <Plus className="h-4 w-4" />
            Ajouter un champ
          </button>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate(`/sources/${sourceId}/schemas`)}
            className="rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-white/70 hover:bg-white/5"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-400 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {isPending ? 'Création...' : 'Créer la version'}
          </button>
        </div>
      </form>
    </div>
  );
}
