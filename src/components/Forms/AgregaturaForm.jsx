import React, { useState, useEffect } from 'react';
import { X, Plus, Save, Loader2 } from 'lucide-react';
import { useData } from '../../context/DataContext';

export const AgregaturaForm = ({ onClose, editData = null }) => {
    const { addAgregadura, updateAgregadura, lookups } = useData();
    const isEditing = !!editData;

    const [formData, setFormData] = useState({
        paisId: '',
        fuerzaId: '',
        gradoId: '',
        cargo: '',
        apellidoNombre: '',
        fechaSalida: '',
        finComision: '',
        telefonoOficial: '',
        direccionOficial: '',
        correoElectronico: '',
        nroDecretoResol: '',
        firmaDecretoResol: '',
        diasEntreFirmaPartida: '',
        relevoPasajeCargos: ''
    });

    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState('');

    // Available grades based on selected fuerza
    const [filteredGrados, setFilteredGrados] = useState([]);
    // Available cargos based on selected grado tipo
    const [filteredCargos, setFilteredCargos] = useState([]);

    // Populate form when editing
    useEffect(() => {
        if (isEditing && editData) {
            // Find IDs from lookups based on names
            const pais = lookups.paises.find(p => p.nombre === editData.pais);
            const fuerza = lookups.fuerzas.find(f =>
                f.codigo === editData.fuerzaCodigo || f.nombre === editData.fuerza
            );
            const grado = lookups.grados.find(g =>
                g.nombre === editData.grado || g.abreviatura === editData.gradoAbreviatura
            );

            setFormData({
                paisId: pais?.id || '',
                fuerzaId: fuerza?.id || '',
                gradoId: grado?.id || '',
                cargo: editData.cargo || '',
                apellidoNombre: editData.apellidoNombre || '',
                fechaSalida: editData.fechaSalida ? formatDateForInput(editData.fechaSalida) : '',
                finComision: editData.finComision ? formatDateForInput(editData.finComision) : '',
                telefonoOficial: editData.telefonoOficial || '',
                direccionOficial: editData.direccionOficial || '',
                correoElectronico: editData.correoElectronico || '',
                nroDecretoResol: editData.nroDecretoResol || '',
                firmaDecretoResol: editData.firmaDecretoResol ? formatDateForInput(editData.firmaDecretoResol) : '',
                diasEntreFirmaPartida: editData.diasEntreFirmaPartida || '',
                relevoPasajeCargos: editData.relevoPasajeCargos || ''
            });
        }
    }, [editData, isEditing, lookups]);

    // Filter grades when fuerza changes
    useEffect(() => {
        if (formData.fuerzaId) {
            const filtered = lookups.grados.filter(g => g.fuerzaId === parseInt(formData.fuerzaId));
            setFilteredGrados(filtered);
            // Clear grade if it doesn't match the new fuerza
            if (!filtered.some(g => g.id === parseInt(formData.gradoId))) {
                setFormData(prev => ({ ...prev, gradoId: '', cargo: '' }));
            }
        } else {
            setFilteredGrados(lookups.grados);
        }
    }, [formData.fuerzaId, lookups.grados]);

    // Filter cargos when grado changes (based on grado tipo)
    useEffect(() => {
        if (formData.gradoId && lookups.cargos?.length) {
            const selectedGrado = lookups.grados.find(g => g.id === parseInt(formData.gradoId));
            if (selectedGrado) {
                const tipoGrado = selectedGrado.tipo; // 'Oficial' or 'Suboficial'
                const filtered = lookups.cargos.filter(c => c.tipo === tipoGrado);
                setFilteredCargos(filtered);
                // Clear cargo if it doesn't match the new tipo
                if (!filtered.some(c => c.valor === formData.cargo)) {
                    setFormData(prev => ({ ...prev, cargo: '' }));
                }
            }
        } else {
            setFilteredCargos(lookups.cargos || []);
        }
    }, [formData.gradoId, lookups.grados, lookups.cargos]);

    const formatDateForInput = (dateStr) => {
        if (!dateStr) return '';
        try {
            const d = new Date(dateStr);
            return d.toISOString().split('T')[0];
        } catch {
            return '';
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.paisId) newErrors.paisId = 'Campo requerido';
        if (!formData.apellidoNombre) newErrors.apellidoNombre = 'Campo requerido';
        if (!formData.fuerzaId) newErrors.fuerzaId = 'Campo requerido';
        if (!formData.gradoId) newErrors.gradoId = 'Campo requerido';
        if (!formData.cargo) newErrors.cargo = 'Campo requerido';
        if (!formData.finComision) newErrors.finComision = 'Campo requerido';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setSaving(true);
        setSaveError('');

        try {
            const payload = {
                paisId: parseInt(formData.paisId),
                fuerzaId: parseInt(formData.fuerzaId),
                gradoId: parseInt(formData.gradoId),
                cargo: formData.cargo,
                apellidoNombre: formData.apellidoNombre,
                fechaSalida: formData.fechaSalida || null,
                finComision: formData.finComision || null,
                telefonoOficial: formData.telefonoOficial || null,
                direccionOficial: formData.direccionOficial || null,
                correoElectronico: formData.correoElectronico || null,
                nroDecretoResol: formData.nroDecretoResol || null,
                firmaDecretoResol: formData.firmaDecretoResol || null,
                diasEntreFirmaPartida: formData.diasEntreFirmaPartida ? parseInt(formData.diasEntreFirmaPartida) : null,
                relevoPasajeCargos: formData.relevoPasajeCargos || null
            };

            if (isEditing) {
                await updateAgregadura(editData.id, payload);
            } else {
                await addAgregadura(payload);
            }
            onClose();
        } catch (err) {
            setSaveError(err.message || 'Error al guardar');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start sm:items-center justify-center z-50 p-2 sm:p-4 overflow-y-auto">
            <div className="bg-surface rounded-lg shadow-xl max-w-4xl w-full my-2 sm:my-0 sm:max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-surface border-b border-border p-4 sm:p-6 flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-text">
                        {isEditing ? 'Editar Agregaduría' : 'Nueva Agregaduría'}
                    </h2>
                    <button onClick={onClose} className="text-secondary hover:text-text">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {saveError && (
                        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 text-sm">
                            {saveError}
                        </div>
                    )}

                    {/* Datos Personales */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4 text-primary">Datos Personales</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="label">Apellido y Nombre *</label>
                                <input
                                    type="text"
                                    name="apellidoNombre"
                                    value={formData.apellidoNombre}
                                    onChange={handleChange}
                                    className="input-field"
                                    placeholder="Ej: BRUSA, JOSÉ ALBERTO"
                                />
                                {errors.apellidoNombre && <p className="text-red-500 text-sm mt-1">{errors.apellidoNombre}</p>}
                            </div>

                            <div>
                                <label className="label">Fuerza *</label>
                                <select name="fuerzaId" value={formData.fuerzaId} onChange={handleChange} className="input-field">
                                    <option value="">Seleccionar...</option>
                                    {lookups.fuerzas.map(f => (
                                        <option key={f.id} value={f.id}>{f.nombre} ({f.codigo})</option>
                                    ))}
                                </select>
                                {errors.fuerzaId && <p className="text-red-500 text-sm mt-1">{errors.fuerzaId}</p>}
                            </div>

                            <div>
                                <label className="label">Grado *</label>
                                <select name="gradoId" value={formData.gradoId} onChange={handleChange} className="input-field">
                                    <option value="">Seleccionar...</option>
                                    {filteredGrados.map(g => (
                                        <option key={g.id} value={g.id}>
                                            {g.nombre} ({g.codigoOTAN})
                                        </option>
                                    ))}
                                </select>
                                {errors.gradoId && <p className="text-red-500 text-sm mt-1">{errors.gradoId}</p>}
                            </div>

                            <div>
                                <label className="label">Cargo *</label>
                                <select name="cargo" value={formData.cargo} onChange={handleChange} className="input-field">
                                    <option value="">Seleccionar cargo...</option>
                                    {filteredCargos.length > 0 ? (
                                        <>
                                            <optgroup label={`Nivel ${filteredCargos[0]?.nivel}`}>
                                                {filteredCargos.map((c, i) => (
                                                    <option key={i} value={c.valor}>{c.valor}</option>
                                                ))}
                                            </optgroup>
                                        </>
                                    ) : (
                                        lookups.cargos?.map((c, i) => (
                                            <option key={i} value={c.valor}>{c.valor} ({c.nivel})</option>
                                        ))
                                    )}
                                </select>
                                {errors.cargo && <p className="text-red-500 text-sm mt-1">{errors.cargo}</p>}
                                {formData.gradoId && filteredCargos.length > 0 && (
                                    <p className="text-xs text-secondary mt-1">
                                        {filteredCargos[0]?.tipo === 'Oficial' ? '📋 Cargos de Nivel Directivo (Agregados)' : '📋 Cargos de Nivel Operativo (Auxiliares)'}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Ubicación */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4 text-primary">Ubicación</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="label">País *</label>
                                <select name="paisId" value={formData.paisId} onChange={handleChange} className="input-field">
                                    <option value="">Seleccionar...</option>
                                    {lookups.paises.map(p => (
                                        <option key={p.id} value={p.id}>{p.nombre}</option>
                                    ))}
                                </select>
                                {errors.paisId && <p className="text-red-500 text-sm mt-1">{errors.paisId}</p>}
                            </div>

                            <div>
                                <label className="label">Dirección Oficial</label>
                                <input
                                    type="text"
                                    name="direccionOficial"
                                    value={formData.direccionOficial}
                                    onChange={handleChange}
                                    className="input-field"
                                    placeholder="Ej: Von-der-Heydt-Strabe 2- 10785 Berlin"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Contacto */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4 text-primary">Contacto</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="label">Teléfono Oficial</label>
                                <input
                                    type="text"
                                    name="telefonoOficial"
                                    value={formData.telefonoOficial}
                                    onChange={handleChange}
                                    className="input-field"
                                    placeholder="Ej: (00-49-030)2266-8941"
                                />
                            </div>

                            <div>
                                <label className="label">Correo Electrónico</label>
                                <input
                                    type="email"
                                    name="correoElectronico"
                                    value={formData.correoElectronico}
                                    onChange={handleChange}
                                    className="input-field"
                                    placeholder="Ej: agredef@fuerzas-armadas.mil.ar"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Comisión */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4 text-primary">Comisión</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="label">Fecha Salida de Argentina</label>
                                <input
                                    type="date"
                                    name="fechaSalida"
                                    value={formData.fechaSalida}
                                    onChange={handleChange}
                                    className="input-field"
                                />
                            </div>

                            <div>
                                <label className="label">Fin de Comisión *</label>
                                <input
                                    type="date"
                                    name="finComision"
                                    value={formData.finComision}
                                    onChange={handleChange}
                                    className="input-field"
                                />
                                {errors.finComision && <p className="text-red-500 text-sm mt-1">{errors.finComision}</p>}
                            </div>

                            <div>
                                <label className="label">Nro Decreto/Resolución</label>
                                <input
                                    type="text"
                                    name="nroDecretoResol"
                                    value={formData.nroDecretoResol}
                                    onChange={handleChange}
                                    className="input-field"
                                />
                            </div>

                            <div>
                                <label className="label">Firma Decreto/Resolución</label>
                                <input
                                    type="date"
                                    name="firmaDecretoResol"
                                    value={formData.firmaDecretoResol}
                                    onChange={handleChange}
                                    className="input-field"
                                />
                            </div>

                            <div>
                                <label className="label">Días entre Firma y Partida</label>
                                <input
                                    type="number"
                                    name="diasEntreFirmaPartida"
                                    value={formData.diasEntreFirmaPartida}
                                    onChange={handleChange}
                                    className="input-field"
                                />
                            </div>

                            <div>
                                <label className="label">Relevo / Pasaje de Cargos</label>
                                <input
                                    type="text"
                                    name="relevoPasajeCargos"
                                    value={formData.relevoPasajeCargos}
                                    onChange={handleChange}
                                    className="input-field"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Botones */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-border">
                        <button type="button" onClick={onClose} className="btn btn-secondary" disabled={saving}>
                            Cancelar
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={saving}>
                            {saving ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" />
                                    Guardando...
                                </>
                            ) : (
                                <>
                                    {isEditing ? <Save size={18} /> : <Plus size={18} />}
                                    {isEditing ? 'Guardar Cambios' : 'Agregar Agregaduría'}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
