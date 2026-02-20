import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({
    title,
    description,
    keywords,
    image,
    url,
    type = 'website',
    publishedTime,
    modifiedTime,
    author = 'EstateElite',
}) => {
    const siteTitle = 'EstateElite';
    const fullTitle = title ? `${title} | ${siteTitle}` : siteTitle;
    const defaultDescription = 'Find your dream property with EstateElite. Browse thousands of properties for sale and rent.';
    const defaultImage = 'https://estateelite.com/og-image.jpg';
    // Fix: Use import.meta.env instead of process.env
    const siteUrl = import.meta.env.VITE_APP_URL || 'https://estateelite.com';

    return (
        <Helmet>
            {/* Basic metadata */}
            <title>{fullTitle}</title>
            <meta name="description" content={description || defaultDescription} />
            {keywords && <meta name="keywords" content={keywords} />}
            <meta name="author" content={author} />

            {/* Open Graph */}
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description || defaultDescription} />
            <meta property="og:type" content={type} />
            <meta property="og:url" content={url || siteUrl} />
            <meta property="og:image" content={image || defaultImage} />
            <meta property="og:site_name" content={siteTitle} />

            {/* Twitter Card */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={description || defaultDescription} />
            <meta name="twitter:image" content={image || defaultImage} />

            {/* Article specific */}
            {type === 'article' && publishedTime && (
                <meta property="article:published_time" content={publishedTime} />
            )}
            {type === 'article' && modifiedTime && (
                <meta property="article:modified_time" content={modifiedTime} />
            )}

            {/* Canonical URL */}
            <link rel="canonical" href={url || siteUrl} />
        </Helmet>
    );
};

export default SEO;