/**
 * Filtra agregadurías por término de búsqueda
 */
export const searchAgregaduras = (agregaduras, searchTerm) => {
    if (!searchTerm) return agregaduras;

    const term = searchTerm.toLowerCase();
    return agregaduras.filter(item =>
        Object.values(item).some(value =>
            String(value).toLowerCase().includes(term)
        )
    );
};

/**
 * Filtra por fuerza
 */
export const filterByFuerza = (agregaduras, fuerza) => {
    if (!fuerza || fuerza === 'todas') return agregaduras;
    return agregaduras.filter(item => item.fuerza === fuerza);
};

/**
 * Filtra por grado
 */
export const filterByGrado = (agregaduras, grado) => {
    if (!grado || grado === 'todos') return agregaduras;
    return agregaduras.filter(item => item.grado === grado);
};

/**
 * Ordena agregadurías por campo
 */
export const sortAgregaduras = (agregaduras, field, direction = 'asc') => {
    const sorted = [...agregaduras].sort((a, b) => {
        const aValue = a[field];
        const bValue = b[field];

        if (aValue === undefined || bValue === undefined) return 0;

        // Si son fechas
        if (field.includes('fecha') || field.includes('Fecha')) {
            const aDate = new Date(aValue);
            const bDate = new Date(bValue);
            return direction === 'asc' ? aDate - bDate : bDate - aDate;
        }

        // Si son números
        if (typeof aValue === 'number' && typeof bValue === 'number') {
            return direction === 'asc' ? aValue - bValue : bValue - aValue;
        }

        // Si son strings
        const comparison = String(aValue).localeCompare(String(bValue));
        return direction === 'asc' ? comparison : -comparison;
    });

    return sorted;
};

/**
 * Obtiene lista única de fuerzas
 */
export const getUniqueFuerzas = (agregaduras) => {
    const fuerzas = agregaduras.map(item => item.fuerza).filter(Boolean);
    return ['todas', ...new Set(fuerzas)];
};

/**
 * Obtiene lista única de grados
 */
export const getUniqueGrados = (agregaduras) => {
    const grados = agregaduras.map(item => item.grado).filter(Boolean);
    return ['todos', ...new Set(grados)];
};

/**
 * Cuenta agregadurías por fuerza
 */
export const countByFuerza = (agregaduras) => {
    const counts = { EA: 0, ARA: 0, FAA: 0 };
    agregaduras.forEach(item => {
        if (counts.hasOwnProperty(item.fuerza)) {
            counts[item.fuerza]++;
        }
    });
    return counts;
};

/**
 * Obtiene agregadurías con comisión por vencer (próximos N días)
 */
export const getExpiringCommissions = (agregaduras, daysThreshold = 60) => {
    return agregaduras.filter(item => {
        const daysRemaining = item.diasRestantes;
        return daysRemaining !== null && daysRemaining >= 0 && daysRemaining <= daysThreshold;
    });
};

/**
 * Agrupa vencimientos por mes
 */
export const groupExpirationsByMonth = (agregaduras) => {
    const groups = {};

    agregaduras.forEach(item => {
        if (!item.finComision) return;

        try {
            let date;
            if (typeof item.finComision === 'string' && item.finComision.includes('/')) {
                const [day, month, year] = item.finComision.split('/');
                date = new Date(year, month - 1, day);
            } else {
                date = new Date(item.finComision);
            }

            const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

            if (!groups[monthYear]) {
                groups[monthYear] = 0;
            }
            groups[monthYear]++;
        } catch (error) {
            console.error('Error grouping by month:', error);
        }
    });

    return Object.entries(groups)
        .map(([month, count]) => ({ month, count }))
        .sort((a, b) => a.month.localeCompare(b.month));
};
