import React, { useState } from 'react';
import { X, Save, Loader2, User, Lock, Mail, Shield, Eye, EyeOff } from 'lucide-react';
import { authApi } from '../../utils/api';
import { useToast } from '../../context/ToastContext';

export const UserForm = ({ onClose, onSuccess }) => {
    const toast = useToast();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
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
        if (error) setError(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!formData.username.trim()) {
            setError('El nombre de usuario es obligatorio');
            return;
        }
        if (formData.password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres');
            return;
        }

        setLoading(true);
        try {
            await authApi.register(formData);
            toast.success(`Usuario "${formData.username}" creado exitosamente`);
            if (onSuccess) onSuccess();
            onClose();
        } catch (err) {
            setError(err.message || 'Error al crear usuario');
        } finally {
            setLoading(false);
        }
    };

    const ROL_INFO = {
        Viewer: { label: 'Viewer — Solo lectura', color: 'text-gray-500', desc: 'Puede ver datos pero no modificarlos' },
        Editor: { label: 'Editor — Carga y edición', color: 'text-blue-500', desc: 'Puede crear, editar e importar datos' },
        Admin:  { label: 'Admin — Control total', color: 'text-red-500', desc: 'Acceso completo incluyendo configuración' },
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[#141b2d] rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700/60">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                            <User size={18} className="text-primary" />
                        </div>
                        <div>
                            <h3 className="text-base font-semibold text-gray-900 dark:text-white leading-tight">
                                Nuevo Usuario
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Todos los campos marcados con * son obligatorios</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">

                    {/* Error banner */}
                    {error && (
                        <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">
                            <span className="flex-shrink-0 mt-0.5">⚠</span>
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Username */}
                    <div className="space-y-1.5">
                        <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                            <User size={12} />
                            Usuario *
                        </label>
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            placeholder="nombre.usuario"
                            required
                            autoFocus
                            className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                        />
                    </div>

                    {/* Password */}
                    <div className="space-y-1.5">
                        <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                            <Lock size={12} />
                            Contraseña *
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Mínimo 6 caracteres"
                                required
                                className="w-full px-3 py-2.5 pr-10 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(p => !p)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                            >
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>

                    {/* Full Name */}
                    <div className="space-y-1.5">
                        <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                            Nombre Completo
                        </label>
                        <input
                            type="text"
                            name="nombreCompleto"
                            value={formData.nombreCompleto}
                            onChange={handleChange}
                            placeholder="Apellido, Nombre"
                            className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                        />
                    </div>

                    {/* Email */}
                    <div className="space-y-1.5">
                        <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                            <Mail size={12} />
                            Email
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="usuario@ejemplo.com"
                            className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                        />
                    </div>

                    {/* Role */}
                    <div className="space-y-1.5">
                        <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                            <Shield size={12} />
                            Rol de Acceso
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                            {Object.entries(ROL_INFO).map(([value, { label, color }]) => (
                                <button
                                    key={value}
                                    type="button"
                                    onClick={() => setFormData(p => ({ ...p, rol: value }))}
                                    className={`py-2 px-3 rounded-lg border text-xs font-medium transition-all text-center ${
                                        formData.rol === value
                                            ? 'border-primary bg-primary/10 text-primary dark:text-blue-400'
                                            : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600'
                                    }`}
                                >
                                    {value}
                                </button>
                            ))}
                        </div>
                        {/* Role description */}
                        <p className="text-xs text-gray-500 dark:text-gray-400 px-1">
                            {ROL_INFO[formData.rol].desc}
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-2 pt-2 border-t border-gray-100 dark:border-gray-800 mt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center gap-2 px-5 py-2 text-sm font-medium bg-primary hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-60 shadow-lg shadow-primary/20"
                        >
                            {loading ? (
                                <>
                                    <Loader2 size={15} className="animate-spin" />
                                    Creando...
                                </>
                            ) : (
                                <>
                                    <Save size={15} />
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
