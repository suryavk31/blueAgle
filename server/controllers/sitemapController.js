const { SeoSetting, Product, Category, SubCategory } = require('../models');

const generateSitemap = async (req, res) => {
    try {
        const baseUrl = process.env.CLIENT_URL || 'http://localhost:5173';

        // 1. Fetch static SEO settings that are indexed and active
        const seoRecords = await SeoSetting.findAll({
            where: { isIndexed: true, isActive: true },
            attributes: ['route', 'priority', 'changeFrequency', 'updatedAt']
        });

        // 2. Fetch active products
        const products = await Product.findAll({
            attributes: ['id', 'updatedAt']
        });

        // 3. Fetch categories
        const categories = await Category.findAll({
            attributes: ['id', 'updatedAt']
        });

        // Build XML entries
        let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
        xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

        // Home
        xml += `  <url>\n`;
        xml += `    <loc>${baseUrl}/</loc>\n`;
        xml += `    <changefreq>daily</changefreq>\n`;
        xml += `    <priority>1.0</priority>\n`;
        xml += `  </url>\n`;

        // DB SEO pages
        seoRecords.forEach(r => {
            if (r.route !== '/') {
                xml += `  <url>\n`;
                xml += `    <loc>${baseUrl}${r.route}</loc>\n`;
                xml += `    <lastmod>${new Date(r.updatedAt).toISOString()}</lastmod>\n`;
                xml += `    <changefreq>${r.changeFrequency || 'weekly'}</changefreq>\n`;
                xml += `    <priority>${r.priority || 0.8}</priority>\n`;
                xml += `  </url>\n`;
            }
        });

        // Products
        products.forEach(p => {
            xml += `  <url>\n`;
            xml += `    <loc>${baseUrl}/product/${p.id}</loc>\n`;
            xml += `    <lastmod>${new Date(p.updatedAt).toISOString()}</lastmod>\n`;
            xml += `    <changefreq>weekly</changefreq>\n`;
            xml += `    <priority>0.9</priority>\n`;
            xml += `  </url>\n`;
        });

        // Categories
        categories.forEach(c => {
            xml += `  <url>\n`;
            xml += `    <loc>${baseUrl}/products?category=${c.id}</loc>\n`;
            xml += `    <lastmod>${new Date(c.updatedAt).toISOString()}</lastmod>\n`;
            xml += `    <changefreq>weekly</changefreq>\n`;
            xml += `    <priority>0.8</priority>\n`;
            xml += `  </url>\n`;
        });

        xml += `</urlset>`;

        res.header('Content-Type', 'application/xml');
        res.send(xml);
    } catch (error) {
        console.error('Sitemap Error:', error);
        res.status(500).send('Error generating sitemap.xml');
    }
};

module.exports = { generateSitemap };
