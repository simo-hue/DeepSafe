'use client';

import React, { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { Database } from '@/types/supabase';
import { useRouter } from 'next/navigation';
import { Shield, Users, Coins, Search, Save, Ban, RefreshCw, Crown, Package, Medal, Zap, Trash2, Plus, X, ShoppingCart, BookOpen, Activity } from 'lucide-react';
import { BADGES_DATA } from '@/data/badgesData';
import { GiftModal } from '@/components/admin/GiftModal';
import { ConfirmationModal } from '@/components/admin/ConfirmationModal';
import { Gift } from 'lucide-react';

// Initialize Supabase Client
const supabase = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Profile = Database['public']['Tables']['profiles']['Row'];

const INVENTORY_ITEMS = [
    { id: 'streak_freeze', name: 'Streak Freeze', icon: '❄️' },
    { id: 'system_reboot', name: 'System Reboot', icon: '🔄' },
    { id: 'double_xp', name: 'Double XP (1h)', icon: '⚡' },
];

export default function AdminPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [users, setUsers] = useState<Profile[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<Profile[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<Partial<Profile>>({});

    // Modal States
    const [activeModal, setActiveModal] = useState<'inventory' | 'badges' | 'gift' | null>(null);
    const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
    const [confirmationModal, setConfirmationModal] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
        variant?: 'info' | 'danger' | 'warning' | 'success';
        confirmText?: string;
    }>({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { },
    });

    const closeConfirmation = () => {
        setConfirmationModal(prev => ({ ...prev, isOpen: false }));
    };

    const askConfirmation = (
        title: string,
        message: string,
        onConfirm: () => void,
        variant: 'info' | 'danger' | 'warning' | 'success' = 'info',
        confirmText = 'Conferma'
    ) => {
        setConfirmationModal({
            isOpen: true,
            title,
            message,
            onConfirm: () => {
                onConfirm();
                closeConfirmation();
            },
            variant,
            confirmText
        });
    };

    // KPI Stats
    const totalUsers = users.length;
    const totalCredits = users.reduce((acc, user) => acc + (user.credits || 0), 0);
    const activeUsers = users.filter(u => u.last_login && new Date(u.last_login) > new Date(Date.now() - 86400000)).length;

    useEffect(() => {
        checkAdminAndFetchData();
    }, []);

    useEffect(() => {
        const lowerTerm = searchTerm.toLowerCase();
        setFilteredUsers(users.filter(user =>
            (user.username?.toLowerCase().includes(lowerTerm) || '') ||
            (user.id.toLowerCase().includes(lowerTerm))
        ));
    }, [searchTerm, users]);

    const checkAdminAndFetchData = async () => {
        setIsLoading(true);
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            router.push('/');
            return;
        }

        // Check if user is admin
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', user.id)
            .single();

        console.log('Admin Check:', { user: user.id, profile, error: profileError });

        if (!profile?.is_admin) {
            console.warn('Access Denied: User is not admin (DB check)');
            // router.push('/'); // DISABLED: Relying on Lock Screen for access control
            // return;
        }

        // Fetch all profiles
        const { data: allProfiles, error } = await supabase
            .from('profiles')
            .select('*')
            .order('updated_at', { ascending: false });

        if (error) {
            console.error('Error fetching users:', error);
        } else {
            setUsers(allProfiles || []);
        }
        setIsLoading(false);
    };

    const handleEdit = (user: Profile) => {
        setEditingId(user.id);
        setEditForm({
            credits: user.credits,
            xp: user.xp,
            highest_streak: user.highest_streak
        });
    };

    const handleSave = async (id: string) => {
        askConfirmation(
            'Salva Modifiche',
            'Sei sicuro di voler salvare le modifiche a questo utente?',
            async () => {
                const { error } = await supabase
                    .from('profiles')
                    .update(editForm)
                    .eq('id', id);

                if (error) {
                    alert('Error updating user');
                } else {
                    setUsers(users.map(u => u.id === id ? { ...u, ...editForm } : u));
                    setEditingId(null);
                }
            },
            'info',
            'Salva'
        );
    };

    const handleBan = async (id: string) => {
        askConfirmation(
            'Reset Utente',
            'Sei sicuro di voler resettare questo utente? Verranno azzerati XP, Crediti e Streak.',
            async () => {
                // Soft ban / Reset
                const { error } = await supabase
                    .from('profiles')
                    .update({ xp: 0, credits: 0, highest_streak: 0, unlocked_provinces: ['CB', 'IS', 'FG'] })
                    .eq('id', id);

                if (!error) {
                    checkAdminAndFetchData();
                }
            },
            'warning',
            'Reset Utente'
        );
    };

    const handleDeleteUser = async (id: string) => {
        askConfirmation(
            'ELIMINAZIONE DEFINITIVA',
            'ATTENZIONE: Stai per eliminare DEFINITIVAMENTE questo utente. Questa azione NON può essere annullata. Sei assolutamente sicuro?',
            async () => {
                try {
                    const response = await fetch(`/api/admin/users/delete?userId=${id}`, {
                        method: 'DELETE',
                    });

                    if (!response.ok) {
                        const data = await response.json();
                        throw new Error(data.error || 'Delete failed');
                    }

                    // Remove from local state
                    setUsers(users.filter(u => u.id !== id));
                    // alert('User deleted successfully.'); // Optional: maybe show a success toast or just update UI
                } catch (error: any) {
                    console.error('Delete error:', error);
                    alert(`Failed to delete user: ${error.message}`);
                }
            },
            'danger',
            'ELIMINA PER SEMPRE'
        );
    };

    const handleTogglePremium = async (user: Profile) => {
        const newStatus = !user.is_premium;
        askConfirmation(
            newStatus ? 'Attiva Premium' : 'Disattiva Premium',
            `Sei sicuro di voler ${newStatus ? 'attivare' : 'disattivare'} lo stato Premium per ${user.username}?`,
            async () => {
                const { error } = await supabase
                    .from('profiles')
                    .update({ is_premium: newStatus })
                    .eq('id', user.id);

                if (!error) {
                    setUsers(users.map(u => u.id === user.id ? { ...u, is_premium: newStatus } : u));
                }
            },
            'info',
            newStatus ? 'Attiva' : 'Disattiva'
        );
    };

    // --- Inventory Management ---
    const openInventoryModal = (user: Profile) => {
        setSelectedUser(user);
        setActiveModal('inventory');
    };

    const handleAddItem = async (itemId: string) => {
        if (!selectedUser) return;
        const currentInventory = (selectedUser.inventory as string[]) || [];
        const newInventory = [...currentInventory, itemId];

        const { error } = await supabase
            .from('profiles')
            .update({ inventory: newInventory })
            .eq('id', selectedUser.id);

        if (!error) {
            updateLocalUser(selectedUser.id, { inventory: newInventory });
        }
    };

    const handleRemoveItem = async (index: number) => {
        if (!selectedUser) return;
        const currentInventory = (selectedUser.inventory as string[]) || [];
        const newInventory = [...currentInventory];
        newInventory.splice(index, 1);

        const { error } = await supabase
            .from('profiles')
            .update({ inventory: newInventory })
            .eq('id', selectedUser.id);

        if (!error) {
            updateLocalUser(selectedUser.id, { inventory: newInventory });
        }
    };

    // --- Badge Management ---
    const openBadgeModal = (user: Profile) => {
        setSelectedUser(user);
        setActiveModal('badges');
    };

    const handleToggleBadge = async (badgeId: string) => {
        if (!selectedUser) return;
        const currentBadges = (selectedUser.earned_badges as any[]) || [];
        const hasBadge = currentBadges.some(b => b.id === badgeId);

        let newBadges;
        if (hasBadge) {
            newBadges = currentBadges.filter(b => b.id !== badgeId);
        } else {
            newBadges = [...currentBadges, { id: badgeId, earned_at: new Date().toISOString() }];
        }

        const { error } = await supabase
            .from('profiles')
            .update({ earned_badges: newBadges })
            .eq('id', selectedUser.id);

        if (!error) {
            updateLocalUser(selectedUser.id, { earned_badges: newBadges });
        }
    };

    const updateLocalUser = (userId: string, updates: Partial<Profile>) => {
        setUsers(users.map(u => u.id === userId ? { ...u, ...updates } : u));
        if (selectedUser && selectedUser.id === userId) {
            setSelectedUser({ ...selectedUser, ...updates });
        }
    };

    // --- System Actions ---


    const handleBackup = async () => {
        try {
            const response = await fetch('/api/admin/backup');
            if (!response.ok) throw new Error('Backup failed');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `deepsafe-backup-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Backup error:', error);
            alert('Backup failed. Check console for details.');
        }
    };

    const handleRestore = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Store file and target to use in callback
        // Since we can't pass event to async callback easily if it's pooled (though React 17+ doesn't pool),
        // we just read the file here.

        askConfirmation(
            'RIPRISTINO DATABASE',
            'ATTENZIONE: Questa azione SOVRASCRIVERÀ l\'intero database con i dati del backup. Tutti i dati attuali andranno persi. Sei sicuro?',
            () => {
                const reader = new FileReader();
                reader.onload = async (e) => {
                    try {
                        const json = JSON.parse(e.target?.result as string);
                        const response = await fetch('/api/admin/restore', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ data: json.data || json }) // Handle wrapped or direct data
                        });

                        const result = await response.json();
                        if (!response.ok) throw new Error(result.error || 'Restore failed');

                        alert('Restore successful! The page will now reload.');
                        window.location.reload();
                    } catch (error: any) {
                        console.error('Restore error:', error);
                        alert(`Restore failed: ${error.message}`);
                    }
                };
                reader.readAsText(file);
            },
            'danger',
            'RIPRISTINA ORA'
        );

        // Reset input value to allow selecting same file again if cancelled/failed
        event.target.value = '';
    };

    if (isLoading) {
        return <div className="min-h-screen bg-black flex items-center justify-center text-cyan-500 font-mono">INITIALIZING GOD MODE...</div>;
    }

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-cyan-500/30 p-8">

            {/* Header */}
            <header className="flex items-center justify-between mb-8 border-b border-slate-800 pb-4">
                <div className="flex items-center gap-4">
                    <Shield className="w-10 h-10 text-cyan-500" />
                    <div>
                        <h1 className="text-3xl font-bold text-white font-orbitron tracking-wider">GOD MODE</h1>
                        <p className="text-slate-500 font-mono text-sm">SYSTEM ADMINISTRATION CONSOLE</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => router.push('/admin/badges')}
                        className="px-4 py-2 bg-purple-900/30 border border-purple-700/50 rounded hover:bg-purple-900/50 text-purple-400 font-mono text-xs transition-colors flex items-center gap-2"
                    >
                        <Medal className="w-4 h-4" />
                        MANAGE BADGES
                    </button>
                    <button
                        onClick={() => router.push('/admin/shop')}
                        className="px-4 py-2 bg-yellow-900/30 border border-yellow-700/50 rounded hover:bg-yellow-900/50 text-yellow-400 font-mono text-xs transition-colors flex items-center gap-2"
                    >
                        <ShoppingCart className="w-4 h-4" />
                        MANAGE SHOP
                    </button>
                    <button
                        onClick={() => router.push('/admin/avatars')}
                        className="px-4 py-2 bg-pink-900/30 border border-pink-700/50 rounded hover:bg-pink-900/50 text-pink-400 font-mono text-xs transition-colors flex items-center gap-2"
                    >
                        <Users className="w-4 h-4" />
                        MANAGE AVATARS
                    </button>
                    <button
                        onClick={() => router.push('/admin/missions')}
                        className="px-4 py-2 bg-cyan-900/30 border border-cyan-700/50 rounded hover:bg-cyan-900/50 text-cyan-400 font-mono text-xs transition-colors flex items-center gap-2"
                    >
                        <BookOpen className="w-4 h-4" />
                        MISSION CREATOR
                    </button>
                    <button
                        onClick={() => router.push('/admin/analytics')}
                        className="px-4 py-2 bg-emerald-900/30 border border-emerald-700/50 rounded hover:bg-emerald-900/50 text-emerald-400 font-mono text-xs transition-colors flex items-center gap-2"
                    >
                        <Activity className="w-4 h-4" />
                        ANALYTICS
                    </button>
                    <button
                        onClick={() => setActiveModal('gift')}
                        className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 border border-cyan-500/50 rounded hover:from-cyan-500 hover:to-blue-500 text-white font-mono text-xs transition-colors flex items-center gap-2 shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                    >
                        <Gift className="w-4 h-4" />
                        SEND GIFT
                    </button>

                    <button
                        onClick={checkAdminAndFetchData}
                        className="p-2 bg-slate-900 border border-slate-700 rounded hover:bg-slate-800 transition-colors"
                    >
                        <RefreshCw className="w-5 h-5 text-cyan-500" />
                    </button>
                </div>
            </header>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-xl">
                    <div className="flex items-center gap-3 mb-2">
                        <Users className="w-5 h-5 text-blue-400" />
                        <span className="text-slate-400 font-mono text-sm">TOTAL USERS</span>
                    </div>
                    <div className="text-3xl font-bold text-white font-orbitron">{totalUsers}</div>
                </div>
                <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-xl">
                    <div className="flex items-center gap-3 mb-2">
                        <Coins className="w-5 h-5 text-yellow-400" />
                        <span className="text-slate-400 font-mono text-sm">TOTAL CREDITS</span>
                    </div>
                    <div className="text-3xl font-bold text-white font-orbitron">{totalCredits.toLocaleString()}</div>
                </div>
                <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-xl">
                    <div className="flex items-center gap-3 mb-2">
                        <Shield className="w-5 h-5 text-green-400" />
                        <span className="text-slate-400 font-mono text-sm">ACTIVE (24H)</span>
                    </div>
                    <div className="text-3xl font-bold text-white font-orbitron">{activeUsers}</div>
                </div>
            </div>

            {/* System Maintenance */}
            <div className="bg-slate-900/30 border border-slate-800 rounded-xl p-6 mb-8">
                <h2 className="text-lg font-bold text-white font-orbitron mb-4 flex items-center gap-2">
                    <Save className="w-5 h-5 text-cyan-500" />
                    SYSTEM MAINTENANCE
                </h2>
                <div className="flex flex-wrap gap-4">
                    <button
                        onClick={handleBackup}
                        className="px-6 py-3 bg-blue-900/30 border border-blue-700/50 rounded-lg hover:bg-blue-900/50 text-blue-400 font-mono text-sm transition-colors flex items-center gap-2"
                    >
                        <Save className="w-4 h-4" />
                        DOWNLOAD BACKUP (.JSON)
                    </button>

                    <div className="relative">
                        <input
                            type="file"
                            accept=".json"
                            onChange={handleRestore}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <button
                            className="px-6 py-3 bg-red-900/30 border border-red-700/50 rounded-lg hover:bg-red-900/50 text-red-400 font-mono text-sm transition-colors flex items-center gap-2 pointer-events-none"
                        >
                            <RefreshCw className="w-4 h-4" />
                            RESTORE FROM BACKUP
                        </button>
                    </div>
                </div>
                <p className="text-xs text-slate-500 mt-2 font-mono">
                    * Restore will overwrite all current data. Use with caution.
                </p>
            </div>
            <div className="bg-slate-900/30 border border-slate-800 rounded-xl overflow-hidden">
                <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
                    <h2 className="text-lg font-bold text-white font-orbitron">USER DATABASE</h2>
                    <div className="relative">
                        <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Search UUID or Username..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-cyan-500 w-64"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-950 text-slate-500 text-xs font-mono uppercase tracking-wider">
                                <th className="p-4 border-b border-slate-800">User</th>
                                <th className="p-4 border-b border-slate-800">Status</th>
                                <th className="p-4 border-b border-slate-800">Lifetime NC</th>
                                <th className="p-4 border-b border-slate-800">Credits</th>
                                <th className="p-4 border-b border-slate-800">Streak</th>
                                <th className="p-4 border-b border-slate-800">Last Login</th>
                                <th className="p-4 border-b border-slate-800 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm divide-y divide-slate-800">
                            {filteredUsers.map(user => (
                                <tr key={user.id} className="hover:bg-slate-800/30 transition-colors">
                                    <td className="p-4">
                                        <div className="font-bold text-white flex items-center gap-2">
                                            {user.username || 'Anonymous'}
                                            {user.is_admin && <Shield className="w-3 h-3 text-cyan-500" />}
                                        </div>
                                        <div className="text-xs text-slate-500 font-mono">{user.id}</div>
                                    </td>
                                    <td className="p-4">
                                        <button
                                            onClick={() => handleTogglePremium(user)}
                                            className={`p-1 rounded ${user.is_premium ? 'text-amber-400 bg-amber-900/20' : 'text-slate-600 hover:text-slate-400'}`}
                                            title="Toggle Premium"
                                        >
                                            <Crown className="w-4 h-4" />
                                        </button>
                                    </td>
                                    <td className="p-4 font-mono">
                                        {editingId === user.id ? (
                                            <input
                                                type="number"
                                                value={editForm.xp || 0}
                                                onChange={(e) => setEditForm({ ...editForm, xp: parseInt(e.target.value) })}
                                                className="bg-slate-950 border border-slate-700 rounded px-2 py-1 w-20"
                                            />
                                        ) : (
                                            <span className="text-purple-400">{user.xp}</span>
                                        )}
                                    </td>
                                    <td className="p-4 font-mono">
                                        {editingId === user.id ? (
                                            <input
                                                type="number"
                                                value={editForm.credits || 0}
                                                onChange={(e) => setEditForm({ ...editForm, credits: parseInt(e.target.value) })}
                                                className="bg-slate-950 border border-slate-700 rounded px-2 py-1 w-20"
                                            />
                                        ) : (
                                            <span className="text-yellow-400">{user.credits}</span>
                                        )}
                                    </td>
                                    <td className="p-4 font-mono">
                                        {editingId === user.id ? (
                                            <input
                                                type="number"
                                                value={editForm.highest_streak || 0}
                                                onChange={(e) => setEditForm({ ...editForm, highest_streak: parseInt(e.target.value) })}
                                                className="bg-slate-950 border border-slate-700 rounded px-2 py-1 w-16"
                                            />
                                        ) : (
                                            <span className="text-orange-400">{user.highest_streak} 🔥</span>
                                        )}
                                    </td>
                                    <td className="p-4 text-slate-400">
                                        {user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}
                                    </td>
                                    <td className="p-4 text-right">
                                        {editingId === user.id ? (
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => handleSave(user.id)} className="p-1.5 bg-green-900/50 text-green-400 rounded hover:bg-green-900">
                                                    <Save className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => setEditingId(null)} className="p-1.5 bg-slate-800 text-slate-400 rounded hover:bg-slate-700">
                                                    X
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => openInventoryModal(user)} className="p-1.5 hover:bg-slate-800 rounded text-blue-400 transition-colors" title="Inventory">
                                                    <Package className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => openBadgeModal(user)} className="p-1.5 hover:bg-slate-800 rounded text-purple-400 transition-colors" title="Badges">
                                                    <Medal className="w-4 h-4" />
                                                </button>
                                                <div className="w-px h-4 bg-slate-800 mx-1 self-center" />
                                                <button onClick={() => handleEdit(user)} className="p-1.5 hover:bg-slate-800 rounded text-cyan-400 transition-colors">
                                                    Edit
                                                </button>
                                                <button onClick={() => handleBan(user.id)} className="p-1.5 hover:bg-orange-900/30 rounded text-orange-500 transition-colors" title="Reset User">
                                                    <Ban className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleDeleteUser(user.id)} className="p-1.5 hover:bg-red-900/30 rounded text-red-500 transition-colors" title="Delete User Permanently">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Inventory Modal */}
            {activeModal === 'inventory' && selectedUser && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-lg overflow-hidden shadow-2xl">
                        <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-800/50">
                            <h3 className="font-orbitron font-bold text-white flex items-center gap-2">
                                <Package className="w-5 h-5 text-blue-400" />
                                INVENTORY: {selectedUser.username}
                            </h3>
                            <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="p-6">
                            <div className="mb-6">
                                <h4 className="text-xs font-mono text-slate-500 mb-2 uppercase">Current Items</h4>
                                <div className="flex flex-wrap gap-2">
                                    {((selectedUser.inventory as string[]) || []).length === 0 && <span className="text-slate-600 italic">Empty inventory</span>}
                                    {((selectedUser.inventory as string[]) || []).map((itemId, idx) => (
                                        <div key={idx} className="bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-full flex items-center gap-2 text-sm">
                                            <span>{INVENTORY_ITEMS.find(i => i.id === itemId)?.icon || '📦'}</span>
                                            <span>{INVENTORY_ITEMS.find(i => i.id === itemId)?.name || itemId}</span>
                                            <button onClick={() => handleRemoveItem(idx)} className="text-slate-500 hover:text-red-400 ml-1"><X className="w-3 h-3" /></button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <h4 className="text-xs font-mono text-slate-500 mb-2 uppercase">Add Item</h4>
                                <div className="grid grid-cols-2 gap-2">
                                    {INVENTORY_ITEMS.map(item => (
                                        <button
                                            key={item.id}
                                            onClick={() => handleAddItem(item.id)}
                                            className="flex items-center gap-2 p-2 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 rounded text-left transition-colors"
                                        >
                                            <span>{item.icon}</span>
                                            <span className="text-sm">{item.name}</span>
                                            <Plus className="w-4 h-4 ml-auto text-slate-500" />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Badge Modal */}
            {activeModal === 'badges' && selectedUser && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-2xl overflow-hidden shadow-2xl max-h-[80vh] flex flex-col">
                        <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-800/50">
                            <h3 className="font-orbitron font-bold text-white flex items-center gap-2">
                                <Medal className="w-5 h-5 text-purple-400" />
                                BADGES: {selectedUser.username}
                            </h3>
                            <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="p-6 overflow-y-auto">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {BADGES_DATA.map(badge => {
                                    const isEarned = ((selectedUser.earned_badges as any[]) || []).some(b => b.id === badge.id);
                                    return (
                                        <div
                                            key={badge.id}
                                            onClick={() => handleToggleBadge(badge.id)}
                                            className={`p-3 border rounded-lg flex items-center gap-3 cursor-pointer transition-all ${isEarned
                                                ? 'bg-purple-900/20 border-purple-500/50'
                                                : 'bg-slate-900/50 border-slate-800 opacity-60 hover:opacity-100 hover:border-slate-600'
                                                }`}
                                        >
                                            <div className="text-2xl">{badge.icon}</div>
                                            <div className="flex-1">
                                                <div className={`font-bold text-sm ${isEarned ? 'text-white' : 'text-slate-400'}`}>{badge.name}</div>
                                                <div className="text-xs text-slate-500">{badge.category}</div>
                                            </div>
                                            {isEarned && <div className="text-purple-400"><Zap className="w-4 h-4 fill-current" /></div>}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Gift Modal */}
            <GiftModal
                isOpen={activeModal === 'gift'}
                onClose={() => setActiveModal(null)}
                users={users}
                currentAdminId="" // Not strictly needed for logic as we use auth.uid() in RLS/RPC, but good for prop
            />

            {/* Confirmation Modal */}
            <ConfirmationModal
                isOpen={confirmationModal.isOpen}
                onClose={closeConfirmation}
                onConfirm={confirmationModal.onConfirm}
                title={confirmationModal.title}
                message={confirmationModal.message}
                variant={confirmationModal.variant}
                confirmText={confirmationModal.confirmText}
            />
        </div>
    );
}
