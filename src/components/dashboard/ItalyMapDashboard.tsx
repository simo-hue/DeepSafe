"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { provincesData, Province } from '@/data/provincesData';
import ItalyMapSVG from './ItalyMapSVG';
import TopBar from './TopBar';
import ScannerHUD from './ScannerHUD';
import { TutorialOverlay } from '@/components/tutorial/TutorialOverlay';
import { Lock, ArrowLeft, Map } from 'lucide-react';
import { getRegionBoundingBox } from '@/utils/svgUtils';
import { TransformWrapper, TransformComponent, ReactZoomPanPinchContentRef } from "react-zoom-pan-pinch";
import { useUserStore } from '@/store/useUserStore';
import { cn } from '@/lib/utils';
import { useDailyStreak } from '@/hooks/useDailyStreak';
import { useSound } from '@/context/SoundContext';
import { useHaptic } from '@/hooks/useHaptic';
import dynamic from 'next/dynamic';

const ProvinceModal = dynamic(() => import('./ProvinceModal'), { ssr: false });
const StreakRewardModal = dynamic(() => import('./StreakRewardModal'), { ssr: false });
const BadgeUnlockModal = dynamic(() => import('../gamification/BadgeUnlockModal').then(mod => mod.BadgeUnlockModal), { ssr: false });
const TierAscensionModal = dynamic(() => import('./TierAscensionModal').then(mod => mod.TierAscensionModal), { ssr: false });
const UnlockProtocolModal = dynamic(() => import('./UnlockProtocolModal').then(mod => mod.UnlockProtocolModal), { ssr: false });

const ITALY_VIEWBOX = "0 0 800 1000";

interface MapTarget {
    id: string; // Region Name or Province ID
    name: string;
    status: 'locked' | 'unlocked' | 'safe';
    type: 'REGION' | 'PROVINCE';
    details?: string;
}

interface ItalyMapDashboardProps {
    className?: string;
}

