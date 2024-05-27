CREATE TABLE IF NOT EXISTS "balances" (
	"yyyymm" varchar(6) NOT NULL,
	"category" "category" NOT NULL,
	"remain" integer NOT NULL,
	CONSTRAINT "balances_yyyymm_category_pk" PRIMARY KEY("yyyymm","category")
);
--> statement-breakpoint
ALTER TABLE "budgets" RENAME COLUMN "budget" TO "amount";--> statement-breakpoint
ALTER TABLE "budgets" DROP CONSTRAINT "budgets_yyyymm_category_pk";--> statement-breakpoint
ALTER TABLE "budgets" ALTER COLUMN "category" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "budgets" ADD COLUMN "id" uuid DEFAULT gen_random_uuid() NOT NULL;--> statement-breakpoint
ALTER TABLE "budgets" ADD COLUMN "date" date NOT NULL;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "budget_date_idx" ON "budgets" ("date");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "budget_category_idx" ON "budgets" ("category");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "date_idx" ON "transactions" ("date");--> statement-breakpoint
ALTER TABLE "budgets" DROP COLUMN IF EXISTS "yyyymm";--> statement-breakpoint
ALTER TABLE "budgets" DROP COLUMN IF EXISTS "remain";
