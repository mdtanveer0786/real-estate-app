import React, { useState, useEffect } from 'react';
import { FiMonitor, FiTablet, FiSmartphone } from 'react-icons/fi';

const ResponsiveTester = () => {
    const [device, setDevice] = useState('desktop');
    const [showTester, setShowTester] = useState(false);

    // Only show in development
    if (process.env.NODE_ENV !== 'development') return null;

    const devices = {
        desktop: { width: '100%', icon: FiMonitor },
        tablet: { width: '768px', icon: FiTablet },
        mobile: { width: '375px', icon: FiSmartphone },
    };

    useEffect(() => {
        if (device !== 'desktop') {
            document.body.style.maxWidth = devices[device].width;
            document.body.style.margin = '0 auto';
        } else {
            document.body.style.maxWidth = '100%';
            document.body.style.margin = '0';
        }
    }, [device]);

    if (!showTester) {
        return (
            <button
                onClick={() => setShowTester(true)}
                className="fixed bottom-4 left-4 z-50 bg-primary-600 text-white p-3 rounded-full shadow-lg"
            >
                <FiMonitor />
            </button>
        );
    }

    return (
        <div className="fixed bottom-4 left-4 z-50 bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4">
            <div className="flex items-center space-x-2 mb-3">
                <span className="font-medium">Responsive Tester</span>
                <button
                    onClick={() => setShowTester(false)}
                    className="text-gray-500 hover:text-gray-700"
                >
                    ×
                </button>
            </div>
            <div className="flex space-x-2">
                {Object.entries(devices).map(([key, value]) => {
                    const Icon = value.icon;
                    return (
                        <button
                            key={key}
                            onClick={() => setDevice(key)}
                            className={`p-2 rounded-lg transition ${device === key
                                    ? 'bg-primary-600 text-white'
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                                }`}
                        >
                            <Icon />
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default ResponsiveTester;