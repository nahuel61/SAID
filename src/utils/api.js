// API client for PIGC backend
const API_BASE = 'http://localhost:5000/api';

// Get stored token
const getToken = () => localStorage.getItem('pigc-token');

// Generic fetch wrapper with auth
async function apiFetch(endpoint, options = {}) {
    const token = getToken();
    const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers
    };

    const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers
    });

    if (response.status === 401) {
        localStorage.removeItem('pigc-token');
        localStorage.removeItem('pigc-user');
        window.location.reload();
        throw new Error('Sesión expirada');
    }

    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(error.message || `Error ${response.status}`);
    }

    return response.json();
}

// ===== AUTH =====
export const authApi = {
    login: (username, password) =>
        apiFetch('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username, password })
        }),

    me: () => apiFetch('/auth/me'),
    register: (data) => apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data)
    })
};

// ===== AGREGADURIAS =====
export const agregaduriasApi = {
    list: (params = {}) => {
        const query = new URLSearchParams();
        if (params.fuerza) query.set('fuerza', params.fuerza);
        if (params.tipo) query.set('tipo', params.tipo);
        if (params.search) query.set('search', params.search);
        if (params.sortBy) query.set('sortBy', params.sortBy);
        if (params.sortDir) query.set('sortDir', params.sortDir);
        if (params.page) query.set('page', params.page);
        if (params.pageSize) query.set('pageSize', params.pageSize);
        return apiFetch(`/agregadurias?${query.toString()}`);
    },

    getById: (id) => apiFetch(`/agregadurias/${id}`),

    create: (data) =>
        apiFetch('/agregadurias', {
            method: 'POST',
            body: JSON.stringify(data)
        }),

    update: (id, data) =>
        apiFetch(`/agregadurias/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        }),

    delete: (id) =>
        apiFetch(`/agregadurias/${id}`, { method: 'DELETE' })
};

// ===== KPIs =====
export const kpisApi = {
    dashboard: (tipo) => {
        const query = tipo ? `?tipo=${tipo}` : '';
        return apiFetch(`/kpis${query}`);
    },

    alertas: (tipo, diasMax = 120) => {
        const query = new URLSearchParams();
        if (tipo) query.set('tipo', tipo);
        query.set('diasMax', diasMax);
        return apiFetch(`/kpis/alertas?${query.toString()}`);
    }
};

// ===== LOOKUPS =====
export const lookupsApi = {
    fuerzas: () => apiFetch('/lookups/fuerzas'),
    grados: (fuerzaId, tipo) => {
        const query = new URLSearchParams();
        if (fuerzaId) query.set('fuerzaId', fuerzaId);
        if (tipo) query.set('tipo', tipo);
        return apiFetch(`/lookups/grados?${query.toString()}`);
    },
    paises: () => apiFetch('/lookups/paises'),
    cargos: (tipo) => {
        const query = tipo ? `?tipo=${tipo}` : '';
        return apiFetch(`/lookups/cargos${query}`);
    }
};

// ===== IMPORT =====
export const importApi = {
    csv: (rows, mode = 'add') =>
        apiFetch('/import/csv', {
            method: 'POST',
            body: JSON.stringify({ rows, mode })
        })
};

// ===== EXPORT =====
export const exportApi = {
    csv: async (tipo) => {
        const token = getToken();
        const query = tipo ? `?tipo=${tipo}` : '';
        const response = await fetch(`${API_BASE}/export/csv${query}`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        if (!response.ok) throw new Error('Error al exportar');
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `PIGC_Export_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
};
