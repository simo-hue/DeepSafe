'use client';

import React, { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { Database } from '@/types/supabase';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Plus, X, Save, ArrowLeft, Trash2, Zap } from 'lucide-react';

// Initialize Supabase Client
const supabase = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type ShopItem = Database['public']['Tables']['shop_items']['Row'];

const ITEM_TYPES = ['consumable', 'permanent', 'cosmetic'];
const RARITIES = ['common', 'rare', 'epic', 'legendary'];
const EFFECT_TYPES = ['streak_freeze', 'restore_lives', 'double_xp', 'mystery_box', 'none'];

export default function AdminShopPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [items, setItems] = useState<ShopItem[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<ShopItem | null>(null);

    // Form State
    const [formData, setFormData] = useState<Partial<ShopItem>>({
        id: '',
        name: '',
        description: '',
        icon: '📦',
        cost: 100,
        type: 'consumable',
        rarity: 'common',
        stock: null,
        is_limited: false,
        effect_type: 'none',
        effect_value: null,
        label: ''
    });

    // Loot State
    const [currentLoot, setCurrentLoot] = useState<any[]>([]);
    const [newLootItem, setNewLootItem] = useState({
        reward_type: 'xp',
        reward_value: 50,
        weight: 10,
        description: ''
    });

    useEffect(() => {
        checkAdminAndFetchItems();
    }, []);

    const checkAdminAndFetchItems = async () => {
        setIsLoading(true);
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            router.push('/');
            return;
        }

        // Check if user is admin
        const { data: profile } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', user.id)
            .single();

        if (!profile?.is_admin) {
            // router.push('/');
            // return;
        }

        // Fetch items
        const { data: allItems, error } = await supabase
            .from('shop_items')
            .select('*')
            .order('cost', { ascending: true });

        if (!error) {
            setItems(allItems || []);
        }
        setIsLoading(false);
    };

    const handleOpenModal = async (item?: ShopItem) => {
        if (item) {
            setEditingItem(item);
            setFormData(item);

            // Fetch loot if it's a mystery box
            if (item.effect_type === 'mystery_box') {
                const { data: lootData } = await supabase
                    .from('mystery_box_loot')
                    .select('*')
                    .eq('box_id', item.id);
                setCurrentLoot(lootData || []);
            } else {
                setCurrentLoot([]);
            }
        } else {
            setEditingItem(null);
            setFormData({
                id: '',
                name: '',
                description: '',
                icon: '📦',
                cost: 100,
                type: 'consumable',
                rarity: 'common',
                stock: null,
                is_limited: false,
                effect_type: 'none',
                effect_value: null,
                label: ''
            });
            setCurrentLoot([]);
        }
        setIsModalOpen(true);
    };

    const handleAddLootItem = () => {
        setCurrentLoot([...currentLoot, { ...newLootItem, id: `temp_${Date.now()}` }]);
        setNewLootItem({
            reward_type: 'xp',
            reward_value: 50,
            weight: 10,
            description: ''
        });
    };

    const handleRemoveLootItem = (index: number) => {
        const updated = [...currentLoot];
        updated.splice(index, 1);
        setCurrentLoot(updated);
    };

    const handleSave = async () => {
        if (!formData.id || !formData.name) {
            alert('ID and Name are required');
            return;
        }

        const itemData = {
            ...formData,
            cost: Number(formData.cost),
            stock: formData.stock ? Number(formData.stock) : null,
            effect_value: formData.effect_value ? Number(formData.effect_value) : null,
            label: formData.label || null
        } as ShopItem;

        if (editingItem) {
            // Update
            const { error } = await supabase
                .from('shop_items')
                .update(itemData)
                .eq('id', editingItem.id);

            if (error) {
                alert('Error updating item');
                return;
            }
        } else {
            // Create
            const { error } = await supabase
                .from('shop_items')
                .insert(itemData);

            if (error) {
                alert('Error creating item: ' + error.message);
                return;
            }
        }

        // Save Loot if Mystery Box
        if (formData.effect_type === 'mystery_box') {
            // 1. Delete existing loot for this box
            await supabase.from('mystery_box_loot').delete().eq('box_id', formData.id);

            // 2. Insert new loot
            if (currentLoot.length > 0) {
                const lootToInsert = currentLoot.map(l => ({
                    box_id: formData.id!,
                    reward_type: l.reward_type,
                    reward_value: l.reward_value,
                    weight: l.weight,
                    description: l.description
                }));

                const { error: lootError } = await supabase.from('mystery_box_loot').insert(lootToInsert);
                if (lootError) console.error('Error saving loot:', lootError);
            }
        }

        setIsModalOpen(false);
        checkAdminAndFetchItems();
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this item?')) return;

        const { error } = await supabase
            .from('shop_items')
            .delete()
            .eq('id', id);

        if (!error) {
            checkAdminAndFetchItems();
        } else {
            alert('Error deleting item');
        }
    };

    if (isLoading) {
        return <div className="min-h-screen bg-black flex items-center justify-center text-cyan-500 font-mono">LOADING SHOP...</div>;
    }

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-cyan-500/30 p-8">
            {/* Header */}
            <header className="flex items-center justify-between mb-8 border-b border-slate-800 pb-4">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.push('/admin')} className="p-2 hover:bg-slate-800 rounded-full transition-colors">
                        <ArrowLeft className="w-6 h-6 text-slate-400" />
                    </button>
                    <ShoppingCart className="w-10 h-10 text-yellow-500" />
                    <div>
                        <h1 className="text-3xl font-bold text-white font-orbitron tracking-wider">SHOP MANAGER</h1>
                        <p className="text-slate-500 font-mono text-sm">INVENTORY & PRICING CONTROL</p>
                    </div>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-500 text-black rounded-lg transition-colors font-bold"
                >
                    <Plus className="w-5 h-5" />
                    NEW ITEM
                </button>
            </header>

            {/* Out of Stock Section */}
            {items.filter(i => i.is_limited && (i.stock === null || i.stock <= 0)).length > 0 && (
                <div className="mb-12">
                    <h2 className="text-xl font-bold text-red-400 font-orbitron mb-4 flex items-center gap-2 border-b border-red-900/30 pb-2">
                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                        OUT OF STOCK / CONSUMED
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-75 hover:opacity-100 transition-opacity">
                        {items.filter(i => i.is_limited && (i.stock === null || i.stock <= 0)).map(item => (
                            <div key={item.id} className="bg-red-950/10 border border-red-900/30 p-6 rounded-xl hover:border-red-500/50 transition-colors group relative">
                                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                                    <button onClick={() => handleOpenModal(item)} className="p-1.5 bg-slate-800 text-cyan-400 rounded hover:bg-slate-700">
                                        <Save className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => handleDelete(item.id)} className="p-1.5 bg-slate-800 text-red-400 rounded hover:bg-slate-700">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="text-4xl bg-slate-950 p-3 rounded-lg border border-red-900/30 grayscale">
                                        {item.icon}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-300 text-lg line-through decoration-red-500/50">{item.name}</h3>
                                        <p className="text-slate-500 text-sm mb-2 h-10 overflow-hidden">{item.description}</p>
                                        <div className="flex flex-wrap gap-2 text-xs font-mono">
                                            <span className="px-2 py-1 bg-red-500 text-black font-bold rounded">
                                                SOLD OUT
                                            </span>
                                            <span className="px-2 py-1 bg-slate-800 text-slate-400 rounded">
                                                {item.type}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleOpenModal(item)}
                                    className="w-full mt-4 py-2 bg-red-900/20 hover:bg-red-900/40 text-red-400 border border-red-900/50 rounded-lg font-bold text-xs transition-colors flex items-center justify-center gap-2"
                                >
                                    RESTOCK ITEM
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Active Inventory Section */}
            <div>
                <h2 className="text-xl font-bold text-emerald-400 font-orbitron mb-4 flex items-center gap-2 border-b border-emerald-900/30 pb-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    ACTIVE INVENTORY
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {items.filter(i => !i.is_limited || (i.stock !== null && i.stock > 0)).map(item => (
                        <div key={item.id} className="bg-slate-900/50 border border-slate-800 p-6 rounded-xl hover:border-yellow-500/50 transition-colors group relative">
                            {item.label && (
                                <div className="absolute top-0 right-0 bg-cyan-500 text-black text-[9px] font-bold px-2 py-0.5 rounded-bl rounded-tr-xl z-10">
                                    {item.label}
                                </div>
                            )}
                            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2 z-20">
                                <button onClick={() => handleOpenModal(item)} className="p-1.5 bg-slate-800 text-cyan-400 rounded hover:bg-slate-700">
                                    <Save className="w-4 h-4" />
                                </button>
                                <button onClick={() => handleDelete(item.id)} className="p-1.5 bg-slate-800 text-red-400 rounded hover:bg-slate-700">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="text-4xl bg-slate-950 p-3 rounded-lg border border-slate-800">
                                    {item.icon}
                                </div>
                                <div>
                                    <h3 className="font-bold text-white text-lg">{item.name}</h3>
                                    <p className="text-slate-400 text-sm mb-2 h-10 overflow-hidden">{item.description}</p>
                                    <div className="flex flex-wrap gap-2 text-xs font-mono">
                                        <span className="px-2 py-1 bg-yellow-900/30 text-yellow-400 rounded border border-yellow-900/50">
                                            {item.cost} NC
                                        </span>
                                        <span className="px-2 py-1 bg-slate-800 text-slate-400 rounded">
                                            {item.type}
                                        </span>
                                        {item.is_limited && (
                                            <span className="px-2 py-1 bg-red-900/30 text-red-400 rounded border border-red-900/50">
                                                LIMITED: {item.stock ?? '∞'}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="mt-4 pt-4 border-t border-slate-800/50 text-xs font-mono text-slate-500 flex justify-between items-center">
                                <div>
                                    ID: {item.id} <br />
                                    EFFECT: {item.effect_type} {item.effect_value && `(${item.effect_value})`}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-4xl overflow-hidden shadow-2xl my-8">
                        <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-800/50">
                            <h3 className="font-orbitron font-bold text-white">
                                {editingItem ? 'EDIT ITEM' : 'CREATE NEW ITEM'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Left Column: Item Details */}
                            <div className="space-y-4">
                                <h4 className="text-sm font-bold text-cyan-400 uppercase border-b border-cyan-900/30 pb-2">Item Details</h4>
                                <div>
                                    <label className="block text-xs font-mono text-slate-500 mb-1">ID (Unique)</label>
                                    <input
                                        type="text"
                                        value={formData.id}
                                        onChange={e => setFormData({ ...formData, id: e.target.value })}
                                        disabled={!!editingItem}
                                        className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm focus:border-yellow-500 outline-none disabled:opacity-50"
                                        placeholder="e.g. magic_potion"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-mono text-slate-500 mb-1">Name</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm focus:border-yellow-500 outline-none"
                                        placeholder="Item Name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-mono text-slate-500 mb-1">Label (Optional)</label>
                                    <input
                                        type="text"
                                        value={formData.label || ''}
                                        onChange={e => setFormData({ ...formData, label: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm focus:border-yellow-500 outline-none"
                                        placeholder="e.g. POPOLARE, BEST VALUE"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-mono text-slate-500 mb-1">Description (Shown in Confirmation)</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm focus:border-yellow-500 outline-none h-24 resize-none"
                                        placeholder="Description..."
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-mono text-slate-500 mb-1">Icon (Emoji)</label>
                                        <input
                                            type="text"
                                            value={formData.icon}
                                            onChange={e => setFormData({ ...formData, icon: e.target.value })}
                                            className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-center text-xl focus:border-yellow-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-mono text-slate-500 mb-1">Cost (NC)</label>
                                        <input
                                            type="number"
                                            value={formData.cost}
                                            onChange={e => setFormData({ ...formData, cost: parseInt(e.target.value) })}
                                            className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm focus:border-yellow-500 outline-none"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-mono text-slate-500 mb-1">Type</label>
                                        <select
                                            value={formData.type}
                                            onChange={e => setFormData({ ...formData, type: e.target.value })}
                                            className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm focus:border-yellow-500 outline-none"
                                        >
                                            {ITEM_TYPES.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-mono text-slate-500 mb-1">Rarity</label>
                                        <select
                                            value={formData.rarity}
                                            onChange={e => setFormData({ ...formData, rarity: e.target.value })}
                                            className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm focus:border-yellow-500 outline-none"
                                        >
                                            {RARITIES.map(r => <option key={r} value={r}>{r}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: Effects & Loot */}
                            <div className="space-y-4">
                                <h4 className="text-sm font-bold text-purple-400 uppercase border-b border-purple-900/30 pb-2">Effects & Logic</h4>

                                <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700 space-y-3">
                                    <div>
                                        <label className="block text-xs font-mono text-slate-500 mb-1">Effect Type</label>
                                        <select
                                            value={formData.effect_type}
                                            onChange={e => setFormData({ ...formData, effect_type: e.target.value })}
                                            className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm focus:border-yellow-500 outline-none"
                                        >
                                            {EFFECT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                        </select>
                                    </div>

                                    {formData.effect_type !== 'mystery_box' && (
                                        <div>
                                            <label className="block text-xs font-mono text-slate-500 mb-1">Effect Value</label>
                                            <input
                                                type="number"
                                                value={formData.effect_value || ''}
                                                onChange={e => setFormData({ ...formData, effect_value: parseInt(e.target.value) })}
                                                className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm focus:border-yellow-500 outline-none"
                                                placeholder="e.g. 50 (XP)"
                                            />
                                        </div>
                                    )}

                                    <div className="flex items-center gap-2 pt-2">
                                        <input
                                            type="checkbox"
                                            checked={formData.is_limited}
                                            onChange={e => setFormData({ ...formData, is_limited: e.target.checked })}
                                            className="rounded bg-slate-950 border-slate-700 text-yellow-500 focus:ring-yellow-500"
                                        />
                                        <label className="text-sm text-slate-300">Limited Stock?</label>
                                    </div>
                                    {formData.is_limited && (
                                        <div>
                                            <label className="block text-xs font-mono text-slate-500 mb-1">Stock Amount</label>
                                            <input
                                                type="number"
                                                value={formData.stock || ''}
                                                onChange={e => setFormData({ ...formData, stock: parseInt(e.target.value) })}
                                                className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm focus:border-yellow-500 outline-none"
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* Loot Table UI - Only if Mystery Box */}
                                {formData.effect_type === 'mystery_box' && (
                                    <div className="p-4 bg-purple-900/10 rounded-lg border border-purple-500/30">
                                        <h4 className="text-xs font-bold text-purple-400 mb-1 uppercase flex items-center gap-2">
                                            <Zap className="w-3 h-3" /> Mystery Box Rewards
                                        </h4>
                                        <p className="text-[10px] text-slate-400 mb-3">
                                            Define the items users can win when opening this box.
                                        </p>

                                        <div className="mb-4 space-y-2 max-h-40 overflow-y-auto bg-slate-950/50 p-2 rounded border border-slate-800">
                                            {currentLoot.length === 0 && <p className="text-slate-500 italic text-xs text-center py-2">No loot defined.</p>}
                                            {currentLoot.map((loot: any, idx: number) => (
                                                <div key={idx} className="flex items-center justify-between bg-slate-800 p-2 rounded border border-slate-700">
                                                    <div>
                                                        <div className="font-bold text-white text-xs">{loot.description}</div>
                                                        <div className="text-[10px] text-slate-400 font-mono">
                                                            {loot.reward_type.toUpperCase()} +{loot.reward_value} | W: {loot.weight}
                                                        </div>
                                                    </div>
                                                    <button onClick={() => handleRemoveLootItem(idx)} className="text-slate-500 hover:text-red-400"><X className="w-3 h-3" /></button>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 mb-2">
                                            <select
                                                value={newLootItem.reward_type}
                                                onChange={e => setNewLootItem({ ...newLootItem, reward_type: e.target.value })}
                                                className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs"
                                            >
                                                <option value="xp">XP</option>
                                                <option value="credits">Credits</option>
                                                <option value="streak_freeze">Streak Freeze</option>
                                                <option value="lives">Lives</option>
                                            </select>
                                            <input
                                                type="number"
                                                placeholder="Value"
                                                value={newLootItem.reward_value}
                                                onChange={e => setNewLootItem({ ...newLootItem, reward_value: parseInt(e.target.value) })}
                                                className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs"
                                            />
                                            <input
                                                type="number"
                                                placeholder="Weight"
                                                value={newLootItem.weight}
                                                onChange={e => setNewLootItem({ ...newLootItem, weight: parseInt(e.target.value) })}
                                                className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs"
                                            />
                                            <input
                                                type="text"
                                                placeholder="Description"
                                                value={newLootItem.description}
                                                onChange={e => setNewLootItem({ ...newLootItem, description: e.target.value })}
                                                className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs"
                                            />
                                        </div>
                                        <button
                                            onClick={handleAddLootItem}
                                            className="w-full py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded font-bold text-xs transition-colors"
                                        >
                                            ADD REWARD OPTION
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="p-4 border-t border-slate-800 bg-slate-900/50 flex justify-end gap-3">
                            <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-400 hover:text-white transition-colors">Cancel</button>
                            <button onClick={handleSave} className="px-6 py-2 bg-yellow-600 hover:bg-yellow-500 text-black rounded-lg font-bold transition-colors shadow-lg shadow-yellow-900/20">
                                SAVE ITEM
                            </button>
                        </div>
                    </div>
                </div>
            )}


        </div>
    );
}
