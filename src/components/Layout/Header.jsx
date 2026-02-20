import React from 'react';
import { Moon, Sun, Plus, Settings } from 'lucide-react';
import { useData } from '../../context/DataContext';

export const Header = ({ onAddNew, onOpenSettings }) => {
    const { darkMode, toggleDarkMode } = useData();

    return (
        <header className="bg-surface border-b border-border sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo y título */}
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <h1 className="text-xl md:text-2xl font-bold text-primary">
                                Dashboard de Agregadurías
                            </h1>
                            <p className="text-xs text-secondary hidden md:block">
                                Sistema de Gestión - Defensa Nacional
                            </p>
                        </div>
                    </div>

                    {/* Acciones */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={onAddNew}
                            className="btn btn-primary"
                        >
                            <Plus size={20} />
                            <span className="hidden md:inline">Nueva Agregaduría</span>
                            <span className="md:hidden">Nueva</span>
                        </button>

                        <button
                            onClick={onOpenSettings}
                            className="btn btn-secondary"
                            title="Configuración"
                        >
                            <Settings size={20} />
                        </button>

                        <button
                            onClick={toggleDarkMode}
                            className="btn btn-secondary"
                            title={darkMode ? 'Modo Claro' : 'Modo Oscuro'}
                        >
                            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};
