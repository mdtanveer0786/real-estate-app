import React from 'react';

const Loader = ({ size = 'md', text = 'Loading...' }) => {
    const sizes = {
        sm:  { wrap: 'min-h-[120px]', ring: 'w-8 h-8 border-[3px]',  txt: 'text-xs mt-2' },
        md:  { wrap: 'min-h-[300px]', ring: 'w-11 h-11 border-4',      txt: 'text-sm mt-3' },
        lg:  { wrap: 'min-h-screen',  ring: 'w-14 h-14 border-4',      txt: 'text-base mt-4' },
    };
    const s = sizes[size] || sizes.md;

    return (
        <div className={`flex flex-col items-center justify-center ${s.wrap}`}>
            <div className={`${s.ring} border-primary-100 dark:border-primary-900 border-t-primary-600 dark:border-t-primary-400 rounded-full animate-spin`} />
            {text && <p className={`${s.txt} text-gray-500 dark:text-gray-400 font-medium`}>{text}</p>}
        </div>
    );
};

export default Loader;
