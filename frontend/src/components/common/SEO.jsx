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
    const defaultTitle = "Mệnh Lý AI - Luận Giải Mệnh Lý Chuyên Sâu";
    const defaultDescription = "Ứng dụng luận giải Bát Tự, Tứ Trụ, Xem Ngày Tốt Xấu và Tư Vấn Phong Thủy chuyên sâu với công nghệ AI.";
    const defaultKeywords = "bát tự, tứ trụ, tử vi, xem mệnh, phong thủy, chọn ngày tốt, mệnh lý ai";
    const defaultImage = "";
    const siteUrl = "";

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
