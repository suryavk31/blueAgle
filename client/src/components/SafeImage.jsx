import React, { useState, useEffect } from 'react';
import { getImageUrl } from '../utils/imageHelper';

const DEFAULT_FALLBACK = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="150" height="150" viewBox="0 0 150 150"><rect width="150" height="150" fill="%23f3f4f6"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="bold" fill="%239ca3af">No Image</text></svg>';

const SafeImage = ({
    src,
    alt = 'Image',
    className = '',
    fallbackSrc = DEFAULT_FALLBACK,
    style = {},
    ...props
}) => {
    const [imageSrc, setImageSrc] = useState('');
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        setHasError(false);
        if (src) {
            setImageSrc(getImageUrl(src));
        } else {
            setImageSrc(fallbackSrc);
            setHasError(true);
        }
    }, [src, fallbackSrc]);

    const handleError = () => {
        if (!hasError) {
            setHasError(true);
            setImageSrc(fallbackSrc);
        }
    };

    return (
        <img
            src={imageSrc || fallbackSrc}
            alt={alt}
            onError={handleError}
            className={className}
            style={style}
            loading="lazy"
            {...props}
        />
    );
};

export default SafeImage;
