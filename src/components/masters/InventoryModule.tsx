import React, { useState, useEffect } from 'react';
import { Plus, Search, Trash2, Edit3, Pill, PackageCheck } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { MasterItem } from '../../types/audit';

const PREDEFINED_MEDS = [
    { description: 'ADRENALINA 1MG/ML', presentation: 'Ampolla 1ml' },
    { description: 'AGUA DESTILADA 10ML', presentation: 'Ampolla 10ml' },
    { description: 'AMIODARONA 150MG/3ML', presentation: 'Ampolla 3ml' },
    { description: 'AGUJA HIPODERMICA 18 G x 1 1/2', presentation: 'Unidad' },
    { description: 'AGUJA HIPODERMICA 21 G x 1 1/2', presentation: 'Unidad' },
    { description: 'AGUJA HIPODERMICA 22 G x 1 1/2', presentation: 'Unidad' },
    { description: 'AGUJA HIPODERMICA 23 G x 1', presentation: 'Unidad' },
    { description: 'AGUJA HIPODERMICA 25 G x 5/8', presentation: 'Unidad' },
    { description: 'AMBÚ ADULTO', presentation: 'Unidad' },
    { description: 'AMBÚ PEDIATRICO', presentation: 'Unidad' },
    { description: 'AMBÚ NEOPUFF', presentation: 'Unidad' },
    { description: 'ASPIRINA 100MG', presentation: 'Tableta' },
    { description: 'ATROPINA SULFATO 1MG/ML', presentation: 'Ampolla 1ml' },
    { description: 'BICARBONATO DE SODIO 10%', presentation: 'Ampolla 10ml' },
    { description: 'BROMURO DE IPRATROPIO', presentation: 'Inhalador' },
    { description: 'CAPTOPRIL 25MG', presentation: 'Tableta' },
    { description: 'CATETER IV N° 14', presentation: 'Unidad' },
    { description: 'CATETER IV N° 16', presentation: 'Unidad' },
    { description: 'CATETER IV N° 18', presentation: 'Unidad' },
    { description: 'CATETER IV N° 20', presentation: 'Unidad' },
    { description: 'CATETER IV N° 22', presentation: 'Unidad' },
    { description: 'CATETER IV N° 24', presentation: 'Unidad' },
    { description: 'CATETER NASAL ADULTO', presentation: 'Unidad' },
    { description: 'CATETER NASAL PEDIATRICO', presentation: 'Unidad' },
    { description: 'CIPROFLOXACINO 200MG/100ML', presentation: 'Bolsa 100ml' },
    { description: 'CLONIDINA 150MCG/1ML', presentation: 'Ampolla 1ml' },
    { description: 'CLORURO DE POTASIO 20meq/10ml', presentation: 'Ampolla 10ml' },
    { description: 'CLORURO DE SODIO 0.9% 10ML', presentation: 'Ampolla 10ml' },
    { description: 'CLORURO DE SODIO 0.9% 500ML', presentation: 'Bolsa 500ml' },
    { description: 'DEXAMETASONA 4MG/ML', presentation: 'Ampolla 1ml' },
    { description: 'DIAZEPAM 10MG/2ML', presentation: 'Ampolla 2ml' },
    { description: 'DEXTROSA 5% EN AD 500ML', presentation: 'Bolsa 500ml' },
    { description: 'DOBUTAMINA 250MG/20ML', presentation: 'Ampolla 20ml' },
    { description: 'DOPAMINA 200MG/5ML', presentation: 'Ampolla 5ml' },
    { description: 'ENALAPRIL 20MG', presentation: 'Tableta' },
    { description: 'EPINEFRINA 1MG/ML', presentation: 'Ampolla 1ml' },
    { description: 'EQUIPO DE MACROGOTEO', presentation: 'Unidad' },
    { description: 'EQUIPO DE MICROGOTEO', presentation: 'Unidad' },
    { description: 'EQUIPO DE TRANSFUSION', presentation: 'Unidad' },
    { description: 'EQUIPO VENOCLISIS ADULTO', presentation: 'Unidad' },
    { description: 'EQUIPO VENOCLISIS PEDIATRICO', presentation: 'Unidad' },
    { description: 'GASA ESTERIL 7.5 x 7.5', presentation: 'Paquete' },
    { description: 'GUANTES QUIRURGICOS 6.5', presentation: 'Par' },
    { description: 'GUANTES QUIRURGICOS 7.0', presentation: 'Par' },
    { description: 'GUANTES QUIRURGICOS 7.5', presentation: 'Par' },
    { description: 'GUANTES QUIRURGICOS 8.0', presentation: 'Par' },
    { description: 'GUANTES LATEX', presentation: 'Par' },
    { description: 'GUIA DE INTUBACION ADULTO', presentation: 'Unidad' },
    { description: 'GUIA DE INTUBACION NIÑO', presentation: 'Unidad' },
    { description: 'HIDROCORTISONA 100MG', presentation: 'Vial' },
    { description: 'ISOSORBIDE DINITRATO 5MG', presentation: 'Tableta' },
    { description: 'LIDOCAINA 2%', presentation: 'Frasco 50ml' },
    { description: 'MASCARA RECIRCULACION ADULTO', presentation: 'Unidad' },
    { description: 'MASCARA RECIRCULACION NIÑO', presentation: 'Unidad' },
    { description: 'METILPREDNISOLONA 500MG', presentation: 'Vial' },
    { description: 'MIDAZOLAM 5MG/5ML', presentation: 'Ampolla 5ml' },
    { description: 'MORFINA 10MG/ML', presentation: 'Ampolla 1ml' },
    { description: 'NALOXONA 0.4MG/ML', presentation: 'Ampolla 1ml' },
    { description: 'NITROGLICERINA 50MG/10ML', presentation: 'Ampolla 10ml' },
    { description: 'NOREPINEFRINA 4MG', presentation: 'Ampolla 4ml' },
    { description: 'RANITIDINA 50MG/2ML', presentation: 'Ampolla 2ml' },
    { description: 'SONDA FOLEY 12', presentation: 'Unidad' },
    { description: 'SONDA FOLEY 14', presentation: 'Unidad' },
    { description: 'SONDA FOLEY 16', presentation: 'Unidad' },
    { description: 'SONDA FOLEY 18', presentation: 'Unidad' },
    { description: 'SONDA FOLEY 20', presentation: 'Unidad' },
    { description: 'SONDA LEVIN 14', presentation: 'Unidad' },
    { description: 'SONDA LEVIN 16', presentation: 'Unidad' },
    { description: 'SONDA LEVIN 18', presentation: 'Unidad' },
    { description: 'SONDA NELATON 14', presentation: 'Unidad' },
    { description: 'SONDA NELATON 16', presentation: 'Unidad' },
    { description: 'SONDA SUCCION 12', presentation: 'Unidad' },
    { description: 'SONDA SUCCION 14', presentation: 'Unidad' },
    { description: 'TUBO ENDOTRAQUEAL 6.0', presentation: 'Unidad' },
    { description: 'TUBO ENDOTRAQUEAL 6.5', presentation: 'Unidad' },
    { description: 'TUBO ENDOTRAQUEAL 7.0', presentation: 'Unidad' },
    { description: 'TUBO ENDOTRAQUEAL 7.5', presentation: 'Unidad' },
    { description: 'TUBO ENDOTRAQUEAL 8.0', presentation: 'Unidad' },
    { description: 'TUBO ENDOTRAQUEAL 8.5', presentation: 'Unidad' },
    { description: 'VECURONIO 4MG', presentation: 'Vial' },
    { description: 'VERAPAMILO 5MG/2ML', presentation: 'Ampolla 2ml' }
];

