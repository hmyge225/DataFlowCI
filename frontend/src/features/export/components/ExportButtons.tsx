import { useAuth } from '../../auth/context/AuthContext';
import {
  exportValidRows,
  exportErrorsReport,
  exportOriginalFile,
} from '../services/export.service';

interface ExportButtonsProps {
  importJobId: string;
  hasValidRows: boolean;
  hasErrors: boolean;
}

export const ExportButtons = ({
  importJobId,
  hasValidRows,
  hasErrors,
}: ExportButtonsProps) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const handleExportValid = async () => {
    try {
      await exportValidRows(importJobId);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Erreur lors de l\'export des lignes valides');
    }
  };

  const handleExportErrors = async () => {
    try {
      await exportErrorsReport(importJobId);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Erreur lors de l\'export du rapport d\'erreurs');
    }
  };

  const handleExportOriginal = async () => {
    try {
      await exportOriginalFile(importJobId);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Erreur lors de l\'export du fichier original');
    }
  };

  return (
    <div className="flex gap-2 flex-wrap">
      {hasValidRows && (
        <button
          onClick={handleExportValid}
          className="px-3 py-1 bg-[var(--color-brand)] text-white text-sm rounded hover:bg-[var(--color-brand-dark)] transition-colors"
        >
          Télécharger les lignes valides
        </button>
      )}
      {hasErrors && (
        <button
          onClick={handleExportErrors}
          className="px-3 py-1 bg-[var(--color-accent)] text-white text-sm rounded hover:bg-orange-700 transition-colors"
        >
          Télécharger le rapport d'erreurs
        </button>
      )}
      {isAdmin && (
        <button
          onClick={handleExportOriginal}
          className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 transition-colors"
        >
          Télécharger le fichier original
        </button>
      )}
    </div>
  );
};
