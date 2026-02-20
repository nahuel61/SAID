import React from 'react';
import { Users, UserCheck, UserMinus } from 'lucide-react';
import { useData } from '../../context/DataContext';

export const MasterFilter = () => {
    const { masterFilter, setMasterFilter } = useData();

    const filters = [
        { value: '', label: 'Todos', icon: Users },
        { value: 'Oficial', label: 'Oficiales', icon: UserCheck },
        { value: 'Suboficial', label: 'Suboficiales', icon: UserMinus }
    ];

    return (
        <div className="flex items-center rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
            {filters.map(({ value, label, icon: Icon }) => (
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
    );
};
