CREATE TABLE public.genius_gallery (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_name TEXT NOT NULL,
  medal TEXT NOT NULL DEFAULT 'bronze',
  time_seconds INTEGER NOT NULL DEFAULT 0,
  subject TEXT NOT NULL DEFAULT 'all',
  game_mode TEXT NOT NULL DEFAULT 'pvp',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.genius_gallery ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read genius_gallery"
  ON public.genius_gallery FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert genius_gallery"
  ON public.genius_gallery FOR INSERT
  WITH CHECK (true);