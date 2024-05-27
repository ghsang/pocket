DO $$ BEGIN
 CREATE TYPE "type" AS ENUM('budget', 'expense');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DROP TABLE "budgets";--> statement-breakpoint
ALTER TABLE "transactions" ALTER COLUMN "user" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "transactions" ALTER COLUMN "description" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "transactions" ALTER COLUMN "payment_method" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "is_expense" boolean NOT NULL DEFAULT true;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "is_expense_idx" ON "transactions" ("is_expense");
