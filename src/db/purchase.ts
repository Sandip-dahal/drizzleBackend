import {
    pgTable,
    unique,
    uuid,
    text,
    check,
    numeric,
    index,
    timestamp,

} from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"
import { organisation } from "./organisation.js"
import { supplier } from "./supplier.js"




const purchase = pgTable("purchase",{

    id: uuid("id")
    .primaryKey()
    .defaultRandom(),

    organisation_id : uuid("organisation_id")
    .references(() => organisation.id,{ onDelete: "cascade"})
    .notNull(),

    supplier_id : uuid("supplier_id")
    .references(() => supplier.id,{onDelete:"restrict"})
    .notNull(),

    purchase_number : text("purchase_number")
    .notNull(),

    purchase_date : timestamp("purchase_date",{ withTimezone: true})
    .defaultNow()
    .notNull(),

    total_amt : numeric("total_amt",{
        precision: 14,
        scale:3
    })
    .notNull()
    .default("0"),

    status : text("status")
    .notNull()
    .default("draft"),

    created_at : timestamp("created_at", {withTimezone: true})
    .notNull()
    .defaultNow(),

    updated_at : timestamp("updated_at", { withTimezone: true})
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date())



},   (table) =>[
    index("purchase_org_supplier_idx")
    .on(table.organisation_id, table.supplier_id),

//to show purchase within a date range.....
    index("purchase_org_purchaseDate_idx")
    .on(table.organisation_id,table.purchase_date),

//check ammt not negative....
    check("purchase_total_amt_no_negative",
        sql ` ${table.total_amt} >=0`
    )
]);


export { purchase}