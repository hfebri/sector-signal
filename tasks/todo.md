# sector signal Social Media AI Agent - MVP Scope

## Project Overview

Building a comprehensive social media AI agent that helps brands create annual strategies, monthly plans, and tactical campaigns based on competitor analysis, brand guidelines, target audience, and market conditions.

## MVP Core Features

### 1. Data Input & Analysis Layer

- [x] **Brand Profile Setup**

  - [x] Brand guidelines input interface
  - [x] Target audience definition
  - [x] Competitor identification and tracking
  - [x] Market category selection
  - [ ] Social media performance baseline import

- [x] **Market Intelligence System (RivalIQ Integration)**
  - [x] RivalIQ API setup and authentication
  - [x] Competitor landscape analysis via RivalIQ
  - [x] Content performance benchmarking
  - [ ] Trending topics detection through RivalIQ insights
  - [x] Social media listening and engagement metrics
  - [ ] Market event/holiday calendar integration

### 2. Annual Strategy Generator

- [x] **Strategic Framework**

  - [x] AI-powered SWOT analysis based on input data
  - [x] Annual goal setting recommendations
  - [x] Brand positioning strategy
  - [x] Content pillar identification (3-5 main themes)

- [x] **Content Playbook Creation**

  - [x] Tone and mood guidelines generator
  - [x] Content format recommendations
  - [x] Visual style suggestions
  - [x] Messaging framework

- [ ] **Always-On Calendar**

  - [ ] 12-month content calendar template
  - [ ] Seasonal content recommendations
  - [ ] Key date/event integration
  - [ ] Content frequency planning

- [x] **KPI Framework**
  - [x] Goal-based KPI recommendations
  - [x] Benchmarking against competitors via RivalIQ data
  - [x] Success metrics definition using industry standards
  - [ ] Competitive performance tracking and alerts

### 3. Monthly Strategy Breakdown

- [x] **Monthly Planning Engine**

  - [x] Monthly theme generation from annual strategy
  - [x] Content quota allocation (e.g., 20 posts/month)
  - [x] Platform-specific content distribution

- [x] **Editorial Calendar**

  - [x] Detailed content calendar with dates
  - [x] Content type mix optimization
  - [x] Posting schedule recommendations

- [x] **Content Specifications**
  - [x] Individual post concept generation
  - [x] Caption/copy suggestions
  - [x] Hashtag recommendations
  - [x] Visual content briefs

### 4. Performance Tracking & Reporting

- [ ] **Analytics Dashboard**

  - [ ] RivalIQ performance metrics visualization
  - [ ] Goal vs. actual tracking with competitive benchmarks
  - [ ] Engagement trend analysis and competitive comparison
  - [ ] Content performance scoring against industry standards

- [ ] **Learning System**
  - [ ] Performance pattern recognition
  - [ ] Content optimization recommendations
  - [ ] Strategy refinement suggestions

### 5. Tactical Campaign Generator

- [x] **Market Opportunity Detection**

  - [x] Real-time trend monitoring via RivalIQ
  - [x] Event/news opportunity identification
  - [x] Competitor gap analysis using RivalIQ insights
  - [x] Content type and timing opportunity detection

- [x] **Campaign Recommendations**
  - [x] Trending topic integration strategies based on competitive analysis
  - [x] Campaign concept generation using successful competitor patterns
  - [x] Content asset recommendations with performance predictions
  - [x] Timeline and execution planning with competitive timing insights

## Technical Implementation Plan

### Phase 1: Foundation (Weeks 1-2)

- [x] Set up Next.js project structure with shadcn/ui
- [x] Create basic UI layout and navigation
- [x] Implement brand profile setup flow
- [x] Create database schema for brand data

### Phase 2: AI Integration with Replicate (Weeks 3-4)

- [x] Set up Replicate.com integration with GPT-5-nano for development
- [x] Install and configure Replicate SDK (`npx create-replicate --model=openai/gpt-5-structured`)
- [x] Build prompt engineering system for different AI outputs
- [x] Create annual strategy generation workflow using GPT-5-nano
- [ ] Implement basic content calendar generation with structured outputs
- [x] Set up environment variables for REPLICATE_API_TOKEN

### Phase 3: Monthly Planning (Weeks 5-6)

- [x] Build monthly breakdown engine
- [x] Create editorial calendar interface
- [x] Implement content detail generation
- [x] Add calendar visualization components

### Phase 4: RivalIQ Integration & Market Intelligence (Weeks 7-8)

- [x] Integrate RivalIQ API for social media data
- [x] Build competitor tracking system using RivalIQ insights
- [x] Implement content performance analysis from RivalIQ
- [ ] Create market opportunity alerts based on competitive gaps
- [ ] Build data synchronization and caching layer for RivalIQ data

### Phase 5: Reporting & Optimization (Weeks 9-10)

- [ ] Build analytics dashboard
- [ ] Implement performance tracking
- [ ] Create learning and recommendation engine
- [ ] Add strategy refinement capabilities

## User Experience Flow

### Onboarding

1. [x] Brand setup wizard
2. [x] Competitor identification
3. [x] Goal setting interface
4. [x] Initial data collection

### Main Workflow

1. [x] Dashboard with strategy overview
2. [x] Annual strategy generation
3. [x] Monthly planning interface
4. [x] Content creation tools
5. [ ] Performance monitoring
6. [x] Tactical campaign alerts

## Key Components to Build

### UI Components

