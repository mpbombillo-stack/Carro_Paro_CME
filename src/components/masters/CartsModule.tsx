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
                const parsed = JSON.parse(saved);
                // Purge any corrupted legacy carts from the local database
                const valid = parsed.filter((c: any) => typeof c.id === 'string' && c.id.length > 30);
                if (valid.length !== parsed.length) localStorage.setItem('master_carts', JSON.stringify(valid));
                setCarts(valid);
            }
        } catch (error) {
            console.error('Error fetching carts:', error);
            const saved = localStorage.getItem('master_carts');
            if (saved) {
                const parsed = JSON.parse(saved);
                const valid = parsed.filter((c: any) => typeof c.id === 'string' && c.id.length > 30);
                setCarts(valid);
            }
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

    const addTemplateItem = async (cartId: string | number, masterItem: MasterItem, qty: number) => {
        let finalCartId = String(cartId);
        const cartData = carts.find(c => String(c.id) === finalCartId);
        if (!cartData) return;

        // Validar si es un UUID oficial
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(finalCartId);

        if (!isUUID) {
            console.warn('Detectado Cart ID no-UUID, sincronizando carro...');
            const { data: existing } = await supabase.from('master_carts').select('id').eq('name', cartData.name).maybeSingle();
            if (existing) {
                finalCartId = existing.id;
            } else {
                const { data: newC } = await supabase.from('master_carts').insert([{ name: cartData.name, location: cartData.location, revision_month: cartData.revision_month }]).select().single();
                if (!newC) {
                    alert('Error: No se pudo sincronizar el carro con la base de datos central.');
                    return;
                }
                finalCartId = newC.id;
            }
        } else {
            // Verificar que realmente existe en Supabase (por si fue creado offline con un UUID virtual)
            const { data: exists } = await supabase.from('master_carts').select('id').eq('id', finalCartId).maybeSingle();
            if (!exists) {
                console.warn('Carro local con UUID virtual no existe en nube. Insertando ahora...');
                const { error: insErr } = await supabase.from('master_carts').insert([{ 
                    id: finalCartId, 
                    name: cartData.name, 
                    location: cartData.location, 
                    revision_month: cartData.revision_month 
                }]);
                if (insErr) {
                    alert('Error resincronizando carro offline: ' + insErr.message);
                    return;
                }
            }
        }
            
        // Update local state si el ID cambió
        if (finalCartId !== String(cartId)) {
            const updated = carts.map(c => String(c.id) === String(cartId) ? { ...c, id: finalCartId } : c);
            setCarts(updated);
            localStorage.setItem('master_carts', JSON.stringify(updated));
            if (selectedCartForItems && String(selectedCartForItems.id) === String(cartId)) {
                setSelectedCartForItems({ ...cartData, id: finalCartId });
            }
        }

        let finalMasterItemId = String(masterItem.id);
        const isItemUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(finalMasterItemId);
        
        // Self-healing: if ID is legacy numeric or offline UUID
        if (!isItemUUID) {
            console.warn('Detectado Item ID no-UUID, intentando recuperación:', masterItem.id);
            const { data: existingItem } = await supabase
                .from('master_items')
                .select('id')
                .eq('description', masterItem.description)
                .eq('invima_registry', masterItem.invima_registry)
                .maybeSingle();

            if (existingItem) {
                finalMasterItemId = existingItem.id;
            } else {
                const newItem = { ...masterItem, id: crypto.randomUUID() };
                const { data, error: insertError } = await supabase
                    .from('master_items')
                    .insert([newItem])
                    .select()
                    .single();
                
                if (insertError || !data) {
                    alert('Error al sincronizar el insumo base: ' + (insertError?.message || 'Error desconocido'));
                    return;
                }
                finalMasterItemId = data.id;
            }
        } else {
            // Check if UUID actually exists in Supabase (might be an offline ghost)
            const { data: itemExists } = await supabase.from('master_items').select('id').eq('id', finalMasterItemId).maybeSingle();
            if (!itemExists) {
                console.warn('Insumo maestro existe localmente con UUID pero NO en Supabase. Sincronizando...');
                const { error: itemInsErr } = await supabase.from('master_items').insert([{
                    id: finalMasterItemId,
                    description: masterItem.description,
                    presentation: masterItem.presentation || '',
                    invima_registry: masterItem.invima_registry || '',
                    standard_quantity: masterItem.standard_quantity || 1,
                    category: masterItem.category || ''
                }]);
                if (itemInsErr) {
                    alert('Error resincronizando insumo offline: ' + itemInsErr.message);
                    return;
                }
            }
        }

        const { error } = await supabase
            .from('cart_items_template')
            .insert([{ cart_id: finalCartId, master_item_id: finalMasterItemId, standard_quantity: qty }]);
        
        if (!error) fetchTemplateItems(finalCartId);
        else alert('Error al agregar ítem (recuerde correr el SQL para permitir duplicados): ' + error.message);
    };

    const updateTemplateItem = async (id: string, field: string, value: string | number) => {
        const { error } = await supabase
            .from('cart_items_template')
            .update({ [field]: value })
            .eq('id', id);
        
        if (!error && selectedCartForItems) {
            // Optimistic update locally for smoothness
            setTemplateItems(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
        } else if (error) {
            alert('Error actualizando ítem: ' + error.message);
        }
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

            let finalCartId = String(cartToUse.id);
            const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(finalCartId);

            if (!isUUID) {
                console.warn('Sincronizando carro antes de importar CSV...');
                const { data: existing } = await supabase.from('master_carts').select('id').eq('name', cartToUse.name).maybeSingle();
                if (existing) {
                    finalCartId = existing.id;
                } else {
                    const { data: newC } = await supabase.from('master_carts').insert([{ name: cartToUse.name, location: cartToUse.location, revision_month: cartToUse.revision_month }]).select().single();
                    if (!newC) {
                        alert('Error: No se pudo sincronizar el carro con la base de datos.');
                        setLoading(false);
                        return;
                    }
                    finalCartId = newC.id;
                }
            } else {
                const { data: exists } = await supabase.from('master_carts').select('id').eq('id', finalCartId).maybeSingle();
                if (!exists) {
                    await supabase.from('master_carts').insert([{ 
                        id: finalCartId, name: cartToUse.name, location: cartToUse.location, revision_month: cartToUse.revision_month 
                    }]);
                }
            }

            if (finalCartId !== String(cartToUse.id)) {
                const updated = carts.map(c => String(c.id) === String(cartToUse.id) ? { ...c, id: finalCartId } : c);
                setCarts(updated);
                localStorage.setItem('master_carts', JSON.stringify(updated));
                if (selectedCartForItems && String(selectedCartForItems.id) === String(cartToUse.id)) {
                    setSelectedCartForItems({ ...cartToUse, id: finalCartId });
                }
            }

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
                        await supabase.from('cart_items_template').insert([{
                            cart_id: finalCartId,
                            master_item_id: item.id,
                            standard_quantity
                        }]);
                        importedCount++;
                    }
                }
            }

            fetchTemplateItems(finalCartId);
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
        
        // Final sanity check, offline carts with timestamp shouldn't use it for updates
        let finalEditingId = editingId;
        if (editingId && editingId.length < 30) {
            finalEditingId = null; // Forces insert since it's an offline-only cart
        }

        const cartToSave = {
            ...newCart,
            id: finalEditingId || undefined
        };

        const { data, error } = await supabase
            .from('master_carts')
            .upsert([cartToSave])
            .select()
            .single();
        
        // Always local
        const savedCart = data || { ...cartToSave, id: editingId ? editingId : crypto.randomUUID() };

        const updatedCarts = editingId
            ? carts.map(c => c.id === editingId ? savedCart as MasterCart : c)
            : [...carts, savedCart as MasterCart];
            
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
                                                onClick={() => addTemplateItem(selectedCartForItems.id, item, item.standard_quantity)}
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
                                                <p className="text-[10px] font-bold text-slate-400 uppercase">{item.master_items.presentation}</p>
                                                
                                                <div className="flex flex-wrap gap-2 mt-2">
                                                    <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800 p-1 rounded-lg">
                                                        <span className="text-[10px] font-black text-slate-400 uppercase pl-1">Cant:</span>
                                                        <input 
                                                            type="number" 
                                                            title="Cantidad"
                                                            value={item.standard_quantity}
                                                            onChange={e => updateTemplateItem(item.id, 'standard_quantity', parseInt(e.target.value) || 1)}
                                                            className="w-12 bg-transparent border-none text-xs font-black text-primary outline-none text-center"
                                                        />
                                                    </div>
                                                    <input 
                                                        type="text" 
                                                        placeholder="LOTE / SERIE"
                                                        title="Lote o Serie"
                                                        value={item.lote || ''}
                                                        onChange={e => updateTemplateItem(item.id, 'lote', e.target.value)}
                                                        className="w-24 bg-slate-50 dark:bg-slate-800 border-none rounded-lg px-2 py-1 text-[10px] font-bold outline-none ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-primary"
                                                    />
                                                    <input 
                                                        type="date" 
                                                        title="Fecha de Vencimiento"
                                                        value={item.fecha_vencimiento_insumo || ''}
                                                        onChange={e => updateTemplateItem(item.id, 'fecha_vencimiento_insumo', e.target.value)}
                                                        className="bg-slate-50 dark:bg-slate-800 border-none rounded-lg px-2 py-1 text-[10px] font-bold outline-none ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-primary"
                                                    />
                                                </div>
                                            </div>
                                            <button 
                                                onClick={() => removeTemplateItem(item.id)}
                                                className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all self-center ml-2"
                                                title="Eliminar de la plantilla"
                                            >
                                                <Trash2 size={18} />
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
                            <button onClick={() => setShowImportModal(false)} className="text-slate-400 hover:text-red-500 transition-colors" title="Cerrar modal"><X /></button>
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
