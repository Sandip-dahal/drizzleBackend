import {
    pgTable,
    uuid,
    timestamp,
    pgEnum,
} from "drizzle-orm/pg-core"

import {  organisation } from "./organization.js"
import { users } from "./schema.js"


const membershipRole = pgEnum("membership_role",
    [
        "owner",
        "manager",
        "cashier",
    ]
)


const membership = pgTable("membership",{
    
    id: uuid("id")
        .primaryKey()
        .defaultRandom(),

    user_id: uuid("user_id")
        .references(() => users.id)
        .notNull(),
    
    organisation_id: uuid("organisation_id")
        .references(() => organisation.id,{ onDelete: "cascade"})
        .notNull(),

    role: membershipRole("role")
        .notNull(),
    
    created_at: timestamp("created_at",{withTimezone: true})
        .notNull()
        .defaultNow(),

    updated_at : timestamp("updated_at",{withTimezone: true})
        .defaultNow()
        .notNull()
        .$onUpdate(() => new Date())
})
