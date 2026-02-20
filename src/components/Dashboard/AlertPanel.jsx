import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    X, AlertTriangle, AlertCircle, Info, Clock, MapPin, Shield,
    Bell, Settings, Download, Eye, EyeOff
} from 'lucide-react';
import { useData } from '../../context/DataContext';

// Default thresholds (days)
const DEFAULT_THRESHOLDS = { critica: 30, advertencia: 60, informacion: 120 };

const getSavedThresholds = () => {
    try {
        const saved = localStorage.getItem('alert_thresholds');
        return saved ? { ...DEFAULT_THRESHOLDS, ...JSON.parse(saved) } : DEFAULT_THRESHOLDS;
    } catch { return DEFAULT_THRESHOLDS; }
};

const getDismissed = () => {
    try {
        const saved = sessionStorage.getItem('dismissed_alerts');
        return saved ? JSON.parse(saved) : [];
    } catch { return []; }
};

const severityConfig = {
    Critica: {
        icon: AlertCircle,
        bg: 'bg-red-50 dark:bg-red-900/20',
        border: 'border-red-200 dark:border-red-800',
        text: 'text-red-700 dark:text-red-400',
        badge: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
        label: 'Crítica',
        dot: 'bg-red-500',
        headerBg: 'bg-red-500',
    },
    Advertencia: {
        icon: AlertTriangle,
        bg: 'bg-amber-50 dark:bg-amber-900/20',
        border: 'border-amber-200 dark:border-amber-800',
        text: 'text-amber-700 dark:text-amber-400',
        badge: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
        label: 'Advertencia',
        dot: 'bg-amber-500',
        headerBg: 'bg-amber-500',
    },
    Informacion: {
        icon: Info,
        bg: 'bg-blue-50 dark:bg-blue-900/20',
        border: 'border-blue-200 dark:border-blue-800',
        text: 'text-blue-700 dark:text-blue-400',
        badge: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
        label: 'Información',
        dot: 'bg-blue-500',
        headerBg: 'bg-blue-500',
    }
};

