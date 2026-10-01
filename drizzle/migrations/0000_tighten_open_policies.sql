-- subscription_requests: written only by the backend function (service role)
DROP POLICY IF EXISTS "Anyone can create subscription requests" ON public.subscription_requests;

-- genius_gallery: feature removed, lock table
DROP POLICY IF EXISTS "Anyone can insert genius_gallery" ON public.genius_gallery;
DROP POLICY IF EXISTS "Anyone can read genius_gallery" ON public.genius_gallery;

-- messages: validated inserts only
DROP POLICY IF EXISTS "Anyone can insert messages" ON public.messages;
CREATE POLICY "Validated message inserts" ON public.messages
FOR INSERT TO anon, authenticated
WITH CHECK (
  char_length(btrim(student_name)) BETWEEN 2 AND 60
  AND char_length(btrim(message)) BETWEEN 1 AND 1000
);

-- leaderboard
DROP POLICY IF EXISTS "Anyone can insert leaderboard" ON public.leaderboard;
DROP POLICY IF EXISTS "Anyone can read leaderboard" ON public.leaderboard;
DROP POLICY IF EXISTS "Anyone can update leaderboard" ON public.leaderboard;
CREATE POLICY "Read valid leaderboard rows" ON public.leaderboard
FOR SELECT TO anon, authenticated
USING (xp >= 0 AND char_length(student_name) BETWEEN 2 AND 60);
CREATE POLICY "Validated leaderboard inserts" ON public.leaderboard
FOR INSERT TO anon, authenticated
WITH CHECK (
  char_length(btrim(student_name)) BETWEEN 2 AND 60
  AND xp BETWEEN 0 AND 5000
  AND (badges IS NULL OR cardinality(badges) <= 50)
);
CREATE POLICY "Validated leaderboard updates" ON public.leaderboard
FOR UPDATE TO anon, authenticated
USING (xp >= 0)
WITH CHECK (
  xp >= 0 AND xp <= 10000000
  AND (badges IS NULL OR cardinality(badges) <= 50)
);

-- challenge_rooms: only active rooms (< 2h old, unfinished) are reachable
DROP POLICY IF EXISTS "Anyone can create rooms" ON public.challenge_rooms;
DROP POLICY IF EXISTS "Anyone can read rooms" ON public.challenge_rooms;
DROP POLICY IF EXISTS "Anyone can update rooms" ON public.challenge_rooms;
CREATE POLICY "Read active rooms" ON public.challenge_rooms
FOR SELECT TO anon, authenticated
USING (created_at > now() - interval '2 hours');
CREATE POLICY "Create valid rooms" ON public.challenge_rooms
FOR INSERT TO anon, authenticated
WITH CHECK (
  char_length(room_code) BETWEEN 4 AND 12
  AND char_length(btrim(creator_name)) BETWEEN 1 AND 60
  AND status = 'waiting'
  AND winner IS NULL
  AND joiner_name IS NULL
);
CREATE POLICY "Update active rooms" ON public.challenge_rooms
FOR UPDATE TO anon, authenticated
USING (created_at > now() - interval '2 hours' AND winner IS NULL AND status <> 'finished')
WITH CHECK (
  status IN ('waiting','playing','finished')
  AND current_player IN ('green','red')
  AND (joiner_name IS NULL OR char_length(btrim(joiner_name)) BETWEEN 1 AND 60)
);