import { 
    pgTable,
    uuid,
    text,
    numeric,
    timestamp,
    unique,
    check,
    index,

} from "drizzle-orm/pg-core"
import { organisation } from "./organisation.js"
import { product } from "./product.js"
import { sql } from "drizzle-orm"







const productVariant = pgTable("productVariant",{

    id : uuid("id")
        .primaryKey()
        .defaultRandom(),

    organisation_id : uuid("organisation_id")
        .references(() => organisation.id,{ onDelete: "cascade"})
        .notNull(),

    product_id : uuid("product_id")
        .references(() => product.id,{onDelete: "restrict"})
        .notNull(),

    sku: text("sku")
        .notNull(),

    barcode: text("barcode"),

    color: text("color")
        .notNull(),

    size : text("size")
    .notNull(),
    
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

    created_at: timestamp("created_at", { withTimezone: true })
                .notNull()
                .defaultNow(),
        
    updated_at : timestamp("updated_at", { withTimezone: true})
                .notNull()
                .defaultNow()
                .$onUpdate(() => new Date())
        
},  (table) =>[

    unique("product_variant_org_sku_unique")
        .on(
            table.organisation_id, table.sku
        ),

// Barcode must be unique within an org ......
// Mulitle NULL barcodes are allowed by postgreSql
    unique("product_variant_org_barcode_unique")
        .on(
            table.organisation_id, table.barcode
        ),

//usefull for fetching all variant of a product
    index("product_variant_org_Product_index")
        .on(table.organisation_id,table.product_id),

    check("product_variant_cp_no_negative", 
        sql `${table.cost_price} >=0`),

    check("product_variant_sp_no_negative",
        sql `${table.selling_price} >= 0`),


// ensure the variant and the product belongs to the same  org.....
    // foreignKey({
    //     columns: [
    //         table.organisation_id,
    //         table.product_id
    //     ],
    //     foreignColumns: [
    //         organisation.id,
    //         product.id,
    //     ],

    //     name: "product_variant_org_product_fk"
    // })

])

export { productVariant}