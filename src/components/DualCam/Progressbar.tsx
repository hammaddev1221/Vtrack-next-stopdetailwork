import React from 'react';
import LinearProgress from '@mui/material/LinearProgress';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

interface ProgressBarProps {
  progress: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress }) => {
  return (
    <Box display="flex" alignItems="center" width="100%" >
      <Box width="100%" mr={1} >
        <LinearProgress variant="determinate" value={progress} sx={{
            height: 8,
            borderRadius: 5,
            backgroundColor: '#E0E0E0',
            '& .MuiLinearProgress-bar': {
              backgroundColor: '#00B56C',
            },
          }}
        />
      </Box>
      <Box minWidth={35} >
        <Typography variant="body2" color="textSecondary">{`${progress<0?-progress:progress}%`} </Typography>
      </Box>
    </Box>
  );
};

export default ProgressBar;
