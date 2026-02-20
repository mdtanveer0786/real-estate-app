export const propertyValidation = {
    title: {
        required: 'Title is required',
        minLength: {
            value: 5,
            message: 'Title must be at least 5 characters',
        },
        maxLength: {
            value: 100,
            message: 'Title must not exceed 100 characters',
        },
    },
    description: {
        required: 'Description is required',
        minLength: {
            value: 20,
            message: 'Description must be at least 20 characters',
        },
    },
    price: {
        required: 'Price is required',
        min: {
            value: 1,
            message: 'Price must be greater than 0',
        },
    },
    bedrooms: {
        required: 'Number of bedrooms is required',
        min: {
            value: 0,
            message: 'Bedrooms cannot be negative',
        },
    },
    bathrooms: {
        required: 'Number of bathrooms is required',
        min: {
            value: 0,
            message: 'Bathrooms cannot be negative',
        },
    },
    area: {
        value: {
            required: 'Area is required',
            min: {
                value: 1,
                message: 'Area must be greater than 0',
            },
        },
    },
    location: {
        address: {
            required: 'Address is required',
        },
        city: {
            required: 'City is required',
        },
        state: {
            required: 'State is required',
        },
        pincode: {
            required: 'Pincode is required',
            pattern: {
                value: /^\d{6}$/,
                message: 'Please enter a valid 6-digit pincode',
            },
        },
    },
};