-- DDL Script para criar a tabela edge_styles
-- Baseado na interface EdgeStyle e no uso da aplicação

CREATE TABLE IF NOT EXISTS public.edge_styles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    image VARCHAR(255),
    price_per_linear_ft DECIMAL(10,2) NOT NULL CHECK (price_per_linear_ft >= 0),
    thickness VARCHAR(50) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP
);

-- Adicionar índices para performance
CREATE INDEX IF NOT EXISTS idx_edge_styles_is_active ON public.edge_styles(is_active);
CREATE INDEX IF NOT EXISTS idx_edge_styles_sort_order ON public.edge_styles(sort_order);
CREATE INDEX IF NOT EXISTS idx_edge_styles_name ON public.edge_styles(name);

-- Dados de exemplo baseados no componente EdgeSelection.tsx
INSERT INTO public.edge_styles (name, description, image, price_per_linear_ft, thickness, is_active, sort_order) VALUES
    ('Eased Edge', 'Smooth slightly rounded edge for a clean, modern look', '/assets/images/edges/eased-edge.png', 8.50, '3 CM', true, 1),
    ('Bullnose', 'Fully rounded edge that provides a soft, elegant appearance', '/assets/images/edges/bullnose.png', 12.75, '3 CM', true, 2),
    ('Double Radius Edge', 'Double curved edge offering sophisticated styling', '/assets/images/edges/double-radius.png', 15.25, '3 CM', true, 3),
    ('Half Bullnose Edge', 'Semi-rounded edge combining modern and traditional styles', '/assets/images/edges/half-bullnose.png', 10.50, '2 CM', true, 4),
    ('Ogee Edge', 'Classic decorative edge with elegant S-curve profile', '/assets/images/edges/ogee.png', 18.00, '3 CM', true, 5);

-- Comentários na tabela
COMMENT ON TABLE public.edge_styles IS 'Tabela que armazena os diferentes estilos de bordas disponíveis para bancadas';
COMMENT ON COLUMN public.edge_styles.id IS 'Identificador único do estilo de borda';
COMMENT ON COLUMN public.edge_styles.name IS 'Nome do estilo de borda';
COMMENT ON COLUMN public.edge_styles.description IS 'Descrição detalhada do estilo de borda';
COMMENT ON COLUMN public.edge_styles.image IS 'Caminho para a imagem do estilo de borda';
COMMENT ON COLUMN public.edge_styles.price_per_linear_ft IS 'Preço por pé linear em dólares';
COMMENT ON COLUMN public.edge_styles.thickness IS 'Espessura da borda (ex: 2 CM, 3 CM)';
COMMENT ON COLUMN public.edge_styles.is_active IS 'Indica se o estilo de borda está ativo/disponível';
COMMENT ON COLUMN public.edge_styles.sort_order IS 'Ordem de exibição dos estilos de borda';
COMMENT ON COLUMN public.edge_styles.created_at IS 'Data e hora de criação do registro';
COMMENT ON COLUMN public.edge_styles.updated_at IS 'Data e hora da última atualização';

-- Trigger para atualizar automaticamente o campo updated_at
CREATE OR REPLACE FUNCTION update_edge_styles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_edge_styles_updated_at
    BEFORE UPDATE ON public.edge_styles
    FOR EACH ROW
    EXECUTE FUNCTION update_edge_styles_updated_at();

-- Conceder permissões necessárias (ajuste conforme seu setup)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON public.edge_styles TO your_app_user;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO your_app_user;