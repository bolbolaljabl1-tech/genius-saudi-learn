
CREATE TABLE public.leaderboard (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_name text NOT NULL,
  xp integer NOT NULL DEFAULT 0,
  badges text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.leaderboard ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read leaderboard" ON public.leaderboard FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Anyone can insert leaderboard" ON public.leaderboard FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Anyone can update leaderboard" ON public.leaderboard FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
