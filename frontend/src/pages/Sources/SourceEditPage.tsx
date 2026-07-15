import { useParams } from 'react-router-dom';
import SourceForm from '../../features/sources/components/SourceForm';
import { useSource } from '../../features/sources/hooks/useSources';
import ConcentricLoader from '../../shared/components/feedback/ConcentricLoader';

export default function SourceEditPage() {
  const { id } = useParams<{ id: string }>();
  const { data: source, isLoading } = useSource(id ?? '');

  if (isLoading) return <ConcentricLoader />;

  return <SourceForm mode="edit" source={source} key={source?.id} />;
}
