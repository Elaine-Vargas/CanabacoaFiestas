"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReporteCompraDetalle = void 0;
const pdfkit_1 = __importDefault(require("pdfkit"));
const Compra_model_1 = __importDefault(require("../models/Compra_model"));
const DetalleCompra_model_1 = __importDefault(require("../models/DetalleCompra_model"));
const Proveedor_model_1 = __importDefault(require("../models/Proveedor_model"));
const Elemento_model_1 = __importDefault(require("../models/Elemento_model"));
const sequelize_1 = require("sequelize");
// Funciones utilitarias locales
const formatearMoneda = (monto) => {
    return new Intl.NumberFormat('es-DO', {
        style: 'currency',
        currency: 'DOP',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(monto || 0);
};
const formatearFecha = (fecha) => {
    if (!fecha)
        return 'N/A';
    return new Date(fecha).toLocaleDateString('es-DO');
};
const formatearHora = (hora) => {
    if (!hora)
        return 'N/A';
    return hora;
};
const ReporteCompraDetalle = async (req, res) => {
    const { id_compra } = req.params;
    const { estado, fecha_inicio, fecha_fin, id_proveedor } = req.query;
    try {
        // Construir condiciones de filtro
        const whereConditions = {};
        if (estado && estado !== 'todos') {
            whereConditions.estado_compra = estado;
        }
        if (fecha_inicio && fecha_fin) {
            whereConditions.fecha_compra = {
                [sequelize_1.Op.between]: [fecha_inicio, fecha_fin]
            };
        }
        if (id_proveedor && id_proveedor !== 'todos') {
            whereConditions.id_proveedor = id_proveedor;
        }
        if (id_compra === 'todos') {
            // Buscar compras primero
            const compras = await Compra_model_1.default.findAll({
                where: {
                    ...whereConditions,
                    '$proveedor.tipo_proveedor$': 'Elementos'
                },
                include: [{
                        model: Proveedor_model_1.default,
                        attributes: ['nombre_proveedor', 'tipo_proveedor'],
                        required: true
                    }],
                order: [['id_compra', 'ASC']]
            });
            if (!compras || compras.length === 0) {
                return res.status(404).json({
                    error: 'No se encontraron compras',
                    mensaje: 'No se encontraron compras con los filtros seleccionados.'
                });
            }
            const doc = new pdfkit_1.default({ layout: 'landscape' });
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'attachment; filename=reporte_compras_general.pdf');
            doc.pipe(res);
            doc.fontSize(20).text('Reporte General de Compras', { align: 'center' });
            doc.fontSize(10).text(`Reporte generado el ${new Date().toLocaleDateString()} a las ${new Date().toLocaleTimeString()}`, { align: 'center' });
            doc.moveDown(2);
            // Resumen general
            doc.fontSize(14).text('Resumen General', { align: 'center' });
            doc.moveDown(2);
            const totalCompras = compras.length;
            const totalGastos = compras.reduce((sum, comp) => sum + (Number(comp.costo_compra) || 0), 0);
            const comprasCompletadas = compras.filter(comp => comp.estado_compra === 'Completada').length;
            const comprasCanceladas = compras.filter(comp => comp.estado_compra === 'Cancelada').length;
            doc.fontSize(12);
            doc.text(`Total de Compras: ${totalCompras}`);
            doc.text(`Total de Gastos: ${formatearMoneda(totalGastos)}`);
            doc.text(`Compras Completadas: ${comprasCompletadas}`);
            doc.text(`Compras Canceladas: ${comprasCanceladas}`);
            doc.moveDown(3);
            // Tabla de compras
            doc.fontSize(14).text('Detalle de Compras', { align: 'center' });
            doc.moveDown(2);
            const tableHeaders = ['ID\nCompra', 'Fecha', 'Hora', 'Proveedor', 'Costo', 'Estado'];
            const tableRows = compras.map(compra => [
                (compra.id_compra || '').toString(),
                formatearFecha(compra.fecha_compra),
                formatearHora(compra.hora_compra),
                compra.proveedor?.nombre_proveedor || 'N/A',
                formatearMoneda(Number(compra.costo_compra)),
                compra.estado_compra || 'N/A'
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
            // Buscar compra específica primero
            const compra = await Compra_model_1.default.findByPk(id_compra, {
                include: [
                    {
                        model: Proveedor_model_1.default,
                        attributes: ['nombre_proveedor', 'tipo_proveedor'],
                        required: true,
                        where: {
                            tipo_proveedor: 'Elementos'
                        }
                    },
                    { model: DetalleCompra_model_1.default, include: [{ model: Elemento_model_1.default, attributes: ['nombre_elemento'] }] }
                ]
            });
            if (!compra) {
                return res.status(404).json({
                    error: 'No se encontró la compra',
                    mensaje: 'No se encontró la compra seleccionada.'
                });
            }
            const doc = new pdfkit_1.default({ layout: 'landscape' });
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=reporte_compra_${id_compra}.pdf`);
            doc.pipe(res);
            doc.fontSize(20).text(`Reporte de Compra ID: ${compra.id_compra}`, { align: 'center' });
            doc.fontSize(10).text(`Reporte generado el ${new Date().toLocaleDateString()} a las ${new Date().toLocaleTimeString()}`, { align: 'center' });
            doc.moveDown(2);
            doc.fontSize(12);
            doc.text(`Fecha de Compra: ${formatearFecha(compra.fecha_compra)}`);
            doc.text(`Hora de Compra: ${formatearHora(compra.hora_compra)}`);
            doc.text(`Proveedor: ${compra.proveedor?.nombre_proveedor || 'N/A'}`);
            doc.text(`Costo Total: ${formatearMoneda(Number(compra.costo_compra))}`);
            doc.text(`Estado: ${compra.estado_compra || 'N/A'}`);
            doc.moveDown(3);
            if (compra.detalles && compra.detalles.length > 0) {
                doc.fontSize(14).text('Detalles de la Compra', { align: 'center' });
                doc.moveDown(2);
                const detailTableHeaders = ['Elemento', 'Cantidad', 'Precio Unitario', 'Precio Total'];
                const detailTableRows = compra.detalles.map(detalle => [
                    detalle.elemento?.nombre_elemento || 'N/A',
                    (detalle.cantidad_compra || 0).toString(),
                    formatearMoneda(Number(detalle.precio_unitario)),
                    formatearMoneda(Number(detalle.precio_total))
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
                doc.fontSize(12).text('No se encontraron detalles para esta compra.', { align: 'center' });
            }
            doc.end();
        }
    }
    catch (error) {
        console.error('Error al generar el reporte de compras:', error);
        if (!res.headersSent) {
            res.status(500).send('Error al generar el reporte de compras');
        }
    }
};
exports.ReporteCompraDetalle = ReporteCompraDetalle;
