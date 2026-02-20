import React, { useState } from 'react';
import { Search, ArrowUpDown, Edit2, Trash2, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { formatDate } from '../../utils/dateHelpers';
import { GradeBadge } from '../UI/GradeBadge';

export const MasterTable = ({ onEdit }) => {
    const {
        agregaduras, loading, totalCount,
        tableParams, setSearch, setFuerzaFilter, setSort, setPage,
        deleteAgregadura, lookups
    } = useData();
    const { hasRole } = useAuth();

    const [deleteLoading, setDeleteLoading] = useState(null);

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

    const getDaysRemainingClass = (days) => {
        if (days === null || days === undefined) return '';
        if (days < 0) return 'text-gray-500';
        if (days <= 60) return 'text-red-600 font-bold';
        if (days <= 120) return 'text-orange-500';
        return 'text-green-600';
    };

    const totalPages = Math.ceil(totalCount / tableParams.pageSize) || 1;

    const SortHeader = ({ field, children }) => (
        <th className="text-left p-3 cursor-pointer hover:bg-bg select-none" onClick={() => handleSort(field)}>
            <div className="flex items-center gap-2">
                {children}
                <ArrowUpDown size={14}
                    className={tableParams.sortBy === field ? 'text-primary' : 'text-gray-400'} />
            </div>
        </th>
    );

    return (
        <div className="card">
            <div className="mb-6">
                <h2 className="text-2xl font-bold mb-4 text-text">Tabla Maestra de Agregadurías</h2>

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
                            <SortHeader field="pais">País</SortHeader>
                            <SortHeader field="nombre">Apellido y Nombre</SortHeader>
                            <th className="text-left p-3">Fuerza</th>
                            <SortHeader field="grado">Grado</SortHeader>
                            <SortHeader field="fincomision">Fin Comisión</SortHeader>
                            <th className="text-left p-3">Días Rest.</th>
                            {hasRole('Editor') && <th className="text-left p-3">Acciones</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {agregaduras.length === 0 && !loading ? (
                            <tr>
                                <td colSpan={hasRole('Editor') ? 7 : 6} className="text-center p-8 text-secondary">
                                    No se encontraron registros
                                </td>
                            </tr>
                        ) : (
                            agregaduras.map((item) => (
                                <tr key={item.id} className="border-b border-border hover:bg-bg transition-colors">
                                    <td className="p-3">{item.pais}</td>
                                    <td className="p-3 font-medium">{item.apellidoNombre}</td>
                                    <td className="p-3">
                                        <span className={`badge badge-${item.fuerzaCodigo?.toLowerCase()}`}>
                                            {item.fuerzaCodigo}
                                        </span>
                                    </td>
                                    <td className="p-3">
                                        <GradeBadge
                                            grado={item.grado}
                                            abreviatura={item.gradoAbreviatura}
                                            codigoOTAN={item.codigoOTAN}
                                            tipoGrado={item.tipoGrado}
                                            compact
                                        />
                                    </td>
                                    <td className="p-3">{formatDate(item.finComision)}</td>
                                    <td className="p-3">
                                        <span className={getDaysRemainingClass(item.diasRestantes)}>
                                            {item.diasRestantes != null ? `${item.diasRestantes} días` : 'N/A'}
                                        </span>
                                    </td>
                                    {hasRole('Editor') && (
                                        <td className="p-3">
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
                            ))
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
                        {/* Page numbers */}
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
