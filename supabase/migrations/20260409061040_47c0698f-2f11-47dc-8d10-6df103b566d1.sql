
-- Create challenge rooms table for online multiplayer
CREATE TABLE public.challenge_rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_code text NOT NULL UNIQUE,
  creator_name text NOT NULL,
  joiner_name text,
  subject text NOT NULL DEFAULT 'all',
  game_state jsonb NOT NULL DEFAULT '{}',
  cell_owners jsonb NOT NULL DEFAULT '{}',
  current_player text NOT NULL DEFAULT 'green',
  current_question jsonb,
  selected_cell text,
  winner text,
  status text NOT NULL DEFAULT 'waiting',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.challenge_rooms ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can read rooms" ON public.challenge_rooms FOR SELECT USING (true);
CREATE POLICY "Anyone can create rooms" ON public.challenge_rooms FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update rooms" ON public.challenge_rooms FOR UPDATE USING (true) WITH CHECK (true);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.challenge_rooms;
