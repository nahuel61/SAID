import React, { useState, useEffect } from 'react';
import { X, AlertTriangle, AlertCircle, Info, Clock, MapPin, Shield, Bell } from 'lucide-react';
import { useData } from '../../context/DataContext';

const severityConfig = {
    Critica: {
        icon: AlertCircle,
        bg: 'bg-red-50 dark:bg-red-900/20',
        border: 'border-red-200 dark:border-red-800',
        text: 'text-red-700 dark:text-red-400',
        badge: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
        label: 'Crítica',
        dot: 'bg-red-500'
    },
    Advertencia: {
        icon: AlertTriangle,
        bg: 'bg-amber-50 dark:bg-amber-900/20',
        border: 'border-amber-200 dark:border-amber-800',
        text: 'text-amber-700 dark:text-amber-400',
        badge: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
        label: 'Advertencia',
        dot: 'bg-amber-500'
    },
    Informacion: {
        icon: Info,
        bg: 'bg-blue-50 dark:bg-blue-900/20',
        border: 'border-blue-200 dark:border-blue-800',
        text: 'text-blue-700 dark:text-blue-400',
        badge: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
        label: 'Información',
        dot: 'bg-blue-500'
    }
};

export const AlertPanel = ({ onClose }) => {
    const { kpis } = useData();
    const alertas = kpis?.alertas || [];
    const [filter, setFilter] = useState('all');

    const filtered = filter === 'all'
        ? alertas
        : alertas.filter(a => a.severidad === filter);

    const countBySeverity = {
        Critica: alertas.filter(a => a.severidad === 'Critica').length,
        Advertencia: alertas.filter(a => a.severidad === 'Advertencia').length,
        Informacion: alertas.filter(a => a.severidad === 'Informacion').length
    };

    const formatDate = (dateStr) => {
        try {
            return new Date(dateStr).toLocaleDateString('es-AR', {
                day: '2-digit', month: 'short', year: 'numeric'
            });
        } catch {
            return dateStr;
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-end" onClick={onClose}>
            <div
                className="w-full max-w-lg bg-white dark:bg-gray-900 shadow-2xl h-full overflow-hidden flex flex-col animate-slide-in"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-red-500/10 to-amber-500/10">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-red-100 dark:bg-red-900/30">
                                <Bell className="text-red-600 dark:text-red-400" size={22} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                    Centro de Alertas
                                </h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {alertas.length} vencimiento{alertas.length !== 1 ? 's' : ''} próximo{alertas.length !== 1 ? 's' : ''}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                            <X className="text-gray-500" size={20} />
                        </button>
                    </div>

                    {/* Severity filter pills */}
                    <div className="flex gap-2 mt-4">
                        <FilterPill
                            active={filter === 'all'}
                            onClick={() => setFilter('all')}
                            label={`Todas (${alertas.length})`}
                            color="gray"
                        />
                        <FilterPill
                            active={filter === 'Critica'}
                            onClick={() => setFilter('Critica')}
                            label={`Críticas (${countBySeverity.Critica})`}
                            color="red"
                            dot
                        />
                        <FilterPill
                            active={filter === 'Advertencia'}
                            onClick={() => setFilter('Advertencia')}
                            label={`Advertencia (${countBySeverity.Advertencia})`}
                            color="amber"
                            dot
                        />
                        <FilterPill
                            active={filter === 'Informacion'}
                            onClick={() => setFilter('Informacion')}
                            label={`Info (${countBySeverity.Informacion})`}
                            color="blue"
                            dot
                        />
                    </div>
                </div>

                {/* Alert List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {filtered.length === 0 ? (
                        <div className="text-center py-12">
                            <Shield className="mx-auto text-green-400 mb-3" size={48} />
                            <p className="text-gray-600 dark:text-gray-300 font-medium">
                                Sin alertas pendientes
                            </p>
                            <p className="text-sm text-gray-400 mt-1">
                                No hay vencimientos próximos en esta categoría
                            </p>
                        </div>
                    ) : (
                        filtered.map((alerta, idx) => {
                            const config = severityConfig[alerta.severidad] || severityConfig.Informacion;
                            const Icon = config.icon;

                            return (
                                <div
                                    key={alerta.agregaduraId || idx}
                                    className={`p-4 rounded-xl border ${config.bg} ${config.border} transition-all hover:shadow-md`}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className={`mt-0.5 p-1.5 rounded-lg ${config.badge}`}>
                                            <Icon size={16} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2">
                                                <h4 className="font-semibold text-gray-900 dark:text-white truncate">
                                                    {alerta.apellidoNombre}
                                                </h4>
                                                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${config.badge} whitespace-nowrap`}>
                                                    {alerta.diasRestantes} días
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
                                                <span className="flex items-center gap-1">
                                                    <MapPin size={14} />
                                                    {alerta.pais}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Shield size={14} />
                                                    {alerta.fuerza}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-1 mt-2 text-xs text-gray-500 dark:text-gray-500">
                                                <Clock size={12} />
                                                Fin comisión: {formatDate(alerta.finComision)}
                                            </div>

                                            {/* Progress bar showing urgency */}
                                            <div className="mt-3">
                                                <div className="h-1.5 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full ${config.dot} transition-all`}
                                                        style={{ width: `${Math.max(5, 100 - (alerta.diasRestantes / 120 * 100))}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Footer summary */}
                {alertas.length > 0 && (
                    <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                        <div className="flex justify-between text-sm">
                            <div className="flex items-center gap-4">
                                <span className="flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-red-500" />
                                    <span className="text-gray-600 dark:text-gray-400">
                                        {countBySeverity.Critica} crítica{countBySeverity.Critica !== 1 ? 's' : ''}
                                    </span>
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                                    <span className="text-gray-600 dark:text-gray-400">
                                        {countBySeverity.Advertencia} advertencia{countBySeverity.Advertencia !== 1 ? 's' : ''}
                                    </span>
                                </span>
                            </div>
                            <span className="text-gray-400 text-xs">
                                Actualizado: {new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const FilterPill = ({ active, onClick, label, color, dot }) => (
    <button
        onClick={onClick}
        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${active
                ? `bg-${color}-100 text-${color}-800 dark:bg-${color}-900/40 dark:text-${color}-300 ring-1 ring-${color}-300 dark:ring-${color}-700`
                : 'bg-white/50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-800'
            }`}
    >
        <span className="flex items-center gap-1.5">
            {dot && <span className={`w-1.5 h-1.5 rounded-full bg-${color}-500`} />}
            {label}
        </span>
    </button>
);
