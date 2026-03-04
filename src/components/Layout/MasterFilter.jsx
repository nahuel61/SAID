import React from 'react';
import { Users, UserCheck, UserMinus, Clock, AlertTriangle, XCircle, CheckCircle } from 'lucide-react';
import { useData } from '../../context/DataContext';

export const MasterFilter = () => {
    const { masterFilter, setMasterFilter, estadoFilter, setEstadoFilter } = useData();

    const typeFilters = [
        { value: '', label: 'Todos', icon: Users },
        { value: 'Oficial', label: 'Oficiales', icon: UserCheck },
        { value: 'Suboficial', label: 'Suboficiales', icon: UserMinus }
    ];

    const estadoFilters = [
        { value: '', label: 'Todas' },
        { value: 'activas', label: 'Activas' },
        { value: 'proximas', label: '≤120 días' },
        { value: 'criticas', label: '≤30 días' },
        { value: 'vencidas', label: 'Vencidas' },
    ];

    return (
        <div className="flex items-center gap-2 flex-wrap">
            {/* Type filter */}
            <div className="flex items-center rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                {typeFilters.map(({ value, label, icon: Icon }) => (
                    <button
                        key={value}
                        onClick={() => setMasterFilter(value)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-all ${masterFilter === value
                            ? 'bg-primary text-white shadow-sm'
                            : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                            }`}
                    >
                        <Icon size={14} />
                        {label}
                    </button>
                ))}
            </div>

            {/* Estado filter */}
            <select
                value={estadoFilter}
                onChange={(e) => setEstadoFilter(e.target.value)}
                className="text-xs px-2 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 focus:outline-none focus:border-primary transition-colors cursor-pointer"
            >
                {estadoFilters.map(({ value, label }) => (
                    <option key={value} value={value}>{label}</option>
                ))}
            </select>
        </div>
    );
};
