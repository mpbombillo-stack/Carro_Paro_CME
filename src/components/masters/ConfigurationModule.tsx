import React, { useState, useEffect } from 'react';
import { Save, Building2, Image as ImageIcon, Users, UserPlus, Trash2, Edit2, X, CheckCircle2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { IPSSettings, MasterUser } from '../../types/audit';

export const ConfigurationModule: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'ips' | 'users'>('ips');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    // IPS Settings State
    const [settings, setSettings] = useState<IPSSettings>({
        id: '',
        name: 'Clínica Santillana',
        logo_url: '/src/assets/logo_santillana.png'
    });

    // Users State
    const [users, setUsers] = useState<MasterUser[]>([]);
    const [isAddingUser, setIsAddingUser] = useState(false);
    const [editingUser, setEditingUser] = useState<MasterUser | null>(null);
    const [newUser, setNewUser] = useState<Partial<MasterUser>>({
        full_name: '',
        job_title: '',
        profile: 'Enfermería',
        is_active: true
    });

    useEffect(() => {
        fetchSettings();
        fetchUsers();
    }, []);

    const fetchSettings = async () => {
        try {
            const { data } = await supabase
                .from('ips_settings')
                .select('*')
                .limit(1)
                .maybeSingle();
            
            if (data) {
                setSettings(data);
            } else {
                const saved = localStorage.getItem('ips_settings');
                if (saved) setSettings(JSON.parse(saved));
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
        }
    };

    const fetchUsers = async () => {
        try {
            const { data, error } = await supabase
                .from('master_users')
                .select('*')
                .order('full_name', { ascending: true });
            
            if (data && !error) {
                setUsers(data);
                localStorage.setItem('master_users', JSON.stringify(data));
            } else {
                const saved = localStorage.getItem('master_users');
                if (saved) setUsers(JSON.parse(saved));
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const handleSaveSettings = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        const payload = { 
            name: settings.name, 
            logo_url: settings.logo_url,
            updated_at: new Date().toISOString()
        };

        const { error } = settings.id 
            ? await supabase.from('ips_settings').update(payload).eq('id', settings.id)
            : await supabase.from('ips_settings').insert([payload]);

        if (error) console.error('Supabase error:', error);

        localStorage.setItem('ips_settings', JSON.stringify({ ...settings, ...payload, id: settings.id || 'local-ips' }));
        setMessage('Configuración institucional guardada');
        fetchSettings();
        setLoading(false);
    };

    const handleSaveUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            const payload = {
                full_name: editingUser ? editingUser.full_name : newUser.full_name,
                job_title: editingUser ? editingUser.job_title : newUser.job_title,
                profile: editingUser ? editingUser.profile : newUser.profile,
                is_active: editingUser ? editingUser.is_active : newUser.is_active,
                password: editingUser ? editingUser.password : (newUser.password || '1234')
            };

            const { error } = editingUser
                ? await supabase.from('master_users').update(payload).eq('id', editingUser.id)
                : await supabase.from('master_users').insert([payload]);

            if (error) {
                console.warn('Falling back to local storage for user save');
                const localUsers = [...users];
                if (editingUser) {
                    const idx = localUsers.findIndex(u => u.id === editingUser.id);
                    localUsers[idx] = { ...editingUser, ...payload } as MasterUser;
                } else {
                    localUsers.push({ ...payload, id: crypto.randomUUID() } as MasterUser);
                }
                localStorage.setItem('master_users', JSON.stringify(localUsers));
            }

            setMessage(editingUser ? 'Usuario actualizado' : 'Usuario creado');
            setIsAddingUser(false);
            setEditingUser(null);
            setNewUser({ full_name: '', job_title: '', profile: 'Enfermería', is_active: true, password: '' });
            fetchUsers();
        } catch (err) {
            console.error('Error saving user:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (id: string) => {
        if (!confirm('¿Está seguro de eliminar este usuario?')) return;
        
        const { error } = await supabase.from('master_users').delete().eq('id', id);
        
        if (error) {
            const localUsers = users.filter(u => u.id !== id);
            localStorage.setItem('master_users', JSON.stringify(localUsers));
        }

        setMessage('Usuario eliminado');
        fetchUsers();
    };

    return (
        <div className="max-w-4xl mx-auto p-4 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Tab Navigation */}
            <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl gap-1">
                <button
                    onClick={() => setActiveTab('ips')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-black text-sm transition-all ${
                        activeTab === 'ips' 
                        ? 'bg-white dark:bg-slate-700 text-primary shadow-sm' 
                        : 'text-slate-500 hover:bg-white/50 dark:hover:bg-slate-700/50'
                    }`}
                >
                    <Building2 size={18} />
                    INSTITUCIÓN
                </button>
                <button
                    onClick={() => setActiveTab('users')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-black text-sm transition-all ${
                        activeTab === 'users' 
                        ? 'bg-white dark:bg-slate-700 text-primary shadow-sm' 
                        : 'text-slate-500 hover:bg-white/50 dark:hover:bg-slate-700/50'
                    }`}
                >
                    <Users size={18} />
                    USUARIOS
                </button>
            </div>

            {/* Content Area */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 overflow-hidden">
                
                {activeTab === 'ips' ? (
                    <>
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

                        <form onSubmit={handleSaveSettings} className="p-8 space-y-6">
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

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-primary hover:bg-primary-dark text-white font-black py-4 rounded-2xl shadow-lg shadow-primary/30 transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50"
                            >
                                <Save size={20} />
                                {loading ? 'GUARDANDO...' : 'GUARDAR CONFIGURACIÓN'}
                            </button>
                        </form>
                    </>
                ) : (
                    <>
                        <div className="p-8 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                                        <Users size={32} />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Gestión de Usuarios</h2>
                                        <p className="text-slate-500 text-sm font-medium">Administra quienes pueden acceder y auditar.</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => {
                                        setIsAddingUser(true);
                                        setEditingUser(null);
                                    }}
                                    className="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-2xl font-black text-sm flex items-center gap-2 transition-all shadow-lg shadow-primary/20 active:scale-95"
                                >
                                    <UserPlus size={18} />
                                    NUEVO USUARIO
                                </button>
                            </div>
                        </div>

                        {/* User Form Modal-like Overlay */}
                        {(isAddingUser || editingUser) && (
                            <div className="p-8 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 animate-in slide-in-from-top-4 duration-300">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="font-black text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-2">
                                        {editingUser ? <Edit2 size={18} /> : <UserPlus size={18} />}
                                        {editingUser ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
                                    </h3>
                                    <button 
                                        onClick={() => {
                                            setIsAddingUser(false);
                                            setEditingUser(null);
                                        }}
                                        title="Cerrar formulario"
                                        className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>
                                
                                <form onSubmit={handleSaveUser} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Nombre Completo</label>
                                        <input
                                            type="text"
                                            value={editingUser ? editingUser.full_name : newUser.full_name}
                                            onChange={(e) => editingUser ? setEditingUser({...editingUser, full_name: e.target.value}) : setNewUser({ ...newUser, full_name: e.target.value })}
                                            className="w-full px-4 py-3 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 focus:border-primary rounded-xl text-slate-700 dark:text-white font-bold transition-all outline-none"
                                            placeholder="Ej: Juan Pérez"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Cargo / Especialidad</label>
                                        <input
                                            type="text"
                                            value={editingUser ? editingUser.job_title : newUser.job_title}
                                            onChange={(e) => editingUser ? setEditingUser({...editingUser, job_title: e.target.value}) : setNewUser({ ...newUser, job_title: e.target.value })}
                                            className="w-full px-4 py-3 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 focus:border-primary rounded-xl text-slate-700 dark:text-white font-bold transition-all outline-none"
                                            placeholder="Ej: Jefe de Enfermería"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Contraseña (PIN)</label>
                                        <input
                                            type="password"
                                            value={editingUser ? editingUser.password : newUser.password}
                                            onChange={(e) => editingUser ? setEditingUser({...editingUser, password: e.target.value}) : setNewUser({ ...newUser, password: e.target.value })}
                                            className="w-full px-4 py-3 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 focus:border-primary rounded-xl text-slate-700 dark:text-white font-bold transition-all outline-none"
                                            placeholder="Ej: 1234"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Perfil de Acceso</label>
                                        <select
                                            title="Perfil de acceso"
                                            value={editingUser ? editingUser.profile : newUser.profile}
                                            onChange={(e) => {
                                                const val = e.target.value as any;
                                                editingUser ? setEditingUser({...editingUser, profile: val}) : setNewUser({ ...newUser, profile: val });
                                            }}
                                            className="w-full px-4 py-3 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 focus:border-primary rounded-xl text-slate-700 dark:text-white font-bold transition-all outline-none appearance-none"
                                        >
                                            <option value="Enfermería">Enfermería (Solo Lectura/Auditoría)</option>
                                            <option value="Auditor/Farmacia">Auditor/Farmacia (Control Stock)</option>
                                            <option value="Administrador">Administrador (Control Total)</option>
                                        </select>
                                    </div>

                                    <div className="flex items-end">
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="w-full bg-slate-800 dark:bg-primary hover:scale-[1.02] text-white font-black py-3.5 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95"
                                        >
                                            <CheckCircle2 size={18} />
                                            {editingUser ? 'ACTUALIZAR USUARIO' : 'CREAR USUARIO'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-slate-50 dark:bg-slate-800/50">
                                        <th className="text-left py-4 px-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Nombre del Usuario</th>
                                        <th className="text-left py-4 px-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Cargo</th>
                                        <th className="text-left py-4 px-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Perfil</th>
                                        <th className="text-center py-4 px-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {users.map((user) => (
                                        <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                                            <td className="py-5 px-8">
                                                <div className="font-bold text-slate-700 dark:text-slate-200">{user.full_name}</div>
                                            </td>
                                            <td className="py-5 px-8 text-sm text-slate-500 font-medium">
                                                {user.job_title}
                                            </td>
                                            <td className="py-5 px-8">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                                    user.profile === 'Administrador' ? 'bg-purple-100 text-purple-600' :
                                                    user.profile === 'Enfermería' ? 'bg-blue-100 text-blue-600' :
                                                    'bg-amber-100 text-amber-600'
                                                }`}>
                                                    {user.profile}
                                                </span>
                                            </td>
                                            <td className="py-5 px-8">
                                                <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => setEditingUser(user)}
                                                        title="Editar usuario"
                                                        className="p-2 text-slate-400 hover:text-primary transition-colors hover:bg-white dark:hover:bg-slate-700 rounded-lg"
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteUser(user.id)}
                                                        title="Eliminar usuario"
                                                        className="p-2 text-slate-400 hover:text-red-500 transition-colors hover:bg-white dark:hover:bg-slate-700 rounded-lg"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {users.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="py-20 text-center text-slate-400 font-medium italic">
                                                No hay usuarios registrados todavía.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}

                {/* Status Message Footer */}
                {message && (
                    <div className="px-8 py-4 bg-emerald-50 dark:bg-emerald-900/20 border-t border-emerald-100 dark:border-emerald-800/50 flex items-center justify-between animate-in slide-in-from-bottom-2">
                        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-sm font-bold">
                            <CheckCircle2 size={16} />
                            {message}
                        </div>
                        <button onClick={() => setMessage('')} className="text-emerald-400 hover:text-emerald-600 font-black text-xs uppercase">Cerrar</button>
                    </div>
                )}
            </div>
        </div>
    );
};
