
CREATE TABLE public.chat_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  session_id TEXT,
  user_message TEXT NOT NULL,
  bot_reply TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.chat_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can insert chat logs" ON public.chat_logs
FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view own chat logs" ON public.chat_logs
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all chat logs" ON public.chat_logs
FOR SELECT USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Block anonymous access to chat_logs" ON public.chat_logs
FOR ALL USING (false);
