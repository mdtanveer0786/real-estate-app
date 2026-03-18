import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiUpload, FiX, FiSave, FiArrowLeft } from 'react-icons/fi';
import api from '../services/api';
import toast from 'react-hot-toast';

const PROPERTY_TYPES = ['apartment', 'house', 'villa', 'commercial', 'plot', 'penthouse'];
const LISTING_TYPES = ['buy', 'rent'];
const AMENITIES = [
    'parking', 'gym', 'pool', 'garden', 'security',
    'elevator', 'power_backup', 'water_supply', 'clubhouse',
    'playground', 'wifi', 'ac', 'furnished', 'pet_friendly',
    'balcony', 'terrace', 'storage', 'cctv', 'intercom',
];
const AMENITY_LABELS = {
    parking: '🅿️ Parking', gym: '🏋️ Gym', pool: '🏊 Pool', garden: '🌳 Garden',
    security: '🔒 Security', elevator: '🛗 Elevator', power_backup: '⚡ Power Backup',
    water_supply: '💧 Water Supply', clubhouse: '🏠 Clubhouse', playground: '🎮 Playground',
    wifi: '📶 WiFi', ac: '❄️ AC', furnished: '🛋️ Furnished', pet_friendly: '🐾 Pet Friendly',
    balcony: '🌅 Balcony', terrace: '☀️ Terrace', storage: '📦 Storage',
    cctv: '📹 CCTV', intercom: '📞 Intercom',
};

