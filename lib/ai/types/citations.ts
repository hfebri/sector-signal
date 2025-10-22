/**
 * Citation System Type Definitions
 *
 * Defines the structure for tracking and displaying citations in RAG-powered AI outputs.
 * This ensures transparency and prevents hallucination by showing which documents
 * were used to generate each recommendation.
 */

import { AnnualStrategy } from "../strategy-generator";

/**
 * Core citation structure representing a single source reference
 */
export interface Citation {
  /** Unique identifier of the source document */
  documentId: string;

  /** Human-readable document name (e.g., "Instagram_Analytics_Q3_2024.csv") */
  documentName: string;

  /** Index of the chunk within the document */
  chunkIndex: number;

  /** Actual text excerpt from the document (max 200 chars for display) */
  excerpt: string;

  /** Semantic similarity score (0-1) indicating relevance to the query */
  relevanceScore: number;

  /** Citation number for inline references (e.g., 1, 2, 3) */
  citationNumber?: number;

  /** Additional metadata about the source */
  metadata: {
    /** Platform the data is from (e.g., "instagram", "facebook") */
    platform?: string;

    /** Time period the data covers (e.g., "Q3 2024", "March 2024") */
    period?: string;

    /** Category of document (e.g., "analytics", "rivaliq", "general") */
    category?: string;

    /** Original file name */
    fileName?: string;
  };
}

/**
 * Data quality metrics for a set of citations
 */
export interface DataQuality {
  /** Whether any RAG data was used (false = generic strategy) */
  hasRAGData: boolean;

  /** Coverage score from 0-100 indicating how well data covers the strategy */
  coverageScore: number;

  /** Total number of documents analyzed */
  documentCount: number;

  /** Total number of chunks used */
  chunkCount: number;

  /** List of platforms covered (e.g., ["instagram", "facebook"]) */
  platforms: string[];

  /** Oldest data point date (ISO string) or null if no dates available */
  oldestDataDate: string | null;

  /** Newest data point date (ISO string) or null if no dates available */
  newestDataDate: string | null;

  /** Overall confidence level based on data quality and relevance */
  confidenceLevel: "low" | "medium" | "high";

  /** Average relevance score across all citations */
  averageRelevance: number;
}

/**
 * Citations grouped by strategy section
 */
export interface CitationsBySection {
  /** Citations used for SWOT analysis */
  swotAnalysis?: Citation[];

  /** Citations used for brand positioning */
  brandPositioning?: Citation[];

  /** Citations used for content pillars */
  contentPillars?: Citation[];

  /** Citations used for annual goals */
  annualGoals?: Citation[];

  /** Citations used for content playbook */
  contentPlaybook?: Citation[];

  /** Citations used for KPI framework */
  kpiFramework?: Citation[];
}

/**
 * Complete strategy with citation tracking
 */
export interface StrategyWithCitations {
  /** The generated annual strategy */
  strategy: AnnualStrategy;

  /** Citation data */
  citations: {
    /** All citations used across the entire strategy */
    overall: Citation[];

    /** Citations grouped by strategy section */
    bySection: CitationsBySection;
  };

  /** Data quality metrics */
  dataQuality: DataQuality;

  /** Strategy metadata */
  metadata?: {
    /** Unique ID if saved to database */
    strategyId?: string;

    /** Time period for the strategy */
    period?: {
      start: string;
      end: string;
      label: string;
    };

    /** Timestamp when strategy was generated */
    generatedAt?: string;
  };
}

/**
 * Options for citation tracking during generation
 */
export interface CitationTrackingOptions {
  /** Minimum relevance score to include a citation (0-1) */
  minRelevanceScore?: number;

  /** Maximum number of citations to track per section */
  maxCitationsPerSection?: number;

  /** Whether to include low-relevance citations */
  includeLowRelevance?: boolean;

  /** Whether to deduplicate citations across sections */
  deduplicateCitations?: boolean;
}

/**
 * Citation display preferences for UI components
 */
export interface CitationDisplayOptions {
  /** Show inline citation badges */
  showInlineCitations?: boolean;

  /** Show expandable source panel */
  showSourcePanel?: boolean;

  /** Show data quality badge */
  showDataQualityBadge?: boolean;

  /** Show confidence scores */
  showConfidenceScores?: boolean;

  /** Maximum excerpt length for display */
  maxExcerptLength?: number;

  /** Group citations by platform in display */
  groupByPlatform?: boolean;
}

/**
 * Citation validation result
 */
export interface CitationValidation {
  /** Whether the citation is valid */
  isValid: boolean;

  /** Validation errors if any */
  errors: string[];

  /** Validation warnings if any */
  warnings: string[];
}
