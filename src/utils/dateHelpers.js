import { differenceInDays, parseISO, format, isValid } from 'date-fns';

/**
 * Calcula los días restantes desde hoy hasta la fecha de fin de comisión
 */
export const calculateDaysRemaining = (endDate) => {
    if (!endDate) return null;

    try {
        let date;

        // Si es string en formato dd/mm/yyyy, convertir a ISO
        if (typeof endDate === 'string' && endDate.includes('/')) {
            const [day, month, year] = endDate.split('/');
            date = new Date(year, month - 1, day);
        } else if (typeof endDate === 'string') {
            date = parseISO(endDate);
        } else {
            date = endDate;
        }

        if (!isValid(date)) return null;

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return differenceInDays(date, today);
    } catch (error) {
        console.error('Error calculating days remaining:', error);
        return null;
    }
};

/**
 * Formatea una fecha para mostrar
 */
export const formatDate = (date) => {
    if (!date) return '';

    try {
        let parsedDate;

        if (typeof date === 'string' && date.includes('/')) {
            const [day, month, year] = date.split('/');
            parsedDate = new Date(year, month - 1, day);
        } else if (typeof date === 'string') {
            parsedDate = parseISO(date);
        } else {
            parsedDate = date;
        }

        if (!isValid(parsedDate)) return date;

        return format(parsedDate, 'dd/MM/yyyy');
    } catch (error) {
        return date;
    }
};

/**
 * Convierte fecha de input (yyyy-MM-dd) a formato local (dd/MM/yyyy)
 */
export const inputDateToLocal = (inputDate) => {
    if (!inputDate) return '';
    try {
        const date = parseISO(inputDate);
        return format(date, 'dd/MM/yyyy');
    } catch (error) {
        return inputDate;
    }
};

/**
 * Convierte fecha local (dd/MM/yyyy) a formato input (yyyy-MM-dd)
 */
export const localDateToInput = (localDate) => {
    if (!localDate) return '';
    try {
        if (typeof localDate === 'string' && localDate.includes('/')) {
            const [day, month, year] = localDate.split('/');
            return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        }
        return localDate;
    } catch (error) {
        return localDate;
    }
};
