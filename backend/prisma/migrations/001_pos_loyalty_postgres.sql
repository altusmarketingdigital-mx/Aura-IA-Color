-- ============================================================================
-- AURA IA COLOR — Migración SQL para Módulo POS y Lealtad Digital (PostgreSQL)
-- Compatible con PostgreSQL 15+ / Supabase / Neon
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Tabla de Clientes del Programa de Lealtad
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(160) NOT NULL,
  phone VARCHAR(30) NOT NULL UNIQUE,
  email VARCHAR(180),
  qr_token VARCHAR(80) NOT NULL UNIQUE,
  current_points INTEGER NOT NULL DEFAULT 0 CHECK (current_points >= 0),
  total_visits INTEGER NOT NULL DEFAULT 0 CHECK (total_visits >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_clients_qr_token ON clients (qr_token);
CREATE INDEX IF NOT EXISTS idx_clients_phone ON clients (phone);
CREATE INDEX IF NOT EXISTS idx_clients_name ON clients (name);

-- 2. Catálogo de Servicios y Productos para POS
CREATE TABLE IF NOT EXISTS services_catalog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(160) NOT NULL,
  category VARCHAR(40) NOT NULL CHECK (category IN ('Servicio', 'Producto')),
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  points_awarded INTEGER NOT NULL DEFAULT 0 CHECK (points_awarded >= 0),
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_services_catalog_active_category ON services_catalog (active, category);

-- 3. Catálogo de Recompensas
CREATE TABLE IF NOT EXISTS rewards_catalog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(160) NOT NULL,
  description TEXT NOT NULL,
  required_points INTEGER NOT NULL CHECK (required_points > 0),
  discount_type VARCHAR(30) NOT NULL CHECK (discount_type IN ('percentage', 'fixed', 'free_service')),
  discount_value NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (discount_value >= 0),
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rewards_catalog_active ON rewards_catalog (active, required_points);

-- 4. Transacciones de Punto de Venta (POS)
CREATE TABLE IF NOT EXISTS pos_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  idempotency_key UUID NOT NULL UNIQUE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
  items JSONB NOT NULL,
  subtotal NUMERIC(10, 2) NOT NULL CHECK (subtotal >= 0),
  discount_applied NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (discount_applied >= 0),
  total_paid NUMERIC(10, 2) NOT NULL CHECK (total_paid >= 0),
  points_earned INTEGER NOT NULL DEFAULT 0 CHECK (points_earned >= 0),
  points_redeemed INTEGER NOT NULL DEFAULT 0 CHECK (points_redeemed >= 0),
  reward_id UUID REFERENCES rewards_catalog(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_pos_transactions_idempotency ON pos_transactions (idempotency_key);
CREATE INDEX IF NOT EXISTS idx_pos_transactions_client_created ON pos_transactions (client_id, created_at DESC);

-- 5. Libro Mayor de Movimientos de Lealtad (Ledger Inmutable)
CREATE TABLE IF NOT EXISTS loyalty_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  transaction_id UUID REFERENCES pos_transactions(id) ON DELETE SET NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('EARN', 'REDEEM', 'ADJUSTMENT')),
  points_delta INTEGER NOT NULL,
  visits_delta INTEGER NOT NULL DEFAULT 0,
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_loyalty_ledger_client_created ON loyalty_ledger (client_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_loyalty_ledger_transaction ON loyalty_ledger (transaction_id);

-- 6. Trigger para proteger el saldo negativo en clients
CREATE OR REPLACE FUNCTION prevent_negative_client_points()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.current_points < 0 THEN
    RAISE EXCEPTION 'El saldo de puntos del cliente no puede ser negativo';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_clients_non_negative_points ON clients;
CREATE TRIGGER trg_clients_non_negative_points
BEFORE INSERT OR UPDATE ON clients
FOR EACH ROW
EXECUTE FUNCTION prevent_negative_client_points();

-- 7. Función RPC Atómica para procesar ventas en POS con Idempotencia y ventana anti-duplicados (60s)
CREATE OR REPLACE FUNCTION process_pos_sale(
  p_idempotency_key UUID,
  p_client_id UUID,
  p_items JSONB,
  p_subtotal NUMERIC,
  p_discount_applied NUMERIC,
  p_total_paid NUMERIC,
  p_points_earned INTEGER,
  p_points_redeemed INTEGER,
  p_reward_id UUID DEFAULT NULL,
  p_notes TEXT DEFAULT NULL
)
RETURNS TABLE (
  transaction_id UUID,
  new_points INTEGER,
  new_visits INTEGER
) AS $$
DECLARE
  v_existing_tx UUID;
  v_recent_dup UUID;
  v_client_points INTEGER;
  v_tx_id UUID;
  v_new_points INTEGER;
  v_new_visits INTEGER;
BEGIN
  -- 1. Idempotencia estricta por UUID
  SELECT id INTO v_existing_tx
  FROM pos_transactions
  WHERE idempotency_key = p_idempotency_key;

  IF v_existing_tx IS NOT NULL THEN
    RAISE EXCEPTION 'DUPLICATE_IDEMPOTENCY_KEY: La operación ya fue registrada anteriormente';
  END IF;

  -- 2. Bloqueo de fila del cliente para evitar condiciones de carrera
  SELECT current_points INTO v_client_points
  FROM clients
  WHERE id = p_client_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'CLIENT_NOT_FOUND: Cliente no encontrado';
  END IF;

  -- 3. Prevención de envíos repetidos (mismo cliente, monto e ítems en < 60 segundos)
  SELECT id INTO v_recent_dup
  FROM pos_transactions
  WHERE client_id = p_client_id
    AND total_paid = p_total_paid
    AND items = p_items
    AND created_at >= NOW() - INTERVAL '60 seconds'
  LIMIT 1;

  IF v_recent_dup IS NOT NULL THEN
    RAISE EXCEPTION 'RECENT_DUPLICATE_TRANSACTION: Se detectó un cobro idéntico hace menos de 60 segundos';
  END IF;

  -- 4. Validar saldo suficiente si se canjea recompensa
  IF p_points_redeemed > v_client_points THEN
    RAISE EXCEPTION 'INSUFFICIENT_POINTS: Puntos insuficientes para canjear la recompensa';
  END IF;

  -- 5. Insertar transacción POS
  INSERT INTO pos_transactions (
    idempotency_key,
    client_id,
    items,
    subtotal,
    discount_applied,
    total_paid,
    points_earned,
    points_redeemed,
    reward_id,
    notes
  )
  VALUES (
    p_idempotency_key,
    p_client_id,
    p_items,
    p_subtotal,
    p_discount_applied,
    p_total_paid,
    p_points_earned,
    p_points_redeemed,
    p_reward_id,
    p_notes
  )
  RETURNING id INTO v_tx_id;

  -- 6. Actualizar saldo y visitas del cliente
  UPDATE clients
  SET current_points = current_points + p_points_earned - p_points_redeemed,
      total_visits = total_visits + 1
  WHERE id = p_client_id
  RETURNING current_points, total_visits INTO v_new_points, v_new_visits;

  -- 7. Registrar movimiento de acumulación en loyalty_ledger
  IF p_points_earned > 0 THEN
    INSERT INTO loyalty_ledger (client_id, transaction_id, type, points_delta, visits_delta, description)
    VALUES (
      p_client_id,
      v_tx_id,
      'EARN',
      p_points_earned,
      1,
      COALESCE(p_notes, 'Acumulación por compra en caja POS')
    );
  ELSE
    INSERT INTO loyalty_ledger (client_id, transaction_id, type, points_delta, visits_delta, description)
    VALUES (
      p_client_id,
      v_tx_id,
      'EARN',
      0,
      1,
      COALESCE(p_notes, 'Registro de visita en caja POS')
    );
  END IF;

  -- 8. Registrar movimiento de canje en loyalty_ledger si aplica
  IF p_points_redeemed > 0 THEN
    INSERT INTO loyalty_ledger (client_id, transaction_id, type, points_delta, visits_delta, description)
    VALUES (
      p_client_id,
      v_tx_id,
      'REDEEM',
      -p_points_redeemed,
      0,
      'Canje de recompensa aplicado en caja POS'
    );
  END IF;

  RETURN QUERY SELECT v_tx_id, v_new_points, v_new_visits;
END;
$$ LANGUAGE plpgsql;
