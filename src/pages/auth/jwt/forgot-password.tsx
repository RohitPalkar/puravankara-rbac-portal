import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { JwtForgotPasswordView } from 'src/auth/view/jwt';

// ----------------------------------------------------------------------

const metadata = { title: `Forgot password | Jwt - ${CONFIG.appName}` };

export default function ForgotPasswordPage() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <JwtForgotPasswordView />
    </>
  );
}