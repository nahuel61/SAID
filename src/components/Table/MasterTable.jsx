import React, { useState, useEffect, useRef } from 'react';
import {
    Search, ArrowUpDown, Edit2, Trash2, ChevronLeft, ChevronRight,
    Loader2, ChevronDown, ChevronUp, Download, Phone, Mail, MapPin,
    FileText, AlertCircle, CheckCircle, Clock, SlidersHorizontal, Eye, EyeOff
} from 'lucide-react';

const ALL_COLUMNS = [
    { key: 'pais', label: 'País', sortField: 'pais' },
    { key: 'nombre', label: 'Apellido y Nombre', sortField: 'nombre' },
    { key: 'fuerza', label: 'Fuerza' },
    { key: 'grado', label: 'Grado', sortField: 'grado' },
    { key: 'decreto', label: 'Decreto' },
    { key: 'finComision', label: 'Fin Comisión', sortField: 'fincomision' },
    { key: 'diasRestantes', label: 'Días Rest.' },
];

const DEFAULT_VISIBLE = ALL_COLUMNS.map(c => c.key);

const loadColumnPrefs = () => {
    try {
        const saved = localStorage.getItem('table_columns');
        if (saved) return JSON.parse(saved);
    } catch { }
    return DEFAULT_VISIBLE;
};
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { formatDate } from '../../utils/dateHelpers';
import { GradeBadge } from '../UI/GradeBadge';

// Decree status badge
const DecreeStatusBadge = ({ nroDecreto, firmaDecreto }) => {
    if (firmaDecreto) {
        return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                <CheckCircle size={10} /> Firmado
            </span>
        );
    }
    if (nroDecreto) {
        return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                <Clock size={10} /> En Trámite
            </span>
        );
    }
    return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300 border border-red-200 dark:border-red-800">
            <AlertCircle size={10} /> Pendiente
        </span>
    );
};

// Days remaining badge with urgency styling
const DaysRemainingBadge = ({ days }) => {
    if (days === null || days === undefined) {
        return <span className="text-gray-400 text-sm">N/A</span>;
    }

    if (days < 0) {
        return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 line-through">
                Vencida
            </span>
        );
    }

    if (days <= 30) {
        return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300 border border-red-200 dark:border-red-800">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                {days} días
            </span>
        );
    }

    if (days <= 60) {
        return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300">
                {days} días
            </span>
        );
    }

    if (days <= 120) {
        return (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                {days} días
            </span>
        );
    }

    return (
        <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
            {days} días
        </span>
    );
};

