import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useData } from '../../context/DataContext';

export const ExpirationChart = () => {
    const { kpis } = useData();

    const chartData = useMemo(() => {
        if (!kpis?.vencimientosPorMes?.length) return [];

        const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

        return kpis.vencimientosPorMes.map(item => {
            const [year, month] = item.mes.split('-');
            return {
                name: `${monthNames[parseInt(month) - 1]} ${year}`,
                vencimientos: item.cantidad,
                month: item.mes
            };
        });
    }, [kpis]);

    if (chartData.length === 0) {
        return (
            <div className="card">
                <h3 className="text-lg font-semibold mb-4 text-text">Vencimientos de Comisiones por Mes</h3>
                <div className="h-64 flex items-center justify-center text-secondary">
                    No hay datos de vencimientos para mostrar
                </div>
            </div>
        );
    }

    // Determine bar color based on proximity
    const getBarColor = (monthString) => {
        const now = new Date();
        const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        const [year, month] = monthString.split('-');
        const barMonth = `${year}-${month}`;

        if (barMonth === currentMonth) return '#dc2626';
        if (barMonth < currentMonth) return '#9ca3af';

        const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        const nextMonthStr = `${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, '0')}`;
        if (barMonth === nextMonthStr) return '#f59e0b';

        return '#3b82f6';
    };

    return (
        <div className="card">
            <h3 className="text-lg font-semibold mb-4 text-text">Vencimientos de Comisiones por Mes</h3>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                    <XAxis dataKey="name" fontSize={12} stroke="var(--color-text)" />
                    <YAxis fontSize={12} stroke="var(--color-text)" allowDecimals={false} />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'var(--color-surface)',
                            border: '1px solid var(--color-border)',
                            borderRadius: '0.5rem',
                            color: 'var(--color-text)'
                        }}
                        labelStyle={{ color: 'var(--color-text)' }}
                    />
                    <Bar dataKey="vencimientos" radius={[8, 8, 0, 0]}>
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={getBarColor(entry.month)} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>

            <div className="mt-4 flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: '#dc2626' }}></div>
                    <span className="text-secondary">Mes actual</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: '#f59e0b' }}></div>
                    <span className="text-secondary">Próximo mes</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: '#3b82f6' }}></div>
                    <span className="text-secondary">Futuros</span>
                </div>
            </div>
        </div>
    );
};
