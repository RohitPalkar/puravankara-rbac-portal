import { Helmet } from 'react-helmet-async';
import { CONFIG } from 'src/config-global';
import { PageContainer, PageHeader } from 'src/components/page-layout';

export default function DashboardPage() {
  return (
    <>
      <Helmet><title>Dashboard - {CONFIG.appName}</title></Helmet>
      <PageContainer>
        <PageHeader title="Dashboard" />
      </PageContainer>
    </>
  );
}
