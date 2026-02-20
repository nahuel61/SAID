import React, { useMemo } from 'react';
import { useData } from '../../context/DataContext';
import {
    ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid,
    Tooltip, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
    PieChart, Pie, Cell, Legend
} from 'recharts';
import {
    Activity, Target, Clock, TrendingUp, BarChart3, MapPin, Award, Layers
} from 'lucide-react';

const RADIAN = Math.PI / 180;
const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) => {
    const radius = outerRadius + 20;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    if (percent < 0.03) return null;
    return (
        <text x={x} y={y} fill="var(--color-text)" textAnchor={x > cx ? 'start' : 'end'} fontSize={10} dominantBaseline="central">
            {name} ({(percent * 100).toFixed(0)}%)
        </text>
    );
};

const GRADE_COLORS = ['#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#22c55e', '#14b8a6'];

const REGION_MAP = {
    'Estados Unidos': 'América', 'Brasil': 'América', 'Chile': 'América', 'Colombia': 'América', 'Perú': 'América',
    'Paraguay': 'América', 'Uruguay': 'América', 'Bolivia': 'América', 'Ecuador': 'América', 'Venezuela': 'América',
    'México': 'América', 'Canadá': 'América', 'Panamá': 'América',
    'España': 'Europa', 'Francia': 'Europa', 'Italia': 'Europa', 'Alemania': 'Europa', 'Reino Unido': 'Europa',
    'Bélgica': 'Europa', 'Países Bajos': 'Europa', 'Portugal': 'Europa', 'Rusia': 'Europa',
    'China': 'Asia-Pacífico', 'Japón': 'Asia-Pacífico', 'India': 'Asia-Pacífico', 'Corea del Sur': 'Asia-Pacífico',
    'Australia': 'Asia-Pacífico', 'Indonesia': 'Asia-Pacífico', 'Malasia': 'Asia-Pacífico',
    'Israel': 'Oriente Medio', 'Turquía': 'Oriente Medio', 'Arabia Saudita': 'Oriente Medio',
    'Egipto': 'Oriente Medio', 'Emiratos Árabes Unidos': 'Oriente Medio', 'Qatar': 'Oriente Medio',
    'Sudáfrica': 'África', 'Angola': 'África', 'Nigeria': 'África', 'Kenia': 'África',
};

const getRegion = (pais) => REGION_MAP[pais] || 'Otros';

