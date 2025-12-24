export function toCompanySlug(name: string, city: string = ""): string {
    const cleanName = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const cleanCity = city.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    
    // Result: "naman-enterprise-delhi"
    return city ? `${cleanName}-${cleanCity}` : cleanName;
}

export function fromSlug(slug: string): string {
    // Result: "Naman Enterprise Delhi"
    return slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}