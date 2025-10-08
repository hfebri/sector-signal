# Midgar Social Media AI Agent - MVP Scope

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