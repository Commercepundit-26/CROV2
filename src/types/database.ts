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
      audit_jobs: {
        Row: {
          id: string
          client_url: string
          competitor_urls: string[] | null
          custom_instructions: string | null
          status: 'pending' | 'crawling' | 'analyzing' | 'generating' | 'completed' | 'failed'
          created_at: string
          updated_at: string
          result_json: Json | null
        }
        Insert: {
          id?: string
          client_url: string
          competitor_urls?: string[] | null
          custom_instructions?: string | null
          status?: 'pending' | 'crawling' | 'analyzing' | 'generating' | 'completed' | 'failed'
          created_at?: string
          updated_at?: string
          result_json?: Json | null
        }
        Update: {
          id?: string
          client_url?: string
          competitor_urls?: string[] | null
          custom_instructions?: string | null
          status?: 'pending' | 'crawling' | 'analyzing' | 'generating' | 'completed' | 'failed'
          created_at?: string
          updated_at?: string
          result_json?: Json | null
        }
      }
      pages: {
        Row: {
          id: string
          audit_job_id: string | null
          url: string
          page_type: string | null
          screenshot_url: string | null
          dom_json: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          audit_job_id?: string | null
          url: string
          page_type?: string | null
          screenshot_url?: string | null
          dom_json?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          audit_job_id?: string | null
          url?: string
          page_type?: string | null
          screenshot_url?: string | null
          dom_json?: Json | null
          created_at?: string
        }
      }
      sections: {
        Row: {
          id: string
          page_id: string | null
          type: string | null
          bbox: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          page_id?: string | null
          type?: string | null
          bbox?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          page_id?: string | null
          type?: string | null
          bbox?: Json | null
          created_at?: string
        }
      }
      components: {
        Row: {
          id: string
          section_id: string | null
          type: string | null
          bbox: Json | null
          computed_styles: Json | null
          screenshot_id: string | null
          dom_snippet: string | null
        }
        Insert: {
          id?: string
          section_id?: string | null
          type?: string | null
          bbox?: Json | null
          computed_styles?: Json | null
          screenshot_id?: string | null
          dom_snippet?: string | null
        }
        Update: {
          id?: string
          section_id?: string | null
          type?: string | null
          bbox?: Json | null
          computed_styles?: Json | null
          screenshot_id?: string | null
          dom_snippet?: string | null
        }
      }
      issues: {
        Row: {
          id: string
          audit_job_id: string | null
          rule_id: string
          page_id: string | null
          component_id: string | null
          severity: string | null
          title: string | null
          description: string | null
          evidence: Json | null
          ai_explanation: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          audit_job_id?: string | null
          rule_id: string
          page_id?: string | null
          component_id?: string | null
          severity?: string | null
          title?: string | null
          description?: string | null
          evidence?: Json | null
          ai_explanation?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          audit_job_id?: string | null
          rule_id?: string
          page_id?: string | null
          component_id?: string | null
          severity?: string | null
          title?: string | null
          description?: string | null
          evidence?: Json | null
          ai_explanation?: Json | null
          created_at?: string
        }
      }
      competitor_pages: {
        Row: {
          id: string
          audit_job_id: string | null
          url: string
          page_type: string | null
          screenshot_url: string | null
          dom_json: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          audit_job_id?: string | null
          url: string
          page_type?: string | null
          screenshot_url?: string | null
          dom_json?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          audit_job_id?: string | null
          url?: string
          page_type?: string | null
          screenshot_url?: string | null
          dom_json?: Json | null
          created_at?: string
        }
      }
    }
  }
}
