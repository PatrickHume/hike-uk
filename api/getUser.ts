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

// Example of how to verify and get user data server-side.
const getUser = async (req: Request, res: Response): Promise<Response> => {
  const token: string | string[] | undefined = req.headers.token;
  if (token === undefined) return res.status(400).json({ error: 'Token is missing' });

  const { data: user, error } = await supabase.auth.api.getUser(token as string);

  if (error) return res.status(401).json({ error: error.message });
  return res.status(200).json(user);
};

export default getUser;