- [x] Brand profile forms
- [x] Strategy visualization dashboard
- [x] Calendar components (annual/monthly views)
- [x] Content creation interfaces
- [ ] Analytics charts and graphs
- [x] Campaign recommendation cards

### AI Processing Modules (Replicate + GPT-5)

- [x] Strategy generation engine using GPT-5-nano via Replicate
- [x] Content ideation system with structured JSON schemas
- [x] Market analysis processor with web search capabilities
- [ ] Performance optimization advisor using GPT-5 reasoning
- [x] Trend detection algorithm with configurable reasoning effort

### Data Management

- [x] Brand profile database
- [x] Content calendar storage
- [ ] Performance metrics tracking
- [x] RivalIQ data integration and caching system
- [x] Competitive intelligence data warehouse
- [x] Template and playbook storage

## Success Metrics for MVP

- [ ] Complete annual strategy generation in under 10 minutes
- [ ] 12-month content calendar with 80% relevant suggestions
- [ ] Monthly plans generated within 5 minutes
- [ ] 90% user satisfaction with content relevance
- [ ] Successful integration with RivalIQ API for comprehensive social media data

## Out of Scope for MVP

- Advanced video content generation
- Multi-language support
- Advanced A/B testing features
- Enterprise team collaboration features
- Advanced competitor intelligence beyond basic tracking
- Automated posting capabilities
- Advanced visual content creation tools

## Technical Considerations

- Responsive design for desktop and mobile
- Secure API key management for RivalIQ and Replicate integrations
- Scalable database design for growing user base and competitive data
- Rate limiting for Replicate API calls and RivalIQ API requests
- Data privacy and security compliance
- Export capabilities for generated strategies and calendars
- Efficient data caching strategy for RivalIQ API responses
- Real-time data synchronization with competitive intelligence updates
- Structured JSON schema design for GPT-5 outputs
- Error handling for Replicate API calls and model responses
- Environment-based model switching (GPT-5-nano for dev, GPT-5 for production)

## Next Steps

1. Review and refine this scope based on feedback
2. Create detailed technical specifications
3. Set up development environment
4. Begin Phase 1 implementation
5. Establish testing and feedback loops

## Development Progress Review

### ✅ Completed Phase 1 Foundation Tasks:

- **Project Setup**: Next.js 15 with App Router, TypeScript, Tailwind CSS v4
- **shadcn/ui Integration**: Configured with "new-york" style, slate base color, CSS variables
- **UI Layout**: Created responsive sidebar navigation, header with search, and main content area
- **Navigation System**: Implemented using shadcn Button components with active state management
- **Brand Profile Setup**: Complete form with validation using react-hook-form and zod
- **Database Schema**: Comprehensive TypeScript interfaces for all data models
- **File-based Storage**: Development storage system using JSON files (ready for DB migration)
- **API Routes**: RESTful endpoints for brand profile CRUD operations
- **Development Server**: Running successfully on http://localhost:3001

### 🎯 Key Features Implemented:

1. **Dashboard Layout**: Clean, professional interface with metric cards and getting started guide
2. **Brand Profile Form**: Comprehensive form capturing brand info, industry, audience, competitors, goals
3. **Data Architecture**: Well-structured schema covering all MVP requirements
4. **Storage Layer**: Abstracted storage with easy database migration path
5. **API Integration**: Working endpoints ready for frontend integration

### 🚀 Ready for Next Phase:

- **Replicate AI Integration**: Environment ready for GPT-5-nano implementation
- **RivalIQ Integration**: Schema and data models prepared for competitive intelligence
- **UI Components**: Foundation established using shadcn/ui best practices
- **Type Safety**: Full TypeScript implementation throughout

### 📋 Immediate Next Steps:

1. Set up Replicate API integration for AI strategy generation
2. Implement RivalIQ API for competitor analysis
3. Create annual strategy generation workflow
4. Build monthly planning interface
5. Add tactical campaign detection and recommendations

The foundation is solid and ready for rapid feature development! 🎉

---

## ✅ Phase 1.5 Complete - Brand-Centric Architecture Implemented!

### 🔄 Major Redesign Completed:

- **Brand Context System**: React context for managing current brand and brand switching
- **Brand Selector**: Searchable dropdown in sidebar for easy brand switching with localStorage persistence
- **Onboarding Flow**: New users see welcome screen → create first brand → dashboard
- **Conditional Rendering**: Dashboard adapts based on whether user has brands configured
- **Brand-Aware Navigation**: All pages now operate in context of selected brand

### 🏗️ Database Architecture Decision:

- **Development**: File-based storage with JSON files (fast iteration, easy debugging)
- **Production**: Ready to migrate to PostgreSQL/Supabase when needed
- **Abstracted Storage**: Clean interfaces make database migration straightforward

### 🎯 Key UX Improvements:

1. **First-Time User Experience**: Clear onboarding with "Create Your First Brand" CTA
2. **Multi-Brand Support**: Users can create and switch between multiple brands seamlessly
3. **Brand-Specific Dashboards**: Each brand shows relevant metrics and next steps
4. **Persistent Selection**: Brand choice remembered across sessions
5. **Settings Integration**: Brand profile editing pre-filled with current brand data

### 🚀 User Flow Now Working:

1. **New User**: Welcome screen → Create brand → Dashboard with brand-specific data
2. **Existing User**: Dashboard shows current brand → Can switch brands via selector
3. **Multi-Brand User**: Easy switching between brands with persistent selection
4. **Brand Management**: Create new brands, edit existing ones, view brand-specific insights

