import React, { useState, useEffect } from 'react';
import { Trash2, Edit3, Truck, MapPin, PackageCheck, Settings, Search, Plus, X, Upload } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { MasterCart, MasterItem, CartItemTemplate } from '../../types/audit';

export const CartsModule: React.FC = () => {
    const [carts, setCarts] = useState<MasterCart[]>([]);
    const [newCart, setNewCart] = useState<Partial<MasterCart>>({
        name: '',
        location: '',
        revision_month: ''
    });
    const [editingId, setEditingId] = useState<string | null>(null);
    const [selectedCartForItems, setSelectedCartForItems] = useState<MasterCart | null>(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    
    // For item template management
    const [templateItems, setTemplateItems] = useState<(CartItemTemplate & { master_items: MasterItem })[]>([]);
    const [masterItems, setMasterItems] = useState<MasterItem[]>([]);
    const [searchItem, setSearchItem] = useState('');
    const [showImportModal, setShowImportModal] = useState(false);
    const [importMetadata, setImportMetadata] = useState({ name: '', location: '', revision_month: '' });

    useEffect(() => {
        fetchCarts();
    }, []);

    useEffect(() => {
        if (selectedCartForItems) {
            fetchTemplateItems(selectedCartForItems.id);
        }
    }, [selectedCartForItems]);

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

    const fetchTemplateItems = async (cartId: string) => {
        const { data } = await supabase
            .from('cart_items_template')
            .select('*, master_items(*)')
            .eq('cart_id', cartId);
        if (data) setTemplateItems(data as any);
    };

    const searchMasterItems = async (term: string) => {
        const { data } = await supabase
            .from('master_items')
            .select('*')
            .ilike('description', `%${term}%`)
            .limit(5);
        if (data) setMasterItems(data);
    };

    const addTemplateItem = async (cartId: string, masterItemId: string, qty: number) => {
        const { error } = await supabase
            .from('cart_items_template')
            .upsert([{ cart_id: cartId, master_item_id: masterItemId, standard_quantity: qty }]);
        
        if (!error) fetchTemplateItems(cartId);
        else alert('Error al agregar ítem: ' + error.message);
    };

    const removeTemplateItem = async (templateId: string) => {
        await supabase.from('cart_items_template').delete().eq('id', templateId);
        if (selectedCartForItems) fetchTemplateItems(selectedCartForItems.id);
    };

    const handleTemplateCSV = async (e: React.ChangeEvent<HTMLInputElement>, targetCart?: MasterCart) => {
        const file = e.target.files?.[0];
        const cartToUse = targetCart || selectedCartForItems;
        if (!file || !cartToUse) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            const text = event.target?.result as string;
            if (!text) return;

            setLoading(true);
            const lines = text.split(/\r?\n/).filter(line => line.trim());
            if (lines.length === 0) {
                setLoading(false);
                return;
            }

            // Detect delimiter: count commas vs semicolons in first line
            const firstLine = lines[0];
            const commaCount = (firstLine.match(/,/g) || []).length;
            const semiCount = (firstLine.match(/;/g) || []).length;
            const delimiter = semiCount > commaCount ? ';' : ',';

            // Detect if first line is a header
            const headerKeywords = ['desc', 'item', 'nombre', 'cant', 'qty'];
            const isHeader = headerKeywords.some(key => firstLine.toLowerCase().includes(key));
            const startIdx = isHeader ? 1 : 0;

            let importedCount = 0;

            for (let i = startIdx; i < lines.length; i++) {
                const parts = lines[i].split(delimiter).map(p => p.trim());
                if (parts.length >= 1 && parts[0]) {
                    const desc = parts[0];
                    const qtyStr = parts[1];
                    
                    // Find item ID by description
                    const { data: item } = await supabase
                        .from('master_items')
                        .select('id')
                        .ilike('description', desc)
                        .maybeSingle();
                    
                    if (item) {
                        const standard_quantity = parseInt(qtyStr?.replace(/[^0-9]/g, '') || '1') || 1;
                        await supabase.from('cart_items_template').upsert([{
                            cart_id: cartToUse.id,
                            master_item_id: item.id,
                            standard_quantity
                        }]);
                        importedCount++;
                    }
                }
            }

            fetchTemplateItems(cartToUse.id);
            fetchCarts(); // Refresh list to show the new cart if it was just created
            setLoading(false);
            setMessage(`Carro "${cartToUse.name}" configurado: ${importedCount} ítems vinculados`);
            e.target.value = ''; // Reset input
        };
        reader.readAsText(file);
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
        
        setNewCart({ name: '', location: '', revision_month: '' });
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
                <div className="flex gap-2 mb-1">
                    <button 
                        onClick={() => setShowImportModal(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-primary font-black text-xs uppercase tracking-widest hover:shadow-lg transition-all"
                    >
                        <Upload size={16} /> Importar Carro (CSV)
                    </button>
                </div>
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
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Mes de Revisión</label>
                                <input 
                                    type="text"
                                    value={newCart.revision_month}
                                    onChange={e => setNewCart({...newCart, revision_month: e.target.value})}
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-primary/20 rounded-xl font-bold text-sm outline-none transition-all dark:text-white"
                                    placeholder="Ej: Marzo 2026"
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
                                <div className="mt-2 flex flex-col gap-2">
                                    <div className="flex items-center gap-2 text-slate-500 font-bold text-xs uppercase tracking-wider">
                                        <MapPin size={14} className="text-slate-400" />
                                        {cart.location}
                                    </div>
                                    {cart.revision_month && (
                                        <div className="flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-widest bg-primary/5 w-fit px-2 py-1 rounded-lg">
                                            <PackageCheck size={12} />
                                            Revisión: {cart.revision_month}
                                        </div>
                                    )}
                                </div>
                                <button 
                                    onClick={() => setSelectedCartForItems(cart)}
                                    className="mt-6 w-full flex items-center justify-center gap-2 py-3 bg-slate-50 dark:bg-slate-800 hover:bg-primary/5 hover:text-primary rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border border-transparent hover:border-primary/20"
                                >
                                    <Settings size={14} />
                                    Configurar Ítems
                                </button>
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

            {/* Template Configuration Modal/Panel */}
            {selectedCartForItems && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col">
                        <header className="p-6 bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-3">
                                    <Settings className="text-primary" /> Configurando: {selectedCartForItems.name}
                                </h3>
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Lista Estándar de Insumos</p>
                            </div>
                            <button onClick={() => setSelectedCartForItems(null)} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-all text-slate-400 hover:text-red-500" title="Cerrar configuración"><X /></button>
                        </header>

                        <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Search and Add */}
                            <div className="space-y-6">
                                <div className="space-y-4">
                                    <h4 className="text-xs font-black text-primary uppercase tracking-widest">Añadir Insumo desde Catálogo</h4>
                                    <div className="relative group">
                                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" />
                                        <input 
                                            type="text"
                                            placeholder="Buscar en el maestro..."
                                            value={searchItem}
                                            onChange={e => { setSearchItem(e.target.value); searchMasterItems(e.target.value); }}
                                            className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-primary/20 rounded-2xl font-bold text-sm outline-none transition-all dark:text-white"
                                        />
                                    </div>
                                    <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                                        {masterItems.map(item => (
                                            <button 
                                                key={item.id}
                                                onClick={() => addTemplateItem(selectedCartForItems.id, item.id, item.standard_quantity)}
                                                className="w-full flex justify-between items-center p-4 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl hover:border-primary/30 transition-all group"
                                            >
                                                <div className="text-left">
                                                    <p className="text-sm font-black text-slate-800 dark:text-white">{item.description}</p>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase">{item.presentation}</p>
                                                </div>
                                                <Plus size={18} className="text-slate-300 group-hover:text-primary" />
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-slate-100 dark:border-slate-700">
                                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Opciones Avanzadas</h4>
                                    <label className="flex items-center justify-center gap-2 w-full py-4 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl text-slate-500 hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition-all cursor-pointer font-black text-xs uppercase tracking-widest">
                                        <Upload size={18} />
                                        Cargar Composición (CSV)
                                        <input type="file" accept=".csv" className="hidden" onChange={handleTemplateCSV} />
                                    </label>
                                    <p className="text-[9px] text-slate-400 mt-2 text-center">* Formato: Nombre del Item, Cantidad</p>
                                </div>
                            </div>

                            {/* Current List */}
                            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-3xl p-6 border border-slate-200 dark:border-slate-700">
                                <h4 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-widest mb-6 px-2">Composición Actual ({templateItems.length})</h4>
                                <div className="space-y-3 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
                                    {templateItems.map(item => (
                                        <div key={item.id} className="flex justify-between items-center bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all">
                                            <div className="flex-1">
                                                <p className="text-sm font-black text-slate-800 dark:text-white">{item.master_items.description}</p>
                                                <div className="flex gap-4 mt-1">
                                                    <p className="text-[10px] font-black text-primary uppercase tracking-widest">Cant: {item.standard_quantity}</p>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase">{item.master_items.presentation}</p>
                                                </div>
                                            </div>
                                            <button 
                                                onClick={() => removeTemplateItem(item.id)}
                                                className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                                title="Eliminar de la plantilla"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))}
                                    {templateItems.length === 0 && (
                                        <div className="py-12 text-center text-slate-400">
                                            <p className="text-xs font-bold uppercase tracking-widest">Sin ítems asignados</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Import Cart Modal */}
            {showImportModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl p-8 space-y-6">
                        <header className="flex justify-between items-center">
                            <h3 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-3">
                                <Upload className="text-primary" /> Importar Nuevo Carro
                            </h3>
                            <button onClick={() => setShowImportModal(false)} className="text-slate-400 hover:text-red-500 transition-colors"><X /></button>
                        </header>
                        
                        <div className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Nombre del Carro/Kit</label>
                                <input 
                                    type="text"
                                    value={importMetadata.name}
                                    onChange={e => setImportMetadata({...importMetadata, name: e.target.value})}
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-primary/20 rounded-xl font-bold text-sm outline-none transition-all dark:text-white"
                                    placeholder="Ej: CP-082 Especial"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Ubicación</label>
                                <input 
                                    type="text"
                                    value={importMetadata.location}
                                    onChange={e => setImportMetadata({...importMetadata, location: e.target.value})}
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-primary/20 rounded-xl font-bold text-sm outline-none transition-all dark:text-white"
                                    placeholder="Ej: UCI Adultos"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Mes de Revisión (Trazabilidad)</label>
                                <input 
                                    type="text"
                                    value={importMetadata.revision_month}
                                    onChange={e => setImportMetadata({...importMetadata, revision_month: e.target.value})}
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-primary/20 rounded-xl font-bold text-sm outline-none transition-all dark:text-white"
                                    placeholder="Ej: Marzo 2026"
                                />
                            </div>
                        </div>

                        <div className="pt-4">
                            <label className={`w-full flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-3xl transition-all cursor-pointer ${importMetadata.name ? 'border-primary/40 bg-primary/5 text-primary hover:bg-primary/10' : 'border-slate-200 text-slate-300 pointer-events-none'}`}>
                                <Upload size={32} className="mb-2" />
                                <span className="font-black text-xs uppercase tracking-widest text-center">
                                    {importMetadata.name ? 'Seleccionar archivo CSV para finalizar' : 'Completa el nombre para continuar'}
                                </span>
                                {importMetadata.name && (
                                    <input 
                                        type="file" 
                                        accept=".csv" 
                                        className="hidden" 
                                        onChange={async (e) => {
                                            const file = e.target.files?.[0];
                                            if (!file) return;
                                            
                                            // 1. Create the cart
                                            const { data: cart, error: cErr } = await supabase
                                                .from('master_carts')
                                                .insert([importMetadata])
                                                .select()
                                                .single();
                                            
                                            if (cErr) {
                                                alert('Error al crear el carro: ' + cErr.message);
                                                return;
                                            }

                                            // 2. Trigger the template import for this new cart
                                            setSelectedCartForItems(cart);
                                            setShowImportModal(false);
                                            setImportMetadata({ name: '', location: '', revision_month: '' });
                                            
                                            // Use handleTemplateCSV simulation or refactor it
                                            const fakeEvent = { target: { files: [file] } } as any;
                                            // Optimization: I'll need to make handleTemplateCSV accept the cart explicitly or wait for state
                                            handleTemplateCSV(fakeEvent, cart);
                                        }} 
                                    />
                                )}
                            </label>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
