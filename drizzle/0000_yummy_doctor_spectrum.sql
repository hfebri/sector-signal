CREATE TABLE "brand_documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"brand_id" uuid NOT NULL,
	"file_name" text NOT NULL,
	"file_type" text NOT NULL,
	"file_size" integer NOT NULL,
	"storage_path" text NOT NULL,
	"category" text DEFAULT 'general' NOT NULL,
	"uploaded_at" timestamp DEFAULT now() NOT NULL,
	"processing_status" text DEFAULT 'pending' NOT NULL,
	"chunk_count" integer DEFAULT 0,
	"processed_at" timestamp,
	"metadata" jsonb
);
--> statement-breakpoint
CREATE TABLE "brands" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"brand_name" text NOT NULL,
	"industry" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"target_audience" text DEFAULT '' NOT NULL,
	"brand_voice" text DEFAULT '' NOT NULL,
	"competitors" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"brand_values" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"goals" text DEFAULT '' NOT NULL,
	"rivaliq_landscape_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "document_chunks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"document_id" uuid NOT NULL,
	"brand_id" uuid NOT NULL,
	"chunk_text" text NOT NULL,
	"chunk_index" integer NOT NULL,
	"embedding" vector(768) NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "brand_documents" ADD CONSTRAINT "brand_documents_brand_id_brands_id_fk" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_chunks" ADD CONSTRAINT "document_chunks_document_id_brand_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."brand_documents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_chunks" ADD CONSTRAINT "document_chunks_brand_id_brands_id_fk" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE cascade ON UPDATE no action;