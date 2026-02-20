import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { agregaduriasApi, kpisApi, lookupsApi, importApi } from '../utils/api';

const DataContext = createContext();
export const useData = () => useContext(DataContext);

export const DataProvider = ({ children }) => {
    const { isAuthenticated } = useAuth();

    // UI State
    const [darkMode, setDarkMode] = useState(false);
    const [masterFilter, setMasterFilter] = useState(''); // '', 'Oficial', 'Suboficial'

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
                tipo: masterFilter || undefined
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
    }, [tableParams, masterFilter]);

    // ===== FETCH ALL AGREGADURIAS (unpaginated, for map/globe/views) =====
    const fetchAllAgregaduras = useCallback(async () => {
        try {
            const params = {
                pageSize: 1000, // Fetch all
                tipo: masterFilter || undefined
            };
            const result = await agregaduriasApi.list(params);
            setAllAgregaduras(result.items || []);
        } catch (err) {
            console.error('Error fetching all agregadurias:', err);
        }
    }, [masterFilter]);

    // ===== FETCH KPIs =====
    const fetchKpis = useCallback(async () => {
        try {
            const data = await kpisApi.dashboard(masterFilter || undefined);
            setKpis(data);
        } catch (err) {
            console.error('Error fetching KPIs:', err);
        }
    }, [masterFilter]);

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

    // ===== CRUD OPERATIONS =====
    const addAgregadura = async (data) => {
        await agregaduriasApi.create(data);
        await fetchAgregaduras();
        await fetchAllAgregaduras();
        await fetchKpis();
    };

    const updateAgregadura = async (id, data) => {
        await agregaduriasApi.update(id, data);
        await fetchAgregaduras();
        await fetchAllAgregaduras();
        await fetchKpis();
    };

    const deleteAgregadura = async (id) => {
        await agregaduriasApi.delete(id);
        await fetchAgregaduras();
        await fetchAllAgregaduras();
        await fetchKpis();
    };

    // ===== IMPORT =====
    const importFromCSV = async (rows, mode = 'add') => {
        const result = await importApi.csv(rows, mode);
        await fetchAgregaduras();
        await fetchAllAgregaduras();
        await fetchKpis();
        return result;
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
        // Theme
        darkMode,
        toggleDarkMode,
        // CRUD
        addAgregadura,
        updateAgregadura,
        deleteAgregadura,
        // Import
        importFromCSV,
        // Refresh
        refreshData: () => { fetchAgregaduras(); fetchAllAgregaduras(); fetchKpis(); }
    };

    return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};
