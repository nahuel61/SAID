import React, { useMemo } from 'react';
import { Users, AlertTriangle, Shield, Loader2, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { useData } from '../../context/DataContext';

// Mini sparkline component
const Sparkline = ({ data, color = '#3b82f6', height = 32 }) => {
    if (!data || data.length < 2) return null;
    return (
        <div style={{ width: '100%', height }}>
            <ResponsiveContainer>
                <LineChart data={data}>
                    <Line
                        type="monotone"
                        dataKey="value"
                        stroke={color}
                        strokeWidth={1.5}
                        dot={false}
                        isAnimationActive={true}
                        animationDuration={1200}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

// Progress bar component
const ProgressBar = ({ value, max, color, label }) => {
    const pct = max > 0 ? Math.round((value / max) * 100) : 0;
    return (
        <div className="mt-2">
            <div className="flex justify-between text-[10px] text-gray-500 dark:text-gray-400 mb-1">
                <span>{label}</span>
                <span>{pct}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                <div
                    className="h-full rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${pct}%`, backgroundColor: color }}
                />
            </div>
        </div>
    );
};

// Trend indicator
const TrendBadge = ({ current, previous }) => {
    if (previous === null || previous === undefined || current === previous) {
        return (
            <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-gray-400 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded-full">
                <Minus size={10} /> 0%
            </span>
        );
    }
    const delta = current - previous;
    const pct = previous > 0 ? Math.round((delta / previous) * 100) : (delta > 0 ? 100 : 0);
    const up = delta > 0;

    return (
        <span className={`inline-flex items-center gap-0.5 text-[10px] font-medium px-1.5 py-0.5 rounded-full ${up
            ? 'text-emerald-700 bg-emerald-100 dark:text-emerald-300 dark:bg-emerald-900/40'
            : 'text-red-700 bg-red-100 dark:text-red-300 dark:bg-red-900/40'
            }`}>
            {up ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
            {up ? '+' : ''}{pct}%
        </span>
    );
};

export const KPICards = () => {
    const { kpis, allAgregaduras, loading } = useData();

    // Build sparkline data from allAgregaduras grouped by month
    const sparklineData = useMemo(() => {
        if (!allAgregaduras?.length) return {};

        const now = new Date();
        // Generate last 6 months labels
        const months = [];
        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
        }

        // Count active personnel per month per fuerza
        const byFuerza = { EA: {}, ARA: {}, FAA: {}, total: {} };

        months.forEach(m => {
            byFuerza.EA[m] = 0;
            byFuerza.ARA[m] = 0;
            byFuerza.FAA[m] = 0;
            byFuerza.total[m] = 0;
        });

        allAgregaduras.forEach(item => {
            const fc = item.fuerzaCodigo || '';
            // Count as active for each month they were deployed
            months.forEach(m => {
                const monthStart = new Date(m + '-01');
                const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0);

                const salida = item.fechaSalida ? new Date(item.fechaSalida) : null;
                const fin = item.finComision ? new Date(item.finComision) : null;

                // Active if started before month end and hasn't ended before month start
                const started = !salida || salida <= monthEnd;
                const notEnded = !fin || fin >= monthStart;

                if (started && notEnded) {
                    byFuerza.total[m]++;
                    if (byFuerza[fc]) byFuerza[fc][m]++;
                }
            });
        });

        // Convert to arrays for recharts
        const toArray = (obj) => months.map(m => ({ month: m, value: obj[m] || 0 }));

        return {
            total: toArray(byFuerza.total),
            EA: toArray(byFuerza.EA),
            ARA: toArray(byFuerza.ARA),
            FAA: toArray(byFuerza.FAA),
        };
    }, [allAgregaduras]);

    if (loading && !kpis) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm p-5 animate-pulse">
                        <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                    </div>
                ))}
            </div>
        );
    }

    if (!kpis) return null;

    const alertCount = kpis.alertas?.filter(a => a.severidad === 'Critica').length || 0;
    const totalPersonal = kpis.totalPersonal || 0;

    const FORCE_COLORS = {
        EA: '#6b7f3e',
        ARA: '#002395',
        FAA: '#87CEEB'
    };

    const cards = [
        {
            title: 'Total de Personal',
            value: totalPersonal,
            icon: Users,
            gradient: 'from-blue-500/10 to-indigo-500/10 dark:from-blue-900/30 dark:to-indigo-900/30',
            borderColor: 'border-blue-200/60 dark:border-blue-800/40',
            iconBg: 'bg-blue-500',
            color: '#3b82f6',
            sparkline: sparklineData.total,
            trend: sparklineData.total,
        },
        ...kpis.porFuerza.map(f => ({
            title: f.nombre,
            subtitle: f.codigo,
            value: f.cantidad,
            icon: Shield,
            gradient: f.codigo === 'EA'
                ? 'from-green-500/10 to-emerald-500/10 dark:from-green-900/30 dark:to-emerald-900/30'
                : f.codigo === 'ARA'
                    ? 'from-blue-500/10 to-sky-500/10 dark:from-blue-900/30 dark:to-sky-900/30'
                    : 'from-cyan-500/10 to-sky-500/10 dark:from-cyan-900/30 dark:to-sky-900/30',
            borderColor: f.codigo === 'EA'
                ? 'border-green-200/60 dark:border-green-800/40'
                : f.codigo === 'ARA'
                    ? 'border-blue-200/60 dark:border-blue-800/40'
                    : 'border-cyan-200/60 dark:border-cyan-800/40',
            iconBg: f.codigo === 'EA' ? 'bg-[#6b7f3e]'
                : f.codigo === 'ARA' ? 'bg-[#002395]'
                    : 'bg-[#87CEEB]',
            color: FORCE_COLORS[f.codigo] || '#3b82f6',
            sparkline: sparklineData[f.codigo],
            trend: sparklineData[f.codigo],
            progress: { value: f.cantidad, max: totalPersonal, label: `del total` },
        })),
        {
            title: 'Comisiones por Vencer',
            subtitle: 'Próximos 60 días',
            value: alertCount,
            icon: AlertTriangle,
            gradient: alertCount > 0
                ? 'from-red-500/10 to-orange-500/10 dark:from-red-900/30 dark:to-orange-900/30'
                : 'from-gray-500/5 to-gray-500/5 dark:from-gray-800/30 dark:to-gray-800/30',
            borderColor: alertCount > 0
                ? 'border-red-200/60 dark:border-red-800/40'
                : 'border-gray-200/60 dark:border-gray-700/40',
            iconBg: alertCount > 0 ? 'bg-red-500' : 'bg-gray-400',
            color: alertCount > 0 ? '#dc2626' : '#9ca3af',
            isAlert: true,
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            {cards.map((kpi, index) => {
                // Trend: compare last two sparkline points
                const trendData = kpi.trend;
                const currentVal = trendData?.[trendData.length - 1]?.value;
                const prevVal = trendData?.[trendData.length - 2]?.value;

                return (
                    <div
                        key={index}
                        className={`relative overflow-hidden rounded-xl border ${kpi.borderColor} bg-gradient-to-br ${kpi.gradient} backdrop-blur-sm p-5 transition-all duration-300 hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/20 hover:-translate-y-0.5 group`}
                        style={{
                            animationName: 'kpiSlideIn',
                            animationDuration: '0.5s',
                            animationTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
                            animationFillMode: 'both',
                            animationDelay: `${index * 80}ms`,
                        }}
                    >
                        {/* Header row */}
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide truncate">
                                    {kpi.title}
                                </p>
                                {kpi.subtitle && (
                                    <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">
                                        {kpi.subtitle}
                                    </p>
                                )}
                            </div>
                            <div className={`${kpi.iconBg} p-2 rounded-lg shadow-sm`}>
                                <kpi.icon className="text-white" size={16} strokeWidth={2.5} />
                            </div>
                        </div>

                        {/* Value + Trend */}
                        <div className="flex items-end justify-between gap-2 mb-1">
                            <span className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                                {kpi.value}
                            </span>
                            {trendData && <TrendBadge current={currentVal} previous={prevVal} />}
                            {kpi.isAlert && kpi.value > 0 && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/40 px-1.5 py-0.5 rounded-full">
                                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                                    Urgente
                                </span>
                            )}
                        </div>

                        {/* Sparkline */}
                        {kpi.sparkline && kpi.sparkline.length >= 2 && (
                            <div className="mt-2 -mx-1 opacity-60 group-hover:opacity-100 transition-opacity">
                                <Sparkline data={kpi.sparkline} color={kpi.color} height={28} />
                            </div>
                        )}

                        {/* Progress bar */}
                        {kpi.progress && (
                            <ProgressBar
                                value={kpi.progress.value}
                                max={kpi.progress.max}
                                color={kpi.color}
                                label={kpi.progress.label}
                            />
                        )}
                    </div>
                );
            })}
        </div>
    );
};
