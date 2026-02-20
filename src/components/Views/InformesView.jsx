import React, { useMemo, useState } from 'react';
import { useData } from '../../context/DataContext';
import { ExpirationChart } from '../Dashboard/ExpirationChart';
import {
    PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
    BarChart3, TrendingUp, AlertTriangle, Globe, Shield, Download,
    FileText, Calendar, Users, BookOpen
} from 'lucide-react';

const RADIAN = Math.PI / 180;
const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    if (percent < 0.05) return null;
    return (
        <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={700}>
            {`${(percent * 100).toFixed(0)}%`}
        </text>
    );
};

export const InformesView = () => {
    const { kpis, agregaduras, allAgregaduras } = useData();
    const [generating, setGenerating] = useState(null);

    const porFuerza = kpis?.porFuerza || [];
    const oficiales = kpis?.totalOficiales || 0;
    const suboficiales = kpis?.totalSuboficiales || 0;
    const total = kpis?.totalPersonal || 0;
    const alertas = kpis?.alertas || [];
    const criticas = alertas.filter(a => a.severidad === 'Critica').length;
    const advertencias = alertas.filter(a => a.severidad === 'Advertencia').length;
    const informacion = alertas.filter(a => a.severidad === 'Informacion').length;

    // Donut data — by force
    const fuerzaData = useMemo(() =>
        porFuerza.map(f => ({
            name: f.nombre,
            value: f.cantidad,
            color: f.colorHex || (f.codigo === 'EA' ? '#6b7f3e' : f.codigo === 'ARA' ? '#002395' : '#87CEEB')
        })),
        [porFuerza]
    );

    // Donut data — by type
    const tipoData = useMemo(() => [
        { name: 'Oficiales', value: oficiales, color: '#f59e0b' },
        { name: 'Suboficiales', value: suboficiales, color: '#8b5cf6' },
    ], [oficiales, suboficiales]);

    // Bar data — top countries
    const countryData = useMemo(() => {
        const byCountry = {};
        (allAgregaduras || agregaduras).forEach(a => {
            byCountry[a.pais] = (byCountry[a.pais] || 0) + 1;
        });
        return Object.entries(byCountry)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([pais, count]) => ({ pais, cantidad: count }));
    }, [allAgregaduras, agregaduras]);

    // Alert severity data for donut
    const alertData = useMemo(() => [
        { name: 'Críticas', value: criticas, color: '#ef4444' },
        { name: 'Advertencia', value: advertencias, color: '#f59e0b' },
        { name: 'Información', value: informacion, color: '#3b82f6' },
    ].filter(d => d.value > 0), [criticas, advertencias, informacion]);

    const formatDate = (d) => {
        try { return new Date(d).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' }); }
        catch { return d; }
    };

    const generatePDF = async (type) => {
        setGenerating(type);
        try {
            const { default: jsPDF } = await import('jspdf');
            const { default: autoTable } = await import('jspdf-autotable');
            const doc = new jsPDF();
            const now = new Date().toLocaleString('es-AR');

            // Header
            doc.setFontSize(18);
            doc.setTextColor(30, 58, 138);

            switch (type) {
                case 'vencimientos': {
                    doc.text('Reporte Mensual de Vencimientos', 14, 20);
                    doc.setFontSize(10);
                    doc.setTextColor(107, 114, 128);
                    doc.text(`Generado: ${now}`, 14, 28);
                    doc.text(`Total alertas: ${alertas.length} | Críticas: ${criticas} | Advertencia: ${advertencias} | Info: ${informacion}`, 14, 34);

                    autoTable(doc, {
                        startY: 42,
                        head: [['Nombre', 'País', 'Fuerza', 'Días Rest.', 'Fin Comisión', 'Severidad']],
                        body: alertas.map(a => ([
                            a.apellidoNombre, a.pais, a.fuerza,
                            `${a.diasRestantes} días`, formatDate(a.finComision),
                            a.severidad === 'Critica' ? 'CRÍTICA' : a.severidad === 'Advertencia' ? 'ADVERTENCIA' : 'INFO'
                        ])),
                        styles: { fontSize: 9 },
                        headStyles: { fillColor: [30, 58, 138] },
                    });
                    doc.save(`Reporte_Vencimientos_${new Date().toISOString().slice(0, 10)}.pdf`);
                    break;
                }
                case 'distribucion': {
                    doc.text('Distribución Geográfica por Fuerza', 14, 20);
                    doc.setFontSize(10);
                    doc.setTextColor(107, 114, 128);
                    doc.text(`Generado: ${now} — Total personal: ${total}`, 14, 28);

                    // By force summary
                    autoTable(doc, {
                        startY: 36,
                        head: [['Fuerza', 'Cantidad', 'Porcentaje']],
                        body: porFuerza.map(f => [f.nombre, f.cantidad, `${total > 0 ? Math.round((f.cantidad / total) * 100) : 0}%`]),
                        styles: { fontSize: 10 },
                        headStyles: { fillColor: [30, 58, 138] },
                    });

                    // By country
                    const data = allAgregaduras || agregaduras;
                    const byCountry = {};
                    data.forEach(a => {
                        if (!byCountry[a.pais]) byCountry[a.pais] = { EA: 0, ARA: 0, FAA: 0, Total: 0 };
                        byCountry[a.pais][a.fuerzaCodigo] = (byCountry[a.pais][a.fuerzaCodigo] || 0) + 1;
                        byCountry[a.pais].Total++;
                    });

                    autoTable(doc, {
                        startY: doc.lastAutoTable.finalY + 10,
                        head: [['País', 'EA', 'ARA', 'FAA', 'Total']],
                        body: Object.entries(byCountry)
                            .sort((a, b) => b[1].Total - a[1].Total)
                            .map(([pais, counts]) => [pais, counts.EA, counts.ARA, counts.FAA, counts.Total]),
                        styles: { fontSize: 9 },
                        headStyles: { fillColor: [30, 58, 138] },
                    });
                    doc.save(`Reporte_Distribucion_${new Date().toISOString().slice(0, 10)}.pdf`);
                    break;
                }
                case 'decretos': {
                    doc.text('Estado de Decretos y Resoluciones', 14, 20);
                    doc.setFontSize(10);
                    doc.setTextColor(107, 114, 128);
                    doc.text(`Generado: ${now}`, 14, 28);

                    const data = allAgregaduras || agregaduras;
                    const firmados = data.filter(a => a.firmaDecretoResol);
                    const enTramite = data.filter(a => a.nroDecretoResol && !a.firmaDecretoResol);
                    const pendientes = data.filter(a => !a.nroDecretoResol && !a.firmaDecretoResol);

                    doc.text(`Firmados: ${firmados.length} | En trámite: ${enTramite.length} | Pendientes: ${pendientes.length}`, 14, 34);

                    autoTable(doc, {
                        startY: 42,
                        head: [['Nombre', 'País', 'Nro Decreto', 'Firma', 'Estado']],
                        body: data.map(a => ([
                            a.apellidoNombre, a.pais,
                            a.nroDecretoResol || '—',
                            a.firmaDecretoResol ? formatDate(a.firmaDecretoResol) : '—',
                            a.firmaDecretoResol ? 'FIRMADO' : a.nroDecretoResol ? 'EN TRÁMITE' : 'PENDIENTE'
                        ])),
                        styles: { fontSize: 9 },
                        headStyles: { fillColor: [30, 58, 138] },
                    });
                    doc.save(`Reporte_Decretos_${new Date().toISOString().slice(0, 10)}.pdf`);
                    break;
                }
                case 'resumen': {
                    doc.text('Resumen General del Personal', 14, 20);
                    doc.setFontSize(10);
                    doc.setTextColor(107, 114, 128);
                    doc.text(`Generado: ${now}`, 14, 28);

                    autoTable(doc, {
                        startY: 36,
                        head: [['Métrica', 'Valor']],
                        body: [
                            ['Total Personal', total],
                            ['Oficiales', oficiales],
                            ['Suboficiales', suboficiales],
                            ...porFuerza.map(f => [f.nombre, f.cantidad]),
                            ['Países con presencia', countryData.length],
                            ['Alertas críticas', criticas],
                            ['Alertas advertencia', advertencias],
                        ],
                        styles: { fontSize: 11 },
                        headStyles: { fillColor: [30, 58, 138] },
                    });

                    const data = allAgregaduras || agregaduras;
                    autoTable(doc, {
                        startY: doc.lastAutoTable.finalY + 10,
                        head: [['Apellido y Nombre', 'País', 'Fuerza', 'Grado', 'Cargo', 'Fin Comisión']],
                        body: data.map(a => ([
                            a.apellidoNombre, a.pais, a.fuerzaCodigo,
                            a.gradoAbreviatura || a.grado, a.cargo || '',
                            a.finComision ? formatDate(a.finComision) : ''
                        ])),
                        styles: { fontSize: 8 },
                        headStyles: { fillColor: [30, 58, 138] },
                    });
                    doc.save(`Reporte_Resumen_${new Date().toISOString().slice(0, 10)}.pdf`);
                    break;
                }
            }
        } catch (err) {
            alert('Error generando PDF: ' + err.message);
        } finally {
            setGenerating(null);
        }
    };

    const handleExportExcel = async () => {
        setGenerating('excel');
        try {
            const XLSX = await import('xlsx');
            const wb = XLSX.utils.book_new();

            // Sheet 1: Resumen KPIs
            const resumenData = [
                { Métrica: 'Total Personal', Valor: total },
                { Métrica: 'Oficiales', Valor: oficiales },
                { Métrica: 'Suboficiales', Valor: suboficiales },
                ...porFuerza.map(f => ({ Métrica: f.nombre, Valor: f.cantidad })),
                { Métrica: 'Alertas Críticas', Valor: criticas },
                { Métrica: 'Alertas Advertencia', Valor: advertencias },
            ];
            const ws1 = XLSX.utils.json_to_sheet(resumenData);
            ws1['!cols'] = [{ wch: 24 }, { wch: 12 }];
            XLSX.utils.book_append_sheet(wb, ws1, 'Resumen');

            // Sheet 2: Detalle completo
            const data = allAgregaduras || agregaduras;
            const detalleData = data.map(a => ({
                'País': a.pais,
                'Apellido y Nombre': a.apellidoNombre,
                'Fuerza': a.fuerzaCodigo,
                'Grado': a.grado,
                'Cargo': a.cargo || '',
                'Fin Comisión': a.finComision ? formatDate(a.finComision) : '',
                'Días Restantes': a.diasRestantes ?? '',
                'Decreto': a.nroDecretoResol || '',
                'Firma Decreto': a.firmaDecretoResol ? formatDate(a.firmaDecretoResol) : '',
                'Teléfono': a.telefonoOficial || '',
                'Email': a.correoElectronico || '',
            }));
            const ws2 = XLSX.utils.json_to_sheet(detalleData);
            ws2['!cols'] = [
                { wch: 18 }, { wch: 28 }, { wch: 8 }, { wch: 22 }, { wch: 20 },
                { wch: 14 }, { wch: 12 }, { wch: 18 }, { wch: 14 }, { wch: 20 }, { wch: 28 },
            ];
            XLSX.utils.book_append_sheet(wb, ws2, 'Detalle');

            // Sheet 3: Alertas
            const alertSheet = XLSX.utils.json_to_sheet(alertas.map(a => ({
                'Nombre': a.apellidoNombre,
                'País': a.pais,
                'Fuerza': a.fuerza,
                'Días Restantes': a.diasRestantes,
                'Fin Comisión': formatDate(a.finComision),
                'Severidad': a.severidad,
            })));
            XLSX.utils.book_append_sheet(wb, alertSheet, 'Alertas');

            XLSX.writeFile(wb, `SAID_Informe_Completo_${new Date().toISOString().slice(0, 10)}.xlsx`);
        } catch (err) {
            alert('Error exportando Excel: ' + err.message);
        } finally {
            setGenerating(null);
        }
    };

    const tooltipStyle = {
        contentStyle: {
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: '0.75rem',
            color: 'var(--color-text)',
            fontSize: '12px'
        }
    };

    const reports = [
        { id: 'vencimientos', icon: Calendar, label: 'Reporte de Vencimientos', desc: 'Comisiones próximas a vencer', color: 'red' },
        { id: 'distribucion', icon: Globe, label: 'Distribución Geográfica', desc: 'Personal por país y fuerza', color: 'green' },
        { id: 'decretos', icon: FileText, label: 'Estado de Decretos', desc: 'Situación de decretos y resoluciones', color: 'amber' },
        { id: 'resumen', icon: BookOpen, label: 'Resumen General', desc: 'Resumen completo del personal', color: 'blue' },
    ];

    return (
        <div>
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                        Informes y Análisis
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Estadísticas, gráficos y reportes descargables
                    </p>
                </div>
                <button
                    onClick={handleExportExcel}
                    disabled={generating === 'excel'}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors shadow-sm disabled:opacity-50"
                >
                    <Download size={16} />
                    {generating === 'excel' ? 'Exportando...' : 'Excel Completo'}
                </button>
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white dark:bg-card-dark rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                    <div className="flex items-center justify-between mb-3">
                        <Users size={20} className="text-blue-500" />
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
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{countryData.length}</p>
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

            {/* Charts Row — Donut Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Force Distribution Donut */}
                <div className="bg-white dark:bg-card-dark rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <Shield size={16} className="text-primary" />
                        Por Fuerza
                    </h3>
                    {fuerzaData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={180}>
                            <PieChart>
                                <Pie
                                    data={fuerzaData} dataKey="value" nameKey="name"
                                    cx="50%" cy="50%" innerRadius={45} outerRadius={75}
                                    labelLine={false} label={renderLabel}
                                    strokeWidth={2} stroke="var(--color-surface)"
                                >
                                    {fuerzaData.map((entry, i) => (
                                        <Cell key={i} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip {...tooltipStyle} />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : <p className="text-gray-400 text-sm text-center py-8">Sin datos</p>}
                    <div className="flex justify-center gap-4 mt-2">
                        {fuerzaData.map(d => (
                            <div key={d.name} className="flex items-center gap-1.5 text-xs text-gray-500">
                                <span className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                                {d.name}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Type Distribution Donut */}
                <div className="bg-white dark:bg-card-dark rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <Users size={16} className="text-purple-500" />
                        Por Tipo
                    </h3>
                    {(oficiales + suboficiales) > 0 ? (
                        <ResponsiveContainer width="100%" height={180}>
                            <PieChart>
                                <Pie
                                    data={tipoData} dataKey="value" nameKey="name"
                                    cx="50%" cy="50%" innerRadius={45} outerRadius={75}
                                    labelLine={false} label={renderLabel}
                                    strokeWidth={2} stroke="var(--color-surface)"
                                >
                                    {tipoData.map((entry, i) => (
                                        <Cell key={i} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip {...tooltipStyle} />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : <p className="text-gray-400 text-sm text-center py-8">Sin datos</p>}
                    <div className="flex justify-center gap-4 mt-2">
                        {tipoData.map(d => (
                            <div key={d.name} className="flex items-center gap-1.5 text-xs text-gray-500">
                                <span className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                                {d.name}: {d.value}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Alert Severity Donut */}
                <div className="bg-white dark:bg-card-dark rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <AlertTriangle size={16} className="text-red-500" />
                        Alertas
                    </h3>
                    {alertData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={180}>
                            <PieChart>
                                <Pie
                                    data={alertData} dataKey="value" nameKey="name"
                                    cx="50%" cy="50%" innerRadius={45} outerRadius={75}
                                    labelLine={false} label={renderLabel}
                                    strokeWidth={2} stroke="var(--color-surface)"
                                >
                                    {alertData.map((entry, i) => (
                                        <Cell key={i} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip {...tooltipStyle} />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-[180px]">
                            <p className="text-green-500 text-sm font-medium">✓ Sin alertas activas</p>
                        </div>
                    )}
                    <div className="flex justify-center gap-4 mt-2">
                        {alertData.map(d => (
                            <div key={d.name} className="flex items-center gap-1.5 text-xs text-gray-500">
                                <span className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                                {d.name}: {d.value}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Top Countries Bar Chart */}
            <div className="bg-white dark:bg-card-dark rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-8">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Globe size={16} className="text-green-500" />
                    Top 10 — Personal por País
                </h3>
                {countryData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={countryData} layout="vertical" margin={{ left: 80, right: 20, top: 5, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" horizontal={false} />
                            <XAxis type="number" stroke="var(--color-text)" fontSize={11} allowDecimals={false} />
                            <YAxis type="category" dataKey="pais" stroke="var(--color-text)" fontSize={11} width={75} />
                            <Tooltip {...tooltipStyle} />
                            <Bar dataKey="cantidad" fill="#3b82f6" radius={[0, 6, 6, 0]} barSize={18} />
                        </BarChart>
                    </ResponsiveContainer>
                ) : <p className="text-gray-400 text-sm text-center py-8">Sin datos</p>}
            </div>

            {/* Expiration Chart */}
            <div className="mb-8">
                <ExpirationChart />
            </div>

            {/* Downloadable Reports */}
            <div className="bg-white dark:bg-card-dark rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Download size={16} className="text-primary" />
                    Reportes Descargables (PDF)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {reports.map(r => {
                        const Icon = r.icon;
                        const isGenerating = generating === r.id;
                        return (
                            <button
                                key={r.id}
                                onClick={() => generatePDF(r.id)}
                                disabled={isGenerating}
                                className={`flex items-center gap-4 p-4 rounded-xl border transition-all text-left hover:shadow-md disabled:opacity-50
                                    border-${r.color}-200 dark:border-${r.color}-800
                                    bg-${r.color}-50/50 dark:bg-${r.color}-900/10
                                    hover:bg-${r.color}-100 dark:hover:bg-${r.color}-900/20`}
                            >
                                <div className={`p-2.5 rounded-lg bg-${r.color}-100 dark:bg-${r.color}-900/30`}>
                                    <Icon size={20} className={`text-${r.color}-600 dark:text-${r.color}-400`} />
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium text-gray-900 dark:text-white text-sm">{r.label}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{r.desc}</p>
                                </div>
                                <Download size={16} className={`text-${r.color}-400 ${isGenerating ? 'animate-bounce' : ''}`} />
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
