import {
    pgTable,
    text,
    uuid,
    timestamp,
    unique
} from "drizzle-orm/pg-core"

import { organisation} from "./organization.js"



const categories = pgTable("categories",{
    id: uuid("id")
        .primaryKey()
        .defaultRandom(),

    organisation_id: uuid("organisation_id")
        .references(()=> organisation.id,{ onDelete: "cascade"})  //when org is dlt,it categorey is also dtl too
        .notNull(),
    
    name: text("name")
        .notNull(),
    
    description: text("description"),
    
    created_at: timestamp("created_at",{withTimezone: true})
        .notNull()
        .defaultNow(),
    
    updated_at: timestamp("updated_at",{ withTimezone: true})
        .notNull()
        .defaultNow()
        .$onUpdate(() => new Date()),
        
},  (table) => [
    unique("category_org_name_unique")
    .on(table.organisation_id, table.name)
])


export {
    categories
}