export const AnalyticsView = () => {
    const { kpis, agregaduras, allAgregaduras } = useData();
    const data = allAgregaduras?.length > 0 ? allAgregaduras : agregaduras;
    const total = kpis?.totalPersonal || data.length;

    // ---- 1. Timeline: personal activo por mes (últimos 12 meses) ----
    const timelineData = useMemo(() => {
        const now = new Date();
        const months = [];
        for (let i = 11; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const label = d.toLocaleDateString('es-AR', { month: 'short', year: '2-digit' });
            // Count how many had active commission during that month
            const active = data.filter(a => {
                if (!a.finComision) return true;
                const fin = new Date(a.finComision);
                return fin >= d;
            }).length;
            months.push({ month: label, activos: active });
        }
        return months;
    }, [data]);

    // ---- 2. Radar: cobertura por región ----
    const radarData = useMemo(() => {
        const regions = {};
        data.forEach(a => {
            const r = getRegion(a.pais);
            regions[r] = (regions[r] || 0) + 1;
        });
        return Object.entries(regions)
            .map(([region, count]) => ({ region, personal: count, fullMark: Math.max(...Object.values(regions)) + 2 }))
            .sort((a, b) => b.personal - a.personal);
    }, [data]);

    // ---- 3. Grade Distribution (Pie) ----
    const gradeData = useMemo(() => {
        const grades = {};
        data.forEach(a => {
            const key = a.codigoOTAN || a.tipoGrado || 'Sin dato';
            grades[key] = (grades[key] || 0) + 1;
        });
        return Object.entries(grades)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([name, value]) => ({ name, value }));
    }, [data]);

    // ---- 4. Calculated Metrics ----
    const metrics = useMemo(() => {
        const now = new Date();
        // Average commission duration (days remaining)
        const withDays = data.filter(a => a.diasRestantes != null);
        const avgDays = withDays.length > 0
            ? Math.round(withDays.reduce((s, a) => s + a.diasRestantes, 0) / withDays.length)
            : 0;

        // Average total commission (if both dates available)
        const withDates = data.filter(a => a.fechaSalidaPais && a.finComision);
        const avgDuration = withDates.length > 0
            ? Math.round(withDates.reduce((s, a) => {
                return s + Math.abs(new Date(a.finComision) - new Date(a.fechaSalidaPais)) / (1000 * 60 * 60 * 24);
            }, 0) / withDates.length)
            : 0;

        // Countries coverage
        const countries = new Set(data.map(a => a.pais)).size;
        const regions = new Set(data.map(a => getRegion(a.pais))).size;

        // Force balance
        const byForce = {};
        data.forEach(a => {
            byForce[a.fuerzaCodigo] = (byForce[a.fuerzaCodigo] || 0) + 1;
        });
        const forces = Object.entries(byForce).sort((a, b) => b[1] - a[1]);
        const maxForce = forces[0] || ['—', 0];
        const minForce = forces[forces.length - 1] || ['—', 0];

        // Expiring soon
        const expiring30 = data.filter(a => a.diasRestantes != null && a.diasRestantes <= 30 && a.diasRestantes > 0).length;

        return { avgDays, avgDuration, countries, regions, maxForce, minForce, expiring30 };
    }, [data]);

    const tooltipStyle = {
        contentStyle: {
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: '0.75rem',
            color: 'var(--color-text)',
            fontSize: '12px'
        }
    };

    return (
        <div>
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                    Analytics Avanzado
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Métricas, tendencias y análisis profundo del despliegue
                </p>
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {[
                    { icon: Clock, label: 'Duración Prom.', value: `${metrics.avgDuration}d`, sub: 'Comisión promedio', color: 'blue' },
                    { icon: TrendingUp, label: 'Días Rest. Prom.', value: `${metrics.avgDays}d`, sub: 'Promedio restante', color: 'green' },
                    { icon: MapPin, label: 'Cobertura', value: `${metrics.countries} países`, sub: `${metrics.regions} regiones`, color: 'purple' },
                    { icon: Activity, label: 'Vencen en 30d', value: metrics.expiring30, sub: 'Requieren atención', color: 'red' },
                ].map((m, i) => {
                    const Icon = m.icon;
                    return (
                        <div key={i} className="bg-white dark:bg-card-dark rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                            <div className="flex items-center justify-between mb-3">
                                <Icon size={20} className={`text-${m.color}-500`} />
                                <span className="text-xs text-gray-400">{m.label}</span>
                            </div>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{m.value}</p>
                            <p className="text-xs text-gray-500 mt-1">{m.sub}</p>
                        </div>
                    );
                })}
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Timeline — Area Chart */}
                <div className="bg-white dark:bg-card-dark rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <BarChart3 size={16} className="text-blue-500" />
                        Evolución de Personal Activo (12 meses)
                    </h3>
                    <ResponsiveContainer width="100%" height={260}>
                        <AreaChart data={timelineData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                            <XAxis dataKey="month" fontSize={10} stroke="var(--color-text)" />
                            <YAxis fontSize={10} stroke="var(--color-text)" allowDecimals={false} />
                            <Tooltip {...tooltipStyle} />
                            <Area type="monotone" dataKey="activos" stroke="#3b82f6" strokeWidth={2}
                                fill="url(#colorActive)" dot={{ fill: '#3b82f6', r: 3 }}
                                activeDot={{ r: 5, fill: '#3b82f6' }} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Radar — Region coverage */}
                <div className="bg-white dark:bg-card-dark rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <Target size={16} className="text-purple-500" />
                        Cobertura por Región
                    </h3>
                    {radarData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={260}>
                            <RadarChart data={radarData} cx="50%" cy="50%" outerRadius={90}>
                                <PolarGrid stroke="var(--color-border)" />
                                <PolarAngleAxis dataKey="region" fontSize={10} stroke="var(--color-text)" />
                                <PolarRadiusAxis fontSize={9} stroke="var(--color-text)" />
                                <Radar name="Personal" dataKey="personal" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} strokeWidth={2} />
                                <Tooltip {...tooltipStyle} />
                            </RadarChart>
                        </ResponsiveContainer>
                    ) : <p className="text-gray-400 text-sm text-center py-20">Sin datos</p>}
                </div>
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Grade Distribution */}
                <div className="bg-white dark:bg-card-dark rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <Award size={16} className="text-amber-500" />
                        Distribución por Grado OTAN
                    </h3>
                    {gradeData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={280}>
                            <PieChart>
                                <Pie
                                    data={gradeData} dataKey="value" nameKey="name"
                                    cx="50%" cy="50%" outerRadius={100}
                                    label={renderLabel} labelLine={{ stroke: 'var(--color-border)' }}
                                    strokeWidth={2} stroke="var(--color-surface)"
                                >
                                    {gradeData.map((_, i) => (
                                        <Cell key={i} fill={GRADE_COLORS[i % GRADE_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip {...tooltipStyle} />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : <p className="text-gray-400 text-sm text-center py-20">Sin datos</p>}
                </div>

                {/* Balance Analysis */}
                <div className="bg-white dark:bg-card-dark rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <Layers size={16} className="text-green-500" />
                        Análisis de Balance
                    </h3>
                    <div className="space-y-4">
                        {/* Force Balance */}
                        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                            <p className="text-xs text-gray-400 mb-2 font-medium uppercase tracking-wider">Balance por Fuerza</p>
                            <div className="flex gap-3">
                                <div className="flex-1 text-center p-3 bg-white dark:bg-gray-900/50 rounded-lg">
                                    <p className="text-lg font-bold text-green-600 dark:text-green-400">{metrics.maxForce[0]}</p>
                                    <p className="text-2xl font-extrabold text-gray-900 dark:text-white">{metrics.maxForce[1]}</p>
                                    <p className="text-[10px] text-gray-500 uppercase">Mayor presencia</p>
                                </div>
                                <div className="flex-1 text-center p-3 bg-white dark:bg-gray-900/50 rounded-lg">
                                    <p className="text-lg font-bold text-amber-600 dark:text-amber-400">{metrics.minForce[0]}</p>
                                    <p className="text-2xl font-extrabold text-gray-900 dark:text-white">{metrics.minForce[1]}</p>
                                    <p className="text-[10px] text-gray-500 uppercase">Menor presencia</p>
                                </div>
                            </div>
                        </div>

                        {/* Coverage stats */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-center">
                                <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{metrics.countries}</p>
                                <p className="text-xs text-blue-600 dark:text-blue-400">Países cubiertos</p>
                            </div>
                            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl text-center">
                                <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">{metrics.regions}</p>
                                <p className="text-xs text-purple-600 dark:text-purple-400">Regiones activas</p>
                            </div>
                        </div>

                        {/* Commission duration */}
                        <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl">
                            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">Duración Promedio de Comisión</p>
                            <div className="flex items-baseline gap-2">
                                <p className="text-3xl font-extrabold text-gray-900 dark:text-white">{metrics.avgDuration}</p>
                                <p className="text-sm text-gray-500">días</p>
                                <span className="text-xs text-gray-400 ml-auto">
                                    ≈ {(metrics.avgDuration / 365).toFixed(1)} años
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
