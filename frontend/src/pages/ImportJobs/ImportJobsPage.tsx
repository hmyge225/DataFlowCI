import { ImportJobsList } from '../../features/import-jobs/components/ImportJobsList';

export const ImportJobsPage = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Suivi des imports</h1>
      <ImportJobsList />
    </div>
  );
};
