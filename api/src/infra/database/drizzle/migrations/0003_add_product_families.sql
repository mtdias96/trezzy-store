CREATE TABLE "product_families" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "family_id" uuid;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "color_name" text;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_family_id_product_families_id_fk" FOREIGN KEY ("family_id") REFERENCES "public"."product_families"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "products_family_color_unique" ON "products" USING btree ("family_id",lower("color_name")) WHERE "products"."family_id" is not null;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_family_color_check" CHECK ("products"."family_id" is null or "products"."color_name" is not null);--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_color_name_check" CHECK ("products"."color_name" is null or ("products"."color_name" = btrim("products"."color_name") and "products"."color_name" <> ''));