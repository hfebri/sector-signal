# File Attachment Research

## Context
- Goal: send supplemental documents (PDF, CSV, XLS, DOCX) alongside prompts when calling Replicate's `openai/gpt-5-structured` model.
- Constraints: current codebase uses `runStructuredPrompt` in `lib/replicate.ts`, which forwards a JSON payload directly to Replicate.
- References reviewed:
  - Replicate model card: <https://replicate.com/openai/gpt-5-structured>
  - OpenAI Responses API docs: <https://platform.openai.com/docs/api-reference/responses/create#responses_create-input>

## Replicate Model Capabilities
- The published schema exposes a single `input` object with fields such as `prompt`, `json_schema`, `tools`, `image_input`, `input_item_list`, and `enable_web_search`.
- No documented field supports raw document uploads; Replicate expects assets to be referenced by URL (similar to image/video inputs for vision models).
- Conclusion: direct binary uploads (PDF, XLS, etc.) are **not** currently supported via the standard `input` payload. Any attachment must be pre-hosted and referenced via a URL that the model can fetch.

## OpenAI Responses API Insight
- OpenAI's Responses endpoint allows `input` entries to include `content` items with `type: "input_text"`, `type: "input_image"`, or `type: "input_audio"`.
- Document handling is generally accomplished by converting files to text (e.g., OCR for PDFs) before embedding them in the prompt. There is no native `document` type in the Responses API either.
- File attachments in OpenAI’s platform are typically handled through the **Assistants** API using the Files endpoint—but Replicate’s wrapper does not expose that functionality.

## Recommended Integration Strategy
1. **Preprocess documents**: convert PDFs/DOCX to plain text (e.g., `pdf-parse`, `docx` npm package); for CSV/XLS, parse into structured summaries.
2. **Chunk & Summarize**: break large documents into manageable sections, optionally summarize to fit prompt/token limits.
3. **Augment Prompt**: inject the derived text into the `prompt` field or provide structured context in `input_item_list`.
4. **Reference Hosted Files (Optional)**: if retaining links is valuable, upload documents to secure object storage and include URLs in the prompt for transparency, noting that the model may not fetch them.
5. **Update `runStructuredPrompt`**: extend the helper to accept an array of document excerpts so call sites (strategy/monthly planners) can pass preprocessed content alongside the main instructions.

## Open Questions / Next Steps
- Confirm with Replicate support whether new fields (e.g., `attachments`) are planned for `gpt-5-structured`.
- Evaluate token budget: large documents may exceed limits; consider retrieval-augmented generation (vector store + context sampling).
- Document preprocessing pipeline requirements within the repo (CLI script or API endpoint) before productionizing.
