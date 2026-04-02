import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    FiUpload, FiX, FiSave, FiArrowLeft, FiHome, 
    FiMapPin, FiInfo, FiImage, FiCheckCircle, FiChevronRight,
    FiPlus, FiMinus, FiLayout, FiMaximize, FiShield, FiTag
} from 'react-icons/fi';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const PROPERTY_TYPES = ['apartment', 'house', 'villa', 'commercial', 'plot', 'penthouse'];
const LISTING_TYPES = ['buy', 'rent'];
const AMENITIES = [
    'parking', 'gym', 'pool', 'garden', 'security',
    'elevator', 'power_backup', 'water_supply', 'clubhouse',
    'playground', 'wifi', 'ac', 'furnished', 'pet_friendly',
    'balcony', 'terrace', 'storage', 'cctv', 'intercom',
];
const AMENITY_LABELS = {
    parking: 'Parking', gym: 'Gym', pool: 'Pool', garden: 'Garden',
    security: 'Security', elevator: 'Elevator', power_backup: 'Power Backup',
    water_supply: 'Water Supply', clubhouse: 'Clubhouse', playground: 'Playground',
    wifi: 'WiFi', ac: 'AC', furnished: 'Furnished', pet_friendly: 'Pet Friendly',
    balcony: 'Balcony', terrace: 'Terrace', storage: 'Storage',
    cctv: 'CCTV', intercom: 'Intercom',
};

const TABS = [
    { id: 'general', label: 'Basics', icon: <FiInfo /> },
    { id: 'details', label: 'Details', icon: <FiLayout /> },
    { id: 'location', label: 'Location', icon: <FiMapPin /> },
    { id: 'media', label: 'Media', icon: <FiImage /> },
];

