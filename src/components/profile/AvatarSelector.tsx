import React from 'react';
import { motion } from 'framer-motion';
import { Lock, Check } from 'lucide-react';
import { AVATARS, Avatar } from '@/data/avatars';
import { cn } from '@/lib/utils';

interface AvatarSelectorProps {
    currentAvatarId: string | null;
    userLevel: number;
    onSelect: (avatarId: string) => void;
    isUpdating: boolean;
}

export function AvatarSelector({ currentAvatarId, userLevel, onSelect, isUpdating }: AvatarSelectorProps) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {AVATARS.map((avatar) => {
                const isLocked = userLevel < avatar.minLevel;
                const isSelected = currentAvatarId === avatar.id || (!currentAvatarId && avatar.id === 'avatar_rookie');

                return (
                    <motion.button
                        key={avatar.id}
                        onClick={() => !isLocked && onSelect(avatar.id)}
                        disabled={isLocked || isUpdating}
                        whileHover={!isLocked ? { scale: 1.05 } : {}}
                        whileTap={!isLocked ? { scale: 0.95 } : {}}
                        className={cn(
                            "relative group flex flex-col items-center p-4 rounded-xl border transition-all overflow-hidden",
                            isSelected
                                ? "bg-cyan-950/30 border-cyan-500 shadow-[0_0_15px_rgba(34,211,238,0.3)]"
                                : isLocked
                                    ? "bg-slate-900/50 border-slate-800 opacity-60 cursor-not-allowed"
                                    : "bg-slate-900 border-slate-700 hover:border-cyan-500/50 hover:bg-slate-800"
                        )}
                    >
                        {/* Avatar Image */}
                        <div className={cn(
                            "relative w-20 h-20 rounded-full mb-3 overflow-hidden border-2",
                            isSelected ? "border-cyan-400" : isLocked ? "border-slate-700 grayscale" : "border-slate-600 group-hover:border-cyan-400/50"
                        )}>
                            <img
                                src={avatar.src}
                                alt={avatar.name}
                                className="w-full h-full object-cover"
                            />

                            {/* Lock Overlay */}
                            {isLocked && (
                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                    <Lock className="w-8 h-8 text-slate-400" />
                                </div>
                            )}

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
                                isSelected ? "text-cyan-400" : isLocked ? "text-slate-500" : "text-white group-hover:text-cyan-200"
                            )}>
                                {avatar.name}
                            </h3>

                            {isLocked ? (
                                <p className="text-[10px] text-red-400 font-mono mt-1">
                                    Lvl {avatar.minLevel} Required
                                </p>
                            ) : (
                                <p className={cn(
                                    "text-[10px] font-mono mt-1 capitalize",
                                    avatar.rarity === 'legendary' ? "text-yellow-400" :
                                        avatar.rarity === 'epic' ? "text-purple-400" :
                                            avatar.rarity === 'rare' ? "text-blue-400" : "text-slate-400"
                                )}>
                                    {avatar.rarity}
                                </p>
                            )}
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
