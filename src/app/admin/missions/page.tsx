'use client';

import React, { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { Database } from '@/types/supabase';
import { useRouter } from 'next/navigation';
import { BookOpen, Plus, X, Save, ArrowLeft, Trash2, MapPin, Clock, Award, ChevronRight, Check, Pencil } from 'lucide-react';
import { provincesData } from '@/data/provincesData';

// Initialize Supabase Client
const supabase = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Mission = Database['public']['Tables']['missions']['Row'];
type MissionQuestion = Database['public']['Tables']['mission_questions']['Row'];

// Helper to get regions
const REGIONS = Array.from(new Set(provincesData.map(p => p.region)));

export default function AdminMissionsPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [missions, setMissions] = useState<Mission[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Wizard State
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState<Partial<Mission>>({
        title: '',
        content: '',
        xp_reward: 100,
        estimated_time: '5 min',
        region: '',
        province_id: ''
    });
    const [questions, setQuestions] = useState<Partial<MissionQuestion>[]>([]);

    useEffect(() => {
        checkAdminAndFetchMissions();
    }, []);

    const checkAdminAndFetchMissions = async () => {
        setIsLoading(true);
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            router.push('/');
            return;
        }

        // Check if user is admin
        const { data: profile } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', user.id)
            .single();

        if (!profile?.is_admin) {
            router.push('/');
            return;
        }

        // Fetch missions
        const { data: allMissions, error } = await supabase
            .from('missions')
            .select('*')
            .order('created_at', { ascending: false });

        if (!error) {
            setMissions(allMissions || []);
        }
        setIsLoading(false);
    };

    const handleOpenModal = async (mission?: Mission) => {
        if (mission) {
            // Edit Mode
            setFormData(mission);

            // Fetch questions
            const { data: qData } = await supabase
                .from('mission_questions')
                .select('*')
                .eq('mission_id', mission.id)
                .order('created_at', { ascending: true });

            setQuestions(qData || []);
        } else {
            // Create Mode
            setFormData({
                title: '',
                content: '# Mission Briefing\n\nWrite your lecture here...',
                xp_reward: 100,
                estimated_time: '5 min',
                region: REGIONS[0],
                province_id: ''
            });
            setQuestions([]);
        }
        setStep(1);
        setIsModalOpen(true);
    };

    const handleAddQuestion = () => {
        setQuestions([...questions, {
            text: '',
            options: ['', '', '', ''],
            correct_answer: 0,
            explanation: ''
        }]);
    };

    const updateQuestion = (index: number, field: keyof MissionQuestion, value: any) => {
        const newQuestions = [...questions];
        newQuestions[index] = { ...newQuestions[index], [field]: value };
        setQuestions(newQuestions);
    };

    const updateOption = (qIndex: number, oIndex: number, value: string) => {
        const newQuestions = [...questions];
        const newOptions = [...(newQuestions[qIndex].options as string[])];
        newOptions[oIndex] = value;
        newQuestions[qIndex].options = newOptions;
        setQuestions(newQuestions);
    };

    const handleSave = async () => {
        if (!formData.title || !formData.content) {
            alert('Title and Content are required');
            return;
        }

        let missionId = formData.id;

        if (missionId) {
            // UPDATE
            const { error: updateError } = await supabase
                .from('missions')
                .update({
                    title: formData.title,
                    content: formData.content,
                    xp_reward: formData.xp_reward,
                    estimated_time: formData.estimated_time,
                    region: formData.region,
                    province_id: formData.province_id
                })
                .eq('id', missionId);

            if (updateError) {
                alert('Error updating mission: ' + updateError.message);
                return;
            }

            // Delete old questions (simple strategy: replace all)
            await supabase.from('mission_questions').delete().eq('mission_id', missionId);
        } else {
            // INSERT
            const { data: missionData, error: missionError } = await supabase
                .from('missions')
                .insert({
                    title: formData.title,
                    content: formData.content,
                    xp_reward: formData.xp_reward,
                    estimated_time: formData.estimated_time,
                    region: formData.region,
                    province_id: formData.province_id
                } as any)
                .select()
                .single();

            if (missionError || !missionData) {
                alert('Error creating mission: ' + missionError?.message);
                return;
            }
            missionId = missionData.id;
        }

        // Create Questions
        if (questions.length > 0 && missionId) {
            const questionsToInsert = questions.map(q => ({
                mission_id: missionId,
                text: q.text,
                options: q.options,
                correct_answer: q.correct_answer,
                explanation: q.explanation
            }));

            const { error: questionsError } = await supabase
                .from('mission_questions')
                .insert(questionsToInsert as any);

            if (questionsError) {
                alert('Error creating questions: ' + questionsError.message);
            }
        }

        setIsModalOpen(false);
        checkAdminAndFetchMissions();
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure? This will delete the mission and all its questions.')) return;
        await supabase.from('missions').delete().eq('id', id);
        checkAdminAndFetchMissions();
    };

    if (isLoading) return <div className="min-h-screen bg-black flex items-center justify-center text-cyan-500 font-mono">LOADING MISSIONS...</div>;

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-cyan-500/30 p-8">
            {/* Header */}
            <header className="flex items-center justify-between mb-8 border-b border-slate-800 pb-4">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.push('/admin')} className="p-2 hover:bg-slate-800 rounded-full transition-colors">
                        <ArrowLeft className="w-6 h-6 text-slate-400" />
                    </button>
                    <BookOpen className="w-10 h-10 text-cyan-500" />
                    <div>
                        <h1 className="text-3xl font-bold text-white font-orbitron tracking-wider">MISSION CREATOR</h1>
                        <p className="text-slate-500 font-mono text-sm">DESIGN TRAINING MODULES</p>
                    </div>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-colors font-bold"
                >
                    <Plus className="w-5 h-5" />
                    NEW MISSION
                </button>
            </header>

            {/* Missions List */}
            <div className="grid grid-cols-1 gap-4">
                {missions.map(mission => (
                    <div key={mission.id} className="bg-slate-900/50 border border-slate-800 p-6 rounded-xl hover:border-cyan-500/50 transition-colors flex justify-between items-center group">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <span className="px-2 py-0.5 bg-slate-800 text-slate-400 text-xs rounded border border-slate-700 font-mono">
                                    {mission.province_id || mission.region || 'Global'}
                                </span>
                                <h3 className="font-bold text-white text-lg">{mission.title}</h3>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-slate-500 font-mono">
                                <span className="flex items-center gap-1"><Award className="w-4 h-4 text-yellow-500" /> {mission.xp_reward} XP</span>
                                <span className="flex items-center gap-1"><Clock className="w-4 h-4 text-cyan-500" /> {mission.estimated_time}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleOpenModal(mission)} className="p-2 bg-slate-800 text-cyan-400 rounded hover:bg-slate-700">
                                <Pencil className="w-5 h-5" />
                            </button>
                            <button onClick={() => handleDelete(mission.id)} className="p-2 bg-slate-800 text-red-400 rounded hover:bg-red-900/30">
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Wizard Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-4xl h-[80vh] flex flex-col shadow-2xl">
                        {/* Modal Header */}
                        <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-800/50">
                            <div className="flex items-center gap-4">
                                <h3 className="font-orbitron font-bold text-white">CREATE MISSION</h3>
                                <div className="flex items-center gap-2 text-xs font-mono">
                                    <span className={`px-2 py-1 rounded ${step === 1 ? 'bg-cyan-900 text-cyan-400' : 'bg-slate-800 text-slate-500'}`}>1. LOCATION</span>
                                    <ChevronRight className="w-3 h-3 text-slate-600" />
                                    <span className={`px-2 py-1 rounded ${step === 2 ? 'bg-cyan-900 text-cyan-400' : 'bg-slate-800 text-slate-500'}`}>2. CONTENT</span>
                                    <ChevronRight className="w-3 h-3 text-slate-600" />
                                    <span className={`px-2 py-1 rounded ${step === 3 ? 'bg-cyan-900 text-cyan-400' : 'bg-slate-800 text-slate-500'}`}>3. QUIZ</span>
                                </div>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
                        </div>

                        {/* Modal Content */}
                        <div className="flex-1 overflow-y-auto p-6">
                            {step === 1 && (
                                <div className="space-y-6 max-w-lg mx-auto">
                                    <div className="text-center mb-8">
                                        <MapPin className="w-12 h-12 text-cyan-500 mx-auto mb-4" />
                                        <h2 className="text-xl font-bold text-white">Where does this mission take place?</h2>
                                        <p className="text-slate-400">Assign this mission to a specific Region or Province.</p>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-mono text-slate-500 mb-1">Region</label>
                                            <select
                                                value={formData.region || ''}
                                                onChange={e => setFormData({ ...formData, region: e.target.value, province_id: '' })}
                                                className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm focus:border-cyan-500 outline-none"
                                            >
                                                <option value="">Select Region</option>
                                                {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-mono text-slate-500 mb-1">Province (Optional - Overrides Region)</label>
                                            <select
                                                value={formData.province_id || ''}
                                                onChange={e => setFormData({ ...formData, province_id: e.target.value })}
                                                className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm focus:border-cyan-500 outline-none"
                                                disabled={!formData.region}
                                            >
                                                <option value="">All Provinces in {formData.region || 'Region'}</option>
                                                {provincesData
                                                    .filter(p => p.region === formData.region)
                                                    .map(p => <option key={p.id} value={p.id}>{p.name} ({p.id})</option>)
                                                }
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {step === 2 && (
                                <div className="space-y-6 h-full flex flex-col">
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="col-span-2">
                                            <label className="block text-xs font-mono text-slate-500 mb-1">Mission Title</label>
                                            <input
                                                type="text"
                                                value={formData.title}
                                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                                className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm focus:border-cyan-500 outline-none font-bold"
                                                placeholder="e.g. Operation Firewall"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-mono text-slate-500 mb-1">XP Reward</label>
                                            <input
                                                type="number"
                                                value={formData.xp_reward}
                                                onChange={e => setFormData({ ...formData, xp_reward: parseInt(e.target.value) })}
                                                className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm focus:border-cyan-500 outline-none"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex-1 flex flex-col">
                                        <label className="block text-xs font-mono text-slate-500 mb-1">Lecture Content (Markdown)</label>
                                        <textarea
                                            value={formData.content}
                                            onChange={e => setFormData({ ...formData, content: e.target.value })}
                                            className="flex-1 w-full bg-slate-950 border border-slate-700 rounded p-4 text-sm focus:border-cyan-500 outline-none font-mono resize-none"
                                            placeholder="# Introduction..."
                                        />
                                    </div>
                                </div>
                            )}

                            {step === 3 && (
                                <div className="space-y-6">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-lg font-bold text-white">Quiz Questions</h3>
                                        <button onClick={handleAddQuestion} className="px-3 py-1 bg-slate-800 hover:bg-slate-700 rounded text-xs font-mono flex items-center gap-2">
                                            <Plus className="w-3 h-3" /> ADD QUESTION
                                        </button>
                                    </div>

                                    <div className="space-y-8">
                                        {questions.map((q, qIndex) => (
                                            <div key={qIndex} className="bg-slate-950 border border-slate-800 p-4 rounded-lg relative">
                                                <button
                                                    onClick={() => {
                                                        const newQ = [...questions];
                                                        newQ.splice(qIndex, 1);
                                                        setQuestions(newQ);
                                                    }}
                                                    className="absolute top-2 right-2 text-slate-600 hover:text-red-400"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>

                                                <div className="mb-4">
                                                    <label className="block text-xs font-mono text-slate-500 mb-1">Question {qIndex + 1}</label>
                                                    <input
                                                        type="text"
                                                        value={q.text}
                                                        onChange={e => updateQuestion(qIndex, 'text', e.target.value)}
                                                        className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm focus:border-cyan-500 outline-none"
                                                        placeholder="What is...?"
                                                    />
                                                </div>

                                                <div className="grid grid-cols-2 gap-4 mb-4">
                                                    {q.options?.map((opt, oIndex) => (
                                                        <div key={oIndex} className="flex items-center gap-2">
                                                            <input
                                                                type="radio"
                                                                name={`correct-${qIndex}`}
                                                                checked={q.correct_answer === oIndex}
                                                                onChange={() => updateQuestion(qIndex, 'correct_answer', oIndex)}
                                                                className="accent-cyan-500"
                                                            />
                                                            <input
                                                                type="text"
                                                                value={opt}
                                                                onChange={e => updateOption(qIndex, oIndex, e.target.value)}
                                                                className={`w-full bg-slate-900 border rounded px-2 py-1 text-xs outline-none ${q.correct_answer === oIndex ? 'border-cyan-500 text-cyan-400' : 'border-slate-700'}`}
                                                                placeholder={`Option ${oIndex + 1}`}
                                                            />
                                                        </div>
                                                    ))}
                                                </div>

                                                <div>
                                                    <label className="block text-xs font-mono text-slate-500 mb-1">Explanation</label>
                                                    <input
                                                        type="text"
                                                        value={q.explanation}
                                                        onChange={e => updateQuestion(qIndex, 'explanation', e.target.value)}
                                                        className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-xs focus:border-cyan-500 outline-none text-slate-400"
                                                        placeholder="Why is this correct?"
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer Actions */}
                        <div className="p-4 border-t border-slate-800 bg-slate-900/50 flex justify-between">
                            <button
                                onClick={() => step > 1 ? setStep(step - 1) : setIsModalOpen(false)}
                                className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
                            >
                                {step > 1 ? 'Back' : 'Cancel'}
                            </button>

                            {step < 3 ? (
                                <button
                                    onClick={() => setStep(step + 1)}
                                    className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-bold transition-colors flex items-center gap-2"
                                >
                                    Next <ChevronRight className="w-4 h-4" />
                                </button>
                            ) : (
                                <button
                                    onClick={handleSave}
                                    className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-bold transition-colors shadow-lg shadow-cyan-900/20 flex items-center gap-2"
                                >
                                    <Save className="w-4 h-4" /> SAVE MISSION
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
