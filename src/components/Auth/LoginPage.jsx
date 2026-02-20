import React, { useState } from 'react';
import { Shield, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const LoginPage = () => {
    const { login } = useAuth();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(username, password);
        } catch (err) {
            setError(err.message || 'Error al iniciar sesión');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4"
            style={{ background: 'linear-gradient(135deg, #101622 0%, #1a2234 50%, #0f1929 100%)' }}>
            <div className="w-full max-w-md">
                {/* Logo / Branding */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
                        style={{ background: 'linear-gradient(135deg, #135bec, #1e40af)' }}>
                        <Shield className="text-white" size={32} />
                    </div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">PIGC</h1>
                    <p className="text-gray-400 text-sm mt-1">
                        Plataforma Integral de Gestión de Comisiones
                    </p>
                </div>

                {/* Login Card */}
                <div className="rounded-2xl p-8 shadow-2xl border"
                    style={{ background: '#1a2234', borderColor: '#2d3748' }}>
                    <h2 className="text-lg font-semibold text-white mb-6">Iniciar Sesión</h2>

                    {error && (
                        <div className="flex items-center gap-2 p-3 rounded-lg mb-4 text-sm"
                            style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171' }}>
                            <AlertCircle size={16} />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Usuario
                            </label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg text-white placeholder-gray-500 outline-none transition-all focus:ring-2"
                                style={{
                                    background: '#101622',
                                    border: '1px solid #2d3748',
                                    focusRingColor: '#135bec'
                                }}
                                placeholder="Ingrese su usuario"
                                required
                                autoFocus
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Contraseña
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-3 rounded-lg text-white placeholder-gray-500 outline-none transition-all focus:ring-2 pr-12"
                                    style={{
                                        background: '#101622',
                                        border: '1px solid #2d3748'
                                    }}
                                    placeholder="Ingrese su contraseña"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 rounded-lg text-white font-medium transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
                            style={{
                                background: 'linear-gradient(135deg, #135bec, #1e40af)',
                                boxShadow: '0 4px 15px rgba(19, 91, 236, 0.3)'
                            }}
                        >
                            {loading ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" />
                                    Ingresando...
                                </>
                            ) : (
                                'Ingresar'
                            )}
                        </button>
                    </form>

                    <div className="mt-6 pt-4 border-t text-center" style={{ borderColor: '#2d3748' }}>
                        <p className="text-xs text-gray-500">
                            Ministerio de Defensa — Sistema de uso oficial
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
