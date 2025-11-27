'use client';

import React, { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { Database } from '@/types/supabase';
import { useRouter } from 'next/navigation';
import { BookOpen, Plus, X, Save, ArrowLeft, Trash2, MapPin, Clock, Award, ChevronRight, Check, Pencil, Upload, Link, Image as ImageIcon, Search, RotateCcw } from 'lucide-react';

// ... existing code ...


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

    // Filters
    const [selectedRegion, setSelectedRegion] = useState('');
    const [selectedLevel, setSelectedLevel] = useState('');
    const [selectedProvince, setSelectedProvince] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    // Wizard State
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState<Partial<Mission>>({
        title: '',
        content: '',
        xp_reward: 100,
        estimated_time: '5 min',
        level: 'SEMPLICE',
        region: '',
        province_id: '',
        description: ''
    });
    const [questions, setQuestions] = useState<Partial<MissionQuestion>[]>([]);

    useEffect(() => {
        checkAdminAndFetchMissions();
    }, []);

    const checkAdminAndFetchMissions = async () => {
        setIsLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                // router.push('/'); // Handled by Layout now
                setIsLoading(false);
                return;
            }

            // Check admin
            const { data: profile } = await supabase
                .from('profiles')
                .select('is_admin')
                .eq('id', user.id)
                .single();

            if (!profile?.is_admin) {
                // router.push('/'); // Handled by Layout now
                setIsLoading(false);
                return;
            }

            // Fetch missions
            const { data, error } = await supabase
                .from('missions')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setMissions(data || []);
        } catch (error) {
            console.error('Error fetching missions:', error);
            // alert('Error loading missions');
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenModal = async (mission?: Mission) => {
        if (mission) {
            setFormData(mission);
            // Fetch questions for this mission
            const { data } = await supabase
                .from('mission_questions')
                .select('*')
                .eq('mission_id', mission.id)
                .order('created_at', { ascending: true });

            setQuestions(data || []);
        } else {
            setFormData({
                title: '',
                content: '',
                xp_reward: 100,
                estimated_time: '5 min',
                level: 'SEMPLICE',
                region: '',
                province_id: '',
                description: ''
            });
            setQuestions([]);
        }
        setStep(1);
        setIsModalOpen(true);
    };

    const handleAddQuestion = (type: 'multiple_choice' | 'true_false' | 'image_true_false') => {
        const newQuestion: Partial<MissionQuestion> = {
            text: '',
            type,
            options: type === 'multiple_choice' ? ['', '', '', ''] : ['Vero', 'Falso'],
            correct_answer: 0,
            explanation: '',
            image_url: ''
        };
        setQuestions([...questions, newQuestion]);
    };

    const updateQuestion = (index: number, field: keyof MissionQuestion, value: any) => {
        const newQuestions = [...questions];
        newQuestions[index] = { ...newQuestions[index], [field]: value };
        setQuestions(newQuestions);
    };

    const updateOption = (qIndex: number, oIndex: number, value: string) => {
        const newQuestions = [...questions];
        const newOptions = [...(newQuestions[qIndex].options || [])];
        newOptions[oIndex] = value;
        newQuestions[qIndex].options = newOptions;
        setQuestions(newQuestions);
    };

    const handleImageUpload = async (file: File, index: number) => {
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('mission-images')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('mission-images')
                .getPublicUrl(filePath);

            updateQuestion(index, 'image_url', publicUrl);
            // @ts-ignore
            const newQ = [...questions];
            // @ts-ignore
            newQ[index].imageInputType = 'url'; // Switch back to URL view to show preview
            setQuestions(newQ);

        } catch (error) {
            console.error('Error uploading image:', error);
            alert('Error uploading image');
        }
    };

    const handleSave = async () => {
        if (!formData.title || !formData.content) {
            alert('Please fill in all required fields');
            return;
        }

        try {
            // 1. Upsert Mission
            const { data: missionData, error: missionError } = await supabase
                .from('missions')
                .upsert({
                    id: formData.id, // If exists, update
                    title: formData.title,
                    content: formData.content,
                    xp_reward: formData.xp_reward,
                    estimated_time: formData.estimated_time,
                    level: formData.level,
                    region: formData.region || null,
                    province_id: formData.province_id || null,
                    description: formData.description
                })
                .select()
                .single();

            if (missionError) throw missionError;
            if (!missionData) throw new Error('No data returned');

            // 2. Handle Questions
            // First delete existing ones if updating
            if (formData.id) {
                await supabase.from('mission_questions').delete().eq('mission_id', formData.id);
            }

            // Insert new ones
            if (questions.length > 0) {
                const questionsToInsert = questions.map(q => ({
                    mission_id: missionData.id,
                    text: q.text || '',
                    type: q.type || 'multiple_choice',
                    options: q.options || [],
                    correct_answer: q.correct_answer || 0,
                    explanation: q.explanation || '',
                    image_url: q.image_url || null
                }));

                const { error: qError } = await supabase
                    .from('mission_questions')
                    .insert(questionsToInsert);

                if (qError) throw qError;
            }

            setIsModalOpen(false);
            checkAdminAndFetchMissions();
            alert('Mission saved successfully!');

        } catch (error: any) {
            console.error('Error saving mission:', error);
            alert(`Error saving mission: ${error.message}`);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this mission?')) return;

        try {
            const { error } = await supabase
                .from('missions')
                .delete()
                .eq('id', id);

            if (error) throw error;

            setMissions(missions.filter(m => m.id !== id));
        } catch (error: any) {
            console.error('Error deleting mission:', error);
            alert(`Error deleting mission: ${error.message}`);
        }
    };

    if (isLoading) return <div className="min-h-screen bg-black flex items-center justify-center text-cyan-500 font-mono">LOADING MISSIONS...</div>;

    const filteredMissions = missions.filter(m => {
        if (selectedRegion && m.region !== selectedRegion) return false;
        if (selectedProvince && m.province_id !== selectedProvince) return false;
        if (selectedLevel && m.level !== selectedLevel) return false;
        if (searchQuery && !m.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        return true;
    });

    const resetFilters = () => {
        setSelectedRegion('');
        setSelectedProvince('');
        setSelectedLevel('');
        setSearchQuery('');
    };

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

            {/* Filters */}
            <div className="flex flex-wrap gap-4 mb-6 items-center bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Search missions..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm focus:border-cyan-500 outline-none text-white placeholder:text-slate-600"
                    />
                </div>

                <select
                    value={selectedRegion}
                    onChange={(e) => {
                        setSelectedRegion(e.target.value);
                        setSelectedProvince(''); // Reset province when region changes
                    }}
                    className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:border-cyan-500 outline-none text-slate-300"
                >
                    <option value="">All Regions</option>
                    {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>

                <select
                    value={selectedProvince}
                    onChange={(e) => setSelectedProvince(e.target.value)}
                    className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:border-cyan-500 outline-none text-slate-300"
                    disabled={!selectedRegion}
                >
                    <option value="">All Provinces</option>
                    {selectedRegion && provincesData
                        .filter(p => p.region === selectedRegion)
                        .map(p => <option key={p.id} value={p.id}>{p.name}</option>)
                    }
                </select>

                <select
                    value={selectedLevel}
                    onChange={(e) => setSelectedLevel(e.target.value)}
                    className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:border-cyan-500 outline-none text-slate-300"
                >
                    <option value="">All Levels</option>
                    <option value="SEMPLICE">SEMPLICE</option>
                    <option value="DIFFICILE">DIFFICILE</option>
                    <option value="BOSS">BOSS</option>
                </select>

                {(selectedRegion || selectedProvince || selectedLevel || searchQuery) && (
                    <button
                        onClick={resetFilters}
                        className="flex items-center gap-2 px-3 py-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors text-sm"
                    >
                        <RotateCcw className="w-4 h-4" />
                        Reset
                    </button>
                )}
            </div>

            {/* Missions List */}
            <div className="grid grid-cols-1 gap-4">
                {filteredMissions.map(mission => (
                    <div key={mission.id} className="bg-slate-900/50 border border-slate-800 p-6 rounded-xl hover:border-cyan-500/50 transition-colors flex justify-between items-center group">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <span className="px-2 py-0.5 bg-slate-800 text-slate-400 text-xs rounded border border-slate-700 font-mono">
                                    {mission.province_id || mission.region || 'Global'}
                                </span>
                                <h3 className="font-bold text-white text-lg">{mission.title}</h3>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-slate-500 font-mono">
                                <span className="flex items-center gap-1"><Award className="w-4 h-4 text-yellow-500" /> {mission.xp_reward} NC</span>
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
                                            <label className="block text-xs font-mono text-slate-500 mb-1">NC Reward</label>
                                            <input
                                                type="number"
                                                value={formData.xp_reward}
                                                onChange={e => setFormData({ ...formData, xp_reward: parseInt(e.target.value) })}
                                                className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm focus:border-cyan-500 outline-none"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-mono text-slate-500 mb-1">Difficulty Level</label>
                                            <select
                                                value={formData.level || 'SEMPLICE'}
                                                onChange={e => setFormData({ ...formData, level: e.target.value as any })}
                                                className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm focus:border-cyan-500 outline-none"
                                            >
                                                <option value="TUTORIAL">TUTORIAL</option>
                                                <option value="SEMPLICE">SEMPLICE</option>
                                                <option value="DIFFICILE">DIFFICILE</option>
                                                <option value="BOSS">BOSS</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-mono text-slate-500 mb-1">Estimated Time</label>
                                            <input
                                                type="text"
                                                value={formData.estimated_time}
                                                onChange={e => setFormData({ ...formData, estimated_time: e.target.value })}
                                                className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm focus:border-cyan-500 outline-none"
                                                placeholder="e.g. 5 min"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-mono text-slate-500 mb-1">Popup Description</label>
                                        <textarea
                                            value={formData.description || ''}
                                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                                            className="w-full bg-slate-950 border border-slate-700 rounded p-3 text-sm focus:border-cyan-500 outline-none h-20 resize-none"
                                            placeholder="Brief description for the mission popup..."
                                        />
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
                                        <div className="flex gap-2">
                                            <button onClick={() => handleAddQuestion('multiple_choice')} className="px-3 py-1 bg-slate-800 hover:bg-slate-700 rounded text-xs font-mono flex items-center gap-2 border border-slate-700">
                                                <Plus className="w-3 h-3" /> MULTI
                                            </button>
                                            <button onClick={() => handleAddQuestion('true_false')} className="px-3 py-1 bg-slate-800 hover:bg-slate-700 rounded text-xs font-mono flex items-center gap-2 border border-slate-700">
                                                <Plus className="w-3 h-3" /> T/F
                                            </button>
                                            <button onClick={() => handleAddQuestion('image_true_false')} className="px-3 py-1 bg-slate-800 hover:bg-slate-700 rounded text-xs font-mono flex items-center gap-2 border border-slate-700">
                                                <Plus className="w-3 h-3" /> IMG T/F
                                            </button>
                                        </div>
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
                                                    <div className="flex justify-between items-center mb-1">
                                                        <label className="block text-xs font-mono text-slate-500">
                                                            Question {qIndex + 1} <span className="text-cyan-500 uppercase">[{q.type?.replace(/_/g, ' ')}]</span>
                                                        </label>
                                                    </div>
                                                    <input
                                                        type="text"
                                                        value={q.text}
                                                        onChange={e => updateQuestion(qIndex, 'text', e.target.value)}
                                                        className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm focus:border-cyan-500 outline-none"
                                                        placeholder="What is...?"
                                                    />
                                                </div>

                                                {q.type === 'image_true_false' && (
                                                    <div className="mb-4 bg-slate-900/50 p-4 rounded-lg border border-slate-800">
                                                        <div className="flex items-center justify-between mb-3">
                                                            <label className="text-xs font-mono text-slate-500">Image Source</label>
                                                            <div className="flex bg-slate-950 rounded-lg p-1 border border-slate-800">
                                                                <button
                                                                    onClick={() => {
                                                                        const newQ = [...questions];
                                                                        // @ts-ignore
                                                                        newQ[qIndex].imageInputType = 'url';
                                                                        setQuestions(newQ);
                                                                    }}
                                                                    className={`px-3 py-1 rounded text-xs font-bold flex items-center gap-2 transition-colors ${
                                                                        // @ts-ignore
                                                                        (q.imageInputType !== 'upload') ? 'bg-cyan-900/50 text-cyan-400' : 'text-slate-500 hover:text-slate-300'
                                                                        }`}
                                                                >
                                                                    <Link className="w-3 h-3" /> URL
                                                                </button>
                                                                <button
                                                                    onClick={() => {
                                                                        const newQ = [...questions];
                                                                        // @ts-ignore
                                                                        newQ[qIndex].imageInputType = 'upload';
                                                                        setQuestions(newQ);
                                                                    }}
                                                                    className={`px-3 py-1 rounded text-xs font-bold flex items-center gap-2 transition-colors ${
                                                                        // @ts-ignore
                                                                        (q.imageInputType === 'upload') ? 'bg-cyan-900/50 text-cyan-400' : 'text-slate-500 hover:text-slate-300'
                                                                        }`}
                                                                >
                                                                    <Upload className="w-3 h-3" /> Upload
                                                                </button>
                                                            </div>
                                                        </div>

                                                        {/* @ts-ignore */}
                                                        {q.imageInputType === 'upload' ? (
                                                            <div className="space-y-3">
                                                                <div className="border-2 border-dashed border-slate-700 rounded-lg p-6 text-center hover:border-cyan-500/50 transition-colors relative group">
                                                                    <input
                                                                        type="file"
                                                                        accept="image/*"
                                                                        onChange={(e) => {
                                                                            if (e.target.files?.[0]) {
                                                                                handleImageUpload(e.target.files[0], qIndex);
                                                                            }
                                                                        }}
                                                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                                    />
                                                                    <div className="flex flex-col items-center gap-2 text-slate-500 group-hover:text-cyan-400 transition-colors">
                                                                        <Upload className="w-8 h-8" />
                                                                        <span className="text-xs font-mono">Click to upload image</span>
                                                                    </div>
                                                                </div>
                                                                {q.image_url && (
                                                                    <div className="relative aspect-video rounded-lg overflow-hidden border border-slate-700 bg-black">
                                                                        <img src={q.image_url} alt="Preview" className="w-full h-full object-contain" />
                                                                        <div className="absolute top-2 right-2 bg-black/50 px-2 py-1 rounded text-[10px] font-mono text-green-400 border border-green-900/50">
                                                                            UPLOADED
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <div className="space-y-3">
                                                                <input
                                                                    type="text"
                                                                    value={q.image_url || ''}
                                                                    onChange={e => updateQuestion(qIndex, 'image_url', e.target.value)}
                                                                    className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-xs focus:border-cyan-500 outline-none font-mono text-cyan-400"
                                                                    placeholder="https://example.com/image.jpg"
                                                                />
                                                                {q.image_url && (
                                                                    <div className="relative aspect-video rounded-lg overflow-hidden border border-slate-700 bg-black">
                                                                        <img
                                                                            src={q.image_url}
                                                                            alt="Preview"
                                                                            className="w-full h-full object-contain"
                                                                            onError={(e) => (e.currentTarget.style.display = 'none')}
                                                                        />
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

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
                                                                readOnly={q.type !== 'multiple_choice'} // Read-only for T/F types
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
