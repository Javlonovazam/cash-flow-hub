ALTER TABLE public.transactions
  ADD COLUMN IF NOT EXISTS operation_number text,
  ADD COLUMN IF NOT EXISTS cash_flow_category text,
  ADD COLUMN IF NOT EXISTS branch text,
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'completed',
  ADD COLUMN IF NOT EXISTS created_by_name text,
  ADD COLUMN IF NOT EXISTS approved_by text;