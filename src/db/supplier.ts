import { 
    pgTable,
    uuid,
    text,
    unique,
    numeric,
    timestamp,
    pgEnum,
} from "drizzle-orm/pg-core";
import { organisation } from "./organization.js";




const supplierStatusEnum = pgEnum("supplierStatusEnum",[
    "active",
    "inactive"
])



const supplier = pgTable("supplier", {


    id: uuid("id")
        .notNull()
        .defaultRandom(),

    organisation_id: uuid("organisation_id")
        .notNull()
        .references(() => organisation.id),

    name: text("name")
        .notNull(),

    contact_person: text("contact_person"),

    addresh: text("addresh")
        .notNull(),

    email: text("email"),

    tax_number: text("tax_number"),

    phone_no : numeric("phone_no")
        .notNull(),

    notes: text("notes"),
    status: supplierStatusEnum("status"),


    created_at : timestamp("created_at", { withTimezone: true})
        .notNull()
        .defaultNow(),

    updated_at : timestamp("updated_at", { withTimezone: true})
        .notNull()
        .defaultNow()
        .$onUpdate(() => new Date())
})


export { supplier }