import { Redirect } from 'expo-router';
import { useAuth } from '@/src/contexts/AuthContext';
import { LoadingSplash } from '@/src/components/LoadingSplash';

export default function Index() {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <LoadingSplash />;
  if (isAuthenticated) return <Redirect href="/tabs" />;
  return <Redirect href="/auth/login" />;
}
