export interface Hotspot {
    x: number; // Percentage 0-100
    y: number; // Percentage 0-100
    label: string;
}

export interface Question {
    id: string;
    type: 'text' | 'image_verification';
    text: string;
    imageUrl?: string;
    hotspots?: Hotspot[];
    options: string[];
    correctAnswer: number; // Index. For image_verification: 0 = Real, 1 = AI (usually)
    explanation: string;
}

export interface Quiz {
    id: string;
    title: string;
    description: string;
    xpReward: number;
    questions: Question[];
    completed: boolean;
    locked: boolean;

    // Saga Map Fields
    is_milestone?: boolean;
    is_special_mission?: boolean;
    xp_multiplier?: number;
    badge_reward_id?: string;
}

export const MOCK_QUIZZES: Quiz[] = [
    // Tier 1: The Newbie
    {
        id: '1',
        title: 'Module 1: AI Basics & Myths',
        description: 'Understand what AI really is and bust common sci-fi myths.',
        xpReward: 50,
        completed: false,
        locked: false,
        questions: [
            {
                id: 'm1q1',
                type: 'text',
                text: 'What is "Artificial Intelligence" (AI) in simple terms?',
                options: [
                    'A robot that can feel emotions',
                    'Computer systems that can learn and solve problems',
                    'Magic inside a microchip',
                    'A brain grown in a lab'
                ],
                correctAnswer: 1,
                explanation: 'AI is simply software that can learn from data to perform tasks that typically require human intelligence, like recognizing speech or patterns.'
            },
            {
                id: 'm1q2',
                type: 'text',
                text: 'True or False: AI can currently "think" and have feelings like humans.',
                options: [
                    'True, they are conscious',
                    'False, they only process math and data'
                ],
                correctAnswer: 1,
                explanation: 'AI does not have feelings or consciousness. It processes vast amounts of data to predict outcomes, but it doesn\'t "know" what it\'s doing.'
            },
            {
                id: 'm1q3',
                type: 'text',
                text: 'Which of these is a common MYTH about AI?',
                options: [
                    'AI can write poetry',
                    'AI can beat humans at chess',
                    'AI will take over the world tomorrow',
                    'AI helps doctors diagnose diseases'
                ],
                correctAnswer: 2,
                explanation: 'The idea of AI suddenly "taking over" is a sci-fi trope. Current AI is a tool controlled by humans, with specific limitations.'
            },
            {
                id: 'm1q4',
                type: 'text',
                text: 'What is a "Deepfake"?',
                options: [
                    'A deep ocean creature',
                    'AI-generated media that replaces a person\'s likeness',
                    'A fake account on social media',
                    'A type of computer virus'
                ],
                correctAnswer: 1,
                explanation: 'Deepfakes use deep learning to manipulate or generate visual and audio content, often making people say or do things they never did.'
            },
            {
                id: 'm1q5',
                type: 'text',
                text: 'Why is it important to spot AI-generated content?',
                options: [
                    'To win trivia games',
                    'To avoid being tricked by misinformation or scams',
                    'Because AI art is ugly',
                    'It is not important'
                ],
                correctAnswer: 1,
                explanation: 'Scammers use AI to create fake news, fake evidence, and fake personas. Spotting it helps keep you safe from manipulation.'
            }
        ]
    },
    {
        id: '2',
        title: 'Special Mission: Urgent Password Leak!',
        description: 'A high-stakes challenge! Your password might be compromised.',
        xpReward: 100,
        completed: false,
        locked: true,
        is_special_mission: true,
        xp_multiplier: 2,
        questions: [
            {
                id: 'sm1q1',
                type: 'text',
                text: 'You see a notification: "Password found in data breach". What is your FIRST step?',
                options: [
                    'Ignore it, it\'s probably fake',
                    'Change your password immediately on the affected site',
                    'Delete your account',
                    'Email the hacker'
                ],
                correctAnswer: 1,
                explanation: 'Immediate action is required. Change the password on that site and any other site where you used the same password.'
            },
            {
                id: 'sm1q2',
                type: 'text',
                text: 'What makes a password "Strong"?',
                options: [
                    'Your pet\'s name',
                    '123456',
                    'A mix of letters, numbers, and symbols, at least 12 chars long',
                    'Your birthday'
                ],
                correctAnswer: 2,
                explanation: 'Length and complexity are key. Use a password manager to generate and store unique, complex passwords for every site.'
            }
        ]
    },
    {
        id: '3',
        title: 'Milestone: Setup 2FA',
        description: 'Secure your account with Two-Factor Authentication.',
        xpReward: 150,
        completed: false,
        locked: true,
        is_milestone: true,
        badge_reward_id: 'shield_bearer',
        questions: [
            {
                id: 'ms1q1',
                type: 'text',
                text: 'What is 2FA (Two-Factor Authentication)?',
                options: [
                    'Logging in twice',
                    'A second layer of security, like a code sent to your phone',
                    'Two people using one account',
                    'A backup password'
                ],
                correctAnswer: 1,
                explanation: '2FA adds a second step to verify your identity, making it much harder for hackers to access your account even if they steal your password.'
            }
        ]
    },
    // Tier 2: The Social Surfer
    {
        id: '4',
        title: 'Module 2: The Scam Detector',
        description: 'Learn to recognize phishing and the "Grandparent Scam".',
        xpReward: 75,
        completed: false,
        locked: true,
        questions: [
            {
                id: 'm2q1',
                type: 'text',
                text: 'You receive an email from "Netf1ix" saying your account is suspended. What do you do?',
                options: [
                    'Click the link immediately to fix it',
                    'Reply with your password',
                    'Check the sender email address carefully',
                    'Panic and call the police'
                ],
                correctAnswer: 2,
                explanation: 'Phishing emails often use slight misspellings (like "Netf1ix"). Always verify the sender\'s actual email address before clicking anything.'
            },
            {
                id: 'm2q2',
                type: 'text',
                text: 'What is the "Grandparent Scam"?',
                options: [
                    'Scammers stealing from nursing homes',
                    'A scammer using AI voice cloning to pretend to be a grandchild in trouble',
                    'Selling fake dentures',
                    'A discount card for seniors'
                ],
                correctAnswer: 1,
                explanation: 'Scammers use short audio clips from social media to clone a voice, then call relatives claiming to be in jail or hospital and needing money instantly.'
            },
            {
                id: 'm2q3',
                type: 'text',
                text: 'If a "relative" calls asking for money via Gift Cards or Bitcoin, it is likely:',
                options: [
                    'A generic emergency',
                    'A scam',
                    'A convenient way to pay',
                    'A banking error'
                ],
                correctAnswer: 1,
                explanation: 'Legitimate emergencies never require payment via untraceable methods like Gift Cards or Crypto. This is a huge red flag.'
            },
            {
                id: 'm2q4',
                type: 'text',
                text: 'How can you verify if a distress call is real?',
                options: [
                    'Send the money just in case',
                    'Hang up and call the person back on their known number',
                    'Ask them a secret question only they would know',
                    'Both B and C'
                ],
                correctAnswer: 3,
                explanation: 'Always verify. Hang up and call their real number. Having a family "safe word" or asking a specific personal question can also expose the AI bot.'
            },
            {
                id: 'm2q5',
                type: 'text',
                text: 'What is "Voice Cloning"?',
                options: [
                    'Singing in the shower',
                    'Using AI to mimic a specific person\'s voice',
                    'Recording a voice memo',
                    'Speaking with an accent'
                ],
                correctAnswer: 1,
                explanation: 'AI tools can analyze a few seconds of audio to generate a synthetic voice that sounds almost exactly like the original speaker.'
            }
        ]
    },
    // Tier 3: The Pro Shopper
    {
        id: '5',
        title: 'Module 3: Spot the Deepfake',
        description: 'Train your eyes to spot the visual glitches in AI images.',
        xpReward: 100,
        completed: false,
        locked: true,
        questions: [
            {
                id: 'm3q1',
                type: 'image_verification',
                text: 'Is this image Real or AI?',
                imageUrl: 'https://placehold.co/600x400/png?text=AI+Hand+Glitch',
                options: ['Real', 'AI'],
                correctAnswer: 1,
                hotspots: [
                    { x: 50, y: 50, label: 'Look at the fingers. AI often struggles with hands, resulting in too many or distorted fingers.' }
                ],
                explanation: 'AI models often fail to render complex anatomy like hands correctly. Look for extra fingers or "melted" joints.'
            },
            {
                id: 'm3q2',
                type: 'image_verification',
                text: 'Real photo or AI generation?',
                imageUrl: 'https://placehold.co/600x400/png?text=Blurry+Background+Text',
                options: ['Real', 'AI'],
                correctAnswer: 1,
                hotspots: [
                    { x: 20, y: 30, label: 'The text on the sign is gibberish.' },
                    { x: 80, y: 20, label: 'The background faces are distorted.' }
                ],
                explanation: 'AI struggles with text and background details. If the text looks like an alien language or background people look like blobs, it\'s likely AI.'
            },
            {
                id: 'm3q3',
                type: 'image_verification',
                text: 'Can you spot the fake?',
                imageUrl: 'https://placehold.co/600x400/png?text=Perfect+Skin+Texture',
                options: ['Real', 'AI'],
                correctAnswer: 1,
                hotspots: [
                    { x: 50, y: 40, label: 'Skin texture is too smooth, like plastic.' }
                ],
                explanation: 'AI often creates "perfect" skin without pores or natural imperfections, giving it a plastic or airbrushed look.'
            },
            {
                id: 'm3q4',
                type: 'image_verification',
                text: 'Is this person real?',
                imageUrl: 'https://placehold.co/600x400/png?text=Mismatched+Earrings',
                options: ['Real', 'AI'],
                correctAnswer: 1,
                hotspots: [
                    { x: 30, y: 40, label: 'The earring on the left doesn\'t match the right.' }
                ],
                explanation: 'AI often misses symmetry. Check for mismatched accessories, earrings, or eyeglass frames.'
            },
            {
                id: 'm3q5',
                type: 'image_verification',
                text: 'Real or AI?',
                imageUrl: 'https://placehold.co/600x400/png?text=Real+Photo',
                options: ['Real', 'AI'],
                correctAnswer: 0,
                hotspots: [],
                explanation: 'This is a real photo! The lighting is consistent, hands are natural, and background details make sense.'
            }
        ]
    }
];
