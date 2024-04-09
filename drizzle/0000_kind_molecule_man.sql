DO $$ BEGIN
 CREATE TYPE "category" AS ENUM('생활비', '경조사비', '문화/여행비', '저축', '비자금');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "payment_method" AS ENUM('Marlang_Kookmin', 'Marlang_Shinhan_Travel', 'Marlang_LG', 'Bokchi_Woori_Living', 'Bokchi_Woori_Spare', 'BokChi_Shinhan', 'BokChi_Shinhan_Travel', 'Cash');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"date" date,
	"category" "category",
	"description" text,
	"amount" integer,
	"payment_method" "payment_method",
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "category_idx" ON "transactions" ("category");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "payment_method_idx" ON "transactions" ("payment_method");