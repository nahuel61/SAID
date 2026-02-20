/**
 * Parsea archivo CSV y devuelve array de objetos
 * Omite las primeras 3 filas (encabezados institucionales)
 */
export const parseCSV = (csvContent) => {
    try {
        const lines = csvContent.split('\n').filter(line => line.trim());

        // Omitir primeras 3 filas
        const dataLines = lines.slice(3);

        if (dataLines.length === 0) {
            throw new Error('CSV vacío o sin datos válidos');
        }

        // La fila 0 (que era la fila 4 original) contiene los headers
        const headers = dataLines[0].split(';').map(h => h.trim());

        // Parsear datos (desde la fila 1 en adelante)
        const data = [];
        for (let i = 1; i < dataLines.length; i++) {
            const values = dataLines[i].split(';');

            if (values.length < headers.length) continue;

            const row = {
                id: `csv-${Date.now()}-${i}`,
                createdAt: new Date().toISOString()
            };

            headers.forEach((header, index) => {
                const value = values[index]?.trim() || '';

                // Mapeo de columnas
                switch (header.toLowerCase()) {
                    case 'país':
                    case 'pais':
                        row.pais = cleanCountryField(value);
                        break;
                    case 'cargo':
                        row.cargo = value;
                        break;
                    case 'fuerza':
                        row.fuerza = value;
                        break;
                    case 'grado':
                        row.grado = value;
                        break;
                    case 'apellido y nombre':
                        row.apellidoNombre = value;
                        break;
                    case 'fecha salida de argentina':
                        row.fechaSalida = value;
                        break;
                    case 'fin comisión':
                    case 'fin comision':
                        row.finComision = value;
                        break;
                    case 'telefono oficial':
                    case 'teléfono oficial':
                        row.telefono = cleanPhoneField(value);
                        break;
                    case 'dirección oficial':
                    case 'direccion oficial':
                        row.direccion = value;
                        break;
                    case 'correo electrónico agregaduría':
                    case 'correo electronico agregaduria':
                        row.email = value;
                        break;
                    default:
                        break;
                }
            });

            if (row.pais || row.apellidoNombre) {
                data.push(row);
            }
        }

        return data;
    } catch (error) {
        console.error('Error parsing CSV:', error);
        throw new Error('Error al procesar el archivo CSV: ' + error.message);
    }
};

/**
 * Limpia campo de país extrayendo el nombre principal
 */
export const cleanCountryField = (countryValue) => {
    if (!countryValue) return '';

    // Extraer primera línea (país principal)
    const lines = countryValue.split('\n').filter(l => l.trim());
    if (lines.length === 0) return '';

    // Remover caracteres especiales y números al inicio
    let mainCountry = lines[0]
        .replace(/^["'\d\s]+/, '')
        .replace(/["']/g, '')
        .trim();

    return mainCountry;
};

/**
 * Limpia campo de teléfono separando fijos, celulares y fax
 */
export const cleanPhoneField = (phoneValue) => {
    if (!phoneValue) return '';

    const lines = phoneValue.split('\n').filter(l => l.trim());
    const phones = [];

    lines.forEach(line => {
        line = line.replace(/^["'\s]+/, '').replace(/["']/g, '').trim();

        // Identificar tipo
        if (line.toLowerCase().includes('fax')) {
            phones.push(`FAX: ${line.replace(/fax:/gi, '').trim()}`);
        } else if (line.toLowerCase().includes('cel')) {
            phones.push(`Cel: ${line.replace(/cel:/gi, '').trim()}`);
        } else if (line.match(/^\d/) || line.match(/^\(/)) {
            phones.push(line);
        }
    });

    return phones.join(' | ');
};

/**
 * Exporta datos a formato CSV
 */
export const exportToCSV = (agregaduras) => {
    const headers = [
        'País',
        'Cargo',
        'Fuerza',
        'Grado',
        'Apellido y Nombre',
        'Fecha Salida',
        'Fin Comisión',
        'Días Restantes',
        'Teléfono',
        'Dirección',
        'Email'
    ];

    const rows = agregaduras.map(item => [
        item.pais || '',
        item.cargo || '',
        item.fuerza || '',
        item.grado || '',
        item.apellidoNombre || '',
        item.fechaSalida || '',
        item.finComision || '',
        item.diasRestantes !== null ? item.diasRestantes : '',
        item.telefono || '',
        item.direccion || '',
        item.email || ''
    ]);

    const csvContent = [
        headers.join(';'),
        ...rows.map(row => row.join(';'))
    ].join('\n');

    return csvContent;
};

/**
 * Descarga datos como archivo CSV
 */
export const downloadCSV = (csvContent, filename = 'agregadurias.csv') => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
