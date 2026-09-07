
import { db } from "../db/dbs/db.js"
import { membership } from "../db/membership.js"
import { organisation } from "../db/organisation.js"
import { slugGenerator } from "../utility/slug.utility.js"
import { ApiError } from "../utility/ApiError.utility.js"
import { eq } from "drizzle-orm"



export async function createOrganisationServices(
    userId: string,
    name: string,
) {

    const baseSlug = slugGenerator(name)

    try {
        return await db.transaction(async (tx) => {

            for (let suffix = 0; suffix <= 100; suffix++) {

                const slug =
                    suffix === 0
                        ? baseSlug
                        : `${baseSlug}-${suffix + 1}`;

                const [newOrganisation] = await tx
                    .insert(organisation)
                    .values({
                        name,
                        slug,
                    })
                    .onConflictDoNothing({
                        target: organisation.slug,
                    })
                    .returning();

                // Slug was available
                if (newOrganisation) {

                    await tx
                        .insert(membership)
                        .values({
                            user_id: userId,
                            organisation_id: newOrganisation.id,
                            role: "owner",
                        });

                    return newOrganisation;
                }

                // Slug already exists → loop continues
            }

            throw new ApiError(
                409,
                "Could not generate a unique organisation slug",
            );
        });

    } catch (error) {
        throw error;
    }
}


export async function getUserOrganisationServices( userId: string){
    
    const organisations = await db
        .select({
            id:organisation.id,
            name:organisation.name,
            slug: organisation.slug,
            role: membership.role
        })
        .from(membership)
        .innerJoin(
            organisation,
            eq(membership.organisation_id, organisation.id)

        )
        .where( eq(membership.user_id,userId))

        return organisations;
}

