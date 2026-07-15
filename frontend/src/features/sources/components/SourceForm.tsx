import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { useCreateSource, useUpdateSource } from '../hooks/useSources';
import type { Source, CreateSourceInput, UpdateSourceInput } from '../types';

interface SourceFormProps {
  source?: Source;
  mode: 'create' | 'edit';
}

export default function SourceForm({ source, mode }: SourceFormProps) {
  const navigate = useNavigate();
  const createMutation = useCreateSource();
  const updateMutation = useUpdateSource(source?.id ?? '');

  const [name, setName] = useState(source?.name ?? '');
  const [description, setDescription] = useState(source?.description ?? '');
  const [isActive, setIsActive] = useState(source?.isActive ?? true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'create') {
      const input: CreateSourceInput = {
        name,
        description: description || undefined,
        isActive,
      };
      createMutation.mutate(input, {
        onSuccess: () => navigate('/sources'),
      });
    } else if (source) {
      const input: UpdateSourceInput = {};
      if (name !== source.name) input.name = name;
      if (description !== (source.description ?? ''))
        input.description = description || undefined;
      if (isActive !== source.isActive) input.isActive = isActive;
      updateMutation.mutate(input, {
        onSuccess: () => navigate('/sources'),
      });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/sources')}
          className="rounded-lg p-2 text-white/60 hover:bg-white/10 hover:text-white"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-2xl font-bold text-white">
          {mode === 'create' ? 'Nouvelle source' : 'Modifier la source'}
        </h1>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mx-auto max-w-xl space-y-5 rounded-xl border border-white/10 bg-white/5 p-6"
      >
        <div className="space-y-2">
          <label className="text-sm font-medium text-white/80">
            Nom <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            maxLength={255}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white placeholder-white/30 focus:border-emerald-400 focus:outline-none"
            placeholder="Ex: Clients Q3 2024"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-white/80">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white placeholder-white/30 focus:border-emerald-400 focus:outline-none"
            placeholder="Description optionnelle de la source..."
          />
        </div>

        <div className="flex items-center gap-3">
          <input
            id="isActive"
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="h-4 w-4 rounded border-white/20 bg-white/5 accent-emerald-500"
          />
          <label htmlFor="isActive" className="text-sm text-white/80">
            Source active
          </label>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate('/sources')}
            className="rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-white/70 hover:bg-white/5"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={isPending || !name.trim()}
            className="flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-400 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {isPending ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </form>
    </div>
  );
}
