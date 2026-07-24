import type { ApprovalStatus, ApprovalRequest } from 'src/types';

import { Helmet } from 'react-helmet-async';
import { useMemo, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import List from '@mui/material/List';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Dialog from '@mui/material/Dialog';
import Skeleton from '@mui/material/Skeleton';
import ListItem from '@mui/material/ListItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import ToggleButton from '@mui/material/ToggleButton';
import ListItemText from '@mui/material/ListItemText';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

import { CONFIG } from 'src/config-global';
import { usePendingApprovals } from 'src/services/hooks';

import { Iconify } from 'src/components/iconify';
import { PageHeader, PageContainer } from 'src/components/page-layout';

const STATUS_CONFIG: Record<ApprovalStatus, { color: 'warning' | 'success' | 'error'; label: string }> = {
  pending: { color: 'warning', label: 'Pending' },
  approved: { color: 'success', label: 'Approved' },
  rejected: { color: 'error', label: 'Rejected' },
};

export default function ApprovalInboxPage() {
  const { data: approvalsData, isLoading } = usePendingApprovals();

  const [requests, setRequests] = useState<ApprovalRequest[]>([]);
  const [filter, setFilter] = useState<ApprovalStatus | 'all'>('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<ApprovalRequest | null>(null);
  const [comment, setComment] = useState('');

  useEffect(() => {
    if (!isLoading && approvalsData && requests.length === 0) {
      setRequests(approvalsData as unknown as ApprovalRequest[]);
    }
  }, [isLoading, approvalsData, requests.length]);

  const filtered = useMemo(() => {
    let list = requests;
    if (filter !== 'all') list = list.filter((r) => r.status === filter);
    if (search) {
      const lower = search.toLowerCase();
      list = list.filter(
        (r) =>
          r.referenceLabel.toLowerCase().includes(lower) ||
          r.type.toLowerCase().includes(lower) ||
          r.requestedByName?.toLowerCase().includes(lower)
      );
    }
    return list;
  }, [requests, filter, search]);

  const handleAction = useCallback((id: string, status: ApprovalStatus) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status, comments: comment || undefined, updatedAt: new Date().toISOString() } : r))
    );
    setSelected(null);
    setComment('');
  }, [comment]);

  const counts = useMemo(() => ({
    all: requests.length,
    pending: requests.filter((r) => r.status === 'pending').length,
    approved: requests.filter((r) => r.status === 'approved').length,
    rejected: requests.filter((r) => r.status === 'rejected').length,
  }), [requests]);

  return (
    <>
      <Helmet><title>Approval Inbox - {CONFIG.appName}</title></Helmet>
      <PageContainer>
        <PageHeader title="Approval Inbox" description="Review and process approvals" />

        <Card sx={{ p: 2.5, mb: 3 }}>
          <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
            <ToggleButtonGroup
              value={filter}
              exclusive
              onChange={(_, v) => { if (v) setFilter(v); }}
              size="small"
            >
              <ToggleButton value="all">All ({counts.all})</ToggleButton>
              <ToggleButton value="pending">Pending ({counts.pending})</ToggleButton>
              <ToggleButton value="approved">Approved ({counts.approved})</ToggleButton>
              <ToggleButton value="rejected">Rejected ({counts.rejected})</ToggleButton>
            </ToggleButtonGroup>
            <TextField
              label="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search reference, type, or requester..."
              sx={{ minWidth: 280 }}
              InputProps={{
                startAdornment: <Iconify icon="solar:magnifer-bold" width={18} style={{ marginRight: 8, opacity: 0.5 }} />,
              }}
            />
          </Stack>
        </Card>

        <Card>
          {isLoading ? (
            <Box sx={{ p: 4 }}>
              <Skeleton variant="rectangular" height={52} sx={{ borderRadius: 1, mb: 1 }} />
              <Skeleton variant="rectangular" height={52} sx={{ borderRadius: 1, mb: 1 }} />
              <Skeleton variant="rectangular" height={52} sx={{ borderRadius: 1 }} />
            </Box>
          ) : (
            <List disablePadding>
              {filtered.map((req, idx) => {
                const statusCfg = STATUS_CONFIG[req.status];
                return (
                  <ListItem
                    key={req.id}
                    divider={idx < filtered.length - 1}
                    sx={{ px: 3, py: 2, cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
                    onClick={() => setSelected(req)}
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: req.status === 'pending' ? 'warning.light' : req.status === 'approved' ? 'success.light' : 'error.light', width: 40, height: 40 }}>
                        <Iconify icon={req.status === 'pending' ? 'solar:clock-circle-bold' : req.status === 'approved' ? 'solar:check-circle-bold' : 'solar:close-circle-bold'} width={20} />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={req.referenceLabel}
                      secondary={`${req.type} · by ${req.requestedByName} · ${new Date(req.createdAt).toLocaleDateString()}`}
                      primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
                      secondaryTypographyProps={{ variant: 'caption' }}
                      sx={{ flex: 1 }}
                    />
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ ml: 2 }}>
                      <Chip label={statusCfg.label} color={statusCfg.color} size="small" variant="soft" />
                      {req.approverName && (
                        <Typography variant="caption" color="text.secondary">{req.approverName}</Typography>
                      )}
                    </Stack>
                  </ListItem>
                );
              })}
              {filtered.length === 0 && (
                <Box sx={{ p: 4, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">No approval requests found.</Typography>
                </Box>
              )}
            </List>
          )}
        </Card>
      </PageContainer>

      <Dialog open={!!selected} onClose={() => { setSelected(null); setComment(''); }} maxWidth="sm" fullWidth>
        {selected && (
          <>
            <DialogTitle>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Chip label={STATUS_CONFIG[selected.status].label} color={STATUS_CONFIG[selected.status].color} size="small" variant="soft" />
                <Typography variant="h6">{selected.referenceLabel}</Typography>
              </Stack>
            </DialogTitle>
            <DialogContent>
              <Stack spacing={2}>
                <Stack direction="row" justifyContent="space-between">
                  <Box><Typography variant="caption" color="text.secondary">Type</Typography><Typography variant="body2">{selected.type}</Typography></Box>
                  <Box><Typography variant="caption" color="text.secondary">Requested By</Typography><Typography variant="body2">{selected.requestedByName}</Typography></Box>
                  <Box><Typography variant="caption" color="text.secondary">Date</Typography><Typography variant="body2">{new Date(selected.createdAt).toLocaleDateString()}</Typography></Box>
                </Stack>
                {selected.comments && (
                  <Box><Typography variant="caption" color="text.secondary">Comments</Typography><Typography variant="body2">{selected.comments}</Typography></Box>
                )}
                {selected.status === 'pending' && (
                  <TextField
                    label="Comments"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    multiline
                    rows={3}
                    fullWidth
                    placeholder="Add comments..."
                  />
                )}
              </Stack>
            </DialogContent>
            {selected.status === 'pending' && (
              <DialogActions>
                <Button onClick={() => { setSelected(null); setComment(''); }} color="inherit">Cancel</Button>
                <Button onClick={() => handleAction(selected.id, 'rejected')} color="error" variant="outlined">
                  <Iconify icon="solar:close-circle-bold" width={16} style={{ marginRight: 6 }} />
                  Reject
                </Button>
                <Button onClick={() => handleAction(selected.id, 'approved')} color="success" variant="contained">
                  <Iconify icon="solar:check-circle-bold" width={16} style={{ marginRight: 6 }} />
                  Approve
                </Button>
              </DialogActions>
            )}
          </>
        )}
      </Dialog>
    </>
  );
}
