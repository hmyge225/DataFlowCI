import { useState, useCallback } from 'react';
import { useUpload } from '../hooks/useUpload';

interface UploadFormProps {
  sourceId: string;
}

export const UploadForm = ({ sourceId }: UploadFormProps) => {
  const upload = useUpload();
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

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
    });

    setSelectedFile(null);
  };

  return (
    <div className="max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="space-y-4">
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
            id="file-upload"
          />
          <label htmlFor="file-upload" className="cursor-pointer">
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
                  <p className="font-medium">Glissez-déposez un fichier CSV ou Excel</p>
                  <p className="text-sm">ou cliquez pour sélectionner</p>
                </div>
              )}
            </div>
          </label>
        </div>

        {selectedFile && (
          <button
            type="submit"
            disabled={upload.isPending}
            className="w-full bg-[var(--color-brand)] text-white py-2 px-4 rounded-lg hover:bg-[var(--color-brand-dark)] disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {upload.isPending ? 'Upload en cours...' : 'Uploader'}
          </button>
        )}
      </form>
    </div>
  );
};