### 📋 Ready for AI Integration:

- Brand context available throughout app for personalized AI responses
- Clean API structure for passing brand data to AI services
- User experience polished for strategy generation workflows
- Database schema supports all planned AI features

**Status**: Foundation complete, onboarding perfected, ready for AI features! 🚀

---

## ✅ Phase 2 Complete - AI Integration & Competitive Intelligence!

### 🤖 Replicate API Integration (GPT-5):

- **Replicate SDK**: Installed and configured with environment variables
- **Smart Model Switching**: Auto-selects gpt-5-nano for dev, gpt-5 for production
- **Structured Outputs**: JSON schema validation for consistent AI responses
- **Configuration Options**: Reasoning effort, web search, verbosity controls
- **Helper Functions**: `runStructuredPrompt()` for easy AI calls

### 📊 Annual Strategy Generation:

- **JSON Schemas**: Comprehensive schemas for strategy, monthly plans, campaigns
- **Strategy Generator**: AI-powered annual strategy with:
  - SWOT Analysis (strengths, weaknesses, opportunities, threats)
  - Brand Positioning (statement, differentiators, audience insights)
  - Content Pillars (3-5 themes with objectives and frequency)
  - Annual Goals (measurable targets with timelines)
  - Content Playbook (tone, voice, messaging, visual guidelines)
  - KPI Framework (metrics with industry benchmarks)
- **API Endpoint**: `/api/strategy/generate` - POST with brandId
- **Strategy UI**: Full-featured page with tabbed interface for all sections

### 🏆 RivalIQ Competitive Intelligence:

- **RivalIQ Client**: Complete TypeScript client (`lib/rivaliq.ts`)
- **Authentication**: x-api-key header with base URL `https://api.rivaliq.com/v3`
- **Core Functions**:
  - `getLandscapes()` - List competitor landscapes
  - `getLandscape(id)` - Get specific landscape
  - `getCompanies()` - Companies in landscape
  - `getCompanyPosts()` - Posts with date/network filters
  - `getCompanyMetrics()` - Engagement metrics
  - `getCompetitiveAnalysis()` - Full analysis with insights
  - `analyzeCompetitorContent()` - Content performance analysis
- **API Endpoints**:
  - `/api/competitors/landscapes` - GET landscapes
  - `/api/competitors/analysis` - GET/POST competitive analysis
  - `/api/competitors/content` - POST content analysis

### 📁 Files Created:

- `lib/replicate.ts` - Replicate client and helpers
- `lib/rivaliq.ts` - RivalIQ API client with TypeScript types
- `lib/ai/schemas.ts` - JSON schemas for AI outputs
- `lib/ai/strategy-generator.ts` - Strategy generation engine
- `app/api/strategy/generate/route.ts` - Strategy API
- `app/api/competitors/landscapes/route.ts` - Landscapes API
- `app/api/competitors/analysis/route.ts` - Analysis API
- `app/api/competitors/content/route.ts` - Content API
- `app/strategy/page.tsx` - Strategy UI with tabs
- `.env.local` - Environment variables (API keys configured)
- `.env.example` - Template for other developers

### 🎯 Features Ready:

1. **AI Strategy Generation**: Generate comprehensive annual strategies with web research
2. **Competitive Intelligence**: Access RivalIQ data for competitor insights
3. **Content Analysis**: Analyze competitor content performance and patterns
4. **Industry Benchmarks**: Get metrics and benchmarks from RivalIQ
5. **Strategy Visualization**: Tabbed UI for positioning, SWOT, pillars, goals, playbook, KPIs

### 📋 Next Phase Tasks:

- [ ] Build monthly planning interface and editorial calendar
- [ ] Create tactical campaign detection and recommendations
- [ ] Integrate RivalIQ data into strategy generation
- [ ] Add performance tracking dashboard
- [ ] Implement learning and optimization system

**Status**: AI integration complete! Strategy generation and competitive intelligence fully operational! 🚀

---

## ✅ Phase 3 Complete - Monthly Planning & Editorial Calendar!

### 📅 Monthly Content Planning:

- **Monthly Planner Engine**: AI-powered monthly content plan generation
- **Flexible Generation**: Single month or full 12-month calendar generation
- **Content Calendar**: Detailed post-by-post planning with all specifications
- **Key Dates Integration**: Automatic holiday and event opportunity detection

### 🎯 Features Implemented:

- **Monthly Theme Generation**: AI selects themes based on annual strategy and seasonal relevance
- **Content Distribution**: Intelligent allocation across content pillars and platforms
- **Post Specifications**: Complete details for each post:
  - Date, platform, content type
  - Topic and caption
  - Hashtags (5-10 per post)
  - Visual briefs
  - Content pillar alignment
- **Configurable Posts**: Adjustable posts per month (default: 20)
- **Multi-Month Support**: Generate up to 12 months at once
- **Navigation**: Easy month-to-month navigation for multi-month plans

### 🎨 UI Features:

- **Calendar View**: Grid layout showing posts by date
- **List View**: Detailed view with full captions and visual briefs
- **Key Dates Section**: Highlights important dates and opportunities
- **Month Navigation**: Previous/next controls for multi-month plans
- **Strategy Integration**: Loads annual strategy from localStorage
- **Regeneration**: Easy regeneration of plans with different parameters

### 📁 Files Created:

