import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({
    title,
    description,
    keywords,
    name,
    type = 'website',
    image,
    url,
    canonical,
    structuredData
}) => {
    const siteUrl = import.meta.env.VITE_SITE_URL || 'https://rongleo-menhly.vercel.app';
    const defaultTitle = "RongLeo Mệnh Lý — Bát Tự, Đại Vận, Tử Vi Phương Tây";
    const defaultDescription = "Công cụ tham khảo Bát Tự, Đại Vận, Gieo Quẻ, Tư vấn Mệnh Lý AI và Tử Vi Phương Tây.";
    const defaultKeywords = "bát tự, tứ trụ, tử vi, mệnh lý, phong thủy, đại vận, lưu niên, gieo quẻ kinh dịch, tử vi tây";
    const defaultImage = "";

    const finalTitle = title ? `${title} | Mệnh Lý AI` : defaultTitle;
    const finalDescription = description || defaultDescription;
    const finalImage = image ? (image.startsWith('http') ? image : `${siteUrl}${image}`) : defaultImage;
    const finalUrl = url ? (url.startsWith('http') ? url : `${siteUrl}${url}`) : siteUrl;

    return (
        <Helmet>
            {/* Standard metadata tags */}
            <title>{finalTitle}</title>
            <meta name='description' content={finalDescription} />
            <meta name='keywords' content={keywords || defaultKeywords} />
            {canonical && <link rel="canonical" href={canonical} />}

            {/* Facebook tags */}
            <meta property="og:type" content={type} />
            <meta property="og:title" content={finalTitle} />
            <meta property="og:description" content={finalDescription} />
            <meta property="og:image" content={finalImage} />
            <meta property="og:url" content={finalUrl} />
            <meta property="og:site_name" content="Mệnh Lý AI" />

            {/* Twitter tags */}
            <meta name="twitter:creator" content={name || "Mệnh Lý AI"} />
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={finalTitle} />
            <meta name="twitter:description" content={finalDescription} />
            <meta name="twitter:image" content={finalImage} />

            {/* Structured Data (JSON-LD) */}
            {structuredData && (
                <script type="application/ld+json">
                    {JSON.stringify(structuredData)}
                </script>
            )}
        </Helmet>
    );
};

export default SEO;
