import { integer, timestamp, check,uuid,text, pgTable,boolean } from "drizzle-orm/pg-core";
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
    refreshToken: text("refresh_token"),
    emailVerified: boolean("emailVerified").default(false),
}, (table) =>[
    check("age_check1", sql `${table.age} between 18 and 50`),
    check("number_check", sql`${table.number}::text ~ '^[0-9]{10}$'`),
]
)

const emailOtp = pgTable("emailotp",{
    id: uuid("id").primaryKey().defaultRandom(),
    userId : uuid("userId").references(() => users.id).notNull(),

    otpHash: text("otpHash").notNull(),

    expiresAt : timestamp("expiresAt",{
        withTimezone: true
    }).notNull(),

    attempts: integer("attempts").notNull().default(0),

    createdAt: timestamp("createdAt",{
        withTimezone: true,
    }).defaultNow().notNull(),

})

export { users, emailOtp}
