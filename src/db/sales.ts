import {
    pgTable,
    uuid,
    text,
    numeric,
    timestamp,
    pgEnum,
    index,
    check,
    
} from "drizzle-orm/pg-core";

import { sql } from "drizzle-orm";

import { organisation } from "./organisation.js";
import { customer } from "./customer.js";


export const saleStatusEnums = pgEnum(
    "sale_status",
    [
        "draft",
        "completed",
        "cancelled",
    ],
);


const sale = pgTable(
    "sale",
    {
        id: uuid("id")
            .primaryKey()
            .defaultRandom(),

        organisation_id: uuid("organisation_id")
            .notNull()
            .references(() => organisation.id, {
                onDelete: "cascade",
            }),

        customer_id: uuid("customer_id")
            .references(() => customer.id, {
                onDelete: "restrict",
            }),

        sale_number: text("sale_number")
            .notNull(),

        sale_date: timestamp("sale_date", {
            withTimezone: true,
        })
            .notNull()
            .defaultNow(),

        total_amt: numeric("total_amt", {
            precision: 14,
            scale: 2,
        })
            .notNull()
            .default("0"),

        status: saleStatusEnums("status")
            .notNull()
            .default("draft"),

        created_at: timestamp("created_at", {
            withTimezone: true,
        })
            .notNull()
            .defaultNow(),

        updated_at: timestamp("updated_at", {
            withTimezone: true,
        })
            .notNull()
            .defaultNow()
            .$onUpdate(() => new Date()),
    },

    (table) => [
        index("sale_org_customer_idx")
            .on(
                table.organisation_id,
                table.customer_id,
            ),

        index("sale_org_sale_date_idx")
            .on(
                table.organisation_id,
                table.sale_date,
            ),

        check(
            "sale_total_amt_no_negative",
            sql`${table.total_amt} >= 0`,
        ),
    ],
);


export { sale };