- `lib/ai/monthly-planner.ts` - Monthly plan generation engine
- `app/api/monthly-plan/generate/route.ts` - Monthly plan API endpoint
- `app/monthly-plan/page.tsx` - Monthly planning UI with calendar and list views

### 🔗 Integration:

- Strategy page now saves to localStorage for monthly planning
- Monthly planner requires annual strategy before generating plans
- Full integration with brand context and profile data

### 📋 Next Steps:

- [ ] Create tactical campaign detection and recommendations
- [ ] Build performance tracking dashboard
- [ ] Implement learning and optimization system
- [ ] Add analytics and reporting features

**Status**: Monthly planning complete! Full editorial calendar generation with 12-month support! 📅

---

## ✅ Phase 4 Complete - Tactical Campaign Generator!

### ⚡ Campaign Generation:

- **Opportunity Detection**: AI-powered market opportunity identification with web search
- **Campaign Concepts**: Strategic campaign recommendations aligned with brand strategy
- **Content Assets**: Platform-specific content recommendations with CTAs
- **Timeline Planning**: Phased execution plans with actionable steps
- **Outcome Predictions**: Expected results and KPIs

### 🎯 Features Implemented:

- **Market Opportunity Types**:
  - Real-time trend monitoring
  - Event/news opportunities
  - Competitor gap analysis
  - Seasonal opportunities
  - Audience need detection
- **Campaign Components**:
  - Campaign name and objective
  - Strategy and target audience
  - 5-8 content assets across platforms
  - Multi-phase timeline (prep, launch, amplify, wrap-up)
  - Expected outcomes with measurable KPIs
- **Urgency & Relevance Scoring**:
  - Low/Medium/High urgency indicators
  - 0-10 relevance scoring
  - Visual urgency badges
- **Multiple Campaign Generation**: Generate 1-5 campaign ideas at once
- **Competitor Integration**: Optional competitor data for gap analysis

### 🎨 UI Features:

- **Campaign Cards**: Rich campaign display with gradient headers
- **Tabbed Interface**: Organized views for:
  - Opportunity details
  - Campaign strategy
  - Content assets
  - Timeline phases
  - Expected outcomes
- **Urgency Indicators**: Color-coded badges for urgency levels
- **Relevance Scores**: Visual relevance scoring (0-10)
- **Multi-Campaign View**: Display multiple campaign ideas
- **Regeneration**: Easy generation of more campaign ideas

### 📁 Files Created:

- `lib/ai/campaign-generator.ts` - Campaign generation engine with trend detection
- `app/api/campaigns/generate/route.ts` - Campaign API endpoint
- `app/campaigns/page.tsx` - Campaign UI with tabbed interface

### 🔗 Integration:

- Loads annual strategy from localStorage
- Integrates with RivalIQ for competitor analysis
- Web search for real-time trend detection
- Aligned with brand strategy and content pillars

### 📋 Remaining Tasks:

- [ ] Performance tracking dashboard
- [ ] Analytics and reporting
- [ ] Learning and optimization system
- [ ] Social media baseline import
- [ ] Competitive performance tracking alerts

**Status**: Tactical campaign generation complete! AI-powered opportunity detection and campaign recommendations! ⚡

---

## ✅ RivalIQ Landscape Integration Complete!

### 🔗 Brand-Landscape Linking:

- **Schema Update**: Added `rivaliqLandscapeId` field to BrandProfile
- **API Endpoint**: Created `/api/rivaliq/landscapes` for landscape access
- **Auto-Population**: Competitors automatically populated from selected landscape
- **Brand Creation**: Integrated landscape selector in brand setup form

### 🎯 Features Implemented:

- **Landscape Dropdown**: RivalIQ landscapes loaded into brand creation form
- **Dynamic Loading**: Landscapes fetched on page load with loading state
- **Auto-Fill Competitors**: Selecting a landscape auto-populates competitor list
- **Editable Competitors**: Users can modify the auto-populated competitor list
- **Optional Integration**: Landscape selection is optional, can proceed without it

### 📁 Files Modified/Created:

- `lib/db/schema.ts` - Added rivaliqLandscapeId to BrandProfile
- `app/api/rivaliq/landscapes/route.ts` - New endpoint for landscape data
- `app/brand/create/page.tsx` - Integrated landscape selector with auto-population

### 🔗 Integration Flow:

1. User opens brand creation form
2. RivalIQ landscapes load automatically
3. User selects landscape (optional)
4. Competitors auto-populate from landscape companies
5. User can edit or add additional competitors
6. Brand saved with landscape ID for future competitor tracking

**Status**: RivalIQ landscape integration complete! Brands can now link to competitor landscapes! 🔗

---

## ✅ RivalIQ-Only Brand System Complete!

### 🔄 Major System Redesign:

- **Removed Brand Creation**: Users can no longer create custom brands
- **RivalIQ Landscapes as Brands**: System now uses RivalIQ landscapes exclusively
- **Auto-Loading**: Landscapes automatically load from RivalIQ on app start
- **Simplified Workflow**: No manual brand setup required

### 🎯 Changes Implemented:

- **Brand Selector**:
  - Removed "Create new brand" option
  - Changed to "Select landscape" terminology
  - Added "Refresh landscapes" to reload from RivalIQ
  - Loading state for refresh action
- **Brand Context**:
  - Now loads landscapes from RivalIQ API instead of local storage
  - Converts landscapes to brand format automatically
  - Maintains same brand interface for compatibility
- **Dashboard**:
  - Updated welcome message for landscape selection
  - Removed brand creation CTA
