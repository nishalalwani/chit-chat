import React from 'react';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';

const Toaster = ({ message, severity, open, handleClose }) => {
  return (
    <Snackbar open={open} autoHideDuration={2000} onClose={handleClose}  anchorOrigin={{
      vertical: 'top',
      horizontal: 'right',
    }}>
      <MuiAlert onClose={handleClose} severity={severity} sx={{ width: '100%' }}>
        {message}
      </MuiAlert>
    </Snackbar>
  );
};

export default Toaster;
