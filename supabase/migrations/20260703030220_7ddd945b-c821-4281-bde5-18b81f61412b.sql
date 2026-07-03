
-- 1) subscription_requests: private per-request token
ALTER TABLE public.subscription_requests
  ADD COLUMN IF NOT EXISTS request_token text;

-- Backfill any existing rows with a random token so schema stays consistent
UPDATE public.subscription_requests
SET request_token = encode(gen_random_bytes(24), 'hex')
WHERE request_token IS NULL;

ALTER TABLE public.subscription_requests
  ALTER COLUMN request_token SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS subscription_requests_token_key
  ON public.subscription_requests(request_token);

-- 2) messages: bound input size and rate-limit per name
ALTER TABLE public.messages
  ADD CONSTRAINT messages_message_len_chk
  CHECK (char_length(message) BETWEEN 1 AND 1000) NOT VALID;
ALTER TABLE public.messages VALIDATE CONSTRAINT messages_message_len_chk;

ALTER TABLE public.messages
  ADD CONSTRAINT messages_student_name_len_chk
  CHECK (char_length(student_name) BETWEEN 1 AND 80) NOT VALID;
ALTER TABLE public.messages VALIDATE CONSTRAINT messages_student_name_len_chk;

CREATE OR REPLACE FUNCTION public.messages_rate_limit()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  recent_count int;
BEGIN
  SELECT count(*) INTO recent_count
  FROM public.messages
  WHERE student_name = NEW.student_name
    AND created_at > (now() - interval '1 minute');
  IF recent_count >= 5 THEN
    RAISE EXCEPTION 'Rate limit: too many messages, please wait a moment';
  END IF;

  SELECT count(*) INTO recent_count
  FROM public.messages
  WHERE student_name = NEW.student_name
    AND created_at > (now() - interval '1 hour');
  IF recent_count >= 30 THEN
    RAISE EXCEPTION 'Rate limit: hourly message limit reached';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS messages_rate_limit_trg ON public.messages;
CREATE TRIGGER messages_rate_limit_trg
BEFORE INSERT ON public.messages
FOR EACH ROW EXECUTE FUNCTION public.messages_rate_limit();
