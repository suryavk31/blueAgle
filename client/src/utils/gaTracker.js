/**
 * gaTracker.js
 * Client-side Google Analytics 4 (GA4) Tracker & E-Commerce Event Logger.
 * Strictly sends privacy-compliant, aggregated analytics data to GA4.
 */

let initializedMeasurementId = null;

/**
 * Dynamically injects Google Tag (gtag.js) script into document head
 * @param {string} measurementId - e.g. "G-XXXXXXXXXX"
 */
export const initGA = (measurementId) => {
    if (!measurementId || initializedMeasurementId === measurementId) return;

    try {
        // Prevent duplicate script injection
        const existingScript = document.getElementById('ga-gtag-script');
        if (!existingScript) {
            const script = document.createElement('script');
            script.id = 'ga-gtag-script';
            script.async = true;
            script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
            document.head.appendChild(script);
        }

        window.dataLayer = window.dataLayer || [];
        function gtag() {
            window.dataLayer.push(arguments);
        }
        window.gtag = window.gtag || gtag;

        window.gtag('js', new Date());
        window.gtag('config', measurementId, {
            send_page_view: false, // We manually send page_views on route transitions
        });

        initializedMeasurementId = measurementId;
        console.log(`📊 [GA4] Initialized tracking with Measurement ID: ${measurementId}`);
    } catch (err) {
        console.error('GA4 Initialization Error:', err);
    }
};

/**
 * Track Page Views
 */
export const trackPageView = (path) => {
    if (typeof window.gtag === 'function' && initializedMeasurementId) {
        window.gtag('event', 'page_view', {
            page_path: path,
            page_title: document.title,
            send_to: initializedMeasurementId,
        });
    }
};

/**
 * Track Product Impression / Detail View
 */
export const trackViewItem = (product) => {
    if (typeof window.gtag === 'function' && product) {
        window.gtag('event', 'view_item', {
            currency: 'INR',
            value: parseFloat(product.price || 0),
            items: [
                {
                    item_id: String(product.id),
                    item_name: product.name,
                    price: parseFloat(product.price || 0),
                    item_category: product.category?.name || product.category || 'General',
                },
            ],
        });
    }
};

/**
 * Track Add to Cart Event
 */
export const trackAddToCart = (product, quantity = 1, selectedVariant = null) => {
    if (typeof window.gtag === 'function' && product) {
        const price = parseFloat(selectedVariant?.price || product.price || 0);
        window.gtag('event', 'add_to_cart', {
            currency: 'INR',
            value: price * quantity,
            items: [
                {
                    item_id: String(product.id),
                    item_name: product.name,
                    price: price,
                    quantity: quantity,
                    item_variant: selectedVariant?.weight || selectedVariant?.name || '',
                    item_category: product.category?.name || product.category || 'General',
                },
            ],
        });
    }
};

/**
 * Track Begin Checkout Event
 */
export const trackBeginCheckout = (cartItems = [], totalAmount = 0) => {
    if (typeof window.gtag === 'function' && Array.isArray(cartItems) && cartItems.length > 0) {
        window.gtag('event', 'begin_checkout', {
            currency: 'INR',
            value: parseFloat(totalAmount || 0),
            items: cartItems.map(item => ({
                item_id: String(item.productId || item.id),
                item_name: item.name,
                price: parseFloat(item.price || 0),
                quantity: item.quantity || 1,
            })),
        });
    }
};

/**
 * Track Purchase Event
 * IMPORTANT: Uses the actual order delivery/shipping charge implemented in the system.
 */
export const trackPurchase = (order) => {
    if (typeof window.gtag === 'function' && order && order.orderNumber) {
        const items = (order.items || order.OrderItems || []).map(item => ({
            item_id: String(item.productId || item.id),
            item_name: item.productName || item.name || 'Product',
            price: parseFloat(item.price || 0),
            quantity: item.quantity || 1,
        }));

        const deliveryFee = parseFloat(order.deliveryFee || order.shippingFee || order.shipping || 0);
        const totalValue = parseFloat(order.totalAmount || order.total || 0);
        const taxAmount = parseFloat(order.tax || 0);

        window.gtag('event', 'purchase', {
            transaction_id: String(order.orderNumber || order.id),
            value: totalValue,
            currency: 'INR',
            tax: taxAmount,
            shipping: deliveryFee, // Actual shipping charge from eCommerce order!
            items: items,
        });

        console.log(`🛒 [GA4] Purchase event sent for Order #${order.orderNumber} (Shipping: ₹${deliveryFee})`);
    }
};
