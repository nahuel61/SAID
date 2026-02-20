import React from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { X } from 'lucide-react';

export const Sidebar = ({ activeView, onNavigate, isOpen, onClose }) => {
    const { agregaduras } = useData();
    const { user } = useAuth();

    const navItems = [
        { id: 'dashboard', icon: 'dashboard', label: 'Dashboard' },
        { id: 'personal', icon: 'people', label: 'Personal', badge: agregaduras.length },
        { id: 'mapa', icon: 'public', label: 'Mapa Global' },
        { id: 'informes', icon: 'analytics', label: 'Informes' },
    ];

    const systemItems = [
        { id: 'config', icon: 'settings', label: 'Configuración' },
    ];

    const handleNavigate = (id) => {
        onNavigate(id);
        if (onClose) onClose(); // close on mobile after navigation
    };

    const NavLink = ({ item }) => {
        const isActive = activeView === item.id;
        return (
            <button
                onClick={() => handleNavigate(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg ${isActive
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                    } transition-colors group`}
            >
                <span className={`material-icons text-xl ${isActive ? '' : 'group-hover:text-primary'} transition-colors`}>
                    {item.icon}
                </span>
                <span>{item.label}</span>
                {item.badge > 0 && (
                    <span className={`ml-auto text-xs px-2 py-0.5 rounded-full ${isActive
                            ? 'bg-primary/20 text-primary'
                            : 'bg-gray-200 dark:bg-gray-700'
                        }`}>
                        {item.badge}
                    </span>
                )}
            </button>
        );
    };

    const initials = (user?.nombreCompleto || user?.username || 'U')
        .split(' ')
        .map(w => w[0])
        .join('')
        .substring(0, 2)
        .toUpperCase();

    return (
        <>
            {/* Mobile overlay backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                w-64 bg-white dark:bg-[#0b0f17] border-r border-gray-200 dark:border-gray-800
                flex flex-col h-screen fixed z-50 transition-transform duration-300
                lg:translate-x-0 lg:z-30
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                {/* Logo Area */}
                <div className="h-20 flex items-center justify-between px-6 border-b border-gray-200 dark:border-gray-800">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
                            <span className="material-icons text-xl">shield</span>
                        </div>
                        <div>
                            <h1 className="text-sm font-bold uppercase tracking-wider text-gray-900 dark:text-white leading-tight">
                                EMCO
                            </h1>
                            <p className="text-[10px] text-gray-500 uppercase tracking-wide">
                                Fuerzas Armadas
                            </p>
                        </div>
                    </div>
                    {/* Close button on mobile */}
                    <button
                        onClick={onClose}
                        className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Navigation Menu */}
                <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
                    <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                        Principal
                    </p>

                    {navItems.map(item => (
                        <NavLink key={item.id} item={item} />
                    ))}

                    <div className="pt-6">
                        <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                            Sistema
                        </p>
                        {systemItems.map(item => (
                            <NavLink key={item.id} item={item} />
                        ))}
                    </div>
                </nav>

                {/* User Profile */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-800">
                    <div
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                        onClick={() => handleNavigate('config')}
                    >
                        <div className="w-9 h-9 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-semibold text-sm">
                            {initials}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                {user?.nombreCompleto || user?.username || 'Usuario'}
                            </p>
                            <p className="text-xs text-gray-500 truncate">{user?.rol}</p>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
};