const AddEditProperty = () => {
    const { id } = useParams();
    const isEdit = Boolean(id);
    const navigate = useNavigate();
    const { isAdmin, isAgent } = useAuth();
    
    // Determine where to go back
    const backPath = useMemo(() => {
        if (isAdmin) return '/admin/properties';
        if (isAgent) return '/agent';
        return '/profile';
    }, [isAdmin, isAgent]);

    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('general');
    const [images, setImages] = useState([]);
    const [existingImages, setExistingImages] = useState([]);
    const [form, setForm] = useState({
        title: '', description: '', price: '',
        type: 'buy', propertyType: 'apartment',
        bedrooms: 0, bathrooms: 0,
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
                        bedrooms: p.bedrooms || 0, bathrooms: p.bathrooms || 0,
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
                    navigate(backPath);
                }
            })();
        }
    }, [id, isEdit, navigate, backPath]);

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

            navigate(backPath);
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
                <div className="max-w-6xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate(backPath)}
                            className="p-2.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors text-gray-500"
                        >
                            <FiArrowLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <h1 className="text-xl font-black text-gray-900 dark:text-white tracking-tight leading-none">
                                {isEdit ? 'Edit Property' : 'List New Property'}
                            </h1>
                            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-1.5 flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary-500" />
                                {isAdmin ? 'Admin Dashboard' : 'Agent Portal'}
                            </p>
                        </div>
                    </div>
                    
                    {/* Progress Tabs */}
                    <div className="hidden lg:flex items-center gap-2">
                        {TABS.map((tab, idx) => (
                            <React.Fragment key={tab.id}>
                                <button
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2.5 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                                        activeTab === tab.id 
                                            ? 'text-primary-600 bg-primary-50 dark:bg-primary-900/20' 
                                            : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                                    }`}
                                >
                                    <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs border-2 ${
                                        activeTab === tab.id 
                                            ? 'bg-primary-600 border-primary-600 text-white shadow-lg shadow-primary-500/20' 
                                            : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-gray-400'
                                    }`}>
                                        {idx + 1}
                                    </span>
                                    {tab.label}
                                </button>
                                {idx < TABS.length - 1 && <div className="w-6 h-px bg-gray-200 dark:bg-gray-800" />}
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 mt-10">
                <form onSubmit={handleSubmit} className="space-y-8">
                    <AnimatePresence mode="wait">
                        {activeTab === 'general' && (
                            <motion.div
                                key="general"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="space-y-6"
                            >
                                <div className="bg-white dark:bg-gray-900 rounded-[2rem] p-8 sm:p-10 border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-200/20 dark:shadow-none space-y-8">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-2xl flex items-center justify-center text-primary-600">
                                            <FiInfo className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-black text-gray-900 dark:text-white">Basic Information</h2>
                                            <p className="text-sm text-gray-500">Provide the essential details about the property</p>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div>
                                            <label className={labelClass}>Property Title *</label>
                                            <input name="title" value={form.title} onChange={handleChange} className={inputClass} placeholder="e.g. Luxury 3BHK Apartment with Sea View" required />
                                            <p className="text-[11px] text-gray-400 mt-2 font-medium">Use a descriptive title that highlights key features.</p>
                                        </div>
                                        
                                        <div>
                                            <label className={labelClass}>Description *</label>
                                            <textarea name="description" value={form.description} onChange={handleChange} className={`${inputClass} h-48 resize-none`} placeholder="Tell potential buyers what makes this property special..." required />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
                                            <div className="space-y-3">
                                                <label className={labelClass}>Listing Type</label>
                                                <div className="flex bg-gray-100 dark:bg-gray-800 p-1.5 rounded-2xl border border-gray-200 dark:border-gray-700">
                                                    {LISTING_TYPES.map(t => (
                                                        <button
                                                            key={t}
                                                            type="button"
                                                            onClick={() => setForm(prev => ({ ...prev, type: t }))}
                                                            className={`flex-1 py-3 rounded-xl text-sm font-black transition-all ${
                                                                form.type === t 
                                                                    ? 'bg-white dark:bg-gray-700 shadow-lg text-primary-600' 
                                                                    : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                                                            }`}
                                                        >
                                                            {t === 'buy' ? 'For Sale' : 'For Rent'}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                            
                                            <div className="space-y-3">
                                                <label className={labelClass}>Availability Status</label>
                                                <div className="relative">
                                                    <select name="status" value={form.status} onChange={handleChange} className={`${inputClass} appearance-none pr-10`}>
                                                        <option value="available">Available</option>
                                                        <option value="sold">Sold</option>
                                                        <option value="rented">Rented</option>
                                                        <option value="pending">Under Contract</option>
                                                        <option value="draft">Draft / Hidden</option>
                                                    </select>
                                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                                        <FiChevronRight className="rotate-90 w-4 h-4" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'details' && (
                            <motion.div
                                key="details"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="space-y-6"
                            >
                                <div className="bg-white dark:bg-gray-900 rounded-[2rem] p-8 sm:p-10 border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-200/20 dark:shadow-none space-y-10">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-2xl flex items-center justify-center text-primary-600">
                                            <FiLayout className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-black text-gray-900 dark:text-white">Property Specs</h2>
                                            <p className="text-sm text-gray-500">Define the physical characteristics and amenities</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                                        <div className="space-y-2">
                                            <label className={labelClass}>Price (₹) *</label>
                                            <div className="relative">
                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
                                                <input name="price" type="number" value={form.price} onChange={handleChange} className={`${inputClass} pl-10`} placeholder="0" required />
                                            </div>
                                        </div>
                                        
                                        <div className="space-y-2">
                                            <label className={labelClass}>Category</label>
                                            <select name="propertyType" value={form.propertyType} onChange={handleChange} className={inputClass}>
                                                {PROPERTY_TYPES.map(t => <option key={t} value={t} className="capitalize">{t}</option>)}
                                            </select>
                                        </div>

                                        <div className="space-y-2">
                                            <label className={labelClass}>Area Space</label>
                                            <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-2xl border border-gray-200 dark:border-gray-700">
                                                <input name="area.value" type="number" value={form.area.value} onChange={handleChange} className="flex-1 bg-transparent border-none focus:ring-0 px-3 py-2 text-gray-900 dark:text-white font-bold" placeholder="Value" required />
                                                <select name="area.unit" value={form.area.unit} onChange={handleChange} className="w-20 bg-white dark:bg-gray-700 rounded-xl text-xs font-black shadow-sm outline-none border-none">
                                                    <option value="sqft">Sq.Ft</option>
                                                    <option value="sqm">Sq.M</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-8">
                                        <div className="space-y-4">
                                            <label className={labelClass}>Bedrooms</label>
                                            <div className="flex items-center gap-4 bg-gray-50 dark:bg-gray-800/50 p-2 rounded-2xl border border-gray-100 dark:border-gray-800">
                                                <button type="button" onClick={() => setForm(f => ({...f, bedrooms: Math.max(0, f.bedrooms - 1)}))} className="w-10 h-10 rounded-xl bg-white dark:bg-gray-700 flex items-center justify-center text-gray-500 hover:text-primary-600 shadow-sm border border-gray-100 dark:border-gray-600"><FiMinus /></button>
                                                <span className="flex-1 text-center font-black text-lg">{form.bedrooms}</span>
                                                <button type="button" onClick={() => setForm(f => ({...f, bedrooms: f.bedrooms + 1}))} className="w-10 h-10 rounded-xl bg-white dark:bg-gray-700 flex items-center justify-center text-gray-500 hover:text-primary-600 shadow-sm border border-gray-100 dark:border-gray-600"><FiPlus /></button>
                                            </div>
                                        </div>
                                        
                                        <div className="space-y-4">
                                            <label className={labelClass}>Bathrooms</label>
                                            <div className="flex items-center gap-4 bg-gray-50 dark:bg-gray-800/50 p-2 rounded-2xl border border-gray-100 dark:border-gray-800">
                                                <button type="button" onClick={() => setForm(f => ({...f, bathrooms: Math.max(0, f.bathrooms - 1)}))} className="w-10 h-10 rounded-xl bg-white dark:bg-gray-700 flex items-center justify-center text-gray-500 hover:text-primary-600 shadow-sm border border-gray-100 dark:border-gray-600"><FiMinus /></button>
                                                <span className="flex-1 text-center font-black text-lg">{form.bathrooms}</span>
                                                <button type="button" onClick={() => setForm(f => ({...f, bathrooms: f.bathrooms + 1}))} className="w-10 h-10 rounded-xl bg-white dark:bg-gray-700 flex items-center justify-center text-gray-500 hover:text-primary-600 shadow-sm border border-gray-100 dark:border-gray-600"><FiPlus /></button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <label className={labelClass}>Premium Amenities</label>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                                            {AMENITIES.map(amenity => (
                                                <button
                                                    key={amenity}
                                                    type="button"
                                                    onClick={() => toggleAmenity(amenity)}
                                                    className={`px-4 py-4 rounded-2xl text-[11px] font-black transition-all border-2 text-left space-y-2 group ${
                                                        form.amenities.includes(amenity)
                                                            ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-500 text-primary-700 dark:text-primary-300 shadow-md shadow-primary-500/10'
                                                            : 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 text-gray-400 hover:border-gray-200 dark:hover:border-gray-700'
                                                    }`}
                                                >
                                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-1 transition-colors ${
                                                        form.amenities.includes(amenity) ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-400 group-hover:text-gray-600'
                                                    }`}>
                                                        <FiCheckCircle className={form.amenities.includes(amenity) ? 'block' : 'hidden'} />
                                                        {!form.amenities.includes(amenity) && <FiTag />}
                                                    </div>
                                                    {AMENITY_LABELS[amenity]}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <label className={labelClass}>Key Features & Tags</label>
                                        <div className="relative">
                                            <FiTag className="absolute left-4 top-4 text-gray-400" />
                                            <input 
                                                name="features" 
                                                value={form.features} 
                                                onChange={handleChange} 
                                                className={`${inputClass} pl-12`}
                                                placeholder="e.g. Modular kitchen, Italian flooring, High-speed lift" 
                                            />
                                        </div>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1.5 px-1">
                                            <span className="w-1 h-1 rounded-full bg-gray-300" />
                                            Separate each feature with a comma
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'location' && (
                            <motion.div
                                key="location"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="space-y-6"
                            >
                                <div className="bg-white dark:bg-gray-900 rounded-[2rem] p-8 sm:p-10 border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-200/20 dark:shadow-none space-y-10">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-2xl flex items-center justify-center text-primary-600">
                                            <FiMapPin className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-black text-gray-900 dark:text-white">Location Details</h2>
                                            <p className="text-sm text-gray-500">Help buyers find your property on the map</p>
                                        </div>
                                    </div>

                                    <div className="space-y-8">
                                        <div className="space-y-3">
                                            <label className={labelClass}>Full Address *</label>
                                            <div className="relative">
                                                <FiMapPin className="absolute left-4 top-4 text-gray-400" />
                                                <input name="location.address" value={form.location.address} onChange={handleChange} className={`${inputClass} pl-12`} placeholder="House/Flat No, Building, Area" required />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                            <div className="space-y-3">
                                                <label className={labelClass}>City *</label>
                                                <input name="location.city" value={form.location.city} onChange={handleChange} className={inputClass} placeholder="Mumbai" required />
                                            </div>
                                            <div className="space-y-3">
                                                <label className={labelClass}>State *</label>
                                                <input name="location.state" value={form.location.state} onChange={handleChange} className={inputClass} placeholder="Maharashtra" required />
                                            </div>
                                            <div className="space-y-3">
                                                <label className={labelClass}>Pincode *</label>
                                                <input name="location.pincode" value={form.location.pincode} onChange={handleChange} className={inputClass} placeholder="400001" maxLength={6} required />
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-3xl border border-dashed border-gray-200 dark:border-gray-700 flex items-center gap-6">
                                        <div className="w-16 h-16 rounded-2xl bg-white dark:bg-gray-800 flex items-center justify-center text-primary-600 shadow-sm shrink-0">
                                            <FiMaximize className="w-8 h-8 opacity-40" />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-black text-gray-900 dark:text-white mb-1">Geocoding & Maps</h4>
                                            <p className="text-xs text-gray-500 leading-relaxed">Our system automatically determines the precise coordinates for your property based on the address provided. Make sure it's accurate!</p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'media' && (
                            <motion.div
                                key="media"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="space-y-6"
                            >
                                <div className="bg-white dark:bg-gray-900 rounded-[2rem] p-8 sm:p-10 border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-200/20 dark:shadow-none space-y-10">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-2xl flex items-center justify-center text-primary-600">
                                            <FiImage className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-black text-gray-900 dark:text-white">Media Gallery</h2>
                                            <p className="text-sm text-gray-500">Visuals are the most important part of your listing</p>
                                        </div>
                                    </div>

                                    <div className="space-y-8">
                                        {(existingImages.length > 0 || images.length > 0) && (
                                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                                                {existingImages.map((img, i) => (
                                                    <div key={`ex-${i}`} className="relative aspect-square rounded-[1.5rem] overflow-hidden group shadow-md border border-gray-100 dark:border-gray-800">
                                                        <img src={img.url} alt="" className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500" />
                                                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                        <button type="button" onClick={() => removeExisting(i)} className="absolute top-2 right-2 bg-red-500 text-white w-8 h-8 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all transform hover:scale-110 shadow-lg">
                                                            <FiX />
                                                        </button>
                                                        <div className="absolute bottom-0 left-0 right-0 bg-white/90 dark:bg-black/80 backdrop-blur-sm text-gray-900 dark:text-white text-[9px] py-1.5 text-center font-black uppercase tracking-widest">ORIGINAL</div>
                                                    </div>
                                                ))}
                                                {images.map((file, i) => (
                                                    <div key={`new-${i}`} className="relative aspect-square rounded-[1.5rem] overflow-hidden group shadow-md border-2 border-primary-100 dark:border-primary-900/30">
                                                        <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500" />
                                                        <div className="absolute inset-0 bg-primary-600/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                        <button type="button" onClick={() => removeImage(i)} className="absolute top-2 right-2 bg-red-500 text-white w-8 h-8 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all transform hover:scale-110 shadow-lg">
                                                            <FiX />
                                                        </button>
                                                        <div className="absolute bottom-0 left-0 right-0 bg-primary-600 text-white text-[9px] py-1.5 text-center font-black uppercase tracking-widest">NEW BATCH</div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        <label className="flex flex-col items-center justify-center py-16 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-[2.5rem] cursor-pointer hover:border-primary-500 hover:bg-primary-50/10 transition-all group relative overflow-hidden">
                                            <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                            <div className="w-20 h-20 bg-gray-50 dark:bg-gray-800 rounded-3xl flex items-center justify-center mb-5 group-hover:bg-primary-100 dark:group-hover:bg-primary-900/30 group-hover:text-primary-600 transition-all group-hover:-translate-y-1 shadow-sm">
                                                <FiUpload className="w-10 h-10 text-gray-400 group-hover:text-primary-600 transition-colors" />
                                            </div>
                                            <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">Drop images here</h3>
                                            <p className="text-sm text-gray-500 font-medium">Click to browse your device</p>
                                            <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest mt-6 bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-full">Max 10 files • High resolution</p>
                                            <input type="file" accept="image/*" multiple onChange={handleImageChange} className="hidden" />
                                        </label>

                                        <div className="flex items-start gap-4 p-6 bg-amber-50 dark:bg-amber-900/10 rounded-[2rem] border border-amber-100 dark:border-amber-900/20">
                                            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 shrink-0">
                                                <FiShield className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-black text-amber-900 dark:text-amber-400 mb-1">Quality Standards</h4>
                                                <p className="text-[11px] text-amber-700 dark:text-amber-500/80 leading-relaxed font-medium">
                                                    Listings with professional-grade photography receive up to <b>80% more inquiries</b>. Ensure your photos are bright, wide-angle, and clear of watermarks.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </form>
            </div>

            {/* Sticky Footer Actions */}
            <div className="fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-gray-900/95 backdrop-blur-xl border-t border-gray-100 dark:border-gray-800 p-5 sm:p-6 z-40">
                <div className="max-w-5xl mx-auto flex items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        {activeTab !== 'general' ? (
                            <button
                                type="button"
                                onClick={() => {
                                    const currIdx = TABS.findIndex(t => t.id === activeTab);
                                    setActiveTab(TABS[currIdx - 1].id);
                                }}
                                className="px-6 py-3.5 rounded-2xl font-black text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all flex items-center gap-2"
                            >
                                <FiArrowLeft /> Previous
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={() => navigate(backPath)}
                                className="px-6 py-3.5 rounded-2xl font-black text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-all"
                            >
                                Cancel Listing
                            </button>
                        )}
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <button
                            type="button"
                            onClick={() => navigate(backPath)}
                            className="hidden md:flex px-6 py-3.5 rounded-2xl font-black text-gray-400 hover:text-gray-600 transition-all"
                        >
                            Discard
                        </button>
                        
                        {activeTab !== 'media' ? (
                            <button
                                type="button"
                                onClick={() => {
                                    const currIdx = TABS.findIndex(t => t.id === activeTab);
                                    setActiveTab(TABS[currIdx + 1].id);
                                }}
                                className="px-10 py-3.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-black rounded-2xl flex items-center gap-3 shadow-xl shadow-gray-400/20 dark:shadow-none transition-all hover:-translate-y-0.5 active:translate-y-0"
                            >
                                Next Step <FiChevronRight />
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={loading}
                                className="px-12 py-3.5 bg-primary-600 hover:bg-primary-700 text-white font-black rounded-2xl shadow-xl shadow-primary-500/25 disabled:opacity-50 flex items-center gap-3 transition-all hover:-translate-y-0.5 active:translate-y-0"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <><FiSave /> Publish Listing</>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddEditProperty;

