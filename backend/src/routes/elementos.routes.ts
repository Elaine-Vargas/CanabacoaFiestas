import express from 'express';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { pool } from '../database';
import fs from 'fs';

const router = express.Router();

// Configuración de multer para el almacenamiento de imágenes
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/elementos/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = uuidv4();
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // límite de 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de archivo no permitido. Solo se permiten imágenes JPEG, PNG y WebP.'));
    }
  }
});

// Ruta para subir una imagen
router.post('/upload-image/:id', upload.single('imagen'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No se ha proporcionado ninguna imagen' });
    }

    const id = req.params.id;
    const imagenUrl = `/uploads/elementos/${req.file.filename}`;

    await pool.query(
      'UPDATE elemento SET imagen_url = ? WHERE id_elemento = ?',
      [imagenUrl, id]
    );

    res.json({ message: 'Imagen subida exitosamente', imagenUrl });
  } catch (error) {
    console.error('Error al subir la imagen:', error);
    res.status(500).json({ message: 'Error al subir la imagen' });
  }
});

// Ruta para eliminar una imagen
router.delete('/delete-image/:id', async (req, res) => {
  try {
    const id = req.params.id;
    
    // Primero obtenemos la URL de la imagen actual
    const [elemento] = await pool.query(
      'SELECT imagen_url FROM elemento WHERE id_elemento = ?',
      [id]
    );

    if (elemento && elemento[0].imagen_url) {
      const imagenPath = path.join(__dirname, '../../', elemento[0].imagen_url);
      
      // Eliminamos el archivo físico
      fs.unlink(imagenPath, (err) => {
        if (err) console.error('Error al eliminar el archivo:', err);
      });

      // Actualizamos la base de datos
      await pool.query(
        'UPDATE elemento SET imagen_url = NULL WHERE id_elemento = ?',
        [id]
      );
    }

    res.json({ message: 'Imagen eliminada exitosamente' });
  } catch (error) {
    console.error('Error al eliminar la imagen:', error);
    res.status(500).json({ message: 'Error al eliminar la imagen' });
  }
});

// Ruta para actualizar un elemento
router.put('/:id', async (req, res) => {
  try {
    const { 
      nombre_elemento, 
      id_subcategoria, 
      id_material, 
      id_color, 
      precio_elemento,
      cantidad_total, 
      cantidad_disponible, 
      estado_elemento 
    } = req.body;

    await pool.query(
      `UPDATE elemento 
       SET nombre_elemento = ?, 
           id_subcategoria = ?, 
           id_material = ?, 
           id_color = ?, 
           precio_elemento = ?,
           cantidad_total = ?, 
           cantidad_disponible = ?, 
           estado_elemento = ?
       WHERE id_elemento = ?`,
      [
        nombre_elemento, 
        id_subcategoria, 
        id_material, 
        id_color, 
        precio_elemento,
        cantidad_total, 
        cantidad_disponible, 
        estado_elemento, 
        req.params.id
      ]
    );

    res.json({ message: 'Elemento actualizado exitosamente' });
  } catch (error) {
    console.error('Error al actualizar el elemento:', error);
    res.status(500).json({ message: 'Error al actualizar el elemento' });
  }
});

// Ruta para crear un nuevo elemento
router.post('/', async (req, res) => {
  try {
    const { 
      nombre_elemento, 
      id_subcategoria, 
      id_material, 
      id_color, 
      precio_elemento,
      cantidad_total, 
      cantidad_disponible, 
      estado_elemento 
    } = req.body;

    const [result] = await pool.query(
      `INSERT INTO elemento (
        nombre_elemento, 
        id_subcategoria, 
        id_material, 
        id_color, 
        precio_elemento,
        cantidad_total, 
        cantidad_disponible, 
        estado_elemento
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        nombre_elemento, 
        id_subcategoria, 
        id_material, 
        id_color, 
        precio_elemento,
        cantidad_total, 
        cantidad_disponible, 
        estado_elemento
      ]
    );

    res.json({ 
      message: 'Elemento creado exitosamente',
      id: result.insertId 
    });
  } catch (error) {
    console.error('Error al crear el elemento:', error);
    res.status(500).json({ message: 'Error al crear el elemento' });
  }
});

// Ruta para actualizar el precio de un elemento
router.put('/precio/:id', async (req, res) => {
  try {
    const { precio_elemento } = req.body;
    const id = req.params.id;

    await pool.query(
      'UPDATE elemento SET precio_elemento = ? WHERE id_elemento = ?',
      [precio_elemento, id]
    );

    res.json({ message: 'Precio actualizado exitosamente' });
  } catch (error) {
    console.error('Error al actualizar el precio:', error);
    res.status(500).json({ message: 'Error al actualizar el precio' });
  }
});

// Ruta para obtener un elemento específico
router.get('/:id', async (req, res) => {
  try {
    const [elemento] = await pool.query(
      `SELECT e.*, 
              e.precio_elemento,
              e.imagen_url,
              s.nombre_subcategoria,
              c.nombre_categoria,
              co.nombre_color,
              m.nombre as nombre_material
       FROM elemento e
       JOIN subcategorias s ON e.id_subcategoria = s.id_subcategoria
       JOIN categorias c ON s.id_categoria = c.id_categoria
       JOIN colores co ON e.id_color = co.id_color
       JOIN materiales m ON e.id_material = m.id_material
       WHERE e.id_elemento = ?`,
      [req.params.id]
    );

    if (!elemento || elemento.length === 0) {
      return res.status(404).json({ message: 'Elemento no encontrado' });
    }

    res.json(elemento[0]);
  } catch (error) {
    console.error('Error al obtener el elemento:', error);
    res.status(500).json({ message: 'Error al obtener el elemento' });
  }
});

export default router; 