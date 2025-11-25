import React from 'react';
import { Flame, Heart, Trophy } from 'lucide-react';
import { motion } from 'framer-motion';

interface TopBarProps {
    // No props needed for now
}

const TopBar: React.FC<TopBarProps> = () => {
    return (
        <div className="absolute top-0 left-0 w-full p-4 z-10 flex flex-col gap-3 pointer-events-none">

            {/* ROW 1: Rank, Streak & Hearts */}
            <div className="flex justify-between items-start w-full">
                <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="flex items-center gap-3 pointer-events-auto"
                >
                    {/* Rank Widget */}
                    <div className="bg-black/40 backdrop-blur-md border border-cyber-gray/30 rounded-2xl p-2 pr-4 flex items-center gap-3 shadow-lg group hover:border-amber-500/50 transition-all duration-300">
                        <div className="bg-gradient-to-br from-amber-500/20 to-amber-700/20 p-2 rounded-xl border border-amber-500/30">
                            <Trophy className="w-5 h-5 text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
                        </div>
                        <div>
                            <div className="text-[9px] text-zinc-400 uppercase font-bold tracking-widest font-mono">Classifica</div>
                            <div className="text-sm font-bold font-orbitron text-white group-hover:text-amber-400 transition-colors">#4</div>
                        </div>
                    </div>

                    {/* Streak Widget */}
                    <div className="bg-black/40 backdrop-blur-md border border-cyber-gray/30 rounded-2xl p-2 pr-4 flex items-center gap-3 shadow-lg group hover:border-orange-500/50 transition-all duration-300">
                        <div className="bg-gradient-to-br from-orange-500/20 to-red-600/20 p-2 rounded-xl border border-orange-500/30">
                            <Flame className="w-5 h-5 text-orange-500 fill-orange-500/20 animate-pulse drop-shadow-[0_0_8px_rgba(249,115,22,0.5)]" />
                        </div>
                        <div>
                            <div className="text-[9px] text-zinc-400 uppercase font-bold tracking-widest font-mono">Serie</div>
                            <div className="text-sm font-bold font-orbitron text-white group-hover:text-orange-400 transition-colors">4</div>
                        </div>
                    </div>

                    {/* Hearts Widget */}
                    <div className="bg-black/40 backdrop-blur-md border border-cyber-gray/30 rounded-2xl p-2 pr-4 flex items-center gap-3 shadow-lg group hover:border-red-500/50 transition-all duration-300">
                        <div className="bg-gradient-to-br from-red-500/20 to-pink-600/20 p-2 rounded-xl border border-red-500/30">
                            <Heart className="w-5 h-5 text-red-500 fill-red-500/20 animate-pulse drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                        </div>
                        <div>
                            <div className="text-[9px] text-zinc-400 uppercase font-bold tracking-widest font-mono">Cuori</div>
                            <div className="text-sm font-bold font-orbitron text-white group-hover:text-red-400 transition-colors">5</div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* ROW 2: Progress */}
            <div className="flex justify-center items-center w-full mt-2">
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="flex flex-col items-center w-full max-w-md pointer-events-auto"
                >
                    {/* Label & Value */}
                    <div className="flex justify-between w-full px-2 mb-1">
                        <span className="text-[9px] text-cyber-blue/80 font-mono tracking-[0.2em] uppercase">Sincronizzazione</span>
                        <span className="text-[10px] text-white font-orbitron font-bold text-glow">0/107 • 0%</span>
                    </div>

                    {/* Bar Container with Brackets */}
                    <div className="relative w-full flex items-center gap-2">
                        {/* Left Bracket */}
                        <div className="h-3 w-1 border-l border-t border-b border-cyber-blue/50 rounded-l-sm" />

                        {/* The Bar */}
                        <div className="flex-1 h-1 bg-black/60 rounded-full overflow-hidden relative">
                            {/* Background Grid Pattern in Bar */}
                            <div className="absolute inset-0 opacity-30 bg-[repeating-linear-gradient(90deg,transparent,transparent_2px,#000_2px,#000_4px)]" />

                            <motion.div
                                className="h-full bg-gradient-to-r from-cyber-blue via-cyan-400 to-white shadow-[0_0_15px_rgba(102,252,241,0.6)] relative"
                                initial={{ width: 0 }}
                                animate={{ width: '0%' }}
                                transition={{ duration: 1.5, ease: "circOut", delay: 0.5 }}
                            >
                                {/* Leading Edge Flare */}
                                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-3 bg-white blur-[2px]" />
                            </motion.div>
                        </div>

                        {/* Right Bracket */}
                        <div className="h-3 w-1 border-r border-t border-b border-cyber-blue/50 rounded-r-sm" />
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default TopBar;
