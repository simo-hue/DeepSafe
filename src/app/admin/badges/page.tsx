'use client';

import React, { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { Database } from '@/types/supabase';
import { useRouter } from 'next/navigation';
import { Shield, Medal, Plus, X, Save, ArrowLeft, Trash2 } from 'lucide-react';

// Initialize Supabase Client
const supabase = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Badge = Database['public']['Tables']['badges']['Row'];

const BADGE_CATEGORIES = ['Region', 'Streak', 'XP', 'Special'];
const BADGE_RARITIES = ['common', 'rare', 'legendary'];
const CONDITION_TYPES = ['region_master', 'streak_milestone', 'xp_milestone', 'first_mission'];

export default function AdminBadgesPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [badges, setBadges] = useState<Badge[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBadge, setEditingBadge] = useState<Badge | null>(null);

    // Form State
    const [formData, setFormData] = useState<Partial<Badge>>({
        id: '',
        name: '',
        description: '',
        icon: '🏅',
        category: 'Special',
        xp_reward: 100,
        rarity: 'common',
        condition_type: 'xp_milestone',
        condition_value: ''
    });

    useEffect(() => {
        checkAdminAndFetchBadges();
    }, []);

    const checkAdminAndFetchBadges = async () => {
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
            router.push('/');
            return;
        }

        // Fetch badges
        const { data: allBadges, error } = await supabase
            .from('badges')
            .select('*')
            .order('created_at', { ascending: false });

        if (!error) {
            setBadges(allBadges || []);
        }
        setIsLoading(false);
    };

    const handleOpenModal = (badge?: Badge) => {
        if (badge) {
            setEditingBadge(badge);
            setFormData(badge);
        } else {
            setEditingBadge(null);
            setFormData({
                id: '',
                name: '',
                description: '',
                icon: '🏅',
                category: 'Special',
                xp_reward: 100,
                rarity: 'common',
                condition_type: 'xp_milestone',
                condition_value: ''
            });
        }
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        if (!formData.id || !formData.name) {
            alert('ID and Name are required');
            return;
        }

        const badgeData = {
            ...formData,
            xp_reward: Number(formData.xp_reward)
        } as Badge;

        if (editingBadge) {
            // Update
            const { error } = await supabase
                .from('badges')
                .update(badgeData)
                .eq('id', editingBadge.id);

            if (error) alert('Error updating badge');
        } else {
            // Create
            const { error } = await supabase
                .from('badges')
                .insert(badgeData);

            if (error) alert('Error creating badge: ' + error.message);
        }

        setIsModalOpen(false);
        checkAdminAndFetchBadges();
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this badge?')) return;

        const { error } = await supabase
            .from('badges')
            .delete()
            .eq('id', id);

        if (!error) {
            checkAdminAndFetchBadges();
        } else {
            alert('Error deleting badge');
        }
    };

    if (isLoading) {
        return <div className="min-h-screen bg-black flex items-center justify-center text-cyan-500 font-mono">LOADING BADGES...</div>;
    }

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-cyan-500/30 p-8">
            {/* Header */}
            <header className="flex items-center justify-between mb-8 border-b border-slate-800 pb-4">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.push('/admin')} className="p-2 hover:bg-slate-800 rounded-full transition-colors">
                        <ArrowLeft className="w-6 h-6 text-slate-400" />
                    </button>
                    <Medal className="w-10 h-10 text-purple-500" />
                    <div>
                        <h1 className="text-3xl font-bold text-white font-orbitron tracking-wider">BADGE MANAGER</h1>
                        <p className="text-slate-500 font-mono text-sm">SYSTEM ADMINISTRATION CONSOLE</p>
                    </div>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors font-bold"
                >
                    <Plus className="w-5 h-5" />
                    NEW BADGE
                </button>
            </header>

            {/* Badges Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {badges.map(badge => (
                    <div key={badge.id} className="bg-slate-900/50 border border-slate-800 p-6 rounded-xl hover:border-purple-500/50 transition-colors group relative">
                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                            <button onClick={() => handleOpenModal(badge)} className="p-1.5 bg-slate-800 text-cyan-400 rounded hover:bg-slate-700">
                                <Save className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDelete(badge.id)} className="p-1.5 bg-slate-800 text-red-400 rounded hover:bg-slate-700">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="text-4xl bg-slate-950 p-3 rounded-lg border border-slate-800">
                                {badge.icon}
                            </div>
                            <div>
                                <h3 className="font-bold text-white text-lg">{badge.name}</h3>
                                <p className="text-slate-400 text-sm mb-2">{badge.description}</p>
                                <div className="flex flex-wrap gap-2 text-xs font-mono">
                                    <span className="px-2 py-1 bg-purple-900/30 text-purple-400 rounded border border-purple-900/50">
                                        {badge.category}
                                    </span>
                                    <span className="px-2 py-1 bg-yellow-900/30 text-yellow-400 rounded border border-yellow-900/50">
                                        {badge.xp_reward} XP
                                    </span>
                                    <span className="px-2 py-1 bg-slate-800 text-slate-400 rounded">
                                        {badge.rarity}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-slate-800/50 text-xs font-mono text-slate-500">
                            ID: {badge.id} <br />
                            COND: {badge.condition_type} {badge.condition_value && `(${badge.condition_value})`}
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-2xl overflow-hidden shadow-2xl">
                        <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-800/50">
                            <h3 className="font-orbitron font-bold text-white">
                                {editingBadge ? 'EDIT BADGE' : 'CREATE NEW BADGE'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-mono text-slate-500 mb-1">ID (Unique)</label>
                                    <input
                                        type="text"
                                        value={formData.id}
                                        onChange={e => setFormData({ ...formData, id: e.target.value })}
                                        disabled={!!editingBadge}
                                        className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm focus:border-purple-500 outline-none disabled:opacity-50"
                                        placeholder="e.g. master_lombardia"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-mono text-slate-500 mb-1">Name</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm focus:border-purple-500 outline-none"
                                        placeholder="Badge Name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-mono text-slate-500 mb-1">Description</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm focus:border-purple-500 outline-none h-24 resize-none"
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
                                            className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-center text-xl focus:border-purple-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-mono text-slate-500 mb-1">XP Reward</label>
                                        <input
                                            type="number"
                                            value={formData.xp_reward}
                                            onChange={e => setFormData({ ...formData, xp_reward: parseInt(e.target.value) })}
                                            className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm focus:border-purple-500 outline-none"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-mono text-slate-500 mb-1">Category</label>
                                    <select
                                        value={formData.category}
                                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm focus:border-purple-500 outline-none"
                                    >
                                        {BADGE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-mono text-slate-500 mb-1">Rarity</label>
                                    <select
                                        value={formData.rarity}
                                        onChange={e => setFormData({ ...formData, rarity: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm focus:border-purple-500 outline-none"
                                    >
                                        {BADGE_RARITIES.map(r => <option key={r} value={r}>{r}</option>)}
                                    </select>
                                </div>
                                <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                                    <h4 className="text-xs font-bold text-purple-400 mb-3 uppercase">Unlock Condition</h4>
                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-xs font-mono text-slate-500 mb-1">Type</label>
                                            <select
                                                value={formData.condition_type}
                                                onChange={e => setFormData({ ...formData, condition_type: e.target.value })}
                                                className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm focus:border-purple-500 outline-none"
                                            >
                                                {CONDITION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-mono text-slate-500 mb-1">Value (Optional)</label>
                                            <input
                                                type="text"
                                                value={formData.condition_value || ''}
                                                onChange={e => setFormData({ ...formData, condition_value: e.target.value })}
                                                className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm focus:border-purple-500 outline-none"
                                                placeholder="e.g. 1000 or Piemonte"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 border-t border-slate-800 bg-slate-900/50 flex justify-end gap-3">
                            <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-400 hover:text-white transition-colors">Cancel</button>
                            <button onClick={handleSave} className="px-6 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-bold transition-colors shadow-lg shadow-purple-900/20">
                                SAVE BADGE
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
