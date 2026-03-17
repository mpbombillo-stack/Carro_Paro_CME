import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { AuditVerificationData, AuditDetail } from '../types/audit';
import { getTrafficLightStatus } from './semaforizacion';

/**
 * Export a PDF report with ISO compliance (ADT-SRF-FR-025).
 * @param data - Full audit data objects.
 * @param logoBase64 - Optional base64 of the logo.
 */
export async function exportVerificationPDF(data: AuditVerificationData, logoBase64?: string) {
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();

    // 1. HEADER (ISO Format: 3 Columns)
    doc.setDrawColor(0);
    doc.setLineWidth(0.3);

    // Header height approx 30mm
    const headerHeight = 30;
    const margin = 10;
    const headerY = 10;

    // Draw outer box
    doc.rect(margin, headerY, pageWidth - (margin * 2), headerHeight);

    // Column lines
    const col1Width = 40;
    const col3Width = 60;
    const col2Width = pageWidth - (margin * 2) - col1Width - col3Width;

    doc.line(margin + col1Width, headerY, margin + col1Width, headerY + headerHeight);
    doc.line(margin + col1Width + col2Width, headerY, margin + col1Width + col2Width, headerY + headerHeight);

    // COL 1: Logo
    if (logoBase64) {
        doc.addImage(logoBase64, 'PNG', margin + 5, headerY + 5, 30, 20);
    } else {
        doc.setFontSize(8);
        doc.text('LOGO AQUÍ', margin + 20, headerY + 15, { align: 'center' });
    }

    // COL 2: Title
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('CLÍNICA SANTILLANA', margin + col1Width + (col2Width / 2), headerY + 8, { align: 'center' });
    doc.setFontSize(14);
    doc.text('VERIFICACIÓN DE KITS', margin + col1Width + (col2Width / 2), headerY + 18, { align: 'center' });
    doc.setFontSize(8);
    doc.text('CARROS DE PARO', margin + col1Width + (col2Width / 2), headerY + 25, { align: 'center' });

    // COL 3: Control Info
    doc.setFontSize(7);
    doc.setFont('Helvetica', 'normal');
    doc.text('CÓDIGO: ADT-SRF-FR-025', margin + col1Width + col2Width + 5, headerY + 10);
    doc.text('VERSIÓN: 01', margin + col1Width + col2Width + 5, headerY + 18);
    doc.text('PÁGINA: 1 de 1', margin + col1Width + col2Width + 5, headerY + 26);

    // 2. DATA GENERALS (Header info)
    doc.setFontSize(10);
    doc.setFont('Helvetica', 'bold');
    doc.text('INFORMACIÓN GENERAL', margin, 50);
    doc.setFont('Helvetica', 'normal');
    doc.text(`Fecha Inicio: ${data.header.fecha_hora_inicio}`, margin, 56);
    doc.text(`Servicio/Ubicación: ${data.header.servicio_ubicacion}`, margin, 62);
    doc.text(`Identificador: ${data.header.id_carro}`, margin, 68);
    doc.text(`Responsable Audit: ${data.header.responsable_usuario}`, margin, 74);

    // TRAZABILIDAD (Precinto)
    doc.setFillColor(245, 245, 245);
    doc.rect(margin, 80, pageWidth - (margin * 2), 15, 'F');
    doc.setFont('Helvetica', 'bold');
    doc.text('TRAZABILIDAD DE SEGURIDAD (PRECINTOS)', margin + 2, 86);
    doc.setFont('Helvetica', 'normal');
    doc.text(`Precinto Anterior: ${data.custody.serial_apertura}`, margin + 5, 92);
    doc.text(`Nuevo Precinto: ${data.custody.serial_cierre}`, margin + 100, 92);

    // 3. TABLE MEDICAMENTS (AuditDetail)
    const tableColumns = [
        'Descripción',
        'Lote',
        'Vencimiento',
        'Reg. INVIMA',
        'Venc. INVIMA',
        'Cant.',
        'Estado'
    ];

    const tableRows = data.details.map((item: AuditDetail) => {
        const status = getTrafficLightStatus(item.fecha_vencimiento_insumo, item.vencimiento_registro_sanitario);
        return [
            item.descripcion,
            item.lote,
            item.fecha_vencimiento_insumo,
            item.registro_sanitario,
            item.vencimiento_registro_sanitario,
            item.cantidad_fisica,
            status
        ];
    });

    autoTable(doc, {
        startY: 100,
        head: [tableColumns],
        body: tableRows,
        theme: 'grid',
        headStyles: {
            fillColor: [37, 75, 141], // Real Brand Blue (#254b8d)
            textColor: [255, 255, 255],
            fontSize: 8
        },
        bodyStyles: { fontSize: 8 },
        didParseCell: (dataCell) => {
            // Apply Red Background for Critical Expiration (Status ROJO)
            if (dataCell.section === 'body') {
                const status = dataCell.row.cells[6].text[0]; // status column is 6
                if (status === 'ROJO') {
                    dataCell.cell.styles.fillColor = [254, 226, 226]; // #fee2e2
                }
            }
        },
        columnStyles: {
            0: { cellWidth: 50 },
            5: { halign: 'center' }
        }
    });

    // 4. SIGNATURES
    const finalY = (doc as any).lastAutoTable.finalY + 20;

    // Pharmacy Signature
    if (data.custody.firma_farmacia_img) {
        doc.addImage(data.custody.firma_farmacia_img, 'PNG', margin + 10, finalY, 50, 20);
    }
    doc.line(margin + 10, finalY + 21, margin + 70, finalY + 21);
    doc.setFontSize(9);
    doc.text('FIRMA RESPONSABLE FARMACIA', margin + 10, finalY + 25);
    doc.text('NOMBRE: _______________________', margin + 10, finalY + 30);

    // nursing Signature
    if (data.custody.firma_enfermeria_img) {
        doc.addImage(data.custody.firma_enfermeria_img, 'PNG', margin + 110, finalY, 50, 20);
    }
    doc.line(margin + 110, finalY + 21, margin + 170, finalY + 21);
    doc.text('FIRMA RESPONSABLE ENFERMERÍA', margin + 110, finalY + 25);
    doc.text('CARGO: Jefe de Servicio', margin + 110, finalY + 30);

    // Save
    doc.save(`audit_kit_${data.header.id_carro}_${new Date().toISOString().split('T')[0]}.pdf`);
}
