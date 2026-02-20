import React, { useState } from 'react';
import { Upload, X, AlertCircle, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { parseCSV } from '../../utils/csvParser';

export const CSVImporter = ({ onClose }) => {
    const { importFromCSV } = useData();
    const [file, setFile] = useState(null);
    const [previewData, setPreviewData] = useState([]);
    const [fullParsed, setFullParsed] = useState([]);
    const [importMode, setImportMode] = useState('add');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (!selectedFile) return;

        if (!selectedFile.name.endsWith('.csv')) {
            setError('Por favor seleccione un archivo CSV');
            return;
        }

        setFile(selectedFile);
        setError('');
        setResult(null);

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const csvContent = event.target.result;
                const parsed = parseCSV(csvContent);
                setFullParsed(parsed);
                setPreviewData(parsed.slice(0, 5));
            } catch (err) {
                setError(err.message);
                setPreviewData([]);
                setFullParsed([]);
            }
        };
        reader.readAsText(selectedFile);
    };

    const handleImport = async () => {
        if (!file || fullParsed.length === 0) {
            setError('Seleccione un archivo primero');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // Map parsed data to API format
            const rows = fullParsed.map(item => ({
                pais: item.pais || null,
                cargo: item.cargo || null,
                fuerza: item.fuerza || null,
                grado: item.grado || null,
                apellidoNombre: item.apellidoNombre || null,
                fechaSalida: item.fechaSalida || null,
                finComision: item.finComision || null,
                telefono: item.telefono || null,
                direccion: item.direccion || null,
                email: item.email || null,
                nroDecretoResol: item.nroDecretoResol || null,
                firmaDecretoResol: item.firmaDecretoResol || null,
                diasEntreFirmaPartida: item.diasEntreFirmaPartida || null,
                relevoPasajeCargos: item.relevoPasajeCargos || null
            }));

            const importResult = await importFromCSV(rows, importMode);
            setResult(importResult);
        } catch (err) {
            setError(err.message || 'Error al importar');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-surface rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-surface border-b border-border p-6 flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-text">Importar desde CSV</h2>
                    <button onClick={onClose} className="text-secondary hover:text-text">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {error && (
                        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 flex items-center gap-2">
                            <AlertCircle size={20} />
                            {error}
                        </div>
                    )}

                    {/* Import Result */}
                    {result && (
                        <div className="space-y-3">
                            <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-600 flex items-center gap-2">
                                <CheckCircle size={20} />
                                <span className="font-medium">
                                    Importados: {result.imported} de {result.total} registros
                                    {result.skipped > 0 && ` (${result.skipped} omitidos)`}
                                </span>
                            </div>

                            {result.warnings?.length > 0 && (
                                <div className="p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
                                    <div className="flex items-center gap-2 text-yellow-700 font-medium mb-2">
                                        <AlertTriangle size={18} />
                                        Advertencias ({result.warnings.length})
                                    </div>
                                    <ul className="text-sm text-yellow-600 space-y-1 max-h-40 overflow-y-auto">
                                        {result.warnings.map((w, i) => (
                                            <li key={i}>• {w}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            <div className="flex justify-end">
                                <button onClick={onClose} className="btn btn-primary">
                                    Cerrar
                                </button>
                            </div>
                        </div>
                    )}

                    {/* File selector (hide after result) */}
                    {!result && (
                        <>
                            <div>
                                <label className="label">Seleccionar archivo CSV</label>
                                <input
                                    type="file"
                                    accept=".csv"
                                    onChange={handleFileChange}
                                    className="input-field"
                                />
                                <p className="text-sm text-secondary mt-2">
                                    El archivo debe tener las primeras 3 filas como encabezados institucionales.
                                    Columnas separadas por punto y coma (;).
                                </p>
                            </div>

                            {/* Import mode */}
                            <div>
                                <label className="label">Modo de importación</label>
                                <div className="flex gap-4">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            value="add"
                                            checked={importMode === 'add'}
                                            onChange={(e) => setImportMode(e.target.value)}
                                        />
                                        <span>Agregar a datos existentes</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            value="replace"
                                            checked={importMode === 'replace'}
                                            onChange={(e) => setImportMode(e.target.value)}
                                        />
                                        <span className="text-red-600">Reemplazar todos los datos</span>
                                    </label>
                                </div>
                            </div>

                            {/* Preview */}
                            {previewData.length > 0 && (
                                <div>
                                    <h3 className="label">Vista previa (primeros 5 de {fullParsed.length} registros)</h3>
                                    <div className="overflow-x-auto border border-border rounded">
                                        <table className="w-full text-sm">
                                            <thead className="bg-bg">
                                                <tr>
                                                    <th className="p-2 text-left">País</th>
                                                    <th className="p-2 text-left">Nombre</th>
                                                    <th className="p-2 text-left">Fuerza</th>
                                                    <th className="p-2 text-left">Grado</th>
                                                    <th className="p-2 text-left">Fin Comisión</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {previewData.map((item, index) => (
                                                    <tr key={index} className="border-t border-border">
                                                        <td className="p-2">{item.pais}</td>
                                                        <td className="p-2">{item.apellidoNombre}</td>
                                                        <td className="p-2">{item.fuerza}</td>
                                                        <td className="p-2 text-xs">{item.grado}</td>
                                                        <td className="p-2">{item.finComision}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* Buttons */}
                            <div className="flex justify-end gap-3 pt-4 border-t border-border">
                                <button onClick={onClose} className="btn btn-secondary" disabled={loading}>
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleImport}
                                    disabled={!file || loading || fullParsed.length === 0}
                                    className="btn btn-primary disabled:opacity-50"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 size={20} className="animate-spin" />
                                            Importando...
                                        </>
                                    ) : (
                                        <>
                                            <Upload size={20} />
                                            Importar {fullParsed.length} registros
                                        </>
                                    )}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
