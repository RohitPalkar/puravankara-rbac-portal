import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { PageHeader, PageContainer } from 'src/components/page-layout';

export default function PermissionMatrixPage() {
  return (
    <>
      <Helmet><title>Permissions - {CONFIG.appName}</title></Helmet>
      <PageContainer>
        <PageHeader title="Permission Matrix" />
      </PageContainer>
    </>
  );
}
