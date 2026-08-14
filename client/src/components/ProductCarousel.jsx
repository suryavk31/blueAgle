import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import ProductCard from './ProductCard';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';

const defaultBreakpoints = {
    0: { slidesPerView: 2.15, spaceBetween: 10 },
    480: { slidesPerView: 2.35, spaceBetween: 12 },
    640: { slidesPerView: 3.2, spaceBetween: 14 },
    768: { slidesPerView: 4, spaceBetween: 16 },
    1024: { slidesPerView: 5, spaceBetween: 18 },
    1400: { slidesPerView: 6, spaceBetween: 20 },
};

const ProductCarousel = ({
    title,
    subtitle,
    products = [],
    showNavigation = true,
    showSeeAll = true,
    seeAllLink = '/products',
    seeAllText = 'See All',
    colorClass = 'text-gray-900',
    loop = false,
    breakpoints = defaultBreakpoints,
    className = ''
}) => {
    const [swiperInstance, setSwiperInstance] = useState(null);
    const [isBeginning, setIsBeginning] = useState(true);
    const [isEnd, setIsEnd] = useState(false);

    if (!products || products.length === 0) return null;

    const shouldLoop = loop && products.length > 6;

    const handleSlideChange = (s) => {
        setIsBeginning(s.isBeginning);
        setIsEnd(s.isEnd);
    };

    return (
        <section className={`py-6 relative border-b border-gray-100/80 last:border-0 ${className}`}>
            {/* Header Section */}
            {(title || showSeeAll) && (
                <div className="flex justify-between items-end px-1 sm:px-6 mb-3 md:mb-5">
                    <div>
                        {title && (
                            <h3 className={`font-black text-lg sm:text-xl md:text-2xl tracking-tight ${colorClass}`}>
                                {title}
                            </h3>
                        )}
                        {subtitle && (
                            <p className="text-xs sm:text-sm text-gray-500 font-medium mt-0.5">{subtitle}</p>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        {showSeeAll && (
                            <Link
                                to={seeAllLink}
                                className="text-[#ff3269] text-xs sm:text-sm font-extrabold hover:underline flex items-center gap-1 transition-all group"
                            >
                                {seeAllText}
                                <span className="group-hover:translate-x-0.5 transition-transform">→</span>
                            </Link>
                        )}
                    </div>
                </div>
            )}

            {/* Slider Container with Relative Positioning for Outside Arrows */}
            <div className="relative group px-1 sm:px-6">
                {/* Desktop Prev Button */}
                {showNavigation && (
                    <button
                        onClick={() => swiperInstance?.slidePrev()}
                        disabled={!shouldLoop && isBeginning}
                        aria-label="Previous Products"
                        className={`absolute -left-1 sm:-left-3 lg:-left-5 top-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white/95 backdrop-blur-md shadow-xl border border-gray-100 text-gray-800 flex items-center justify-center transition-all duration-300 hover:bg-[#3c006b] hover:text-white hover:border-[#3c006b] hover:scale-110 active:scale-95 disabled:opacity-0 disabled:pointer-events-none ${
                            !shouldLoop && isBeginning ? 'opacity-0 pointer-events-none' : 'opacity-90 hover:opacity-100'
                        }`}
                    >
                        <FaChevronLeft className="text-xs sm:text-sm -ml-0.5" />
                    </button>
                )}

                {/* Swiper Slider */}
                <Swiper
                    modules={[Navigation, Autoplay]}
                    onSwiper={(s) => {
                        setSwiperInstance(s);
                        setIsBeginning(s.isBeginning);
                        setIsEnd(s.isEnd);
                    }}
                    onSlideChange={handleSlideChange}
                    breakpoints={breakpoints}
                    loop={shouldLoop}
                    grabCursor={true}
                    watchOverflow={true}
                    centerInsufficientSlides={false}
                    className="!py-2 !px-0.5"
                >
                    {products.map((product) => (
                        <SwiperSlide key={product.id} className="!h-auto flex">
                            <ProductCard product={product} />
                        </SwiperSlide>
                    ))}
                </Swiper>

                {/* Desktop Next Button */}
                {showNavigation && (
                    <button
                        onClick={() => swiperInstance?.slideNext()}
                        disabled={!shouldLoop && isEnd}
                        aria-label="Next Products"
                        className={`absolute -right-1 sm:-right-3 lg:-right-5 top-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white/95 backdrop-blur-md shadow-xl border border-gray-100 text-gray-800 flex items-center justify-center transition-all duration-300 hover:bg-[#3c006b] hover:text-white hover:border-[#3c006b] hover:scale-110 active:scale-95 disabled:opacity-0 disabled:pointer-events-none ${
                            !shouldLoop && isEnd ? 'opacity-0 pointer-events-none' : 'opacity-90 hover:opacity-100'
                        }`}
                    >
                        <FaChevronRight className="text-xs sm:text-sm -mr-0.5" />
                    </button>
                )}
            </div>
        </section>
    );
};

export default ProductCarousel;
