import React from 'react';
import { motion } from 'framer-motion';
import { Province, provincesData } from '@/data/provincesData';
import ProvincePath from './ProvincePath';

interface ItalyMapSVGProps {
    onProvinceClick: (province: Province) => void;
    onProvinceHover: (province: Province | null) => void;
    viewBox: string;
    activeRegion: string | null;
    highlightedId: string | null; // Can be Region Name (Level 1) or Province ID (Level 2)
}

const ItalyMapSVG: React.FC<ItalyMapSVGProps> = ({
    onProvinceClick,
    onProvinceHover,
    viewBox,
    activeRegion,
    highlightedId
}) => {
    // Filter provinces if a region is active (Level 2)
    // Actually, we can just render all and let the viewBox handle the zoom, 
    // BUT rendering only the active region's provinces is cleaner and avoids artifacts outside the view.
    // However, keeping all allows for smoother transitions if we animate the viewBox.
    // Let's keep all for now to keep it simple, or filter if performance is an issue.
    // Given the requirement "render ONLY that specific Region", I should filter.

    const visibleProvinces = activeRegion
        ? provincesData.filter(p => p.region === activeRegion)
        : provincesData;

    return (
        <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-slate-950/50 rounded-xl border border-slate-800/50 backdrop-blur-sm shadow-2xl">
            {/* Grid Background Effect */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20 pointer-events-none" />

            <motion.svg
                viewBox={viewBox}
                className="w-full h-full max-w-4xl max-h-[80vh]"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1, viewBox }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
            >
                <defs>
                    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="5" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                </defs>

                {/* Render Provinces */}
                {visibleProvinces.map((province) => (
                    <ProvincePath
                        key={province.id}
                        province={province}
                        onProvinceClick={onProvinceClick}
                        onProvinceHover={onProvinceHover}
                        isRegionMode={!!activeRegion}
                        isRegionHovered={!activeRegion && highlightedId === province.region}
                        isProvinceHighlighted={!!activeRegion && highlightedId === province.id}
                    />
                ))}
            </motion.svg>

            {/* Decorative Elements */}
            <div className="absolute bottom-4 right-4 text-slate-500 text-xs font-mono">
                {activeRegion ? `REGION: ${activeRegion}` : 'VIEW: NATIONAL'}
            </div>
        </div>
    );
};

export default ItalyMapSVG;