// Expandable detail row
const DetailRow = ({ item, colSpan }) => (
    <tr className="border-b border-border">
        <td colSpan={colSpan} className="p-0">
            <div className="animate-expand bg-gray-50 dark:bg-gray-800/50 px-6 py-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    {/* Contact info */}
                    <div className="space-y-2">
                        <h4 className="font-semibold text-gray-700 dark:text-gray-300 text-xs uppercase tracking-wide mb-2">
                            Contacto
                        </h4>
                        {item.telefonoOficial && (
                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                <Phone size={14} className="text-blue-500" />
                                <span>{item.telefonoOficial}</span>
                            </div>
                        )}
                        {item.correoElectronico && (
                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                <Mail size={14} className="text-blue-500" />
                                <span>{item.correoElectronico}</span>
                            </div>
                        )}
                        {item.direccionOficial && (
                            <div className="flex items-start gap-2 text-gray-600 dark:text-gray-400">
                                <MapPin size={14} className="text-blue-500 mt-0.5" />
                                <span>{item.direccionOficial}</span>
                            </div>
                        )}
                        {!item.telefonoOficial && !item.correoElectronico && !item.direccionOficial && (
                            <p className="text-gray-400 text-xs italic">Sin información de contacto</p>
                        )}
                    </div>

                    {/* Decree info */}
                    <div className="space-y-2">
                        <h4 className="font-semibold text-gray-700 dark:text-gray-300 text-xs uppercase tracking-wide mb-2">
                            Decreto / Resolución
                        </h4>
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                            <FileText size={14} className="text-indigo-500" />
                            <span>{item.nroDecretoResol || 'Sin número'}</span>
                        </div>
                        <div className="text-gray-600 dark:text-gray-400">
                            <span className="text-xs text-gray-400">Firma: </span>
                            {item.firmaDecretoResol ? formatDate(item.firmaDecretoResol) : 'Pendiente'}
                        </div>
                        {item.diasEntreFirmaPartida != null && (
                            <div className="text-xs text-gray-400">
                                {item.diasEntreFirmaPartida} días entre firma y partida
                            </div>
                        )}
                    </div>

                    {/* Commission info */}
                    <div className="space-y-2">
                        <h4 className="font-semibold text-gray-700 dark:text-gray-300 text-xs uppercase tracking-wide mb-2">
                            Comisión
                        </h4>
                        <div className="text-gray-600 dark:text-gray-400">
                            <span className="text-xs text-gray-400">Cargo: </span>
                            {item.cargo || 'Sin especificar'}
                        </div>
                        <div className="text-gray-600 dark:text-gray-400">
                            <span className="text-xs text-gray-400">Salida: </span>
                            {item.fechaSalida ? formatDate(item.fechaSalida) : 'Sin fecha'}
                        </div>
                        {item.relevoPasajeCargos && (
                            <div className="text-gray-600 dark:text-gray-400">
                                <span className="text-xs text-gray-400">Relevo: </span>
                                {item.relevoPasajeCargos}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </td>
    </tr>
);

export const MasterTable = ({ onEdit }) => {
    const {
        agregaduras, loading, totalCount,
        tableParams, setSearch, setFuerzaFilter, setSort, setPage,
        deleteAgregadura, lookups
    } = useData();
    const { hasRole } = useAuth();

    const [deleteLoading, setDeleteLoading] = useState(null);
    const [expandedRow, setExpandedRow] = useState(null);
    const [visibleCols, setVisibleCols] = useState(loadColumnPrefs);
    const [showColMenu, setShowColMenu] = useState(false);
    const colMenuRef = useRef(null);

    useEffect(() => {
        localStorage.setItem('table_columns', JSON.stringify(visibleCols));
    }, [visibleCols]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (colMenuRef.current && !colMenuRef.current.contains(e.target)) setShowColMenu(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleCol = (key) => {
        setVisibleCols(prev => {
            if (prev.includes(key)) {
                if (prev.length <= 2) return prev; // min 2 columns
                return prev.filter(k => k !== key);
            }
            return [...prev, key];
        });
    };

    const isCol = (key) => visibleCols.includes(key);

    const handleSort = (field) => {
        const newDir = tableParams.sortBy === field && tableParams.sortDir === 'asc' ? 'desc' : 'asc';
        setSort(field, newDir);
    };

    const handleDelete = async (id, nombre) => {
        if (!window.confirm(`¿Está seguro de eliminar el registro de ${nombre}?`)) return;
        setDeleteLoading(id);
        try {
            await deleteAgregadura(id);
        } catch (err) {
            alert('Error al eliminar: ' + err.message);
        } finally {
            setDeleteLoading(null);
        }
    };

    const handleExportVisible = () => {
        try {
            // Dynamic import to avoid loading xlsx if not needed
            import('xlsx').then(XLSX => {
                const exportData = agregaduras.map(item => ({
                    'País': item.pais,
                    'Apellido y Nombre': item.apellidoNombre,
                    'Fuerza': item.fuerzaCodigo,
                    'Grado': item.grado,
                    'Cargo': item.cargo || '',
                    'Fin Comisión': item.finComision ? formatDate(item.finComision) : '',
                    'Días Restantes': item.diasRestantes ?? '',
                    'Decreto': item.nroDecretoResol || '',
                    'Firma Decreto': item.firmaDecretoResol ? formatDate(item.firmaDecretoResol) : '',
                    'Teléfono': item.telefonoOficial || '',
                    'Email': item.correoElectronico || '',
                }));

                const ws = XLSX.utils.json_to_sheet(exportData);
                const wb = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(wb, ws, 'Agregadurías');

                // Column widths
                ws['!cols'] = [
                    { wch: 18 }, { wch: 28 }, { wch: 8 }, { wch: 22 }, { wch: 20 },
                    { wch: 14 }, { wch: 14 }, { wch: 18 }, { wch: 14 }, { wch: 20 }, { wch: 28 },
                ];

                XLSX.writeFile(wb, `agregadurias_filtradas_${new Date().toISOString().slice(0, 10)}.xlsx`);
            });
        } catch (err) {
            alert('Error al exportar: ' + err.message);
        }
    };

    const totalPages = Math.ceil(totalCount / tableParams.pageSize) || 1;
    const visibleCount = visibleCols.length;
    const colSpan = visibleCount + 1 + (hasRole('Editor') ? 1 : 0); // +1 for expand column

    const SortHeader = ({ field, children }) => (
        <th className="text-left p-3 cursor-pointer hover:bg-bg select-none group/th" onClick={() => handleSort(field)}>
            <div className="flex items-center gap-2">
                {children}
                <ArrowUpDown size={14}
                    className={`transition-colors ${tableParams.sortBy === field ? 'text-primary' : 'text-gray-400 group-hover/th:text-gray-500'}`} />
            </div>
        </th>
    );

    return (
        <div className="card">
            <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold text-text">Tabla Maestra de Agregadurías</h2>
                    <div className="flex items-center gap-2">
                        {/* Column configuration */}
                        <div className="relative" ref={colMenuRef}>
                            <button
                                onClick={() => setShowColMenu(!showColMenu)}
                                className="btn btn-secondary text-xs gap-1.5"
                                title="Configurar columnas visibles"
                            >
                                <SlidersHorizontal size={14} />
                                Columnas
                            </button>
                            {showColMenu && (
                                <div className="absolute right-0 top-full mt-2 w-52 bg-white dark:bg-card-dark rounded-xl border border-gray-200 dark:border-gray-700 shadow-xl z-30 py-2 animate-fade-in">
                                    <p className="px-3 py-1.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Columnas visibles</p>
                                    {ALL_COLUMNS.map(col => (
                                        <button
                                            key={col.key}
                                            onClick={() => toggleCol(col.key)}
                                            className="w-full flex items-center gap-2.5 px-3 py-1.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors text-left"
                                        >
                                            {visibleCols.includes(col.key)
                                                ? <Eye size={14} className="text-primary" />
                                                : <EyeOff size={14} className="text-gray-400" />
                                            }
                                            <span className={visibleCols.includes(col.key) ? 'text-gray-900 dark:text-white' : 'text-gray-400'}>
                                                {col.label}
                                            </span>
                                        </button>
                                    ))}
                                    <div className="border-t border-gray-200 dark:border-gray-700 mt-1 pt-1 px-3">
                                        <button
                                            onClick={() => setVisibleCols(DEFAULT_VISIBLE)}
                                            className="text-xs text-primary hover:underline py-1"
                                        >
                                            Restablecer todas
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                        <button
                            onClick={handleExportVisible}
                            className="btn btn-secondary text-xs gap-1.5"
                            title="Exportar registros filtrados a Excel"
                        >
                            <Download size={14} />
                            Exportar visibles
                        </button>
                    </div>
                </div>

                {/* Filtros y búsqueda */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary" size={20} />
                            <input
                                type="text"
                                placeholder="Buscar por nombre, país, grado..."
                                value={tableParams.search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="input-field pl-10"
                            />
                        </div>
                    </div>

                    <div>
                        <select
                            value={tableParams.fuerza}
                            onChange={(e) => setFuerzaFilter(e.target.value)}
                            className="input-field"
                        >
                            <option value="">Todas las Fuerzas</option>
                            {lookups.fuerzas.map(f => (
                                <option key={f.id} value={f.codigo}>
                                    {f.nombre} ({f.codigo})
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="mt-2 text-sm text-secondary flex justify-between items-center">
                    <span>Mostrando {agregaduras.length} de {totalCount} registros</span>
                    {loading && <Loader2 size={16} className="animate-spin text-primary" />}
                </div>
            </div>

            {/* Tabla */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b-2 border-border">
                            <th className="w-8 p-3"></th>
                            {isCol('pais') && <SortHeader field="pais">País</SortHeader>}
                            {isCol('nombre') && <SortHeader field="nombre">Apellido y Nombre</SortHeader>}
                            {isCol('fuerza') && <th className="text-left p-3">Fuerza</th>}
                            {isCol('grado') && <SortHeader field="grado">Grado</SortHeader>}
                            {isCol('decreto') && <th className="text-left p-3">Decreto</th>}
                            {isCol('finComision') && <SortHeader field="fincomision">Fin Comisión</SortHeader>}
                            {isCol('diasRestantes') && <th className="text-left p-3">Días Rest.</th>}
                            {hasRole('Editor') && <th className="text-left p-3">Acciones</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {agregaduras.length === 0 && !loading ? (
                            <tr>
                                <td colSpan={colSpan + 1} className="text-center p-8 text-secondary">
                                    No se encontraron registros
                                </td>
                            </tr>
                        ) : (
                            agregaduras.map((item) => {
                                const isExpanded = expandedRow === item.id;
                                return (
                                    <React.Fragment key={item.id}>
                                        <tr
                                            className={`border-b border-border hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer ${isExpanded ? 'bg-gray-50 dark:bg-gray-800/50' : ''}`}
                                            onClick={() => setExpandedRow(isExpanded ? null : item.id)}
                                        >
                                            <td className="p-3 text-center">
                                                {isExpanded
                                                    ? <ChevronUp size={14} className="text-primary mx-auto" />
                                                    : <ChevronDown size={14} className="text-gray-400 mx-auto" />
                                                }
                                            </td>
                                            {isCol('pais') && <td className="p-3">{item.pais}</td>}
                                            {isCol('nombre') && <td className="p-3 font-medium">{item.apellidoNombre}</td>}
                                            {isCol('fuerza') && (
                                                <td className="p-3">
                                                    <span className={`badge badge-${item.fuerzaCodigo?.toLowerCase()}`}>
                                                        {item.fuerzaCodigo}
                                                    </span>
                                                </td>
                                            )}
                                            {isCol('grado') && (
                                                <td className="p-3">
                                                    <GradeBadge
                                                        grado={item.grado}
                                                        abreviatura={item.gradoAbreviatura}
                                                        codigoOTAN={item.codigoOTAN}
                                                        tipoGrado={item.tipoGrado}
                                                        compact
                                                    />
                                                </td>
                                            )}
                                            {isCol('decreto') && (
                                                <td className="p-3">
                                                    <DecreeStatusBadge
                                                        nroDecreto={item.nroDecretoResol}
                                                        firmaDecreto={item.firmaDecretoResol}
                                                    />
                                                </td>
                                            )}
                                            {isCol('finComision') && <td className="p-3">{formatDate(item.finComision)}</td>}
                                            {isCol('diasRestantes') && (
                                                <td className="p-3">
                                                    <DaysRemainingBadge days={item.diasRestantes} />
                                                </td>
                                            )}
                                            {hasRole('Editor') && (
                                                <td className="p-3" onClick={e => e.stopPropagation()}>
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => onEdit(item)}
                                                            className="text-primary hover:text-primary-dark p-1"
                                                            title="Editar"
                                                        >
                                                            <Edit2 size={18} />
                                                        </button>
                                                        {hasRole('Admin') && (
                                                            <button
                                                                onClick={() => handleDelete(item.id, item.apellidoNombre)}
                                                                className="text-red-600 hover:text-red-800 p-1"
                                                                title="Eliminar"
                                                                disabled={deleteLoading === item.id}
                                                            >
                                                                {deleteLoading === item.id
                                                                    ? <Loader2 size={18} className="animate-spin" />
                                                                    : <Trash2 size={18} />}
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            )}
                                        </tr>
                                        {isExpanded && (
                                            <DetailRow item={item} colSpan={colSpan + 1} />
                                        )}
                                    </React.Fragment>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                    <span className="text-sm text-secondary">
                        Página {tableParams.page} de {totalPages}
                    </span>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setPage(tableParams.page - 1)}
                            disabled={tableParams.page <= 1}
                            className="p-2 rounded-lg hover:bg-bg disabled:opacity-30 transition-colors"
                        >
                            <ChevronLeft size={18} />
                        </button>
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            const start = Math.max(1, Math.min(tableParams.page - 2, totalPages - 4));
                            const pg = start + i;
                            if (pg > totalPages) return null;
                            return (
                                <button
                                    key={pg}
                                    onClick={() => setPage(pg)}
                                    className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${pg === tableParams.page
                                        ? 'bg-primary text-white'
                                        : 'hover:bg-bg text-secondary'
                                        }`}
                                >
                                    {pg}
                                </button>
                            );
                        })}
                        <button
                            onClick={() => setPage(tableParams.page + 1)}
                            disabled={tableParams.page >= totalPages}
                            className="p-2 rounded-lg hover:bg-bg disabled:opacity-30 transition-colors"
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
