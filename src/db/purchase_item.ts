import { 
    numeric, 
    pgTable, 
    uuid,
    unique,
    check,
    index,
    timestamp,
    integer,

} from "drizzle-orm/pg-core"

import { sql } from "drizzle-orm"
import { purchase } from "./purchase.js"
import { productVariant } from "./productVariant.js"




const purchase_item = pgTable("purchase_id",{

    id : uuid("id")
    .primaryKey()
    .defaultRandom(),

    purchase_id : uuid("purchase-id")
    .references(() => purchase.id,{onDelete: "restrict"})
    .notNull(),

    product_variant_id : uuid("product_variant_id")
    .references(() => productVariant.id,{onDelete: "restrict"})
    .notNull(),

    quantity : integer("quantity")
    .notNull(),
    
    unit_cost : numeric("unit_cost",{
        precision:12,
        scale:3,
    }),


    created_at : timestamp("created_at",{ withTimezone: true})
    .defaultNow()
    .notNull(),

    updated_at : timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date())

},   (table)  =>[

    check("purchase_item_qunatity_no_negative",
        sql ` ${table.quantity} >=0`
    ),

    check("purchase_item_unit_cost_no_negative",
        sql ` ${ table.unit_cost} >=0`
    ),

// find all item belongs to purchase....
    index("purchase_item_purchase_idx")
    .on( table.purchase_id),

//find purchase history for a particular variant..
    index("purchase_item_product_varaint_idx")
    .on( table.product_variant_id)

])

export {
    purchase_item
}