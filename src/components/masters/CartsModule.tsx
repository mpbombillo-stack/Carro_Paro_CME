import React, { useState, useEffect } from 'react';
import { Trash2, Edit3, Truck, MapPin, PackageCheck } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { MasterCart } from '../../types/audit';

export const CartsModule: React.FC = () => {
    const [carts, setCarts] = useState<MasterCart[]>([]);
    const [newCart, setNewCart] = useState<Partial<MasterCart>>({
        name: '',
        location: ''
    });
    const [editingId, setEditingId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    useEffect(() => {
        fetchCarts();
    }, []);

    const fetchCarts = async () => {
        try {
            const { data } = await supabase
                .from('master_carts')
                .select('*')
                .order('name', { ascending: true });
            
            if (data && data.length > 0) {
                setCarts(data);
                return;
            }

            // Local fallback
            const saved = localStorage.getItem('master_carts');
            if (saved) {
                setCarts(JSON.parse(saved));
            }
        } catch (error) {
            console.error('Error fetching carts:', error);
            const saved = localStorage.getItem('master_carts');
            if (saved) setCarts(JSON.parse(saved));
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        
        const cartToSave = {
            ...newCart,
            id: editingId || undefined
        };

        const { error } = await supabase
            .from('master_carts')
            .upsert([cartToSave]);
        
        // Always local
        const updatedCarts = editingId
            ? carts.map(c => c.id === editingId ? { ...cartToSave, id: c.id } as MasterCart : c)
            : [...carts, { ...cartToSave, id: Date.now().toString() } as MasterCart];
            
        localStorage.setItem('master_carts', JSON.stringify(updatedCarts));
        setCarts(updatedCarts);
        
        setNewCart({ name: '', location: '' });
        setEditingId(null);
        setLoading(false);
        setMessage(error ? 'Guardado localmente (Demo)' : 'Carro guardado');
        setTimeout(() => setMessage(null), 3000);
    };

    const handleDelete = async (id: string) => {
        await supabase.from('master_carts').delete().eq('id', id);
        const updatedCarts = carts.filter(c => c.id !== id);
        localStorage.setItem('master_carts', JSON.stringify(updatedCarts));
        setCarts(updatedCarts);
        setMessage('Carro eliminado');
        setTimeout(() => setMessage(null), 3000);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <header className="flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">Maestro de Carros</h2>
                    <p className="text-slate-500 font-medium">Define los carros y kits disponibles para verificación.</p>
                </div>
                {message && (
                    <div className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-xs font-black uppercase tracking-widest border border-emerald-100">
                        {message}
                    </div>
                )}
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none">
                        <h3 className="text-lg font-black text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                           <Truck className="text-primary" /> {editingId ? 'Editar Carro' : 'Nuevo Carro/Kit'}
                        </h3>
                        <form onSubmit={handleSave} className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Identificador / Nombre</label>
                                <input 
                                    type="text"
                                    required
                                    value={newCart.name}
                                    onChange={e => setNewCart({...newCart, name: e.target.value})}
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-primary/20 rounded-xl font-bold text-sm outline-none transition-all dark:text-white"
                                    placeholder="Ej: CP-082"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Ubicación / Servicio</label>
                                <input 
                                    type="text"
                                    required
                                    value={newCart.location}
                                    onChange={e => setNewCart({...newCart, location: e.target.value})}
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-primary/20 rounded-xl font-bold text-sm outline-none transition-all dark:text-white"
                                    placeholder="Ej: Urgencias - Piso 2"
                                />
                            </div>
                            <button 
                                disabled={loading}
                                className="w-full bg-primary py-4 rounded-2xl text-white font-black text-sm shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all mt-4 disabled:opacity-50"
                            >
                                {loading ? 'PROCESANDO...' : (editingId ? 'ACTUALIZAR CARRO' : 'CREAR CARRO')}
                            </button>
                        </form>
                    </div>
                </div>

                <div className="lg:col-span-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {carts.map(cart => (
                            <div key={cart.id} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-lg hover:border-primary/20 transition-all group">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-primary/5 rounded-2xl text-primary">
                                        <Truck size={24} />
                                    </div>
                                    <div className="flex gap-1">
                                        <button 
                                            onClick={() => { setEditingId(cart.id); setNewCart(cart); }}
                                            className="p-2 text-slate-300 hover:text-primary transition-colors"
                                            title="Editar"
                                        >
                                            <Edit3 size={16} />
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(cart.id)}
                                            className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                                            title="Eliminar"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                                <h4 className="text-xl font-black text-slate-800 dark:text-white leading-tight">{cart.name}</h4>
                                <div className="mt-4 flex items-center gap-2 text-slate-500 font-bold text-xs uppercase tracking-wider">
                                    <MapPin size={14} className="text-slate-400" />
                                    {cart.location}
                                </div>
                            </div>
                        ))}
                        {carts.length === 0 && (
                            <div className="col-span-full py-20 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center gap-4 text-slate-300">
                                <PackageCheck size={48} />
                                <p className="font-bold text-sm uppercase tracking-widest">No hay carros registrados</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
