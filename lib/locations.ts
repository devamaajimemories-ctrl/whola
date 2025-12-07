export const TARGET_CITIES = [
    "Delhi", "Mumbai", "Bangalore", "Hyderabad", "Ahmedabad",
    "Chennai", "Kolkata", "Surat", "Pune", "Jaipur",
    "Lucknow", "Kanpur", "Nagpur", "Indore", "Thane",
    "Bhopal", "Visakhapatnam", "Pimpri-Chinchwad", "Patna", "Vadodara",
    "Ghaziabad", "Ludhiana", "Agra", "Nashik", "Faridabad"
];

// Helper to format URL slugs (e.g. "Mobile Phones" -> "mobile-phones")
export const toSlug = (text: string) => {
    if (!text) return '';
    return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
};

// Helper to format Title Case (e.g. "mobile-phones" -> "Mobile Phones")
export const fromSlug = (slug: string) => {
    // Safety check to prevent "split of undefined" error
    if (!slug) return ''; 
    return slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};