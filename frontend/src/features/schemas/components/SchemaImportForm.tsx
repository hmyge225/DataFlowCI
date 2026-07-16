import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Upload, FileText, X } from 'lucide-react';
import { useImportSchema } from '../hooks/useSchemas';
import type { ImportSchemaInput } from '../types';

export default function SchemaImportForm() {
  const { id: sourceId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const importMutation = useImportSchema(sourceId ?? '');

  const [jsonContent, setJsonContent] = useState('');
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setError('');

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        JSON.parse(content);
        setJsonContent(content);
      } catch {
        setError('Fichier JSON invalide');
        setFileName('');
      }
    };
    reader.readAsText(file);
  };

  const handlePaste = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setJsonContent(e.target.value);
    setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceId) return;

    try {
      const parsed = JSON.parse(jsonContent) as ImportSchemaInput;
      
      if (!parsed.schema || !parsed.schema.columns || parsed.schema.columns.length === 0) {
        setError('Le JSON doit contenir un objet schema avec au moins une colonne');
        return;
      }

      importMutation.mutate(parsed, {
        onSuccess: () => navigate(`/sources/${sourceId}/schemas`),
      });
    } catch {
      setError('Format JSON invalide');
    }
  };

  const isPending = importMutation.isPending;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(`/sources/${sourceId}/schemas`)}
          className="rounded-lg p-2 text-[var(--color-text-muted)] hover:bg-[var(--color-brand)]/10 hover:text-[var(--color-brand)]"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
          Importer un schéma depuis JSON
        </h1>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mx-auto max-w-2xl space-y-5 rounded-xl border border-[var(--color-brand)]/20 bg-white p-6"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--color-text-primary)]">
              Charger un fichier JSON
            </label>
            <div className="flex items-center gap-3">
              <label className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 bg-[var(--color-surface)] py-8 text-sm text-[var(--color-text-muted)] hover:border-[var(--color-brand)] hover:bg-[var(--color-brand)]/5">
                <Upload className="h-5 w-5" />
                <span>{fileName || 'Choisir un fichier JSON'}</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
              {fileName && (
                <button
                  type="button"
                  onClick={() => {
                    setFileName('');
                    setJsonContent('');
                  }}
                  className="rounded-lg p-2 text-red-600 hover:bg-red-100"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-[var(--color-text-muted)]">ou</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--color-text-primary)]">
              Coller le contenu JSON
            </label>
            <textarea
              value={jsonContent}
              onChange={handlePaste}
              placeholder='{
  "source_name": "Mon Schéma",
  "schema": {
    "columns": [
      {
        "name": "email",
        "type": "string",
        "required": true
      }
    ]
  }
}'
              className="h-64 w-full rounded-lg border border-gray-300 bg-[var(--color-surface)] p-4 font-mono text-sm text-[var(--color-text-primary)] placeholder-gray-400 focus:border-[var(--color-brand)] focus:outline-none"
            />
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
            <div className="flex items-start gap-2">
              <FileText className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-medium">Format attendu :</p>
                <p className="text-xs">
                  Le fichier JSON doit contenir les champs <code>source_name</code> et <code>schema</code> avec un tableau <code>columns</code>.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate(`/sources/${sourceId}/schemas`)}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-[var(--color-text-muted)] hover:bg-gray-50"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={isPending || !jsonContent}
            className="flex items-center gap-2 rounded-lg bg-[var(--color-brand)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-brand-dark)] disabled:opacity-50"
          >
            <Upload className="h-4 w-4" />
            {isPending ? 'Import...' : 'Importer'}
          </button>
        </div>
      </form>
    </div>
  );
}
