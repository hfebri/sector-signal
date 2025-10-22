# Phase 1: Citation Infrastructure - Quick Summary

> **Full details**: See `tasks/phase-1-citation-infrastructure.md`

## 🎯 What We're Building

A comprehensive citation and source verification system to ensure AI-generated strategies are transparent, trustworthy, and backed by actual data.

## 📦 Deliverables

### Core System
1. **Citation Tracking** - Track which documents support each insight
2. **Confidence Scoring** - Measure reliability of recommendations (High/Medium/Low)
3. **Data Quality Metrics** - Show coverage, document count, date ranges

### UI Components (5 new components)
1. **CitationBadge** - Inline source indicators
2. **SourcePanel** - Expandable panel showing all sources
3. **DataQualityBadge** - "Data-Driven" vs "Generic" indicator
4. **ConfidenceScore** - Visual confidence display
5. **SourceCard** - Individual source display

### Enhanced Features
- Vector search returns citation metadata
- Strategy generator tracks citations by section
- Strategy UI displays data quality and sources
- API returns citations with strategies

## 📋 15 Tasks Breakdown

**Foundation (Tasks 1-5)**: Type definitions, citation tracker, confidence scorer, enhanced search
**UI Components (Tasks 6-10)**: 5 React components for citation display
**Integration (Tasks 11-15)**: Update generator, API, UI, and utilities

## 🔍 Key Features

### Before (Current)
```
Strategy generated, but users don't know:
- Which documents were used?
- Is this based on real data or generic?
- How confident should I be in this recommendation?
```

### After (Phase 1 Complete)
```
✅ "Based on your data" badge (or "Generic recommendation")
✅ Confidence: High (12 sources analyzed)
✅ Data Coverage: Instagram (6 mo), Facebook (3 mo)
✅ [View Sources] → Shows all 12 documents used
✅ Each insight links to source: "Engagement rate 4.2% [Source: Q3_analytics.csv]"
```

## 🎨 UI Mockup

```
┌─────────────────────────────────────────────────────────┐
│ Annual Strategy                    [Data-Driven ✓]      │
│ BMW • 2024-2025 • 12 documents • High Confidence        │
│                                    [Regenerate]          │
├─────────────────────────────────────────────────────────┤
│ [Positioning] [SWOT] [Pillars] [Goals] [Playbook] [KPIs]│
├─────────────────────────────────────────────────────────┤
│                                                          │
│ Your Instagram engagement averaged 4.2% in Q3 2024      │
│ [Source: Instagram_Q3_2024.csv ⓘ]                      │
│                                                          │
│ Top performing content types: Reels (8.5%), Carousels...│
│ [Source: Content_Performance.xlsx ⓘ]                   │
│                                                          │
├─────────────────────────────────────────────────────────┤
│ 📚 Sources Used (12) [Expand ▼]                         │
├─────────────────────────────────────────────────────────┤
│ When expanded:                                           │
│ ┌─ Instagram (5 files) ────────────────────────┐       │
│ │ • Instagram_Q3_2024.csv - Relevance: 94%     │       │
│ │   "Avg engagement rate: 4.2%, Reach: 245K"   │       │
│ │ • Content_Performance.xlsx - Relevance: 89%  │       │
│ └──────────────────────────────────────────────┘       │
│ ┌─ Facebook (4 files) ─────────────────────────┐       │
│ │ ...                                           │       │
│ └──────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────┘
```

## 🚫 Anti-Hallucination Strategy

1. **Prompt Instructions**: AI must cite sources for all quantitative claims
2. **Citation Validation**: Post-generation check for uncited metrics
3. **Confidence Scoring**: Low confidence if few/poor quality sources
4. **Transparent Fallback**: Clear "Data not available" messages when no data exists
5. **User Visibility**: Users see exactly what data backs each claim

## ⏱️ Timeline

- **Day 1**: Foundation (types, trackers, enhanced search)
- **Day 2**: UI Components (5 citation components)
- **Day 3**: Integration (generator, API, strategy UI)

**Total**: ~3 days for complete Phase 1

## ✅ Approval Questions

1. **Approach**: Do you approve the citation structure and UI design?
2. **Scope**: All 15 tasks or start with core (skip inline citations in MVP)?
3. **Storage**: Persist citations to database or return dynamically?
4. **Priority**: Any changes to component designs or features?

## 🎯 Success Criteria

After Phase 1:
- ✅ 100% of RAG strategies show data sources
- ✅ Clear confidence indicators (High/Medium/Low)
- ✅ Users trust recommendations due to transparency
- ✅ Foundation ready for Monthly/Campaign integration

---

**Status**: ⏳ Awaiting approval to proceed with implementation

**Next**: Once approved, use TodoWrite to track all 15 tasks and begin Day 1 implementation
