import { useState, useCallback } from 'react';
import { X, Upload, FileText } from 'lucide-react';
import { useUpload } from '../hooks/useUpload';
import { useSchemaVersions } from '../../schemas/hooks/useSchemas';
import type { SchemaVersion } from '../../schemas/types';

interface UploadModalProps {
  sourceId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const UploadModal = ({ sourceId, isOpen, onClose }: UploadModalProps) => {
  const upload = useUpload();
  const { data: schemaVersions } = useSchemaVersions(sourceId);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedSchemaVersion, setSelectedSchemaVersion] = useState<number | null>(null);

  const validateAndSetFile = (file: File) => {
    const extension = file.name.split('.').pop()?.toLowerCase();
    const allowedExtensions = ['csv', 'xlsx', 'xls'];
    
    if (!extension || !allowedExtensions.includes(extension)) {
      alert('Seuls les fichiers CSV, XLSX et XLS sont autorisés');
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      alert('Le fichier ne doit pas dépasser 20 Mo');
      return;
    }

    setSelectedFile(file);
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        const file = files[0];
        validateAndSetFile(file);
      }
    },
    [],
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        const file = files[0];
        validateAndSetFile(file);
      }
    },
    [],
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    upload.mutate({
      sourceId,
      file: selectedFile,
      schemaVersion: selectedSchemaVersion || undefined,
    });

    setSelectedFile(null);
    setSelectedSchemaVersion(null);
    onClose();
  };

  const handleClose = () => {
    setSelectedFile(null);
    setSelectedSchemaVersion(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="mx-auto max-w-lg w-full bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-[var(--color-text-primary)]">
            Uploader un fichier
          </h2>
          <button
            onClick={handleClose}
            className="rounded-lg p-2 text-[var(--color-text-muted)] hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--color-text-primary)]">
              Version de schéma
            </label>
            <select
              value={selectedSchemaVersion || ''}
              onChange={(e) => setSelectedSchemaVersion(e.target.value ? parseInt(e.target.value) : null)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-[var(--color-text-primary)] focus:border-[var(--color-brand)] focus:outline-none"
            >
              <option value="">Dernière version (par défaut)</option>
              {schemaVersions?.map((sv: SchemaVersion) => (
                <option key={sv.id} value={sv.version}>
                  Version {sv.version} ({sv.fields.length} champs)
                </option>
              ))}
            </select>
          </div>

          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`
              border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
              ${isDragging ? 'border-[var(--color-brand)] bg-[var(--color-surface)]' : 'border-gray-300 hover:border-[var(--color-brand)]'}
            `}
          >
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload-modal"
            />
            <label htmlFor="file-upload-modal" className="cursor-pointer">
              <div className="text-gray-600">
                {selectedFile ? (
                  <div>
                    <p className="font-medium text-gray-900">{selectedFile.name}</p>
                    <p className="text-sm text-gray-500">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} Mo
                    </p>
                  </div>
                ) : (
                  <div>
                    <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p className="font-medium">Glissez-déposez un fichier CSV ou Excel</p>
                    <p className="text-sm">ou cliquez pour sélectionner</p>
                  </div>
                )}
              </div>
            </label>
          </div>

          {selectedFile && (
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
              <div className="flex items-start gap-2">
                <FileText className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-medium">Schéma sélectionné :</p>
                  <p className="text-xs">
                    {selectedSchemaVersion 
                      ? `Version ${selectedSchemaVersion}` 
                      : 'Dernière version (par défaut)'}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-[var(--color-text-muted)] hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={!selectedFile || upload.isPending}
              className="flex items-center gap-2 rounded-lg bg-[var(--color-brand)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-brand-dark)] disabled:opacity-50"
            >
              <Upload className="h-4 w-4" />
              {upload.isPending ? 'Upload en cours...' : 'Uploader'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
