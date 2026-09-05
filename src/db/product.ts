import {
    pgTable,
    uuid,
    unique,
    primaryKey,
    numeric,
    text,
    timestamp,
    pgEnum,
    index,
    check,
} from "drizzle-orm/pg-core"

import { sql } from "drizzle-orm"

import { categories } from "./categories.js"
import { organisation } from "./organization.js"



const productStatusEnums = pgEnum("product_status",[
    "active",
    "inactive"
])

const product = pgTable("product",{

    id: uuid("id")
        .primaryKey()
        .defaultRandom(),
    organisation_id: uuid("organisation_id")
        .references(() => organisation.id,{ onDelete: "cascade"})
        .notNull(),
    
    categories_id: uuid("categories_id")
        .references(() =>categories.id)
        .notNull(),
    
    name: text("name")
        .notNull(),

    sku: text("sku")
        .notNull(),

    description: text("description"),

    cost_price: numeric("cost_price",{
        precision:12,
        scale:2
    })
        .notNull(),

    selling_price: numeric("selling_price",{
        precision:12,
        scale:2
    })
        .notNull(),
    
    status: productStatusEnums("status")
        .notNull()
        .default("active"),

    created_at: timestamp("created_at", { withTimezone: true })
        .notNull()
        .defaultNow(),

    updated_at : timestamp("updated_at", { withTimezone: true})
        .notNull()
        .defaultNow()
        .$onUpdate(() => new Date())


    
},  (table)  => [
    unique("product_org_sku_unique")
    .on(table.organisation_id, table.sku),

    index("product_org_category_idx")
    .on(table.organisation_id,table.categories_id,),

    check("product_sp_no_negative",
        sql` ${table.selling_price} >=0`
    ),

    check("product_cp_no_negative",
        sql ` ${table.cost_price} >=0`
    )
])


export { product, productStatusEnums}