- **Removed Files**:
  - `/app/brand/create/` - Brand creation page
  - `/app/api/brand-profile/` - Brand CRUD API endpoints

### 📋 New User Flow:

1. User opens app
2. RivalIQ landscapes load automatically
3. User selects landscape from brand selector
4. System treats landscape as brand for all features
5. Can refresh landscapes to get latest from RivalIQ

### 🔗 Benefits:

- **Single Source of Truth**: All brand/competitor data comes from RivalIQ
- **Always Up-to-Date**: Can refresh landscapes to get latest data
- **Simplified Setup**: No manual data entry required
- **Better Integration**: Tight coupling with RivalIQ competitive intelligence

**Status**: RivalIQ-only brand system complete! All brands now sourced from RivalIQ landscapes! 🎯

---

## ✅ Clean Brand-Only Interface Complete!

### 🎨 UI Terminology Update:

- **Removed all "RivalIQ" mentions** from user-facing UI
- **Changed "landscape" to "brand"** throughout the app
- **Simplified messaging** - no technical terms exposed to users

### 🔄 API Restructure:

- **New endpoint**: `/api/brands` - fetches from `https://api.rivaliq.com/v3/landscapes`
- **Direct API call**: No intermediate endpoints, direct fetch from source
- **Automatic conversion**: Landscapes converted to brand format server-side
- **Clean interface**: Users only see "brands", not landscapes

### 📝 Changes Made:

- **Brand Selector**: "Select brand" (was "Select landscape")
- **Dashboard**: "Select a brand from the sidebar" (no RivalIQ mention)
- **Refresh button**: "Refresh brands" (was "Refresh landscapes")
- **Search**: "Search brands" (was "Search landscape")
- **API**: New `/api/brands` route fetching directly from RivalIQ v3 API

### 🎯 User Experience:

- Users never see "RivalIQ" or "landscape" terminology
- System simply shows available brands to manage
- Backend integration completely transparent
- Professional, clean brand management interface

**Status**: Clean brand interface complete! RivalIQ integration completely hidden from users! ✨

---

## 🧠 RAG System Implementation Plan

### 📋 Overview

Implement Retrieval Augmented Generation (RAG) to provide AI with actual brand performance data instead of generic recommendations. This allows the system to generate strategies based on real metrics from uploaded documents.

### ✅ Phase 1: Foundation Setup (COMPLETED)

#### 1.1 Database Schema ✅

- [x] Created `brands` table with brand profile data
- [x] Created `brand_documents` table for file metadata tracking
- [x] Created `document_chunks` table with vector embeddings
- [x] Configured pgvector extension for 1536-dimensional OpenAI embeddings
- [x] Set up foreign key relationships with cascade delete

**Files:**

- `lib/db/drizzle-schema.ts` - Complete schema with vector support
- `drizzle/0000_yummy_doctor_spectrum.sql` - Initial migration
- `drizzle/0001_flawless_tyrannus.sql` - Vector dimension update (768→1536)

#### 1.2 Dependencies Installation ✅

- [x] Installed `@langchain/openai` for OpenAI embeddings
- [x] Installed `@langchain/community` for Supabase vector store
- [x] Installed `langchain` for document processing
- [x] Installed file parsers: `pdf-parse`, `xlsx`, `mammoth`
- [x] Installed `openai` SDK

**Package.json additions:**

```json
{
  "@langchain/community": "^0.3.57",
  "@langchain/openai": "^0.6.14",
  "langchain": "^0.3.35",
  "openai": "^6.1.0",
  "xlsx": "^0.18.5"
}
```

#### 1.3 Embedding Configuration ✅

- [x] Configured OpenAI `text-embedding-3-small` (1536 dimensions)
- [x] Tested embedding generation successfully (~1.5s, $0.00002 per 1K tokens)
- [x] Updated vector dimensions in database schema to 1536
- [x] Verified `OPENAI_API_KEY` is configured in `.env.local`

**Files:**

- `lib/ai/embeddings.ts` - Embedding model configuration

#### 1.4 Supabase Setup ✅

- [x] Enabled pgvector extension in Supabase dashboard
- [x] Generated migration SQL for vector tables
- [x] Created vector index configuration script

**Manual Setup Required:**

- Run `update-vector-dimension.sql` in Supabase SQL Editor to create tables with vector index

---

### 🚀 Phase 2: Document Processing Pipeline (NEXT)

#### 2.1 Document Upload System

- [ ] Create file upload UI component

  - File dropzone with drag & drop support
  - File type validation (PDF, CSV, XLSX, DOCX, TXT)
  - File size limits (max 10MB per file)
  - Multiple file upload support
  - Upload progress indicators

- [ ] Create Supabase Storage bucket

  - Bucket name: `brand-documents`
  - Configure access policies (brand-specific)
  - Set up file path structure: `{brandId}/{category}/{filename}`

- [ ] Build upload API endpoint
  - Route: `POST /api/documents/upload`
  - Accept files via multipart/form-data
  - Upload to Supabase Storage
  - Create metadata record in `brand_documents` table
  - Return upload status and document ID

**Files to Create:**

- `app/api/documents/upload/route.ts`
- `components/documents/DocumentUpload.tsx`
- `components/documents/FileDropzone.tsx`

**Implementation Steps:**

1. Create Supabase Storage bucket via dashboard
2. Build FileDropzone component with react-dropzone
3. Create upload API route with Supabase storage integration
4. Add file validation and error handling
5. Create metadata record in database with `pending` status

