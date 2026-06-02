import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { getImageUrl } from '../utils/imageHelper';

const AdComponent = ({ ad, className }) => {
    const [viewed, setViewed] = useState(false);
    const adRef = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !viewed) {
                    setViewed(true);
                    trackImpression();
                }
            },
            { threshold: 0.5 } // Trigger when 50% visible
        );

        if (adRef.current) {
            observer.observe(adRef.current);
        }

        return () => {
            if (adRef.current) observer.unobserve(adRef.current);
        };
    }, [ad.id, viewed]);

    const trackImpression = async () => {
        try {
            await axios.post('http://localhost:5000/api/ads/track', {
                adId: ad.id,
                type: 'impression'
            });
        } catch (error) {
            console.error("Track error", error);
        }
    };

    const handleClick = async () => {
        try {
            await axios.post('http://localhost:5000/api/ads/track', {
                adId: ad.id,
                type: 'click'
            });

            // Store adId for conversion tracking if purchased later
            sessionStorage.setItem('lastAdId', ad.id);

            if (ad.redirectUrl) {
                window.location.href = ad.redirectUrl;
            }
        } catch (error) {
            console.error("Click track error", error);
            if (ad.redirectUrl) window.location.href = ad.redirectUrl;
        }
    };

    if (!ad) return null;

    return (
        <div ref={adRef} onClick={handleClick} className={`cursor-pointer overflow-hidden rounded-xl shadow-md ${className}`}>
            {ad.mediaType === 'video' ? (
                <video src={getImageUrl(ad.mediaUrl)} autoPlay muted loop className="w-full h-full object-cover" />
            ) : (
                <img src={getImageUrl(ad.mediaUrl)} alt={ad.title} className="w-full h-full object-cover" />
            )}
        </div>
    );
};

export default AdComponent;
