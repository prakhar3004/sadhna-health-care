// Sadhna Health Care — Role-based access guard
//
// Declarative screen/section protection by role. Use it to wrap a screen's
// content (or any subtree) that only certain roles may see.
//
//   export default function DoctorOnlyScreen() {
//     return (
//       <RoleGuard allow={['doctor']}>
//         <ActualScreen />
//       </RoleGuard>
//     );
//   }
//
// By default an unauthorized role is redirected to the tabs home; pass a
// `fallback` to render an inline "not authorized" UI instead.
import React from 'react';
import { Redirect, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { useAuthStore } from '@/src/store/authStore';
import { UserRole } from '@/src/utils/constants';

interface RoleGuardProps {
  allow: UserRole[];
  children: React.ReactNode;
  redirectTo?: string;
  fallback?: React.ReactNode;
}

export function RoleGuard({ allow, children, redirectTo = '/(tabs)', fallback }: RoleGuardProps) {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (!isAuthenticated || !user) return <Redirect href="/(auth)/login" />;

  if (!allow.includes(user.role)) {
    return fallback ? <>{fallback}</> : <Redirect href={redirectTo as any} />;
  }
  return <>{children}</>;
}

/**
 * Imperative variant for cases where you can't wrap the tree (e.g. inside a
 * screen that must run other hooks first). Redirects away if the role isn't
 * allowed; returns whether access is granted.
 */
export function useRequireRole(allow: UserRole[], redirectTo: string = '/(tabs)'): boolean {
  const user = useAuthStore((s) => s.user);
  const router = useRouter();
  const allowed = !!user && allow.includes(user.role);

  useEffect(() => {
    if (user && !allowed) router.replace(redirectTo as any);
  }, [user, allowed, redirectTo, router]);

  return allowed;
}
