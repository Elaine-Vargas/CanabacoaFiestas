import { Request, Response } from 'express';
import PDFDocument from 'pdfkit';
import Usuario from '../../models/Usuario_model';
import Rol from '../../models/Rol_model';

export const ReporteGeneralUsuarios = async (_req: Request, res: Response) => {
  try {
    const usuarios = await Usuario.findAll({ 
      include: [Rol],
      order: [['creacion_usuario', 'DESC']]
    });

    if (!usuarios || usuarios.length === 0) {
      return res.status(404).json({ message: 'No se encontraron usuarios para generar el reporte' });
    }

    const doc = new PDFDocument({ 
      size: 'A4', 
      margin: 40,
      layout: 'landscape'
    });

    res.setHeader('Content-Disposition', 'inline; filename=reporte_usuarios.pdf');
    res.setHeader('Content-Type', 'application/pdf');

    doc.pipe(res);

    // Título
    doc.font('Helvetica').fontSize(18).text('Reporte de Usuarios', { align: 'center' });
    doc.moveDown(1);

    // Encabezado de tabla
    const tableTop = 100;
    const colWidths = [30, 100, 100, 100, 100, 100, 180, 80];
    const startX = doc.page.margins.left;

    const drawRow = (y: number, values: string[], bold = false) => {
      const font = bold ? 'Helvetica-Bold' : 'Helvetica';
      doc.font(font).fontSize(10);
      let x = startX;
      values.forEach((text, i) => {
        doc.text(text, x, y, { width: colWidths[i], align: 'left' });
        x += colWidths[i];
      });
    };

    // Dibujar encabezado
    drawRow(tableTop, ['#', 'Cédula', 'Nombre', 'Usuario', 'Teléfono', 'Rol', 'Correo', 'Estado'], true);

    // Dibujar filas
    let y = tableTop + 20;
    usuarios.forEach((usuario, i) => {
      if (y > 520) {
        doc.addPage({ layout: 'landscape' });
        y = 100;
        drawRow(y, ['#', 'Cédula', 'Nombre', 'Usuario', 'Teléfono', 'Rol', 'Correo', 'Estado'], true);
        y += 20;
      }

      drawRow(y, [
        (i + 1).toString(),
        usuario.cedula_usuario,
        `${usuario.nombre_usuario} ${usuario.apellido_usuario}`,
        usuario.usuario_login,
        usuario.tel_usuario,
        usuario.rol?.nombre_rol || 'Sin rol',
        usuario.correo_usuario,
        usuario.estado_usuario
      ]);
      y += 20;
    });

    doc.end();
  } catch (error) {
    console.error('Error al generar reporte de usuarios:', error);
    res.status(500).json({ message: 'Error al generar el reporte de usuarios' });
  }
};
export const ReporteUsuariosPorRol = async (req: Request, res: Response) => {
  try {
    const { id_rol } = req.params;

    const usuarios = await Usuario.findAll({
      where: {
        id_rol,
        estado_usuario: 'Activo'
      },
      include: [{
        association: 'rol',
        attributes: ['nombre_rol']
      }],
      order: [['nombre_usuario', 'ASC']]
    });

    if (!usuarios || usuarios.length === 0) {
      return res.status(404).json({ 
        error: 'No se encontraron usuarios',
        mensaje: `No hay usuarios activos registrados con el rol: ${id_rol}`
      });
    }

    const doc = new PDFDocument({ 
      size: 'A4', 
      margin: 40,
      layout: 'landscape'
    });

    res.setHeader('Content-Disposition', 'inline; filename=reporte_usuarios_por_rol.pdf');
    res.setHeader('Content-Type', 'application/pdf');

    doc.pipe(res);

    // Título
    doc.font('Helvetica').fontSize(18).text(`Reporte de Usuarios - Rol: ${usuarios[0].rol?.nombre_rol}`, { align: 'center' });
    doc.moveDown(1);

    // Encabezado de tabla
    const tableTop = 100;
    const colWidths = [30, 100, 100, 100, 100, 180, 80];
    const startX = doc.page.margins.left;

    const drawRow = (y: number, values: string[], bold = false) => {
      const font = bold ? 'Helvetica-Bold' : 'Helvetica';
      doc.font(font).fontSize(10);
      let x = startX;
      values.forEach((text, i) => {
        doc.text(text, x, y, { width: colWidths[i], align: 'left' });
        x += colWidths[i];
      });
    };

    // Dibujar encabezado
    drawRow(tableTop, ['#', 'Cédula', 'Nombre', 'Usuario', 'Teléfono', 'Correo', 'Estado'], true);

    // Dibujar filas
    let y = tableTop + 20;
    usuarios.forEach((usuario, i) => {
      if (y > 520) {
        doc.addPage({ layout: 'landscape' });
        y = 100;
        drawRow(y, ['#', 'Cédula', 'Nombre', 'Usuario', 'Teléfono', 'Correo', 'Estado'], true);
        y += 20;
      }

      drawRow(y, [
        (i + 1).toString(),
        usuario.cedula_usuario,
        `${usuario.nombre_usuario} ${usuario.apellido_usuario}`,
        usuario.usuario_login,
        usuario.tel_usuario,
        usuario.correo_usuario,
        usuario.estado_usuario
      ]);
      y += 20;
    });

    doc.end();
  } catch (error) {
    console.error('Error al generar reporte de usuarios por rol:', error);
    res.status(500).json({ 
      error: 'Error al generar reporte de usuarios por rol',
      mensaje: 'Ocurrió un error al generar el reporte'
    });
  }
};