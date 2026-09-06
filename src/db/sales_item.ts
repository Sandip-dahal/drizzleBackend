import {
    pgTable,
    uuid,
    integer,
    numeric,
    timestamp,
    index,
    check,
} from "drizzle-orm/pg-core";

import { sql } from "drizzle-orm";
import { sale } from "./sales.js";
import { productVariant } from "./productVariant.js";






const saleItem = pgTable(
    "sale_item",
    {
        id: uuid("id")
            .primaryKey()
            .defaultRandom(),

        sale_id: uuid("sale_id")
            .notNull()
            .references(() => sale.id, {
                onDelete: "cascade",
            }),

        product_variant_id: uuid("product_variant_id")
            .notNull()
            .references(() => productVariant.id, {
                onDelete: "restrict",
            }),

        quantity: integer("quantity")
            .notNull(),

        unit_price: numeric("unit_price", {
            precision: 12,
            scale: 2,
        })
            .notNull(),

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
        index("sale_item_sale_idx")
            .on(table.sale_id),

        index("sale_item_variant_idx")
            .on(table.product_variant_id),

        check(
            "sale_item_quantity_positive",
            sql`${table.quantity} >= 0`,
        ),

        check(
            "sale_item_unit_price_no_negative",
            sql`${table.unit_price} >= 0`,
        ),
    ],
);


export { saleItem };