const AddEditProperty = () => {
    const { id } = useParams();
    const isEdit = Boolean(id);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [images, setImages] = useState([]);
    const [existingImages, setExistingImages] = useState([]);
    const [form, setForm] = useState({
        title: '', description: '', price: '',
        type: 'buy', propertyType: 'apartment',
        bedrooms: '', bathrooms: '',
        area: { value: '', unit: 'sqft' },
        location: { address: '', city: '', state: '', pincode: '' },
        features: '',
        amenities: [],
        status: 'available',
    });

    useEffect(() => {
        if (isEdit) {
            (async () => {
                try {
                    const { data } = await api.get(`/properties/${id}`);
                    const p = data.property || data;
                    setForm({
                        title: p.title || '', description: p.description || '',
                        price: p.price || '',
                        type: p.type || 'buy', propertyType: p.propertyType || 'apartment',
                        bedrooms: p.bedrooms || '', bathrooms: p.bathrooms || '',
                        area: { value: p.area?.value || '', unit: p.area?.unit || 'sqft' },
                        location: {
                            address: p.location?.address || '',
                            city: p.location?.city || '',
                            state: p.location?.state || '',
                            pincode: p.location?.pincode || '',
                        },
                        features: (p.features || []).join(', '),
                        amenities: p.amenities || [],
                        status: p.status || 'available',
                    });
                    setExistingImages(p.images || []);
                } catch {
                    toast.error('Failed to load property');
                    navigate('/agent');
                }
            })();
        }
    }, [id, isEdit, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.startsWith('location.')) {
            const field = name.split('.')[1];
            setForm(prev => ({ ...prev, location: { ...prev.location, [field]: value } }));
        } else if (name.startsWith('area.')) {
            const field = name.split('.')[1];
            setForm(prev => ({ ...prev, area: { ...prev.area, [field]: value } }));
        } else {
            setForm(prev => ({ ...prev, [name]: value }));
        }
    };

    const toggleAmenity = (amenity) => {
        setForm(prev => ({
            ...prev,
            amenities: prev.amenities.includes(amenity)
                ? prev.amenities.filter(a => a !== amenity)
                : [...prev.amenities, amenity],
        }));
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        setImages(prev => [...prev, ...files].slice(0, 10));
    };

    const removeImage = (index) => setImages(prev => prev.filter((_, i) => i !== index));
    const removeExisting = (index) => setExistingImages(prev => prev.filter((_, i) => i !== index));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const body = {
                ...form,
                price: Number(form.price),
                bedrooms: Number(form.bedrooms),
                bathrooms: Number(form.bathrooms),
                area: { value: Number(form.area.value), unit: form.area.unit },
                features: form.features.split(',').map(f => f.trim()).filter(Boolean),
                images: existingImages,
            };

            let propertyId;
            if (isEdit) {
                await api.put(`/properties/${id}`, body);
                propertyId = id;
                toast.success('Property updated!');
            } else {
                const { data } = await api.post('/properties', body);
                propertyId = data.property?._id || data._id;
                toast.success('Property created!');
            }

            // Upload new images if any
            if (images.length > 0 && propertyId) {
                const formData = new FormData();
                images.forEach(img => formData.append('images', img));
                await api.post(`/properties/${propertyId}/images`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
            }

            navigate('/agent');
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to save property');
        } finally {
            setLoading(false);
        }
    };

    const inputClass = 'w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all';
    const labelClass = 'block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5';

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => navigate('/agent')}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
                    >
                        <FiArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </button>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {isEdit ? 'Edit Property' : 'Add New Property'}
                    </h1>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Basic Info */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 space-y-5">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Basic Information</h2>

                        <div>
                            <label className={labelClass}>Title *</label>
                            <input name="title" value={form.title} onChange={handleChange} className={inputClass} placeholder="e.g. Modern 3BHK Apartment in Bandra" required />
                        </div>

                        <div>
                            <label className={labelClass}>Description *</label>
                            <textarea name="description" value={form.description} onChange={handleChange} className={`${inputClass} h-32 resize-none`} placeholder="Describe the property..." required />
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <div>
                                <label className={labelClass}>Price (₹) *</label>
                                <input name="price" type="number" value={form.price} onChange={handleChange} className={inputClass} required />
                            </div>
                            <div>
                                <label className={labelClass}>Listing Type *</label>
                                <select name="type" value={form.type} onChange={handleChange} className={inputClass}>
                                    {LISTING_TYPES.map(t => <option key={t} value={t}>{t === 'buy' ? 'For Sale' : 'For Rent'}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className={labelClass}>Property Type *</label>
                                <select name="propertyType" value={form.propertyType} onChange={handleChange} className={inputClass}>
                                    {PROPERTY_TYPES.map(t => <option key={t} value={t} className="capitalize">{t}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className={labelClass}>Bedrooms</label>
                                <input name="bedrooms" type="number" min="0" value={form.bedrooms} onChange={handleChange} className={inputClass} required />
                            </div>
                            <div>
                                <label className={labelClass}>Bathrooms</label>
                                <input name="bathrooms" type="number" min="0" value={form.bathrooms} onChange={handleChange} className={inputClass} required />
                            </div>
                            <div>
                                <label className={labelClass}>Area</label>
                                <div className="flex gap-2">
                                    <input name="area.value" type="number" min="0" value={form.area.value} onChange={handleChange} className={`${inputClass} flex-1`} required />
                                    <select name="area.unit" value={form.area.unit} onChange={handleChange} className={`${inputClass} w-24`}>
                                        <option value="sqft">sqft</option>
                                        <option value="sqm">sqm</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {isEdit && (
                            <div>
                                <label className={labelClass}>Status</label>
                                <select name="status" value={form.status} onChange={handleChange} className={inputClass}>
                                    <option value="available">Available</option>
                                    <option value="sold">Sold</option>
                                    <option value="rented">Rented</option>
                                    <option value="pending">Pending</option>
                                    <option value="draft">Draft</option>
                                </select>
                            </div>
                        )}
                    </div>

                    {/* Location */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 space-y-5">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Location</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className={labelClass}>Address *</label>
                                <input name="location.address" value={form.location.address} onChange={handleChange} className={inputClass} required />
                            </div>
                            <div>
                                <label className={labelClass}>City *</label>
                                <input name="location.city" value={form.location.city} onChange={handleChange} className={inputClass} required />
                            </div>
                            <div>
                                <label className={labelClass}>State *</label>
                                <input name="location.state" value={form.location.state} onChange={handleChange} className={inputClass} required />
                            </div>
                            <div>
                                <label className={labelClass}>Pincode *</label>
                                <input name="location.pincode" value={form.location.pincode} onChange={handleChange} className={inputClass} maxLength={6} required />
                            </div>
                        </div>
                    </div>

                    {/* Amenities */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 space-y-5">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Amenities</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                            {AMENITIES.map(amenity => (
                                <button
                                    key={amenity}
                                    type="button"
                                    onClick={() => toggleAmenity(amenity)}
                                    className={`px-3 py-2.5 rounded-xl text-sm font-medium transition-all border ${
                                        form.amenities.includes(amenity)
                                            ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-300 dark:border-primary-700 text-primary-700 dark:text-primary-300'
                                            : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-gray-300'
                                    }`}
                                >
                                    {AMENITY_LABELS[amenity]}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Images */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 space-y-5">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Images</h2>

                        {/* Existing images */}
                        {existingImages.length > 0 && (
                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                                {existingImages.map((img, i) => (
                                    <div key={i} className="relative group aspect-square rounded-xl overflow-hidden">
                                        <img src={img.url} alt="" className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => removeExisting(i)}
                                            className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <FiX className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* New images preview */}
                        {images.length > 0 && (
                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                                {images.map((file, i) => (
                                    <div key={i} className="relative group aspect-square rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700">
                                        <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => removeImage(i)}
                                            className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <FiX className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl cursor-pointer hover:border-primary-400 transition-colors">
                            <FiUpload className="w-6 h-6 text-gray-400 mb-2" />
                            <span className="text-sm text-gray-500">Click to upload (max 10)</span>
                            <input type="file" accept="image/*" multiple onChange={handleImageChange} className="hidden" />
                        </label>
                    </div>

                    {/* Features */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 space-y-5">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Extra Features</h2>
                        <input name="features" value={form.features} onChange={handleChange} className={inputClass} placeholder="Comma-separated: e.g. Modular kitchen, Italian flooring" />
                    </div>

                    {/* Submit */}
                    <div className="flex gap-4">
                        <button
                            type="button"
                            onClick={() => navigate('/agent')}
                            className="px-6 py-3 rounded-xl font-semibold text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                        >
                            Cancel
                        </button>
                        <motion.button
                            type="submit"
                            disabled={loading}
                            whileTap={{ scale: 0.98 }}
                            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl shadow-lg shadow-primary-500/20 disabled:opacity-50 transition-all"
                        >
                            <FiSave className="w-5 h-5" />
                            {loading ? 'Saving...' : isEdit ? 'Update Property' : 'Create Property'}
                        </motion.button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddEditProperty;
