ALTER TABLE "budgets" ADD COLUMN "category" "category" NOT NULL;--> statement-breakpoint
ALTER TABLE "budgets" ADD COLUMN "remain" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "budgets" ADD COLUMN "budget" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "budgets" DROP COLUMN IF EXISTS "id";--> statement-breakpoint
ALTER TABLE "budgets" DROP COLUMN IF EXISTS "value";