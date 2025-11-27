import React from 'react';
import { Shield, Lock, Zap } from 'lucide-react';

interface LogoProps {
    size?: 'sm' | 'md' | 'lg' | 'xl';
    showText?: boolean;
    className?: string;
    animated?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
    size = 'md',
    showText = true,
    className = '',
    animated = false
}) => {
    // Size configurations
    const sizes = {
        sm: {
            container: 'w-8 h-8',
            icon: 'w-4 h-4',
            text: 'text-lg',
            gap: 'gap-2'
        },
        md: {
            container: 'w-12 h-12',
            icon: 'w-6 h-6',
            text: 'text-2xl',
            gap: 'gap-3'
        },
        lg: {
            container: 'w-16 h-16',
            icon: 'w-8 h-8',
            text: 'text-3xl',
            gap: 'gap-4'
        },
        xl: {
            container: 'w-24 h-24',
            icon: 'w-12 h-12',
            text: 'text-5xl',
            gap: 'gap-6'
        }
    };

    const currentSize = sizes[size];

    return (
        <div className={`flex items-center ${currentSize.gap} ${className} group select-none`}>
            {/* Logo Icon Container */}
            <div className={`relative ${currentSize.container} flex items-center justify-center`}>

                {/* Outer Glow/Ring */}
                <div className="absolute inset-0 bg-blue-500/20 rounded-xl rotate-45 blur-sm group-hover:blur-md transition-all duration-500" />
                <div className="absolute inset-0 border-2 border-blue-500/30 rounded-xl rotate-45 group-hover:rotate-90 transition-transform duration-700 ease-out" />

                {/* Inner Background */}
                <div className="absolute inset-1 bg-[#0B0C10] rounded-lg rotate-45 z-10" />

                {/* Main Icon */}
                <div className="relative z-20 flex items-center justify-center">
                    <Shield
                        className={`${currentSize.icon} text-blue-500 fill-blue-950/50 drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]`}
                        strokeWidth={2}
                    />
                    {/* Inner Detail (Lock or D) */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className={`font-orbitron font-bold text-blue-100 ${size === 'sm' ? 'text-[10px]' : size === 'md' ? 'text-xs' : size === 'lg' ? 'text-sm' : 'text-xl'}`}>
                            D
                        </span>
                    </div>
                </div>

                {/* Decorative Dots */}
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-blue-500 rounded-full z-20 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-blue-500 rounded-full z-20 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>

            {/* Text */}
            {showText && (
                <div className="flex flex-col justify-center">
                    <h1 className={`${currentSize.text} font-black font-orbitron tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-200 to-blue-500 drop-shadow-[0_0_15px_rgba(59,130,246,0.3)] group-hover:drop-shadow-[0_0_25px_rgba(59,130,246,0.5)] transition-all duration-300`}>
                        DEEPSAFE
                    </h1>
                    {size !== 'sm' && (
                        <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-blue-500/50 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                    )}
                </div>
            )}
        </div>
    );
};
