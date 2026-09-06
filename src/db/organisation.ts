import {
    pgTable,
    uuid,
    text,
    timestamp
} from "drizzle-orm/pg-core"



const organisation = pgTable("organisation",{
    id: uuid("id")
      .primaryKey()
      .defaultRandom(),
      
    name: text("name")
        .notNull(),

    slug: text("slug")
        .notNull()
        .unique(),

    created_at: timestamp("created_at",{ withTimezone: true})
        .defaultNow()
        .notNull(),

    updated_at : timestamp("updated_at",{withTimezone: true})
        .defaultNow()
        .$onUpdate(() => new Date())
        .notNull(),


})

export { 
    organisation
}