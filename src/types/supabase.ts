export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      _EquipmentSlotCompatibleTypes: {
        Row: {
          A: string
          B: string
        }
        Insert: {
          A: string
          B: string
        }
        Update: {
          A?: string
          B?: string
        }
        Relationships: [
          {
            foreignKeyName: "_EquipmentSlotCompatibleTypes_A_fkey"
            columns: ["A"]
            isOneToOne: false
            referencedRelation: "item_slot"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "_EquipmentSlotCompatibleTypes_B_fkey"
            columns: ["B"]
            isOneToOne: false
            referencedRelation: "item_type"
            referencedColumns: ["id"]
          },
        ]
      }
      _mission_rewards: {
        Row: {
          A: string
          B: string
        }
        Insert: {
          A: string
          B: string
        }
        Update: {
          A?: string
          B?: string
        }
        Relationships: [
          {
            foreignKeyName: "_mission_rewards_A_fkey"
            columns: ["A"]
            isOneToOne: false
            referencedRelation: "mission"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "_mission_rewards_B_fkey"
            columns: ["B"]
            isOneToOne: false
            referencedRelation: "reward_item"
            referencedColumns: ["id"]
          },
        ]
      }
      _prisma_migrations: {
        Row: {
          applied_steps_count: number
          checksum: string
          finished_at: string | null
          id: string
          logs: string | null
          migration_name: string
          rolled_back_at: string | null
          started_at: string
        }
        Insert: {
          applied_steps_count?: number
          checksum: string
          finished_at?: string | null
          id: string
          logs?: string | null
          migration_name: string
          rolled_back_at?: string | null
          started_at?: string
        }
        Update: {
          applied_steps_count?: number
          checksum?: string
          finished_at?: string | null
          id?: string
          logs?: string | null
          migration_name?: string
          rolled_back_at?: string | null
          started_at?: string
        }
        Relationships: []
      }
      battle_pass: {
        Row: {
          background_url: string | null
          banner_url: string | null
          color_primary: string | null
          color_secondary: string | null
          color_tertiary: string | null
          community_id: string
          created_at: string
          description: string | null
          font_color: string | null
          id: string
          logo_url: string | null
          name: string
          updated_at: string
        }
        Insert: {
          background_url?: string | null
          banner_url?: string | null
          color_primary?: string | null
          color_secondary?: string | null
          color_tertiary?: string | null
          community_id: string
          created_at?: string
          description?: string | null
          font_color?: string | null
          id: string
          logo_url?: string | null
          name?: string
          updated_at: string
        }
        Update: {
          background_url?: string | null
          banner_url?: string | null
          color_primary?: string | null
          color_secondary?: string | null
          color_tertiary?: string | null
          community_id?: string
          created_at?: string
          description?: string | null
          font_color?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "battle_pass_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "community"
            referencedColumns: ["id"]
          },
        ]
      }
      battle_pass_level: {
        Row: {
          battle_pass_id: string
          created_at: string
          id: string
          level_image_url: string | null
          level_order: number
          updated_at: string
          xp_threshold_total: number
        }
        Insert: {
          battle_pass_id: string
          created_at?: string
          id?: string
          level_image_url?: string | null
          level_order: number
          updated_at?: string
          xp_threshold_total: number
        }
        Update: {
          battle_pass_id?: string
          created_at?: string
          id?: string
          level_image_url?: string | null
          level_order?: number
          updated_at?: string
          xp_threshold_total?: number
        }
        Relationships: [
          {
            foreignKeyName: "battle_pass_level_battle_pass_id_fkey"
            columns: ["battle_pass_id"]
            isOneToOne: false
            referencedRelation: "battle_pass"
            referencedColumns: ["id"]
          },
        ]
      }
      battle_pass_level_reward: {
        Row: {
          battle_pass_level_id: string
          created_at: string
          id: string
          reward_id: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          battle_pass_level_id: string
          created_at?: string
          id?: string
          reward_id: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          battle_pass_level_id?: string
          created_at?: string
          id?: string
          reward_id?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "battle_pass_level_reward_battle_pass_level_id_fkey"
            columns: ["battle_pass_level_id"]
            isOneToOne: false
            referencedRelation: "battle_pass_level"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "battle_pass_level_reward_reward_id_fkey"
            columns: ["reward_id"]
            isOneToOne: false
            referencedRelation: "reward"
            referencedColumns: ["id"]
          },
        ]
      }
      battle_pass_mission: {
        Row: {
          battle_pass_id: string
          created_at: string
          mission_id: string
        }
        Insert: {
          battle_pass_id: string
          created_at?: string
          mission_id: string
        }
        Update: {
          battle_pass_id?: string
          created_at?: string
          mission_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "battle_pass_mission_battle_pass_id_fkey"
            columns: ["battle_pass_id"]
            isOneToOne: false
            referencedRelation: "battle_pass"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "battle_pass_mission_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "mission"
            referencedColumns: ["id"]
          },
        ]
      }
      battle_pass_mission_progress: {
        Row: {
          battle_pass_id: string
          completed_at: string | null
          created_at: string
          id: string
          is_claimed: boolean
          mission_id: string
          started_at: string
          status: Database["public"]["Enums"]["MissionStatus"]
          updated_at: string
          user_id: string
        }
        Insert: {
          battle_pass_id: string
          completed_at?: string | null
          created_at?: string
          id: string
          is_claimed?: boolean
          mission_id: string
          started_at: string
          status: Database["public"]["Enums"]["MissionStatus"]
          updated_at: string
          user_id: string
        }
        Update: {
          battle_pass_id?: string
          completed_at?: string | null
          created_at?: string
          id?: string
          is_claimed?: boolean
          mission_id?: string
          started_at?: string
          status?: Database["public"]["Enums"]["MissionStatus"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "battle_pass_mission_progress_battle_pass_id_fkey"
            columns: ["battle_pass_id"]
            isOneToOne: false
            referencedRelation: "battle_pass"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "battle_pass_mission_progress_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "mission"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "battle_pass_mission_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      battle_pass_objective_progress: {
        Row: {
          battle_pass_mission_progress_id: string
          completed: boolean
          created_at: string
          current_amount: number
          id: string
          mission_id: string | null
          objective_id: string
          updated_at: string
        }
        Insert: {
          battle_pass_mission_progress_id: string
          completed?: boolean
          created_at?: string
          current_amount?: number
          id: string
          mission_id?: string | null
          objective_id: string
          updated_at: string
        }
        Update: {
          battle_pass_mission_progress_id?: string
          completed?: boolean
          created_at?: string
          current_amount?: number
          id?: string
          mission_id?: string | null
          objective_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "battle_pass_objective_progress_battle_pass_mission_progress_id_"
            columns: ["battle_pass_mission_progress_id"]
            isOneToOne: false
            referencedRelation: "battle_pass_mission_progress"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "battle_pass_objective_progress_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "mission"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "battle_pass_objective_progress_objective_id_fkey"
            columns: ["objective_id"]
            isOneToOne: false
            referencedRelation: "objective"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "objective_progress_missionId_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "mission"
            referencedColumns: ["id"]
          },
        ]
      }
      battle_pass_objective_progress_history: {
        Row: {
          battle_pass_objective_progress_id: string
          change_date: string
          change_type: Database["public"]["Enums"]["ChangeType"]
          completed_by_this_update: boolean
          event_data: Json | null
          event_id: string | null
          id: string
          new_amount: number
          previous_amount: number
          source: string | null
        }
        Insert: {
          battle_pass_objective_progress_id: string
          change_date?: string
          change_type: Database["public"]["Enums"]["ChangeType"]
          completed_by_this_update?: boolean
          event_data?: Json | null
          event_id?: string | null
          id: string
          new_amount: number
          previous_amount: number
          source?: string | null
        }
        Update: {
          battle_pass_objective_progress_id?: string
          change_date?: string
          change_type?: Database["public"]["Enums"]["ChangeType"]
          completed_by_this_update?: boolean
          event_data?: Json | null
          event_id?: string | null
          id?: string
          new_amount?: number
          previous_amount?: number
          source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "battle_pass_objective_progress_history_battle_pass_objective_pr"
            columns: ["battle_pass_objective_progress_id"]
            isOneToOne: false
            referencedRelation: "battle_pass_objective_progress"
            referencedColumns: ["id"]
          },
        ]
      }
      community: {
        Row: {
          background_url: string | null
          banner_url: string | null
          color_primary: string | null
          color_secondary: string | null
          color_tertiary: string | null
          created_at: string
          description: string | null
          font_color: string | null
          id: string
          is_public: boolean
          logo_url: string | null
          name: string
          updated_at: string
        }
        Insert: {
          background_url?: string | null
          banner_url?: string | null
          color_primary?: string | null
          color_secondary?: string | null
          color_tertiary?: string | null
          created_at?: string
          description?: string | null
          font_color?: string | null
          id: string
          is_public?: boolean
          logo_url?: string | null
          name: string
          updated_at: string
        }
        Update: {
          background_url?: string | null
          banner_url?: string | null
          color_primary?: string | null
          color_secondary?: string | null
          color_tertiary?: string | null
          created_at?: string
          description?: string | null
          font_color?: string | null
          id?: string
          is_public?: boolean
          logo_url?: string | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      community_user: {
        Row: {
          assigned_at: string
          community_id: string
          user_id: string
        }
        Insert: {
          assigned_at: string
          community_id: string
          user_id: string
        }
        Update: {
          assigned_at?: string
          community_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_user_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "community"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_user_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      cs_map: {
        Row: {
          created_at: string
          cs_match_id: string
          hltv_map_stats_id: string | null
          id: string
          map_name: string
          play_order: number
          team_a_score: number | null
          team_a_won: boolean | null
          team_b_score: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          cs_match_id: string
          hltv_map_stats_id?: string | null
          id?: string
          map_name: string
          play_order: number
          team_a_score?: number | null
          team_a_won?: boolean | null
          team_b_score?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          cs_match_id?: string
          hltv_map_stats_id?: string | null
          id?: string
          map_name?: string
          play_order?: number
          team_a_score?: number | null
          team_a_won?: boolean | null
          team_b_score?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cs_map_cs_match_id_fkey"
            columns: ["cs_match_id"]
            isOneToOne: false
            referencedRelation: "cs_match"
            referencedColumns: ["id"]
          },
        ]
      }
      cs_match: {
        Row: {
          created_at: string
          format: string | null
          hltv_match_id: string | null
          id: string
          matchday_id: string
          starts_at: string
          status: Database["public"]["Enums"]["CsMatchStatus"]
          team_a_id: string
          team_b_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          format?: string | null
          hltv_match_id?: string | null
          id?: string
          matchday_id: string
          starts_at: string
          status?: Database["public"]["Enums"]["CsMatchStatus"]
          team_a_id: string
          team_b_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          format?: string | null
          hltv_match_id?: string | null
          id?: string
          matchday_id?: string
          starts_at?: string
          status?: Database["public"]["Enums"]["CsMatchStatus"]
          team_a_id?: string
          team_b_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cs_match_matchday_id_fkey"
            columns: ["matchday_id"]
            isOneToOne: false
            referencedRelation: "matchday"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cs_match_team_a_id_fkey"
            columns: ["team_a_id"]
            isOneToOne: false
            referencedRelation: "cs_team"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cs_match_team_b_id_fkey"
            columns: ["team_b_id"]
            isOneToOne: false
            referencedRelation: "cs_team"
            referencedColumns: ["id"]
          },
        ]
      }
      cs_player: {
        Row: {
          avatar_url: string | null
          created_at: string
          cs_team_id: string
          hltv_player_id: string | null
          id: string
          nickname: string
          real_name: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          cs_team_id: string
          hltv_player_id?: string | null
          id?: string
          nickname: string
          real_name?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          cs_team_id?: string
          hltv_player_id?: string | null
          id?: string
          nickname?: string
          real_name?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cs_player_cs_team_id_fkey"
            columns: ["cs_team_id"]
            isOneToOne: false
            referencedRelation: "cs_team"
            referencedColumns: ["id"]
          },
        ]
      }
      cs_team: {
        Row: {
          created_at: string
          hltv_team_id: string | null
          id: string
          logo_url: string | null
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          hltv_team_id?: string | null
          id?: string
          logo_url?: string | null
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          hltv_team_id?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      item: {
        Row: {
          created_at: string
          description: string
          id: string
          image_url: string
          is_free: boolean
          item_type: string
          max_quantity: number
          metadata: Json
          name: string
          rarity: Database["public"]["Enums"]["ItemRarity"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          id: string
          image_url: string
          is_free?: boolean
          item_type: string
          max_quantity?: number
          metadata?: Json
          name: string
          rarity?: Database["public"]["Enums"]["ItemRarity"]
          updated_at: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          image_url?: string
          is_free?: boolean
          item_type?: string
          max_quantity?: number
          metadata?: Json
          name?: string
          rarity?: Database["public"]["Enums"]["ItemRarity"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "item_item_type_fkey"
            columns: ["item_type"]
            isOneToOne: false
            referencedRelation: "item_type"
            referencedColumns: ["id"]
          },
        ]
      }
      item_slot: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_unique: boolean
          metadata: Json
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id: string
          is_unique?: boolean
          metadata?: Json
          name: string
          updated_at: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_unique?: boolean
          metadata?: Json
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      item_type: {
        Row: {
          created_at: string
          id: string
          name: Database["public"]["Enums"]["ItemType"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id: string
          name: Database["public"]["Enums"]["ItemType"]
          updated_at: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: Database["public"]["Enums"]["ItemType"]
          updated_at?: string
        }
        Relationships: []
      }
      item_user_slot: {
        Row: {
          assigned_at: string
          id: string
          slot_id: string
          user_id: string
          user_item_id: string
        }
        Insert: {
          assigned_at?: string
          id: string
          slot_id: string
          user_id: string
          user_item_id: string
        }
        Update: {
          assigned_at?: string
          id?: string
          slot_id?: string
          user_id?: string
          user_item_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "item_user_slot_slot_id_fkey"
            columns: ["slot_id"]
            isOneToOne: false
            referencedRelation: "item_slot"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "item_user_slot_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "item_user_slot_user_item_id_fkey"
            columns: ["user_item_id"]
            isOneToOne: false
            referencedRelation: "user_item"
            referencedColumns: ["id"]
          },
        ]
      }
      matchday: {
        Row: {
          created_at: string
          day_number: number
          id: string
          lineup_locks_at: string
          starts_at: string
          status: Database["public"]["Enums"]["MatchdayStatus"]
          tournament_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          day_number: number
          id?: string
          lineup_locks_at: string
          starts_at: string
          status?: Database["public"]["Enums"]["MatchdayStatus"]
          tournament_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          day_number?: number
          id?: string
          lineup_locks_at?: string
          starts_at?: string
          status?: Database["public"]["Enums"]["MatchdayStatus"]
          tournament_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "matchday_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournament"
            referencedColumns: ["id"]
          },
        ]
      }
      mission: {
        Row: {
          created_at: string
          description: string
          end_date: string | null
          id: string
          name: string
          repeat_type: Database["public"]["Enums"]["MissionRepeat"]
          start_date: string | null
          time_limit_type: Database["public"]["Enums"]["MissionLimit"]
          time_limit_value: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          end_date?: string | null
          id: string
          name: string
          repeat_type: Database["public"]["Enums"]["MissionRepeat"]
          start_date?: string | null
          time_limit_type: Database["public"]["Enums"]["MissionLimit"]
          time_limit_value?: number | null
          updated_at: string
        }
        Update: {
          created_at?: string
          description?: string
          end_date?: string | null
          id?: string
          name?: string
          repeat_type?: Database["public"]["Enums"]["MissionRepeat"]
          start_date?: string | null
          time_limit_type?: Database["public"]["Enums"]["MissionLimit"]
          time_limit_value?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      objective: {
        Row: {
          created_at: string
          event_name: string
          id: string
          mission_id: string
          required_amount: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          event_name: string
          id: string
          mission_id: string
          required_amount?: number
          updated_at: string
        }
        Update: {
          created_at?: string
          event_name?: string
          id?: string
          mission_id?: string
          required_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "objective_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "mission"
            referencedColumns: ["id"]
          },
        ]
      }
      objective_condition: {
        Row: {
          created_at: string
          id: string
          objective_id: string
          operator: Database["public"]["Enums"]["ConditionOperator"]
          property_path: string
          updated_at: string
          value: string
        }
        Insert: {
          created_at?: string
          id: string
          objective_id: string
          operator: Database["public"]["Enums"]["ConditionOperator"]
          property_path: string
          updated_at: string
          value: string
        }
        Update: {
          created_at?: string
          id?: string
          objective_id?: string
          operator?: Database["public"]["Enums"]["ConditionOperator"]
          property_path?: string
          updated_at?: string
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "objective_condition_objective_id_fkey"
            columns: ["objective_id"]
            isOneToOne: false
            referencedRelation: "objective"
            referencedColumns: ["id"]
          },
        ]
      }
      player: {
        Row: {
          community_id: string
          created_at: string
          id: string
          image_url: string | null
          name: string
        }
        Insert: {
          community_id: string
          created_at?: string
          id?: string
          image_url?: string | null
          name: string
        }
        Update: {
          community_id?: string
          created_at?: string
          id?: string
          image_url?: string | null
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "player_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "community"
            referencedColumns: ["id"]
          },
        ]
      }
      player_card: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          name: string
          player_id: string
          rarity: Database["public"]["Enums"]["PlayerCardRarity"] | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          player_id: string
          rarity?: Database["public"]["Enums"]["PlayerCardRarity"] | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          player_id?: string
          rarity?: Database["public"]["Enums"]["PlayerCardRarity"] | null
        }
        Relationships: [
          {
            foreignKeyName: "player_card_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "player"
            referencedColumns: ["id"]
          },
        ]
      }
      player_card_mission: {
        Row: {
          created_at: string
          mission_id: string
          player_card_id: string
        }
        Insert: {
          created_at?: string
          mission_id: string
          player_card_id: string
        }
        Update: {
          created_at?: string
          mission_id?: string
          player_card_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "player_card_mission_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "mission"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "player_card_mission_player_card_id_fkey"
            columns: ["player_card_id"]
            isOneToOne: false
            referencedRelation: "player_card"
            referencedColumns: ["id"]
          },
        ]
      }
      player_card_mission_progress: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          is_claimed: boolean
          mission_id: string
          player_card_id: string
          started_at: string
          status: Database["public"]["Enums"]["MissionStatus"]
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          is_claimed?: boolean
          mission_id: string
          player_card_id: string
          started_at?: string
          status?: Database["public"]["Enums"]["MissionStatus"]
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          is_claimed?: boolean
          mission_id?: string
          player_card_id?: string
          started_at?: string
          status?: Database["public"]["Enums"]["MissionStatus"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "player_card_mission_progress_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "mission"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "player_card_mission_progress_player_card_mission_fkey"
            columns: ["player_card_id", "mission_id"]
            isOneToOne: false
            referencedRelation: "player_card_mission"
            referencedColumns: ["player_card_id", "mission_id"]
          },
          {
            foreignKeyName: "player_card_mission_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      player_card_objective_progress: {
        Row: {
          completed: boolean
          created_at: string
          current_amount: number
          id: string
          mission_id: string | null
          objective_id: string
          player_card_mission_progress_id: string
          updated_at: string
        }
        Insert: {
          completed?: boolean
          created_at?: string
          current_amount?: number
          id?: string
          mission_id?: string | null
          objective_id: string
          player_card_mission_progress_id: string
          updated_at?: string
        }
        Update: {
          completed?: boolean
          created_at?: string
          current_amount?: number
          id?: string
          mission_id?: string | null
          objective_id?: string
          player_card_mission_progress_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "player_card_objective_progress_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "mission"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "player_card_objective_progress_objective_id_fkey"
            columns: ["objective_id"]
            isOneToOne: false
            referencedRelation: "objective"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "player_card_objective_progress_player_card_mission_progress_id_"
            columns: ["player_card_mission_progress_id"]
            isOneToOne: false
            referencedRelation: "player_card_mission_progress"
            referencedColumns: ["id"]
          },
        ]
      }
      player_card_objective_progress_history: {
        Row: {
          change_date: string
          change_type: Database["public"]["Enums"]["ChangeType"]
          completed_by_this_update: boolean
          event_data: Json | null
          event_id: string | null
          id: string
          new_amount: number
          player_card_objective_progress_id: string
          previous_amount: number
          source: string | null
        }
        Insert: {
          change_date?: string
          change_type: Database["public"]["Enums"]["ChangeType"]
          completed_by_this_update?: boolean
          event_data?: Json | null
          event_id?: string | null
          id?: string
          new_amount: number
          player_card_objective_progress_id: string
          previous_amount: number
          source?: string | null
        }
        Update: {
          change_date?: string
          change_type?: Database["public"]["Enums"]["ChangeType"]
          completed_by_this_update?: boolean
          event_data?: Json | null
          event_id?: string | null
          id?: string
          new_amount?: number
          player_card_objective_progress_id?: string
          previous_amount?: number
          source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "player_card_objective_progress_history_player_card_objective_pr"
            columns: ["player_card_objective_progress_id"]
            isOneToOne: false
            referencedRelation: "player_card_objective_progress"
            referencedColumns: ["id"]
          },
        ]
      }
      player_level: {
        Row: {
          created_at: string
          id: string
          level_image_url: string | null
          level_order: number
          player_id: string
          updated_at: string
          xp_threshold_total: number
        }
        Insert: {
          created_at?: string
          id?: string
          level_image_url?: string | null
          level_order: number
          player_id: string
          updated_at?: string
          xp_threshold_total: number
        }
        Update: {
          created_at?: string
          id?: string
          level_image_url?: string | null
          level_order?: number
          player_id?: string
          updated_at?: string
          xp_threshold_total?: number
        }
        Relationships: [
          {
            foreignKeyName: "player_level_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "player"
            referencedColumns: ["id"]
          },
        ]
      }
      player_level_reward: {
        Row: {
          created_at: string
          id: string
          player_level_id: string
          reward_id: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          player_level_id: string
          reward_id: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          player_level_id?: string
          reward_id?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "player_card_rarity_step_reward_reward_id_fkey"
            columns: ["reward_id"]
            isOneToOne: false
            referencedRelation: "reward"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "player_level_reward_player_level_id_fkey"
            columns: ["player_level_id"]
            isOneToOne: false
            referencedRelation: "player_level"
            referencedColumns: ["id"]
          },
        ]
      }
      player_map_stats: {
        Row: {
          adr: number
          assists: number
          clutch_1v2: number
          clutch_1v3: number
          clutch_1v4: number
          clutch_1v5: number
          clutches_won: number
          created_at: string
          cs_map_id: string
          cs_player_id: string
          deaths: number
          flash_assists: number
          headshots: number
          id: string
          kast: number
          kills: number
          multi_kills: number
          opening_deaths: number
          opening_kills: number
          rating_3: number
          swing: number
          trade_deaths: number
          updated_at: string
        }
        Insert: {
          adr?: number
          assists?: number
          clutch_1v2?: number
          clutch_1v3?: number
          clutch_1v4?: number
          clutch_1v5?: number
          clutches_won?: number
          created_at?: string
          cs_map_id: string
          cs_player_id: string
          deaths?: number
          flash_assists?: number
          headshots?: number
          id?: string
          kast?: number
          kills?: number
          multi_kills?: number
          opening_deaths?: number
          opening_kills?: number
          rating_3?: number
          swing?: number
          trade_deaths?: number
          updated_at?: string
        }
        Update: {
          adr?: number
          assists?: number
          clutch_1v2?: number
          clutch_1v3?: number
          clutch_1v4?: number
          clutch_1v5?: number
          clutches_won?: number
          created_at?: string
          cs_map_id?: string
          cs_player_id?: string
          deaths?: number
          flash_assists?: number
          headshots?: number
          id?: string
          kast?: number
          kills?: number
          multi_kills?: number
          opening_deaths?: number
          opening_kills?: number
          rating_3?: number
          swing?: number
          trade_deaths?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "player_map_stats_cs_map_id_fkey"
            columns: ["cs_map_id"]
            isOneToOne: false
            referencedRelation: "cs_map"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "player_map_stats_cs_player_id_fkey"
            columns: ["cs_player_id"]
            isOneToOne: false
            referencedRelation: "cs_player"
            referencedColumns: ["id"]
          },
        ]
      }
      player_tournament_stats: {
        Row: {
          created_at: string
          cs_player_id: string
          flash_assists_per_round: number | null
          flashes_thrown_per_round: number | null
          id: string
          opponent_flashed_time_per_round: number | null
          tournament_id: string
          updated_at: string
          utility_damage_per_round: number | null
          utility_kills_per_100_rounds: number | null
        }
        Insert: {
          created_at?: string
          cs_player_id: string
          flash_assists_per_round?: number | null
          flashes_thrown_per_round?: number | null
          id?: string
          opponent_flashed_time_per_round?: number | null
          tournament_id: string
          updated_at?: string
          utility_damage_per_round?: number | null
          utility_kills_per_100_rounds?: number | null
        }
        Update: {
          created_at?: string
          cs_player_id?: string
          flash_assists_per_round?: number | null
          flashes_thrown_per_round?: number | null
          id?: string
          opponent_flashed_time_per_round?: number | null
          tournament_id?: string
          updated_at?: string
          utility_damage_per_round?: number | null
          utility_kills_per_100_rounds?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "player_tournament_stats_cs_player_id_fkey"
            columns: ["cs_player_id"]
            isOneToOne: false
            referencedRelation: "cs_player"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "player_tournament_stats_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournament"
            referencedColumns: ["id"]
          },
        ]
      }
      product: {
        Row: {
          community_id: string | null
          config: Json
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          name: string
          payment_provider_product_id: string | null
          price: number
          type: Database["public"]["Enums"]["ProductType"] | null
          updated_at: string
          video: string | null
        }
        Insert: {
          community_id?: string | null
          config?: Json
          created_at?: string
          description?: string | null
          id: string
          image_url?: string | null
          name: string
          payment_provider_product_id?: string | null
          price: number
          type?: Database["public"]["Enums"]["ProductType"] | null
          updated_at: string
          video?: string | null
        }
        Update: {
          community_id?: string | null
          config?: Json
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          payment_provider_product_id?: string | null
          price?: number
          type?: Database["public"]["Enums"]["ProductType"] | null
          updated_at?: string
          video?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "community"
            referencedColumns: ["id"]
          },
        ]
      }
      product_item: {
        Row: {
          assigned_at: string
          item_id: string
          product_id: string
        }
        Insert: {
          assigned_at?: string
          item_id: string
          product_id: string
        }
        Update: {
          assigned_at?: string
          item_id?: string
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_item_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "item"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_item_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          cap_color: string
          display_name: string
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          cap_color?: string
          display_name?: string
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          cap_color?: string
          display_name?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      reward: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_free: boolean
          name: string
          type: Database["public"]["Enums"]["RewardType"] | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id: string
          image_url?: string | null
          is_free?: boolean
          name?: string
          type?: Database["public"]["Enums"]["RewardType"] | null
          updated_at: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_free?: boolean
          name?: string
          type?: Database["public"]["Enums"]["RewardType"] | null
          updated_at?: string
        }
        Relationships: []
      }
      reward_item: {
        Row: {
          amount: number
          assigned_at: string
          id: string
          item_id: string
          reward_id: string
        }
        Insert: {
          amount: number
          assigned_at?: string
          id: string
          item_id: string
          reward_id: string
        }
        Update: {
          amount?: number
          assigned_at?: string
          id?: string
          item_id?: string
          reward_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reward_item_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "item"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reward_item_reward_id_fkey"
            columns: ["reward_id"]
            isOneToOne: false
            referencedRelation: "reward"
            referencedColumns: ["id"]
          },
        ]
      }
      room_members: {
        Row: {
          connected: boolean
          joined_at: string
          last_seen_at: string
          room_id: string
          slot_index: number
          strokes: number
          user_id: string
        }
        Insert: {
          connected?: boolean
          joined_at?: string
          last_seen_at?: string
          room_id: string
          slot_index: number
          strokes?: number
          user_id: string
        }
        Update: {
          connected?: boolean
          joined_at?: string
          last_seen_at?: string
          room_id?: string
          slot_index?: number
          strokes?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "room_members_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "room_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      rooms: {
        Row: {
          active_slot: number | null
          code: string
          created_at: string
          finished_at: string | null
          host_id: string
          id: string
          launch_pending: boolean
          max_players: number
          started_at: string | null
          status: Database["public"]["Enums"]["room_status"]
          track_id: string
          turn_seq: number
          turn_started_at: string | null
          updated_at: string
          winner_id: string | null
        }
        Insert: {
          active_slot?: number | null
          code: string
          created_at?: string
          finished_at?: string | null
          host_id: string
          id?: string
          launch_pending?: boolean
          max_players: number
          started_at?: string | null
          status?: Database["public"]["Enums"]["room_status"]
          track_id: string
          turn_seq?: number
          turn_started_at?: string | null
          updated_at?: string
          winner_id?: string | null
        }
        Update: {
          active_slot?: number | null
          code?: string
          created_at?: string
          finished_at?: string | null
          host_id?: string
          id?: string
          launch_pending?: boolean
          max_players?: number
          started_at?: string | null
          status?: Database["public"]["Enums"]["room_status"]
          track_id?: string
          turn_seq?: number
          turn_started_at?: string | null
          updated_at?: string
          winner_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rooms_host_id_fkey"
            columns: ["host_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rooms_winner_id_fkey"
            columns: ["winner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      stripe_webhook_processed: {
        Row: {
          processed_at: string
          stripe_event_id: string
        }
        Insert: {
          processed_at?: string
          stripe_event_id: string
        }
        Update: {
          processed_at?: string
          stripe_event_id?: string
        }
        Relationships: []
      }
      tournament: {
        Row: {
          created_at: string
          ends_at: string
          hltv_event_id: string | null
          id: string
          is_active: boolean
          name: string
          starts_at: string
          status: Database["public"]["Enums"]["TournamentStatus"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          ends_at: string
          hltv_event_id?: string | null
          id?: string
          is_active?: boolean
          name: string
          starts_at: string
          status?: Database["public"]["Enums"]["TournamentStatus"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          ends_at?: string
          hltv_event_id?: string | null
          id?: string
          is_active?: boolean
          name?: string
          starts_at?: string
          status?: Database["public"]["Enums"]["TournamentStatus"]
          updated_at?: string
        }
        Relationships: []
      }
      tournament_player: {
        Row: {
          added_at: string
          cs_player_id: string
          tournament_id: string
        }
        Insert: {
          added_at?: string
          cs_player_id: string
          tournament_id: string
        }
        Update: {
          added_at?: string
          cs_player_id?: string
          tournament_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tournament_player_cs_player_id_fkey"
            columns: ["cs_player_id"]
            isOneToOne: false
            referencedRelation: "cs_player"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tournament_player_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournament"
            referencedColumns: ["id"]
          },
        ]
      }
      transaction: {
        Row: {
          amount: number
          created_at: string
          id: string
          price: number
          product_id: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id: string
          price: number
          product_id: string
          status: string
          updated_at: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          price?: number
          product_id?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transaction_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transaction_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      user: {
        Row: {
          avatar_url: string | null
          banner_url: string | null
          bio: string | null
          created_at: string
          id: string
          is_banned: boolean
          is_public: boolean
          is_verified: boolean
          name: string | null
          updated_at: string
          username: string
        }
        Insert: {
          avatar_url?: string | null
          banner_url?: string | null
          bio?: string | null
          created_at?: string
          id: string
          is_banned?: boolean
          is_public?: boolean
          is_verified?: boolean
          name?: string | null
          updated_at: string
          username: string
        }
        Update: {
          avatar_url?: string | null
          banner_url?: string | null
          bio?: string | null
          created_at?: string
          id?: string
          is_banned?: boolean
          is_public?: boolean
          is_verified?: boolean
          name?: string | null
          updated_at?: string
          username?: string
        }
        Relationships: []
      }
      user_battle_pass: {
        Row: {
          battle_pass_id: string
          id: string
          level: number
          user_id: string
          xp_total: number
        }
        Insert: {
          battle_pass_id: string
          id?: string
          level?: number
          user_id: string
          xp_total?: number
        }
        Update: {
          battle_pass_id?: string
          id?: string
          level?: number
          user_id?: string
          xp_total?: number
        }
        Relationships: [
          {
            foreignKeyName: "user_battle_pass_battle_pass_id_fkey"
            columns: ["battle_pass_id"]
            isOneToOne: false
            referencedRelation: "battle_pass"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_battle_pass_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      user_battle_pass_level_reward: {
        Row: {
          battle_pass_id: string
          battle_pass_level_reward_id: string
          created_at: string
          id: string
          is_claimed: boolean
          updated_at: string
          user_battle_pass_id: string
          user_id: string
        }
        Insert: {
          battle_pass_id: string
          battle_pass_level_reward_id: string
          created_at?: string
          id: string
          is_claimed?: boolean
          updated_at: string
          user_battle_pass_id: string
          user_id: string
        }
        Update: {
          battle_pass_id?: string
          battle_pass_level_reward_id?: string
          created_at?: string
          id?: string
          is_claimed?: boolean
          updated_at?: string
          user_battle_pass_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_battle_pass_level_reward_user_battle_pass_id_fkey"
            columns: ["user_battle_pass_id"]
            isOneToOne: false
            referencedRelation: "user_battle_pass"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_battle_pass_reward_battle_pass_level_reward_id_fkey"
            columns: ["battle_pass_level_reward_id"]
            isOneToOne: false
            referencedRelation: "battle_pass_level_reward"
            referencedColumns: ["id"]
          },
        ]
      }
      user_item: {
        Row: {
          acquired_at: string
          granted_via_free_tier: boolean
          id: string
          item_id: string
          quantity: number
          reactivated_from_user_product_id: string | null
          revoked_at: string | null
          type: Database["public"]["Enums"]["ItemType"]
          user_id: string
          user_product_id: string | null
        }
        Insert: {
          acquired_at?: string
          granted_via_free_tier?: boolean
          id: string
          item_id: string
          quantity?: number
          reactivated_from_user_product_id?: string | null
          revoked_at?: string | null
          type: Database["public"]["Enums"]["ItemType"]
          user_id: string
          user_product_id?: string | null
        }
        Update: {
          acquired_at?: string
          granted_via_free_tier?: boolean
          id?: string
          item_id?: string
          quantity?: number
          reactivated_from_user_product_id?: string | null
          revoked_at?: string | null
          type?: Database["public"]["Enums"]["ItemType"]
          user_id?: string
          user_product_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_item_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "item"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_item_reactivated_from_user_product_id_fkey"
            columns: ["reactivated_from_user_product_id"]
            isOneToOne: false
            referencedRelation: "user_product"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_item_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_item_user_product_id_fkey"
            columns: ["user_product_id"]
            isOneToOne: false
            referencedRelation: "user_product"
            referencedColumns: ["id"]
          },
        ]
      }
      user_lineup: {
        Row: {
          created_at: string
          id: string
          matchday_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          matchday_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          matchday_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_lineup_matchday_id_fkey"
            columns: ["matchday_id"]
            isOneToOne: false
            referencedRelation: "matchday"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_lineup_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      user_lineup_slot: {
        Row: {
          cs_player_id: string
          is_captain: boolean
          user_lineup_id: string
        }
        Insert: {
          cs_player_id: string
          is_captain?: boolean
          user_lineup_id: string
        }
        Update: {
          cs_player_id?: string
          is_captain?: boolean
          user_lineup_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_lineup_slot_cs_player_id_fkey"
            columns: ["cs_player_id"]
            isOneToOne: false
            referencedRelation: "cs_player"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_lineup_slot_user_lineup_id_fkey"
            columns: ["user_lineup_id"]
            isOneToOne: false
            referencedRelation: "user_lineup"
            referencedColumns: ["id"]
          },
        ]
      }
      user_matchday_score: {
        Row: {
          breakdown: Json
          computed_at: string
          matchday_id: string
          total_points: number
          user_id: string
        }
        Insert: {
          breakdown?: Json
          computed_at?: string
          matchday_id: string
          total_points?: number
          user_id: string
        }
        Update: {
          breakdown?: Json
          computed_at?: string
          matchday_id?: string
          total_points?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_matchday_score_matchday_id_fkey"
            columns: ["matchday_id"]
            isOneToOne: false
            referencedRelation: "matchday"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_matchday_score_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      user_membership: {
        Row: {
          activated_at: string | null
          cancel_at_period_end: boolean
          canceled_at: string | null
          cancellation_reason: string | null
          created_at: string
          ended_at: string | null
          expires_at: string | null
          grace_period_ends_at: string | null
          id: string
          is_active: boolean
          payment_failed_at: string | null
          payment_failure_count: number
          subscription_id: string | null
          subscription_status:
            | "trialing"
            | "active"
            | "canceled"
            | "incomplete"
            | "incomplete_expired"
            | "past_due"
            | "unpaid"
            | null
          user_product_id: string | null
        }
        Insert: {
          activated_at?: string | null
          cancel_at_period_end?: boolean
          canceled_at?: string | null
          cancellation_reason?: string | null
          created_at?: string
          ended_at?: string | null
          expires_at?: string | null
          grace_period_ends_at?: string | null
          id?: string
          is_active?: boolean
          payment_failed_at?: string | null
          payment_failure_count?: number
          subscription_id?: string | null
          subscription_status?:
            | "trialing"
            | "active"
            | "canceled"
            | "incomplete"
            | "incomplete_expired"
            | "past_due"
            | "unpaid"
            | null
          user_product_id?: string | null
        }
        Update: {
          activated_at?: string | null
          cancel_at_period_end?: boolean
          canceled_at?: string | null
          cancellation_reason?: string | null
          created_at?: string
          ended_at?: string | null
          expires_at?: string | null
          grace_period_ends_at?: string | null
          id?: string
          is_active?: boolean
          payment_failed_at?: string | null
          payment_failure_count?: number
          subscription_id?: string | null
          subscription_status?:
            | "trialing"
            | "active"
            | "canceled"
            | "incomplete"
            | "incomplete_expired"
            | "past_due"
            | "unpaid"
            | null
          user_product_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_membership_user_product_id_fkey"
            columns: ["user_product_id"]
            isOneToOne: true
            referencedRelation: "user_product"
            referencedColumns: ["id"]
          },
        ]
      }
      user_platform: {
        Row: {
          created_at: string
          id: string
          platform_id: string
          platform_type: string
          platform_url: string
          platform_username: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id: string
          platform_id: string
          platform_type: string
          platform_url: string
          platform_username: string
          updated_at: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          platform_id?: string
          platform_type?: string
          platform_url?: string
          platform_username?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_platform_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      user_player: {
        Row: {
          created_at: string
          id: string
          is_active: boolean | null
          level: number
          player_id: string
          updated_at: string
          user_id: string
          xp_total: number
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          level?: number
          player_id: string
          updated_at?: string
          user_id: string
          xp_total?: number
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          level?: number
          player_id?: string
          updated_at?: string
          user_id?: string
          xp_total?: number
        }
        Relationships: [
          {
            foreignKeyName: "user_player_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "player"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_player_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      user_player_card: {
        Row: {
          id: string
          player_card_id: string
          user_id: string
        }
        Insert: {
          id?: string
          player_card_id: string
          user_id: string
        }
        Update: {
          id?: string
          player_card_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_player_card_player_id_fkey"
            columns: ["player_card_id"]
            isOneToOne: false
            referencedRelation: "player_card"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_player_card_rarity_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      user_player_level_reward: {
        Row: {
          created_at: string
          id: string
          is_claimed: boolean
          player_level_reward_id: string | null
          updated_at: string
          user_id: string
          user_player_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_claimed?: boolean
          player_level_reward_id?: string | null
          updated_at?: string
          user_id: string
          user_player_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_claimed?: boolean
          player_level_reward_id?: string | null
          updated_at?: string
          user_id?: string
          user_player_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_player_card_rarity_step_reward_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_player_level_reward_player_level_reward_id_fkey"
            columns: ["player_level_reward_id"]
            isOneToOne: false
            referencedRelation: "player_level_reward"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_player_level_reward_user_player_id_fkey"
            columns: ["user_player_id"]
            isOneToOne: false
            referencedRelation: "user_player"
            referencedColumns: ["id"]
          },
        ]
      }
      user_private_preferences: {
        Row: {
          currency: Database["public"]["Enums"]["CurrencyType"] | null
          id: string
          user_id: string
        }
        Insert: {
          currency?: Database["public"]["Enums"]["CurrencyType"] | null
          id: string
          user_id: string
        }
        Update: {
          currency?: Database["public"]["Enums"]["CurrencyType"] | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_private_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      user_product: {
        Row: {
          created_at: string
          id: string
          product_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          product_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_product_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_product_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      user_public_preferences: {
        Row: {
          id: string
          language: Database["public"]["Enums"]["LanguageType"]
          user_id: string
        }
        Insert: {
          id: string
          language?: Database["public"]["Enums"]["LanguageType"]
          user_id: string
        }
        Update: {
          id?: string
          language?: Database["public"]["Enums"]["LanguageType"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_public_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      activate_user_membership: {
        Args: {
          p_membership_product_id: string
          p_period_end: string
          p_period_start: string
          p_qty: number
          p_subscription_id: string
          p_subscription_status: string
          p_user_id: string
          p_user_product_id: string
        }
        Returns: Json
      }
      activate_user_membership_for_user_product: {
        Args: { p_user_product_id: string }
        Returns: Json
      }
      activate_user_player: { Args: { p_player_id: string }; Returns: Json }
      apply_battle_pass_xp: {
        Args: {
          p_battle_pass_id: string
          p_delta_xp: number
          p_user_id: string
        }
        Returns: undefined
      }
      apply_player_xp: {
        Args: { p_delta_xp: number; p_player_id: string; p_user_id: string }
        Returns: undefined
      }
      backfill_player_card_token_items: { Args: never; Returns: number }
      claim_battle_pass_reward: {
        Args: {
          p_battle_pass_id: string
          p_level_order: number
          p_user_id: string
        }
        Returns: Json
      }
      claim_player_card_mission: {
        Args: {
          p_mission_id: string
          p_player_card_id: string
          p_user_id: string
        }
        Returns: Json
      }
      claim_player_reward: {
        Args: { p_level: number; p_player_id: string; p_user_id: string }
        Returns: Json
      }
      complete_battle_pass_mission: {
        Args: {
          p_battle_pass_id: string
          p_mission_id: string
          p_user_id: string
        }
        Returns: Json
      }
      complete_player_card_mission: {
        Args: {
          p_mission_id: string
          p_player_card_id: string
          p_user_id: string
        }
        Returns: Json
      }
      compute_matchday_scores: {
        Args: { p_matchday_id: string }
        Returns: Json
      }
      create_match_with_maps: {
        Args: {
          p_format?: string
          p_hltv_match_id?: string
          p_maps?: Json
          p_matchday_id: string
          p_starts_at: string
          p_team_a_id: string
          p_team_b_id: string
        }
        Returns: Json
      }
      create_room: {
        Args: { p_max_players: number; p_track_id: string }
        Returns: {
          active_slot: number | null
          code: string
          created_at: string
          finished_at: string | null
          host_id: string
          id: string
          launch_pending: boolean
          max_players: number
          started_at: string | null
          status: Database["public"]["Enums"]["room_status"]
          track_id: string
          turn_seq: number
          turn_started_at: string | null
          updated_at: string
          winner_id: string | null
        }
        SetofOptions: {
          from: "*"
          to: "rooms"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      ensure_battle_pass_objective_progress_rows: {
        Args: { p_mission_id: string; p_mission_progress_id: string }
        Returns: undefined
      }
      ensure_player_card_objective_progress_rows: {
        Args: { p_mission_id: string; p_mission_progress_id: string }
        Returns: undefined
      }
      fantasy_player_map_components: {
        Args: { p_matchday_id: string }
        Returns: {
          adr_pts: number
          assist_pts: number
          clutch_pts: number
          cs_map_id: string
          cs_match_id: string
          cs_player_id: string
          cs_team_id: string
          death_pts: number
          flash_pts: number
          format: string
          hs_pts: number
          is_team_a: boolean
          kast_pts: number
          kill_pts: number
          map_leader_pts: number
          map_length_pts: number
          map_played: number
          map_result_pts: number
          map_score: number
          mks_pts: number
          opkd_pts: number
          rating_pts: number
          swing_pts: number
          team_a_id: string
          team_leader_pts: number
        }[]
      }
      generate_room_code: { Args: never; Returns: string }
      get_all_user_battle_passes: { Args: { p_user_id: string }; Returns: Json }
      get_checkout_session: {
        Args: { session_id: string }
        Returns: {
          attrs: Json
          customer: string
          id: string
          payment_intent: string
          subscription: string
        }[]
      }
      get_fantasy_leaderboard: {
        Args: { p_limit: number; p_offset: number; p_tournament_id: string }
        Returns: {
          avatar_url: string
          total_count: number
          total_points: number
          user_id: string
          username: string
        }[]
      }
      get_items_by_subscription: {
        Args: { p_subscription_id: string }
        Returns: {
          activated_at: string
          description: string
          image_url: string
          item_id: string
          item_type: string
          metadata: Json
          name: string
          quantity: number
          rarity: Database["public"]["Enums"]["ItemRarity"]
          user_item_id: string
        }[]
      }
      get_items_by_user_product: {
        Args: { p_user_product_id: string }
        Returns: {
          activated_at: string
          description: string
          granted_via_free_tier: boolean
          image_url: string
          item_id: string
          item_type: string
          metadata: Json
          name: string
          quantity: number
          rarity: Database["public"]["Enums"]["ItemRarity"]
          user_item_id: string
        }[]
      }
      get_stripe_customer: {
        Args: { customer_email: string }
        Returns: {
          attrs: Json
          created: string
          description: string
          email: string
          id: string
          name: string
        }[]
      }
      get_stripe_customer_payment_intents: {
        Args: { customer_id: string }
        Returns: {
          amount: number
          attrs: Json
          created: string
          currency: string
          customer: string
          id: string
          payment_method: string
        }[]
      }
      get_stripe_customer_subscriptions: {
        Args: { customer_id: string }
        Returns: {
          attrs: Json
          currency: string
          current_period_end: string
          current_period_start: string
          customer: string
          id: string
        }[]
      }
      get_stripe_prices: {
        Args: never
        Returns: {
          active: boolean
          attrs: Json
          currency: string
          id: string
          product: string
          type: string
          unit_amount: number
        }[]
      }
      get_stripe_product: {
        Args: { product_id: string }
        Returns: {
          active: boolean
          attrs: Json
          default_price: string
          description: string
          id: string
          name: string
        }[]
      }
      get_stripe_product_for_authenticated_user: {
        Args: { product_id: string }
        Returns: {
          active: boolean
          attrs: Json
          default_price: string
          description: string
          id: string
          name: string
        }[]
      }
      get_stripe_products: {
        Args: never
        Returns: {
          active: boolean
          attrs: Json
          default_price: string
          description: string
          id: string
          name: string
        }[]
      }
      get_stripe_products_by_ids: {
        Args: { product_ids: string[] }
        Returns: {
          active: boolean
          attrs: Json
          default_price: string
          description: string
          id: string
          name: string
        }[]
      }
      get_stripe_products_for_authenticated_user: {
        Args: never
        Returns: {
          active: boolean
          attrs: Json
          default_price: string
          description: string
          id: string
          name: string
        }[]
      }
      get_stripe_subscription: {
        Args: { subscription_id: string }
        Returns: {
          attrs: Json
          currency: string
          current_period_end: string
          current_period_start: string
          customer: string
          id: string
        }[]
      }
      get_stripe_subscriptions: {
        Args: never
        Returns: {
          attrs: Json
          currency: string
          current_period_end: string
          current_period_start: string
          customer: string
          id: string
        }[]
      }
      get_stripe_subscriptions_for_authenticated_user: {
        Args: never
        Returns: {
          attrs: Json
          currency: string
          current_period_end: string
          current_period_start: string
          customer: string
          id: string
        }[]
      }
      get_tournament_player_scores: {
        Args: { p_tournament_id: string }
        Returns: Json
      }
      get_user_battle_pass: { Args: { p_user_id: string }; Returns: Json }
      grant_free_membership: { Args: { p_product_id: string }; Returns: Json }
      is_room_member: { Args: { p_room_id: string }; Returns: boolean }
      join_room: {
        Args: { p_code: string }
        Returns: {
          connected: boolean
          joined_at: string
          last_seen_at: string
          room_id: string
          slot_index: number
          strokes: number
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "room_members"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      leave_room: { Args: { p_room_id: string }; Returns: undefined }
      start_room: {
        Args: { p_room_id: string }
        Returns: {
          active_slot: number | null
          code: string
          created_at: string
          finished_at: string | null
          host_id: string
          id: string
          launch_pending: boolean
          max_players: number
          started_at: string | null
          status: Database["public"]["Enums"]["room_status"]
          track_id: string
          turn_seq: number
          turn_started_at: string | null
          updated_at: string
          winner_id: string | null
        }
        SetofOptions: {
          from: "*"
          to: "rooms"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      commit_room_settle: {
        Args: {
          p_room_id: string
          p_turn_seq: number
          p_next_active_slot: number
          p_strokes?: Json
        }
        Returns: {
          active_slot: number | null
          code: string
          created_at: string
          finished_at: string | null
          host_id: string
          id: string
          launch_pending: boolean
          max_players: number
          started_at: string | null
          status: Database["public"]["Enums"]["room_status"]
          track_id: string
          turn_seq: number
          turn_started_at: string | null
          updated_at: string
          winner_id: string | null
        }
        SetofOptions: {
          from: "*"
          to: "rooms"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      submit_room_launch: {
        Args: {
          p_room_id: string
          p_turn_seq: number
          p_direction: Json
          p_power: number
          p_from?: Json
        }
        Returns: {
          active_slot: number | null
          code: string
          created_at: string
          finished_at: string | null
          host_id: string
          id: string
          launch_pending: boolean
          max_players: number
          started_at: string | null
          status: Database["public"]["Enums"]["room_status"]
          track_id: string
          turn_seq: number
          turn_started_at: string | null
          updated_at: string
          winner_id: string | null
        }
        SetofOptions: {
          from: "*"
          to: "rooms"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      skip_room_turn: {
        Args: { p_room_id: string; p_turn_seq: number }
        Returns: {
          active_slot: number | null
          code: string
          created_at: string
          finished_at: string | null
          host_id: string
          id: string
          launch_pending: boolean
          max_players: number
          started_at: string | null
          status: Database["public"]["Enums"]["room_status"]
          track_id: string
          turn_seq: number
          turn_started_at: string | null
          updated_at: string
          winner_id: string | null
        }
        SetofOptions: {
          from: "*"
          to: "rooms"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      finish_room: {
        Args: {
          p_room_id: string
          p_winner_user_id: string
          p_ranking: Json
        }
        Returns: {
          active_slot: number | null
          code: string
          created_at: string
          finished_at: string | null
          host_id: string
          id: string
          launch_pending: boolean
          max_players: number
          started_at: string | null
          status: Database["public"]["Enums"]["room_status"]
          track_id: string
          turn_seq: number
          turn_started_at: string | null
          updated_at: string
          winner_id: string | null
        }
        SetofOptions: {
          from: "*"
          to: "rooms"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      room_dense_user: {
        Args: { p_room_id: string; p_dense_slot: number }
        Returns: string
      }
      mission_xp_reward_sum: { Args: { p_mission_id: string }; Returns: number }
      register_battle_pass_mission_progress: {
        Args: {
          p_battle_pass_id: string
          p_mission_id: string
          p_user_id: string
        }
        Returns: Json
      }
      register_battle_pass_objective_progress: {
        Args: {
          p_battle_pass_id: string
          p_delta?: number
          p_event_data?: Json
          p_mission_id: string
          p_objective_id: string
          p_source?: string
          p_user_id: string
        }
        Returns: Json
      }
      register_player_card_mission_progress: {
        Args: {
          p_mission_id: string
          p_player_card_id: string
          p_user_id: string
        }
        Returns: Json
      }
      register_player_card_objective_progress: {
        Args: {
          p_delta?: number
          p_event_data?: Json
          p_mission_id: string
          p_objective_id: string
          p_player_card_id: string
          p_source?: string
          p_user_id: string
        }
        Returns: Json
      }
      resolve_item_slot_for_item_type: {
        Args: { p_item_type_id: string }
        Returns: string
      }
      stripe_checkout_completed: {
        Args: {
          p_customer_id?: string
          p_line_items: Json
          p_mode?: string
          p_session_id?: string
          p_stripe_event_id: string
          p_subscription_id?: string
          p_supabase_user_id: string
        }
        Returns: Json
      }
      stripe_invoice_subscription_sync: {
        Args: {
          p_expires_at_unix: number
          p_stripe_event_id: string
          p_subscription_id: string
          p_supabase_user_id: string
        }
        Returns: Json
      }
      stripe_subscription_created: {
        Args: {
          p_stripe_event_id: string
          p_subscription: Json
          p_supabase_user_id: string
        }
        Returns: Json
      }
      stripe_subscription_deleted: {
        Args: { p_stripe_event_id: string; p_subscription: Json }
        Returns: Json
      }
      stripe_subscription_sync_from_event: {
        Args: {
          p_stripe_event_id: string
          p_subscription: Json
          p_supabase_user_id: string
        }
        Returns: Json
      }
      stripe_webhook_try_claim_event: {
        Args: { p_stripe_event_id: string }
        Returns: boolean
      }
      subscribe_battle_pass: {
        Args: { p_battle_pass_id: string; p_user_id: string }
        Returns: Json
      }
      sync_player_card_token_item: {
        Args: { p_player_card_id: string }
        Returns: undefined
      }
      sync_user_entitlements_from_user_item_row: {
        Args: { p_item_id: string; p_user_id: string }
        Returns: undefined
      }
      sync_user_item_default_slot_on_insert: {
        Args: { p_item_id: string; p_user_id: string; p_user_item_id: string }
        Returns: undefined
      }
      testing_reset_user_membership_progression: {
        Args: { p_battle_pass_id: string; p_user_id: string }
        Returns: Json
      }
      testing_reset_user_mission_progress: {
        Args: { p_user_id: string }
        Returns: Json
      }
      upsert_map_stats: {
        Args: { p_map_id: string; p_stats?: Json; p_team_a_won?: boolean }
        Returns: Json
      }
      upsert_player_tournament_stats: {
        Args: { p_stats?: Json; p_tournament_id: string }
        Returns: Json
      }
      upsert_pool: {
        Args: { p_players?: Json; p_tournament_id: string }
        Returns: Json
      }
      upsert_tournament: {
        Args: {
          p_ends_at: string
          p_hltv_event_id?: string
          p_is_active?: boolean
          p_name: string
          p_starts_at: string
        }
        Returns: {
          created_at: string
          ends_at: string
          hltv_event_id: string | null
          id: string
          is_active: boolean
          name: string
          starts_at: string
          status: Database["public"]["Enums"]["TournamentStatus"]
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "tournament"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      upsert_user_lineup: {
        Args: { p_matchday_id: string; p_slots: Json; p_user_id: string }
        Returns: string
      }
    }
    Enums: {
      ChangeType: "CREATE" | "UPDATE" | "DELETE"
      ConditionOperator:
        | "EQUAL"
        | "NOT_EQUAL"
        | "GREATER_THAN"
        | "GREATER_THAN_OR_EQUAL"
        | "LESS_THAN"
        | "LESS_THAN_OR_EQUAL"
        | "CONTAINS"
        | "NOT_CONTAINS"
        | "INCLUDES"
        | "NOT_INCLUDES"
        | "STARTS_WITH"
        | "ENDS_WITH"
      CsMatchStatus: "scheduled" | "live" | "finished"
      CurrencyType: "USD" | "EUR"
      ItemRarity: "common" | "uncommon" | "rare" | "epic" | "legendary"
      ItemType:
        | "player_card_token"
        | "battle_pass_token"
        | "overlay_ui_token"
        | "player_token"
        | "progression_xp_token"
      LanguageType: "en-US" | "es-ES"
      MatchdayStatus: "scheduled" | "open" | "locked" | "finished"
      MissionLimit: "MATCHES" | "DAYS" | "UNLIMITED"
      MissionRepeat: "NON_REPEATABLE" | "DAILY" | "WEEKLY"
      MissionStatus: "ACTIVE" | "COMPLETED" | "EXPIRED" | "FAILED"
      PlayerCardRarity: "bronze" | "silver" | "gold" | "premium"
      ProductType: "membership" | "cards_pack"
      RewardType:
        | "player_card"
        | "fanship_coin"
        | "mistery_package"
        | "player"
        | "progression_xp"
      room_status: "lobby" | "playing" | "finished"
      TournamentStatus: "scheduled" | "live" | "finished"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      ChangeType: ["CREATE", "UPDATE", "DELETE"],
      ConditionOperator: [
        "EQUAL",
        "NOT_EQUAL",
        "GREATER_THAN",
        "GREATER_THAN_OR_EQUAL",
        "LESS_THAN",
        "LESS_THAN_OR_EQUAL",
        "CONTAINS",
        "NOT_CONTAINS",
        "INCLUDES",
        "NOT_INCLUDES",
        "STARTS_WITH",
        "ENDS_WITH",
      ],
      CsMatchStatus: ["scheduled", "live", "finished"],
      CurrencyType: ["USD", "EUR"],
      ItemRarity: ["common", "uncommon", "rare", "epic", "legendary"],
      ItemType: [
        "player_card_token",
        "battle_pass_token",
        "overlay_ui_token",
        "player_token",
        "progression_xp_token",
      ],
      LanguageType: ["en-US", "es-ES"],
      MatchdayStatus: ["scheduled", "open", "locked", "finished"],
      MissionLimit: ["MATCHES", "DAYS", "UNLIMITED"],
      MissionRepeat: ["NON_REPEATABLE", "DAILY", "WEEKLY"],
      MissionStatus: ["ACTIVE", "COMPLETED", "EXPIRED", "FAILED"],
      PlayerCardRarity: ["bronze", "silver", "gold", "premium"],
      ProductType: ["membership", "cards_pack"],
      RewardType: [
        "player_card",
        "fanship_coin",
        "mistery_package",
        "player",
        "progression_xp",
      ],
      room_status: ["lobby", "playing", "finished"],
      TournamentStatus: ["scheduled", "live", "finished"],
    },
  },
} as const
