import React, { useState } from 'react';
import { X, Upload, Download, Trash2 } from 'lucide-react';
import { CSVImporter } from '../ImportExport/CSVImporter';
import { DataExporter } from '../ImportExport/DataExporter';
import { useData } from '../../context/DataContext';

export const SettingsModal = ({ onClose }) => {
    const { clearAllData } = useData();
    const [showImporter, setShowImporter] = useState(false);

    const handleClearData = () => {
        if (window.confirm('¿Está seguro de eliminar TODOS los datos? Esta acción no se puede deshacer.')) {
            if (window.confirm('Confirmación final: Se eliminarán todos los registros permanentemente.')) {
                clearAllData();
                alert('Todos los datos han sido eliminados');
            }
        }
    };

    return (
        <>
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-surface rounded-lg shadow-xl max-w-2xl w-full">
                    <div className="border-b border-border p-6 flex justify-between items-center">
                        <h2 className="text-2xl font-bold text-text">Configuración</h2>
                        <button onClick={onClose} className="text-secondary hover:text-text">
                            <X size={24} />
                        </button>
                    </div>

                    <div className="p-6 space-y-6">
                        {/* Importar/Exportar CSV */}
                        <div>
                            <h3 className="text-lg font-semibold mb-3 text-text">Importar / Exportar Datos</h3>
                            <div className="space-y-3">
                                <button
                                    onClick={() => setShowImporter(true)}
                                    className="btn btn-primary w-full justify-center"
                                >
                                    <Upload size={20} />
                                    Importar desde CSV
                                </button>

                                <DataExporter />
                            </div>
                        </div>

                        {/* Gestión de datos */}
                        <div className="border-t border-border pt-6">
                            <h3 className="text-lg font-semibold mb-3 text-text">Gestión de Datos</h3>
                            <button
                                onClick={handleClearData}
                                className="btn btn-danger w-full justify-center"
                            >
                                <Trash2 size={20} />
                                Eliminar Todos los Datos
                            </button>
                            <p className="text-sm text-secondary mt-2">
                                Precaución: Esta acción eliminará todos los registros permanentemente.
                            </p>
                        </div>

                        {/* About */}
                        <div className="border-t border-border pt-6">
                            <h3 className="text-lg font-semibold mb-2 text-text">Acerca de</h3>
                            <p className="text-sm text-secondary">
                                Dashboard de Agregadurías de Defensa v1.0
                            </p>
                            <p className="text-sm text-secondary">
                                Sistema de Gestión de Personal de Agregadurías Militares
                            </p>
                        </div>
                    </div>

                    <div className="border-t border-border p-6 flex justify-end">
                        <button onClick={onClose} className="btn btn-primary">
                            Cerrar
                        </button>
                    </div>
                </div>
            </div>

            {showImporter && <CSVImporter onClose={() => setShowImporter(false)} />}
        </>
    );
};
