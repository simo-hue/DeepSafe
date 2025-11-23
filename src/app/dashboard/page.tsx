'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CheckCircle, Lock, PlayCircle, Flame, Heart, Zap } from 'lucide-react';
import { SagaMap, SagaLevel } from '@/components/gamification/SagaMap';
import { cn } from '@/lib/utils';
import { createBrowserClient } from '@supabase/ssr';
import { Database } from '@/types/supabase';
import { motion } from 'framer-motion';
import { useHaptics } from '@/hooks/useHaptics';

import { useUserStore } from '@/store/useUserStore';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';
const supabase = createBrowserClient<Database>(supabaseUrl, supabaseKey);
import { getPendingChallenges } from '@/lib/challenges';

export default function Dashboard() {
  const [levels, setLevels] = useState<SagaLevel[]>([]);
  const [loading, setLoading] = useState(true);
  const { lives, streak } = useUserStore();
  const [challenges, setChallenges] = useState<any[]>([]);
  const { trigger } = useHaptics();
  const router = useRouter();

  useEffect(() => {
    const fetchSagaState = async () => {
      try {
        setLoading(true);

        // 1. Fetch User Progress
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          /**
     * Fetches pending challenges where the current user is the opponent.
     * These are challenges that need to be accepted.
     */
          const fetchChallenges = async () => {
            if (!user) return;
            const data = await getPendingChallenges(user.id);
            setChallenges(data);
          };

          /**
           * Accepts a challenge by redirecting to the quiz.
           * The status update to 'in_progress' or 'completed' happens when the quiz starts/ends.
           */
          const handleAcceptChallenge = (challengeId: string) => {
            router.push(`/quiz/1?mode=duel&challengeId=${challengeId}`);
          }; const { data: progressData, error: progressError } = await supabase
            .from('user_progress')
            .select('quiz_id')
            .eq('user_id', user.id)
            .eq('status', 'completed');

          if (progressData) {
            progressData.forEach(p => completedIds.add(p.quiz_id));
          }
        }

        let completedIds = new Set<string>();

        if (user) {
          const { data: progressData, error: progressError } = await supabase
            .from('user_progress')
            .select('quiz_id')
            .eq('user_id', user.id)
            .eq('status', 'completed');

          if (progressData) {
            progressData.forEach(p => completedIds.add(p.quiz_id));
          }
        }

        // 2. Fetch Levels from DB
        const { data: levelsData, error: levelsError } = await supabase
          .from('levels')
          .select(`
            *,
            modules (
              title,
              order_index
            )
          `)
          .order('day_number', { ascending: true });

        if (levelsError) throw levelsError;

        // 3. Map DB Data to SagaLevel
        const rawLevels: SagaLevel[] = (levelsData || []).map((l: any) => ({
          id: l.id,
          day_number: l.day_number,
          title: l.title,
          is_boss_level: l.is_boss_level,
          xp_reward: l.xp_reward,
          module_title: l.modules?.title || 'Unknown Module',
          theme_color: null,
          order_index: l.modules?.order_index || 0,
          status: 'locked'
        }));

        // 4. Determine Status & Max Day
        let maxUnlockedDay = 0;
        let isNextUnlocked = true; // The first non-completed level is the active one

        const processedLevels: SagaLevel[] = rawLevels.map((l) => {
          const isCompleted = completedIds.has(l.id);
          let status: 'locked' | 'active' | 'completed' = 'locked';

          if (isCompleted) {
            status = 'completed';
            maxUnlockedDay = Math.max(maxUnlockedDay, l.day_number);
          } else if (isNextUnlocked) {
            status = 'active';
            maxUnlockedDay = Math.max(maxUnlockedDay, l.day_number);
            isNextUnlocked = false;
          }

          return { ...l, status };
        });

        // 5. Fog of War Filter
        const uniqueModules = Array.from(new Set(processedLevels.map(l => l.module_title)));
        const currentLevelObj = processedLevels.find(l => l.day_number === maxUnlockedDay) || processedLevels[0];
        const currentModuleIndex = uniqueModules.indexOf(currentLevelObj.module_title);
        const targetIndex = currentModuleIndex === -1 ? 0 : currentModuleIndex;
        const visibleModules = uniqueModules.slice(0, targetIndex + 2);
        const visibleLevels = processedLevels.filter(l => visibleModules.includes(l.module_title));

        setLevels(visibleLevels);
      } catch (err) {
        console.error('Unexpected error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSagaState();

    const handleFocus = () => {
      console.log('🔄 Tab focused, refreshing saga state...');
      fetchSagaState();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  if (loading) {
    return <div className="p-8 text-center">Loading your journey...</div>;
  }

  return (
    <div className="min-h-screen pb-24 relative overflow-hidden">
      {/* Background Elements */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyber-blue/10 via-cyber-dark to-cyber-dark z-0" />
      <div className="fixed inset-0 bg-[url('/grid-pattern.svg')] opacity-10 z-0" />

      <div className="relative z-10 space-y-6 p-4 max-w-md mx-auto">
        {/* Header */}
        <header className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold font-orbitron text-white text-glow">Il Tuo Viaggio</h1>
            <p className="text-cyber-gray text-sm">Domina la Sicurezza IA un passo alla volta.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-cyber-dark/50 px-3 py-1.5 rounded-full border border-cyber-blue/30">
              <Flame className="w-4 h-4 text-cyber-orange animate-pulse" />
              <span className="font-mono font-bold text-cyber-orange">{streak}</span>
            </div>
            <div className="flex items-center gap-1 bg-cyber-dark/50 px-3 py-1.5 rounded-full border border-cyber-blue/30">
              <Heart className="w-4 h-4 text-cyber-red animate-pulse" />
              <span className="font-mono font-bold text-cyber-red">{lives}</span>
            </div>
          </div>
        </header>

        {/* Challenge Notification */}
        {challenges.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-cyber-blue/10 border border-cyber-blue/30 p-4 rounded-xl flex items-center justify-between relative overflow-hidden group mb-4"
          >
            <div className="absolute inset-0 bg-cyber-blue/5 animate-scan pointer-events-none" />
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-cyber-blue/20 flex items-center justify-center overflow-hidden border border-cyber-blue/50">
                {challenges[0].challenger?.avatar_url ? (
                  <img src={challenges[0].challenger.avatar_url} alt="Challenger" className="w-full h-full object-cover" />
                ) : (
                  <Zap className="w-5 h-5 text-cyber-blue" />
                )}
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">Sfida da {challenges[0].challenger?.username || 'Sconosciuto'}!</h3>
                <p className="text-xs text-cyber-gray">Ti sfida a battere il suo punteggio!</p>
              </div>
            </div>
            <button
              onClick={() => {
                trigger('medium');
                router.push(`/quiz/${challenges[0].quiz_id}?mode=duel&challengeId=${challenges[0].id}`);
              }}
              className="px-4 py-2 bg-cyber-blue text-cyber-dark font-bold text-xs rounded-lg hover:bg-cyber-green transition-all shadow-[0_0_10px_rgba(69,162,158,0.4)] active:scale-95 active:bg-white"
            >
              ACCETTA
            </button>
          </motion.div>
        )}

        {/* Saga Map */}
        <div className="space-y-4">
          <div className="flex justify-between items-end px-2">
            <h2 className="text-xl font-bold font-orbitron text-cyber-blue tracking-wide">Mappa della Saga</h2>
            <span className="text-xs font-mono text-cyber-gray/70">SETTIMANE 1-4</span>
          </div>

          <SagaMap levels={levels} />
        </div>
      </div>
    </div>
  );
}
