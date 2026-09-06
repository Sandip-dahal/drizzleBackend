import {
    pgTable,
    uuid,
    unique,
    text,
    timestamp,
    index,
    check,
    pgEnum
} from "drizzle-orm/pg-core"

import { sql } from "drizzle-orm"

import { categories } from "./categories.js"
import { organisation } from "./organisation.js"


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


    description: text("description"),

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
    index("product_org_category_idx")
    .on(table.organisation_id,table.categories_id,),

    

])


export { product,productStatusEnums}