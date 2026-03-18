import React from 'react';

const EmptyState = ({ icon = '📭', title, message, action, actionLabel }) => (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
        <span className="text-5xl mb-4">{icon}</span>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            {title || 'Nothing here yet'}
        </h3>
        <p className="text-gray-500 dark:text-gray-400 max-w-sm mb-6">
            {message || 'Check back later or try a different filter.'}
        </p>
        {action && (
            <button
                onClick={action}
                className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-full transition-colors"
            >
                {actionLabel || 'Take Action'}
            </button>
        )}
    </div>
);

export default EmptyState;
