import React from 'react';
import { Users, AlertTriangle, Shield, Loader2 } from 'lucide-react';
import { useData } from '../../context/DataContext';

export const KPICards = () => {
    const { kpis, loading } = useData();

    if (loading && !kpis) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="card animate-pulse">
                        <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded" />
                    </div>
                ))}
            </div>
        );
    }

    if (!kpis) return null;

    const alertCount = kpis.alertas?.filter(a => a.severidad === 'Critica').length || 0;

    const cards = [
        {
            title: 'Total de Personal',
            value: kpis.totalPersonal,
            icon: Users,
            color: 'text-primary',
            bgColor: 'bg-blue-100 dark:bg-blue-900'
        },
        ...kpis.porFuerza.map(f => ({
            title: `${f.nombre} (${f.codigo})`,
            value: f.cantidad,
            icon: Shield,
            color: f.codigo === 'EA' ? 'text-green-600'
                : f.codigo === 'ARA' ? 'text-blue-600'
                    : 'text-accent',
            bgColor: f.codigo === 'EA' ? 'bg-green-100 dark:bg-green-900'
                : f.codigo === 'ARA' ? 'bg-blue-100 dark:bg-blue-900'
                    : 'bg-accent/20'
        })),
        {
            title: 'Comisiones por Vencer',
            subtitle: 'Próximos 60 días',
            value: alertCount,
            icon: AlertTriangle,
            color: alertCount > 0 ? 'text-red-600' : 'text-gray-500',
            bgColor: alertCount > 0 ? 'bg-red-100 dark:bg-red-900' : 'bg-gray-100 dark:bg-gray-800'
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            {cards.map((kpi, index) => (
                <div key={index} className="card hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm text-secondary mb-1">{kpi.title}</p>
                            {kpi.subtitle && (
                                <p className="text-xs text-secondary mb-2">{kpi.subtitle}</p>
                            )}
                            <p className={`text-3xl font-bold ${kpi.color}`}>{kpi.value}</p>
                        </div>
                        <div className={`p-3 rounded-lg ${kpi.bgColor}`}>
                            <kpi.icon className={kpi.color} size={24} />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};
