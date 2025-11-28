import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAvatars } from '@/hooks/useAvatars';
import { X, Gift, Coins, Zap, Package, Check, Loader2, Users } from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';
import { Database } from '@/types/supabase';
import { ConfirmationModal } from './ConfirmationModal';

const supabase = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Profile {
    id: string;
    username: string | null;
    avatar_url: string | null;
}

interface GiftModalProps {
    isOpen: boolean;
    onClose: () => void;
    users: Profile[];
    currentAdminId: string;
}

type GiftType = 'credits' | 'xp' | 'hearts' | 'avatar';

export function GiftModal({ isOpen, onClose, users, currentAdminId }: GiftModalProps) {
    const [selectedUserId, setSelectedUserId] = useState<string>('all');
    const [giftType, setGiftType] = useState<GiftType>('credits');
    const [amount, setAmount] = useState<number>(100);
    const [itemId, setItemId] = useState<string>('');
    const [iconUrl, setIconUrl] = useState<string>('');
    const [iconType, setIconType] = useState<'preset' | 'emoji'>('preset');
    const [message, setMessage] = useState('UN REGALO DAI FOUNDER');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const { avatars } = useAvatars();
    const [confirmationModal, setConfirmationModal] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
    }>({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { },
    });

    const handleSendGift = async () => {
        setLoading(true);
        try {
            const targets = selectedUserId === 'all'
                ? users.map(u => u.id)
                : [selectedUserId];

            // We'll execute these in parallel or sequence. 
            // Since we don't have a bulk insert RPC for gifts yet, we'll loop.
            // For a production app with many users, this should be a single RPC call.

            const promises = targets.map(uid =>
                (supabase.rpc as any)('send_gift', {
                    target_user_id: uid,
                    gift_type: giftType,
                    gift_amount: amount,
                    gift_message: message,
                    gift_item_id: giftType === 'avatar' ? itemId : null,
                    gift_icon_url: iconUrl || null
                })
            );

            await Promise.all(promises);

            setSuccess(true);
            setTimeout(() => {
                setSuccess(false);
                onClose();
            }, 2000);
        } catch (error) {
            console.error('Error sending gifts:', error);
            alert('Errore durante l\'invio dei regali.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        key="gift-modal-backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                        onClick={onClose}
                    >
                        <motion.div
                            key="gift-modal-content"
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-slate-900 border border-cyan-500/30 rounded-xl w-full max-w-lg overflow-hidden shadow-[0_0_50px_rgba(6,182,212,0.2)]"
                            onClick={e => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="p-6 border-b border-slate-800 bg-slate-800/50 flex justify-between items-center">
                                <h3 className="text-xl font-bold font-orbitron text-white flex items-center gap-3">
                                    <Gift className="w-6 h-6 text-cyan-400" />
                                    INVIA REGALO
                                </h3>
                                <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            {/* Body */}
                            <div className="p-6 space-y-6">
                                {success ? (
                                    <div className="flex flex-col items-center justify-center py-10 space-y-4 text-green-400">
                                        <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
                                            <Check className="w-8 h-8" />
                                        </div>
                                        <p className="font-bold font-orbitron text-lg">REGALI INVIATI CON SUCCESSO!</p>
                                    </div>
                                ) : (
                                    <>
                                        {/* Recipient Selector */}
                                        <div className="space-y-2">
                                            <label className="text-xs font-mono text-slate-500 uppercase">Destinatario</label>
                                            <select
                                                value={selectedUserId}
                                                onChange={(e) => setSelectedUserId(e.target.value)}
                                                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-cyan-500 focus:outline-none"
                                            >
                                                <option value="all">TUTTI GLI UTENTI ({users.length})</option>
                                                {users.map(user => (
                                                    <option key={user.id} value={user.id}>
                                                        {user.username || 'Sconosciuto'} ({user.id.substring(0, 8)}...)
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Gift Type */}
                                        <div className="grid grid-cols-4 gap-3">
                                            <button
                                                onClick={() => setGiftType('credits')}
                                                className={`p-3 rounded-lg border flex flex-col items-center gap-2 transition-all ${giftType === 'credits'
                                                    ? 'bg-yellow-500/20 border-yellow-500 text-yellow-400'
                                                    : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-800'
                                                    }`}
                                            >
                                                <Coins className="w-6 h-6" />
                                                <span className="text-xs font-bold">CREDITI</span>
                                            </button>
                                            <button
                                                onClick={() => setGiftType('xp')}
                                                className={`p-3 rounded-lg border flex flex-col items-center gap-2 transition-all ${giftType === 'xp'
                                                    ? 'bg-purple-500/20 border-purple-500 text-purple-400'
                                                    : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-800'
                                                    }`}
                                            >
                                                <Zap className="w-6 h-6" />
                                                <span className="text-xs font-bold">XP</span>
                                            </button>
                                            <button
                                                onClick={() => setGiftType('hearts')}
                                                className={`p-3 rounded-lg border flex flex-col items-center gap-2 transition-all ${giftType === 'hearts'
                                                    ? 'bg-red-500/20 border-red-500 text-red-400'
                                                    : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-800'
                                                    }`}
                                            >
                                                <div className="text-xl">❤️</div>
                                                <span className="text-xs font-bold">VITE</span>
                                            </button>
                                            <button
                                                onClick={() => setGiftType('avatar')}
                                                className={`p-3 rounded-lg border flex flex-col items-center gap-2 transition-all ${giftType === 'avatar'
                                                    ? 'bg-purple-500/20 border-purple-500 text-purple-400'
                                                    : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-800'
                                                    }`}
                                            >
                                                <div className="text-xl">👤</div>
                                                <span className="text-xs font-bold">AVATAR</span>
                                            </button>
                                        </div>

                                        {/* Avatar Selection */}
                                        {giftType === 'avatar' && (
                                            <div className="space-y-2">
                                                <label className="text-xs font-mono text-slate-500 uppercase">Seleziona Avatar</label>
                                                <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                                                    {avatars.map((avatar) => (
                                                        <button
                                                            key={avatar.id}
                                                            onClick={() => {
                                                                setItemId(avatar.id);
                                                                setIconUrl(avatar.src);
                                                                setIconType('preset'); // Force preset so it uses the URL
                                                            }}
                                                            className={`p-2 rounded-lg border flex flex-col items-center gap-1 transition-all ${itemId === avatar.id
                                                                ? 'bg-purple-500/20 border-purple-500'
                                                                : 'bg-slate-950 border-slate-800 hover:border-slate-600'
                                                                }`}
                                                        >
                                                            <img
                                                                src={avatar.src}
                                                                alt={avatar.name}
                                                                className="w-10 h-10 object-contain rounded-full bg-black"
                                                            />
                                                            <span className="text-[10px] text-slate-400 truncate w-full text-center">{avatar.name}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Amount / Item ID */}
                                        <div className="space-y-2">
                                            <label className="text-xs font-mono text-slate-500 uppercase">
                                                {giftType === 'avatar' ? 'ID Avatar (solo per debug)' : 'Quantità'}
                                            </label>
                                            {giftType === 'avatar' ? (
                                                <input
                                                    type="text"
                                                    value={itemId}
                                                    readOnly
                                                    placeholder="Seleziona un avatar dalla lista"
                                                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-slate-400 font-mono text-sm cursor-not-allowed focus:outline-none"
                                                />
                                            ) : (
                                                <input
                                                    type="number"
                                                    value={amount}
                                                    onChange={(e) => setAmount(parseInt(e.target.value))}
                                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-cyan-500 focus:outline-none font-mono text-lg"
                                                />
                                            )}
                                        </div>

                                        {/* Icon Selection */}
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <label className="text-xs font-mono text-slate-500 uppercase">Icona Regalo</label>
                                                <div className="flex bg-slate-950 rounded-lg p-1 border border-slate-800">
                                                    <button
                                                        onClick={() => setIconType('preset')}
                                                        className={`px-3 py-1 rounded text-xs font-bold transition-all ${iconType === 'preset' ? 'bg-cyan-900/50 text-cyan-400' : 'text-slate-500 hover:text-slate-300'}`}
                                                    >
                                                        PRESET
                                                    </button>
                                                    <button
                                                        onClick={() => setIconType('emoji')}
                                                        className={`px-3 py-1 rounded text-xs font-bold transition-all ${iconType === 'emoji' ? 'bg-purple-900/50 text-purple-400' : 'text-slate-500 hover:text-slate-300'}`}
                                                    >
                                                        EMOJI
                                                    </button>
                                                </div>
                                            </div>

                                            {iconType === 'preset' ? (
                                                <div className="grid grid-cols-4 gap-2">
                                                    {[
                                                        { id: 'coins', src: '/icons/gift-coins.png', label: 'Coins' },
                                                        { id: 'box', src: '/icons/gift-box.png', label: 'Box' },
                                                        { id: 'xp', src: '/icons/gift-xp.png', label: 'XP' }, // Placeholder, maybe use emoji or generic if missing
                                                        { id: 'trophy', src: '/icons/gift-trophy.png', label: 'Trophy' } // Placeholder
                                                    ].map((icon) => (
                                                        <button
                                                            key={icon.id}
                                                            onClick={() => setIconUrl(icon.src)}
                                                            className={`p-2 rounded-lg border flex flex-col items-center gap-1 transition-all ${iconUrl === icon.src
                                                                ? 'bg-cyan-500/20 border-cyan-500'
                                                                : 'bg-slate-950 border-slate-800 hover:border-slate-600'
                                                                }`}
                                                        >
                                                            <img
                                                                src={icon.src}
                                                                alt={icon.label}
                                                                className="w-8 h-8 object-contain"
                                                                onError={(e) => {
                                                                    // Fallback if image missing
                                                                    e.currentTarget.style.display = 'none';
                                                                    e.currentTarget.parentElement!.innerHTML = '<span>❓</span>';
                                                                }}
                                                            />
                                                        </button>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="flex gap-2">
                                                    <input
                                                        type="text"
                                                        value={iconUrl}
                                                        onChange={(e) => setIconUrl(e.target.value)}
                                                        placeholder="Inserisci Emoji (es. 🎁, 🚀, 💎)"
                                                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-cyan-500 focus:outline-none text-2xl text-center"
                                                        maxLength={2}
                                                    />
                                                </div>
                                            )}
                                        </div>

                                        {/* Message */}
                                        <div className="space-y-2">
                                            <label className="text-xs font-mono text-slate-500 uppercase">Messaggio</label>
                                            <input
                                                type="text"
                                                value={message}
                                                onChange={(e) => setMessage(e.target.value)}
                                                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-cyan-500 focus:outline-none"
                                            />
                                        </div>

                                        {/* Action Button */}
                                        <button
                                            onClick={() => {
                                                setConfirmationModal({
                                                    isOpen: true,
                                                    title: 'Invia Regalo',
                                                    message: `Stai per inviare ${amount} ${giftType} a ${selectedUserId === 'all' ? 'TUTTI gli utenti' : 'questo utente'}. Confermi?`,
                                                    onConfirm: handleSendGift
                                                });
                                            }}
                                            disabled={loading || (giftType === 'avatar' && !itemId)}
                                            className="w-full py-4 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-lg text-white font-bold font-orbitron tracking-widest hover:from-cyan-500 hover:to-blue-500 transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                        >
                                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Gift className="w-5 h-5" />}
                                            INVIA REGALO
                                        </button>
                                    </>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <ConfirmationModal
                isOpen={confirmationModal.isOpen}
                onClose={() => setConfirmationModal(prev => ({ ...prev, isOpen: false }))}
                onConfirm={() => {
                    confirmationModal.onConfirm();
                    setConfirmationModal(prev => ({ ...prev, isOpen: false }));
                }}
                title={confirmationModal.title}
                message={confirmationModal.message}
                confirmText="INVIA ORA"
                variant="success"
            />
        </>
    );
}
