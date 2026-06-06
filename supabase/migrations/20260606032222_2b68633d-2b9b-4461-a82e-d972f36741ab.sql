CREATE TABLE IF NOT EXISTS public.cash_flow_expected_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_type text NOT NULL CHECK (payment_type IN ('expected_income','expected_expense','debt_payable','debt_receivable')),
  due_date date NOT NULL,
  amount numeric NOT NULL CHECK (amount >= 0),
  currency public.currency_code NOT NULL DEFAULT 'UZS'::public.currency_code,
  usd_rate numeric,
  amount_uzs numeric,
  account_id uuid,
  contragent_id uuid,
  employee_id uuid,
  counterparty text,
  category text NOT NULL DEFAULT 'Boshqa',
  branch text,
  status text NOT NULL DEFAULT 'planned' CHECK (status IN ('planned','completed','overdue','cancelled')),
  note text,
  created_by_name text,
  approved_by text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.cash_flow_expected_payments TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cash_flow_expected_payments TO authenticated;
GRANT ALL ON public.cash_flow_expected_payments TO service_role;

ALTER TABLE public.cash_flow_expected_payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS cash_flow_expected_payments_all_public ON public.cash_flow_expected_payments;
CREATE POLICY cash_flow_expected_payments_all_public
ON public.cash_flow_expected_payments
FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'set_cash_flow_expected_payments_updated_at'
  ) THEN
    CREATE TRIGGER set_cash_flow_expected_payments_updated_at
    BEFORE UPDATE ON public.cash_flow_expected_payments
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'audit_cash_flow_expected_payments'
  ) THEN
    CREATE TRIGGER audit_cash_flow_expected_payments
    AFTER INSERT OR UPDATE OR DELETE ON public.cash_flow_expected_payments
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger();
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'audit_transactions_cash_flow'
  ) THEN
    CREATE TRIGGER audit_transactions_cash_flow
    AFTER INSERT OR UPDATE OR DELETE ON public.transactions
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger();
  END IF;
END $$;