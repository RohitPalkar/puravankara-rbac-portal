import { useQueryClient } from '@tanstack/react-query';
import { useState, useEffect, useCallback } from 'react';

import { paths } from 'src/routes/paths';
import { useRouter, usePathname, useSearchParams } from 'src/routes/hooks';

import { queryKeys } from 'src/services/api/query-keys';
import { permissionService } from 'src/services/services/permission.service';

import { SplashScreen } from 'src/components/loading-screen';

import { useAuthContext } from '../hooks';

// ----------------------------------------------------------------------

type Props = {
  children: React.ReactNode;
};

export function AuthGuard({ children }: Props) {
  const router = useRouter();

  const pathname = usePathname();

  const searchParams = useSearchParams();

  const { authenticated, loading } = useAuthContext();

  const queryClient = useQueryClient();

  const [isChecking, setIsChecking] = useState<boolean>(true);

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);

      return params.toString();
    },
    [searchParams]
  );

  const checkPermissions = async (): Promise<void> => {
    if (loading) {
      return;
    }

    if (!authenticated) {
      const signInPath = paths.auth.jwt.signIn;

      const href = `${signInPath}?${createQueryString('returnTo', pathname)}`;

      router.replace(href);
      return;
    }

    setIsChecking(false);
  };

  useEffect(() => {
    if (authenticated && !loading) {
      queryClient.prefetchQuery({
        queryKey: queryKeys.permissions.me,
        queryFn: () => permissionService.getMyPermissions(),
        staleTime: 30000,
      });
      queryClient.prefetchQuery({
        queryKey: queryKeys.modules.tree,
        queryFn: async () => {
          const { moduleService } = await import('src/services/services/product-catalog.service');
          const res = await moduleService.tree();
          return res.data;
        },
        staleTime: 30000,
      });
    }
  }, [authenticated, loading, queryClient]);

  useEffect(() => {
    checkPermissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authenticated, loading]);

  if (isChecking) {
    return <SplashScreen />;
  }

  return <>{children}</>;
}
