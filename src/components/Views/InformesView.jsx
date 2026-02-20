import React from 'react';
import { useData } from '../../context/DataContext';
import { ExpirationChart } from '../Dashboard/ExpirationChart';
import { BarChart3, PieChart, TrendingUp, AlertTriangle, Calendar, Shield, Globe } from 'lucide-react';

export const InformesView = () => {
    const { kpis, agregaduras } = useData();

    // Analysis by force
    const porFuerza = kpis?.porFuerza || [];

    // Analysis by grade type
    const oficiales = kpis?.totalOficiales || 0;
    const suboficiales = kpis?.totalSuboficiales || 0;
    const total = kpis?.totalPersonal || 0;

    // Alerts summary
    const alertas = kpis?.alertas || [];
    const criticas = alertas.filter(a => a.severidad === 'Critica').length;
    const advertencias = alertas.filter(a => a.severidad === 'Advertencia').length;
    const informacion = alertas.filter(a => a.severidad === 'Informacion').length;

    // Countries with most personnel
    const byCountry = {};
    agregaduras.forEach(a => {
        byCountry[a.pais] = (byCountry[a.pais] || 0) + 1;
    });
    const topCountries = Object.entries(byCountry)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    // By cargo
    const byCargo = {};
    agregaduras.forEach(a => {
        const cargo = a.cargo || 'Sin cargo';
        byCargo[cargo] = (byCargo[cargo] || 0) + 1;
    });
    const topCargos = Object.entries(byCargo)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    const maxCountry = topCountries[0]?.[1] || 1;
    const maxCargo = topCargos[0]?.[1] || 1;

    return (
        <div>
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                    Informes y Análisis
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Estadísticas y reportes del personal en misiones exteriores
                </p>
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white dark:bg-card-dark rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                    <div className="flex items-center justify-between mb-3">
                        <BarChart3 size={20} className="text-blue-500" />
                        <span className="text-xs text-gray-400">Total</span>
                    </div>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{total}</p>
                    <p className="text-xs text-gray-500 mt-1">Personal desplegado</p>
                </div>
                <div className="bg-white dark:bg-card-dark rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                    <div className="flex items-center justify-between mb-3">
                        <Globe size={20} className="text-green-500" />
                        <span className="text-xs text-gray-400">Países</span>
                    </div>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{Object.keys(byCountry).length}</p>
                    <p className="text-xs text-gray-500 mt-1">Con presencia</p>
                </div>
                <div className="bg-white dark:bg-card-dark rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                    <div className="flex items-center justify-between mb-3">
                        <AlertTriangle size={20} className="text-red-500" />
                        <span className="text-xs text-gray-400">Alertas</span>
                    </div>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{alertas.length}</p>
                    <p className="text-xs text-gray-500 mt-1">Vencimientos próximos</p>
                </div>
                <div className="bg-white dark:bg-card-dark rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                    <div className="flex items-center justify-between mb-3">
                        <TrendingUp size={20} className="text-amber-500" />
                        <span className="text-xs text-gray-400">Ratio</span>
                    </div>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                        {total > 0 ? Math.round((oficiales / total) * 100) : 0}%
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Oficiales</p>
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Force Distribution */}
                <div className="bg-white dark:bg-card-dark rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <PieChart size={18} className="text-primary" />
                        Distribución por Fuerza
                    </h3>
                    <div className="space-y-4">
                        {porFuerza.map(f => (
                            <div key={f.codigo}>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-gray-700 dark:text-gray-300 font-medium">{f.nombre}</span>
                                    <span className="text-gray-500">{f.cantidad} ({total > 0 ? Math.round((f.cantidad / total) * 100) : 0}%)</span>
                                </div>
                                <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                    <div
                                        className="h-full rounded-full transition-all duration-500"
                                        style={{
                                            width: `${total > 0 ? (f.cantidad / total) * 100 : 0}%`,
                                            backgroundColor: f.colorHex
                                        }}
                                    />
                                </div>
                            </div>
                        ))}
                        {porFuerza.length === 0 && (
                            <p className="text-gray-400 text-sm text-center py-4">Sin datos disponibles</p>
                        )}
                    </div>

                    {/* Oficial vs Suboficial */}
                    <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Tipo de Personal</h4>
                        <div className="flex gap-4">
                            <div className="flex-1 bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3 text-center">
                                <p className="text-xl font-bold text-amber-700 dark:text-amber-300">{oficiales}</p>
                                <p className="text-xs text-amber-600 dark:text-amber-400">Oficiales</p>
                            </div>
                            <div className="flex-1 bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3 text-center">
                                <p className="text-xl font-bold text-purple-700 dark:text-purple-300">{suboficiales}</p>
                                <p className="text-xs text-purple-600 dark:text-purple-400">Suboficiales</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Alert Severity */}
                <div className="bg-white dark:bg-card-dark rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <AlertTriangle size={18} className="text-red-500" />
                        Vencimientos y Alertas
                    </h3>

                    {/* Severity breakdown */}
                    <div className="grid grid-cols-3 gap-3 mb-6">
                        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3 text-center border border-red-200 dark:border-red-800">
                            <p className="text-2xl font-bold text-red-600 dark:text-red-400">{criticas}</p>
                            <p className="text-xs text-red-500">Críticas</p>
                            <p className="text-[10px] text-red-400">≤ 30 días</p>
                        </div>
                        <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3 text-center border border-amber-200 dark:border-amber-800">
                            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{advertencias}</p>
                            <p className="text-xs text-amber-500">Advertencia</p>
                            <p className="text-[10px] text-amber-400">31–60 días</p>
                        </div>
                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-center border border-blue-200 dark:border-blue-800">
                            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{informacion}</p>
                            <p className="text-xs text-blue-500">Información</p>
                            <p className="text-[10px] text-blue-400">61–120 días</p>
                        </div>
                    </div>

                    {/* Upcoming expirations list */}
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Próximos vencimientos</h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                        {alertas.slice(0, 8).map((a, i) => (
                            <div key={i} className="flex items-center justify-between text-sm p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                <div className="flex items-center gap-2">
                                    <span className={`w-2 h-2 rounded-full ${a.severidad === 'Critica' ? 'bg-red-500' :
                                            a.severidad === 'Advertencia' ? 'bg-amber-500' : 'bg-blue-500'
                                        }`} />
                                    <span className="text-gray-700 dark:text-gray-300 truncate max-w-[180px]">{a.apellidoNombre}</span>
                                </div>
                                <span className={`text-xs font-medium ${a.severidad === 'Critica' ? 'text-red-500' :
                                        a.severidad === 'Advertencia' ? 'text-amber-500' : 'text-blue-500'
                                    }`}>
                                    {a.diasRestantes}d
                                </span>
                            </div>
                        ))}
                        {alertas.length === 0 && (
                            <p className="text-gray-400 text-sm text-center py-4">Sin alertas activas</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Expiration Chart (full width) */}
            <div className="mb-8">
                <ExpirationChart />
            </div>

            {/* Bottom row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Countries */}
                <div className="bg-white dark:bg-card-dark rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <Globe size={18} className="text-green-500" />
                        Top 5 — Personal por País
                    </h3>
                    <div className="space-y-3">
                        {topCountries.map(([pais, count], i) => (
                            <div key={pais} className="flex items-center gap-3">
                                <span className="w-6 text-center text-xs font-bold text-gray-400">{i + 1}</span>
                                <div className="flex-1">
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-gray-700 dark:text-gray-300 font-medium">{pais}</span>
                                        <span className="text-gray-500">{count}</span>
                                    </div>
                                    <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                        <div
                                            className="h-full rounded-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-500"
                                            style={{ width: `${(count / maxCountry) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Top Cargos */}
                <div className="bg-white dark:bg-card-dark rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <Shield size={18} className="text-purple-500" />
                        Top 5 — Cargos más frecuentes
                    </h3>
                    <div className="space-y-3">
                        {topCargos.map(([cargo, count], i) => (
                            <div key={cargo} className="flex items-center gap-3">
                                <span className="w-6 text-center text-xs font-bold text-gray-400">{i + 1}</span>
                                <div className="flex-1">
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-gray-700 dark:text-gray-300 font-medium truncate max-w-[200px]">{cargo}</span>
                                        <span className="text-gray-500">{count}</span>
                                    </div>
                                    <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                        <div
                                            className="h-full rounded-full bg-gradient-to-r from-purple-400 to-violet-500 transition-all duration-500"
                                            style={{ width: `${(count / maxCargo) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
