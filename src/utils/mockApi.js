// ============================
// Mock API — Drop-in replacement for api.js in demo mode
// ============================
import {
    FUERZAS, GRADOS, PAISES, CARGOS,
    AGREGADURIAS as INITIAL_DATA, DEMO_USER
} from './mockData';

// Simulated delay
const delay = (ms = 200) => new Promise(r => setTimeout(r, ms));

// In-memory store (mutable copy)
let _data = [...INITIAL_DATA];
let _nextId = Math.max(..._data.map(d => d.id)) + 1;

// Helper: recalculate diasRestantes from finComision
const calcDias = (fin) => {
    if (!fin) return null;
    const diff = Math.ceil((new Date(fin) - new Date()) / (1000 * 60 * 60 * 24));
    return diff;
};

// Enrich a raw item with computed fields
const enrich = (item) => ({
    ...item,
    diasRestantes: calcDias(item.finComision),
});

// ===== AUTH =====
export const authApi = {
    login: async (username, password) => {
        await delay(300);
        if (username === DEMO_USER.username && password === DEMO_USER.password) {
            return {
                token: DEMO_USER.token,
                username: DEMO_USER.username,
                rol: DEMO_USER.rol,
                nombreCompleto: DEMO_USER.nombreCompleto,
            };
        }
        throw new Error('Credenciales inválidas. Use: demo / demo');
    },

    me: async () => {
        await delay(100);
        const token = localStorage.getItem('pigc-token');
        if (!token) throw new Error('No autenticado');
        return {
            username: DEMO_USER.username,
            rol: DEMO_USER.rol,
            nombreCompleto: DEMO_USER.nombreCompleto,
        };
    },

    register: async (data) => {
        await delay(200);
        return { message: 'Usuario registrado (demo)', ...data };
    },
};

// ===== AGREGADURIAS =====
export const agregaduriasApi = {
    list: async (params = {}) => {
        await delay(150);
        let items = _data.map(enrich);

        // Filter by tipo (Oficial / Suboficial)
        if (params.tipo) {
            const tipoGradoIds = GRADOS.filter(g => g.tipo === params.tipo).map(g => g.id);
            items = items.filter(i => tipoGradoIds.includes(i.gradoId));
        }

        // Filter by fuerza
        if (params.fuerza) {
            items = items.filter(i => i.fuerzaCodigo === params.fuerza || String(i.fuerzaId) === String(params.fuerza));
        }

        // Filter by estado (commission status)
        if (params.estado) {
            switch (params.estado) {
                case 'activas':
                    items = items.filter(i => i.diasRestantes !== null && i.diasRestantes > 0);
                    break;
                case 'proximas':
                    items = items.filter(i => i.diasRestantes !== null && i.diasRestantes > 0 && i.diasRestantes <= 120);
                    break;
                case 'criticas':
                    items = items.filter(i => i.diasRestantes !== null && i.diasRestantes > 0 && i.diasRestantes <= 30);
                    break;
                case 'vencidas':
                    items = items.filter(i => i.diasRestantes !== null && i.diasRestantes < 0);
                    break;
            }
        }

        // Search
        if (params.search) {
            const s = params.search.toLowerCase();
            items = items.filter(i =>
                i.apellidoNombre?.toLowerCase().includes(s) ||
                i.pais?.toLowerCase().includes(s) ||
                i.cargo?.toLowerCase().includes(s) ||
                i.fuerza?.toLowerCase().includes(s) ||
                i.grado?.toLowerCase().includes(s)
            );
        }

        // Sort
        const sortBy = params.sortBy || 'finComision';
        const sortDir = params.sortDir === 'desc' ? -1 : 1;
        items.sort((a, b) => {
            const av = a[sortBy] ?? '';
            const bv = b[sortBy] ?? '';
            if (av < bv) return -1 * sortDir;
            if (av > bv) return 1 * sortDir;
            return 0;
        });

        const totalCount = items.length;
        const pageSize = parseInt(params.pageSize) || 25;
        const page = parseInt(params.page) || 1;
        const totalPages = Math.ceil(totalCount / pageSize);
        const start = (page - 1) * pageSize;
        const paged = items.slice(start, start + pageSize);

        return { items: paged, totalCount, totalPages, page, pageSize };
    },

    getById: async (id) => {
        await delay(100);
        const item = _data.find(i => i.id === parseInt(id));
        if (!item) throw new Error('No encontrado');
        return enrich(item);
    },

    create: async (data) => {
        await delay(200);
        // Resolve lookup names
        const pais = PAISES.find(p => p.id === data.paisId);
        const fuerza = FUERZAS.find(f => f.id === data.fuerzaId);
        const grado = GRADOS.find(g => g.id === data.gradoId);

        const newItem = {
            id: _nextId++,
            ...data,
            pais: pais?.nombre || '',
            fuerza: fuerza?.nombre || '',
            fuerzaCodigo: fuerza?.codigo || '',
            grado: grado?.nombre || '',
            gradoAbreviatura: grado?.abreviatura || '',
            diasRestantes: calcDias(data.finComision),
        };
        _data.push(newItem);
        return newItem;
    },

    update: async (id, data) => {
        await delay(200);
        const idx = _data.findIndex(i => i.id === parseInt(id));
        if (idx === -1) throw new Error('No encontrado');

        const pais = PAISES.find(p => p.id === data.paisId);
        const fuerza = FUERZAS.find(f => f.id === data.fuerzaId);
        const grado = GRADOS.find(g => g.id === data.gradoId);

        _data[idx] = {
            ..._data[idx],
            ...data,
            pais: pais?.nombre || _data[idx].pais,
            fuerza: fuerza?.nombre || _data[idx].fuerza,
            fuerzaCodigo: fuerza?.codigo || _data[idx].fuerzaCodigo,
            grado: grado?.nombre || _data[idx].grado,
            gradoAbreviatura: grado?.abreviatura || _data[idx].gradoAbreviatura,
            diasRestantes: calcDias(data.finComision || _data[idx].finComision),
        };
        return _data[idx];
    },

    delete: async (id) => {
        await delay(150);
        _data = _data.filter(i => i.id !== parseInt(id));
        return { message: 'Eliminado' };
    },
};

