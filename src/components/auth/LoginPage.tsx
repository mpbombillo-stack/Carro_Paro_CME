import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { ShieldCheck, User, Lock, ArrowRight, AlertCircle, Building2 } from 'lucide-react';
import type { MasterUser } from '../../types/audit';

interface LoginPageProps {
    onLogin: (user: MasterUser) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // First try to fetch from Supabase
            const { data, error: sbError } = await supabase
                .from('master_users')
                .select('*')
                .or(`full_name.ilike.%${username}%,full_name.eq.${username}`)
                .eq('is_active', true)
                .single();

            let targetUser: MasterUser | null = data;

            // Fallback to local storage if supabase fails or no user found
            if (!targetUser) {
                const saved = localStorage.getItem('master_users');
                if (saved) {
                    const localUsers: MasterUser[] = JSON.parse(saved);
                    targetUser = localUsers.find(u => 
                        u.full_name.toLowerCase().includes(username.toLowerCase()) && u.is_active
                    ) || null;
                }
            }

            if (!targetUser) {
                setError('Usuario no encontrado o inactivo.');
                setLoading(false);
                return;
            }

            // Verify password
            if (targetUser.password === password) {
                onLogin(targetUser);
            } else {
                setError('PIN/Contraseña incorrecta.');
            }
        } catch (err) {
            console.error('Login error:', err);
            setError('Error de conexión con el sistema.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center items-center p-4">
            <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-700">
                {/* Branding */}
                <div className="text-center mb-8">
                    <div className="inline-flex p-4 bg-primary/10 rounded-3xl text-primary mb-4 shadow-xl shadow-primary/5">
                        <ShieldCheck size={48} strokeWidth={2.5} />
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight italic">
                        VerifiCa-<span className="text-primary not-italic">RX</span>
                    </h1>
                    <p className="text-slate-500 font-bold mt-2 uppercase tracking-widest text-xs">Gestión Segura de Carros de Paro</p>
                </div>

                {/* Login Card */}
                <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 p-8 md:p-10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-6 opacity-10">
                        <Building2 size={120} />
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6 relative">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1 ml-1">Nombre de Usuario</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                                    <User size={18} />
                                </div>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full pl-11 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-primary/20 focus:bg-white dark:focus:bg-slate-900 rounded-2xl text-slate-700 dark:text-slate-200 font-bold transition-all outline-none"
                                    placeholder="Ej: Msuaza"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1 ml-1"> PIN / Contraseña</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                                    <Lock size={18} />
                                </div>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-11 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-primary/20 focus:bg-white dark:focus:bg-slate-900 rounded-2xl text-slate-700 dark:text-slate-200 font-bold transition-all outline-none"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs font-black rounded-2xl border border-red-100 dark:border-red-900/30 animate-in shake-1 duration-300">
                                <AlertCircle size={16} />
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading || !username}
                            className="w-full bg-slate-900 dark:bg-primary hover:bg-black dark:hover:bg-primary-dark text-white font-black py-5 rounded-2xl shadow-xl shadow-slate-200 dark:shadow-primary/20 transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed group"
                        >
                            {loading ? 'VERIFICANDO...' : 'INGRESAR AL SISTEMA'}
                            {!loading && <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />}
                        </button>

                        <div className="pt-4 text-center">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em] leading-relaxed">
                                App diseñada por<br/>
                                <span className="text-slate-600 dark:text-slate-300">Q.F Mauricio Suaza Gutierrez & Gemini IA</span>
                            </p>
                        </div>
                    </form>
                </div>

                <div className="mt-12 text-center space-y-4">
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                        Sistema de Control Farmacéutico Institucional
                    </p>
                </div>
            </div>
        </div>
    );
};
