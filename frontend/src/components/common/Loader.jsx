import React from 'react';

const Loader = () => {
    return (
        <div className="min-h-[60vh] flex items-center justify-center">
            <div className="relative">
                {/* Outer ring */}
                <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
                {/* Inner circle */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="w-8 h-8 bg-primary-600 rounded-full animate-pulse"></div>
                </div>
            </div>
        </div>
    );
};

export default Loader;