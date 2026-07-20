import axios, { endpoints } from 'src/utils/axios';

import { setSession } from './utils';
import { STORAGE_KEY } from './constant';

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

  const { accessToken } = res.data.data;

  if (!accessToken) {
    throw new Error('Access token not found in response');
  }

  setSession(accessToken);
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
};
