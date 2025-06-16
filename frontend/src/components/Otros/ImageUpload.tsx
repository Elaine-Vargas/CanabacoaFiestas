import { useState } from 'react';
import { Box, Button, CircularProgress, IconButton } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';
import { apiUrl } from '../../config';

interface ImageUploadProps {
  elementoId: number;
  imagenUrl?: string;
  onImageUploaded: (url: string) => void;
  onImageDeleted: () => void;
}

const ImageUpload = ({ elementoId, imagenUrl, onImageUploaded, onImageDeleted }: ImageUploadProps) => {

  const serverUrl = import.meta.env.VITE_API_URL;


  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Solo se permiten imágenes JPEG, PNG y WebP');
      return;
    }

    // Validar tamaño (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('La imagen no debe superar los 5MB');
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('imagen', file);

    try {
      const response = await axios.post(
        `${apiUrl}/elementos/${elementoId}/imagen`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      onImageUploaded(response.data.imagenUrl);
    } catch (err) {
      setError('Error al subir la imagen');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await axios.delete(`${apiUrl}/elementos/${elementoId}/imagen`);
      onImageDeleted();
    } catch (err) {
      setError('Error al eliminar la imagen');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ position: 'relative', width: '100%' }}>
      {loading && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            borderRadius: 1,
            zIndex: 1,
          }}
        >
          <CircularProgress sx={{ color: 'var(--gold)' }} />
        </Box>
      )}

      {error && (
        <Box
          sx={{
            color: 'var(--error)',
            fontSize: '0.875rem',
            mt: 1,
            textAlign: 'center',
          }}
        >
          {error}
        </Box>
      )}

      {imagenUrl ? (
        <Box sx={{ position: 'relative' }}>
          <img
            src={`${serverUrl}${imagenUrl}`}
            alt="Elemento"
            style={{
              width: '100%',
              height: 'auto',
              borderRadius: '8px',
            }}
          />
          <IconButton
            onClick={handleDelete}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              color: 'var(--white)',
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
              },
            }}
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      ) : (
        <Button
          component="label"
          variant="outlined"
          startIcon={<CloudUploadIcon />}
          sx={{
            width: '100%',
            height: '200px',
            border: '2px dashed var(--gold)',
            borderRadius: 2,
            color: 'var(--gold)',
            '&:hover': {
              borderColor: 'var(--dark-gold)',
              backgroundColor: 'var(--gold-light)',
            },
          }}
        >
          Subir imagen
          <input
            type="file"
            hidden
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
          />
        </Button>
      )}
    </Box>
  );
};

export default ImageUpload; 