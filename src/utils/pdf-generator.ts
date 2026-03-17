import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { AuditVerificationData, AuditDetail } from '../types/audit';
import { supabase } from '../lib/supabase';

/**
 * Export a PDF report with ISO compliance (ADT-SRF-FR-025).
 * @param data - Full audit data objects.
 * @param logoBase - Optional base64 of the logo override.
 */
export async function exportVerificationPDF(data: AuditVerificationData, logoBase?: string) {
    // Fetch Dynamic Branding
    const { data: settings } = await supabase.from('ips_settings').select('name, logo_url').single();
    const ipsName = settings?.name || 'CLÍNICA SANTILLANA';
    const logoUrl = logoBase || settings?.logo_url || '';

    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();

    // 1. HEADER (ISO Format: 3 Columns)
    doc.setDrawColor(0);
    doc.setLineWidth(0.3);

    const headerHeight = 30;
    const margin = 10;
    const headerY = 10;

    doc.rect(margin, headerY, pageWidth - (margin * 2), headerHeight);

    const col1Width = 40;
    const col3Width = 60;
    const col2Width = pageWidth - (margin * 2) - col1Width - col3Width;

    doc.line(margin + col1Width, headerY, margin + col1Width, headerY + headerHeight);
    doc.line(margin + col1Width + col2Width, headerY, margin + col1Width + col2Width, headerY + headerHeight);

    // COL 1: Logo
    if (logoUrl) {
        try {
            doc.addImage(logoUrl, 'PNG', margin + 5, headerY + 5, 30, 20);
        } catch (e) {
            console.warn('Logo could not be added to PDF:', e);
            doc.setFontSize(8);
            doc.text('LOGO ERROR', margin + 20, headerY + 15, { align: 'center' });
        }
    } else {
        doc.setFontSize(8);
        doc.text('LOGO', margin + 20, headerY + 15, { align: 'center' });
    }

    // COL 2: Title
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(10);
    doc.text(ipsName.toUpperCase(), margin + col1Width + (col2Width / 2), headerY + 8, { align: 'center' });
    doc.setFontSize(12);
    doc.text('VERIFICACIÓN DE KITS / CARROS', margin + col1Width + (col2Width / 2), headerY + 18, { align: 'center' });
    doc.setFontSize(8);
    doc.text('CONTROL DE INSUMOS MÉDICOS', margin + col1Width + (col2Width / 2), headerY + 25, { align: 'center' });

    // COL 3: Control Info
    doc.setFontSize(7);
    doc.setFont('Helvetica', 'normal');
    doc.text('CÓDIGO: ADT-SRF-FR-025', margin + col1Width + col2Width + 5, headerY + 10);
    doc.text('VERSIÓN: 01', margin + col1Width + col2Width + 5, headerY + 18);
    doc.text('PÁGINA: 1 de 1', margin + col1Width + col2Width + 5, headerY + 26);

    // 2. DATA GENERALS (Header info)
    doc.setFontSize(10);
    doc.setFont('Helvetica', 'bold');
    doc.text('INFORMACIÓN DE LA AUDITORÍA', margin, 50);
    doc.setFont('Helvetica', 'normal');
    const auditDate = new Date(data.header.fecha_hora_inicio).toLocaleString();
    doc.text(`Fecha/Hora: ${auditDate}`, margin, 56);
    doc.text(`Servicio: ${data.header.servicio_ubicacion}`, margin, 62);
    doc.text(`Carro ID: ${data.header.id_carro}`, margin, 68);
    doc.text(`Responsable: ${data.header.responsable_usuario}`, margin, 74);

    // PRECINTOS
    doc.setFillColor(248, 250, 252);
    doc.rect(margin, 80, pageWidth - (margin * 2), 12, 'F');
    doc.setFont('Helvetica', 'bold');
    doc.text('TRAZABILIDAD DE SEGURIDAD', margin + 2, 85);
    doc.setFont('Helvetica', 'normal');
    doc.text(`Precinto Anterior: ${data.custody.serial_apertura}`, margin + 5, 90);
    doc.text(`Nuevo Precinto: ${data.custody.serial_cierre || 'PENDIENTE'}`, margin + 100, 90);

    // 3. TABLE
    const tableColumns = ['Insumo', 'Lote', 'Vencimiento', 'Reg. INVIMA', 'Cant.', 'Conforme'];
    const tableRows = data.details.map((item: AuditDetail) => [
        item.descripcion,
        item.lote,
        item.fecha_vencimiento_insumo,
        item.registro_sanitario,
        item.cantidad_fisica,
        item.estado_conformidad ? 'SÍ' : 'NO'
    ]);

    autoTable(doc, {
        startY: 96,
        head: [tableColumns],
        body: tableRows,
        theme: 'grid',
        headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontSize: 8, fontStyle: 'bold' },
        bodyStyles: { fontSize: 8 },
        columnStyles: {
            0: { cellWidth: 60 },
            4: { halign: 'center' },
            5: { halign: 'center' }
        }
    });

    const finalY = (doc as any).lastAutoTable.finalY + 25;

    // Pharmacy Signature
    if (data.custody.firma_farmacia_img) {
        doc.addImage(data.custody.firma_farmacia_img, 'PNG', margin + 10, finalY - 15, 40, 15);
    }
    doc.line(margin + 10, finalY, margin + 70, finalY);
    doc.setFontSize(8);
    doc.text('FIRMA RESPONSABLE AUDITORÍA', margin + 10, finalY + 5);
    doc.text(`DNI/MAT: ________________`, margin + 10, finalY + 10);

    // nursing Signature
    if (data.custody.firma_enfermeria_img) {
        doc.addImage(data.custody.firma_enfermeria_img, 'PNG', margin + 110, finalY - 15, 40, 15);
    }
    doc.line(margin + 110, finalY, margin + 170, finalY);
    doc.text('RECIBE (RESPONSABLE SERVICIO)', margin + 110, finalY + 5);
    doc.text('CARGO: Jefe de Servicio / Enfermería', margin + 110, finalY + 10);

    doc.save(`auditoria_${data.header.id_carro}_${new Date().getTime()}.pdf`);
}

