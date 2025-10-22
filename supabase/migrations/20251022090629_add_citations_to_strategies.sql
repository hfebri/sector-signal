-- Add citations and data_quality columns to annual_strategies table
ALTER TABLE annual_strategies
ADD COLUMN IF NOT EXISTS citations jsonb,
ADD COLUMN IF NOT EXISTS data_quality jsonb;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_annual_strategies_brand_created
ON annual_strategies(brand_id, created_at DESC);

-- Add comment
COMMENT ON COLUMN annual_strategies.citations IS 'Cached citations from vector search used to generate strategy';
COMMENT ON COLUMN annual_strategies.data_quality IS 'Data quality metrics for the strategy';
