import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
    FiEdit2, FiTrash2, FiEye, FiSearch, FiStar, FiRefreshCw,
    FiChevronLeft, FiChevronRight, FiMapPin, FiHome, FiPlus
} from 'react-icons/fi';
import api from '../../services/api';
import toast from 'react-hot-toast';
import PropertyDetails from '../properties/PropertyDetails';

const fmtPrice = (n) => {
    if (!n) return '—';
    if (n >= 10000000) return '₹' + (n/10000000).toFixed(1) + 'Cr';
    if (n >= 100000)   return '₹' + (n/100000).toFixed(1) + 'L';
    return '₹' + n.toLocaleString('en-IN');
};

const STATUS_COLORS = {
    available: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    sold:      'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    rented:    'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    pending:   'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    draft:     'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
};

const PropertyManagement = () => {
    const [properties, setProperties] = useState([]);
    const [loading,    setLoading]    = useState(true);
    const [search,     setSearch]     = useState('');
    const [status,     setStatus]     = useState('');
    const [type,       setType]       = useState('');
    const [page,       setPage]       = useState(1);
    const [total,      setTotal]      = useState(0);
    const [pages,      setPages]      = useState(1);
    const [preview,    setPreview]    = useState(null);
    const [toggling,   setToggling]   = useState(null);
    const LIMIT = 15;

    const fetchProperties = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/admin/properties', { params: { search, status, type, page, limit: LIMIT } });
            setProperties(data.properties || []);
            setTotal(data.total || 0);
            setPages(data.pages || 1);
        } catch { toast.error('Failed to load properties'); }
        finally { setLoading(false); }
    }, [search, status, type, page]);

    useEffect(() => { fetchProperties(); }, [fetchProperties]);
    useEffect(() => { setPage(1); }, [search, status, type]);
    useEffect(() => {
        document.body.style.overflow = preview ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [preview]);

    const handleDelete = async (id, title) => {
        if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
        try {
            await api.delete(`/properties/${id}`);
            toast.success('Property deleted');
            fetchProperties();
        } catch { toast.error('Failed to delete property'); }
    };

    const handleToggleFeatured = async (id) => {
        setToggling(id);
        try {
            const { data } = await api.put(`/admin/properties/${id}/feature`);
            setProperties(prev => prev.map(p => p._id === id ? { ...p, featured: data.featured } : p));
            toast.success(data.featured ? 'Marked as Featured' : 'Removed Featured badge');
        } catch { toast.error('Failed to update'); }
        finally { setToggling(null); }
    };

    const handleStatusChange = async (id, newStatus) => {
        try {
            await api.put(`/admin/properties/${id}/status`, { status: newStatus });
            setProperties(prev => prev.map(p => p._id === id ? { ...p, status: newStatus } : p));
            toast.success('Status updated');
        } catch { toast.error('Failed to update status'); }
    };

    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 dark:text-white">Properties</h1>
                    <p className="text-sm text-gray-500 mt-0.5">{total} total listings</p>
                </div>
                <div className="flex gap-2 self-start sm:self-auto">
                    <button onClick={fetchProperties} className="btn-secondary text-sm flex items-center gap-2">
                        <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                    <Link to="/admin/add-property" className="btn-primary text-sm flex items-center gap-2">
                        <FiPlus className="w-4 h-4" /> Add Property
                    </Link>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 flex flex-wrap gap-3">
                <div className="relative flex-1 min-w-[180px]">
                    <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Search title or city…"
                        className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none text-gray-900 dark:text-white placeholder-gray-400 min-h-0" />
                </div>
                <select value={status} onChange={e => setStatus(e.target.value)}
                    className="py-2.5 px-3 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none text-gray-900 dark:text-white min-h-0">
                    <option value="">All Status</option>
                    <option value="available">Available</option>
                    <option value="sold">Sold</option>
                    <option value="rented">Rented</option>
                    <option value="pending">Pending</option>
                    <option value="draft">Draft</option>
                </select>
                <select value={type} onChange={e => setType(e.target.value)}
                    className="py-2.5 px-3 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none text-gray-900 dark:text-white min-h-0">
                    <option value="">All Types</option>
                    <option value="buy">For Sale</option>
                    <option value="rent">For Rent</option>
                </select>
            </div>

            {/* Desktop Table */}
            <div className="hidden lg:block bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-800/60 border-b border-gray-100 dark:border-gray-800">
                        <tr>
                            {['Property', 'Price', 'Status', 'Agent', 'Featured', 'Actions'].map(h => (
                                <th key={h} className="px-5 py-3.5 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                        {loading ? Array(5).fill(0).map((_, i) => (
                            <tr key={i}>{[1,2,3,4,5,6].map(j => (
                                <td key={j} className="px-5 py-4"><div className="h-4 skeleton rounded" /></td>
                            ))}</tr>
                        )) : properties.length === 0 ? (
                            <tr><td colSpan={6} className="px-5 py-12 text-center text-gray-400 text-sm">No properties found</td></tr>
                        ) : properties.map(p => (
                            <tr key={p._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                                <td className="px-5 py-3.5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-11 h-11 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0">
                                            {p.images?.[0]?.url
                                                ? <img src={p.images[0].url} alt="" className="w-full h-full object-cover" />
                                                : <FiHome className="w-5 h-5 m-3 text-gray-400" />
                                            }
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate max-w-[200px]">{p.title}</p>
                                            <p className="text-xs text-gray-400 flex items-center gap-1"><FiMapPin className="w-3 h-3" />{p.location?.city}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-5 py-3.5 text-sm font-bold text-primary-600">{fmtPrice(p.price)}</td>
                                <td className="px-5 py-3.5">
                                    <select value={p.status} onChange={e => handleStatusChange(p._id, e.target.value)}
                                        className={`text-[11px] font-bold px-2 py-1 rounded-lg border-0 outline-none cursor-pointer ${STATUS_COLORS[p.status] || STATUS_COLORS.draft}`}>
                                        {['available','sold','rented','pending','draft'].map(s => (
                                            <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>
                                        ))}
                                    </select>
                                </td>
                                <td className="px-5 py-3.5 text-xs text-gray-500">{p.createdBy?.name || '—'}</td>
                                <td className="px-5 py-3.5">
                                    <button onClick={() => handleToggleFeatured(p._id)} disabled={toggling === p._id}
                                        className={`p-1.5 rounded-lg transition-colors min-h-0 ${p.featured ? 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' : 'text-gray-300 hover:text-yellow-400 hover:bg-yellow-50'}`}>
                                        <FiStar className={`w-4 h-4 ${p.featured ? 'fill-current' : ''}`} />
                                    </button>
                                </td>
                                <td className="px-5 py-3.5">
                                    <div className="flex items-center gap-1">
                                        <button onClick={() => setPreview(p)} className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors min-h-0" title="Preview">
                                            <FiEye className="w-4 h-4" />
                                        </button>
                                        <Link to={`/admin/edit-property/${p._id}`} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors min-h-0" title="Edit">
                                            <FiEdit2 className="w-4 h-4" />
                                        </Link>
                                        <button onClick={() => handleDelete(p._id, p.title)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors min-h-0" title="Delete">
                                            <FiTrash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden space-y-3">
                {loading ? Array(3).fill(0).map((_,i) => <div key={i} className="h-36 skeleton rounded-2xl" />) :
                properties.length === 0 ? (
                    <div className="text-center py-12 text-gray-400 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">No properties found</div>
                ) : properties.map(p => (
                    <div key={p._id} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 flex gap-3">
                        <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0">
                            {p.images?.[0]?.url ? <img src={p.images[0].url} alt="" className="w-full h-full object-cover" /> : <FiHome className="w-6 h-6 m-4 text-gray-400" />}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{p.title}</p>
                            <p className="text-xs text-gray-400">{p.location?.city} · {p.createdBy?.name}</p>
                            <div className="flex items-center gap-2 mt-2">
                                <span className="text-sm font-bold text-primary-600">{fmtPrice(p.price)}</span>
                                <span className={`text-[10px] px-2 py-0.5 rounded-lg font-bold capitalize ${STATUS_COLORS[p.status]}`}>{p.status}</span>
                            </div>
                        </div>
                        <div className="flex flex-col gap-1 flex-shrink-0">
                            <button onClick={() => setPreview(p)} className="p-1.5 text-gray-400 hover:text-primary-600 min-h-0"><FiEye className="w-4 h-4" /></button>
                            <Link to={`/admin/edit-property/${p._id}`} className="p-1.5 text-gray-400 hover:text-blue-600 min-h-0"><FiEdit2 className="w-4 h-4" /></Link>
                            <button onClick={() => handleDelete(p._id, p.title)} className="p-1.5 text-red-400 min-h-0"><FiTrash2 className="w-4 h-4" /></button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Pagination */}
            {pages > 1 && (
                <div className="flex items-center justify-between bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 px-4 py-3">
                    <p className="text-xs text-gray-500">Page {page} of {pages} · {total} properties</p>
                    <div className="flex gap-2">
                        <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1}
                            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 min-h-0 text-gray-600 dark:text-gray-300">
                            <FiChevronLeft className="w-4 h-4" />
                        </button>
                        <button onClick={() => setPage(p => Math.min(pages, p+1))} disabled={page === pages}
                            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 min-h-0 text-gray-600 dark:text-gray-300">
                            <FiChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* Preview Modal */}
            <AnimatePresence>
                {preview && (
                    <div className="fixed inset-0 z-[1100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm"
                        onClick={() => setPreview(null)}>
                        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
                            className="w-full sm:max-w-5xl h-[92vh] sm:h-[88vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl shadow-2xl no-scrollbar bg-white dark:bg-gray-900"
                            onClick={e => e.stopPropagation()}>
                            <PropertyDetails property={preview} onClose={() => setPreview(null)} />
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default PropertyManagement;
