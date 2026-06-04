ALTER TABLE public.transactions ADD COLUMN zayavka_number TEXT;
CREATE INDEX idx_transactions_zayavka_number ON public.transactions(zayavka_number);