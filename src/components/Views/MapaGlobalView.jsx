import React from 'react';
import { WorldMap } from '../Dashboard/WorldMap';
import { useData } from '../../context/DataContext';
import { Globe, MapPin, Users, Flag } from 'lucide-react';

export const MapaGlobalView = () => {
    const { agregaduras, kpis } = useData();

    // Group by country
    const byCountry = {};
    agregaduras.forEach(a => {
        if (!byCountry[a.pais]) byCountry[a.pais] = [];
        byCountry[a.pais].push(a);
    });
    const countries = Object.entries(byCountry).sort((a, b) => b[1].length - a[1].length);

    return (
        <div>
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                    Mapa Global de Agregadurías
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Distribución geográfica del personal en misiones exteriores
                </p>
            </div>

            {/* Stats bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white dark:bg-card-dark rounded-xl p-4 border border-gray-200 dark:border-gray-700 flex items-center gap-3">
                    <Globe size={20} className="text-blue-500" />
                    <div>
                        <p className="text-xl font-bold text-gray-900 dark:text-white">{countries.length}</p>
                        <p className="text-xs text-gray-500">Países</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-card-dark rounded-xl p-4 border border-gray-200 dark:border-gray-700 flex items-center gap-3">
                    <Users size={20} className="text-green-500" />
                    <div>
                        <p className="text-xl font-bold text-gray-900 dark:text-white">{kpis?.totalPersonal || 0}</p>
                        <p className="text-xs text-gray-500">Personal total</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-card-dark rounded-xl p-4 border border-gray-200 dark:border-gray-700 flex items-center gap-3">
                    <Flag size={20} className="text-amber-500" />
                    <div>
                        <p className="text-xl font-bold text-gray-900 dark:text-white">{kpis?.porFuerza?.length || 0}</p>
                        <p className="text-xs text-gray-500">Fuerzas</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-card-dark rounded-xl p-4 border border-gray-200 dark:border-gray-700 flex items-center gap-3">
                    <MapPin size={20} className="text-red-500" />
                    <div>
                        <p className="text-xl font-bold text-gray-900 dark:text-white">
                            {kpis?.alertas?.filter(a => a.severidad === 'Critica').length || 0}
                        </p>
                        <p className="text-xs text-gray-500">Alertas críticas</p>
                    </div>
                </div>
            </div>

            {/* Full-width map */}
            <div className="mb-6">
                <WorldMap />
            </div>

            {/* Country breakdown */}
            <div className="bg-white dark:bg-card-dark rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <MapPin size={18} className="text-primary" />
                    Personal por País
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {countries.map(([pais, personas]) => (
                        <div
                            key={pais}
                            className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                                    {personas.length}
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-white text-sm">{pais}</p>
                                    <p className="text-xs text-gray-500">
                                        {personas.map(p => p.fuerzaCodigo).filter((v, i, a) => a.indexOf(v) === i).join(', ')}
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-1">
                                {personas.map(p => (
                                    <span
                                        key={p.id}
                                        className={`w-2 h-2 rounded-full badge-${p.fuerzaCodigo?.toLowerCase()}`}
                                        title={`${p.apellidoNombre} (${p.fuerzaCodigo})`}
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
