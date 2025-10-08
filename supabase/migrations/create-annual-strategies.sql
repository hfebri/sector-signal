-- Create annual_strategies table
CREATE TABLE IF NOT EXISTS annual_strategies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  strategy_data JSONB NOT NULL,
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  generated_with_rag INTEGER NOT NULL DEFAULT 0,
  document_count INTEGER DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create index for faster brand lookups
CREATE INDEX IF NOT EXISTS idx_annual_strategies_brand_id ON annual_strategies(brand_id);

-- Create index for date range queries
CREATE INDEX IF NOT EXISTS idx_annual_strategies_dates ON annual_strategies(start_date, end_date);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_annual_strategies_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_annual_strategies_updated_at
  BEFORE UPDATE ON annual_strategies
  FOR EACH ROW
  EXECUTE FUNCTION update_annual_strategies_updated_at();
