import type { ErrorInfo, ReactNode } from 'react';

import { Component } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';

import { Iconify } from 'src/components/iconify';

type ErrorBoundaryProps = {
  children: ReactNode;
};

type ErrorBoundaryState = {
  error: Error | null;
  errorInfo: ErrorInfo | null;
};

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary] Render error:', error, errorInfo.componentStack);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ error: null, errorInfo: null });
  };

  render() {
    const { error, errorInfo } = this.state;
    const { children } = this.props;

    if (!error) {
      return children;
    }

    return (
      <Box sx={{ p: 4 }}>
        <Card variant="outlined" sx={{ borderRadius: 2 }}>
          <CardContent>
            <Stack spacing={2}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Iconify icon="solar:danger-triangle-bold" width={24} sx={{ color: 'error.main' }} />
                <Typography variant="h6">Something went wrong rendering this page</Typography>
              </Stack>
              <Typography
                variant="body2"
                component="pre"
                sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', bgcolor: 'background.neutral', p: 2, borderRadius: 1 }}
              >
                {error.message || error.toString()}
              </Typography>
              {errorInfo?.componentStack && (
                <Typography
                  variant="caption"
                  component="pre"
                  sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', color: 'text.secondary', maxHeight: 300, overflow: 'auto' }}
                >
                  {errorInfo.componentStack}
                </Typography>
              )}
              <Box>
                <Button variant="contained" onClick={this.handleReset}>
                  Try again
                </Button>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Box>
    );
  }
}
