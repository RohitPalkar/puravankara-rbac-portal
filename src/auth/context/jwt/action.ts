import axios, { endpoints } from 'src/utils/axios';

import { setAccessToken } from 'src/services/api/client';

import { setSession } from './utils';
import { STORAGE_KEY, STORAGE_KEY_USER, STORAGE_KEY_PERMISSIONS } from './constant';

// ----------------------------------------------------------------------

export type SignInParams = {
  email: string;
  password: string;
};

export type SignUpParams = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
};

/** **************************************
 * Sign in
 *************************************** */
export const signInWithPassword = async ({ email, password }: SignInParams): Promise<void> => {
  const params = { email, password };

  const res = await axios.post(endpoints.auth.signIn, params);

  const { accessToken, user, permissions } = res.data.data;

  if (!accessToken) {
    throw new Error('Access token not found in response');
  }

  setSession(accessToken);
  setAccessToken(accessToken);

  if (user) {
    sessionStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
  }

  if (permissions) {
    const transformed = {
      projects: permissions.projects.map((p: any) => ({
        ...p,
        modules: p.modules.map((m: any) => ({
          ...m,
          subModules: (m.subModules ?? []).map((sm: any) => ({
            id: sm.id,
            name: sm.name,
            actions: (sm.actions ?? []).map((a: any) => {
              if (typeof a === 'string') {
                return { code: a, label: a, allowed: true };
              }
              return { code: a.code ?? '', label: a.label ?? a.code ?? '', allowed: a.allowed ?? true };
            }),
          })),
        })),
      })),
    };
    sessionStorage.setItem(STORAGE_KEY_PERMISSIONS, JSON.stringify(transformed));
  } else {
    sessionStorage.removeItem(STORAGE_KEY_PERMISSIONS);
  }
};

/** **************************************
 * Sign up
 *************************************** */
export const signUp = async ({
  email,
  password,
  firstName,
  lastName,
}: SignUpParams): Promise<void> => {
  const params = {
    email,
    password,
    firstName,
    lastName,
  };

  const res = await axios.post(endpoints.auth.signUp, params);

  const { accessToken } = res.data.data;

  if (!accessToken) {
    throw new Error('Access token not found in response');
  }

  sessionStorage.setItem(STORAGE_KEY, accessToken);
};

/** **************************************
 * Sign out
 *************************************** */
export const signOut = async (): Promise<void> => {
  await setSession(null);
  setAccessToken(null);
  sessionStorage.removeItem(STORAGE_KEY_USER);
  sessionStorage.removeItem(STORAGE_KEY_PERMISSIONS);
};
