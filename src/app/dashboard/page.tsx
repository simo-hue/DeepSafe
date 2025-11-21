'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircle, Lock, PlayCircle } from 'lucide-react';
import { SagaMap, SagaLevel } from '@/components/gamification/SagaMap';
import { cn } from '@/lib/utils';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';
const supabase = createClient<Database>(supabaseUrl, supabaseKey);

export default function Dashboard() {
  const [levels, setLevels] = useState<SagaLevel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSagaState() {
      try {
        const { data, error } = await supabase.rpc('get_user_saga_state');

        if (error) {
          console.warn('Error fetching saga state, using mock data:', error);
          // Use mock data as fallback
          const mockLevels: SagaLevel[] = [
            { id: '1', day_number: 1, title: 'Introduction to Cyber Safety', is_boss_level: false, xp_reward: 50, module_title: 'Week 1: Foundations', theme_color: '#45A29E', order_index: 1, status: 'active' },
            { id: '2', day_number: 2, title: 'Spotting Phishing Emails', is_boss_level: false, xp_reward: 50, module_title: 'Week 1: Foundations', theme_color: '#45A29E', order_index: 2, status: 'locked' },
            { id: '3', day_number: 3, title: 'Password Security', is_boss_level: false, xp_reward: 50, module_title: 'Week 1: Foundations', theme_color: '#45A29E', order_index: 3, status: 'locked' },
            { id: '4', day_number: 7, title: 'Week 1 Challenge', is_boss_level: true, xp_reward: 200, module_title: 'Week 1: Foundations', theme_color: '#45A29E', order_index: 7, status: 'locked' },
          ];
          setLevels(mockLevels);
          setLoading(false);
          return;
        }

        // Parse RPC response
        // The RPC returns { completed_level_ids: [...], levels: [...] }
        const result = data as any;
        const completedIds = new Set((result.completed_level_ids || []).map((i: any) => i.quiz_id));
        const rawLevels = result.levels || [];

        // If no levels exist in DB, use mock data
        if (rawLevels.length === 0) {
          console.warn('No levels found in database, using mock data');
          const mockLevels: SagaLevel[] = [
            { id: '1', day_number: 1, title: 'Introduction to Cyber Safety', is_boss_level: false, xp_reward: 50, module_title: 'Week 1: Foundations', theme_color: '#45A29E', order_index: 1, status: 'active' },
            { id: '2', day_number: 2, title: 'Spotting Phishing Emails', is_boss_level: false, xp_reward: 50, module_title: 'Week 1: Foundations', theme_color: '#45A29E', order_index: 2, status: 'locked' },
            { id: '3', day_number: 3, title: 'Password Security', is_boss_level: false, xp_reward: 50, module_title: 'Week 1: Foundations', theme_color: '#45A29E', order_index: 3, status: 'locked' },
            { id: '4', day_number: 7, title: 'Week 1 Challenge', is_boss_level: true, xp_reward: 200, module_title: 'Week 1: Foundations', theme_color: '#45A29E', order_index: 7, status: 'locked' },
          ];
          setLevels(mockLevels);
          setLoading(false);
          return;
        }

        // Process levels to determine status
        // Logic: Level is unlocked if previous level is completed OR it's the first level
        let isNextUnlocked = true;

        const processedLevels: SagaLevel[] = rawLevels.map((l: any, index: number) => {
          const isCompleted = completedIds.has(l.id);
          let status: 'locked' | 'active' | 'completed' = 'locked';

          if (isCompleted) {
            status = 'completed';
          } else if (isNextUnlocked) {
            status = 'active';
            isNextUnlocked = false; // Only one active level at a time (the furthest reached)
          }

          return {
            id: l.id,
            day_number: l.day_number,
            title: l.title,
            is_boss_level: l.is_boss_level,
            xp_reward: l.xp_reward,
            module_title: l.module_title,
            theme_color: l.theme_color,
            order_index: l.order_index,
            status
          };
        });

        setLevels(processedLevels);
      } catch (err) {
        console.error('Unexpected error:', err);
        // Use mock data as ultimate fallback
        const mockLevels: SagaLevel[] = [
          { id: '1', day_number: 1, title: 'Introduction to Cyber Safety', is_boss_level: false, xp_reward: 50, module_title: 'Week 1: Foundations', theme_color: '#45A29E', order_index: 1, status: 'active' },
          { id: '2', day_number: 2, title: 'Spotting Phishing Emails', is_boss_level: false, xp_reward: 50, module_title: 'Week 1: Foundations', theme_color: '#45A29E', order_index: 2, status: 'locked' },
        ];
        setLevels(mockLevels);
      } finally {
        setLoading(false);
      }
    }

    fetchSagaState();
  }, []);

  if (loading) {
    return <div className="p-8 text-center">Loading your journey...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">Your Journey</h1>
        <p className="text-zinc-500 dark:text-zinc-400">Master AI Safety one step at a time.</p>
      </div>

      {/* Pending Challenges Notification */}
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-4 rounded-xl flex items-center justify-between animate-in slide-in-from-top-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-800 rounded-full flex items-center justify-center text-xl">
            ⚔️
          </div>
          <div>
            <h3 className="font-bold text-sm text-yellow-900 dark:text-yellow-100">New Challenge!</h3>
            <p className="text-xs text-yellow-700 dark:text-yellow-300">DeepLearner challenged you.</p>
          </div>
        </div>
        <Link
          href="/quiz/1"
          className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white text-sm font-bold rounded-lg transition-colors"
        >
          Accept
        </Link>
      </div>

      {/* Learning Path */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Saga Map</h2>
          <span className="text-sm text-zinc-500">Week 1-4</span>
        </div>

        <SagaMap levels={levels} />
      </div>
    </div>
  );
}
