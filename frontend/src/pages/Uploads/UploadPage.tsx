import { useParams } from 'react-router';
import { UploadForm } from '../../features/uploads/components/UploadForm';

export const UploadPage = () => {
  const { id } = useParams<{ id: string }>();

  if (!id) {
    return <div>Source ID manquant</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Uploader un fichier</h1>
      <UploadForm sourceId={id} />
    </div>
  );
};
