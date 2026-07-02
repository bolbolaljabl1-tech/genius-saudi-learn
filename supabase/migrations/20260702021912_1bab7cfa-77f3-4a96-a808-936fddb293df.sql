CREATE TABLE public.subscription_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_name text NOT NULL,
  plan text NOT NULL CHECK (plan IN ('semester','yearly')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','active')),
  requested_at timestamptz NOT NULL DEFAULT now(),
  activated_at timestamptz
);
GRANT INSERT ON public.subscription_requests TO anon, authenticated;
GRANT ALL ON public.subscription_requests TO service_role;
ALTER TABLE public.subscription_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can create subscription requests"
  ON public.subscription_requests FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
CREATE INDEX subscription_requests_status_idx ON public.subscription_requests(status, requested_at DESC);
CREATE INDEX subscription_requests_name_idx ON public.subscription_requests(lower(student_name));