import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

interface CustomModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  message: React.ReactNode;
  type?: 'success' | 'error' | 'info';
}

const CustomModal: React.FC<CustomModalProps> = ({ open, onClose, title, message, type = 'info' }) => {
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircleOutlineIcon sx={{ color: '#4CAF50', fontSize: 40 }} />;
      case 'error':
        return <ErrorOutlineIcon sx={{ color: '#f44336', fontSize: 40 }} />;
      default:
        return <InfoOutlinedIcon sx={{ color: '#2196F3', fontSize: 40 }} />;
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: 'var(--color-background2)',
          color: 'var(--color-text)',
          borderRadius: 2,
          p: { xs: 2, sm: 3 },
          minWidth: { xs: '90%', sm: '400px' }
        }
      }}
    >
      <DialogTitle sx={{ 
        fontFamily: '"Montserrat Alternates", cursive',
        fontWeight: 800,
        color: 'var(--gold)',
        textAlign: 'center',
        borderBottom: '2px solid var(--gold)',
        pb: 2
      }}>
        {title}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          gap: 2,
          py: 2
        }}>
          {getIcon()}
          <Box sx={{ 
            textAlign: 'center',
            color: 'var(--color-text)',
            fontFamily: '"Nunito Sans", sans-serif',
            fontSize: '1.1rem'
          }}>
            {message}
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ 
        justifyContent: 'center',
        pt: 2,
        borderTop: '2px solid var(--color-shadow)'
      }}>
        <Button
          onClick={onClose}
          variant="contained"
          sx={{
            backgroundColor: 'var(--dark-gold)',
            fontFamily: '"Montserrat Alternates", cursive',
            fontWeight: 600,
            '&:hover': {
              backgroundColor: 'var(--gold)'
            }
          }}
        >
          Aceptar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CustomModal;