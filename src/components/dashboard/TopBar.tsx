import React from 'react';
import { Flame, Heart, Trophy } from 'lucide-react';
import { motion } from 'framer-motion';
import { useUserStore } from '@/store/useUserStore';

interface TopBarProps {
    progress: number;
    total: number;
    className?: string;
}

const TopBar: React.FC<TopBarProps> = ({ progress, total, className = "" }) => {
    const { xp, streak, lives } = useUserStore();
    const percentage = Math.round((progress / total) * 100) || 0;

    return (
        <div className={`absolute top-0 left-0 w-full p-4 z-30 flex flex-col gap-3 pointer-events-none ${className}`}>

            {/* Main Stats Bar */}
            <div className="flex justify-center w-full">
                <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="relative flex items-center gap-2 pointer-events-auto bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-full p-1.5 pr-6 shadow-2xl"
                >
                    {/* Rank Widget */}
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/50 border border-slate-700/50">
                        <Trophy className="w-3.5 h-3.5 text-amber-500" />
                        <span className="text-xs font-bold font-orbitron text-slate-200">#{Math.floor(xp / 1000) + 1}</span>
                    </div>

                    {/* Streak Widget */}
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/50 border border-slate-700/50">
                        <Flame className="w-3.5 h-3.5 text-orange-500" />
                        <span className="text-xs font-bold font-orbitron text-slate-200">{streak}</span>
                    </div>

                    {/* Hearts Widget */}
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/50 border border-slate-700/50">
                        <Heart className={`w-3.5 h-3.5 ${lives > 0 ? 'text-red-500 fill-red-500' : 'text-slate-600'}`} />
                        <span className="text-xs font-bold font-orbitron text-slate-200">{lives}</span>
                    </div>

                    {/* Divider */}
                    <div className="w-px h-4 bg-slate-700 mx-1" />

                    {/* Progress Text (Subtle) */}
                    <div className="flex flex-col items-end leading-none">
                        <span className="text-[10px] font-bold font-orbitron text-cyan-400">{percentage}%</span>
                        <span className="text-[8px] text-slate-500 font-mono">{progress}/{total}</span>
                    </div>

                    {/* Progress Line (Attached to bottom) */}
                    <div className="absolute bottom-0 left-6 right-6 h-[2px] bg-slate-800 rounded-full overflow-hidden translate-y-[50%]">
                        <motion.div
                            className="h-full bg-cyan-500 shadow-[0_0_10px_#06b6d4]"
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ duration: 1, ease: "circOut" }}
                        />
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default TopBar;