// ===== KPIs =====
export const kpisApi = {
    dashboard: async (tipo) => {
        await delay(100);
        let items = _data.map(enrich);

        // Filter by tipo
        if (tipo) {
            const tipoGradoIds = GRADOS.filter(g => g.tipo === tipo).map(g => g.id);
            items = items.filter(i => tipoGradoIds.includes(i.gradoId));
        }

        const totalPersonal = items.length;

        // Count per fuerza
        const porFuerza = FUERZAS.map(f => ({
            nombre: f.nombre,
            codigo: f.codigo,
            cantidad: items.filter(i => i.fuerzaCodigo === f.codigo).length,
        }));

        // Find alerts: commissions ending within 120 days
        const alertas = items
            .filter(i => i.diasRestantes !== null && i.diasRestantes <= 120)
            .map(i => ({
                id: i.id,
                apellidoNombre: i.apellidoNombre,
                pais: i.pais,
                fuerzaCodigo: i.fuerzaCodigo,
                finComision: i.finComision,
                diasRestantes: i.diasRestantes,
                severidad: i.diasRestantes <= 30 ? 'Critica'
                    : i.diasRestantes <= 60 ? 'Alta'
                        : i.diasRestantes <= 90 ? 'Media'
                            : 'Baja',
                cargo: i.cargo,
                relevoPasajeCargos: i.relevoPasajeCargos,
            }))
            .sort((a, b) => a.diasRestantes - b.diasRestantes);

        // Count per country
        const porPais = {};
        items.forEach(i => {
            porPais[i.pais] = (porPais[i.pais] || 0) + 1;
        });

        // Vencimientos por mes (next 12 months)
        const vencimientosPorMes = [];
        const now = new Date();
        for (let m = 0; m < 12; m++) {
            const d = new Date(now.getFullYear(), now.getMonth() + m, 1);
            const mes = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            const cantidad = items.filter(i => {
                if (!i.finComision) return false;
                const fc = new Date(i.finComision);
                return fc.getFullYear() === d.getFullYear() && fc.getMonth() === d.getMonth();
            }).length;
            if (cantidad > 0 || m < 6) {
                vencimientosPorMes.push({ mes, cantidad });
            }
        }

        return { totalPersonal, porFuerza, alertas, porPais, vencimientosPorMes };
    },

    alertas: async (tipo, diasMax = 120) => {
        await delay(100);
        let items = _data.map(enrich);

        if (tipo) {
            const tipoGradoIds = GRADOS.filter(g => g.tipo === tipo).map(g => g.id);
            items = items.filter(i => tipoGradoIds.includes(i.gradoId));
        }

        return items
            .filter(i => i.diasRestantes !== null && i.diasRestantes <= diasMax)
            .sort((a, b) => a.diasRestantes - b.diasRestantes);
    },
};

// ===== LOOKUPS =====
export const lookupsApi = {
    fuerzas: async () => { await delay(50); return FUERZAS; },
    grados: async (fuerzaId, tipo) => {
        await delay(50);
        let g = [...GRADOS];
        if (fuerzaId) g = g.filter(x => x.fuerzaId === parseInt(fuerzaId));
        if (tipo) g = g.filter(x => x.tipo === tipo);
        return g;
    },
    paises: async () => { await delay(50); return PAISES; },
    cargos: async (tipo) => {
        await delay(50);
        return tipo ? CARGOS.filter(c => c.tipo === tipo) : CARGOS;
    },
};

// ===== IMPORT =====
export const importApi = {
    csv: async (rows, mode = 'add') => {
        await delay(300);
        if (mode === 'replace') {
            _data = [];
            _nextId = 1;
        }
        let imported = 0;
        rows.forEach(row => {
            const newItem = {
                id: _nextId++,
                ...row,
                diasRestantes: calcDias(row.finComision),
            };
            _data.push(newItem);
            imported++;
        });
        return { message: `${imported} registros importados`, imported };
    },
};

// ===== EXPORT =====
export const exportApi = {
    csv: async () => {
        await delay(200);
        const items = _data.map(enrich);
        const headers = ['ID', 'País', 'Fuerza', 'Grado', 'Cargo', 'Apellido y Nombre',
            'Fecha Salida', 'Fin Comisión', 'Días Restantes', 'Teléfono', 'Dirección',
            'Correo', 'Nro Decreto', 'Firma Decreto'];
        const csvRows = [headers.join(',')];

        items.forEach(i => {
            csvRows.push([
                i.id, `"${i.pais}"`, `"${i.fuerza}"`, `"${i.grado}"`, `"${i.cargo}"`,
                `"${i.apellidoNombre}"`, i.fechaSalida, i.finComision, i.diasRestantes,
                `"${i.telefonoOficial || ''}"`, `"${i.direccionOficial || ''}"`,
                `"${i.correoElectronico || ''}"`, `"${i.nroDecretoResol || ''}"`,
                `"${i.firmaDecretoResol || ''}"`
            ].join(','));
        });

        const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `PIGC_Export_Demo_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },
};
