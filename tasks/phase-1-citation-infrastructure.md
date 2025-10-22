# Phase 1: Citation Infrastructure - Detailed Implementation Plan

## 📋 Task Summary

Implement a comprehensive citation and source verification system for RAG-powered AI outputs to ensure transparency, prevent hallucination, and build user trust in AI-generated strategies.

## 🎯 Goals

1. **Citation Tracking**: Track and display which documents were used to generate each insight
2. **Confidence Scoring**: Show reliability scores for data-backed vs. generic recommendations
3. **Source Verification**: Prevent hallucination by requiring citations for quantitative claims
4. **UI Transparency**: Visual indicators showing data quality and coverage
5. **User Trust**: Clear attribution to build confidence in AI recommendations

## 🔍 Current State Analysis

### ✅ Already Built
- Vector search with similarity scores (`lib/ai/vector-search.ts`)
- Context builder for formatting RAG results (`lib/ai/context-builder.ts`)
- Strategy generator with RAG integration (`lib/ai/strategy-generator.ts`)
- Database with 111 documents and 1,788 processed chunks
- Strategy UI with tabbed interface (`app/strategy/page.tsx`)

### ❌ Missing Components
- Citation data structure and tracking
- Citation UI components (badges, panels, expandable sources)
- Confidence scoring system
- Data quality indicators
- Source verification in AI prompts
- Hallucination detection mechanisms

## 📁 Files to Create

### 1. Type Definitions & Interfaces
- `lib/ai/types/citations.ts` - Citation interfaces and types

### 2. Citation Tracking System
- `lib/ai/citation-tracker.ts` - Core citation tracking logic
- `lib/ai/confidence-scorer.ts` - Confidence scoring algorithms

### 3. Enhanced Vector Search
- Modify `lib/ai/vector-search.ts` - Add citation metadata to search results

### 4. Enhanced Context Builder
- Modify `lib/ai/context-builder.ts` - Include citation instructions in prompts

### 5. UI Components
- `components/citations/CitationBadge.tsx` - Inline citation badge
- `components/citations/SourcePanel.tsx` - Expandable source panel
- `components/citations/DataQualityBadge.tsx` - Data quality indicator
- `components/citations/ConfidenceScore.tsx` - Confidence score display
- `components/citations/SourceCard.tsx` - Individual source card

### 6. API Enhancements
- Modify `app/api/strategy/generate/route.ts` - Return citations with strategy
- Create `app/api/strategy/latest/route.ts` modifications - Include citations

### 7. UI Integration
- Modify `app/strategy/page.tsx` - Display citations and data quality

## ✅ Detailed Todo Items

### Task 1: Create Citation Type Definitions
**File**: `lib/ai/types/citations.ts`

**What to Build**:
```typescript
// Core citation structure
interface Citation {
  documentId: string;
  documentName: string;
  chunkIndex: number;
  excerpt: string; // Actual text from document (max 200 chars)
  relevanceScore: number; // 0-1 similarity score
  metadata: {
    platform?: string;
    period?: string;
    category?: string;
    fileName?: string;
  };
}

// Strategy with citations
interface StrategyWithCitations {
  strategy: AnnualStrategy;
  citations: {
    overall: Citation[]; // All citations used
    bySection: {
      swotAnalysis?: Citation[];
      brandPositioning?: Citation[];
      contentPillars?: Citation[];
      annualGoals?: Citation[];
      contentPlaybook?: Citation[];
      kpiFramework?: Citation[];
    };
  };
  dataQuality: DataQuality;
}

// Data quality metrics
interface DataQuality {
  hasRAGData: boolean;
  coverageScore: number; // 0-100%
  documentCount: number;
  chunkCount: number;
  platforms: string[];
  oldestDataDate: string | null;
  newestDataDate: string | null;
  confidenceLevel: 'low' | 'medium' | 'high';
}
```

**Expected Outcome**: TypeScript interfaces that ensure type safety across the citation system

---

### Task 2: Build Citation Tracker
**File**: `lib/ai/citation-tracker.ts`

**What to Build**:
- `trackCitations(searchResults: SearchResult[]): Citation[]` - Convert search results to citations
- `groupCitationsByPlatform(citations: Citation[]): Record<string, Citation[]>` - Group by platform
- `deduplicateCitations(citations: Citation[])` - Remove duplicate sources
- `sortCitationsByRelevance(citations: Citation[])` - Sort by relevance score

**Expected Outcome**: Utility functions to manage citations throughout generation process

---

### Task 3: Build Confidence Scorer
**File**: `lib/ai/confidence-scorer.ts`

**What to Build**:
- `calculateDataQuality(citations: Citation[], brandId: string): DataQuality` - Calculate quality metrics
- `getConfidenceLevel(citations: Citation[]): 'low' | 'medium' | 'high'` - Determine confidence
- `calculateCoverageScore(citations: Citation[]): number` - Calculate data coverage (0-100)

