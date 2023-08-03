import { Request, Response } from 'express';
import { createClient, SupabaseClientOptions } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
  {
    db: {
      schema: 'custom',
    },
    auth: {
      persistSession: true,
    },
  } as SupabaseClientOptions
);

export default function handler(req: Request, res: Response): void {
  supabase.auth.api.setAuthCookie(req, res);
}