const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load env vars manually since we might not have dotenv installed in this environment
// In a real scenario, use dotenv. Here we assume they are set or we'll use placeholders.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_KEY'; // Ideally use SERVICE_ROLE_KEY for seeding

if (!supabaseUrl || !supabaseKey || supabaseUrl === 'YOUR_SUPABASE_URL') {
    console.error('Error: Missing Supabase credentials. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY (or SERVICE_ROLE_KEY).');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
    console.log('Starting seed...');

    // Load Content
    const week1 = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/lib/week1_content.json'), 'utf8'));
    const week2 = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/lib/week2_content.json'), 'utf8'));
    const week34 = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/lib/week3_4_content.json'), 'utf8'));

    const allQuestions = [...week1, ...week2, ...week34];

    // Group by Module (Week)
    // We'll assume 4 modules based on the day ranges
    const modulesData = [
        { title: 'Week 1: The Iron Shield', description: 'Passwords, Phishing, and AI Basics', theme_color: 'blue', order_index: 1, day_start: 1, day_end: 7 },
        { title: 'Week 2: Finance & Fraud Defense', description: 'Banking, Crypto, and Identity Theft', theme_color: 'green', order_index: 2, day_start: 8, day_end: 14 },
        { title: 'Week 3: Corporate Survival', description: 'AI in the Workplace and Data Privacy', theme_color: 'purple', order_index: 3, day_start: 15, day_end: 21 }, // Adjusting range slightly to fit 4 weeks
        { title: 'Week 4: Civil Defense', description: 'Disinformation and Fake News', theme_color: 'red', order_index: 4, day_start: 22, day_end: 30 }
    ];

    for (const mod of modulesData) {
        console.log(`Creating Module: ${mod.title}`);
        const { data: moduleData, error: modError } = await supabase
            .from('modules')
            .insert({
                title: mod.title,
                description: mod.description,
                theme_color: mod.theme_color,
                order_index: mod.order_index
            })
            .select()
            .single();

        if (modError) {
            console.error('Error creating module:', modError);
            continue;
        }

        // Create Levels for this Module
        // We find questions that fall into this module's day range
        // Group questions by day_number to create levels
        const moduleQuestions = allQuestions.filter(q => q.day_number >= mod.day_start && q.day_number <= mod.day_end);
        const days = [...new Set(moduleQuestions.map(q => q.day_number))];

        for (const day of days) {
            const dayQuestions = moduleQuestions.filter(q => q.day_number === day);
            const firstQ = dayQuestions[0];
            const isBoss = day % 7 === 0; // Every 7th day is a boss level

            console.log(`  Creating Level Day ${day}: ${firstQ.module_title}`);

            const { data: levelData, error: levelError } = await supabase
                .from('levels')
                .insert({
                    module_id: moduleData.id,
                    day_number: day,
                    title: firstQ.module_title, // Use the module_title from JSON as level title
                    is_boss_level: isBoss,
                    xp_reward: isBoss ? 50 : 20 // Base XP
                })
                .select()
                .single();

            if (levelError) {
                console.error('  Error creating level:', levelError);
                continue;
            }

            // Insert Questions
            const questionsToInsert = dayQuestions.map(q => ({
                level_id: levelData.id,
                text: q.question_text,
                options: q.options,
                correct_index: q.correct_option_index,
                explanation: q.explanation_feedback,
                type: q.type || 'text',
                // xp_reward is on the level now, but we could store it on question if needed. 
                // For now schema puts it on level.
            }));

            const { error: qError } = await supabase.from('questions').insert(questionsToInsert);
            if (qError) {
                console.error('    Error inserting questions:', qError);
            } else {
                console.log(`    Inserted ${questionsToInsert.length} questions.`);
            }
        }
    }

    console.log('Seeding complete!');
}

seed();
