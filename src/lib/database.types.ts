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
    PostgrestVersion: "14.5"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
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
  public: {
    Tables: {
      archive_roster_entries: {
        Row: {
          archive_season_id: string
          attendance_years: string | null
          created_at: string
          display_name: string
          id: string
          role: string | null
          sort_order: number
        }
        Insert: {
          archive_season_id: string
          attendance_years?: string | null
          created_at?: string
          display_name: string
          id?: string
          role?: string | null
          sort_order?: number
        }
        Update: {
          archive_season_id?: string
          attendance_years?: string | null
          created_at?: string
          display_name?: string
          id?: string
          role?: string | null
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "archive_roster_entries_archive_season_id_fkey"
            columns: ["archive_season_id"]
            isOneToOne: false
            referencedRelation: "archive_seasons"
            referencedColumns: ["id"]
          },
        ]
      }
      archive_seasons: {
        Row: {
          age_group: string | null
          created_at: string
          id: string
          notable_results: string
          school_year: string
          sport_id: string
          status: Database["public"]["Enums"]["publish_status"]
          team_name: string
          team_photo_path: string | null
          updated_at: string
          write_up: string
        }
        Insert: {
          age_group?: string | null
          created_at?: string
          id?: string
          notable_results?: string
          school_year: string
          sport_id: string
          status?: Database["public"]["Enums"]["publish_status"]
          team_name: string
          team_photo_path?: string | null
          updated_at?: string
          write_up?: string
        }
        Update: {
          age_group?: string | null
          created_at?: string
          id?: string
          notable_results?: string
          school_year?: string
          sport_id?: string
          status?: Database["public"]["Enums"]["publish_status"]
          team_name?: string
          team_photo_path?: string | null
          updated_at?: string
          write_up?: string
        }
        Relationships: [
          {
            foreignKeyName: "archive_seasons_sport_id_fkey"
            columns: ["sport_id"]
            isOneToOne: false
            referencedRelation: "sports"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_events: {
        Row: {
          action: string
          actor_id: string | null
          after_data: Json | null
          before_data: Json | null
          created_at: string
          entity_id: string | null
          entity_table: string
          id: number
        }
        Insert: {
          action: string
          actor_id?: string | null
          after_data?: Json | null
          before_data?: Json | null
          created_at?: string
          entity_id?: string | null
          entity_table: string
          id?: never
        }
        Update: {
          action?: string
          actor_id?: string | null
          after_data?: Json | null
          before_data?: Json | null
          created_at?: string
          entity_id?: string | null
          entity_table?: string
          id?: never
        }
        Relationships: []
      }
      fixtures: {
        Row: {
          created_at: string
          created_by: string | null
          ends_at: string | null
          external_venue: string | null
          home_away: Database["public"]["Enums"]["home_away"]
          id: string
          notes: string | null
          opponent_name: string
          opponent_team_id: string | null
          reminder_hours: number
          reminders_enabled: boolean
          starts_at: string
          status: Database["public"]["Enums"]["fixture_status"]
          team_id: string
          updated_at: string
          venue_id: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          ends_at?: string | null
          external_venue?: string | null
          home_away?: Database["public"]["Enums"]["home_away"]
          id?: string
          notes?: string | null
          opponent_name: string
          opponent_team_id?: string | null
          reminder_hours?: number
          reminders_enabled?: boolean
          starts_at: string
          status?: Database["public"]["Enums"]["fixture_status"]
          team_id: string
          updated_at?: string
          venue_id?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          ends_at?: string | null
          external_venue?: string | null
          home_away?: Database["public"]["Enums"]["home_away"]
          id?: string
          notes?: string | null
          opponent_name?: string
          opponent_team_id?: string | null
          reminder_hours?: number
          reminders_enabled?: boolean
          starts_at?: string
          status?: Database["public"]["Enums"]["fixture_status"]
          team_id?: string
          updated_at?: string
          venue_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fixtures_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "fixtures_opponent_team_id_fkey"
            columns: ["opponent_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fixtures_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fixtures_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
      gallery_events: {
        Row: {
          created_at: string
          description: string
          event_date: string
          fixture_id: string | null
          id: string
          name: string
          season_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string
          event_date: string
          fixture_id?: string | null
          id?: string
          name: string
          season_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          event_date?: string
          fixture_id?: string | null
          id?: string
          name?: string
          season_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "gallery_events_fixture_id_fkey"
            columns: ["fixture_id"]
            isOneToOne: false
            referencedRelation: "fixtures"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gallery_events_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
        ]
      }
      hall_of_fame_profiles: {
        Row: {
          biography: string
          created_at: string
          id: string
          name: string
          notable_achievement: string
          photo_path: string | null
          status: Database["public"]["Enums"]["publish_status"]
          updated_at: string
          years_attended: string | null
        }
        Insert: {
          biography?: string
          created_at?: string
          id?: string
          name: string
          notable_achievement: string
          photo_path?: string | null
          status?: Database["public"]["Enums"]["publish_status"]
          updated_at?: string
          years_attended?: string | null
        }
        Update: {
          biography?: string
          created_at?: string
          id?: string
          name?: string
          notable_achievement?: string
          photo_path?: string | null
          status?: Database["public"]["Enums"]["publish_status"]
          updated_at?: string
          years_attended?: string | null
        }
        Relationships: []
      }
      hall_of_fame_sports: {
        Row: {
          profile_id: string
          sport_id: string
        }
        Insert: {
          profile_id: string
          sport_id: string
        }
        Update: {
          profile_id?: string
          sport_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hall_of_fame_sports_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "hall_of_fame_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hall_of_fame_sports_sport_id_fkey"
            columns: ["sport_id"]
            isOneToOne: false
            referencedRelation: "sports"
            referencedColumns: ["id"]
          },
        ]
      }
      homepage_highlights: {
        Row: {
          created_at: string
          created_by: string | null
          ends_at: string | null
          id: string
          link_url: string | null
          media_id: string | null
          sort_order: number
          starts_at: string | null
          status: Database["public"]["Enums"]["publish_status"]
          summary: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          ends_at?: string | null
          id?: string
          link_url?: string | null
          media_id?: string | null
          sort_order?: number
          starts_at?: string | null
          status?: Database["public"]["Enums"]["publish_status"]
          summary: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          ends_at?: string | null
          id?: string
          link_url?: string | null
          media_id?: string | null
          sort_order?: number
          starts_at?: string | null
          status?: Database["public"]["Enums"]["publish_status"]
          summary?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "homepage_highlights_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "homepage_highlights_media_id_fkey"
            columns: ["media_id"]
            isOneToOne: false
            referencedRelation: "media_items"
            referencedColumns: ["id"]
          },
        ]
      }
      individual_results: {
        Row: {
          created_at: string
          display_value: string
          event_date: string
          id: string
          is_verified: boolean
          record_type_id: string
          recorded_by: string | null
          result_value: number
          student_id: string
          team_id: string
          updated_at: string
          venue_id: string | null
        }
        Insert: {
          created_at?: string
          display_value: string
          event_date: string
          id?: string
          is_verified?: boolean
          record_type_id: string
          recorded_by?: string | null
          result_value: number
          student_id: string
          team_id: string
          updated_at?: string
          venue_id?: string | null
        }
        Update: {
          created_at?: string
          display_value?: string
          event_date?: string
          id?: string
          is_verified?: boolean
          record_type_id?: string
          recorded_by?: string | null
          result_value?: number
          student_id?: string
          team_id?: string
          updated_at?: string
          venue_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "individual_results_record_type_id_fkey"
            columns: ["record_type_id"]
            isOneToOne: false
            referencedRelation: "record_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "individual_results_recorded_by_fkey"
            columns: ["recorded_by"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "individual_results_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "individual_results_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "individual_results_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
      invitations: {
        Row: {
          accepted_at: string | null
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_by: string | null
          role: Database["public"]["Enums"]["staff_role"]
          status: Database["public"]["Enums"]["invitation_status"]
          token_hash: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          email: string
          expires_at: string
          id?: string
          invited_by?: string | null
          role: Database["public"]["Enums"]["staff_role"]
          status?: Database["public"]["Enums"]["invitation_status"]
          token_hash: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string | null
          role?: Database["public"]["Enums"]["staff_role"]
          status?: Database["public"]["Enums"]["invitation_status"]
          token_hash?: string
        }
        Relationships: [
          {
            foreignKeyName: "invitations_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      match_results: {
        Row: {
          created_at: string
          fixture_id: string
          id: string
          opponent_score: number | null
          outcome: Database["public"]["Enums"]["match_outcome"]
          recorded_by: string | null
          summary: string | null
          team_score: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          fixture_id: string
          id?: string
          opponent_score?: number | null
          outcome: Database["public"]["Enums"]["match_outcome"]
          recorded_by?: string | null
          summary?: string | null
          team_score?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          fixture_id?: string
          id?: string
          opponent_score?: number | null
          outcome?: Database["public"]["Enums"]["match_outcome"]
          recorded_by?: string | null
          summary?: string | null
          team_score?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "match_results_fixture_id_fkey"
            columns: ["fixture_id"]
            isOneToOne: true
            referencedRelation: "fixtures"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_results_recorded_by_fkey"
            columns: ["recorded_by"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      media_events: {
        Row: {
          event_id: string
          media_id: string
        }
        Insert: {
          event_id: string
          media_id: string
        }
        Update: {
          event_id?: string
          media_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "media_events_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "gallery_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_events_media_id_fkey"
            columns: ["media_id"]
            isOneToOne: false
            referencedRelation: "media_items"
            referencedColumns: ["id"]
          },
        ]
      }
      media_items: {
        Row: {
          alt_text: string
          approval_status: Database["public"]["Enums"]["media_approval_status"]
          approved_at: string | null
          approved_by: string | null
          caption: string
          captured_on: string | null
          consent_confirmed: boolean
          created_at: string
          external_url: string | null
          id: string
          kind: Database["public"]["Enums"]["media_kind"]
          rejection_reason: string | null
          storage_path: string | null
          thumbnail_path: string | null
          updated_at: string
          uploaded_by: string | null
          visibility: Database["public"]["Enums"]["media_visibility"]
        }
        Insert: {
          alt_text?: string
          approval_status?: Database["public"]["Enums"]["media_approval_status"]
          approved_at?: string | null
          approved_by?: string | null
          caption?: string
          captured_on?: string | null
          consent_confirmed?: boolean
          created_at?: string
          external_url?: string | null
          id?: string
          kind: Database["public"]["Enums"]["media_kind"]
          rejection_reason?: string | null
          storage_path?: string | null
          thumbnail_path?: string | null
          updated_at?: string
          uploaded_by?: string | null
          visibility?: Database["public"]["Enums"]["media_visibility"]
        }
        Update: {
          alt_text?: string
          approval_status?: Database["public"]["Enums"]["media_approval_status"]
          approved_at?: string | null
          approved_by?: string | null
          caption?: string
          captured_on?: string | null
          consent_confirmed?: boolean
          created_at?: string
          external_url?: string | null
          id?: string
          kind?: Database["public"]["Enums"]["media_kind"]
          rejection_reason?: string | null
          storage_path?: string | null
          thumbnail_path?: string | null
          updated_at?: string
          uploaded_by?: string | null
          visibility?: Database["public"]["Enums"]["media_visibility"]
        }
        Relationships: [
          {
            foreignKeyName: "media_items_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "media_items_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      media_sports: {
        Row: {
          media_id: string
          sport_id: string
        }
        Insert: {
          media_id: string
          sport_id: string
        }
        Update: {
          media_id?: string
          sport_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "media_sports_media_id_fkey"
            columns: ["media_id"]
            isOneToOne: false
            referencedRelation: "media_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_sports_sport_id_fkey"
            columns: ["sport_id"]
            isOneToOne: false
            referencedRelation: "sports"
            referencedColumns: ["id"]
          },
        ]
      }
      media_teams: {
        Row: {
          media_id: string
          team_id: string
        }
        Insert: {
          media_id: string
          team_id: string
        }
        Update: {
          media_id?: string
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "media_teams_media_id_fkey"
            columns: ["media_id"]
            isOneToOne: false
            referencedRelation: "media_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_teams_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      news_posts: {
        Row: {
          author_id: string | null
          body: string
          created_at: string
          id: string
          published_at: string | null
          slug: string
          sport_id: string | null
          status: Database["public"]["Enums"]["publish_status"]
          summary: string
          team_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          body: string
          created_at?: string
          id?: string
          published_at?: string | null
          slug: string
          sport_id?: string | null
          status?: Database["public"]["Enums"]["publish_status"]
          summary: string
          team_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          body?: string
          created_at?: string
          id?: string
          published_at?: string | null
          slug?: string
          sport_id?: string | null
          status?: Database["public"]["Enums"]["publish_status"]
          summary?: string
          team_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "news_posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "news_posts_sport_id_fkey"
            columns: ["sport_id"]
            isOneToOne: false
            referencedRelation: "sports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "news_posts_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      record_types: {
        Row: {
          created_at: string
          id: string
          lower_is_better: boolean
          name: string
          sport_id: string
          unit: string
        }
        Insert: {
          created_at?: string
          id?: string
          lower_is_better?: boolean
          name: string
          sport_id: string
          unit: string
        }
        Update: {
          created_at?: string
          id?: string
          lower_is_better?: boolean
          name?: string
          sport_id?: string
          unit?: string
        }
        Relationships: [
          {
            foreignKeyName: "record_types_sport_id_fkey"
            columns: ["sport_id"]
            isOneToOne: false
            referencedRelation: "sports"
            referencedColumns: ["id"]
          },
        ]
      }
      reminder_deliveries: {
        Row: {
          attempts: number
          created_at: string
          fixture_id: string
          id: string
          last_error: string | null
          scheduled_for: string
          sendgrid_message_id: string | null
          sent_at: string | null
          status: Database["public"]["Enums"]["delivery_status"]
          subscriber_id: string
          updated_at: string
        }
        Insert: {
          attempts?: number
          created_at?: string
          fixture_id: string
          id?: string
          last_error?: string | null
          scheduled_for: string
          sendgrid_message_id?: string | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["delivery_status"]
          subscriber_id: string
          updated_at?: string
        }
        Update: {
          attempts?: number
          created_at?: string
          fixture_id?: string
          id?: string
          last_error?: string | null
          scheduled_for?: string
          sendgrid_message_id?: string | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["delivery_status"]
          subscriber_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reminder_deliveries_fixture_id_fkey"
            columns: ["fixture_id"]
            isOneToOne: false
            referencedRelation: "fixtures"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reminder_deliveries_subscriber_id_fkey"
            columns: ["subscriber_id"]
            isOneToOne: false
            referencedRelation: "reminder_subscribers"
            referencedColumns: ["id"]
          },
        ]
      }
      reminder_subscribers: {
        Row: {
          consented_at: string
          created_at: string
          default_reminder_hours: number
          email: string
          id: string
          is_verified: boolean
          unsubscribe_token_hash: string
          unsubscribed_at: string | null
          updated_at: string
          verification_token_hash: string | null
          verified_at: string | null
        }
        Insert: {
          consented_at?: string
          created_at?: string
          default_reminder_hours?: number
          email: string
          id?: string
          is_verified?: boolean
          unsubscribe_token_hash: string
          unsubscribed_at?: string | null
          updated_at?: string
          verification_token_hash?: string | null
          verified_at?: string | null
        }
        Update: {
          consented_at?: string
          created_at?: string
          default_reminder_hours?: number
          email?: string
          id?: string
          is_verified?: boolean
          unsubscribe_token_hash?: string
          unsubscribed_at?: string | null
          updated_at?: string
          verification_token_hash?: string | null
          verified_at?: string | null
        }
        Relationships: []
      }
      reminder_subscriptions: {
        Row: {
          created_at: string
          subscriber_id: string
          team_id: string | null
        }
        Insert: {
          created_at?: string
          subscriber_id: string
          team_id?: string | null
        }
        Update: {
          created_at?: string
          subscriber_id?: string
          team_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reminder_subscriptions_subscriber_id_fkey"
            columns: ["subscriber_id"]
            isOneToOne: false
            referencedRelation: "reminder_subscribers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reminder_subscriptions_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      roster_memberships: {
        Row: {
          active_from: string | null
          active_until: string | null
          created_at: string
          id: string
          is_captain: boolean
          jersey_number: string | null
          position: string | null
          student_id: string
          team_id: string
          updated_at: string
        }
        Insert: {
          active_from?: string | null
          active_until?: string | null
          created_at?: string
          id?: string
          is_captain?: boolean
          jersey_number?: string | null
          position?: string | null
          student_id: string
          team_id: string
          updated_at?: string
        }
        Update: {
          active_from?: string | null
          active_until?: string | null
          created_at?: string
          id?: string
          is_captain?: boolean
          jersey_number?: string | null
          position?: string | null
          student_id?: string
          team_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "roster_memberships_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "roster_memberships_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      seasons: {
        Row: {
          created_at: string
          end_date: string
          id: string
          is_archived: boolean
          is_current: boolean
          name: string
          school_year: string
          start_date: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          end_date: string
          id?: string
          is_archived?: boolean
          is_current?: boolean
          name: string
          school_year: string
          start_date: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          end_date?: string
          id?: string
          is_archived?: boolean
          is_current?: boolean
          name?: string
          school_year?: string
          start_date?: string
          updated_at?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          description: string | null
          key: string
          updated_at: string
          updated_by: string | null
          value: Json
        }
        Insert: {
          description?: string | null
          key: string
          updated_at?: string
          updated_by?: string | null
          value: Json
        }
        Update: {
          description?: string | null
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Relationships: [
          {
            foreignKeyName: "site_settings_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      sport_venues: {
        Row: {
          sport_id: string
          venue_id: string
        }
        Insert: {
          sport_id: string
          venue_id: string
        }
        Update: {
          sport_id?: string
          venue_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sport_venues_sport_id_fkey"
            columns: ["sport_id"]
            isOneToOne: false
            referencedRelation: "sports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sport_venues_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
      sports: {
        Row: {
          category: Database["public"]["Enums"]["sport_category"]
          created_at: string
          description: string
          id: string
          is_active: boolean
          is_high_performance: boolean
          name: string
          parent_sport_id: string | null
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          category: Database["public"]["Enums"]["sport_category"]
          created_at?: string
          description?: string
          id?: string
          is_active?: boolean
          is_high_performance?: boolean
          name: string
          parent_sport_id?: string | null
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          category?: Database["public"]["Enums"]["sport_category"]
          created_at?: string
          description?: string
          id?: string
          is_active?: boolean
          is_high_performance?: boolean
          name?: string
          parent_sport_id?: string | null
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sports_parent_sport_id_fkey"
            columns: ["parent_sport_id"]
            isOneToOne: false
            referencedRelation: "sports"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_profiles: {
        Row: {
          created_at: string
          display_name: string
          email: string
          is_active: boolean
          photo_path: string | null
          role: Database["public"]["Enums"]["staff_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          display_name: string
          email: string
          is_active?: boolean
          photo_path?: string | null
          role?: Database["public"]["Enums"]["staff_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          display_name?: string
          email?: string
          is_active?: boolean
          photo_path?: string | null
          role?: Database["public"]["Enums"]["staff_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      staff_scopes: {
        Row: {
          created_at: string
          id: string
          sport_id: string | null
          staff_user_id: string
          team_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          sport_id?: string | null
          staff_user_id: string
          team_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          sport_id?: string | null
          staff_user_id?: string
          team_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "staff_scopes_sport_id_fkey"
            columns: ["sport_id"]
            isOneToOne: false
            referencedRelation: "sports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_scopes_staff_user_id_fkey"
            columns: ["staff_user_id"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "staff_scopes_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      students: {
        Row: {
          created_at: string
          external_reference: string | null
          first_name: string
          graduation_year: number | null
          id: string
          is_active: boolean
          last_name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          external_reference?: string | null
          first_name: string
          graduation_year?: number | null
          id?: string
          is_active?: boolean
          last_name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          external_reference?: string | null
          first_name?: string
          graduation_year?: number | null
          id?: string
          is_active?: boolean
          last_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      team_standings: {
        Row: {
          competition_name: string
          draws: number
          id: string
          losses: number
          played: number
          points: number
          rank: number | null
          team_id: string
          updated_at: string
          wins: number
        }
        Insert: {
          competition_name: string
          draws?: number
          id?: string
          losses?: number
          played?: number
          points?: number
          rank?: number | null
          team_id: string
          updated_at?: string
          wins?: number
        }
        Update: {
          competition_name?: string
          draws?: number
          id?: string
          losses?: number
          played?: number
          points?: number
          rank?: number | null
          team_id?: string
          updated_at?: string
          wins?: number
        }
        Relationships: [
          {
            foreignKeyName: "team_standings_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          age_group: string
          created_at: string
          description: string
          home_venue_id: string | null
          id: string
          is_active: boolean
          name: string
          roster_name_mode: Database["public"]["Enums"]["roster_name_mode"]
          season_id: string
          slug: string
          sport_id: string
          updated_at: string
        }
        Insert: {
          age_group: string
          created_at?: string
          description?: string
          home_venue_id?: string | null
          id?: string
          is_active?: boolean
          name: string
          roster_name_mode?: Database["public"]["Enums"]["roster_name_mode"]
          season_id: string
          slug: string
          sport_id: string
          updated_at?: string
        }
        Update: {
          age_group?: string
          created_at?: string
          description?: string
          home_venue_id?: string | null
          id?: string
          is_active?: boolean
          name?: string
          roster_name_mode?: Database["public"]["Enums"]["roster_name_mode"]
          season_id?: string
          slug?: string
          sport_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "teams_home_venue_id_fkey"
            columns: ["home_venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teams_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teams_sport_id_fkey"
            columns: ["sport_id"]
            isOneToOne: false
            referencedRelation: "sports"
            referencedColumns: ["id"]
          },
        ]
      }
      tournament_placements: {
        Row: {
          created_at: string
          event_date: string
          id: string
          notes: string | null
          placement: string
          team_id: string
          tournament_name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          event_date: string
          id?: string
          notes?: string | null
          placement: string
          team_id: string
          tournament_name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          event_date?: string
          id?: string
          notes?: string | null
          placement?: string
          team_id?: string
          tournament_name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tournament_placements_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      venues: {
        Row: {
          capacity: number | null
          created_at: string
          description: string
          features: string[]
          id: string
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          capacity?: number | null
          created_at?: string
          description?: string
          features?: string[]
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          capacity?: number | null
          created_at?: string
          description?: string
          features?: string[]
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_roster_member: {
        Args: {
          first_name: string
          graduation_year?: number
          is_captain?: boolean
          jersey_number?: string
          last_name: string
          player_role?: string
          target_team_id: string
        }
        Returns: string
      }
      can_manage_media: { Args: { target_media_id: string }; Returns: boolean }
      can_manage_sport: { Args: { target_sport_id: string }; Returns: boolean }
      can_manage_student: {
        Args: { target_student_id: string }
        Returns: boolean
      }
      can_manage_team: { Args: { target_team_id: string }; Returns: boolean }
      can_read_media_path: { Args: { target_path: string }; Returns: boolean }
      current_staff_role: {
        Args: never
        Returns: Database["public"]["Enums"]["staff_role"]
      }
      get_public_roster: {
        Args: { target_team_id: string }
        Returns: {
          display_name: string
          is_captain: boolean
          jersey_number: string
          membership_id: string
          player_role: string
          team_id: string
        }[]
      }
      is_admin: { Args: never; Returns: boolean }
      is_editor: { Args: never; Returns: boolean }
      is_public_media: { Args: { target_media_id: string }; Returns: boolean }
    }
    Enums: {
      delivery_status: "pending" | "sent" | "failed" | "cancelled"
      fixture_status:
        | "draft"
        | "scheduled"
        | "completed"
        | "postponed"
        | "cancelled"
      home_away: "home" | "away" | "neutral"
      invitation_status: "pending" | "accepted" | "expired" | "revoked"
      match_outcome: "win" | "loss" | "draw" | "no_contest"
      media_approval_status: "pending" | "approved" | "rejected"
      media_kind: "photo" | "youtube" | "vimeo"
      media_visibility: "public" | "internal"
      publish_status: "draft" | "published" | "archived"
      roster_name_mode: "first_and_initial" | "full_name"
      sport_category: "primary" | "secondary" | "private_session"
      staff_role: "coach" | "editor" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  storage: {
    Tables: {
      buckets: {
        Row: {
          allowed_mime_types: string[] | null
          avif_autodetection: boolean | null
          created_at: string | null
          file_size_limit: number | null
          id: string
          name: string
          owner: string | null
          owner_id: string | null
          public: boolean | null
          type: Database["storage"]["Enums"]["buckettype"]
          updated_at: string | null
          versioning_status: string
        }
        Insert: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id: string
          name: string
          owner?: string | null
          owner_id?: string | null
          public?: boolean | null
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string | null
          versioning_status?: string
        }
        Update: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id?: string
          name?: string
          owner?: string | null
          owner_id?: string | null
          public?: boolean | null
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string | null
          versioning_status?: string
        }
        Relationships: []
      }
      buckets_analytics: {
        Row: {
          created_at: string
          deleted_at: string | null
          format: string
          id: string
          name: string
          type: Database["storage"]["Enums"]["buckettype"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          format?: string
          id?: string
          name: string
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          format?: string
          id?: string
          name?: string
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string
        }
        Relationships: []
      }
      buckets_vectors: {
        Row: {
          created_at: string
          id: string
          type: Database["storage"]["Enums"]["buckettype"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id: string
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string
        }
        Relationships: []
      }
      migrations: {
        Row: {
          executed_at: string | null
          hash: string
          id: number
          name: string
        }
        Insert: {
          executed_at?: string | null
          hash: string
          id: number
          name: string
        }
        Update: {
          executed_at?: string | null
          hash?: string
          id?: number
          name?: string
        }
        Relationships: []
      }
      objects: {
        Row: {
          archived_at: string | null
          bucket_id: string | null
          created_at: string | null
          id: string
          is_delete_marker: boolean
          is_versioned: boolean
          last_accessed_at: string | null
          metadata: Json | null
          name: string | null
          owner: string | null
          owner_id: string | null
          path_tokens: string[] | null
          updated_at: string | null
          user_metadata: Json | null
          version: string | null
        }
        Insert: {
          archived_at?: string | null
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          is_delete_marker?: boolean
          is_versioned?: boolean
          last_accessed_at?: string | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          owner_id?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          user_metadata?: Json | null
          version?: string | null
        }
        Update: {
          archived_at?: string | null
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          is_delete_marker?: boolean
          is_versioned?: boolean
          last_accessed_at?: string | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          owner_id?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          user_metadata?: Json | null
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "objects_bucketId_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
        ]
      }
      s3_multipart_uploads: {
        Row: {
          bucket_id: string
          created_at: string
          id: string
          in_progress_size: number
          key: string
          metadata: Json | null
          owner_id: string | null
          upload_signature: string
          user_metadata: Json | null
          version: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          id: string
          in_progress_size?: number
          key: string
          metadata?: Json | null
          owner_id?: string | null
          upload_signature: string
          user_metadata?: Json | null
          version: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          id?: string
          in_progress_size?: number
          key?: string
          metadata?: Json | null
          owner_id?: string | null
          upload_signature?: string
          user_metadata?: Json | null
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "s3_multipart_uploads_bucket_id_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
        ]
      }
      s3_multipart_uploads_parts: {
        Row: {
          bucket_id: string
          created_at: string
          etag: string
          id: string
          key: string
          owner_id: string | null
          part_number: number
          size: number
          upload_id: string
          version: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          etag: string
          id?: string
          key: string
          owner_id?: string | null
          part_number: number
          size?: number
          upload_id: string
          version: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          etag?: string
          id?: string
          key?: string
          owner_id?: string | null
          part_number?: number
          size?: number
          upload_id?: string
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "s3_multipart_uploads_parts_bucket_id_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "s3_multipart_uploads_parts_upload_id_fkey"
            columns: ["upload_id"]
            isOneToOne: false
            referencedRelation: "s3_multipart_uploads"
            referencedColumns: ["id"]
          },
        ]
      }
      vector_indexes: {
        Row: {
          bucket_id: string
          created_at: string
          data_type: string
          dimension: number
          distance_metric: string
          id: string
          metadata_configuration: Json | null
          name: string
          updated_at: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          data_type: string
          dimension: number
          distance_metric: string
          id?: string
          metadata_configuration?: Json | null
          name: string
          updated_at?: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          data_type?: string
          dimension?: number
          distance_metric?: string
          id?: string
          metadata_configuration?: Json | null
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "vector_indexes_bucket_id_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets_vectors"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      allow_any_operation: {
        Args: { expected_operations: string[] }
        Returns: boolean
      }
      allow_only_operation: {
        Args: { expected_operation: string }
        Returns: boolean
      }
      can_insert_object: {
        Args: { bucketid: string; metadata: Json; name: string; owner: string }
        Returns: undefined
      }
      extension: { Args: { name: string }; Returns: string }
      filename: { Args: { name: string }; Returns: string }
      foldername: { Args: { name: string }; Returns: string[] }
      get_common_prefix: {
        Args: { p_delimiter: string; p_key: string; p_prefix: string }
        Returns: string
      }
      get_size_by_bucket: {
        Args: never
        Returns: {
          bucket_id: string
          size: number
        }[]
      }
      list_multipart_uploads_with_delimiter: {
        Args: {
          bucket_id: string
          delimiter_param: string
          max_keys?: number
          next_key_token?: string
          next_upload_token?: string
          prefix_param: string
        }
        Returns: {
          created_at: string
          id: string
          key: string
        }[]
      }
      list_objects_with_delimiter: {
        Args: {
          _bucket_id: string
          delimiter_param: string
          max_keys?: number
          next_token?: string
          prefix_param: string
          sort_order?: string
          start_after?: string
        }
        Returns: {
          created_at: string
          id: string
          last_accessed_at: string
          metadata: Json
          name: string
          updated_at: string
        }[]
      }
      operation: { Args: never; Returns: string }
      search: {
        Args: {
          bucketname: string
          levels?: number
          limits?: number
          offsets?: number
          prefix: string
          search?: string
          sortcolumn?: string
          sortorder?: string
        }
        Returns: {
          created_at: string
          id: string
          last_accessed_at: string
          metadata: Json
          name: string
          updated_at: string
        }[]
      }
      search_by_timestamp: {
        Args: {
          p_bucket_id: string
          p_level: number
          p_limit: number
          p_prefix: string
          p_sort_column: string
          p_sort_column_after: string
          p_sort_order: string
          p_start_after: string
        }
        Returns: {
          created_at: string
          id: string
          key: string
          last_accessed_at: string
          metadata: Json
          name: string
          updated_at: string
        }[]
      }
      search_v2: {
        Args: {
          bucket_name: string
          levels?: number
          limits?: number
          prefix: string
          sort_column?: string
          sort_column_after?: string
          sort_order?: string
          start_after?: string
        }
        Returns: {
          created_at: string
          id: string
          key: string
          last_accessed_at: string
          metadata: Json
          name: string
          updated_at: string
        }[]
      }
    }
    Enums: {
      buckettype: "STANDARD" | "ANALYTICS" | "VECTOR"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      delivery_status: ["pending", "sent", "failed", "cancelled"],
      fixture_status: [
        "draft",
        "scheduled",
        "completed",
        "postponed",
        "cancelled",
      ],
      home_away: ["home", "away", "neutral"],
      invitation_status: ["pending", "accepted", "expired", "revoked"],
      match_outcome: ["win", "loss", "draw", "no_contest"],
      media_approval_status: ["pending", "approved", "rejected"],
      media_kind: ["photo", "youtube", "vimeo"],
      media_visibility: ["public", "internal"],
      publish_status: ["draft", "published", "archived"],
      roster_name_mode: ["first_and_initial", "full_name"],
      sport_category: ["primary", "secondary", "private_session"],
      staff_role: ["coach", "editor", "admin"],
    },
  },
  storage: {
    Enums: {
      buckettype: ["STANDARD", "ANALYTICS", "VECTOR"],
    },
  },
} as const
