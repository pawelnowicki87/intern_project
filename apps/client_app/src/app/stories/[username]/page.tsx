'use client';

import { useParams, useRouter } from 'next/navigation';
import StoryViewer from '../../components/stories/StoryViewer';
import ProtectedRoute from '../../components/ProtectedRoute';

export default function StoryPage() {
  const params = useParams();
  const router = useRouter();
  const username = params.username as string;

  const handleClose = () => {
    router.push('/feed');
  };

  return (
    <ProtectedRoute>
      <StoryViewer username={username} onClose={handleClose} />
    </ProtectedRoute>
  )
  
}