export const InventoryModule: React.FC = () => {
    const [items, setItems] = useState<MasterItem[]>([]);
    const [newItem, setNewItem] = useState<Partial<MasterItem>>({
        description: '',
        presentation: '',
        invima_registry: '',
        invima_expiration: '',
        standard_quantity: 1,
        category: 'Medicamento'
    });
    const [editingItem, setEditingItem] = useState<MasterItem | null>(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        try {
            const { data, error } = await supabase
                .from('master_items')
                .select('*')
                .order('description', { ascending: true });

            if (data && data.length > 0 && !error) {
                setItems(data);
                setMessage(null);
                return;
            }

            // Fallback to local storage if Supabase fails or returns no data
            const saved = localStorage.getItem('master_items');
            if (saved) {
                setItems(JSON.parse(saved));
                setMessage('Cargado desde almacenamiento local (Demo)');
            } else {
                setItems([]);
            }
        } catch (error) {
            console.error('Error fetching items:', error);
            const saved = localStorage.getItem('master_items');
            if (saved) setItems(JSON.parse(saved));
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        const itemToSave = {
            ...newItem,
            id: editingItem ? editingItem.id : undefined
        };

        // Try Supabase
        const { error } = await supabase.from('master_items').upsert([itemToSave]);

        // Always update local for demo/fallback
        const updatedItems = editingItem
            ? items.map(i => i.id === editingItem.id ? { ...itemToSave, id: i.id } as MasterItem : i)
            : [...items, { ...itemToSave, id: Date.now().toString() } as MasterItem];

        localStorage.setItem('master_items', JSON.stringify(updatedItems));
        setItems(updatedItems);

        setNewItem({
            description: '',
            presentation: '',
            invima_registry: '',
            invima_expiration: '',
            standard_quantity: 1,
            category: 'Medicamento'
        });
        setEditingItem(null);
        setLoading(false);
        setMessage(error ? 'Guardado localmente (Error en Supabase)' : 'Ítem guardado exitosamente');
    };

    const handleDelete = async (id: string) => {
        await supabase.from('master_items').delete().eq('id', id);
        const updatedItems = items.filter(item => item.id !== id);
        localStorage.setItem('master_items', JSON.stringify(updatedItems));
        setItems(updatedItems);
        setMessage('Ítem eliminado');
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <header className="flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">Maestro de Medicamentos</h2>
                    <p className="text-slate-500 font-medium tracking-tight">Gestiona el catálogo base de insumos para las auditorías.</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                            type="text" 
                            title="Buscar en el catálogo de medicamentos"
                            placeholder="Buscar en catálogo..." 
                            className="pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all dark:text-white"
                        />
                    </div>
                    {message && (
                        <div className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-xs font-black uppercase tracking-widest border border-blue-100 animate-bounce">
                            {message}
                        </div>
                    )}
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none sticky top-24">
                        <h3 className="text-lg font-black text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                           <Plus className="text-primary" /> {editingItem ? 'Editar Ítem' : 'Nuevo Medicamento'}
                        </h3>
                        <form onSubmit={handleSave} className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Descripción / Nombre Genérico</label>
                                <input 
                                    type="text"
                                    required
                                    list="medications-list"
                                    value={newItem.description}
                                    onChange={e => {
                                        const val = e.target.value;
                                        const match = PREDEFINED_MEDS.find(m => m.description === val);
                                        setNewItem({
                                            ...newItem, 
                                            description: val,
                                            presentation: match ? match.presentation : newItem.presentation
                                        });
                                    }}
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-primary/20 rounded-xl font-bold text-sm outline-none transition-all dark:text-white"
                                    placeholder="Ej: Adrenalina 1mg/ml"
                                />
                                <datalist id="medications-list">
                                    {PREDEFINED_MEDS.map((med, idx) => (
                                        <option key={idx} value={med.description} />
                                    ))}
                                </datalist>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Presentación / Concentración</label>
                                <input 
                                    type="text"
                                    value={newItem.presentation || ''}
                                    onChange={e => setNewItem({...newItem, presentation: e.target.value})}
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-primary/20 rounded-xl font-bold text-sm outline-none transition-all dark:text-white"
                                    placeholder="Ej: Ampolla x 1ml"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Registro INVIMA</label>
                                    <input 
                                        type="text"
                                        required
                                        value={newItem.invima_registry}
                                        onChange={e => setNewItem({...newItem, invima_registry: e.target.value})}
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-primary/20 rounded-xl font-bold text-sm outline-none transition-all dark:text-white"
                                        placeholder="Registro"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Vence Registro</label>
                                    <input 
                                        type="date"
                                        title="Fecha de vencimiento del registro INVIMA"
                                        placeholder="Vencimiento"
                                        value={newItem.invima_expiration || ''}
                                        onChange={e => setNewItem({...newItem, invima_expiration: e.target.value})}
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-primary/20 rounded-xl font-bold text-sm outline-none transition-all dark:text-white"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Stock Estándar</label>
                                    <input 
                                        type="number"
                                        required
                                        title="Cantidad estándar en stock"
                                        placeholder="Cant."
                                        value={newItem.standard_quantity}
                                        onChange={e => setNewItem({...newItem, standard_quantity: parseInt(e.target.value)})}
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-primary/20 rounded-xl font-bold text-sm outline-none transition-all dark:text-white"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Categoría</label>
                                    <select 
                                        title="Categoría del insumo"
                                        value={newItem.category}
                                        onChange={e => setNewItem({...newItem, category: e.target.value})}
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-primary/20 rounded-xl font-bold text-sm outline-none transition-all appearance-none dark:text-white"
                                    >
                                        <option>Medicamento</option>
                                        <option>Dispositivo</option>
                                        <option>Insumo</option>
                                    </select>
                                </div>
                            </div>
                            <button 
                                disabled={loading}
                                className="w-full bg-primary py-4 rounded-2xl text-white font-black text-sm shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all mt-4 disabled:opacity-50"
                            >
                                {loading ? 'PROCESANDO...' : (editingItem ? 'ACTUALIZAR ÍTEM' : 'ADICIONAR AL CATÁLOGO')}
                            </button>
                            {editingItem && (
                                <button 
                                    type="button"
                                    onClick={() => { setEditingItem(null); setNewItem({ description: '', invima_registry: '', standard_quantity: 1, category: 'Medicamento' }); }}
                                    className="w-full py-2 text-slate-400 font-bold text-xs"
                                >
                                    CANCELAR EDICIÓN
                                </button>
                            )}
                        </form>
                    </div>
                </div>

                <div className="lg:col-span-2">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden hover:shadow-2xl transition-shadow duration-500">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-800/50">
                                    <th className="text-left py-5 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Insumo</th>
                                    <th className="text-left py-5 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Registro INVIMA</th>
                                    <th className="text-center py-5 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Stock</th>
                                    <th className="text-right py-5 px-10 text-[10px] font-black text-slate-400 uppercase tracking-widest">Opciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {items.map(item => (
                                    <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-400 group-hover:text-primary transition-colors">
                                                    <Pill size={18} />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-700 dark:text-slate-200 text-sm leading-none">{item.description}</p>
                                                    <p className="text-[10px] text-slate-400 mt-1 uppercase font-black">{item.category} {item.presentation ? `• ${item.presentation}` : ''}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex flex-col">
                                                <span className="px-2 py-1 bg-primary/5 text-primary text-[10px] font-black rounded-md w-fit">{item.invima_registry}</span>
                                                {item.invima_expiration && (
                                                    <span className="text-[9px] text-slate-400 mt-1 font-bold">Vence: {item.invima_expiration}</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-center">
                                            <span className="text-sm font-black text-slate-600 dark:text-slate-400">{item.standard_quantity}</span>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex justify-end gap-2 pr-4">
                                                <button 
                                                    onClick={() => { setEditingItem(item); setNewItem(item); }}
                                                    className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                                                    title="Editar"
                                                >
                                                    <Edit3 size={16} />
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(item.id)}
                                                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                    title="Eliminar"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {items.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="py-20 text-center">
                                            <div className="flex flex-col items-center gap-3 text-slate-300">
                                                <PackageCheck size={48} />
                                                <p className="font-bold text-sm">No hay ítems en el catálogo</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};
