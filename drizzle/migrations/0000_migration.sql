CREATE TYPE public.app_role AS ENUM ('admin');
CREATE TYPE public.lead_status AS ENUM ('novo','em_contato','acompanhando','descartado');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Usuário lê o próprio papel" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE TABLE public.leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL CHECK (char_length(btrim(nome)) BETWEEN 1 AND 100),
  whatsapp text NOT NULL CHECK (whatsapp ~ '^[0-9]{12,13}$'),
  carreira_alvo text CHECK (carreira_alvo IS NULL OR char_length(carreira_alvo) <= 100),
  consentimento boolean NOT NULL CHECK (consentimento = true),
  status public.lead_status NOT NULL DEFAULT 'novo',
  observacoes text CHECK (observacoes IS NULL OR char_length(observacoes) <= 2000),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.leads TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.leads TO authenticated;
GRANT ALL ON public.leads TO service_role;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Público insere leads" ON public.leads FOR INSERT TO anon, authenticated
  WITH CHECK (consentimento = true AND status = 'novo' AND observacoes IS NULL);
CREATE POLICY "Admin lê leads" ON public.leads FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin altera leads" ON public.leads FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin exclui leads" ON public.leads FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.eventos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo text NOT NULL CHECK (tipo IN ('calculo_feito','clique_ajuda','lead_enviado')),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.eventos TO anon;
GRANT SELECT, INSERT ON public.eventos TO authenticated;
GRANT ALL ON public.eventos TO service_role;
ALTER TABLE public.eventos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Público insere eventos" ON public.eventos FOR INSERT TO anon, authenticated
  WITH CHECK (tipo IN ('calculo_feito','clique_ajuda','lead_enviado'));
CREATE POLICY "Admin lê eventos" ON public.eventos FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));