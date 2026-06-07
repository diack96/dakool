import LearningPathForm from '../_Form';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditLearningPathPage({ params }: Props) {
  const { id } = await params;
  return <LearningPathForm pathId={id} />;
}
