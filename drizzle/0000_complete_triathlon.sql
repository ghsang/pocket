DO $$ BEGIN
 CREATE TYPE "category" AS ENUM('생활비', '경조사비', '문화/여행비', '저축', '비자금');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "payment_method" AS ENUM('말랑 국민', '말랑 신한 트레블', '말랑 LG', '복치 우리 생활비', '복치 우리 예비', '복치 신한', '복치 신한 트레블', '현금');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "budgets" (
	"id" char(6) PRIMARY KEY DEFAULT 'unique' NOT NULL,
	"value" json NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"date" date NOT NULL,
	"category" "category" NOT NULL,
	"description" text NOT NULL,
	"amount" integer NOT NULL,
	"payment_method" "payment_method" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "category_idx" ON "transactions" ("category");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "payment_method_idx" ON "transactions" ("payment_method");