const ItalyMapDashboard: React.FC<ItalyMapDashboardProps> = ({ className }) => {
    const searchParams = useSearchParams();
    const initialRegionParam = searchParams.get('region');

    const [toastState, setToastState] = useState<{ message: string; type: 'info' | 'error' } | null>(null);

    const unlockedProvinces = useUserStore(state => state.unlockedProvinces);
    const provinceScores = useUserStore(state => state.provinceScores);
    const refreshProfile = useUserStore(state => state.refreshProfile);
    const checkBadges = useUserStore(state => state.checkBadges);
    const mapTier = useUserStore(state => state.mapTier);
    const upgradeMapTier = useUserStore(state => state.upgradeMapTier);
    const fetchRegionCosts = useUserStore(state => state.fetchRegionCosts);
    const regionCosts = useUserStore(state => state.regionCosts);
    const unlockRegion = useUserStore(state => state.unlockRegion);

    const [isProfileLoaded, setIsProfileLoaded] = useState(false);
    const { streak: currentStreak, showModal: showStreakModal, closeModal: closeStreakModal, previousStreak } = useDailyStreak(isProfileLoaded);
    const { playSound } = useSound();
    const { triggerHaptic } = useHaptic();

    const [mapScale, setMapScale] = useState(1);
    const [mapPosition, setMapPosition] = useState({ x: 0, y: 0 });
    const mapRef = useRef<HTMLDivElement>(null);
    const transformComponentRef = useRef<ReactZoomPanPinchContentRef>(null);

    // Badge Unlock State
    const [unlockedBadgeId, setUnlockedBadgeId] = useState<string | null>(null);
    const [isBadgeModalOpen, setIsBadgeModalOpen] = useState(false);

    // Tier Ascension State
    const [isAscensionModalOpen, setIsAscensionModalOpen] = useState(false);

    // Region/Sector Unlock State
    const [unlockModalState, setUnlockModalState] = useState<{
        isOpen: boolean;
        targetName: string;
        targetId: string;
        targetType: 'REGION' | 'SECTOR';
        cost: number;
    } | null>(null);

    // Initial Data Fetch & Badge Check
    useEffect(() => {
        const initProfile = async () => {
            await refreshProfile();
            await fetchRegionCosts(); // Fetch region costs
            const { newBadges } = await checkBadges();
            if (newBadges.length > 0) {
                setUnlockedBadgeId(newBadges[0]); // Show first new badge
                setIsBadgeModalOpen(true);
            }
            setIsProfileLoaded(true);
        };
        initProfile();
    }, [refreshProfile, fetchRegionCosts]);

    // Merge static data with persisted unlocked status and scores
    const dynamicProvincesData = useMemo(() => {
        return provincesData.map(p => {
            const scoreData = provinceScores[p.id] || { score: 0, maxScore: 10, isCompleted: false };
            const isUnlocked = unlockedProvinces.includes(p.id);

            return {
                ...p,
                status: isUnlocked ? 'unlocked' : (p.status === 'safe' ? 'safe' : 'locked'),
                userScore: scoreData.score,
                maxScore: scoreData.maxScore,
                isCompleted: scoreData.isCompleted
            };
        }) as Province[];
    }, [unlockedProvinces, provinceScores]);

    // Calculate initial Italy ViewBox based on all provinces
    const initialItalyViewBox = useMemo(() => {
        const allPaths = dynamicProvincesData.map(p => p.path);
        const bbox = getRegionBoundingBox(allPaths);
        if (!bbox) return "0 0 800 1000"; // Fallback
        // Add small padding (5%) to avoid touching edges exactly
        const paddingX = bbox.width * 0.05;
        const paddingY = bbox.height * 0.05;
        return `${bbox.minX - paddingX / 2} ${bbox.minY - paddingY / 2} ${bbox.width + paddingX} ${bbox.height + paddingY}`;
    }, [dynamicProvincesData]);

    // Helper to calculate region box (hoisted for initialization)
    const getRegionBox = (regionName: string) => {
        const regionProvinces = provincesData.filter(p => p.region === regionName); // Use static data for init
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

    // Initialize State based on URL param
    const [viewBox, setViewBox] = useState(() => {
        if (initialRegionParam) {
            return getRegionBox(initialRegionParam);
        }
        return initialItalyViewBox;
    });

    // Navigation State
    const [viewMode, setViewMode] = useState<'ITALY' | 'REGION'>(initialRegionParam ? 'REGION' : 'ITALY');
    const [currentRegion, setCurrentRegion] = useState<string | null>(initialRegionParam || null);

    // Interaction State
    const [hoveredTarget, setHoveredTarget] = useState<MapTarget | null>(null);
    const [selectedTarget, setSelectedTarget] = useState<MapTarget | null>(null);
    const [modalProvince, setModalProvince] = useState<Province | null>(null);

    // Calculate Region ViewBox with padding
    const calculateRegionViewBox = (regionName: string) => {
        const regionProvinces = dynamicProvincesData.filter(p => p.region === regionName);
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
                const regionProvinces = dynamicProvincesData.filter(p => p.region === regionName);
                const isUnlocked = regionProvinces.some(p => p.status === 'unlocked' || p.status === 'safe');
                const status = isUnlocked ? 'unlocked' : 'locked';

                setSelectedTarget({
                    id: regionName,
                    name: regionName,
                    status: status,
                    type: 'REGION',
                    details: `${regionProvinces.length} SECTORS`
                });
                playSound('click');
                triggerHaptic('light');
            } else {
                // Step 2: Enter (if already selected)
                const regionProvinces = dynamicProvincesData.filter(p => p.region === regionName);
                const isUnlocked = regionProvinces.some(p => p.status === 'unlocked' || p.status === 'safe');
                if (isUnlocked) {
                    enterRegion(regionName);
                    playSound('click');
                    triggerHaptic('light');
                } else {
                    // Offer to Unlock Region
                    const cost = regionCosts[regionName] || 1000; // Default to 1000 if not found
                    setUnlockModalState({
                        isOpen: true,
                        targetName: regionName,
                        targetId: regionName,
                        targetType: 'REGION',
                        cost: cost
                    });
                    playSound('click');
                    triggerHaptic('medium');
                }
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
                playSound('click');
                triggerHaptic('light');
            } else {
                // Step 2: Open Modal or Unlock
                if (province.status !== 'locked') {
                    setModalProvince(province);
                    setSelectedTarget(null);
                    playSound('click');
                    triggerHaptic('medium');
                } else {
                    // Offer to Unlock Sector
                    setUnlockModalState({
                        isOpen: true,
                        targetName: province.name,
                        targetId: province.id,
                        targetType: 'SECTOR',
                        cost: 0 // Free for now
                    });
                    playSound('click');
                    triggerHaptic('medium');
                }
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
        playSound('click');
        triggerHaptic('light');
    };

    const handleBackToItaly = () => {
        setCurrentRegion(null);
        setViewBox(initialItalyViewBox);
        setViewMode('ITALY');
        setSelectedTarget(null);
        playSound('click');
        triggerHaptic('light');
        if (transformComponentRef.current) {
            transformComponentRef.current.resetTransform(1000, "easeOutQuad");
        }
    };

    const handleProvinceHover = (province: Province | null) => {
        if (!province) {
            setHoveredTarget(null);
            return;
        }

        if (viewMode === 'ITALY') {
            const regionName = province.region;
            const regionProvinces = dynamicProvincesData.filter(p => p.region === regionName);
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
            if (target.status !== 'locked') {
                enterRegion(target.name);
                playSound('click');
                triggerHaptic('light');
            } else {
                // Open Unlock Modal for Region
                const cost = regionCosts[target.name] || 1000;
                setUnlockModalState({
                    isOpen: true,
                    targetName: target.name,
                    targetId: target.name,
                    targetType: 'REGION',
                    cost: cost
                });
                playSound('click');
                triggerHaptic('medium');
            }
        } else {
            const province = dynamicProvincesData.find(p => p.id === target.id);
            if (province) {
                if (province.status !== 'locked') {
                    setModalProvince(province);
                    setSelectedTarget(null);
                    playSound('click');
                    triggerHaptic('medium');
                } else {
                    // Open Unlock Modal for Sector (Free for now)
                    setUnlockModalState({
                        isOpen: true,
                        targetName: province.name,
                        targetId: province.id,
                        targetType: 'SECTOR',
                        cost: 0
                    });
                    playSound('click');
                    triggerHaptic('medium');
                }
            }
        }
    };

    const activeTarget = selectedTarget || hoveredTarget;

    // Calculate Progress
    const completedCount = useMemo(() => {
        return dynamicProvincesData.filter(p => p.isCompleted).length;
    }, [dynamicProvincesData]);
    const totalProvinces = dynamicProvincesData.length;

    const showToast = (message: string, type: 'info' | 'error') => {
        setToastState({ message, type });
        setTimeout(() => setToastState(null), 3000);
    };

    // Check for Tier Completion
    useEffect(() => {
        if (!isProfileLoaded) return;
        if (mapTier === 'level_3') return; // Max tier reached

        const allCompleted = dynamicProvincesData.every(p => p.isCompleted);
        if (allCompleted) {
            // Check if we haven't already shown it this session or if user hasn't ascended yet
            // For now, just show it if conditions met. Ideally, we'd check if they already saw it.
            setIsAscensionModalOpen(true);
        }
    }, [dynamicProvincesData, mapTier, isProfileLoaded]);

    const handleAscend = async () => {
        const success = await upgradeMapTier();
        if (success) {
            setIsAscensionModalOpen(false);
            playSound('levelup'); // Or a specific ascension sound
            triggerHaptic('heavy');

            const nextTierName = mapTier === 'level_1' ? 'ORANGE' : 'GOLD';
            showToast(`WELCOME TO THE ${nextTierName} TIER`, 'info');

            // Reset view to Italy
            handleBackToItaly();
            showToast('Ascension Failed. Try again.', 'error');
        }
    };

    const handleUnlockTarget = async () => {
        if (!unlockModalState) return;
        const { targetId, targetType, targetName } = unlockModalState;

        if (targetType === 'REGION') {
            const result = await unlockRegion(targetId);
            if (result.success) {
                setUnlockModalState(null);

                // Immediately update the selected target status to unlocked
                if (selectedTarget && selectedTarget.id === targetId) {
                    setSelectedTarget(prev => prev ? { ...prev, status: 'unlocked' } : null);
                }

                playSound('success');
                triggerHaptic('success');
                showToast(`${targetName} UNLOCKED`, 'info');
            } else {
                showToast(result.message || 'Unlock failed', 'error');
                playSound('error');
                triggerHaptic('error');
            }
        } else {
            // Sector/Province Unlock (Logic remains similar or can be updated if sectors have costs too)
            // For now, assuming sectors are free or handled differently. 
            // If sectors have costs, we'd need a similar unlockProvinceWithCost action.
            // But currently the requirement is for REGIONS.

            // Fallback for sectors (using old logic for now, assuming 0 cost or handled elsewhere)
            await useUserStore.getState().unlockProvince(targetId);
            setUnlockModalState(null);
            playSound('success');
            triggerHaptic('success');
            showToast(`${targetName} UNLOCKED`, 'info');
        }
    };

    return (
        <div className={cn("relative w-full h-screen bg-slate-950 overflow-hidden font-sans text-slate-200 selection:bg-cyan-500/30", className)}>

            {/* Background Ambient Glow */}
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-cyan-900/20 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-amber-900/10 rounded-full blur-[120px] pointer-events-none" />

            {/* HUD Elements */}
            <TopBar progress={completedCount} total={totalProvinces} />

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
                    ref={transformComponentRef}
                    initialScale={0.9}
                    minScale={0.5}
                    maxScale={4}
                    centerOnInit={true}
                    wheel={{ step: 0.1 }}
                    pinch={{ disabled: false }}
                    panning={{ disabled: false }}
                    limitToBounds={true}
                    alignmentAnimation={{ sizeX: 0, sizeY: 0 }}
                >
                    <TransformComponent
                        wrapperClass="!w-full !h-full"
                        contentClass="!w-full !h-full flex items-center justify-center"
                    >
                        <div
                            className="w-full h-full flex items-center justify-center"
                            onClick={() => setSelectedTarget(null)}
                        >
                            <ItalyMapSVG
                                provinces={dynamicProvincesData}
                                onProvinceClick={handleProvinceClick}
                                onProvinceHover={handleProvinceHover}
                                viewBox={viewBox}
                                activeRegion={currentRegion}
                                highlightedId={hoveredTarget?.type === 'REGION' ? hoveredTarget.id : (selectedTarget?.type === 'REGION' ? selectedTarget.id : (hoveredTarget?.id || selectedTarget?.id || null))}
                                mapTier={mapTier}
                            />
                        </div>
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

            {/* Streak Reward Modal */}
            <StreakRewardModal
                isOpen={showStreakModal}
                streak={currentStreak}
                previousStreak={previousStreak}
                onClose={closeStreakModal}
            />

            {/* Badge Unlock Modal */}
            <BadgeUnlockModal
                isOpen={isBadgeModalOpen}
                onClose={() => setIsBadgeModalOpen(false)}
                badgeId={unlockedBadgeId}
            />

            {/* Tier Ascension Modal */}
            <TierAscensionModal
                isOpen={isAscensionModalOpen}
                currentTier={mapTier}
                onAscend={handleAscend}
                onClose={() => setIsAscensionModalOpen(false)}
            />

            {/* Region/Sector Unlock Modal */}
            {unlockModalState && (
                <UnlockProtocolModal
                    isOpen={unlockModalState.isOpen}
                    targetName={unlockModalState.targetName}
                    targetType={unlockModalState.targetType}
                    cost={unlockModalState.cost}
                    onUnlock={handleUnlockTarget}
                    onClose={() => setUnlockModalState(null)}
                />
            )}

            {/* Toast Notification */}
            <AnimatePresence>
                {toastState && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, x: '-50%' }}
                        animate={{ opacity: 1, y: 0, x: '-50%' }}
                        exit={{ opacity: 0, y: 20, x: '-50%' }}
                        className={`absolute bottom-32 left-1/2 px-6 py-3 rounded-lg backdrop-blur-md border shadow-2xl flex items-center gap-3 z-50 ${toastState.type === 'error'
                            ? 'bg-red-950/80 border-red-500/50 text-red-200'
                            : 'bg-cyan-950/80 border-cyan-500/50 text-cyan-200'
                            }`}
                    >
                        {toastState.type === 'error' && <Lock className="w-4 h-4" />}
                        <span className="text-sm font-medium">{toastState.message}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Tutorial Overlay */}
            {isProfileLoaded && <TutorialOverlay />}
        </div>
    );
};

export default ItalyMapDashboard;
