import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types
export interface Item {
  id: string;
  school_id: string;
  category: 'phone' | 'wallet' | 'keys' | 'bag' | 'clothing' | 'jewelry' | 'electronics' | 'documents' | 'other';
  name: string;
  description: string | null;
  photo_url: string | null;
  location_found: string;
  date_found: string;
  status: 'found' | 'claimed' | 'completed' | 'discarded';
  posted_by: string;
  created_at: string;
  updated_at: string;
}

export interface Claim {
  id: string;
  item_id: string;
  school_id: string;
  student_name: string;
  student_email: string;
  student_phone: string | null;
  description_of_loss: string;
  status: 'pending' | 'verified' | 'rejected' | 'completed';
  verified_by: string | null;
  verified_at: string | null;
  created_at: string;
}

export interface School {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
  }
