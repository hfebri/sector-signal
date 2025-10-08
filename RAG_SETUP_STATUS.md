# RAG System Setup Status

## 📖 What is RAG? (Retrieval Augmented Generation)

### Simple Explanation

RAG is like giving AI a smart filing cabinet of your documents. Instead of the AI guessing or making up information, it first searches through your actual files to find relevant data, then uses that real data to generate accurate answers.

### The Problem We're Solving

Without RAG:

- ❌ Uploading 20+ files to AI would be slow and expensive
- ❌ AI might hallucinate (make up) data about your brand
- ❌ Can't handle large volumes of documents efficiently
- ❌ Re-processing the same files repeatedly wastes time

With RAG:

- ✅ Process documents once, use them many times
- ✅ AI uses YOUR actual brand data (not made-up information)
- ✅ Fast searches through 100+ documents in milliseconds
- ✅ Only relevant portions sent to AI (saves cost & time)
- ✅ Accurate insights based on real performance metrics

### How It Works

**Step 1: Process Documents (One Time)**

- Upload your BMW Instagram/Facebook/Twitter reports
- System reads and breaks each report into small chunks
- Each chunk gets a "fingerprint" (called an embedding) that captures its meaning
- Store chunks with fingerprints in a searchable database

**Step 2: Smart Search (Every Query)**

- You ask: "Generate a social media strategy for BMW"
- System converts your question into a fingerprint
- Finds the most relevant chunks (e.g., Q1-Q2 2024 Instagram engagement data)
- Retrieves only top 5-10 most relevant chunks

**Step 3: Generate with Real Data**

- AI receives your question + relevant BMW data
- Generates strategy based on actual performance metrics
- Result: Data-driven recommendations, not guesses

### Real Example

**Without RAG:**

