import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { FiPlus, FiX, FiUpload } from 'react-icons/fi';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { getImageUrl } from '../../utils/imageHelper';

const PropertyForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [images, setImages] = useState([]);
    const [features, setFeatures] = useState(['']);

    const { register, handleSubmit, setValue, formState: { errors } } = useForm({
        defaultValues: {
            title: '',
            description: '',
            price: '',
            type: 'buy',
            propertyType: 'apartment',
            bedrooms: '',
            bathrooms: '',
            area: { value: '', unit: 'sqft' },
            location: { address: '', city: '', state: '', pincode: '' },
            status: 'available',
        }
    });

    useEffect(() => {
        if (id) {
            fetchProperty();
        }
    }, [id]);

    const fetchProperty = async () => {
        try {
            const { data } = await api.get(`/properties/${id}`);
            const property = data.property || data;
            setValue('title', property.title);
            setValue('description', property.description);
            setValue('price', property.price);
            setValue('type', property.type);
            setValue('propertyType', property.propertyType);
            setValue('bedrooms', property.bedrooms);
            setValue('bathrooms', property.bathrooms);
            setValue('area', property.area);
            setValue('location', property.location);
            setFeatures(property.features?.length ? property.features : ['']);
            setValue('status', property.status);
            setImages(property.images || []);
        } catch (error) {
            toast.error('Failed to fetch property');
        }
    };

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            // Filter images: separate existing images (objects with .url) and new files
            const existingImages = images.filter(img => img.url);
            const newFiles = images.filter(img => img instanceof File);

            const propertyData = {
                ...data,
                price: Number(data.price),
                bedrooms: Number(data.bedrooms),
                bathrooms: Number(data.bathrooms),
                area: { value: Number(data.area.value), unit: data.area.unit },
                location: data.location,
                features: features.filter(f => f.trim() !== ''),
                images: existingImages, // Send current state of existing images
            };

            let propertyId = id;
            if (id) {
                await api.put(`/properties/${id}`, propertyData);
                toast.success('Property updated successfully');
            } else {
                const { data: res } = await api.post('/properties', propertyData);
                propertyId = res.property?._id || res._id;
                toast.success('Property created successfully');
            }

            // Upload new images if any
            if (newFiles.length > 0) {
                await uploadImages(propertyId, newFiles);
            }

            navigate('/admin/properties');
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to save property');
        } finally {
            setLoading(false);
        }
    };

    const uploadImages = async (propertyId, filesToUpload) => {
        setUploading(true);
        const formData = new FormData();
        filesToUpload.forEach(image => {
            formData.append('images', image);
        });

        try {
            await api.post(`/properties/${propertyId}/images`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
        } catch (error) {
            toast.error('Some images failed to upload');
        } finally {
            setUploading(false);
        }
    };

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        setImages(prev => [...prev, ...files]);
    };

    const removeImage = (index) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">{id ? 'Edit Property' : 'Add New Property'}</h1>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Basic Information */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                    <h2 className="text-lg font-semibold mb-4">Basic Information</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Title *</label>
                            <input
                                type="text"
                                {...register('title', { required: 'Title is required' })}
                                className="input-field"
                            />
                            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Price (₹) *</label>
                            <input
                                type="number"
                                {...register('price', { required: 'Price is required' })}
                                className="input-field"
                            />
                            {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Property Type *</label>
                            <select {...register('type')} className="input-field">
                                <option value="buy">For Sale</option>
                                <option value="rent">For Rent</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Category *</label>
                            <select {...register('propertyType')} className="input-field">
                                <option value="apartment">Apartment</option>
                                <option value="house">House</option>
                                <option value="villa">Villa</option>
                                <option value="commercial">Commercial</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Bedrooms *</label>
                            <input
                                type="number"
                                {...register('bedrooms', { required: 'Number of bedrooms is required' })}
                                className="input-field"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Bathrooms *</label>
                            <input
                                type="number"
                                {...register('bathrooms', { required: 'Number of bathrooms is required' })}
                                className="input-field"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Area *</label>
                            <div className="flex gap-2">
                                <input
                                    type="number"
                                    {...register('area.value', { required: 'Area is required' })}
                                    className="input-field flex-1"
                                    placeholder="Value"
                                />
                                <select {...register('area.unit')} className="input-field w-24">
                                    <option value="sqft">sq ft</option>
                                    <option value="sqm">sq m</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Status</label>
                            <select {...register('status')} className="input-field">
                                <option value="available">Available</option>
                                <option value="sold">Sold</option>
                                <option value="rented">Rented</option>
                            </select>
                        </div>
                    </div>

                    <div className="mt-4">
                        <label className="block text-sm font-medium mb-2">Description *</label>
                        <textarea
                            {...register('description', { required: 'Description is required' })}
                            rows="5"
                            className="input-field"
                        />
                    </div>
                </div>

                {/* Location */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                    <h2 className="text-lg font-semibold mb-4">Location</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="block text-sm font-medium mb-2">Address *</label>
                            <input
                                type="text"
                                {...register('location.address', { required: 'Address is required' })}
                                className="input-field"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">City *</label>
                            <input
                                type="text"
                                {...register('location.city', { required: 'City is required' })}
                                className="input-field"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">State *</label>
                            <input
                                type="text"
                                {...register('location.state', { required: 'State is required' })}
                                className="input-field"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Pincode *</label>
                            <input
                                type="text"
                                {...register('location.pincode', { required: 'Pincode is required' })}
                                className="input-field"
                            />
                        </div>
                    </div>
                </div>

                {/* Features */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                    <h2 className="text-lg font-semibold mb-4">Features</h2>

                    {features.map((feature, index) => (
                        <div key={index} className="flex gap-2 mb-2">
                            <input
                                type="text"
                                value={feature}
                                onChange={(e) => {
                                    const updated = [...features];
                                    updated[index] = e.target.value;
                                    setFeatures(updated);
                                }}
                                className="input-field flex-1"
                                placeholder="e.g., Swimming Pool, Garden, Parking"
                            />
                            {index > 0 && (
                                <button
                                    type="button"
                                    onClick={() => setFeatures(prev => prev.filter((_, i) => i !== index))}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                >
                                    <FiX />
                                </button>
                            )}
                        </div>
                    ))}

                    <button
                        type="button"
                        onClick={() => setFeatures(prev => [...prev, ''])}
                        className="mt-2 text-primary-600 hover:text-primary-700 flex items-center gap-1"
                    >
                        <FiPlus /> Add Feature
                    </button>
                </div>

                {/* Images */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                    <h2 className="text-lg font-semibold mb-4">Images</h2>

                    {/* Image Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        {images.map((image, index) => (
                            <div key={index} className="relative group">
                                <img
                                    src={image.url ? getImageUrl(image.url) : URL.createObjectURL(image)}
                                    alt={`Property ${index + 1}`}
                                    className="w-full h-32 object-cover rounded-lg"
                                />
                                <button
                                    type="button"
                                    onClick={() => removeImage(index)}
                                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition"
                                >
                                    <FiX size={16} />
                                </button>
                            </div>
                        ))}

                        {/* Upload Button */}
                        <label className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg h-32 flex flex-col items-center justify-center cursor-pointer hover:border-primary-500 transition">
                            <FiUpload size={24} className="text-gray-400 mb-2" />
                            <span className="text-sm text-gray-500">Upload Image</span>
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleImageUpload}
                                className="hidden"
                            />
                        </label>
                    </div>

                    <p className="text-sm text-gray-500">
                        You can upload up to 10 images. Supported formats: JPEG, PNG, WebP
                    </p>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end gap-4">
                    <button
                        type="button"
                        onClick={() => navigate('/admin/properties')}
                        className="btn-secondary"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading || uploading}
                        className="btn-primary disabled:opacity-50"
                    >
                        {loading || uploading ? 'Saving...' : (id ? 'Update Property' : 'Create Property')}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default PropertyForm;