import React from 'react';

const shimmer = 'animate-pulse bg-gray-200 dark:bg-gray-700 rounded';

export const SkeletonCard = () => (
    <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700">
        <div className={`h-52 ${shimmer}`} />
        <div className="p-5 space-y-3">
            <div className={`h-4 w-3/4 ${shimmer}`} />
            <div className={`h-3 w-1/2 ${shimmer}`} />
            <div className="flex gap-4 pt-2">
                <div className={`h-3 w-16 ${shimmer}`} />
                <div className={`h-3 w-16 ${shimmer}`} />
                <div className={`h-3 w-16 ${shimmer}`} />
            </div>
            <div className="flex justify-between items-center pt-3 border-t border-gray-100 dark:border-gray-700">
                <div className={`h-5 w-24 ${shimmer}`} />
                <div className={`h-8 w-20 rounded-full ${shimmer}`} />
            </div>
        </div>
    </div>
);

export const SkeletonPropertyDetail = () => (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Image gallery */}
        <div className="grid grid-cols-4 gap-3 h-96">
            <div className={`col-span-2 row-span-2 ${shimmer}`} />
            <div className={shimmer} />
            <div className={shimmer} />
            <div className={shimmer} />
            <div className={shimmer} />
        </div>
        {/* Title & price */}
        <div className="flex justify-between items-start">
            <div className="space-y-3 flex-1">
                <div className={`h-8 w-2/3 ${shimmer}`} />
                <div className={`h-4 w-1/3 ${shimmer}`} />
            </div>
            <div className={`h-10 w-32 ${shimmer}`} />
        </div>
        {/* Details grid */}
        <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
                <div key={i} className={`h-20 ${shimmer}`} />
            ))}
        </div>
        {/* Description */}
        <div className="space-y-2">
            <div className={`h-4 w-full ${shimmer}`} />
            <div className={`h-4 w-full ${shimmer}`} />
            <div className={`h-4 w-3/4 ${shimmer}`} />
        </div>
    </div>
);

export const SkeletonTable = ({ rows = 5, cols = 4 }) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700">
        {/* Header */}
        <div className="flex gap-4 p-4 border-b border-gray-100 dark:border-gray-700">
            {[...Array(cols)].map((_, i) => (
                <div key={i} className={`h-4 flex-1 ${shimmer}`} />
            ))}
        </div>
        {/* Rows */}
        {[...Array(rows)].map((_, r) => (
            <div key={r} className="flex gap-4 p-4 border-b border-gray-50 dark:border-gray-700/50">
                {[...Array(cols)].map((_, c) => (
                    <div key={c} className={`h-3 flex-1 ${shimmer}`} />
                ))}
            </div>
        ))}
    </div>
);

export const SkeletonProfile = () => (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center gap-4">
            <div className={`w-20 h-20 rounded-full ${shimmer}`} />
            <div className="space-y-2 flex-1">
                <div className={`h-6 w-40 ${shimmer}`} />
                <div className={`h-4 w-56 ${shimmer}`} />
            </div>
        </div>
        {[...Array(4)].map((_, i) => (
            <div key={i} className={`h-12 w-full ${shimmer}`} />
        ))}
    </div>
);

export const SkeletonDashboard = () => (
    <div className="space-y-6">
        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
                <div key={i} className={`h-28 ${shimmer}`} />
            ))}
        </div>
        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className={`h-64 ${shimmer}`} />
            <div className={`h-64 ${shimmer}`} />
        </div>
        {/* Table */}
        <SkeletonTable rows={5} cols={5} />
    </div>
);

export default {
    SkeletonCard,
    SkeletonPropertyDetail,
    SkeletonTable,
    SkeletonProfile,
    SkeletonDashboard,
};
