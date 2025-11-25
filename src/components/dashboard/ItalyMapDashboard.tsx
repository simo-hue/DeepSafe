"use client";

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Province, provincesData } from '@/data/provincesData';
import ItalyMapSVG from './ItalyMapSVG';
import TopBar from './TopBar';
import ProvinceModal from './ProvinceModal';
import ScannerHUD from './ScannerHUD';
import { Lock, ArrowLeft, Map } from 'lucide-react';
import { getRegionBoundingBox } from '@/utils/svgUtils';
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

const ITALY_VIEWBOX = "0 0 800 1000";

interface MapTarget {
    id: string; // Region Name or Province ID
    name: string;
    status: 'locked' | 'unlocked' | 'safe';
    type: 'REGION' | 'PROVINCE';
    details?: string;
}

const ItalyMapDashboard: React.FC = () => {
    const [toast, setToast] = useState<{ message: string; type: 'info' | 'error' } | null>(null);

    // Calculate initial Italy ViewBox based on all provinces
    const initialItalyViewBox = useMemo(() => {
        const allPaths = provincesData.map(p => p.path);
        const bbox = getRegionBoundingBox(allPaths);
        if (!bbox) return "0 0 800 1000"; // Fallback
        // Add small padding (5%) to avoid touching edges exactly
        const paddingX = bbox.width * 0.05;
        const paddingY = bbox.height * 0.05;
        return `${bbox.minX - paddingX / 2} ${bbox.minY - paddingY / 2} ${bbox.width + paddingX} ${bbox.height + paddingY}`;
    }, []);

    const [viewBox, setViewBox] = useState(initialItalyViewBox);

    // Navigation State
    const [viewMode, setViewMode] = useState<'ITALY' | 'REGION'>('ITALY');
    const [currentRegion, setCurrentRegion] = useState<string | null>(null);

    // Interaction State
    const [hoveredTarget, setHoveredTarget] = useState<MapTarget | null>(null);
    const [selectedTarget, setSelectedTarget] = useState<MapTarget | null>(null);
    const [modalProvince, setModalProvince] = useState<Province | null>(null);

    // Calculate Region ViewBox with padding
    const calculateRegionViewBox = (regionName: string) => {
        const regionProvinces = provincesData.filter(p => p.region === regionName);
        const paths = regionProvinces.map(p => p.path);
        const bbox = getRegionBoundingBox(paths);

        if (!bbox) return initialItalyViewBox;

        // Add 20% padding
        const paddingX = bbox.width * 0.2;
        const paddingY = bbox.height * 0.2;
        const minX = bbox.minX - paddingX / 2;
        const minY = bbox.minY - paddingY / 2;
        const width = bbox.width + paddingX;
        const height = bbox.height + paddingY;

        return `${minX} ${minY} ${width} ${height}`;
    };

    const handleProvinceClick = (province: Province) => {
        if (viewMode === 'ITALY') {
            // Level 1: Region Logic
            const regionName = province.region;
            const targetId = regionName;

            // Step 1: Select (if not already selected)
            if (selectedTarget?.id !== targetId) {
                const regionProvinces = provincesData.filter(p => p.region === regionName);
                const isUnlocked = regionProvinces.some(p => p.status === 'unlocked' || p.status === 'safe');
                const status = isUnlocked ? 'unlocked' : 'locked';

                setSelectedTarget({
                    id: regionName,
                    name: regionName,
                    status: status,
                    type: 'REGION',
                    details: `${regionProvinces.length} SECTORS`
                });
            } else {
                // Step 2: Enter (if already selected)
                enterRegion(regionName);
            }
        } else {
            // Level 2: Province Logic
            const targetId = province.id;

            // Step 1: Select
            if (selectedTarget?.id !== targetId) {
                setSelectedTarget({
                    id: province.id,
                    name: province.name,
                    status: province.status,
                    type: 'PROVINCE',
                    details: `PROGRESS: ${province.progress}%`
                });
            } else {
                // Step 2: Open Modal
                setModalProvince(province);
                setSelectedTarget(null);
            }
        }
    };

    const enterRegion = (regionName: string) => {
        const newViewBox = calculateRegionViewBox(regionName);
        setCurrentRegion(regionName);
        setViewBox(newViewBox);
        setViewMode('REGION');
        setSelectedTarget(null);
        setHoveredTarget(null);
    };

    const handleBackToItaly = () => {
        setCurrentRegion(null);
        setViewBox(initialItalyViewBox);
        setViewMode('ITALY');
        setSelectedTarget(null);
    };

    const handleProvinceHover = (province: Province | null) => {
        if (!province) {
            setHoveredTarget(null);
            return;
        }

        if (viewMode === 'ITALY') {
            const regionName = province.region;
            const regionProvinces = provincesData.filter(p => p.region === regionName);
            const isUnlocked = regionProvinces.some(p => p.status === 'unlocked' || p.status === 'safe');

            setHoveredTarget({
                id: regionName,
                name: regionName,
                status: isUnlocked ? 'unlocked' : 'locked',
                type: 'REGION',
                details: `${regionProvinces.length} SECTORS`
            });
        } else {
            setHoveredTarget({
                id: province.id,
                name: province.name,
                status: province.status,
                type: 'PROVINCE',
                details: `PROGRESS: ${province.progress}%`
            });
        }
    };

    const handleHudAction = () => {
        const target = selectedTarget || hoveredTarget;
        if (!target) return;

        if (target.type === 'REGION') {
            enterRegion(target.name);
        } else {
            const province = provincesData.find(p => p.id === target.id);
            if (province) {
                setModalProvince(province);
                setSelectedTarget(null);
            }
        }
    };

    const activeTarget = selectedTarget || hoveredTarget;

    // Calculate Progress
    const unlockedCount = useMemo(() => {
        return provincesData.filter(p => p.status === 'unlocked' || p.status === 'safe').length;
    }, []);
    const totalProvinces = provincesData.length;

    const showToast = (message: string, type: 'info' | 'error') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    return (
        <div className="relative w-full h-screen bg-slate-950 overflow-hidden font-sans text-slate-200 selection:bg-cyan-500/30">

            {/* Background Ambient Glow */}
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-cyan-900/20 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-amber-900/10 rounded-full blur-[120px] pointer-events-none" />

            {/* HUD Elements */}
            <TopBar progress={unlockedCount} total={totalProvinces} />

            {/* Back Button (Only in Regional View) */}
            <AnimatePresence>
                {viewMode === 'REGION' && (
                    <motion.button
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        onClick={handleBackToItaly}
                        className="absolute top-24 left-6 z-40 flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/80 border border-slate-700 hover:border-cyan-500/50 text-slate-300 hover:text-cyan-400 transition-all backdrop-blur-md shadow-lg group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        <span className="text-xs font-orbitron font-bold tracking-wider">TORNA ALL'ITALIA</span>
                    </motion.button>
                )}
            </AnimatePresence>


            {/* Main Map Area */}
            <main className="w-full h-full flex items-center justify-center p-0">
                <TransformWrapper
                    initialScale={0.9}
                    minScale={0.5}
                    maxScale={4}
                    centerOnInit={true}
                    wheel={{ step: 0.1 }}
                    pinch={{ disabled: false }}
                    panning={{ disabled: false }}
                    limitToBounds={true}
                    alignmentAnimation={{ sizeX: 0, sizeY: 0 }}
                    onPanningStart={() => setSelectedTarget(null)}
                >
                    <TransformComponent
                        wrapperClass="!w-full !h-full bg-slate-950"
                        contentClass="!w-full !h-full flex items-center justify-center"
                    >
                        <ItalyMapSVG
                            onProvinceClick={handleProvinceClick}
                            onProvinceHover={handleProvinceHover}
                            viewBox={viewBox}
                            activeRegion={currentRegion}
                            highlightedId={hoveredTarget?.type === 'REGION' ? hoveredTarget.id : (selectedTarget?.type === 'REGION' ? selectedTarget.id : (hoveredTarget?.id || selectedTarget?.id || null))}
                        />
                    </TransformComponent>
                </TransformWrapper>
            </main>

            {/* Scanner HUD */}
            <ScannerHUD
                target={activeTarget}
                onAction={handleHudAction}
                actionLabel={viewMode === 'ITALY' ? 'ENTER' : 'START'}
                isLocked={!!selectedTarget}
            />

            {/* Province Selection Modal */}
            <AnimatePresence>
                {modalProvince && (
                    <ProvinceModal
                        province={modalProvince}
                        onClose={() => setModalProvince(null)}
                    />
                )}
            </AnimatePresence>

            {/* Toast Notification */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, x: '-50%' }}
                        animate={{ opacity: 1, y: 0, x: '-50%' }}
                        exit={{ opacity: 0, y: 20, x: '-50%' }}
                        className={`absolute bottom-32 left-1/2 px-6 py-3 rounded-lg backdrop-blur-md border shadow-2xl flex items-center gap-3 z-50 ${toast.type === 'error'
                            ? 'bg-red-950/80 border-red-500/50 text-red-200'
                            : 'bg-cyan-950/80 border-cyan-500/50 text-cyan-200'
                            }`}
                    >
                        {toast.type === 'error' && <Lock className="w-4 h-4" />}
                        <span className="text-sm font-medium">{toast.message}</span>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
};

export default ItalyMapDashboard;
