
-- ============================================================
-- LEADERBOARD: prevent score tampering
-- ============================================================
CREATE OR REPLACE FUNCTION public.leaderboard_guard()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.xp IS NULL OR NEW.xp < 0 THEN
      NEW.xp := 0;
    END IF;
    -- New entries can't start with an absurd score
    IF NEW.xp > 5000 THEN
      RAISE EXCEPTION 'XP value too large for new entry';
    END IF;
    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE' THEN
    -- Immutable identity
    IF NEW.student_name IS DISTINCT FROM OLD.student_name THEN
      RAISE EXCEPTION 'student_name is immutable';
    END IF;
    -- XP must never decrease
    IF NEW.xp < OLD.xp THEN
      RAISE EXCEPTION 'XP cannot decrease';
    END IF;
    -- Cap single-write delta to 5000 to prevent inflation
    IF (NEW.xp - OLD.xp) > 5000 THEN
      RAISE EXCEPTION 'XP delta exceeds per-write limit';
    END IF;
    RETURN NEW;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS leaderboard_guard_trigger ON public.leaderboard;
CREATE TRIGGER leaderboard_guard_trigger
BEFORE INSERT OR UPDATE ON public.leaderboard
FOR EACH ROW EXECUTE FUNCTION public.leaderboard_guard();

-- ============================================================
-- CHALLENGE_ROOMS: prevent hijacking and post-finish tampering
-- ============================================================
CREATE OR REPLACE FUNCTION public.challenge_rooms_guard()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  -- TTL: no edits to rooms older than 2 hours
  IF OLD.created_at < (now() - interval '2 hours') THEN
    RAISE EXCEPTION 'Room is expired and read-only';
  END IF;

  -- Immutable identity fields
  IF NEW.room_code IS DISTINCT FROM OLD.room_code THEN
    RAISE EXCEPTION 'room_code is immutable';
  END IF;
  IF NEW.creator_name IS DISTINCT FROM OLD.creator_name THEN
    RAISE EXCEPTION 'creator_name is immutable';
  END IF;

  -- Once a joiner is recorded, it can't be swapped out
  IF OLD.joiner_name IS NOT NULL
     AND NEW.joiner_name IS DISTINCT FROM OLD.joiner_name THEN
    RAISE EXCEPTION 'joiner_name is locked once set';
  END IF;

  -- Once finished/winner declared, no further edits
  IF OLD.winner IS NOT NULL OR OLD.status = 'finished' THEN
    RAISE EXCEPTION 'Room is finished and read-only';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS challenge_rooms_guard_trigger ON public.challenge_rooms;
CREATE TRIGGER challenge_rooms_guard_trigger
BEFORE UPDATE ON public.challenge_rooms
FOR EACH ROW EXECUTE FUNCTION public.challenge_rooms_guard();