**Logic**:
- **High Confidence (0.8-1.0)**: 10+ citations, avg relevance > 0.75, multiple platforms
- **Medium Confidence (0.6-0.79)**: 5-9 citations, avg relevance > 0.6
- **Low Confidence (<0.6)**: <5 citations or avg relevance < 0.6

**Expected Outcome**: Scoring system that accurately reflects data reliability

---

### Task 4: Enhance Vector Search with Citations
**File**: `lib/ai/vector-search.ts` (modify existing)

**Changes**:
1. Add `includeMetadata: boolean` option to `searchBrandDocuments()`
2. Return richer metadata including document name from database
3. Add helper function `convertSearchResultsToCitations(results: SearchResult[]): Citation[]`

**Expected Outcome**: Vector search returns all data needed for citation tracking

---

### Task 5: Enhance Context Builder with Citation Instructions
**File**: `lib/ai/context-builder.ts` (modify existing)

**Changes**:
1. Add citation markers to context: `[Source: document_name.csv]`
2. Update `buildStrategyContext()` to include citation format instructions
3. Add prompt instructions:
   ```
   CITATION REQUIREMENTS:
   - For all quantitative claims, cite the source document
   - Use format: [Source: filename.csv]
   - If data is unavailable, explicitly state "Data not available"
   ```

**Expected Outcome**: AI prompts enforce citation requirements

---

### Task 6: Create Citation Badge Component
**File**: `components/citations/CitationBadge.tsx`

**What to Build**:
- Small inline badge showing citation
- Click to expand source details
- Confidence color coding (green/yellow/gray)
- Popover showing full excerpt and metadata

**Props**:
```typescript
interface CitationBadgeProps {
  citation: Citation;
  inline?: boolean;
}
```

**Expected Outcome**: Reusable component for inline citations

---

### Task 7: Create Source Panel Component
**File**: `components/citations/SourcePanel.tsx`

**What to Build**:
- Collapsible panel showing all sources
- Grouped by platform/category
- Shows relevance scores
- Displays excerpts with context

**Props**:
```typescript
interface SourcePanelProps {
  citations: Citation[];
  title?: string;
  defaultExpanded?: boolean;
}
```

**Expected Outcome**: Comprehensive source viewer for transparency

---

### Task 8: Create Data Quality Badge Component
**File**: `components/citations/DataQualityBadge.tsx`

**What to Build**:
- Badge showing "Data-Driven" vs "Generic" strategy
- Shows document count and platforms covered
- Color-coded by confidence level
- Tooltip with detailed quality metrics

**Props**:
```typescript
interface DataQualityBadgeProps {
  dataQuality: DataQuality;
  variant?: 'compact' | 'detailed';
}
```

**Expected Outcome**: Clear indicator of data backing

---

### Task 9: Create Confidence Score Component
**File**: `components/citations/ConfidenceScore.tsx`

**What to Build**:
- Visual confidence indicator (progress bar or gauge)
- Shows high/medium/low confidence
- Tooltip explaining what affects confidence
- Optional detailed breakdown

**Props**:
```typescript
interface ConfidenceScoreProps {
  confidenceLevel: 'low' | 'medium' | 'high';
  score: number;
  showDetails?: boolean;
}
```

**Expected Outcome**: Visual representation of recommendation reliability

---

### Task 10: Create Source Card Component
**File**: `components/citations/SourceCard.tsx`

**What to Build**:
- Individual source display in source panel
- Shows document name, excerpt, relevance score
- Platform/category badges
- Period indicator if available

**Props**:
```typescript
interface SourceCardProps {
  citation: Citation;
  index?: number;
}
```

**Expected Outcome**: Attractive source display card

---

### Task 11: Update Strategy Generator
**File**: `lib/ai/strategy-generator.ts` (modify existing)

**Changes**:
1. Track citations during RAG context building
2. Return `StrategyWithCitations` instead of just `AnnualStrategy`
3. Calculate data quality metrics
4. Group citations by strategy section (SWOT, positioning, etc.)

**New Function**:
```typescript
async function generateAnnualStrategyWithCitations(
  brandProfile: BrandProfile
): Promise<StrategyWithCitations>
```

**Expected Outcome**: Strategy generation includes full citation tracking

---

### Task 12: Update Strategy Generation API
**File**: `app/api/strategy/generate/route.ts` (modify existing)

**Changes**:
1. Return citations along with strategy
2. Save citations to database (new table or JSON field)
3. Return data quality metrics
4. Handle citation serialization

**Response Format**:
```json
{
  "strategy": {...},
  "citations": {
    "overall": [...],
    "bySection": {...}
  },
  "dataQuality": {...},
  "strategyId": "uuid",
  "period": {...}
}
```

