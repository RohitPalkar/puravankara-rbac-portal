import { Label } from 'src/components/label';

type StatusMap = Record<string, 'success' | 'warning' | 'error' | 'default'>;

const DEFAULT_MAP: StatusMap = {
  active: 'success',
  inactive: 'default',
  locked: 'warning',
  draft: 'default',
  pending: 'warning',
  approved: 'success',
  rejected: 'error',
  expired: 'error',
};

type Props = {
  status: string;
  customMap?: StatusMap;
};

export function StatusBadge({ status, customMap }: Props) {
  const map = customMap ?? DEFAULT_MAP;
  const color = map[status.toLowerCase()] ?? 'default';
  return <Label color={color}>{status}</Label>;
}
