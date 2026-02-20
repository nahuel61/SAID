import React, { useState } from 'react';
import { Download, FileSpreadsheet, FileText, Loader2, ChevronDown } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { exportApi } from '../../utils/api';

export const DataExporter = () => {
    const { allAgregaduras, masterFilter } = useData();
    const [loading, setLoading] = useState(null); // 'csv' | 'excel' | 'pdf' | null
    const [open, setOpen] = useState(false);

    const getExportData = () => {
        return allAgregaduras.map(item => ({
            'País': item.pais || '',
            'Cargo': item.cargo || '',
            'Fuerza': item.fuerza || '',
            'Grado': item.grado || '',
            'Apellido y Nombre': item.apellidoNombre || '',
            'Fin Comisión': item.finComision ? new Date(item.finComision).toLocaleDateString('es-AR') : '',
            'Días Restantes': item.diasRestantes ?? '',
            'Teléfono': item.telefonoOficial || '',
            'Email': item.correoElectronico || ''
        }));
    };

    const handleCSV = async () => {
        setLoading('csv');
        try {
            await exportApi.csv(masterFilter || undefined);
        } catch (err) {
            alert('Error al exportar CSV: ' + err.message);
        } finally {
            setLoading(null);
            setOpen(false);
        }
    };

    const handleExcel = async () => {
        setLoading('excel');
        try {
            const XLSX = await import('xlsx');
            const data = getExportData();
            const ws = XLSX.utils.json_to_sheet(data);

            // Auto-fit column widths
            const colWidths = Object.keys(data[0] || {}).map(key => ({
                wch: Math.max(key.length, ...data.map(row => String(row[key]).length))
            }));
            ws['!cols'] = colWidths;

            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Agregadurías');
            XLSX.writeFile(wb, `PIGC_Export_${new Date().toISOString().split('T')[0]}.xlsx`);
        } catch (err) {
            alert('Error al exportar Excel: ' + err.message);
        } finally {
            setLoading(null);
            setOpen(false);
        }
    };

    const handlePDF = async () => {
        setLoading('pdf');
        try {
            const { default: jsPDF } = await import('jspdf');
            const { default: autoTable } = await import('jspdf-autotable');

            const data = getExportData();
            const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

            // Title
            doc.setFontSize(16);
            doc.setFont('helvetica', 'bold');
            doc.text('PIGC — Personal en Agregadurías', 14, 15);

            // Subtitle
            doc.setFontSize(9);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(100);
            const filterText = masterFilter ? `Filtro: ${masterFilter}` : 'Todos los registros';
            doc.text(`${filterText} — ${data.length} registros — ${new Date().toLocaleDateString('es-AR')}`, 14, 21);
            doc.setTextColor(0);

            // Table
            const columns = Object.keys(data[0] || {});
            const rows = data.map(item => columns.map(col => item[col]));

            autoTable(doc, {
                head: [columns],
                body: rows,
                startY: 26,
                theme: 'grid',
                styles: {
                    fontSize: 7,
                    cellPadding: 2,
                    overflow: 'linebreak'
                },
                headStyles: {
                    fillColor: [19, 91, 236], // primary blue
                    textColor: [255, 255, 255],
                    fontStyle: 'bold',
                    fontSize: 7.5
                },
                alternateRowStyles: {
                    fillColor: [245, 247, 250]
                },
                columnStyles: {
                    0: { cellWidth: 28 },  // País
                    1: { cellWidth: 35 },  // Cargo
                    2: { cellWidth: 18 },  // Fuerza
                    3: { cellWidth: 25 },  // Grado
                    4: { cellWidth: 45 },  // Nombre
                    5: { cellWidth: 22 },  // Fin Comisión
                    6: { cellWidth: 18 },  // Días
                    7: { cellWidth: 28 },  // Teléfono
                    8: { cellWidth: 45 },  // Email
                },
                didDrawPage: (data) => {
                    // Footer
                    doc.setFontSize(7);
                    doc.setTextColor(150);
                    doc.text(
                        `PIGC Dashboard — Página ${doc.internal.getNumberOfPages()}`,
                        doc.internal.pageSize.width / 2, doc.internal.pageSize.height - 6,
                        { align: 'center' }
                    );
                }
            });

            doc.save(`PIGC_Export_${new Date().toISOString().split('T')[0]}.pdf`);
        } catch (err) {
            alert('Error al exportar PDF: ' + err.message);
        } finally {
            setLoading(null);
            setOpen(false);
        }
    };

    const exportOptions = [
        { key: 'csv', label: 'CSV', icon: FileText, handler: handleCSV, desc: 'Para importar' },
        { key: 'excel', label: 'Excel', icon: FileSpreadsheet, handler: handleExcel, desc: 'Hoja de cálculo' },
        { key: 'pdf', label: 'PDF', icon: FileText, handler: handlePDF, desc: 'Para imprimir' }
    ];

    return (
        <div className="relative">
            <button
                onClick={() => setOpen(!open)}
                className="btn btn-secondary w-full justify-center"
                disabled={!!loading}
            >
                {loading ? (
                    <>
                        <Loader2 size={18} className="animate-spin" />
                        Exportando...
                    </>
                ) : (
                    <>
                        <Download size={18} />
                        Exportar
                        <ChevronDown size={14} className={`ml-1 transition-transform ${open ? 'rotate-180' : ''}`} />
                    </>
                )}
            </button>

            {open && !loading && (
                <div className="absolute bottom-full left-0 right-0 mb-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50 overflow-hidden">
                    {exportOptions.map(({ key, label, icon: Icon, handler, desc }) => (
                        <button
                            key={key}
                            onClick={handler}
                            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-200"
                        >
                            <Icon size={16} className="text-gray-400" />
                            <div>
                                <span className="font-medium">{label}</span>
                                <span className="text-gray-400 text-xs ml-2">{desc}</span>
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};
