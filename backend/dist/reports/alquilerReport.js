"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReporteAlquilerDetalle = void 0;
const pdfkit_1 = __importDefault(require("pdfkit"));
const AlquilerServicio_model_1 = __importDefault(require("../models/AlquilerServicio_model"));
const DetalleAlquiler_model_1 = __importDefault(require("../models/DetalleAlquiler_model"));
const Evento_model_1 = __importDefault(require("../models/Evento_model"));
const Elemento_model_1 = __importDefault(require("../models/Elemento_model"));
const Usuario_model_1 = __importDefault(require("../models/Usuario_model"));
const ReporteAlquilerDetalle = async (req, res) => {
    const { id_alquiler } = req.params;
    const { cedula_asesor } = req.query;
    try {
        const formatearMoneda = (monto) => {
            return new Intl.NumberFormat('es-DO', {
                style: 'currency',
                currency: 'DOP'
            }).format(monto || 0);
        };
        if (id_alquiler === 'todos') {
            // Construir la consulta base
            const includeClause = [
                {
                    model: Evento_model_1.default,
                    attributes: ['fecha_evento', 'id_evento'],
                    include: [
                        {
                            model: Usuario_model_1.default,
                            as: 'asesor',
                            attributes: ['nombre_usuario', 'apellido_usuario', 'cedula_usuario']
                        },
                        {
                            model: Usuario_model_1.default,
                            as: 'cliente',
                            attributes: ['nombre_usuario', 'apellido_usuario']
                        }
                    ]
                },
                {
                    model: DetalleAlquiler_model_1.default,
                    where: {
                        estado_detalquiler: 'Aceptado'
                    },
                    required: false,
                    include: [
                        {
                            model: Elemento_model_1.default,
                            attributes: ['nombre_elemento']
                        }
                    ]
                }
            ];
            // Aplicar filtro por asesor si está presente
            let whereClause = {};
            if (cedula_asesor && cedula_asesor !== 'todos') {
                whereClause['$evento.cedula_asesor$'] = cedula_asesor;
            }
            const alquileres = await AlquilerServicio_model_1.default.findAll({
                where: whereClause,
                include: includeClause,
                order: [['id_alquiler', 'ASC']]
            });
            if (!alquileres || alquileres.length === 0) {
                return res.status(404).json({
                    error: 'No se encontraron alquileres',
                    mensaje: 'No se encontraron alquileres con los filtros seleccionados.'
                });
            }
            // Solo aquí, después de verificar que hay datos, se setean los headers PDF
            const doc = new pdfkit_1.default({ layout: 'landscape' });
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'attachment; filename=reporte_alquileres_general.pdf');
            doc.pipe(res);
            doc.fontSize(20).text('Reporte General de Alquileres', { align: 'center' });
            doc.fontSize(10).text(`Reporte generado el ${new Date().toLocaleDateString()} a las ${new Date().toLocaleTimeString()}`, { align: 'center' });
            doc.moveDown(2);
            // Mostrar información del asesor si se filtró por uno específico
            if (cedula_asesor && cedula_asesor !== 'todos' && alquileres.length > 0) {
                const asesor = alquileres[0].evento?.asesor;
                if (asesor) {
                    doc.fontSize(14).text('Información del Asesor:', { align: 'center' });
                    doc.fontSize(12).text(`Nombre: ${asesor.nombre_usuario} ${asesor.apellido_usuario}`);
                    doc.fontSize(12).text(`Cédula: ${asesor.cedula_usuario}`);
                    doc.moveDown(2);
                }
            }
            // Resumen general
            doc.fontSize(14).text('Resumen General', { align: 'center' });
            doc.moveDown(2);
            const totalAlquileres = alquileres.length;
            const totalIngresos = alquileres.reduce((sum, alq) => sum + (Number(alq.total_alquiler) || 0), 0);
            const alquileresActivos = alquileres.filter(alq => alq.estado_alquiler === 'Aceptado').length;
            const alquileresCompletados = alquileres.filter(alq => alq.estado_alquiler === 'Completado').length;
            const alquileresCancelados = alquileres.filter(alq => alq.estado_alquiler === 'Cancelado').length;
            doc.fontSize(12);
            doc.text(`Total de Alquileres: ${totalAlquileres}`);
            doc.text(`Total de Ingresos: ${formatearMoneda(totalIngresos)}`);
            doc.text(`Alquileres Activos: ${alquileresActivos}`);
            doc.text(`Alquileres Completados: ${alquileresCompletados}`);
            doc.text(`Alquileres Cancelados: ${alquileresCancelados}`);
            doc.moveDown(3);
            // Tabla de alquileres
            doc.fontSize(14).text('Detalle de Alquileres', { align: 'center' });
            doc.moveDown(2);
            const tableHeaders = [
                'ID\nAlquiler',
                'ID\nEvento',
                'Cliente',
                'Fecha\nEvento',
                'Asesor',
                'Cantidad\nElementos',
                'Precio\nNeto',
                'ITBIS',
                'Total',
                'Estado'
            ];
            const tableRows = alquileres.map(alquiler => [
                (alquiler.id_alquiler || '').toString(),
                (alquiler.id_evento || '').toString(),
                alquiler.evento?.cliente ? `${alquiler.evento.cliente.nombre_usuario} ${alquiler.evento.cliente.apellido_usuario}` : 'N/A',
                alquiler.evento?.fecha_evento ? new Date(alquiler.evento.fecha_evento).toLocaleDateString() : 'N/A',
                alquiler.evento?.asesor ? `${alquiler.evento.asesor.nombre_usuario} ${alquiler.evento.asesor.apellido_usuario}` : 'N/A',
                (alquiler.cant_elementos_alquiler || 0).toString(),
                formatearMoneda(Number(alquiler.subtotal_alquiler)),
                formatearMoneda(Number(alquiler.itbis_alquiler)),
                formatearMoneda(Number(alquiler.total_alquiler)),
                alquiler.estado_alquiler || 'N/A'
            ]);
            const startX = 50;
            const rowHeight = 35;
            const colWidth = (doc.page.width - 2 * startX) / tableHeaders.length;
            const tableBottomMargin = 75;
            const tableTopMarginOnNewPage = 60;
            let initialTableY = doc.y + 20;
            const drawTableHeaders = (yPos) => {
                doc.font('Helvetica-Bold');
                tableHeaders.forEach((header, i) => {
                    doc.text(header, startX + i * colWidth, yPos, { width: colWidth, align: 'center', lineBreak: true });
                });
                doc.font('Helvetica');
                doc.moveTo(startX, yPos + rowHeight - 5).lineTo(doc.page.width - startX, yPos + rowHeight - 5).stroke();
                doc.y = yPos + rowHeight + 10;
            };
            drawTableHeaders(initialTableY);
            tableRows.forEach((row, rowIndex) => {
                if (doc.y + rowHeight > doc.page.height - tableBottomMargin) {
                    doc.addPage();
                    drawTableHeaders(tableTopMarginOnNewPage);
                }
                const currentRowY = doc.y;
                row.forEach((cell, i) => {
                    doc.text(cell, startX + i * colWidth, currentRowY, { width: colWidth, align: 'center' });
                });
                doc.moveTo(startX, currentRowY + rowHeight - 5).lineTo(doc.page.width - startX, currentRowY + rowHeight - 5).stroke();
                doc.y = currentRowY + rowHeight;
            });
            doc.end();
        }
        else {
            // Individual alquiler
            const alquiler = await AlquilerServicio_model_1.default.findByPk(id_alquiler, {
                include: [
                    {
                        model: Evento_model_1.default,
                        attributes: ['fecha_evento'],
                        include: [
                            {
                                model: Usuario_model_1.default,
                                as: 'asesor',
                                attributes: ['nombre_usuario', 'apellido_usuario', 'cedula_usuario']
                            },
                            {
                                model: Usuario_model_1.default,
                                as: 'cliente',
                                attributes: ['nombre_usuario', 'apellido_usuario']
                            }
                        ]
                    },
                    {
                        model: DetalleAlquiler_model_1.default,
                        where: {
                            estado_detalquiler: 'Aceptado'
                        },
                        required: false,
                        include: [
                            {
                                model: Elemento_model_1.default,
                                attributes: ['nombre_elemento', 'precio_elemento']
                            }
                        ]
                    }
                ]
            });
            if (!alquiler) {
                return res.status(404).json({
                    error: 'No se encontró el alquiler',
                    mensaje: 'No se encontró el alquiler seleccionado.'
                });
            }
            // Solo aquí, después de verificar que hay datos, se setean los headers PDF
            const doc = new pdfkit_1.default({ layout: 'landscape' });
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=reporte_alquiler_${id_alquiler}.pdf`);
            doc.pipe(res);
            // Verificar si el asesor tiene permiso para ver este alquiler
            if (cedula_asesor && cedula_asesor !== 'todos' && alquiler.evento?.asesor?.cedula_usuario !== cedula_asesor) {
                doc.fontSize(12).text('No tiene permiso para ver este alquiler.', { align: 'center' });
                doc.end();
                return;
            }
            doc.fontSize(20).text(`Reporte de Alquiler ID: ${alquiler.id_alquiler}`, { align: 'center' });
            doc.fontSize(10).text(`Reporte generado el ${new Date().toLocaleDateString()} a las ${new Date().toLocaleTimeString()}`, { align: 'center' });
            doc.moveDown(2);
            doc.fontSize(12);
            doc.text(`ID Evento: ${alquiler.id_evento || 'N/A'}`);
            doc.text(`Cliente: ${alquiler.evento?.cliente ? `${alquiler.evento.cliente.nombre_usuario} ${alquiler.evento.cliente.apellido_usuario}` : 'N/A'}`);
            doc.text(`Fecha del Evento: ${alquiler.evento?.fecha_evento ? new Date(alquiler.evento.fecha_evento).toLocaleDateString() : 'N/A'}`);
            doc.text(`Asesor: ${alquiler.evento?.asesor ? `${alquiler.evento.asesor.nombre_usuario} ${alquiler.evento.asesor.apellido_usuario}` : 'N/A'}`);
            doc.text(`Cantidad de Elementos: ${alquiler.cant_elementos_alquiler || 0}`);
            doc.text(`Precio Neto: ${formatearMoneda(Number(alquiler.subtotal_alquiler))}`);
            doc.text(`ITBIS: ${formatearMoneda(Number(alquiler.itbis_alquiler))}`);
            doc.text(`Total: ${formatearMoneda(Number(alquiler.total_alquiler))}`);
            doc.text(`Estado: ${alquiler.estado_alquiler || 'N/A'}`);
            doc.moveDown(3);
            if (alquiler.detalles && alquiler.detalles.length > 0) {
                doc.fontSize(14).text('Detalles del Alquiler', { align: 'center' });
                doc.moveDown(2);
                const detailTableHeaders = ['Elemento', 'Cantidad', 'Precio Unitario', 'Total'];
                const detailTableRows = alquiler.detalles.map(detalle => [
                    detalle.elemento?.nombre_elemento || 'N/A',
                    (detalle.cantidad_alquiler || 0).toString(),
                    formatearMoneda(Number(detalle.precio_unitario)),
                    formatearMoneda(Number(detalle.total_alquiler))
                ]);
                const detailStartX = 50;
                const detailStartY = doc.y + 20;
                const detailRowHeight = 30;
                const detailColWidth = (doc.page.width - 2 * detailStartX) / detailTableHeaders.length;
                doc.font('Helvetica-Bold');
                detailTableHeaders.forEach((header, i) => {
                    doc.text(header, detailStartX + i * detailColWidth, detailStartY, { width: detailColWidth, align: 'center' });
                });
                doc.font('Helvetica');
                doc.moveTo(detailStartX, detailStartY + detailRowHeight - 10).lineTo(doc.page.width - detailStartX, detailStartY + detailRowHeight - 10).stroke();
                detailTableRows.forEach((row, rowIndex) => {
                    const currentY = detailStartY + (rowIndex + 1) * detailRowHeight;
                    row.forEach((cell, i) => {
                        doc.text(cell, detailStartX + i * detailColWidth, currentY, { width: detailColWidth, align: 'center' });
                    });
                    doc.moveTo(detailStartX, currentY + detailRowHeight - 10).lineTo(doc.page.width - detailStartX, currentY + detailRowHeight - 10).stroke();
                });
            }
            else {
                doc.fontSize(12).text('No se encontraron detalles para este alquiler.', { align: 'center' });
            }
            doc.end();
        }
    }
    catch (error) {
        console.error('Error al generar el reporte de alquileres:', error);
        if (!res.headersSent) {
            res.status(500).send('Error al generar el reporte de alquileres');
        }
    }
};
exports.ReporteAlquilerDetalle = ReporteAlquilerDetalle;
