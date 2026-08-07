const { SeoGlobalSetting } = require('../models');

const generateRobotsTxt = async (req, res) => {
    try {
        const settings = await SeoGlobalSetting.findOne();
        const content = settings?.robotsTxtCustomRules || `User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /checkout\nDisallow: /cart\nDisallow: /profile\n\nSitemap: http://localhost:5000/sitemap.xml`;

        res.header('Content-Type', 'text/plain');
        res.send(content);
    } catch (error) {
        res.status(500).send('Error generating robots.txt');
    }
};

module.exports = { generateRobotsTxt };
