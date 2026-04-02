import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiTrash2, FiSearch, FiUser, FiMail, FiCalendar, FiPlus,
    FiShield, FiCheckCircle, FiXCircle, FiChevronLeft, FiChevronRight, FiRefreshCw, FiLock, FiX
} from 'react-icons/fi';
import api from '../../services/api';
import toast from 'react-hot-toast';

const ROLE_COLORS = {
    admin:  'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
    agent:  'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    user:   'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
};

const Avatar = ({ user }) => (
    <div className="w-9 h-9 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center text-primary-600 font-bold text-sm flex-shrink-0 overflow-hidden">
        {user.avatar ? <img src={user.avatar} alt="" className="w-full h-full object-cover" /> : user.name?.charAt(0)?.toUpperCase()}
    </div>
);

const UserManagement = () => {
    const [users,    setUsers]    = useState([]);
    const [loading,  setLoading]  = useState(true);
    const [search,   setSearch]   = useState('');
    const [role,     setRole]     = useState('');
    const [page,     setPage]     = useState(1);
    const [total,    setTotal]    = useState(0);
    const [pages,    setPages]    = useState(1);
    const [updating, setUpdating] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'user', isVerified: true });
    
    const LIMIT = 15;

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/admin/users', { params: { search, role, page, limit: LIMIT } });
            setUsers(data.users || []);
            setTotal(data.total || 0);
            setPages(data.pages || 1);
        } catch { toast.error('Failed to load users'); }
        finally { setLoading(false); }
    }, [search, role, page]);

    useEffect(() => { fetchUsers(); }, [fetchUsers]);
    useEffect(() => { setPage(1); }, [search, role]);

    const handleRoleChange = async (userId, newRole) => {
        if (!window.confirm(`Change this user's role to "${newRole}"?`)) return;
        setUpdating(userId);
        try {
            await api.put(`/admin/users/${userId}`, { role: newRole });
            setUsers(prev => prev.map(u => u._id === userId ? { ...u, role: newRole } : u));
            toast.success('Role updated');
        } catch (err) { toast.error(err.response?.data?.error || 'Failed to update role'); }
        finally { setUpdating(null); }
    };

    const handleVerify = async (userId, current) => {
        setUpdating(userId);
        try {
            await api.put(`/admin/users/${userId}`, { isVerified: !current });
            setUsers(prev => prev.map(u => u._id === userId ? { ...u, isVerified: !current } : u));
            toast.success(!current ? 'User verified' : 'Verification removed');
        } catch { toast.error('Failed to update'); }
        finally { setUpdating(null); }
    };

    const handleDelete = async (userId, name) => {
        if (!window.confirm(`Delete ${name}? This cannot be undone.`)) return;
        try {
            await api.delete(`/admin/users/${userId}`);
            toast.success('User deleted');
            fetchUsers();
        } catch (err) { toast.error(err.response?.data?.error || 'Failed to delete'); }
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        setUpdating('creating');
        try {
            await api.post('/admin/users', newUser);
            toast.success('User created successfully');
            setShowAddModal(false);
            setNewUser({ name: '', email: '', password: '', role: 'user', isVerified: true });
            fetchUsers();
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to create user');
        } finally {
            setUpdating(null);
        }
    };

    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 dark:text-white leading-none">Users</h1>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-2">{total} Total Accounts</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={fetchUsers} className="btn-secondary text-sm flex items-center gap-2 min-h-0 py-2">
                        <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                    <button onClick={() => setShowAddModal(true)} className="btn-primary text-sm flex items-center gap-2 min-h-0 py-2">
                        <FiPlus className="w-4 h-4" /> Add User
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 flex flex-col sm:flex-row gap-3 shadow-sm">
                <div className="relative flex-1">
                    <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search name or email…"
                        className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none text-gray-900 dark:text-white placeholder-gray-400 min-h-0"
                    />
                </div>
                <select
                    value={role}
                    onChange={e => setRole(e.target.value)}
                    className="py-2.5 px-4 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none text-gray-900 dark:text-white min-h-0 font-bold"
                >
                    <option value="">All Roles</option>
                    <option value="user">Regular Users</option>
                    <option value="agent">Real Estate Agents</option>
                    <option value="admin">Administrators</option>
                </select>
            </div>

            {/* Desktop Table */}
            <div className="hidden lg:block bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">
                <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-800/60 border-b border-gray-100 dark:border-gray-800">
                        <tr>
                            {['User Profile', 'Account Role', 'Status', 'Registration', 'Actions'].map(h => (
                                <th key={h} className="px-5 py-4 text-left text-[11px] font-black text-gray-400 uppercase tracking-widest">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                        {loading ? (
                            Array(5).fill(0).map((_, i) => (
                                <tr key={i}>
                                    {[1,2,3,4,5].map(j => (
                                        <td key={j} className="px-5 py-4"><div className="h-4 skeleton rounded w-full" /></td>
                                    ))}
                                </tr>
                            ))
                        ) : users.length === 0 ? (
                            <tr><td colSpan={5} className="px-5 py-16 text-center text-gray-400 text-sm font-medium italic">No accounts matching your criteria</td></tr>
                        ) : users.map(user => (
                            <tr key={user._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-all duration-200 group">
                                <td className="px-5 py-3.5">
                                    <div className="flex items-center gap-3">
                                        <Avatar user={user} />
                                        <div className="min-w-0">
                                            <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{user.name}</p>
                                            <p className="text-[11px] text-gray-400 flex items-center gap-1 font-medium truncate"><FiMail className="w-3 h-3" />{user.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-5 py-3.5">
                                    <select
                                        value={user.role}
                                        disabled={user.role === 'admin' || updating === user._id}
                                        onChange={e => handleRoleChange(user._id, e.target.value)}
                                        className={`text-[11px] px-2.5 py-1 rounded-lg font-black cursor-pointer outline-none border-0 shadow-sm ${ROLE_COLORS[user.role] || ROLE_COLORS.user}`}
                                    >
                                        <option value="user">USER</option>
                                        <option value="agent">AGENT</option>
                                        <option value="admin">ADMIN</option>
                                    </select>
                                </td>
                                <td className="px-5 py-3.5">
                                    <button onClick={() => handleVerify(user._id, user.isVerified)} disabled={updating === user._id}
                                        className={`flex items-center gap-2 text-[10px] font-black px-3 py-1 rounded-lg transition-all shadow-sm uppercase tracking-wider ${
                                            user.isVerified
                                                ? 'text-green-600 bg-green-50 dark:bg-green-900/20 hover:bg-green-100'
                                                : 'text-red-500 bg-red-50 dark:bg-red-900/20 hover:bg-red-100'
                                        }`}>
                                        {user.isVerified ? <FiCheckCircle className="w-3.5 h-3.5" /> : <FiXCircle className="w-3.5 h-3.5" />}
                                        {user.isVerified ? 'Verified' : 'Unverified'}
                                    </button>
                                </td>
                                <td className="px-5 py-3.5 text-xs text-gray-500 font-bold">
                                    {new Date(user.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                </td>
                                <td className="px-5 py-3.5">
                                    {user.role !== 'admin' && (
                                        <button onClick={() => handleDelete(user._id, user.name)} disabled={updating === user._id}
                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all min-h-0 opacity-0 group-hover:opacity-100">
                                            <FiTrash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden space-y-3">
                {loading ? (
                    Array(3).fill(0).map((_, i) => <div key={i} className="h-32 skeleton rounded-2xl" />)
                ) : users.length === 0 ? (
                    <div className="text-center py-12 text-gray-400 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">No users found</div>
                ) : users.map(user => (
                    <div key={user._id} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <Avatar user={user} />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{user.name}</p>
                                <p className="text-xs text-gray-400 truncate font-medium">{user.email}</p>
                            </div>
                            <span className={`text-[10px] px-2.5 py-1 rounded-lg font-black uppercase tracking-wider flex-shrink-0 shadow-sm ${ROLE_COLORS[user.role]}`}>{user.role}</span>
                        </div>
                        <div className="flex items-center justify-between pt-4 border-t border-gray-50 dark:border-gray-800">
                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                <FiCalendar className="w-3.5 h-3.5" />
                                {new Date(user.createdAt).toLocaleDateString('en-GB')}
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={() => handleVerify(user._id, user.isVerified)}
                                    className={`text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider shadow-sm ${user.isVerified ? 'text-green-600 bg-green-50' : 'text-red-500 bg-red-50'} min-h-0`}>
                                    {user.isVerified ? 'Verified ✓' : 'Unverified'}
                                </button>
                                {user.role !== 'admin' && (
                                    <button onClick={() => handleDelete(user._id, user.name)}
                                        className="p-1.5 text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg min-h-0 transition-colors">
                                        <FiTrash2 className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Pagination */}
            {pages > 1 && (
                <div className="flex items-center justify-between bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 px-5 py-4 shadow-sm">
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Page {page} of {pages}</p>
                    <div className="flex gap-2">
                        <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1}
                            className="w-10 h-10 flex items-center justify-center rounded-xl border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-30 transition-all min-h-0 text-gray-600 dark:text-gray-300">
                            <FiChevronLeft className="w-4 h-4" />
                        </button>
                        <button onClick={() => setPage(p => Math.min(pages, p+1))} disabled={page === pages}
                            className="w-10 h-10 flex items-center justify-center rounded-xl border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-30 transition-all min-h-0 text-gray-600 dark:text-gray-300">
                            <FiChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* Add User Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <div className="fixed inset-0 z-[1200] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setShowAddModal(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                        
                        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-[2rem] shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                            
                            <div className="p-8">
                                <div className="flex items-center justify-between mb-8">
                                    <div>
                                        <h2 className="text-2xl font-black text-gray-900 dark:text-white leading-none">New Account</h2>
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-2">Manually create user or agent</p>
                                    </div>
                                    <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors">
                                        <FiX className="w-5 h-5 text-gray-400" />
                                    </button>
                                </div>

                                <form onSubmit={handleCreateUser} className="space-y-5">
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                                        <div className="relative">
                                            <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                            <input required value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})}
                                                placeholder="John Doe" className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-800 rounded-2xl outline-none focus:ring-2 ring-primary-500/20 text-sm font-bold" />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                                        <div className="relative">
                                            <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                            <input required type="email" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})}
                                                placeholder="john@example.com" className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-800 rounded-2xl outline-none focus:ring-2 ring-primary-500/20 text-sm font-bold" />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Secure Password</label>
                                        <div className="relative">
                                            <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                            <input required type="password" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})}
                                                placeholder="••••••••" className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-800 rounded-2xl outline-none focus:ring-2 ring-primary-500/20 text-sm font-bold" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 pt-2">
                                        <div className="space-y-1.5">
                                            <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Account Role</label>
                                            <select value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})}
                                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-800 rounded-2xl outline-none text-sm font-black shadow-sm">
                                                <option value="user">User</option>
                                                <option value="agent">Agent</option>
                                            </select>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Initial Status</label>
                                            <div onClick={() => setNewUser({...newUser, isVerified: !newUser.isVerified})}
                                                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-2xl border cursor-pointer transition-all font-black text-[10px] uppercase tracking-wider ${
                                                    newUser.isVerified ? 'bg-green-50 border-green-100 text-green-600' : 'bg-gray-50 border-gray-100 text-gray-400'
                                                }`}>
                                                {newUser.isVerified ? <FiCheckCircle /> : <FiXCircle />}
                                                {newUser.isVerified ? 'Verified' : 'Pending'}
                                            </div>
                                        </div>
                                    </div>

                                    <button type="submit" disabled={updating === 'creating'}
                                        className="w-full py-4 bg-primary-600 hover:bg-primary-700 text-white font-black rounded-2xl shadow-xl shadow-primary-500/20 transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-50">
                                        {updating === 'creating' ? 'Creating Account...' : 'Create Account Now'}
                                    </button>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default UserManagement;
