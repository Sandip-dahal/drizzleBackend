import { 
    pgTable,
    uuid,
    text,
    timestamp,
    pgEnum,

} from "drizzle-orm/pg-core"
import { organisation } from "./organization.js"


const customerStatusEnum = pgEnum("customerStatusEnum",[
    "active",
    "inactive"
])

const customer = pgTable("customer",{
    id: uuid("text")
        .primaryKey()
        .notNull(),

    organisation_id: uuid("organisation_id")
        .references(() => organisation.id,{ onDelete: "cascade"})
        .notNull(),

    name: text("name")
        .notNull(),

    email: text("email"),
        

    phone: text("phone"),

    address: text("address"),

    tax_number: text("tax_number"),

    notes: text("text"),

    status: customerStatusEnum("status")
        .default("active"),
    
    created_at: timestamp("created_at",{ withTimezone: true})
        .defaultNow()
        .notNull(),

    updated_at : timestamp("updated_at",{ withTimezone: true})
        .notNull()
        .defaultNow()
        .$onUpdate(() => new Date())
})

export { customer, customerStatusEnum}