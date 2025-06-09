import { Request, Response } from 'express';
import PDFDocument from 'pdfkit';
import Usuario from '../models/Usuario_model';
import Rol from '../models/Rol_model';

export const ReporteUsuariosPorRolYEstado = async (req: Request, res: Response) => {
  try {
    const { id_rol, estado_usuario } = req.params;

    const whereClause: any = { };

    if (id_rol !== 'todos') {
      whereClause.id_rol = id_rol;
    }

    if (estado_usuario !== 'todos') {
      whereClause.estado_usuario = estado_usuario;
    }

    const usuarios = await Usuario.findAll({
      where: whereClause,
      include: [Rol],
      order: [['nombre_usuario', 'ASC']]
    });

    if (!usuarios || usuarios.length === 0) {
      let rolNombre = 'seleccionado';
      if (id_rol !== 'todos') {
        const rol = await Rol.findByPk(id_rol);
        rolNombre = rol ? rol.nombre_rol : 'desconocido';
      }

      return res.status(404).json({
        error: 'No se encontraron usuarios',
        mensaje: `No se encontraron usuarios con el rol ${rolNombre} y estado ${estado_usuario === 'todos' ? 'seleccionado' : estado_usuario}`
      });
    }

    const doc = new PDFDocument({ 
      size: 'A4', 
      margin: 40,
      layout: 'landscape'
    });

    res.setHeader('Content-Disposition', 'inline; filename=reporte_usuarios_rol_estado.pdf');
    res.setHeader('Content-Type', 'application/pdf');

    doc.pipe(res);

    // Título
    const rolNombre = usuarios[0].rol?.nombre_rol || 'Desconocido';
    const tituloEstado = estado_usuario === 'todos' ? '' : ` - Estado: ${estado_usuario}`;
    doc.font('Helvetica').fontSize(18).text(`Reporte de Usuarios - Rol: ${rolNombre}${tituloEstado}`, { align: 'center' });
    doc.moveDown(1);

    // Encabezado de tabla
    const tableTop = 100;
    const colWidths = [30, 100, 100, 100, 100, 160, 60, 120];
    const startX = doc.page.margins.left;
    const endX = doc.page.width - doc.page.margins.right;

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
    drawRow(tableTop, ['#', 'Cédula', 'Nombre', 'Usuario', 'Teléfono', 'Correo', 'Estado', 'Creación'], true);
    
    // Línea horizontal después del encabezado
    doc.moveTo(startX, tableTop + 15)
       .lineTo(endX, tableTop + 15)
       .stroke();

    // Dibujar filas
    let y = tableTop + 20;
    usuarios.forEach((usuario, i) => {
      if (y > 520) {
        doc.addPage({ layout: 'landscape' });
        y = 100;
        drawRow(y, ['#', 'Cédula', 'Nombre', 'Usuario', 'Teléfono', 'Correo', 'Estado', 'Fecha y Hora Creación'], true);
        y += 20;
      }

      const content = [
        (i + 1).toString(),
        usuario.cedula_usuario,
        `${usuario.nombre_usuario} ${usuario.apellido_usuario}`,
        usuario.usuario_login,
        usuario.tel_usuario,
        usuario.correo_usuario,
        usuario.estado_usuario,
        usuario.creacion_usuario.toLocaleString()
      ];

      drawRow(y, content);

      const contentHeight = Math.max(...content.map(text => 
        doc.heightOfString(text, { width: Math.max(...colWidths) })
      ));

      doc.moveTo(startX, y + contentHeight + 5)
         .lineTo(endX, y + contentHeight + 5)
         .stroke();

      y += contentHeight + 20; // Adjust y based on contentHeight and padding
    });

    doc.end();
  } catch (error) {
    console.error('Error al generar reporte de usuarios por rol y estado:', error);
    res.status(500).json({ 
      error: 'Error al generar reporte de usuarios por rol y estado',
      mensaje: 'Ocurrió un error al generar el reporte'
    });
  }
};