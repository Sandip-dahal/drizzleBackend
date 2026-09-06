CREATE TYPE "public"."customerStatusEnum" AS ENUM('active', 'inactive');--> statement-breakpoint
CREATE TYPE "public"."product_status" AS ENUM('active', 'inactive');--> statement-breakpoint
CREATE TYPE "public"."sale_status" AS ENUM('draft', 'completed', 'cancelled');--> statement-breakpoint
CREATE TABLE "categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organisation_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "category_org_name_unique" UNIQUE("organisation_id","name")
);
--> statement-breakpoint
CREATE TABLE "customer" (
	"text" text,
	"organisation_id" uuid NOT NULL,
	"name" text,
	"email" text,
	"phone" text,
	"address" text,
	"tax_number" text,
	"status" "customerStatusEnum" DEFAULT 'active',
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inventory" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organisation_id" uuid,
	"product_variant_id" uuid,
	"quantity" integer NOT NULL,
	"reorder_level" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "inventory_org_variant_unique" UNIQUE("organisation_id","product_variant_id"),
	CONSTRAINT "inventory_qunatity_no_negative" CHECK ("inventory"."quantity" >=0),
	CONSTRAINT "inventory_recorder_level_no_negative" CHECK ( "inventory"."reorder_level" >=0)
);
--> statement-breakpoint
CREATE TABLE "organisation" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "organisation_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "product" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organisation_id" uuid NOT NULL,
	"categories_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"status" "product_status" DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "productVariant" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organisation_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"sku" text NOT NULL,
	"barcode" text,
	"color" text NOT NULL,
	"size" text NOT NULL,
	"cost_price" numeric(12, 2) NOT NULL,
	"selling_price" numeric(12, 2) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "product_variant_org_sku_unique" UNIQUE("organisation_id","sku"),
	CONSTRAINT "product_variant_org_barcode_unique" UNIQUE("organisation_id","barcode"),
	CONSTRAINT "product_variant_cp_no_negative" CHECK ("productVariant"."cost_price" >=0),
	CONSTRAINT "product_variant_sp_no_negative" CHECK ("productVariant"."selling_price" >= 0)
);
--> statement-breakpoint
CREATE TABLE "purchase_id" (
	"id" uuid PRIMARY KEY NOT NULL,
	"purchase-id" uuid NOT NULL,
	"product_variant_id" uuid NOT NULL,
	"quantity" integer NOT NULL,
	"unit_cost" numeric(12, 3),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "purchase_item_qunatity_no_negative" CHECK ( "purchase_id"."quantity" >=0),
	CONSTRAINT "purchase_item_unit_cost_no_negative" CHECK ( "purchase_id"."unit_cost" >=0)
);
--> statement-breakpoint
CREATE TABLE "purchase" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organisation_id" uuid NOT NULL,
	"supplier_id" uuid NOT NULL,
	"purchase_number" text NOT NULL,
	"purchase_date" timestamp with time zone DEFAULT now() NOT NULL,
	"total_amt" numeric(14, 3) DEFAULT '0' NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "purchase_total_amt_no_negative" CHECK ( "purchase"."total_amt" >=0)
);
--> statement-breakpoint
CREATE TABLE "sale_item" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sale_id" uuid NOT NULL,
	"product_variant_id" uuid NOT NULL,
	"quantity" integer NOT NULL,
	"unit_price" numeric(12, 2) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "sale_item_quantity_positive" CHECK ("sale_item"."quantity" > 0),
	CONSTRAINT "sale_item_unit_price_no_negative" CHECK ("sale_item"."unit_price" >= 0)
);
--> statement-breakpoint
CREATE TABLE "sale" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organisation_id" uuid NOT NULL,
	"customer_id" uuid,
	"sale_number" text NOT NULL,
	"sale_date" timestamp with time zone DEFAULT now() NOT NULL,
	"total_amt" numeric(14, 2) DEFAULT '0' NOT NULL,
	"status" "sale_status" DEFAULT 'draft' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "sale_total_amt_no_negative" CHECK ("sale"."total_amt" >= 0)
);
--> statement-breakpoint
CREATE TABLE "emailotp" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"otpHash" text NOT NULL,
	"purpose" text NOT NULL,
	"expiresAt" timestamp with time zone NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"password" text NOT NULL,
	"number" text NOT NULL,
	"age" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"profile" text NOT NULL,
	"refresh_token" text,
	"emailVerified" boolean DEFAULT false,
	CONSTRAINT "user_email_unique" UNIQUE("email"),
	CONSTRAINT "age_check1" CHECK ("users"."age" between 18 and 50),
	CONSTRAINT "number_check" CHECK ("users"."number"::text ~ '^[0-9]{10}$')
);
--> statement-breakpoint
CREATE TABLE "stock_movement" (
	"id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"organisation_id" uuid,
	"product_variant_id" uuid NOT NULL,
	"movement_type" text NOT NULL,
	"qunatity" integer NOT NULL,
	"refrence_id" uuid,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "stock_movement_qunatity_not_zero" CHECK ( "stock_movement"."qunatity")
);
--> statement-breakpoint
CREATE TABLE "supplier" (
	"id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"organisation_id" uuid NOT NULL,
	"name" text NOT NULL,
	"contact_person" text,
	"addresh" text NOT NULL,
	"email" text,
	"tax_number" text,
	"phone_no" numeric NOT NULL,
	"notes" text,
	"status" "supplierStatusEnum",
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "categories" ADD CONSTRAINT "categories_organisation_id_organisation_id_fk" FOREIGN KEY ("organisation_id") REFERENCES "public"."organisation"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer" ADD CONSTRAINT "customer_organisation_id_organisation_id_fk" FOREIGN KEY ("organisation_id") REFERENCES "public"."organisation"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory" ADD CONSTRAINT "inventory_organisation_id_organisation_id_fk" FOREIGN KEY ("organisation_id") REFERENCES "public"."organisation"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory" ADD CONSTRAINT "inventory_product_variant_id_productVariant_id_fk" FOREIGN KEY ("product_variant_id") REFERENCES "public"."productVariant"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product" ADD CONSTRAINT "product_organisation_id_organisation_id_fk" FOREIGN KEY ("organisation_id") REFERENCES "public"."organisation"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product" ADD CONSTRAINT "product_categories_id_categories_id_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "productVariant" ADD CONSTRAINT "productVariant_organisation_id_organisation_id_fk" FOREIGN KEY ("organisation_id") REFERENCES "public"."organisation"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "productVariant" ADD CONSTRAINT "productVariant_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_id" ADD CONSTRAINT "purchase_id_purchase-id_purchase_id_fk" FOREIGN KEY ("purchase-id") REFERENCES "public"."purchase"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_id" ADD CONSTRAINT "purchase_id_product_variant_id_productVariant_id_fk" FOREIGN KEY ("product_variant_id") REFERENCES "public"."productVariant"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase" ADD CONSTRAINT "purchase_organisation_id_organisation_id_fk" FOREIGN KEY ("organisation_id") REFERENCES "public"."organisation"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase" ADD CONSTRAINT "purchase_supplier_id_supplier_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."supplier"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sale_item" ADD CONSTRAINT "sale_item_sale_id_sale_id_fk" FOREIGN KEY ("sale_id") REFERENCES "public"."sale"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sale_item" ADD CONSTRAINT "sale_item_product_variant_id_productVariant_id_fk" FOREIGN KEY ("product_variant_id") REFERENCES "public"."productVariant"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sale" ADD CONSTRAINT "sale_organisation_id_organisation_id_fk" FOREIGN KEY ("organisation_id") REFERENCES "public"."organisation"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sale" ADD CONSTRAINT "sale_customer_id_customer_text_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customer"("text") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "emailotp" ADD CONSTRAINT "emailotp_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_movement" ADD CONSTRAINT "stock_movement_organisation_id_organisation_id_fk" FOREIGN KEY ("organisation_id") REFERENCES "public"."organisation"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_movement" ADD CONSTRAINT "stock_movement_product_variant_id_productVariant_id_fk" FOREIGN KEY ("product_variant_id") REFERENCES "public"."productVariant"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "supplier" ADD CONSTRAINT "supplier_organisation_id_organisation_id_fk" FOREIGN KEY ("organisation_id") REFERENCES "public"."organisation"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "product_org_category_idx" ON "product" USING btree ("organisation_id","categories_id");--> statement-breakpoint
CREATE INDEX "product_variant_org_Product_index" ON "productVariant" USING btree ("organisation_id","product_id");--> statement-breakpoint
CREATE INDEX "purchase_item_purchase_idx" ON "purchase_id" USING btree ("purchase-id");--> statement-breakpoint
CREATE INDEX "purchase_item_product_varaint_idx" ON "purchase_id" USING btree ("product_variant_id");--> statement-breakpoint
CREATE INDEX "purchase_org_supplier_idx" ON "purchase" USING btree ("organisation_id","supplier_id");--> statement-breakpoint
CREATE INDEX "purchase_org_purchaseDate_idx" ON "purchase" USING btree ("organisation_id","purchase_date");--> statement-breakpoint
CREATE INDEX "sale_item_sale_idx" ON "sale_item" USING btree ("sale_id");--> statement-breakpoint
CREATE INDEX "sale_item_variant_idx" ON "sale_item" USING btree ("product_variant_id");--> statement-breakpoint
CREATE INDEX "sale_org_customer_idx" ON "sale" USING btree ("organisation_id","customer_id");--> statement-breakpoint
CREATE INDEX "sale_org_sale_date_idx" ON "sale" USING btree ("organisation_id","sale_date");--> statement-breakpoint
CREATE INDEX "stock_movement_org_product_variant_idx" ON "stock_movement" USING btree ("organisation_id","product_variant_id");--> statement-breakpoint
CREATE INDEX "stock_movement_refrenece_idx" ON "stock_movement" USING btree ("refrence_id");