export const AlertPanel = ({ onClose }) => {
    const { kpis } = useData();
    const rawAlertas = kpis?.alertas || [];

    const [filter, setFilter] = useState('all');
    const [thresholds, setThresholds] = useState(getSavedThresholds);
    const [showSettings, setShowSettings] = useState(false);
    const [dismissed, setDismissed] = useState(getDismissed);

    // Re-classify alerts based on custom thresholds
    const alertas = useMemo(() => {
        return rawAlertas.map(a => {
            const d = a.diasRestantes;
            let severidad;
            if (d <= thresholds.critica) severidad = 'Critica';
            else if (d <= thresholds.advertencia) severidad = 'Advertencia';
            else if (d <= thresholds.informacion) severidad = 'Informacion';
            else severidad = a.severidad;
            return { ...a, severidad };
        });
    }, [rawAlertas, thresholds]);

    // Filter out dismissed alerts
    const visibleAlertas = useMemo(() => {
        return alertas.filter(a => !dismissed.includes(a.agregaduraId));
    }, [alertas, dismissed]);

    const filtered = filter === 'all'
        ? visibleAlertas
        : visibleAlertas.filter(a => a.severidad === filter);

    const countBySeverity = {
        Critica: visibleAlertas.filter(a => a.severidad === 'Critica').length,
        Advertencia: visibleAlertas.filter(a => a.severidad === 'Advertencia').length,
        Informacion: visibleAlertas.filter(a => a.severidad === 'Informacion').length
    };

    const handleDismiss = (id) => {
        const updated = [...dismissed, id];
        setDismissed(updated);
        sessionStorage.setItem('dismissed_alerts', JSON.stringify(updated));
    };

    const handleThresholdChange = (key, value) => {
        const num = parseInt(value) || 0;
        const updated = { ...thresholds, [key]: num };
        setThresholds(updated);
        localStorage.setItem('alert_thresholds', JSON.stringify(updated));
    };

    const handleExportPDF = async () => {
        try {
            const { default: jsPDF } = await import('jspdf');
            const { default: autoTable } = await import('jspdf-autotable');

            const doc = new jsPDF();

            // Title
            doc.setFontSize(16);
            doc.setTextColor(30, 58, 138);
            doc.text('Reporte de Alertas — SAID', 14, 20);
            doc.setFontSize(10);
            doc.setTextColor(107, 114, 128);
            doc.text(`Generado: ${new Date().toLocaleString('es-AR')}`, 14, 28);
            doc.text(`Total alertas: ${visibleAlertas.length} (${countBySeverity.Critica} críticas, ${countBySeverity.Advertencia} advertencias, ${countBySeverity.Informacion} información)`, 14, 34);

            // Table
            const tableData = filtered.map(a => ([
                a.apellidoNombre || '',
                a.pais || '',
                a.fuerza || '',
                `${a.diasRestantes} días`,
                a.finComision ? new Date(a.finComision).toLocaleDateString('es-AR') : '',
                severityConfig[a.severidad]?.label || a.severidad,
            ]));

            autoTable(doc, {
                startY: 42,
                head: [['Nombre', 'País', 'Fuerza', 'Días Rest.', 'Fin Comisión', 'Severidad']],
                body: tableData,
                styles: { fontSize: 9, cellPadding: 3 },
                headStyles: { fillColor: [30, 58, 138], textColor: 255, fontSize: 9 },
                alternateRowStyles: { fillColor: [248, 250, 252] },
            });

            doc.save(`alertas_SAID_${new Date().toISOString().slice(0, 10)}.pdf`);
        } catch (err) {
            console.error('Error generating PDF:', err);
            alert('Error al generar PDF: ' + err.message);
        }
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
                                    {visibleAlertas.length} alerta{visibleAlertas.length !== 1 ? 's' : ''} activa{visibleAlertas.length !== 1 ? 's' : ''}
                                    {dismissed.length > 0 && ` · ${dismissed.length} oculta${dismissed.length !== 1 ? 's' : ''}`}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setShowSettings(!showSettings)}
                                className={`p-2 rounded-lg transition-colors ${showSettings
                                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600'
                                    : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400'
                                    }`}
                                title="Configurar umbrales"
                            >
                                <Settings size={18} />
                            </button>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            >
                                <X className="text-gray-500" size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Severity summary badges */}
                    <div className="grid grid-cols-3 gap-2 mt-4">
                        {Object.entries(severityConfig).map(([key, config]) => (
                            <div
                                key={key}
                                className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${config.border} ${config.bg} cursor-pointer transition-all ${filter === key ? 'ring-2 ring-offset-1 ring-offset-white dark:ring-offset-gray-900 ring-current' : ''}`}
                                onClick={() => setFilter(filter === key ? 'all' : key)}
                            >
                                <div className={`w-8 h-8 rounded-lg ${config.headerBg} flex items-center justify-center`}>
                                    <span className="text-white font-bold text-sm">{countBySeverity[key]}</span>
                                </div>
                                <span className={`text-xs font-medium ${config.text}`}>{config.label}</span>
                            </div>
                        ))}
                    </div>

                    {/* Settings panel */}
                    {showSettings && (
                        <div className="mt-4 p-3 rounded-xl bg-white/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 animate-fade-in">
                            <p className="text-xs font-semibold text-gray-600 dark:text-gray-300 mb-2">
                                Umbrales de severidad (días)
                            </p>
                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <label className="text-[10px] text-red-600 font-medium">Crítica ≤</label>
                                    <input
                                        type="number"
                                        value={thresholds.critica}
                                        onChange={e => handleThresholdChange('critica', e.target.value)}
                                        className="w-full mt-1 px-2 py-1 text-sm rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] text-amber-600 font-medium">Advertencia ≤</label>
                                    <input
                                        type="number"
                                        value={thresholds.advertencia}
                                        onChange={e => handleThresholdChange('advertencia', e.target.value)}
                                        className="w-full mt-1 px-2 py-1 text-sm rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] text-blue-600 font-medium">Información ≤</label>
                                    <input
                                        type="number"
                                        value={thresholds.informacion}
                                        onChange={e => handleThresholdChange('informacion', e.target.value)}
                                        className="w-full mt-1 px-2 py-1 text-sm rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                                    />
                                </div>
                            </div>
                        </div>
                    )}
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
                                    className={`p-4 rounded-xl border ${config.bg} ${config.border} transition-all hover:shadow-md group`}
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
                                                <div className="flex items-center gap-1.5">
                                                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${config.badge} whitespace-nowrap`}>
                                                        {alerta.diasRestantes} días
                                                    </span>
                                                    {alerta.agregaduraId && (
                                                        <button
                                                            onClick={() => handleDismiss(alerta.agregaduraId)}
                                                            className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
                                                            title="Ocultar esta alerta"
                                                        >
                                                            <EyeOff size={12} className="text-gray-400" />
                                                        </button>
                                                    )}
                                                </div>
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

                                            {/* Progress bar */}
                                            <div className="mt-3">
                                                <div className="h-1.5 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full ${config.dot} transition-all`}
                                                        style={{ width: `${Math.max(5, 100 - (alerta.diasRestantes / thresholds.informacion * 100))}%` }}
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

                {/* Footer */}
                {visibleAlertas.length > 0 && (
                    <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-4 text-sm">
                                <span className="flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-red-500" />
                                    <span className="text-gray-600 dark:text-gray-400">
                                        {countBySeverity.Critica} crítica{countBySeverity.Critica !== 1 ? 's' : ''}
                                    </span>
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                                    <span className="text-gray-600 dark:text-gray-400">
                                        {countBySeverity.Advertencia}
                                    </span>
                                </span>
                            </div>
                            <button
                                onClick={handleExportPDF}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm"
                            >
                                <Download size={12} />
                                Exportar PDF
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
