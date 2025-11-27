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
        <div className="grid grid-cols-2 gap-3">
            {avatars.filter(avatar => ownedAvatars.includes(avatar.id) || avatar.is_default).map((avatar) => {
                const isSelected = currentAvatarId === avatar.id || (!currentAvatarId && avatar.is_default);

                return (
                    <motion.button
                        key={avatar.id}
                        onClick={() => onSelect(avatar.id)}
                        disabled={isUpdating}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={cn(
                            "relative group flex flex-row items-center gap-3 p-3 rounded-xl border transition-all overflow-hidden text-left",
                            isSelected
                                ? "bg-cyan-950/30 border-cyan-500 shadow-[0_0_15px_rgba(34,211,238,0.3)]"
                                : "bg-slate-900 border-slate-700 hover:border-cyan-500/50 hover:bg-slate-800"
                        )}
                    >
                        {/* Avatar Image */}
                        <div className={cn(
                            "relative w-12 h-12 rounded-full overflow-hidden border-2 shrink-0",
                            isSelected ? "border-cyan-400" : "border-slate-600 group-hover:border-cyan-400/50"
                        )}>
                            <Image
                                src={avatar.src}
                                alt={avatar.name}
                                fill
                                className="object-cover"
                                sizes="48px"
                            />

                            {/* Selected Overlay */}
                            {isSelected && (
                                <div className="absolute inset-0 bg-cyan-500/20 flex items-center justify-center">
                                    <Check className="w-5 h-5 text-cyan-400 drop-shadow-lg" strokeWidth={3} />
                                </div>
                            )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                            <h3 className={cn(
                                "font-bold text-xs font-orbitron truncate w-full",
                                isSelected ? "text-cyan-400" : "text-white group-hover:text-cyan-200"
                            )}>
                                {avatar.name}
                            </h3>

                            <p className={cn(
                                "text-[9px] font-mono capitalize",
                                avatar.rarity === 'legendary' ? "text-yellow-400" :
                                    avatar.rarity === 'epic' ? "text-purple-400" :
                                        avatar.rarity === 'rare' ? "text-blue-400" : "text-slate-400"
                            )}>
                                {avatar.rarity}
                            </p>
                        </div>

                        {/* Selection Indicator */}
                        {isSelected && (
                            <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-cyan-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,211,238,1)]" />
                        )}
                    </motion.button>
                );
            })}
        </div>
    );
}
