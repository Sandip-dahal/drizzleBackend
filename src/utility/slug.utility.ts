export function slugGenerator(value: string):string{
    

    return value
    .toLocaleLowerCase()
    .trim()
     .replace(/[^a-z0-9\s-]/g,"")
     .replace(/\s+/g, "-")
     .replace(/-+/g, "-");
}