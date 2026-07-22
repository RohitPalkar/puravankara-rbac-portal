import { useState, useCallback } from 'react';
import IconButton from '@mui/material/IconButton';
import { Iconify } from 'src/components/iconify';

export function FullscreenButton() {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleToggle = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true));
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false));
    }
  }, []);

  return (
    <IconButton onClick={handleToggle} sx={{ width: 40, height: 40 }}>
      <Iconify
        icon={isFullscreen ? 'solar:full-screen-square-bold' : 'solar:full-screen-bold'}
        width={20}
      />
    </IconButton>
  );
}
