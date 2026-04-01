import type { AuditStatus } from '../types/audit';

/**
 * Función utilitaria que evalúa tanto la fecha de vencimiento del insumo como el vencimiento del registro sanitario.
 * 🔴 ROJO: Vencimiento < 6 meses (Alerta Bloqueante/Crítica).
 * 🟡 AMARILLO: Vencimiento entre 6 y 12 meses (Alerta Preventiva).
 * 🟢 VERDE: Vencimiento > 12 meses (Óptimo).
 * @param fechaItem - Fecha de vencimiento del insumo.
 * @param fechaRegistro - Fecha de vencimiento del registro INVIMA.
 * @returns {AuditStatus}
 */
export function getTrafficLightStatus(fechaItem: string, fechaRegistro: string): AuditStatus {
    if (!fechaItem || !fechaRegistro) return 'ROJO';

    const isRegistroVigente = fechaRegistro.toLowerCase().trim() === 'vigente';

    // Helper para parsear fechas que pueden venir en yyyy-mm-dd o dd/mm/yyyy
    const parseDateStr = (dateStr: string) => {
        if (!dateStr) return new Date(NaN);
        if (dateStr.includes('/')) {
            const parts = dateStr.split('/');
            if (parts.length === 3) {
                // DD/MM/YYYY
                return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
            }
        }
        return new Date(dateStr);
    };

    const today = new Date();
    const dateItem = parseDateStr(fechaItem);
    const dateReg = isRegistroVigente ? new Date(today.getFullYear() + 10, 0, 1) : parseDateStr(fechaRegistro);

    if (isNaN(dateItem.getTime()) || (!isRegistroVigente && isNaN(dateReg.getTime()))) {
        return 'ROJO'; // Formato inválido o fecha no reconocida
    }

    // Consideramos la fecha mas restrictiva.
    const earliestExpiration = dateItem < dateReg ? dateItem : dateReg;

    const diffInMonths = (earliestExpiration.getTime() - today.getTime()) / (1000 * 60 * 60 * 24 * 30.4375);

    if (diffInMonths < 6) {
        return 'ROJO';
    } else if (diffInMonths <= 12) {
        return 'AMARILLO';
    } else {
        return 'VERDE';
    }
}

/**
 * Helper to get the Tailwind class for the traffic light status.
 * @param status 
 * @returns {string} Tailwind color class.
 */
export function getTrafficLightColor(status: AuditStatus): string {
    switch (status) {
        case 'ROJO':
            return 'bg-red-500';
        case 'AMARILLO':
            return 'bg-amber-500';
        case 'VERDE':
            return 'bg-emerald-500';
        default:
            return 'bg-gray-400';
    }
}
