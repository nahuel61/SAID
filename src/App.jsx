import React, { useState, lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { DataProvider } from './context/DataContext';
import { LoginPage } from './components/Auth/LoginPage';
import { Sidebar } from './components/Layout/Sidebar';
import { KPICards } from './components/Dashboard/KPICards';
import { WorldMap } from './components/Dashboard/WorldMap';
import { ExpirationChart } from './components/Dashboard/ExpirationChart';
import { MasterTable } from './components/Table/MasterTable';
import { AgregaturaForm } from './components/Forms/AgregaturaForm';
import { AlertPanel } from './components/Dashboard/AlertPanel';
import { MasterFilter } from './components/Layout/MasterFilter';
import { ErrorBoundary } from './components/UI/ErrorBoundary';
import { useData } from './context/DataContext';
import { LogOut, Plus, Bell, Menu, Loader2 } from 'lucide-react';

// Lazy-loaded view components
const PersonalView = lazy(() => import('./components/Views/PersonalView').then(m => ({ default: m.PersonalView })));
const MapaGlobalView = lazy(() => import('./components/Views/MapaGlobalView').then(m => ({ default: m.MapaGlobalView })));
const InformesView = lazy(() => import('./components/Views/InformesView').then(m => ({ default: m.InformesView })));
const ConfigView = lazy(() => import('./components/Views/ConfigView').then(m => ({ default: m.ConfigView })));
const AnalyticsView = lazy(() => import('./components/Views/AnalyticsView').then(m => ({ default: m.AnalyticsView })));

const ROUTE_META = {
    '/': { title: 'Situación de Agregadurías', subtitle: 'Control de Misiones en el Exterior', pageTitle: 'Dashboard' },
    '/personal': { title: 'Personal', subtitle: 'Gestión de misiones exteriores', pageTitle: 'Personal' },
    '/mapa': { title: 'Mapa Global', subtitle: 'Distribución geográfica', pageTitle: 'Mapa Global' },
    '/informes': { title: 'Informes', subtitle: 'Estadísticas y reportes', pageTitle: 'Informes' },
    '/analytics': { title: 'Analytics', subtitle: 'Métricas y tendencias avanzadas', pageTitle: 'Analytics' },
    '/config': { title: 'Configuración', subtitle: 'Administración del sistema', pageTitle: 'Configuración' },
};

// View loading fallback
const ViewSpinner = () => (
    <div className="flex items-center justify-center py-20">
        <Loader2 size={28} className="animate-spin text-primary" />
    </div>
);

// Inner app component that uses contexts
const DashboardApp = () => {
    const { user, logout, hasRole } = useAuth();
    const { kpis } = useData();
    const location = useLocation();
    const navigate = useNavigate();

    const [showForm, setShowForm] = useState(false);
    const [showAlerts, setShowAlerts] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [editData, setEditData] = useState(null);

    const handleAddNew = () => {
        setEditData(null);
        setShowForm(true);
    };

    const handleEdit = (data) => {
        setEditData(data);
        setShowForm(true);
    };

    const handleCloseForm = () => {
        setShowForm(false);
        setEditData(null);
    };

    const alertCount = kpis?.alertas?.filter(a => a.severidad === 'Critica').length || 0;
    const currentPath = location.pathname;
    const viewInfo = ROUTE_META[currentPath] || ROUTE_META['/'];

    // Dynamic document title
    React.useEffect(() => {
        document.title = `${viewInfo.pageTitle} — PIGC`;
    }, [viewInfo.pageTitle]);

    // Map route IDs for views that need it (dashboard & personal show filters)
    const activeViewId = currentPath === '/' ? 'dashboard' :
        currentPath.replace('/', '');

    const showFilters = activeViewId === 'dashboard' || activeViewId === 'personal';

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark flex overflow-hidden font-display">
            {/* Sidebar */}
            <Sidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

            {/* Main Content */}
            <main className="flex-1 lg:ml-64 p-4 sm:p-6 lg:p-8 overflow-y-auto h-screen relative">
                {/* Top Bar */}
                <header className="flex justify-between items-center mb-6 lg:mb-8 gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                        {/* Hamburger on mobile */}
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 flex-shrink-0"
                        >
                            <Menu size={22} />
                        </button>
                        <div className="min-w-0">
                            <h2 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white tracking-tight truncate">
                                {viewInfo.title}
                            </h2>
                            <p className="text-xs lg:text-sm text-gray-500 dark:text-gray-400 mt-0.5 truncate hidden sm:block">
                                {viewInfo.subtitle} — {user?.nombreCompleto || user?.username}
                                <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-medium"
                                    style={{
                                        background: user?.rol === 'Admin' ? 'rgba(239,68,68,0.15)' : user?.rol === 'Editor' ? 'rgba(59,130,246,0.15)' : 'rgba(107,114,128,0.15)',
                                        color: user?.rol === 'Admin' ? '#ef4444' : user?.rol === 'Editor' ? '#3b82f6' : '#6b7280'
                                    }}>
                                    {user?.rol}
                                </span>
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 lg:gap-3 flex-shrink-0">
                        {/* Master Filter — show on dashboard & personal, hidden on small screens */}
                        {showFilters && (
                            <div className="hidden md:block">
                                <MasterFilter />
                            </div>
                        )}

                        {/* Alerts indicator */}
                        {alertCount > 0 && (
                            <button
                                onClick={() => setShowAlerts(true)}
                                className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-card-dark transition-colors"
                                title="Ver alertas"
                            >
                                <Bell className="text-gray-500 dark:text-gray-400" size={20} />
                                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center font-bold animate-pulse">
                                    {alertCount}
                                </span>
                            </button>
                        )}

                        {/* Add new — show on dashboard view */}
                        {activeViewId === 'dashboard' && hasRole('Editor') && (
                            <button
                                onClick={handleAddNew}
                                className="flex items-center gap-2 bg-primary hover:bg-blue-700 text-white px-3 lg:px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-primary/30"
                            >
                                <Plus size={16} />
                                <span className="hidden sm:inline">Nueva Misión</span>
                            </button>
                        )}

                        <button
                            onClick={logout}
                            className="p-2 rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20 transition-colors"
                            title="Cerrar sesión"
                        >
                            <LogOut size={18} />
                        </button>
                    </div>
                </header>

                {/* Mobile filter bar */}
                {showFilters && (
                    <div className="md:hidden mb-4">
                        <MasterFilter />
                    </div>
                )}

                {/* View Content wrapped in ErrorBoundary + Suspense */}
                <ErrorBoundary key={currentPath}>
                    <Suspense fallback={<ViewSpinner />}>
                        <Routes>
                            <Route path="/" element={
                                <>
                                    <KPICards />
                                    <div className="mb-6 lg:mb-8">
                                        <WorldMap />
                                    </div>
                                    <div className="mb-6 lg:mb-8">
                                        <ExpirationChart />
                                    </div>
                                    <MasterTable onEdit={handleEdit} />
                                </>
                            } />
                            <Route path="/personal" element={<PersonalView />} />
                            <Route path="/mapa" element={<MapaGlobalView />} />
                            <Route path="/informes" element={<InformesView />} />
                            <Route path="/analytics" element={<AnalyticsView />} />
                            <Route path="/config" element={<ConfigView />} />
                            <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                    </Suspense>
                </ErrorBoundary>
            </main>

            {/* Modals */}
            {showForm && hasRole('Editor') && (
                <AgregaturaForm onClose={handleCloseForm} editData={editData} />
            )}

            {showAlerts && (
                <AlertPanel onClose={() => setShowAlerts(false)} />
            )}
        </div>
    );
};

// Root App with providers and auth guard
function App() {
    return (
        <ToastProvider>
            <AuthProvider>
                <ErrorBoundary>
                    <AppRouter />
                </ErrorBoundary>
            </AuthProvider>
        </ToastProvider>
    );
}

const AppRouter = () => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center"
                style={{ background: '#101622' }}>
                <div className="text-center">
                    <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-400 text-sm">Cargando PIGC...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <LoginPage />;
    }

    return (
        <DataProvider>
            <DashboardApp />
        </DataProvider>
    );
};

export default App;
