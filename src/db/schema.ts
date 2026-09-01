import { integer, timestamp, check,uuid,text, pgTable } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";


const users = pgTable("users", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    email: text("email").unique("user_email_unique").notNull(),
    password: text("password").notNull(),
    number: text("number").notNull(),
    age: integer("age").notNull(),
    createdAt: timestamp("created_at", {withTimezone: true}).defaultNow().notNull(),
    updatedAt: timestamp("updated_at",{withTimezone: true}).defaultNow().$onUpdate(() => new Date()).notNull(),
    profile: text("profile").notNull(),
}, (table) =>[
    check("age_check1", sql `${table.age} between 18 and 50`),
]
)

export { users}
