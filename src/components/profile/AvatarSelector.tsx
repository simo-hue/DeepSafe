import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar } from '@/hooks/useAvatars';

interface AvatarSelectorProps {
    currentAvatarId: string | null;
    ownedAvatars: string[];
    onSelect: (avatarId: string) => void;
    isUpdating: boolean;
    avatars: Avatar[];
}

export function AvatarSelector({ currentAvatarId, ownedAvatars, onSelect, isUpdating, avatars }: AvatarSelectorProps) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {avatars.filter(avatar => ownedAvatars.includes(avatar.id) || avatar.is_default).map((avatar) => {
                const isSelected = currentAvatarId === avatar.id || (!currentAvatarId && avatar.is_default);

                return (
                    <motion.button
                        key={avatar.id}
                        onClick={() => onSelect(avatar.id)}
                        disabled={isUpdating}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={cn(
                            "relative group flex flex-col items-center p-4 rounded-xl border transition-all overflow-hidden",
                            isSelected
                                ? "bg-cyan-950/30 border-cyan-500 shadow-[0_0_15px_rgba(34,211,238,0.3)]"
                                : "bg-slate-900 border-slate-700 hover:border-cyan-500/50 hover:bg-slate-800"
                        )}
                    >
                        {/* Avatar Image */}
                        <div className={cn(
                            "relative w-20 h-20 rounded-full mb-3 overflow-hidden border-2",
                            isSelected ? "border-cyan-400" : "border-slate-600 group-hover:border-cyan-400/50"
                        )}>
                            <Image
                                src={avatar.src}
                                alt={avatar.name}
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            />

                            {/* Selected Overlay */}
                            {isSelected && (
                                <div className="absolute inset-0 bg-cyan-500/20 flex items-center justify-center">
                                    <Check className="w-8 h-8 text-cyan-400 drop-shadow-lg" strokeWidth={3} />
                                </div>
                            )}
                        </div>

                        {/* Info */}
                        <div className="text-center w-full">
                            <h3 className={cn(
                                "font-bold text-sm font-orbitron truncate w-full",
                                isSelected ? "text-cyan-400" : "text-white group-hover:text-cyan-200"
                            )}>
                                {avatar.name}
                            </h3>

                            <p className={cn(
                                "text-[10px] font-mono mt-1 capitalize",
                                avatar.rarity === 'legendary' ? "text-yellow-400" :
                                    avatar.rarity === 'epic' ? "text-purple-400" :
                                        avatar.rarity === 'rare' ? "text-blue-400" : "text-slate-400"
                            )}>
                                {avatar.rarity}
                            </p>
                        </div>

                        {/* Selection Indicator */}
                        {isSelected && (
                            <div className="absolute top-2 right-2 w-2 h-2 bg-cyan-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,211,238,1)]" />
                        )}
                    </motion.button>
                );
            })}
        </div>
    );
}
