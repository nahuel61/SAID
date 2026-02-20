import React, { useState } from 'react';
import { X, Save, Loader2, User, Lock, Mail, Shield, Type } from 'lucide-react';
import { authApi } from '../../utils/api';

export const UserForm = ({ onClose, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        nombreCompleto: '',
        email: '',
        rol: 'Viewer'
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Basic validation
        if (!formData.username || !formData.password) {
            setError('Usuario y contraseña son obligatorios');
            setLoading(false);
            return;
        }

        try {
            await authApi.register(formData);
            if (onSuccess) onSuccess();
            onClose();
            alert('Usuario creado exitosamente');
        } catch (err) {
            setError(err.message || 'Error al crear usuario');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-card-dark rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in">
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <User size={20} className="text-primary" />
                        Nuevo Usuario
                    </h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-lg border border-red-200 dark:border-red-800 flex items-center gap-2">
                            <span className="material-icons text-sm">error</span>
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        {/* Username */}
                        <div>
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Usuario *</label>
                            <div className="relative">
                                <User className="absolute left-3 top-2.5 text-gray-400" size={16} />
                                <input
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    className="input-field pl-9 w-full"
                                    placeholder="nombre.usuario"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Contraseña *</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-2.5 text-gray-400" size={16} />
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="input-field pl-9 w-full"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        {/* Full Name */}
                        <div>
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre Completo</label>
                            <div className="relative">
                                <Type className="absolute left-3 top-2.5 text-gray-400" size={16} />
                                <input
                                    type="text"
                                    name="nombreCompleto"
                                    value={formData.nombreCompleto}
                                    onChange={handleChange}
                                    className="input-field pl-9 w-full"
                                    placeholder="Juan Pérez"
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-2.5 text-gray-400" size={16} />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="input-field pl-9 w-full"
                                    placeholder="juan@ejemplo.com"
                                />
                            </div>
                        </div>

                        {/* Role */}
                        <div>
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Rol</label>
                            <div className="relative">
                                <Shield className="absolute left-3 top-2.5 text-gray-400" size={16} />
                                <select
                                    name="rol"
                                    value={formData.rol}
                                    onChange={handleChange}
                                    className="input-field pl-9 w-full appearance-none"
                                >
                                    <option value="Viewer">Viewer (Solo lectura)</option>
                                    <option value="Editor">Editor (Carga y edición)</option>
                                    <option value="Admin">Admin (Control total)</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 dark:border-gray-800 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn btn-primary"
                        >
                            {loading ? (
                                <>
                                    <Loader2 size={16} className="animate-spin mr-2" />
                                    Creando...
                                </>
                            ) : (
                                <>
                                    <Save size={16} className="mr-2" />
                                    Crear Usuario
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
