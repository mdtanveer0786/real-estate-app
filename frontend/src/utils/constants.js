export const PROPERTY_TYPES = [
    { value: 'apartment', label: 'Apartment' },
    { value: 'house', label: 'House' },
    { value: 'villa', label: 'Villa' },
    { value: 'commercial', label: 'Commercial' },
];

export const PROPERTY_PURPOSE = [
    { value: 'buy', label: 'Buy' },
    { value: 'rent', label: 'Rent' },
];

export const BEDROOM_OPTIONS = [
    { value: '', label: 'Any' },
    { value: '1', label: '1+' },
    { value: '2', label: '2+' },
    { value: '3', label: '3+' },
    { value: '4', label: '4+' },
    { value: '5', label: '5+' },
];

export const SORT_OPTIONS = [
    { value: '-createdAt', label: 'Newest First' },
    { value: 'price', label: 'Price: Low to High' },
    { value: '-price', label: 'Price: High to Low' },
    { value: '-views', label: 'Most Viewed' },
];

export const INQUIRY_STATUS = {
    NEW: 'new',
    CONTACTED: 'contacted',
    CLOSED: 'closed',
};

export const PROPERTY_STATUS = {
    AVAILABLE: 'available',
    SOLD: 'sold',
    RENTED: 'rented',
};

export const AREA_UNITS = {
    SQFT: 'sqft',
    SQM: 'sqm',
};