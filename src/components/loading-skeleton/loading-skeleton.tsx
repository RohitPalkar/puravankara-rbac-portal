import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Skeleton from '@mui/material/Skeleton';

type TableSkeletonProps = {
  rows?: number;
  columns?: number;
};

export function TableSkeleton({ rows = 5, columns = 4 }: TableSkeletonProps) {
  return (
    <Stack spacing={1.5} sx={{ p: 3 }}>
      {Array.from({ length: rows }).map((_, r) => (
        <Stack key={r} direction="row" spacing={2}>
          {Array.from({ length: columns }).map((__, c) => (
            <Skeleton key={c} variant="rounded" width={c === 0 ? 60 : undefined} sx={{ flex: c === 0 ? undefined : 1, height: 32 }} />
          ))}
        </Stack>
      ))}
    </Stack>
  );
}

type FormSkeletonProps = {
  fields?: number;
};

export function FormSkeleton({ fields = 4 }: FormSkeletonProps) {
  return (
    <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }} gap={2.5} sx={{ p: 3 }}>
      {Array.from({ length: fields }).map((_, i) => (
        <Stack key={i} spacing={0.75}>
          <Skeleton variant="rounded" width={120} height={14} />
          <Skeleton variant="rounded" height={40} />
        </Stack>
      ))}
    </Box>
  );
}
