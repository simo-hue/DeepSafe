'use client';

import React, { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { Database } from '@/types/supabase';
import { useRouter } from 'next/navigation';
import { Shield, Plus, Save, Trash2, X, Upload, Image as ImageIcon, Loader2 } from 'lucide-react';
import Image from 'next/image';

// Initialize Supabase Client
const supabase = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Avatar = Database['public']['Tables']['avatars']['Row'];

export default function AdminAvatarsPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [avatars, setAvatars] = useState<Avatar[]>([]);
    const [isEditing, setIsEditing] = useState(false);
    const [currentAvatar, setCurrentAvatar] = useState<Partial<Avatar>>({});
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        checkAdminAndFetchAvatars();
    }, []);

    const checkAdminAndFetchAvatars = async () => {
        setIsLoading(true);
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            router.push('/');
            return;
        }

        // Check admin
        const { data: profile } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', user.id)
            .single();

        if (!profile?.is_admin) {
            router.push('/');
            return;
        }

        fetchAvatars();
    };

    const fetchAvatars = async () => {
        const { data, error } = await supabase
            .from('avatars')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching avatars:', error);
        } else {
            setAvatars(data || []);
        }
        setIsLoading(false);
    };

    const handleImageUpload = async (file: File): Promise<string | null> => {
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file);

            if (uploadError) {
                throw uploadError;
            }

            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);

            return publicUrl;
        } catch (error) {
            console.error('Error uploading image:', error);
            alert('Error uploading image');
            return null;
        }
    };

    const handleSave = async () => {
        if (!currentAvatar.name || !currentAvatar.rarity || (!currentAvatar.src && !imageFile)) {
            alert('Please fill in all required fields');
            return;
        }

        setUploading(true);
        let src = currentAvatar.src;

        if (imageFile) {
            const uploadedUrl = await handleImageUpload(imageFile);
            if (uploadedUrl) {
                src = uploadedUrl;
            } else {
                setUploading(false);
                return;
            }
        }

        const avatarData = {
            ...currentAvatar,
            src,
            id: currentAvatar.id || `avatar_${Math.random().toString(36).substring(2, 9)}`,
        };

        const { error } = await supabase
            .from('avatars')
            .upsert(avatarData as Avatar);

        if (error) {
            console.error('Error saving avatar:', error);
            alert('Error saving avatar');
        } else {
            setIsEditing(false);
            setCurrentAvatar({});
            setImageFile(null);
            fetchAvatars();
        }
        setUploading(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this avatar?')) return;

        const { error } = await supabase
            .from('avatars')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting avatar:', error);
            alert('Error deleting avatar');
        } else {
            fetchAvatars();
        }
    };

    const openEdit = (avatar?: Avatar) => {
        if (avatar) {
            setCurrentAvatar(avatar);
        } else {
            setCurrentAvatar({
                rarity: 'common',
                is_default: false
            });
        }
        setImageFile(null);
        setIsEditing(true);
    };

    if (isLoading) {
        return <div className="min-h-screen bg-black flex items-center justify-center text-cyan-500 font-mono">LOADING AVATAR DATABASE...</div>;
    }

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 font-sans p-8 pb-24">
            <header className="flex items-center justify-between mb-8 border-b border-slate-800 pb-4">
                <div className="flex items-center gap-4">
                    <Shield className="w-10 h-10 text-pink-500" />
                    <div>
                        <h1 className="text-3xl font-bold text-white font-orbitron tracking-wider">AVATAR MANAGEMENT</h1>
                        <p className="text-slate-500 font-mono text-sm">IDENTITY DATABASE CONTROL</p>
                    </div>
                </div>
                <button
                    onClick={() => router.push('/admin')}
                    className="px-4 py-2 bg-slate-900 border border-slate-700 rounded hover:bg-slate-800 transition-colors text-sm font-mono"
                >
                    BACK TO DASHBOARD
                </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Create New Card */}
                <button
                    onClick={() => openEdit()}
                    className="bg-slate-900/50 border-2 border-dashed border-slate-800 rounded-xl p-6 flex flex-col items-center justify-center gap-4 hover:border-pink-500/50 hover:bg-slate-900 transition-all group min-h-[300px]"
                >
                    <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center group-hover:bg-pink-900/20 transition-colors">
                        <Plus className="w-8 h-8 text-slate-600 group-hover:text-pink-500" />
                    </div>
                    <span className="font-orbitron font-bold text-slate-500 group-hover:text-pink-400">CREATE NEW AVATAR</span>
                </button>

                {/* Avatar Cards */}
                {avatars.map((avatar) => (
                    <div key={avatar.id} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden group hover:border-pink-500/30 transition-all">
                        <div className="relative h-48 bg-slate-950 flex items-center justify-center overflow-hidden">
                            {avatar.src ? (
                                <Image
                                    src={avatar.src}
                                    alt={avatar.name}
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                            ) : (
                                <ImageIcon className="w-12 h-12 text-slate-700" />
                            )}
                            <div className="absolute top-2 right-2 bg-black/60 backdrop-blur px-2 py-1 rounded text-[10px] font-mono uppercase border border-white/10">
                                {avatar.rarity}
                            </div>
                            {avatar.is_default && (
                                <div className="absolute top-2 left-2 bg-cyan-900/80 backdrop-blur px-2 py-1 rounded text-[10px] font-mono uppercase text-cyan-400 border border-cyan-500/30">
                                    DEFAULT
                                </div>
                            )}
                        </div>
                        <div className="p-4">
                            <h3 className="font-bold text-white font-orbitron truncate">{avatar.name}</h3>
                            <p className="text-xs text-slate-500 font-mono mb-4 truncate">{avatar.id}</p>
                            <p className="text-sm text-slate-400 line-clamp-2 mb-4 h-10">{avatar.description}</p>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => openEdit(avatar)}
                                    className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 rounded text-xs font-bold transition-colors"
                                >
                                    EDIT
                                </button>
                                <button
                                    onClick={() => handleDelete(avatar.id)}
                                    className="px-3 py-2 bg-red-900/20 hover:bg-red-900/40 text-red-400 rounded transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Edit Modal */}
            {isEditing && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-lg overflow-hidden shadow-2xl">
                        <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-800/50">
                            <h3 className="font-orbitron font-bold text-white">
                                {currentAvatar.id ? 'EDIT AVATAR' : 'NEW AVATAR'}
                            </h3>
                            <button onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
                        </div>

                        <div className="p-6 space-y-4">
                            {/* Image Upload */}
                            <div className="flex justify-center mb-6">
                                <div className="relative w-32 h-32 rounded-full overflow-hidden bg-slate-950 border-2 border-dashed border-slate-700 hover:border-pink-500 group cursor-pointer">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                                        className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                    />
                                    {imageFile ? (
                                        <img src={URL.createObjectURL(imageFile)} alt="Preview" className="w-full h-full object-cover" />
                                    ) : currentAvatar.src ? (
                                        <img src={currentAvatar.src} alt="Current" className="w-full h-full object-cover opacity-50 group-hover:opacity-100 transition-opacity" />
                                    ) : (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500">
                                            <Upload className="w-8 h-8 mb-2" />
                                            <span className="text-[10px]">UPLOAD</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-mono text-slate-500 mb-1">ID (Auto if empty)</label>
                                    <input
                                        type="text"
                                        value={currentAvatar.id || ''}
                                        onChange={(e) => setCurrentAvatar({ ...currentAvatar, id: e.target.value })}
                                        placeholder="avatar_unique_id"
                                        className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-sm text-white focus:border-pink-500 outline-none"
                                        disabled={!!currentAvatar.created_at} // Disable ID edit for existing
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-mono text-slate-500 mb-1">Rarity</label>
                                    <select
                                        value={currentAvatar.rarity || 'common'}
                                        onChange={(e) => setCurrentAvatar({ ...currentAvatar, rarity: e.target.value as any })}
                                        className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-sm text-white focus:border-pink-500 outline-none"
                                    >
                                        <option value="common">Common</option>
                                        <option value="rare">Rare</option>
                                        <option value="epic">Epic</option>
                                        <option value="legendary">Legendary</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-mono text-slate-500 mb-1">Name</label>
                                <input
                                    type="text"
                                    value={currentAvatar.name || ''}
                                    onChange={(e) => setCurrentAvatar({ ...currentAvatar, name: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-sm text-white focus:border-pink-500 outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-mono text-slate-500 mb-1">Description</label>
                                <textarea
                                    value={currentAvatar.description || ''}
                                    onChange={(e) => setCurrentAvatar({ ...currentAvatar, description: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-sm text-white focus:border-pink-500 outline-none h-20 resize-none"
                                />
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="isDefault"
                                    checked={currentAvatar.is_default || false}
                                    onChange={(e) => setCurrentAvatar({ ...currentAvatar, is_default: e.target.checked })}
                                    className="rounded bg-slate-950 border-slate-800 text-pink-500 focus:ring-pink-500"
                                />
                                <label htmlFor="isDefault" className="text-sm text-slate-400">Is Default (Unlocked for everyone)</label>
                            </div>

                            <button
                                onClick={handleSave}
                                disabled={uploading}
                                className="w-full py-3 bg-pink-600 hover:bg-pink-500 text-white font-bold rounded-lg transition-all shadow-[0_0_15px_rgba(236,72,153,0.3)] flex items-center justify-center gap-2 mt-4"
                            >
                                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                SAVE AVATAR
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
