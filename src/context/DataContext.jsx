import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import { agregaduriasApi, kpisApi, lookupsApi, importApi } from '../utils/api';

const DataContext = createContext();
export const useData = () => useContext(DataContext);

export const DataProvider = ({ children }) => {
    const { isAuthenticated } = useAuth();
    const toast = useToast();

    // UI State
    const [darkMode, setDarkMode] = useState(false);
    const [masterFilter, setMasterFilter] = useState(''); // '', 'Oficial', 'Suboficial'
    const [estadoFilter, setEstadoFilter] = useState(''); // '', 'activas', 'proximas', 'criticas', 'vencidas'

    // Data State
    const [agregaduras, setAgregaduras] = useState([]);
    const [allAgregaduras, setAllAgregaduras] = useState([]); // Unpaginated, for map/globe
    const [kpis, setKpis] = useState(null);
    const [lookups, setLookups] = useState({ fuerzas: [], grados: [], paises: [], cargos: [] });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Pagination & Filters
    const [tableParams, setTableParams] = useState({
        page: 1, pageSize: 25,
        search: '', fuerza: '', sortBy: 'finComision', sortDir: 'asc'
    });
    const [totalCount, setTotalCount] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    // Theme
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            setDarkMode(true);
            document.documentElement.setAttribute('data-theme', 'dark');
        }
    }, []);

    const toggleDarkMode = () => {
        const newMode = !darkMode;
        setDarkMode(newMode);
        document.documentElement.setAttribute('data-theme', newMode ? 'dark' : 'light');
        localStorage.setItem('theme', newMode ? 'dark' : 'light');
    };

    // ===== FETCH LOOKUPS (once on auth) =====
    const fetchLookups = useCallback(async () => {
        try {
            const [fuerzas, grados, paises, cargos] = await Promise.all([
                lookupsApi.fuerzas(),
                lookupsApi.grados(),
                lookupsApi.paises(),
                lookupsApi.cargos()
            ]);
            setLookups({ fuerzas, grados, paises, cargos });
        } catch (err) {
            console.error('Error fetching lookups:', err);
        }
    }, []);

    // ===== FETCH AGREGADURIAS (paginated, for table) =====
    const fetchAgregaduras = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const params = {
                ...tableParams,
                tipo: masterFilter || undefined,
                estado: estadoFilter || undefined
            };
            const result = await agregaduriasApi.list(params);
            setAgregaduras(result.items || []);
            setTotalCount(result.totalCount || 0);
            setTotalPages(result.totalPages || 0);
        } catch (err) {
            setError(err.message);
            console.error('Error fetching agregadurias:', err);
        } finally {
            setLoading(false);
        }
    }, [tableParams, masterFilter, estadoFilter]);

    // ===== FETCH ALL AGREGADURIAS (unpaginated, for map/globe/views) =====
    const fetchAllAgregaduras = useCallback(async () => {
        try {
            const params = {
                pageSize: 1000, // Fetch all
                tipo: masterFilter || undefined,
                estado: estadoFilter || undefined
            };
            const result = await agregaduriasApi.list(params);
            setAllAgregaduras(result.items || []);
        } catch (err) {
            console.error('Error fetching all agregadurias:', err);
        }
    }, [masterFilter, estadoFilter]);

    // ===== FETCH KPIs =====
    const fetchKpis = useCallback(async () => {
        try {
            const data = await kpisApi.dashboard(masterFilter || undefined);
            setKpis(data);
        } catch (err) {
            console.error('Error fetching KPIs:', err);
        }
    }, [masterFilter]);

    // ===== UNIFIED REFRESH (parallel) =====
    const refreshData = useCallback(() => {
        return Promise.all([fetchAgregaduras(), fetchAllAgregaduras(), fetchKpis()]);
    }, [fetchAgregaduras, fetchAllAgregaduras, fetchKpis]);

    // ===== EFFECTS: Auto-fetch when authenticated =====
    useEffect(() => {
        if (isAuthenticated) {
            fetchLookups();
        }
    }, [isAuthenticated, fetchLookups]);

    useEffect(() => {
        if (isAuthenticated) {
            fetchAgregaduras();
        }
    }, [isAuthenticated, fetchAgregaduras]);

    useEffect(() => {
        if (isAuthenticated) {
            fetchAllAgregaduras();
        }
    }, [isAuthenticated, fetchAllAgregaduras]);

    useEffect(() => {
        if (isAuthenticated) {
            fetchKpis();
        }
    }, [isAuthenticated, fetchKpis]);

    // ===== CRUD OPERATIONS (with error handling + toasts) =====
    const addAgregadura = async (data) => {
        try {
            await agregaduriasApi.create(data);
            await refreshData();
            toast.success('Registro creado exitosamente');
            return { success: true };
        } catch (err) {
            toast.error(err.message || 'Error al crear el registro');
            throw err;
        }
    };

    const updateAgregadura = async (id, data) => {
        try {
            await agregaduriasApi.update(id, data);
            await refreshData();
            toast.success('Registro actualizado exitosamente');
            return { success: true };
        } catch (err) {
            toast.error(err.message || 'Error al actualizar el registro');
            throw err;
        }
    };

    const deleteAgregadura = async (id) => {
        try {
            await agregaduriasApi.delete(id);
            await refreshData();
            toast.success('Registro eliminado');
            return { success: true };
        } catch (err) {
            toast.error(err.message || 'Error al eliminar el registro');
            throw err;
        }
    };

    // ===== CLEAR ALL DATA =====
    const clearAllData = async () => {
        try {
            // In demo mode this clears via the mock, in real mode hits backend
            await importApi.csv([], 'replace');
            await refreshData();
            toast.success('Todos los datos han sido eliminados');
        } catch (err) {
            toast.error('Error al limpiar los datos: ' + err.message);
            throw err;
        }
    };

    // ===== IMPORT =====
    const importFromCSV = async (rows, mode = 'add') => {
        try {
            const result = await importApi.csv(rows, mode);
            await refreshData();
            toast.success(`Importación completada: ${result.imported || rows.length} registros procesados`);
            return result;
        } catch (err) {
            toast.error(err.message || 'Error al importar datos');
            throw err;
        }
    };

    // ===== TABLE CONTROLS =====
    const setSearch = (search) => setTableParams(p => ({ ...p, search, page: 1 }));
    const setFuerzaFilter = (fuerza) => setTableParams(p => ({ ...p, fuerza, page: 1 }));
    const setSort = (sortBy, sortDir) => setTableParams(p => ({ ...p, sortBy, sortDir }));
    const setPage = (page) => setTableParams(p => ({ ...p, page }));

    const value = {
        // Data
        agregaduras,
        allAgregaduras,
        kpis,
        lookups,
        loading,
        error,
        // Pagination
        totalCount,
        totalPages,
        tableParams,
        // Table controls
        setSearch,
        setFuerzaFilter,
        setSort,
        setPage,
        // Master filter
        masterFilter,
        setMasterFilter,
        // Estado filter
        estadoFilter,
        setEstadoFilter,
        // Theme
        darkMode,
        toggleDarkMode,
        // CRUD
        addAgregadura,
        updateAgregadura,
        deleteAgregadura,
        // Import
        importFromCSV,
        // Clear all
        clearAllData,
        // Refresh
        refreshData
    };

    return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};
