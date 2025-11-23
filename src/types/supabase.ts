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
        }
        Enums: {
            [_ in never]: never
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}
