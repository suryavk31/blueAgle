import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import seoService from '../services/seoService';
import { getImageUrl } from '../utils/imageHelper';

const SeoContext = createContext();

export const useSeo = () => useContext(SeoContext);

export const SeoProvider = ({ children }) => {
    const location = useLocation();
    const [seo, setSeo] = useState(null);
    const [globalSettings, setGlobalSettings] = useState(null);
    const [loading, setLoading] = useState(false);
    const cacheRef = useRef({});

    const routeKey = location.pathname + location.search;

    const fetchSeoForRoute = async (targetRoute) => {
        // Use memory cache if available
        if (cacheRef.current[targetRoute]) {
            setSeo(cacheRef.current[targetRoute].seo);
            setGlobalSettings(cacheRef.current[targetRoute].globalSettings);
            return;
        }

        setLoading(true);
        try {
            const data = await seoService.resolveSeo(targetRoute);
            if (data?.seo) {
                cacheRef.current[targetRoute] = data;
                setSeo(data.seo);
                if (data.globalSettings) {
                    setGlobalSettings(data.globalSettings);
                }
            }
        } catch (error) {
            console.error('Error fetching dynamic SEO:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Skip fetching SEO for admin layout pages
        if (location.pathname.startsWith('/admin')) {
            setSeo({
                title: 'Admin Control Panel | BlueAgle',
                metaDescription: 'BlueAgle Administrative Control Panel',
                robots: 'noindex, nofollow'
            });
            return;
        }

        // Reset current SEO during route transition to prevent stale metadata
        setSeo(null);
        fetchSeoForRoute(routeKey);
    }, [routeKey]);

    const refreshSeoCache = () => {
        cacheRef.current = {};
        fetchSeoForRoute(routeKey);
    };

    // Format title with global title template if necessary
    const formattedTitle = seo?.title || 'BlueAgle | Organic & Wood-Pressed Grocery Essentials';
    const formattedOgImage = seo?.ogImage ? getImageUrl(seo.ogImage) : '/logo.png';
    const formattedTwitterImage = seo?.twitterImage ? getImageUrl(seo.twitterImage) : '/logo.png';

    // Prepare JSON-LD script content
    let jsonLdContent = null;
    if (seo?.structuredData) {
        jsonLdContent = typeof seo.structuredData === 'string'
            ? seo.structuredData
            : JSON.stringify(seo.structuredData, null, 2);
    }

    return (
        <SeoContext.Provider value={{ seo, globalSettings, loading, refreshSeoCache }}>
            {seo && (
                <Helmet key={routeKey}>
                    {/* Primary Title & Meta */}
                    <title>{formattedTitle}</title>
                    {seo.metaDescription && <meta name="description" content={seo.metaDescription} />}
                    {seo.metaKeywords && <meta name="keywords" content={seo.metaKeywords} />}
                    {seo.robots && <meta name="robots" content={seo.robots} />}
                    {seo.author && <meta name="author" content={seo.author} />}
                    {seo.viewport && <meta name="viewport" content={seo.viewport} />}
                    {seo.themeColor && <meta name="theme-color" content={seo.themeColor} />}
                    {seo.favicon && <link rel="shortcut icon" href={seo.favicon} />}
                    {seo.canonicalUrl && <link rel="canonical" href={seo.canonicalUrl} />}

                    {/* Open Graph Tags */}
                    <meta property="og:site_name" content="BlueAgle" />
                    {seo.ogTitle && <meta property="og:title" content={seo.ogTitle} />}
                    {seo.ogDescription && <meta property="og:description" content={seo.ogDescription} />}
                    {formattedOgImage && <meta property="og:image" content={formattedOgImage} />}
                    {seo.ogUrl && <meta property="og:url" content={seo.ogUrl} />}
                    {seo.ogType && <meta property="og:type" content={seo.ogType} />}

                    {/* Twitter Cards */}
                    {seo.twitterCard && <meta name="twitter:card" content={seo.twitterCard} />}
                    {seo.twitterTitle && <meta name="twitter:title" content={seo.twitterTitle} />}
                    {seo.twitterDescription && <meta name="twitter:description" content={seo.twitterDescription} />}
                    {formattedTwitterImage && <meta name="twitter:image" content={formattedTwitterImage} />}

                    {/* Structured Data (JSON-LD) */}
                    {jsonLdContent && (
                        <script type="application/ld+json">
                            {jsonLdContent}
                        </script>
                    )}
                </Helmet>
            )}
            {children}
        </SeoContext.Provider>
    );
};
