/* 
    Unfortunately in current drizzle-kit version we can't automatically get name for primary key.
    We are working on making it available!

    Meanwhile you can:
        1. Check pk name in your database, by running
            SELECT constraint_name FROM information_schema.table_constraints
            WHERE table_schema = 'public'
                AND table_name = 'budgets'
                AND constraint_type = 'PRIMARY KEY';
        2. Uncomment code below and paste pk name manually
        
    Hope to release this update as soon as possible
*/

-- ALTER TABLE "budgets" DROP CONSTRAINT "<constraint_name>";--> statement-breakpoint
ALTER TABLE "budgets" ALTER COLUMN "category" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "budgets" ADD COLUMN "id" uuid DEFAULT gen_random_uuid() NOT NULL;--> statement-breakpoint
ALTER TABLE "budgets" ADD COLUMN "yyyymm" text;--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "budgets_yyyymm_category_index" ON "budgets" ("yyyymm","category");