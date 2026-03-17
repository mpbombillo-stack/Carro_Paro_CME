import React, { useState, useEffect } from 'react';
import { Save, Building2, Image as ImageIcon } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { IPSSettings } from '../../types/audit';

export const ConfigurationModule: React.FC = () => {
    const [settings, setSettings] = useState<IPSSettings>({
        id: '',
        name: 'Clínica Santillana',
        logo_url: '/src/assets/logo_santillana.png'
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            // Try Supabase first
            const { data } = await supabase
                .from('ips_settings')
                .select('*')
                .limit(1)
                .maybeSingle();
            
            if (data) {
                setSettings(data);
                return;
            }

            // Fallback to localStorage for demo mode
            const saved = localStorage.getItem('ips_settings');
            if (saved) {
                setSettings(JSON.parse(saved));
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        const payload = { 
            name: settings.name, 
            logo_url: settings.logo_url,
            updated_at: new Date().toISOString()
        };

        // Try to save to Supabase
        const { error } = settings.id 
            ? await supabase.from('ips_settings').update(payload).eq('id', settings.id)
            : await supabase.from('ips_settings').insert([payload]);

        if (error && !error.message.includes('MIME')) { // Check if it's a real DB error or just placeholder error
            console.error('Supabase save error, falling back to local storage:', error);
        }

        // Always save to localStorage as fallback/backup for demo
        localStorage.setItem('ips_settings', JSON.stringify({ ...settings, ...payload, id: settings.id || 'local-1' }));
        
        setMessage('Configuración guardada (Modo Local/Demo activado)');
        fetchSettings();
        setLoading(false);
    };

    return (
        <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 overflow-hidden">
                <div className="p-8 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                            <Building2 size={32} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Configuración Institucional</h2>
                            <p className="text-slate-500 text-sm font-medium">Personaliza los datos de tu IPS para los reportes.</p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSave} className="p-8 space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest px-1">Nombre de la IPS</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                                <Building2 size={18} />
                            </div>
                            <input
                                type="text"
                                value={settings.name}
                                onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                                className="w-full pl-11 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-primary/30 focus:bg-white dark:focus:bg-slate-900 rounded-2xl text-slate-700 dark:text-slate-200 font-bold transition-all outline-none"
                                placeholder="Ej: Clínica Santillana S.A."
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest px-1">URL del Logo (Opcional)</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                                <ImageIcon size={18} />
                            </div>
                            <input
                                type="url"
                                value={settings.logo_url}
                                onChange={(e) => setSettings({ ...settings, logo_url: e.target.value })}
                                className="w-full pl-11 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-primary/30 focus:bg-white dark:focus:bg-slate-900 rounded-2xl text-slate-700 dark:text-slate-200 font-bold transition-all outline-none"
                                placeholder="https://ejemplo.com/logo.png"
                            />
                        </div>
                    </div>

                    {message && (
                        <div className={`p-4 rounded-2xl text-sm font-bold animate-in zoom-in-95 ${
                            message.includes('Error') ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                        }`}>
                            {message}
                        </div>
                    )}

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary hover:bg-primary-dark text-white font-black py-4 rounded-2xl shadow-lg shadow-primary/30 transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50"
                        >
                            <Save size={20} />
                            {loading ? 'GUARDANDO...' : 'GUARDAR CAMBIOS'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
