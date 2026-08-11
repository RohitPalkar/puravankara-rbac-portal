import { Helmet } from 'react-helmet-async';
import { useSearchParams } from 'react-router-dom';

import { CONFIG } from 'src/config-global';

import { JwtResetPasswordView } from 'src/auth/view/jwt';

// ----------------------------------------------------------------------

const metadata = { title: `Reset password | Jwt - ${CONFIG.appName}` };

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? undefined;

  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <JwtResetPasswordView token={token} />
    </>
  );
}