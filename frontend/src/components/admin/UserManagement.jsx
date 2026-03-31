import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiTrash2, FiSearch, FiUser, FiMail, FiCalendar,
    FiShield, FiCheckCircle, FiXCircle, FiChevronLeft, FiChevronRight, FiRefreshCw
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
    // Reset page on filter change
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

    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 dark:text-white">User Management</h1>
                    <p className="text-sm text-gray-500 mt-0.5">{total} total users</p>
                </div>
                <button onClick={fetchUsers} className="btn-secondary self-start sm:self-auto text-sm flex items-center gap-2">
                    <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 flex flex-col sm:flex-row gap-3">
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
                    className="py-2.5 px-4 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none text-gray-900 dark:text-white min-h-0"
                >
                    <option value="">All Roles</option>
                    <option value="user">Users</option>
                    <option value="agent">Agents</option>
                    <option value="admin">Admins</option>
                </select>
            </div>

            {/* Desktop Table */}
            <div className="hidden lg:block bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-800/60 border-b border-gray-100 dark:border-gray-800">
                        <tr>
                            {['User', 'Role', 'Verified', 'Joined', 'Actions'].map(h => (
                                <th key={h} className="px-5 py-3.5 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider">{h}</th>
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
                            <tr><td colSpan={5} className="px-5 py-12 text-center text-gray-400 text-sm">No users found</td></tr>
                        ) : users.map(user => (
                            <tr key={user._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                                <td className="px-5 py-3.5">
                                    <div className="flex items-center gap-3">
                                        <Avatar user={user} />
                                        <div>
                                            <p className="text-sm font-semibold text-gray-900 dark:text-white">{user.name}</p>
                                            <p className="text-xs text-gray-400 flex items-center gap-1"><FiMail className="w-3 h-3" />{user.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-5 py-3.5">
                                    <select
                                        value={user.role}
                                        disabled={user.role === 'admin' || updating === user._id}
                                        onChange={e => handleRoleChange(user._id, e.target.value)}
                                        className={`text-xs px-2 py-1 rounded-lg font-bold cursor-pointer outline-none border-0 ${ROLE_COLORS[user.role] || ROLE_COLORS.user}`}
                                    >
                                        <option value="user">User</option>
                                        <option value="agent">Agent</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </td>
                                <td className="px-5 py-3.5">
                                    <button onClick={() => handleVerify(user._id, user.isVerified)} disabled={updating === user._id}
                                        className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors ${
                                            user.isVerified
                                                ? 'text-green-600 bg-green-50 dark:bg-green-900/20 hover:bg-green-100'
                                                : 'text-red-500 bg-red-50 dark:bg-red-900/20 hover:bg-red-100'
                                        }`}>
                                        {user.isVerified ? <FiCheckCircle className="w-3.5 h-3.5" /> : <FiXCircle className="w-3.5 h-3.5" />}
                                        {user.isVerified ? 'Verified' : 'Unverified'}
                                    </button>
                                </td>
                                <td className="px-5 py-3.5 text-xs text-gray-500">
                                    {new Date(user.createdAt).toLocaleDateString('en-IN')}
                                </td>
                                <td className="px-5 py-3.5">
                                    {user.role !== 'admin' && (
                                        <button onClick={() => handleDelete(user._id, user.name)} disabled={updating === user._id}
                                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors min-h-0">
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
                    Array(3).fill(0).map((_, i) => <div key={i} className="h-28 skeleton rounded-2xl" />)
                ) : users.length === 0 ? (
                    <div className="text-center py-12 text-gray-400 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">No users found</div>
                ) : users.map(user => (
                    <div key={user._id} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4">
                        <div className="flex items-center gap-3 mb-3">
                            <Avatar user={user} />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{user.name}</p>
                                <p className="text-xs text-gray-400 truncate">{user.email}</p>
                            </div>
                            <span className={`text-[10px] px-2 py-1 rounded-lg font-bold capitalize flex-shrink-0 ${ROLE_COLORS[user.role]}`}>{user.role}</span>
                        </div>
                        <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
                            <div className="flex items-center gap-1 text-xs text-gray-400">
                                <FiCalendar className="w-3 h-3" />
                                {new Date(user.createdAt).toLocaleDateString('en-IN')}
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={() => handleVerify(user._id, user.isVerified)}
                                    className={`text-[10px] font-bold px-2 py-1 rounded-lg ${user.isVerified ? 'text-green-600 bg-green-50' : 'text-red-500 bg-red-50'} min-h-0`}>
                                    {user.isVerified ? 'Verified ✓' : 'Unverified'}
                                </button>
                                {user.role !== 'admin' && (
                                    <button onClick={() => handleDelete(user._id, user.name)}
                                        className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg min-h-0">
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
                <div className="flex items-center justify-between bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 px-4 py-3">
                    <p className="text-xs text-gray-500">Page {page} of {pages} · {total} users</p>
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
        </div>
    );
};

export default UserManagement;