---

#### 2.2 Document Processing Engine ✅ (Already Built!)

**Status:** Document processor already implemented in `lib/ai/document-processor.ts`

**Features:**

- ✅ Multi-format support (PDF, CSV, XLSX, DOCX, TXT)
- ✅ RecursiveCharacterTextSplitter (1000 tokens, 200 overlap)
- ✅ OpenAI embedding generation
- ✅ Supabase vector storage
- ✅ Processing status tracking
- ✅ Batch processing support

**Functions Available:**

- `processDocument(documentId)` - Process single document
- `processBatchDocuments(documentIds)` - Process multiple documents
- `processAllBrandDocuments(brandId)` - Process all pending docs for a brand

---

#### 2.3 Processing API Endpoint

- [ ] Create document processing trigger endpoint

  - Route: `POST /api/documents/process`
  - Input: `{ documentId: string }` or `{ brandId: string }` for batch
  - Trigger document processor
  - Return processing status

- [ ] Create processing status endpoint
  - Route: `GET /api/documents/status/:documentId`
  - Return current processing status and chunk count

**Files to Create:**

- `app/api/documents/process/route.ts`
- `app/api/documents/status/[documentId]/route.ts`

**Implementation Steps:**

1. Create POST endpoint that calls `processDocument()`
2. Add background job support (optional: use worker threads)
3. Create status endpoint for real-time progress
4. Add error handling and retry logic

---

#### 2.4 Document Management UI

- [ ] Create documents list page

  - Route: `/app/documents/page.tsx`
  - Display all documents for current brand
  - Show processing status (pending/processing/completed/failed)
  - File metadata (name, type, size, upload date)
  - Chunk count for processed documents
  - Delete functionality

- [ ] Add document management to dashboard
  - Quick view of document count
  - Processing status summary
  - Link to full documents page

**Files to Create:**

- `app/documents/page.tsx`
- `components/documents/DocumentList.tsx`
- `components/documents/DocumentStatusBadge.tsx`
- `components/documents/DocumentActions.tsx`

**UI Features:**

- Table view with sortable columns
- Status badges with color coding
- Process/reprocess buttons
- Delete confirmation dialogs
- Upload new document button

---

### 🔍 Phase 3: Vector Search Integration

#### 3.1 Search Infrastructure ✅ (Already Built!)

**Status:** Vector search already implemented in `lib/ai/vector-search.ts`

**Features:**

- ✅ Semantic similarity search
- ✅ Metadata filtering (platform, category, period)
- ✅ Pre-built search functions:
  - `searchBrandDocuments()` - Generic search with filters
  - `searchPerformanceData()` - Find performance metrics
  - `searchContentInsights()` - Best performing content
  - `searchAudienceInsights()` - Demographics and behavior
  - `searchTrendingTopics()` - Trends and opportunities
  - `searchCompetitiveInsights()` - Competitor analysis
  - `getBrandContext()` - Comprehensive context builder

---

#### 3.2 Context Builder ✅ (Already Built!)

**Status:** Context formatting already implemented in `lib/ai/context-builder.ts`

**Features:**

- ✅ Format search results for AI prompts
- ✅ Group by platform/category
- ✅ Extract key metrics automatically
- ✅ Build specialized contexts:
  - `buildRAGContext()` - General formatted context
  - `buildPerformanceContext()` - Performance metrics
  - `buildContentContext()` - Content insights
  - `buildAudienceContext()` - Audience data
  - `buildStrategyContext()` - Comprehensive strategy context
- ✅ Token limit handling with truncation

---

#### 3.3 Search API Endpoints

- [ ] Create search endpoint for debugging
  - Route: `POST /api/documents/search`
  - Input: `{ brandId, query, filters?, limit? }`
  - Return search results with scores
  - Useful for testing and debugging RAG

**Files to Create:**

- `app/api/documents/search/route.ts`

---

### 🎯 Phase 4: RAG Integration into AI Generators

#### 4.1 Strategy Generator with RAG

- [ ] Update `lib/ai/strategy-generator.ts`
  - Add document check before generation
  - Retrieve brand performance data via `getBrandContext()`
  - Inject context into strategy prompt
  - Update prompt to emphasize using actual data
  - Add fallback message if no documents uploaded

**Implementation:**

```typescript
// Before generating strategy
const hasDocuments = await checkBrandHasDocuments(brandId);

let ragContext = "";
if (hasDocuments) {
  const [performance, content, audience] = await Promise.all([
    searchPerformanceData(brandId),
    searchContentInsights(brandId),
    searchAudienceInsights(brandId),
  ]);

  ragContext = buildStrategyContext({ performance, content, audience });
}

const prompt = `Generate annual strategy for ${brand.name}.

${ragContext}

${
  ragContext
    ? "IMPORTANT: Base your strategy on the ACTUAL BRAND DATA above, not generic assumptions."
    : "Note: No performance data uploaded yet. Base strategy on brand profile and industry best practices."
}

Brand Profile:
- Industry: ${brand.industry}
- Target Audience: ${brand.targetAudience}
...`;
```

**Files to Update:**

- `lib/ai/strategy-generator.ts`
- `app/api/strategy/generate/route.ts`

---

#### 4.2 Monthly Planner with RAG

- [ ] Update `lib/ai/monthly-planner.ts`
  - Retrieve top performing content types via `searchContentInsights()`
  - Get audience engagement patterns
  - Use actual posting schedules from historical data
  - Recommend content types based on past performance

