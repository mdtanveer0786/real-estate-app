import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    FiUpload, FiX, FiSave, FiArrowLeft, FiHome, 
    FiMapPin, FiInfo, FiImage, FiCheckCircle, FiChevronRight 
} from 'react-icons/fi';
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

const TABS = [
    { id: 'general', label: 'General', icon: <FiInfo /> },
    { id: 'details', label: 'Details', icon: <FiHome /> },
    { id: 'location', label: 'Location', icon: <FiMapPin /> },
    { id: 'media', label: 'Media', icon: <FiImage /> },
];

const AddEditProperty = () => {
    const { id } = useParams();
    const isEdit = Boolean(id);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('general');
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
        if (e && e.preventDefault) e.preventDefault();
        setLoading(true);

        try {
            const body = {
                ...form,
                price: Number(form.price),
                bedrooms: Number(form.bedrooms),
                bathrooms: Number(form.bathrooms),
                area: { value: Number(form.area.value), unit: form.area.unit },
                features: typeof form.features === 'string' 
                    ? form.features.split(',').map(f => f.trim()).filter(Boolean)
                    : form.features,
                amenities: form.amenities,
            };

            if (isEdit) body.images = existingImages;

            let propertyId;
            if (isEdit) {
                await api.put(`/properties/${id}`, body);
                propertyId = id;
                toast.success('Property updated successfully!');
            } else {
                const { data } = await api.post('/properties', body);
                propertyId = data.property?._id || data._id;
                toast.success('Property created successfully!');
            }

            if (images.length > 0 && propertyId) {
                const formData = new FormData();
                images.forEach(img => formData.append('images', img));
                await api.post(`/properties/${propertyId}/images`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
            }

            navigate('/agent');
        } catch (err) {
            console.error('Update error:', err);
            const errorMsg = err.response?.data?.error || err.response?.data?.message || 'Failed to save property';
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const inputClass = 'w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all shadow-sm';
    const labelClass = 'block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2';

    return (
        <div className="min-h-screen bg-[#f8fafc] dark:bg-gray-950 pb-28 sm:pb-24">
            {/* Header Sticky */}
            <div className="sticky top-0 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/agent')}
                            className="p-2.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors text-gray-500"
                        >
                            <FiArrowLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">
                                {isEdit ? 'Edit Property' : 'Add Property'}
                            </h1>
                            <p className="text-xs text-gray-500 mt-0.5">Fill in the details to list your property</p>
                        </div>
                    </div>
                    
                    {/* Progress Tabs */}
                    <div className="hidden md:flex items-center gap-2">
                        {TABS.map((tab, idx) => (
                            <React.Fragment key={tab.id}>
                                <button
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                                        activeTab === tab.id 
                                            ? 'text-primary-600 bg-primary-50 dark:bg-primary-900/20' 
                                            : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                                    }`}
                                >
                                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                                        activeTab === tab.id ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-800'
                                    }`}>
                                        {idx + 1}
                                    </span>
                                    {tab.label}
                                </button>
                                {idx < TABS.length - 1 && <div className="w-4 h-px bg-gray-200 dark:border-gray-800" />}
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 mt-8">
                <form onSubmit={handleSubmit} className="space-y-8">
                    <AnimatePresence mode="wait">
                        {activeTab === 'general' && (
                            <motion.div
                                key="general"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 border border-gray-100 dark:border-gray-800 shadow-sm space-y-6">
                                    <h2 className="text-xl font-bold flex items-center gap-2">
                                        <FiInfo className="text-primary-500" /> Basic Information
                                    </h2>
                                    <div>
                                        <label className={labelClass}>Property Title *</label>
                                        <input name="title" value={form.title} onChange={handleChange} className={inputClass} placeholder="e.g. Luxury 3BHK Apartment with Sea View" required />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Description *</label>
                                        <textarea name="description" value={form.description} onChange={handleChange} className={`${inputClass} h-40 resize-none`} placeholder="Tell potential buyers what makes this property special..." required />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className={labelClass}>Listing Type</label>
                                            <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
                                                {LISTING_TYPES.map(t => (
                                                    <button
                                                        key={t}
                                                        type="button"
                                                        onClick={() => setForm(prev => ({ ...prev, type: t }))}
                                                        className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
                                                            form.type === t ? 'bg-white dark:bg-gray-700 shadow-sm text-primary-600' : 'text-gray-500'
                                                        }`}
                                                    >
                                                        {t === 'buy' ? 'For Sale' : 'For Rent'}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <label className={labelClass}>Property Status</label>
                                            <select name="status" value={form.status} onChange={handleChange} className={inputClass}>
                                                <option value="available">Available</option>
                                                <option value="sold">Sold</option>
                                                <option value="rented">Rented</option>
                                                <option value="pending">Pending</option>
                                                <option value="draft">Draft</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'details' && (
                            <motion.div
                                key="details"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 border border-gray-100 dark:border-gray-800 shadow-sm space-y-6">
                                    <h2 className="text-xl font-bold flex items-center gap-2">
                                        <FiHome className="text-primary-500" /> Property Details
                                    </h2>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                        <div className="col-span-2 md:col-span-1">
                                            <label className={labelClass}>Price (₹) *</label>
                                            <input name="price" type="number" value={form.price} onChange={handleChange} className={inputClass} required />
                                        </div>
                                        <div>
                                            <label className={labelClass}>Type</label>
                                            <select name="propertyType" value={form.propertyType} onChange={handleChange} className={inputClass}>
                                                {PROPERTY_TYPES.map(t => <option key={t} value={t} className="capitalize">{t}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className={labelClass}>Area ({form.area.unit})</label>
                                            <div className="flex gap-2">
                                                <input name="area.value" type="number" value={form.area.value} onChange={handleChange} className={inputClass} required />
                                                <select name="area.unit" value={form.area.unit} onChange={handleChange} className="w-24 bg-gray-50 dark:bg-gray-800 border-none rounded-xl text-sm font-bold">
                                                    <option value="sqft">sqft</option>
                                                    <option value="sqm">sqm</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div>
                                            <label className={labelClass}>Bedrooms</label>
                                            <input name="bedrooms" type="number" value={form.bedrooms} onChange={handleChange} className={inputClass} required />
                                        </div>
                                        <div>
                                            <label className={labelClass}>Bathrooms</label>
                                            <input name="bathrooms" type="number" value={form.bathrooms} onChange={handleChange} className={inputClass} required />
                                        </div>
                                    </div>

                                    <div>
                                        <label className={labelClass}>Amenities</label>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                            {AMENITIES.map(amenity => (
                                                <button
                                                    key={amenity}
                                                    type="button"
                                                    onClick={() => toggleAmenity(amenity)}
                                                    className={`px-3 py-3 rounded-2xl text-xs font-bold transition-all border-2 text-left flex items-center justify-between ${
                                                        form.amenities.includes(amenity)
                                                            ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-500 text-primary-700 dark:text-primary-300'
                                                            : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-gray-500 hover:border-gray-200'
                                                    }`}
                                                >
                                                    {AMENITY_LABELS[amenity]}
                                                    {form.amenities.includes(amenity) && <FiCheckCircle className="text-primary-500" />}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className={labelClass}>Extra Features</label>
                                        <input 
                                            name="features" 
                                            value={form.features} 
                                            onChange={handleChange} 
                                            className={inputClass} 
                                            placeholder="Comma-separated: e.g. Modular kitchen, Italian flooring, High-speed lift" 
                                        />
                                        <p className="text-[10px] text-gray-400 mt-2 font-medium uppercase tracking-wider">Use commas to separate different features</p>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'location' && (
                            <motion.div
                                key="location"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 border border-gray-100 dark:border-gray-800 shadow-sm space-y-6">
                                    <h2 className="text-xl font-bold flex items-center gap-2">
                                        <FiMapPin className="text-primary-500" /> Location Details
                                    </h2>
                                    <div>
                                        <label className={labelClass}>Full Address *</label>
                                        <input name="location.address" value={form.location.address} onChange={handleChange} className={inputClass} required />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                            </motion.div>
                        )}

                        {activeTab === 'media' && (
                            <motion.div
                                key="media"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 border border-gray-100 dark:border-gray-800 shadow-sm space-y-6">
                                    <h2 className="text-xl font-bold flex items-center gap-2">
                                        <FiImage className="text-primary-500" /> Media Gallery
                                    </h2>

                                    {/* Combined Image Grid */}
                                    {(existingImages.length > 0 || images.length > 0) && (
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                            {existingImages.map((img, i) => (
                                                <div key={`ex-${i}`} className="relative aspect-square rounded-2xl overflow-hidden group shadow-sm border border-gray-100">
                                                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                                                    <button type="button" onClick={() => removeExisting(i)} className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-xl opacity-0 group-hover:opacity-100 transition-all transform hover:scale-110">
                                                        <FiX />
                                                    </button>
                                                    <div className="absolute bottom-0 left-0 right-0 bg-black/40 backdrop-blur-sm text-white text-[10px] py-1 text-center font-bold">EXISTING</div>
                                                </div>
                                            ))}
                                            {images.map((file, i) => (
                                                <div key={`new-${i}`} className="relative aspect-square rounded-2xl overflow-hidden group shadow-sm border border-emerald-100">
                                                    <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover" />
                                                    <button type="button" onClick={() => removeImage(i)} className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-xl opacity-0 group-hover:opacity-100 transition-all transform hover:scale-110">
                                                        <FiX />
                                                    </button>
                                                    <div className="absolute bottom-0 left-0 right-0 bg-emerald-500 text-white text-[10px] py-1 text-center font-bold uppercase">NEW</div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <label className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-3xl cursor-pointer hover:border-primary-400 hover:bg-primary-50/10 transition-all group">
                                        <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-primary-100 group-hover:text-primary-600 transition-colors">
                                            <FiUpload className="w-8 h-8 text-gray-400 group-hover:text-primary-600" />
                                        </div>
                                        <span className="text-base font-bold text-gray-700 dark:text-white">Click to upload images</span>
                                        <span className="text-xs text-gray-500 mt-2">Maximum 10 images • JPG, PNG or WebP</span>
                                        <input type="file" accept="image/*" multiple onChange={handleImageChange} className="hidden" />
                                    </label>

                                    <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-2xl border border-blue-100 dark:border-blue-900/20">
                                        <p className="text-xs text-blue-700 dark:text-blue-400 leading-relaxed">
                                            <b>Pro tip:</b> Properties with 5+ high-quality images receive 3x more inquiries. Make sure to include photos of all rooms and the exterior.
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </form>
            </div>

            {/* Sticky Footer Actions */}
            <div className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-t border-gray-200 dark:border-gray-800 p-4 z-40">
                <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        {activeTab !== 'general' && (
                            <button
                                type="button"
                                onClick={() => {
                                    const currIdx = TABS.findIndex(t => t.id === activeTab);
                                    setActiveTab(TABS[currIdx - 1].id);
                                }}
                                className="px-6 py-3 rounded-xl font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            >
                                Back
                            </button>
                        )}
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => navigate('/agent')}
                            className="hidden sm:block px-6 py-3 font-bold text-gray-400 hover:text-gray-600"
                        >
                            Cancel
                        </button>
                        {activeTab !== 'media' ? (
                            <button
                                type="button"
                                onClick={() => {
                                    const currIdx = TABS.findIndex(t => t.id === activeTab);
                                    setActiveTab(TABS[currIdx + 1].id);
                                }}
                                className="px-8 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold rounded-xl flex items-center gap-2"
                            >
                                Next Step <FiChevronRight />
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={loading}
                                className="px-10 py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl shadow-lg shadow-primary-500/25 disabled:opacity-50 flex items-center gap-2"
                            >
                                {loading ? 'Saving...' : <><FiSave /> Save Property</>}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddEditProperty;

