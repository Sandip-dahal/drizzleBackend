import { 
    pgTable,
    uuid,
    text,
    index,
    timestamp,
    check,
    integer,

} from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"
import { organisation } from "./organisation.js"
import { productVariant } from "./productVariant.js"




const stock_movement = pgTable("stock_movement",{
    
    id : uuid("id")
    .notNull()
    .defaultRandom(),

    organisation_id : uuid("organisation_id")
    .references(() => organisation.id,{ onDelete: "cascade"}),

    product_variant_id : uuid("product_variant_id")
    .references(() => productVariant.id)
    .notNull(),

    movement_type: text("movement_type")// typescan be purchase, sales, purchase return, sale return,
    .notNull(),

    quantity : integer("qunatity")
    .notNull(),

    refrence_id : uuid("refrence_id"),

    note : text("note"),

    created_at : timestamp("created_at",{ withTimezone: true })
    .defaultNow()
    .notNull(),

    updated_at : timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date())

},   (table)  =>[
    index("stock_movement_org_product_variant_idx")
    .on( table.organisation_id, table.product_variant_id),

    index("stock_movement_refrenece_idx")
    .on( table.refrence_id),

    check("stock_movement_qunatity_not_zero",
        sql ` ${table.quantity} >=0`
    )
])

export { 
    stock_movement
}