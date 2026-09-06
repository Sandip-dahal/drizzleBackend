import { 
    pgTable,
    uuid,
    text,
    unique,
    numeric,
    timestamp,
    pgEnum,
} from "drizzle-orm/pg-core";
import { organisation } from "./organisation.js";




const supplierStatusEnum = pgEnum("supplierstatusenum",[
    "active",
    "inactive"
])



const supplier = pgTable("supplier", {


    id: uuid("id")
        .primaryKey()
        .defaultRandom(),

    organisation_id: uuid("organisation_id")
        .notNull()
        .references(() => organisation.id,{onDelete: "cascade"}),

    name: text("name")
        .notNull(),

    contact_person: text("contact_person"),

    address: text("address")
        .notNull(),

    email: text("email"),

    tax_number: text("tax_number"),

    phone_no : text("phone_no")
        .notNull(),

    notes: text("notes"),
    status: supplierStatusEnum("status")
    .notNull()
    .default("active"),


    created_at : timestamp("created_at", { withTimezone: true})
        .notNull()
        .defaultNow(),

    updated_at : timestamp("updated_at", { withTimezone: true})
        .notNull()
        .defaultNow()
        .$onUpdate(() => new Date())
})


export { supplier, supplierStatusEnum }