import React from 'react';
import { motion } from 'framer-motion';
import { Province } from '@/data/provincesData';
import { cn } from '@/lib/utils';

interface ProvincePathProps {
    province: Province;
    onProvinceClick: (province: Province) => void;
    onProvinceHover?: (province: Province | null) => void;
    isRegionMode: boolean;
    isRegionHovered: boolean;
    isProvinceHighlighted: boolean;
}

const ProvincePath: React.FC<ProvincePathProps> = ({
    province,
    onProvinceClick,
    onProvinceHover,
    isRegionMode,
    isRegionHovered,
    isProvinceHighlighted
}) => {
    const { status, path } = province;

    const isLocked = status === 'locked';
    const isUnlocked = status === 'unlocked';
    const isSafe = status === 'safe';

    // In Region Mode (Level 2), we use standard individual highlighting
    // In Italy Mode (Level 1), we highlight if the Region is hovered
    const shouldHighlight = isRegionMode ? false : isRegionHovered;

    // Animation variants
    const variants = {
        initial: { opacity: 0, scale: 0.9 },
        animate: { opacity: 1, scale: 1, transition: { duration: 0.5 } },
        hover: {
            scale: isRegionMode ? 1.02 : 1, // Only scale individually in Region Mode
            filter: isLocked ? 'brightness(0.8)' : 'brightness(1.2)',
            transition: { duration: 0.2 }
        },
        tap: { scale: 0.98 }
    };

    // Pulsing animation for unlocked/active provinces
    const pulseTransition = {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut" as const
    };

    const getFillColor = () => {
        if (isProvinceHighlighted) return 'rgba(6, 182, 212, 0.3)'; // Cyan highlight
        if (isRegionHovered) return 'rgba(6, 182, 212, 0.2)'; // Region highlight
        if (isRegionMode) return 'rgba(30, 41, 59, 0.8)'; // Dim others in region mode
        return 'rgba(30, 41, 59, 0.4)'; // Default
    };

    const getStrokeColor = () => {
        if (isProvinceHighlighted) return '#22d3ee'; // Cyan
        if (isRegionHovered) return '#06b6d4'; // Cyan-500
        return '#334155'; // Slate-700
    };

    const getStrokeWidth = () => {
        if (isProvinceHighlighted) return 2;
        if (isRegionHovered) return 1.5;
        return 0.5;
    };

    return (
        <motion.g
            initial="initial"
            animate="animate"
            whileHover="hover"
            whileTap="tap"
            onClick={(e) => {
                e.stopPropagation();
                onProvinceClick(province);
            }}
            onMouseEnter={() => onProvinceHover && onProvinceHover(province)}
            onMouseLeave={() => onProvinceHover && onProvinceHover(null)}
            className="cursor-pointer"
        >
            <motion.path
                d={path}
                fill={getFillColor()}
                stroke={getStrokeColor()}
                strokeWidth={getStrokeWidth()}
                className={cn(
                    "transition-all duration-300",
                    // Base Styles if not overridden by inline styles
                    // We keep these for fallback or specific status effects if needed, 
                    // but the inline styles above take precedence for the main logic.
                    isLocked && "fill-slate-900/80",
                    isUnlocked && "fill-cyan-900/40",
                    isSafe && "fill-amber-700/60",
                )}
                animate={isUnlocked ? {
                    fillOpacity: [0.3, 0.6, 0.3],
                    strokeOpacity: [0.5, 1, 0.5],
                } : {}}
                transition={isUnlocked ? pulseTransition : {}}
            />
        </motion.g>
    );
};

export default ProvincePath;
