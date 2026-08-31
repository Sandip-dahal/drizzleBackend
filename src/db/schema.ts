import { integer, timestamp, check,uuid,text, pgTable } from "drizzle-orm/pg-core";
import { date } from "drizzle-orm/mysql-core";
import { time } from "node:console";
import { sql } from "drizzle-orm";


const userTable = pgTable("users", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    email: text("email").unique().notNull(),
    password: text("password").notNull(),
    number: text("number").notNull(),
    age: integer("age").notNull(),
    createdAt: timestamp("created_at", {withTimezone: true}).defaultNow().notNull(),
    updatedAt: timestamp("updated_at",{withTimezone: true}).defaultNow().$onUpdate(() => new Date()).notNull(),
    profile: text("profile").notNull(),
}, (table) =>[
    check("age_check1", sql `${table.age} between 18 and 50`),
    check("email", sql `${table.email} ~ ^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`),
    check("number_check", sql `${table.number}:: text ~ '^[0-9]{10}$'`)
]
)
