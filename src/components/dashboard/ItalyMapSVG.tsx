import React from 'react';
import { motion } from 'framer-motion';
import { Province, provincesData } from '@/data/provincesData';
import ProvincePath from './ProvincePath';

interface ItalyMapSVGProps {
    provinces: Province[];
    onProvinceClick: (province: Province) => void;
    onProvinceHover: (province: Province | null) => void;
    viewBox: string;
    activeRegion: string | null;
    highlightedId: string | null; // Can be Region Name (Level 1) or Province ID (Level 2)
}

const ItalyMapSVG: React.FC<ItalyMapSVGProps> = ({
    provinces,
    onProvinceClick,
    onProvinceHover,
    viewBox,
    activeRegion,
    highlightedId
}) => {
    // Group provinces by region for National View
    const regions = React.useMemo(() => {
        const groups: Record<string, Province[]> = {};
        provinces.forEach(p => {
            if (!groups[p.region]) groups[p.region] = [];
            groups[p.region].push(p);
        });
        return groups;
    }, [provinces]);

    return (
        <>
            {/* Grid Background Effect */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20 pointer-events-none" />

            <motion.svg
                viewBox={viewBox}
                className="w-full h-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, viewBox }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
                preserveAspectRatio="xMidYMid meet"
            >
                <defs>
                    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="5" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                </defs>

                {/* LEVEL 1: NATIONAL VIEW (Regions) */}
                {!activeRegion && Object.entries(regions).map(([regionName, provinces]) => (
                    <g
                        key={regionName}
                        className="cursor-pointer"
                    >
                        {provinces.map((province) => (
                            <ProvincePath
                                key={province.id}
                                province={province}
                                onProvinceClick={onProvinceClick}
                                onProvinceHover={onProvinceHover}
                                isRegionMode={false}
                                isRegionHovered={highlightedId === regionName}
                                isProvinceHighlighted={false} // No individual highlight in Level 1
                            />
                        ))}
                    </g>
                ))}

                {/* LEVEL 2: REGIONAL VIEW (Provinces) */}
                {activeRegion && provinces
                    .filter(p => p.region === activeRegion)
                    .map((province) => (
                        <ProvincePath
                            key={province.id}
                            province={province}
                            onProvinceClick={onProvinceClick}
                            onProvinceHover={onProvinceHover}
                            isRegionMode={true}
                            isRegionHovered={false}
                            isProvinceHighlighted={highlightedId === province.id}
                        />
                    ))
                }
            </motion.svg>
        </>
    );
};

export default ItalyMapSVG;