**Context to Add:**

- Best performing content types per platform
- Optimal posting times from historical data
- Top engaging topics from past months
- Content formats with highest ROI

**Files to Update:**

- `lib/ai/monthly-planner.ts`
- `app/api/monthly-plan/generate/route.ts`

---

#### 4.3 Campaign Generator with RAG

- [ ] Update `lib/ai/campaign-generator.ts`
  - Search for successful past campaigns
  - Analyze competitor performance via RivalIQ + uploaded reports
  - Identify content gaps vs. competitors
  - Recommend campaigns based on proven tactics

**Context to Add:**

- Successful campaign patterns from history
- Competitor campaign analysis
- Content performance by campaign type
- ROI data from past tactical campaigns

**Files to Update:**

- `lib/ai/campaign-generator.ts`
- `app/api/campaigns/generate/route.ts`

---

### 📊 Phase 5: UI/UX Enhancements

#### 5.1 Document Upload Flow

- [ ] Add "Upload Documents" section to dashboard

  - Prominent CTA if no documents uploaded
  - Show document count and processing status
  - Quick upload button

- [ ] Create onboarding tooltip system
  - Guide users to upload documents after brand selection
  - Explain RAG benefits (data-driven vs. generic)
  - Show before/after examples

**Files to Create:**

- `components/onboarding/RAGTooltip.tsx`
- `components/dashboard/DocumentsQuickView.tsx`

---

#### 5.2 Data-Driven Indicators

- [ ] Add badges to show when strategies use actual data

  - "✓ Based on your data" badge
  - "ⓘ Generic recommendation (upload data for personalized insights)" badge

- [ ] Create data quality indicators
  - Show which AI features have data backing
  - Indicate coverage (e.g., "Instagram: 3 months, Facebook: 1 month")

**Files to Create:**

- `components/ui/DataBadge.tsx`
- `components/ui/DataCoverageIndicator.tsx`

---

#### 5.3 Sample Data Helper

- [ ] Create sample BMW document upload helper
  - Pre-load 90+ BMW sample files
  - One-click import for demo purposes
  - Show example of fully RAG-powered insights

**Files to Create:**

- `app/api/documents/import-sample/route.ts`
- `lib/sample-data/bmw-importer.ts`

---

### 🧪 Phase 6: Testing & Validation

#### 6.1 RAG Quality Testing

- [ ] Create test suite for document processing

  - Test each file format (PDF, CSV, XLSX, etc.)
  - Verify chunking quality
  - Check embedding generation
  - Validate vector storage

- [ ] Create test suite for search quality
  - Test semantic search accuracy
  - Verify filtering works correctly
  - Check relevance scores
  - Test edge cases (no results, partial matches)

**Files to Create:**

- `__tests__/rag/document-processor.test.ts`
- `__tests__/rag/vector-search.test.ts`

---

#### 6.2 End-to-End RAG Flow Test

- [ ] Test complete RAG pipeline
  1. Upload document → Verify storage
  2. Process document → Check chunking
  3. Generate embeddings → Verify vector storage
  4. Search documents → Validate results
  5. Generate strategy → Confirm RAG context injection
  6. Verify output quality with actual data

**Test Scenarios:**

- Brand with no documents (generic mode)
- Brand with 1 document (limited data mode)
- Brand with 10+ documents (full RAG mode)
- Multi-platform data (Instagram + Facebook + Twitter)

---

### 📚 Phase 7: Documentation

#### 7.1 Update User Documentation

- [ ] Create RAG user guide
  - What is RAG and why it matters
  - How to upload documents
  - Best practices for document organization
  - File format requirements
  - Interpreting data-driven vs. generic recommendations

**Files to Create:**

- `docs/user-guide/rag-system.md`
- `docs/user-guide/uploading-documents.md`

---

#### 7.2 Update Developer Documentation

- [ ] Document RAG architecture
  - System design overview
  - Data flow diagrams
  - API documentation
  - Vector search best practices
  - Extending RAG functionality

**Files to Create:**

- `docs/architecture/rag-system.md`
- `docs/api/documents-api.md`

---

### 🎯 Success Metrics

- [ ] **Document Processing**: Successfully process 90+ BMW files in < 5 minutes
- [ ] **Search Quality**: Relevant results with >0.7 similarity score
- [ ] **Strategy Quality**: Strategies include specific metrics from uploaded data
- [ ] **User Adoption**: 80% of brands have at least 1 document uploaded
- [ ] **Performance**: Vector search completes in < 500ms

---

### 🔧 Technical Considerations

#### Database

- **pgvector Index**: IVFFlat index for fast similarity search (created in migration)
- **Chunk Size**: 1000 tokens with 200 overlap (optimal for semantic search)
- **Vector Dimensions**: 1536 (OpenAI text-embedding-3-small)

#### Performance

- **Batch Processing**: Process multiple documents in parallel
- **Caching**: Cache frequently searched contexts (Redis future enhancement)
- **Rate Limiting**: Respect OpenAI API rate limits (3000 RPM)

#### Security

- **Storage Access**: Brand-scoped file access in Supabase Storage
- **Document Privacy**: Documents only searchable within their brand
- **API Keys**: Secure storage of OpenAI and Supabase credentials

#### Cost Management

- **Embedding Cost**: ~$0.00002 per 1K tokens (very affordable)
- **Estimate**: 90 files × 10 chunks × 200 tokens = ~$0.036 total
- **Storage**: Supabase free tier covers up to 1GB