**Expected Outcome**: API returns complete citation data

---

### Task 13: Update Strategy UI
**File**: `app/strategy/page.tsx` (modify existing)

**Changes**:
1. Add data quality badge to header
2. Add source panel as collapsible section
3. Add inline citation badges to strategy content (optional for MVP)
4. Show confidence scores per section
5. Add "View Sources" button/tab

**New UI Elements**:
- Data quality badge next to brand name
- "Sources Used (12)" expandable panel below tabs
- Confidence indicator per tab

**Expected Outcome**: Strategy page shows full citation transparency

---

### Task 14: Database Schema Update (Optional)
**File**: `lib/db/drizzle-schema.ts` (modify if needed)

**Changes** (if we want to persist citations):
- Add `citations` JSONB field to `annual_strategies` table
- Or create separate `strategy_citations` table with foreign key

**Note**: For MVP, we can store citations in the `strategyData` JSON or return them dynamically

**Expected Outcome**: Citations persisted for historical tracking

---

### Task 15: Create Citation Helper Utilities
**File**: `lib/ai/utils/citation-helpers.ts`

**What to Build**:
- `formatCitationText(citation: Citation): string` - Format for display
- `truncateExcerpt(text: string, maxLength: number): string` - Truncate with ellipsis
- `extractMetricsFromExcerpt(excerpt: string): string[]` - Find metrics in text
- `validateCitation(citation: Citation): boolean` - Ensure citation is valid

**Expected Outcome**: Reusable utilities for citation handling

---

## 🧪 Testing Checklist

After implementation, verify:

- [ ] Citations are tracked for all RAG-powered generations
- [ ] Confidence scores accurately reflect data quality
- [ ] UI components render correctly with various citation counts
- [ ] Data quality badge shows accurate metrics
- [ ] Source panel displays all sources with proper grouping
- [ ] No citations shown for generic (non-RAG) strategies
- [ ] Citations persist across page reloads
- [ ] Performance: citation tracking doesn't slow generation
- [ ] Mobile responsive: citation UI works on small screens

## ⚠️ Potential Risks & Considerations

### Risk 1: Performance Impact
**Issue**: Tracking citations may slow down generation
**Mitigation**: Parallel processing, cache search results, optimize queries

### Risk 2: UI Clutter
**Issue**: Too many citations may overwhelm UI
**Mitigation**: Use collapsible panels, show top 5 by default, "View all" expansion

### Risk 3: Citation Accuracy
**Issue**: AI might not follow citation format in prompts
**Mitigation**: Structured output with separate citation field, post-processing validation

### Risk 4: Database Size
**Issue**: Storing all citations may increase storage
**Mitigation**: Store only top N citations per section, compress excerpts

## 📊 Success Metrics

- **Transparency**: 100% of RAG-generated strategies show data sources
- **Accuracy**: 95%+ of quantitative claims have valid citations
- **User Trust**: Clear distinction between data-driven vs generic recommendations
- **Performance**: Citation tracking adds <10% to generation time
- **Coverage**: Data quality score accurately reflects available data

## 🎯 Expected Outcome

After Phase 1 completion:

1. ✅ **Users can see exactly which documents informed each strategy**
2. ✅ **Clear confidence indicators show reliability of recommendations**
3. ✅ **Data-driven strategies are visually distinguished from generic ones**
4. ✅ **Source panel provides full transparency into data sources**
5. ✅ **Foundation ready for Monthly Planner and Campaign Generator integration**

## 📝 Next Steps (Post-Phase 1)

Once this phase is complete:

1. **Phase 2**: Integrate citations into Monthly Planner
2. **Phase 3**: Integrate citations into Tactical Campaign Generator
3. **Phase 4**: Add hallucination detection and verification
4. **Phase 5**: Testing with real 111 BMW documents

---

## 🚀 Implementation Order

**Day 1: Foundation (Tasks 1-5)**
1. Create type definitions
2. Build citation tracker
3. Build confidence scorer
4. Enhance vector search
5. Enhance context builder

**Day 2: UI Components (Tasks 6-10)**
6. CitationBadge component
7. SourcePanel component
8. DataQualityBadge component
9. ConfidenceScore component
10. SourceCard component

**Day 3: Integration (Tasks 11-15)**
11. Update strategy generator
12. Update strategy API
13. Update strategy UI
14. Database updates (if needed)
15. Helper utilities and testing

---

## ✅ Approval Required

Please review this plan and confirm:

1. Do you approve the overall approach?
2. Any changes to the citation structure or UI components?
3. Should we persist citations to database or return dynamically?
4. Any additional requirements for citation display?
5. Priority: Should we do all 15 tasks or start with core functionality (1-13)?

**Once approved, I'll proceed with implementation using the TodoWrite tool to track progress!**
