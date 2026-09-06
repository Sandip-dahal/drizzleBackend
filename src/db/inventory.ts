import { 
    pgTable,
    uuid,
    unique,
    index,
    timestamp,
    integer,
    check,


 } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"
import { organisation } from "./organisation.js"
import { productVariant } from "./productVariant.js"






const inventory = pgTable("inventory",{
    id: uuid("id")
    .primaryKey()
    .defaultRandom(),

    organisation_id : uuid("organisation_id")
        .references(() => organisation.id,{ onDelete: "cascade"}),

    product_variant_id : uuid("product_variant_id")
        .references(() => productVariant.id),

    quantity : integer("quantity")
        .notNull(),

    reorder_level : integer("reorder_level")
        .notNull(),
    
    created_at : timestamp("created_at",{ withTimezone: true})
        .notNull()
        .defaultNow(),

    updated_at : timestamp("updated_at",{ withTimezone: true})
        .notNull()
        .defaultNow()
        .$onUpdate(() => new Date())

},   (table) => [

    unique("inventory_org_variant_unique")
    .on(table.organisation_id, table.product_variant_id),

//stock qunatity cannot be negative.......
    check("inventory_qunatity_no_negative",
        sql `${table.quantity} >=0`
    ),

//recorder level cannot be negative.....
    check("inventory_recorder_level_no_negative",
        sql ` ${table.reorder_level} >=0`
    ),



])

export { inventory }
