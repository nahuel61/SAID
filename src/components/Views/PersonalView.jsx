import React, { useState } from 'react';
import { MasterTable } from '../Table/MasterTable';
import { AgregaturaForm } from '../Forms/AgregaturaForm';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Plus, Users, UserCheck, UserX } from 'lucide-react';
import { GradeBadge } from '../UI/GradeBadge';

export const PersonalView = () => {
    const { kpis, agregaduras } = useData();
    const { hasRole } = useAuth();
    const [showForm, setShowForm] = useState(false);
    const [editData, setEditData] = useState(null);

    const handleEdit = (data) => {
        setEditData(data);
        setShowForm(true);
    };

    const handleCloseForm = () => {
        setShowForm(false);
        setEditData(null);
    };

    const stats = [
        {
            label: 'Total Personal',
            value: kpis?.totalPersonal || 0,
            icon: Users,
            color: 'from-blue-500 to-indigo-600',
            bgLight: 'bg-blue-50 dark:bg-blue-900/20'
        },
        {
            label: 'Oficiales',
            value: kpis?.totalOficiales || 0,
            icon: UserCheck,
            color: 'from-amber-500 to-orange-600',
            bgLight: 'bg-amber-50 dark:bg-amber-900/20'
        },
        {
            label: 'Suboficiales',
            value: kpis?.totalSuboficiales || 0,
            icon: UserX,
            color: 'from-purple-500 to-violet-600',
            bgLight: 'bg-purple-50 dark:bg-purple-900/20'
        }
    ];

    return (
        <>
            <div className="mb-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                            Personal de Agregadurías
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Gestión completa del personal en misiones exteriores
                        </p>
                    </div>
                    {hasRole('Editor') && (
                        <button
                            onClick={() => { setEditData(null); setShowForm(true); }}
                            className="flex items-center gap-2 bg-primary hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-primary/30"
                        >
                            <Plus size={16} />
                            Nueva Misión
                        </button>
                    )}
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    {stats.map(stat => {
                        const Icon = stat.icon;
                        return (
                            <div key={stat.label} className={`${stat.bgLight} rounded-xl p-4 border border-gray-200 dark:border-gray-700`}>
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg bg-gradient-to-br ${stat.color} text-white`}>
                                        <Icon size={20} />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <MasterTable onEdit={handleEdit} />

            {showForm && hasRole('Editor') && (
                <AgregaturaForm onClose={handleCloseForm} editData={editData} />
            )}
        </>
    );
};
