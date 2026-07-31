import { useParams } from 'react-router-dom';

import UserWizard from './user-wizard';

export default function UserDetailPage() {
  const { id } = useParams();

  return <UserWizard mode="edit" userId={id} />;
}