---

### 📝 Implementation Checklist

**Current Status: Phase 1 Complete ✅**

**Next Steps (Phase 2):**

1. [ ] Run `update-vector-dimension.sql` in Supabase SQL Editor
2. [ ] Create Supabase Storage bucket `brand-documents`
3. [ ] Build FileDropzone component
4. [ ] Create upload API endpoint
5. [ ] Build DocumentUpload UI component
6. [ ] Create processing API endpoint
7. [ ] Build DocumentList page
8. [ ] Test upload → process → search flow

**Estimated Time:**

- Phase 2 (Document Upload): 2-3 days
- Phase 3 (Search API): 1 day (mostly done!)
- Phase 4 (AI Integration): 2-3 days
- Phase 5 (UI/UX): 2 days
- Phase 6 (Testing): 1-2 days
- Phase 7 (Documentation): 1 day

**Total: ~10-12 days for complete RAG system**

---

**Status**: RAG Phase 1 Complete! Database schema ready, embeddings configured, processing engine built. Ready to implement document upload UI! 🧠✨

---

## 📝 Update CLAUDE.md and Commands for MCP Tool Usage

### Task Summary

Update CLAUDE.md to instruct Claude Code to:
1. Always use context7 MCP when needing help with library/framework documentation
2. Always use Supabase MCP for database-related operations
3. Update relevant command files to incorporate these best practices

### Goals

- Improve development efficiency by leveraging MCP tools for documentation lookup
- Standardize database operations using Supabase MCP
- Ensure all commands follow these best practices

### Files to Modify

1. `CLAUDE.md` - Add MCP tool usage guidelines
2. `.claude/commands/start-task.md` - Update exploration and implementation phases
3. `.claude/commands/cleanup-code.md` - Add database validation step

### Detailed Todo Items

- [x] Update CLAUDE.md with context7 MCP section
  - Add section under "Development Setup" or "Code Conventions"
  - Document when and how to use context7 for documentation lookup
  - Provide examples of context7 usage

- [x] Update CLAUDE.md with Supabase MCP section
  - Add section for database operations
  - Document all available Supabase MCP tools
  - Provide migration, query, and table management examples

- [x] Update start-task.md command
  - Add context7 lookup in EXPLORE phase for library documentation
  - Add Supabase MCP usage in CODE phase for database operations
  - Include examples in the instructions

- [x] Update cleanup-code.md command
  - Add database schema validation using Supabase MCP in VERIFY phase
  - Include check for proper Supabase MCP usage instead of raw SQL

- [x] Test the updated documentation by asking a hypothetical question

### Potential Risks/Considerations

- Need to ensure MCP tools are properly configured
- Documentation should be clear about when to use which MCP tool
- Should not be overly prescriptive - allow flexibility when needed

### Expected Outcome

- CLAUDE.md clearly documents MCP tool usage patterns
- Commands automatically guide Claude to use appropriate MCP tools
- More efficient development workflow with better documentation lookup
- Consistent database operations using Supabase MCP

### Review Section

**Completed:** 2025-10-22

#### Changes Made

**1. CLAUDE.md - Added comprehensive MCP Tool Usage section:**

- **Context7 MCP Documentation:**
  - Added "When to Use" guidelines for documentation lookup
  - Documented available tools: `resolve-library-id` and `get-library-docs`
  - Provided usage patterns with examples for Next.js, React, Tailwind, shadcn/ui
  - Emphasized consulting Context7 BEFORE fixing library-related issues

- **Supabase MCP Documentation:**
  - Documented all available Supabase MCP tools (project management, database schema, operations)
  - Provided clear distinction between `apply_migration` (DDL) and `execute_sql` (DML)
  - Added migration workflow with 5-step process
  - Included complete example of adding a new table with proper migration
  - Listed best practices and common mistakes to avoid

**2. .claude/commands/start-task.md - Enhanced with MCP tool integration:**

- **EXPLORE Phase (Step 4):**
  - Added Context7 MCP documentation check step
  - Ensures accurate, up-to-date library information before planning

- **CODE Phase (New Step 2):**
  - Added comprehensive MCP tool usage guidelines
  - Database operations: List all Supabase MCP tools with specific use cases
  - Library questions: Emphasized using Context7 instead of assumptions

**3. .claude/commands/cleanup-code.md - Added database validation:**

- **CLEAN UP Phase (Step 8):**
  - Added check for proper MCP tool usage in database operations

- **VERIFY Phase (Step 4):**
  - Added database validation section with Supabase MCP checks
  - Verify schema integrity with `list_tables`
  - Check migrations with `list_migrations`
  - Ensure proper MCP tool usage instead of raw SQL
  - Validate TypeScript types are up-to-date

#### Impact

- **Improved Development Workflow:** Claude will now automatically consult up-to-date documentation via Context7 instead of relying on potentially outdated knowledge
- **Better Database Management:** All database operations will use Supabase MCP for consistency, proper migration tracking, and type safety
- **Standardized Commands:** All custom commands now guide Claude to use appropriate MCP tools
- **Future-Proof:** Documentation will always be current since Context7 pulls from source

#### Next Steps

- Consider creating additional custom commands that leverage MCP tools
- Monitor usage to ensure MCP tools are being used effectively
- Update other command files if created in the future to follow these patterns

**Status:** MCP tool integration complete! CLAUDE.md and all commands updated. ✅
