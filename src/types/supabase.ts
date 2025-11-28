export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            avatars: {
                Row: {
                    id: string
                    name: string
                    description: string | null
                    src: string
                    rarity: string
                    is_default: boolean
                    created_at: string
                }
                Insert: {
                    id: string
                    name: string
                    description?: string | null
                    src: string
                    rarity: string
                    is_default?: boolean
                    created_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    description?: string | null
                    src?: string
                    rarity?: string
                    is_default?: boolean
                    created_at?: string
                }
                Relationships: []
            }
            profiles: {
                Row: {
                    avatar_url: string | null
                    current_hearts: number | null
                    highest_streak: number | null
                    id: string
                    is_premium: boolean | null
                    referral_code: string | null
                    updated_at: string | null
                    username: string | null
                    xp: number | null
                    unlocked_provinces: string[] | null
                    credits: number
                    streak_freezes: number
                    inventory: Json
                    is_admin: boolean
                    last_login: string | null
                    owned_avatars: string[] | null
                    earned_badges: Json
                    province_scores: Json | null
                    settings_notifications: boolean | null
                    settings_sound: boolean | null
                    settings_haptics: boolean | null
                    has_seen_tutorial: boolean | null
                    created_at: string | null
                }
                Insert: {
                    avatar_url?: string | null
                    current_hearts?: number | null
                    highest_streak?: number | null
                    id: string
                    is_premium?: boolean | null
                    referral_code?: string | null
                    updated_at?: string | null
                    username?: string | null
                    xp?: number | null
                    unlocked_provinces?: string[] | null
                    credits?: number
                    streak_freezes?: number
                    inventory?: Json
                    is_admin?: boolean
                    last_login?: string | null
                    earned_badges?: Json
                    province_scores?: Json
                    settings_notifications?: boolean | null
                    settings_sound?: boolean | null
                    settings_haptics?: boolean | null
                    has_seen_tutorial?: boolean | null
                }
                Update: {
                    avatar_url?: string | null
                    current_hearts?: number | null
                    highest_streak?: number | null
                    id?: string
                    is_premium?: boolean | null
                    referral_code?: string | null
                    updated_at?: string | null
                    username?: string | null
                    xp?: number | null
                    unlocked_provinces?: string[] | null
                    credits?: number
                    streak_freezes?: number
                    inventory?: Json
                    is_admin?: boolean
                    last_login?: string | null
                    earned_badges?: Json
                    province_scores?: Json
                    owned_avatars?: string[] | null
                    settings_notifications?: boolean | null
                    settings_sound?: boolean | null
                    settings_haptics?: boolean | null
                    has_seen_tutorial?: boolean | null
                }
                Relationships: [
                    {
                        foreignKeyName: "profiles_id_fkey"
                        columns: ["id"]
                        isOneToOne: true
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    }
                ]
            }
            friendships: {
                Row: {
                    created_at: string
                    friend_id: string
                    id: string
                    status: "pending" | "accepted" | "blocked"
                    user_id: string
                }
                Insert: {
                    created_at?: string
                    friend_id: string
                    id?: string
                    status?: "pending" | "accepted" | "blocked"
                    user_id: string
                }
                Update: {
                    created_at?: string
                    friend_id?: string
                    id?: string
                    status?: "pending" | "accepted" | "blocked"
                    user_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "friendships_friend_id_fkey"
                        columns: ["friend_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "friendships_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    }
                ]
            }
            missions: {
                Row: {
                    id: string
                    title: string
                    content: string
                    xp_reward: number
                    estimated_time: string
                    region: string | null
                    province_id: string | null
                    created_at: string
                    level: 'TUTORIAL' | 'SEMPLICE' | 'DIFFICILE' | 'BOSS'
                    description: string | null
                }
                Insert: {
                    id?: string
                    title: string
                    content: string
                    xp_reward?: number
                    estimated_time?: string
                    region?: string | null
                    province_id?: string | null
                    created_at?: string
                    level?: 'TUTORIAL' | 'SEMPLICE' | 'DIFFICILE' | 'BOSS'
                    description?: string | null
                }
                Update: {
                    id?: string
                    title?: string
                    content?: string
                    xp_reward?: number
                    estimated_time?: string
                    region?: string | null
                    province_id?: string | null
                    created_at?: string
                    level?: 'TUTORIAL' | 'SEMPLICE' | 'DIFFICILE' | 'BOSS'
                    description?: string | null
                }
                Relationships: []
            }
            mission_questions: {
                Row: {
                    id: string
                    mission_id: string
                    text: string
                    options: string[] // JSONB array
                    correct_answer: number
                    explanation: string
                    created_at: string
                    type: 'multiple_choice' | 'true_false' | 'image_true_false'
                    image_url: string | null
                }
                Insert: {
                    id?: string
                    mission_id: string
                    text: string
                    options: string[]
                    correct_answer: number
                    explanation: string
                    created_at?: string
                    type?: 'multiple_choice' | 'true_false' | 'image_true_false'
                    image_url?: string | null
                }
                Update: {
                    id?: string
                    mission_id?: string
                    text?: string
                    options?: string[]
                    correct_answer?: number
                    explanation?: string
                    created_at?: string
                    type?: 'multiple_choice' | 'true_false' | 'image_true_false'
                    image_url?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "mission_questions_mission_id_fkey"
                        columns: ["mission_id"]
                        referencedRelation: "missions"
                        referencedColumns: ["id"]
                    }
                ]
            }
            shop_items: {
                Row: {
                    id: string
                    name: string
                    description: string
                    icon: string
                    cost: number
                    type: string
                    rarity: string
                    stock: number | null
                    is_limited: boolean
                    effect_type: string
                    effect_value: number | null
                    created_at: string
                    label: string | null
                }
                Insert: {
                    id: string
                    name: string
                    description: string
                    icon: string
                    cost: number
                    type?: string
                    rarity?: string
                    stock?: number | null
                    is_limited?: boolean
                    effect_type?: string
                    effect_value?: number | null
                    created_at?: string
                    label?: string | null
                }
                Update: {
                    id?: string
                    name?: string
                    description?: string
                    icon?: string
                    cost?: number
                    type?: string
                    rarity?: string
                    stock?: number | null
                    is_limited?: boolean
                    effect_type?: string
                    effect_value?: number | null
                    created_at?: string
                    label?: string | null
                }
                Relationships: []
            }
            badges: {
                Row: {
                    id: string
                    name: string
                    description: string
                    icon: string
                    category: string
                    xp_reward: number
                    rarity: string
                    condition_type: string
                    condition_value: string | null
                    created_at: string
                }
                Insert: {
                    id: string
                    name: string
                    description: string
                    icon: string
                    category: string
                    xp_reward: number
                    rarity: string
                    condition_type: string
                    condition_value?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    description?: string
                    icon?: string
                    category?: string
                    xp_reward?: number
                    rarity?: string
                    condition_type?: string
                    condition_value?: string | null
                    created_at?: string
                }
                Relationships: []
            }
            friends: {
                Row: {
                    created_at: string
                    friend_id: string
                    id: string
                    status: string
                    user_id: string
                }
                Insert: {
                    created_at?: string
                    friend_id: string
                    id?: string
                    status?: string
                    user_id: string
                }
                Update: {
                    created_at?: string
                    friend_id?: string
                    id?: string
                    status?: string
                    user_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "friends_friend_id_fkey"
                        columns: ["friend_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "friends_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                ]
            }
            challenges: {
                Row: {
                    challenger_id: string
                    challenger_score: number | null
                    created_at: string
                    id: string
                    opponent_id: string
                    opponent_score: number | null
                    quiz_id: string
                    quiz_seed: number | null
                    status: "pending" | "completed" | "declined"
                    winner_id: string | null
                }
                Insert: {
                    challenger_id: string
                    challenger_score?: number | null
                    created_at?: string
                    id?: string
                    opponent_id: string
                    opponent_score?: number | null
                    quiz_id: string
                    quiz_seed?: number | null
                    status?: "pending" | "completed" | "declined"
                    winner_id?: string | null
                }
                Update: {
                    challenger_id?: string
                    challenger_score?: number | null
                    created_at?: string
                    id?: string
                    opponent_id?: string
                    opponent_score?: number | null
                    quiz_id?: string
                    quiz_seed?: number | null
                    status?: "pending" | "completed" | "declined"
                    winner_id?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "challenges_challenger_id_fkey"
                        columns: ["challenger_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "challenges_opponent_id_fkey"
                        columns: ["opponent_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "challenges_winner_id_fkey"
                        columns: ["winner_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    }
                ]
            }
            modules: {
                Row: {
                    created_at: string
                    description: string | null
                    id: string
                    order_index: number
                    theme_color: string | null
                    title: string
                }
                Insert: {
                    created_at?: string
                    description?: string | null
                    id?: string
                    order_index: number
                    theme_color?: string | null
                    title: string
                }
                Update: {
                    created_at?: string
                    description?: string | null
                    id?: string
                    order_index?: number
                    theme_color?: string | null
                    title?: string
                }
                Relationships: []
            }
            levels: {
                Row: {
                    created_at: string
                    day_number: number
                    id: string
                    is_boss_level: boolean
                    module_id: string
                    title: string
                    xp_reward: number
                }
                Insert: {
                    created_at?: string
                    day_number: number
                    id?: string
                    is_boss_level?: boolean
                    module_id: string
                    title: string
                    xp_reward?: number
                }
                Update: {
                    created_at?: string
                    day_number?: number
                    id?: string
                    is_boss_level?: boolean
                    module_id?: string
                    title?: string
                    xp_reward?: number
                }
                Relationships: [
                    {
                        foreignKeyName: "levels_module_id_fkey"
                        columns: ["module_id"]
                        isOneToOne: false
                        referencedRelation: "modules"
                        referencedColumns: ["id"]
                    }
                ]
            }
            questions: {
                Row: {
                    correct_index: number
                    created_at: string
                    explanation: string | null
                    hotspots: Json | null
                    id: string
                    image_url: string | null
                    level_id: string
                    options: string[]
                    text: string
                    type: "text" | "image"
                }
                Insert: {
                    correct_index: number
                    created_at?: string
                    explanation?: string | null
                    hotspots?: Json | null
                    id?: string
                    image_url?: string | null
                    level_id: string
                    options: string[]
                    text: string
                    type?: "text" | "image"
                }
                Update: {
                    correct_index?: number
                    created_at?: string
                    explanation?: string | null
                    hotspots?: Json | null
                    id?: string
                    image_url?: string | null
                    level_id?: string
                    options?: string[]
                    text?: string
                    type?: "text" | "image"
                }
                Relationships: [
                    {
                        foreignKeyName: "questions_level_id_fkey"
                        columns: ["level_id"]
                        isOneToOne: false
                        referencedRelation: "levels"
                        referencedColumns: ["id"]
                    }
                ]
            }
            user_progress: {
                Row: {
                    completed_at: string | null
                    id: string
                    quiz_id: string
                    score: number
                    user_id: string
                }
                Insert: {
                    completed_at?: string | null
                    id?: string
                    quiz_id: string
                    score: number
                    user_id: string
                }
                Update: {
                    completed_at?: string | null
                    id?: string
                    quiz_id?: string
                    score?: number
                    user_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "user_progress_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    }
                ]
            }
            mystery_box_loot: {
                Row: {
                    id: string
                    box_id: string
                    reward_type: string
                    reward_value: number
                    weight: number
                    description: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    box_id: string
                    reward_type: string
                    reward_value: number
                    weight: number
                    description: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    box_id?: string
                    reward_type?: string
                    reward_value?: number
                    weight?: number
                    description?: string
                    created_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "mystery_box_loot_box_id_fkey"
                        columns: ["box_id"]
                        isOneToOne: false
                        referencedRelation: "shop_items"
                        referencedColumns: ["id"]
                    }
                ]
            }
            push_subscriptions: {
                Row: {
                    id: string
                    user_id: string
                    subscription: Json
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    subscription: Json
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    subscription?: Json
                    created_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "push_subscriptions_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    }
                ]
            }
            feedback: {
                Row: {
                    id: string
                    user_id: string
                    type: 'bug' | 'feature' | 'like' | 'dislike'
                    message: string
                    status: 'new' | 'read' | 'archived'
                    device_info: Json
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    type: 'bug' | 'feature' | 'like' | 'dislike'
                    message: string
                    status?: 'new' | 'read' | 'archived'
                    device_info?: Json
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    type?: 'bug' | 'feature' | 'like' | 'dislike'
                    message?: string
                    status?: 'new' | 'read' | 'archived'
                    device_info?: Json
                    created_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "feedback_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    }
                ]
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            decrement_hearts: {
                Args: Record<PropertyKey, never>
                Returns: undefined
            }
            redeem_code: {
                Args: {
                    code: string
                }
                Returns: Json
            }
            get_user_saga_state: {
                Args: Record<PropertyKey, never>
                Returns: Json
            }
            complete_level: {
                Args: {
                    p_user_id: string
                    p_level_id: string
                    p_score: number
                }
                Returns: Json
            }
            increment_credits: {
                Args: {
                    p_user_id: string
                    p_amount: number
                }
                Returns: void
            }
            purchase_item: {
                Args: {
                    p_user_id: string
                    p_item_id: string
                }
                Returns: Json
            }
            claim_mission_reward: {
                Args: {
                    p_user_id: string
                    p_mission_id: string
                }
                Returns: Json
            }
            get_analytics_overview: {
                Args: Record<PropertyKey, never>
                Returns: Json
            }
            get_user_growth: {
                Args: Record<PropertyKey, never>
                Returns: Json
            }
            get_mission_stats: {
                Args: Record<PropertyKey, never>
                Returns: Json
            }
            get_advanced_stats: {
                Args: Record<PropertyKey, never>
                Returns: Json
            }
            get_user_rank: {
                Args: Record<PropertyKey, never>
                Returns: number
            }
            admin_restore_data: {
                Args: {
                    payload: Json
                }
                Returns: Json
            }
        }
        Enums: {
            [_ in never]: never
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}
