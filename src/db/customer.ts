import { 
    pgTable,
    uuid,
    text,
    timestamp,
    pgEnum,

} from "drizzle-orm/pg-core"
import { organisation } from "./organisation.js"


const customerStatusEnum = pgEnum("customerStatusEnum",[
    "active",
    "inactive"
])

const customer = pgTable("customer",{
    id: uuid("id")
        .primaryKey()
        .defaultRandom(),

    organisation_id: uuid("organisation_id")
        .references(() => organisation.id,{ onDelete: "cascade"})
        .notNull(),

    name: text("name"),

    email: text("email"),
        

    phone: text("phone"),

    address: text("address"),

    tax_number: text("tax_number"),

    notes: text("note"),

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