> AI: "For BMW, I recommend posting 3x per week on Instagram."
> (Generic advice, not based on BMW's actual data)

**With RAG:**

> AI: "Based on BMW Indonesia's Instagram performance from Q1 2024, where Reels had 3.2x higher engagement than static posts (averaging 8,500 vs 2,600 interactions), I recommend increasing Reels from 2 to 4 per week, focusing on car features and lifestyle content which showed 45% higher saves."
> (Specific advice using real BMW data)

### Business Benefits

1. **Accuracy**: Decisions based on actual brand performance, not assumptions
2. **Efficiency**: Process 90+ files once, use forever
3. **Scalability**: Add new reports monthly without performance issues
4. **Cost-Effective**: Only send relevant data to AI (not entire files)
5. **Insights**: Discover patterns across multiple months/platforms

### Technical Summary (For Developers)

RAG = Vector Embeddings + Semantic Search + LLM Generation

- **Primary**: Google EmbeddingGemma `google/embeddinggemma-300m` (768 dimensions, multilingual, free & open source)
- **Fallback**: OpenAI `text-embedding-3-small` (1536 dimensions)
- Stores in Supabase with `pgvector` extension
- Cosine similarity search for retrieval
- Context injection to GPT-5 for generation

---

## 🔗 What is LangChain and Why We Need It

### Simple Explanation

LangChain is like a Swiss Army knife for building AI applications. It provides pre-built tools and connectors that handle the complicated parts of working with documents and AI, so developers don't have to build everything from scratch.

### What LangChain Does for Us

**Without LangChain:**

- ❌ Manually write code to split documents into chunks
- ❌ Build custom code to convert chunks into embeddings
- ❌ Write integration code for Supabase vector storage
- ❌ Create custom search and retrieval logic
- ❌ Build orchestration layer to connect all components
- ❌ Handle error cases and edge scenarios manually

**With LangChain:**

- ✅ Pre-built document splitters that intelligently chunk text
- ✅ Direct integrations with OpenAI embeddings API
- ✅ Ready-made Supabase vector store connector
- ✅ Built-in retrieval chains with best practices
- ✅ Standardized patterns for RAG workflows
- ✅ Battle-tested error handling and optimizations

### Why We Chose LangChain for This Project

**1. Document Processing**

- **RecursiveCharacterTextSplitter**: Intelligently splits documents while preserving meaning
- Respects sentence boundaries (doesn't cut words mid-sentence)
- Configurable chunk size (~1000 tokens) and overlap (200 tokens)
- Handles different file types (PDF, Excel, Word, CSV) uniformly

**2. Embedding Generation**

- **OpenAIEmbeddings**: Simplified API for generating vector embeddings
- Automatic batching of requests (processes multiple chunks efficiently)
- Built-in retry logic for API failures
- Caching to avoid re-processing identical text

**3. Vector Store Integration**

- **SupabaseVectorStore**: Direct connector to Supabase with pgvector
- Handles all SQL queries for inserting/searching vectors
- Automatic index management for fast similarity search
- Built-in metadata filtering (e.g., search only Instagram posts from Q1 2024)

**4. Retrieval Chains**

- Pre-built patterns for RAG workflows
- Combines vector search + prompt construction + LLM calls
- Configurable relevance scoring
- Easy to customize for our brand strategy use case

### Real-World Benefit

**Without LangChain (estimated development time: 2-3 weeks):**

```
We'd have to manually:
1. Write document chunking logic (~3 days)
2. Build OpenAI API client with batching (~2 days)
3. Create Supabase vector storage layer (~3 days)
4. Implement similarity search (~2 days)
5. Build RAG orchestration (~3 days)
6. Test and debug edge cases (~2 days)
Total: ~15 days of development
```

**With LangChain (estimated development time: 2-3 days):**

```typescript
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { OpenAIEmbeddings } from "@langchain/openai";
import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";

// Step 1: Chunk document (30 lines of code)
const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,
  chunkOverlap: 200,
});
const chunks = await splitter.splitDocuments(docs);

// Step 2: Generate embeddings and store (15 lines of code)
await SupabaseVectorStore.fromDocuments(chunks, new OpenAIEmbeddings(), {
  client: supabaseClient,
});

// Step 3: Search (10 lines of code)
const results = await vectorStore.similaritySearch(query, 5);
Total: ~2 days of integration work
```

### Components We're Using

1. **`langchain`** - Core framework

   - Document loaders
   - Text splitters
   - Chain orchestration

2. **`@langchain/openai`** - OpenAI integrations

   - Embeddings API client
   - GPT-5 integration helpers

3. **`@langchain/community`** - Community connectors
   - Supabase vector store
   - Various file format loaders

### Business Impact

**Time Savings**: 10-12 days of development time saved
**Reliability**: Battle-tested code used by thousands of production apps
**Maintainability**: Standard patterns that any developer can understand
**Scalability**: Optimized for performance at scale (handles 1000+ documents)

### Analogy for Non-Technical Stakeholders

Imagine you're building a house:

**Without LangChain**: You'd have to manufacture your own bricks, create your own cement mix, design your own plumbing system, and invent your own electrical wiring from scratch.

**With LangChain**: You go to a well-stocked hardware store that provides pre-made, high-quality bricks, ready-mix cement, standardized pipes, and certified electrical components. You still build the house (the RAG system), but you use proven, reliable parts that fit together perfectly.

---

## ✅ Completed

1. **NPM Packages Installed**

   - `@langchain/openai` - OpenAI integrations
   - `@langchain/community` - Supabase vector store
   - `langchain` - Document processing
   - `openai` - Embeddings API
   - `pdf-parse`, `xlsx`, `mammoth` - File parsers

2. **Environment Variables Updated**

   - Added `OPENAI_API_KEY` to `.env.example`

3. **Database Schema Created**
   - Updated `brandDocuments` table with processing status fields
   - Created `documentChunks` table with pgvector support
   - Added custom vector type for 1536-dimension embeddings

## ⚠️ Required Manual Steps

### 1. Enable pgvector Extension in Supabase

**You MUST do this before running `db:push`**

1. Go to https://supabase.com/dashboard
2. Select your project
3. Click "Database" in left sidebar
4. Click "Extensions"
5. Search for "vector"
6. Click "Enable" on `vector` extension

### 2. Add HuggingFace API Key (Primary) and OpenAI API Key (Fallback)

Add to `.env.local`:

```env
# Primary embeddings (EmbeddingGemma - free & open source)
HUGGINGFACEHUB_API_KEY=hf_YOUR_KEY_HERE

# Fallback embeddings (optional - only if HuggingFace key not provided)
OPENAI_API_KEY=sk-proj-YOUR_KEY_HERE
```

**Get HuggingFace API Key (Free):**

1. Go to https://huggingface.co/settings/tokens
2. Create a new token with "Read" access
3. Copy and paste into `.env.local`

### 3. Push Database Schema

After enabling pgvector:

```bash
npm run db:push
```

This will create:

- `document_chunks` table with vector embeddings
- Processing status fields in `brand_documents`

## 📋 Next Steps (After Manual Setup)

1. Build document processor service (`/lib/ai/document-processor.ts`)
2. Create processing API endpoint (`/api/documents/process`)
3. Implement vector search (`/lib/ai/vector-search.ts`)
4. Update AI generators to use RAG context
5. Add processing UI to dashboard

## 🗄️ Database Schema

### `brand_documents` (Updated)

- Added `processing_status` (pending, processing, completed, failed)
- Added `chunk_count` (number of chunks created)
- Added `processed_at` (timestamp)

### `document_chunks` (New)

- `id` - UUID primary key
- `document_id` - References brand_documents
- `brand_id` - References brands
- `chunk_text` - The actual text content
- `chunk_index` - Order in document
- `embedding` - vector(768) for EmbeddingGemma embeddings (was vector(1536) for OpenAI)
- `metadata` - Platform, period, fileName, char positions
- `created_at` - Timestamp

## 📁 File Created

- `/enable-pgvector.sql` - SQL to enable pgvector (run in Supabase SQL Editor if needed)

## ⏭️ Once Setup Complete

Run the document processor on your 90+ BMW sample files to populate the vector database!
