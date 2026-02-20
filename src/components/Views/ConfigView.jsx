import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { CSVImporter } from '../ImportExport/CSVImporter';
import { DataExporter } from '../ImportExport/DataExporter';
import { UserForm } from '../Forms/UserForm';
import {
    Settings, Upload, Download, Trash2, Moon, Sun,
    Shield, User, Database, Info, Monitor, Users
} from 'lucide-react';

export const ConfigView = () => {
    const { user, hasRole } = useAuth();
    const { darkMode, toggleDarkMode, clearAllData, agregaduras } = useData();
    const [showImporter, setShowImporter] = useState(false);
    const [showUserForm, setShowUserForm] = useState(false);

    const handleClearData = () => {
        if (window.confirm('¿Está seguro de eliminar TODOS los datos? Esta acción no se puede deshacer.')) {
            if (window.confirm('Confirmación final: Se eliminarán todos los registros permanentemente.')) {
                clearAllData();
                alert('Todos los datos han sido eliminados');
            }
        }
    };

    return (
        <div>
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                    Configuración
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Administración del sistema y preferencias
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* User Management (Admin Only) */}
                {hasRole('Admin') && (
                    <div className="bg-white dark:bg-card-dark rounded-xl border border-gray-200 dark:border-gray-700 p-6 lg:col-span-2">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                <Users size={18} className="text-primary" />
                                Gestión de Usuarios
                            </h3>
                            <button
                                onClick={() => setShowUserForm(true)}
                                className="btn btn-sm btn-primary"
                            >
                                <User size={16} className="mr-2" />
                                Nuevo Usuario
                            </button>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Cree nuevos usuarios con roles específicos (Admin, Editor, Viewer).
                        </p>
                    </div>
                )}

                {/* User Profile */}
                <div className="bg-white dark:bg-card-dark rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <User size={18} className="text-primary" />
                        Perfil de Usuario
                    </h3>
                    <div className="space-y-4">
                        <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-blue-700 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-primary/20">
                                {(user?.username || 'U')[0].toUpperCase()}
                            </div>
                            <div>
                                <p className="font-semibold text-gray-900 dark:text-white text-lg">
                                    {user?.nombreCompleto || user?.username}
                                </p>
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${user?.rol === 'Admin'
                                    ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                    : user?.rol === 'Editor'
                                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                        : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                                    }`}>
                                    <Shield size={12} />
                                    {user?.rol}
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                                <p className="text-gray-400 text-xs">Usuario</p>
                                <p className="font-medium text-gray-900 dark:text-white">{user?.username}</p>
                            </div>
                            <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                                <p className="text-gray-400 text-xs">Rol</p>
                                <p className="font-medium text-gray-900 dark:text-white">{user?.rol}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Appearance */}
                <div className="bg-white dark:bg-card-dark rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <Monitor size={18} className="text-purple-500" />
                        Apariencia
                    </h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                            <div className="flex items-center gap-3">
                                {darkMode ? <Moon size={20} className="text-blue-400" /> : <Sun size={20} className="text-amber-500" />}
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-white">Modo {darkMode ? 'Oscuro' : 'Claro'}</p>
                                    <p className="text-xs text-gray-500">Cambiar tema visual</p>
                                </div>
                            </div>
                            <button
                                onClick={toggleDarkMode}
                                className={`relative w-12 h-6 rounded-full transition-colors ${darkMode ? 'bg-blue-600' : 'bg-gray-300'}`}
                            >
                                <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${darkMode ? 'translate-x-6' : ''}`} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Import/Export */}
                <div className="bg-white dark:bg-card-dark rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <Database size={18} className="text-green-500" />
                        Importar / Exportar Datos
                    </h3>
                    <div className="space-y-3">
                        {hasRole('Editor') && (
                            <button
                                onClick={() => setShowImporter(true)}
                                className="w-full flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors text-left"
                            >
                                <Upload size={20} className="text-blue-600 dark:text-blue-400" />
                                <div>
                                    <p className="font-medium text-blue-700 dark:text-blue-300">Importar desde CSV</p>
                                    <p className="text-xs text-blue-500 dark:text-blue-400">Cargar datos desde archivo CSV</p>
                                </div>
                            </button>
                        )}

                        <DataExporter />

                        <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg text-sm">
                            <div className="flex items-center justify-between">
                                <span className="text-gray-500">Registros actuales</span>
                                <span className="font-semibold text-gray-900 dark:text-white">{agregaduras.length}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Danger Zone */}
                {hasRole('Admin') && (
                    <div className="bg-white dark:bg-card-dark rounded-xl border border-red-200 dark:border-red-900 p-6">
                        <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-4 flex items-center gap-2">
                            <Trash2 size={18} />
                            Zona de Peligro
                        </h3>
                        <div className="space-y-3">
                            <button
                                onClick={handleClearData}
                                className="w-full flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors text-left"
                            >
                                <Trash2 size={20} className="text-red-600 dark:text-red-400" />
                                <div>
                                    <p className="font-medium text-red-700 dark:text-red-300">Eliminar Todos los Datos</p>
                                    <p className="text-xs text-red-500 dark:text-red-400">
                                        Esta acción no se puede deshacer
                                    </p>
                                </div>
                            </button>
                        </div>
                    </div>
                )}

                {/* About */}
                <div className="bg-white dark:bg-card-dark rounded-xl border border-gray-200 dark:border-gray-700 p-6 lg:col-span-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <Info size={18} className="text-gray-500" />
                        Acerca del Sistema
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                            <p className="text-xs text-gray-400 mb-1">Sistema</p>
                            <p className="font-medium text-gray-900 dark:text-white text-sm">PIGC v2.0</p>
                        </div>
                        <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                            <p className="text-xs text-gray-400 mb-1">Backend</p>
                            <p className="font-medium text-gray-900 dark:text-white text-sm">.NET 8 + SQLite</p>
                        </div>
                        <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                            <p className="text-xs text-gray-400 mb-1">Frontend</p>
                            <p className="font-medium text-gray-900 dark:text-white text-sm">React + Vite</p>
                        </div>
                        <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                            <p className="text-xs text-gray-400 mb-1">Autenticación</p>
                            <p className="font-medium text-gray-900 dark:text-white text-sm">JWT + BCrypt</p>
                        </div>
                    </div>
                    <p className="text-xs text-gray-400 mt-4">
                        Plataforma Integral de Gestión de Comisiones — Estado Mayor Conjunto de las Fuerzas Armadas
                    </p>
                </div>
            </div>

            {showImporter && <CSVImporter onClose={() => setShowImporter(false)} />}
            {showUserForm && <UserForm onClose={() => setShowUserForm(false)} />}
        </div>
    );
};
