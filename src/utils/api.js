// ============================
// API Barrel — Conditionally routes to real API or mock (demo mode)
// ============================

const IS_DEMO = import.meta.env.VITE_DEMO_MODE === 'true';

// In demo mode, use mock implementations from mockApi.js
// In production, use real backend API calls
let authApi, agregaduriasApi, kpisApi, lookupsApi, importApi, exportApi;

if (IS_DEMO) {
    // Dynamic eager import via top-level await is not needed
    // because Vite tree-shakes and statically resolves both paths.
    // We use a different approach: conditional assignment.
    const mock = await import('./mockApi.js');
    authApi = mock.authApi;
    agregaduriasApi = mock.agregaduriasApi;
    kpisApi = mock.kpisApi;
    lookupsApi = mock.lookupsApi;
    importApi = mock.importApi;
    exportApi = mock.exportApi;

    console.info(
        '%c🎭 MODO DEMO ACTIVO — Los datos son simulados. Login: demo / demo',
        'background: #3b82f6; color: white; padding: 4px 12px; border-radius: 4px; font-weight: bold;'
    );
} else {
    // ===== REAL API IMPLEMENTATION =====
    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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
    authApi = {
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
    agregaduriasApi = {
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
    kpisApi = {
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
    lookupsApi = {
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
    importApi = {
        csv: (rows, mode = 'add') =>
            apiFetch('/import/csv', {
                method: 'POST',
                body: JSON.stringify({ rows, mode })
            })
    };

    // ===== EXPORT =====
    exportApi = {
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
}

export { authApi, agregaduriasApi, kpisApi, lookupsApi, importApi, exportApi };
