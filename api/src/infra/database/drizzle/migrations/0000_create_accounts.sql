CREATE TABLE "accounts" (
	"id" uuid PRIMARY KEY NOT NULL,
	"external_id" text NOT NULL,
	"email" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "accounts_external_id_unique" UNIQUE("external_id"),
	CONSTRAINT "accounts_email_unique" UNIQUE("email")
);
