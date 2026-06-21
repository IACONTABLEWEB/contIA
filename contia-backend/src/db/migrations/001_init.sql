-- ==========================================================
-- ContIA Argentina — Esquema Fase 1 (MVP Comparador de Balances)
-- PostgreSQL 15+
-- ==========================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS usuarios (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre          VARCHAR(150) NOT NULL,
    email           VARCHAR(255) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    plan            VARCHAR(20) NOT NULL DEFAULT 'gratis',
    activo          BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS empresas (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id      UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    razon_social    VARCHAR(255) NOT NULL,
    cuit            VARCHAR(13) NOT NULL,
    actividad       VARCHAR(255),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_empresa_cuit_usuario UNIQUE (usuario_id, cuit)
);
CREATE INDEX IF NOT EXISTS idx_empresas_usuario ON empresas(usuario_id);

CREATE TABLE IF NOT EXISTS balances (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id      UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    ejercicio       INTEGER NOT NULL,
    archivo_pdf     VARCHAR(500) NOT NULL,
    estado_proceso  VARCHAR(20) NOT NULL DEFAULT 'pendiente',
    error_detalle   TEXT,
    fecha_carga     TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_balance_empresa_ejercicio UNIQUE (empresa_id, ejercicio)
);
CREATE INDEX IF NOT EXISTS idx_balances_empresa ON balances(empresa_id);

CREATE TABLE IF NOT EXISTS cuentas_balance (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    balance_id      UUID NOT NULL REFERENCES balances(id) ON DELETE CASCADE,
    codigo          VARCHAR(50),
    nombre          VARCHAR(255) NOT NULL,
    importe         NUMERIC(18,2) NOT NULL,
    rubro           VARCHAR(100),
    orden           INTEGER
);
CREATE INDEX IF NOT EXISTS idx_cuentas_balance_id ON cuentas_balance(balance_id);

CREATE TABLE IF NOT EXISTS analisis (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    balance_a_id    UUID NOT NULL REFERENCES balances(id),
    balance_b_id    UUID NOT NULL REFERENCES balances(id),
    resultado_json  JSONB NOT NULL,
    informe_docx    VARCHAR(500),
    informe_pdf     VARCHAR(500),
    fecha           TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_analisis_balances ON analisis(balance_a_id, balance_b_id);
