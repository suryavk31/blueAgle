const {
    InvoiceTemplate,
    InvoiceTemplateCategory,
    InvoiceVariable,
    InvoiceSetting,
    InvoiceTemplateVersion,
    Order,
    OrderItem,
    Product,
    User,
} = require('../models');
const { logActivity } = require('../utils/activityLogger');
const { Op } = require('sequelize');

function slugify(text) {
    return text.toString().toLowerCase().trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-');
}

// ─── Templates Controller ──────────────────────────────────────────────────────

exports.listTemplates = async (req, res) => {
    try {
        const { documentType, categoryId, search, page = 1, limit = 20 } = req.query;
        const where = {};

        if (documentType) where.documentType = documentType;
        if (categoryId) where.categoryId = categoryId;
        if (search) {
            where[Op.or] = [
                { name: { [Op.like]: `%${search}%` } },
                { description: { [Op.like]: `%${search}%` } },
            ];
        }

        const offset = (parseInt(page) - 1) * parseInt(limit);
        const { count, rows } = await InvoiceTemplate.findAndCountAll({
            where,
            include: [{ model: InvoiceTemplateCategory, as: 'category', attributes: ['id', 'name'] }],
            order: [['isDefault', 'DESC'], ['updatedAt', 'DESC']],
            limit: parseInt(limit),
            offset,
        });

        return res.json({
            data: rows,
            pagination: {
                total: count,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(count / parseInt(limit)),
            },
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error listing templates' });
    }
};

exports.getTemplateById = async (req, res) => {
    try {
        const { id } = req.params;
        const template = await InvoiceTemplate.findByPk(id, {
            include: [
                { model: InvoiceTemplateCategory, as: 'category' },
                {
                    model: InvoiceTemplateVersion,
                    as: 'versions',
                    attributes: ['id', 'version', 'name', 'changeSummary', 'createdBy', 'createdAt'],
                    order: [['version', 'DESC']],
                },
            ],
        });

        if (!template) return res.status(404).json({ message: 'Invoice template not found' });
        return res.json(template);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error loading template' });
    }
};

exports.createTemplate = async (req, res) => {
    try {
        const {
            name,
            description,
            documentType = 'Invoice',
            paperSize = 'A4',
            orientation = 'Portrait',
            canvasJson,
            categoryId,
            isDefault = false,
        } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({ message: 'Template name is required' });
        }

        const baseSlug = slugify(name);
        const slug = `${baseSlug}-${Date.now()}`;

        // Default Canvas Grid if empty
        const defaultCanvas = canvasJson || {
            paperSize,
            orientation,
            margins: { top: 15, right: 15, bottom: 15, left: 15 },
            elements: [
                { id: 'hdr-1', type: 'header', x: 20, y: 20, w: 500, h: 60, text: '{{company.name}}', fontSize: 24, fontWeight: 'bold', color: '#1a1a4e' },
                { id: 'lbl-1', type: 'text', x: 20, y: 90, w: 200, h: 20, text: 'INVOICE #: {{invoice.number}}', fontSize: 12, fontWeight: 'bold', color: '#475569' },
                { id: 'dt-1', type: 'text', x: 350, y: 90, w: 200, h: 20, text: 'DATE: {{invoice.date}}', fontSize: 12, color: '#475569' },
                { id: 'cust-1', type: 'text', x: 20, y: 130, w: 250, h: 60, text: 'BILL TO:\n{{customer.name}}\n{{customer.address}}', fontSize: 11, color: '#334155' },
                { id: 'tbl-1', type: 'dynamic_table', x: 20, y: 210, w: 550, h: 200, columns: ['Product', 'Qty', 'Unit Price', 'Amount'] },
                { id: 'tot-1', type: 'text', x: 350, y: 430, w: 220, h: 30, text: 'TOTAL AMOUNT: {{invoice.total}}', fontSize: 14, fontWeight: 'bold', color: '#16a34a' },
                { id: 'ftr-1', type: 'footer', x: 20, y: 750, w: 550, h: 30, text: '{{invoice.footerNotes}}', fontSize: 10, color: '#94a3b8', textAlign: 'center' },
            ],
        };

        if (isDefault) {
            await InvoiceTemplate.update({ isDefault: false }, { where: { documentType } });
        }

        const template = await InvoiceTemplate.create({
            name,
            slug,
            description,
            documentType,
            paperSize,
            orientation,
            canvasJson: defaultCanvas,
            categoryId: categoryId || null,
            isDefault,
            version: 1,
            createdBy: req.adminUser?.id || null,
        });

        // Record initial version
        await InvoiceTemplateVersion.create({
            templateId: template.id,
            version: 1,
            name: template.name,
            canvasJson: defaultCanvas,
            changeSummary: 'Initial template creation',
            createdBy: req.adminUser?.id || null,
        });

        await logActivity({
            adminUserId: req.adminUser?.id,
            module: 'InvoiceBuilder',
            action: 'Create',
            description: `Created invoice template: ${template.name} (${documentType})`,
            targetId: template.id,
            req,
        });

        return res.json(template);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error creating template' });
    }
};

exports.updateTemplate = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            name,
            description,
            documentType,
            paperSize,
            orientation,
            margins,
            canvasJson,
            categoryId,
            isDefault,
            isActive,
            changeSummary,
        } = req.body;

        const template = await InvoiceTemplate.findByPk(id);
        if (!template) return res.status(404).json({ message: 'Template not found' });

        const docType = documentType || template.documentType;

        if (isDefault && !template.isDefault) {
            await InvoiceTemplate.update({ isDefault: false }, { where: { documentType: docType } });
        }

        const newVersionNumber = template.version + 1;
        const updatedCanvas = canvasJson || template.canvasJson;

        await template.update({
            name: name || template.name,
            description: description !== undefined ? description : template.description,
            documentType: docType,
            paperSize: paperSize || template.paperSize,
            orientation: orientation || template.orientation,
            margins: margins || template.margins,
            canvasJson: updatedCanvas,
            categoryId: categoryId !== undefined ? categoryId : template.categoryId,
            isDefault: isDefault !== undefined ? isDefault : template.isDefault,
            isActive: isActive !== undefined ? isActive : template.isActive,
            version: newVersionNumber,
            updatedBy: req.adminUser?.id || null,
        });

        // Version Snapshot
        await InvoiceTemplateVersion.create({
            templateId: template.id,
            version: newVersionNumber,
            name: template.name,
            canvasJson: updatedCanvas,
            changeSummary: changeSummary || `Updated template configuration v${newVersionNumber}`,
            createdBy: req.adminUser?.id || null,
        });

        await logActivity({
            adminUserId: req.adminUser?.id,
            module: 'InvoiceBuilder',
            action: 'Update',
            description: `Updated invoice template: ${template.name} (v${newVersionNumber})`,
            targetId: template.id,
            req,
        });

        return res.json(template);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error updating template' });
    }
};

exports.deleteTemplate = async (req, res) => {
    try {
        const { id } = req.params;
        const template = await InvoiceTemplate.findByPk(id);
        if (!template) return res.status(404).json({ message: 'Template not found' });

        if (template.isDefault) {
            return res.status(400).json({ message: 'Cannot delete the default template. Assign another template as default first.' });
        }

        await template.destroy();

        await logActivity({
            adminUserId: req.adminUser?.id,
            module: 'InvoiceBuilder',
            action: 'Delete',
            description: `Deleted invoice template: ${template.name}`,
            targetId: template.id,
            req,
        });

        return res.json({ message: 'Template deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error deleting template' });
    }
};

exports.setDefaultTemplate = async (req, res) => {
    try {
        const { id } = req.params;
        const template = await InvoiceTemplate.findByPk(id);
        if (!template) return res.status(404).json({ message: 'Template not found' });

        await InvoiceTemplate.update(
            { isDefault: false },
            { where: { documentType: template.documentType } }
        );

        await template.update({ isDefault: true, isActive: true });

        await logActivity({
            adminUserId: req.adminUser?.id,
            module: 'InvoiceBuilder',
            action: 'Update',
            description: `Set template '${template.name}' as default for ${template.documentType}`,
            targetId: template.id,
            req,
        });

        return res.json({ message: `Template set as default for ${template.documentType}`, template });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error setting default template' });
    }
};

exports.duplicateTemplate = async (req, res) => {
    try {
        const { id } = req.params;
        const source = await InvoiceTemplate.findByPk(id);
        if (!source) return res.status(404).json({ message: 'Source template not found' });

        const name = `${source.name} (Copy)`;
        const slug = `${slugify(name)}-${Date.now()}`;

        const dup = await InvoiceTemplate.create({
            name,
            slug,
            description: source.description,
            documentType: source.documentType,
            paperSize: source.paperSize,
            orientation: source.orientation,
            margins: source.margins,
            canvasJson: JSON.parse(JSON.stringify(source.canvasJson)),
            categoryId: source.categoryId,
            isDefault: false,
            isActive: true,
            version: 1,
            createdBy: req.adminUser?.id || null,
        });

        return res.json(dup);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error duplicating template' });
    }
};

exports.restoreTemplateVersion = async (req, res) => {
    try {
        const { id, versionId } = req.params;
        const template = await InvoiceTemplate.findByPk(id);
        if (!template) return res.status(404).json({ message: 'Template not found' });

        const targetVer = await InvoiceTemplateVersion.findOne({
            where: { id: versionId, templateId: template.id },
        });

        if (!targetVer) return res.status(404).json({ message: 'Target version not found' });

        const newVersionNumber = template.version + 1;

        await template.update({
            canvasJson: targetVer.canvasJson,
            version: newVersionNumber,
        });

        await InvoiceTemplateVersion.create({
            templateId: template.id,
            version: newVersionNumber,
            name: template.name,
            canvasJson: targetVer.canvasJson,
            changeSummary: `Restored from version v${targetVer.version}`,
            createdBy: req.adminUser?.id || null,
        });

        return res.json({ message: `Restored template to v${targetVer.version}`, template });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error restoring version' });
    }
};

// ─── Categories & Variables Controller ────────────────────────────────────────

exports.listCategories = async (req, res) => {
    try {
        const categories = await InvoiceTemplateCategory.findAll({
            order: [['sortOrder', 'ASC'], ['name', 'ASC']],
        });
        return res.json(categories);
    } catch (err) {
        res.status(500).json({ message: 'Server error loading categories' });
    }
};

exports.createCategory = async (req, res) => {
    try {
        const { name, description, sortOrder = 0 } = req.body;
        if (!name) return res.status(400).json({ message: 'Name is required' });
        const cat = await InvoiceTemplateCategory.create({ name, description, sortOrder });
        return res.json(cat);
    } catch (err) {
        res.status(500).json({ message: 'Server error creating category' });
    }
};

exports.listVariables = async (req, res) => {
    try {
        const variables = await InvoiceVariable.findAll({
            order: [['category', 'ASC'], ['variableName', 'ASC']],
        });
        return res.json(variables);
    } catch (err) {
        res.status(500).json({ message: 'Server error loading variables' });
    }
};

// ─── Settings Controller ──────────────────────────────────────────────────────

exports.getInvoiceSettings = async (req, res) => {
    try {
        let settings = await InvoiceSetting.findOne();
        if (!settings) {
            settings = await InvoiceSetting.create({});
        }
        return res.json(settings);
    } catch (err) {
        res.status(500).json({ message: 'Server error loading settings' });
    }
};

exports.updateInvoiceSettings = async (req, res) => {
    try {
        let settings = await InvoiceSetting.findOne();
        if (!settings) {
            settings = await InvoiceSetting.create(req.body);
        } else {
            await settings.update(req.body);
        }
        return res.json(settings);
    } catch (err) {
        res.status(500).json({ message: 'Server error updating settings' });
    }
};

// ─── Order Render & Variable Compiler Engine ───────────────────────────────────

exports.renderOrderInvoice = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { documentType = 'Invoice' } = req.query;

        const order = await Order.findByPk(orderId, {
            include: [
                { model: OrderItem, include: [Product] },
                { model: User, attributes: ['id', 'name', 'phone', 'email'] },
            ],
        });

        if (!order) return res.status(404).json({ message: 'Order not found' });

        // Load company settings
        let settings = await InvoiceSetting.findOne();
        if (!settings) settings = {};

        // Load default template for documentType
        let template = await InvoiceTemplate.findOne({
            where: { documentType, isDefault: true, isActive: true },
        });

        if (!template) {
            // Fallback to any template for documentType or first available template
            template = await InvoiceTemplate.findOne({
                where: { documentType, isActive: true },
            });
        }

        if (!template) {
            template = await InvoiceTemplate.findOne({ where: { isActive: true } });
        }

        const items = (order.OrderItems || []).map(item => ({
            productName: item.Product?.name || 'Product Item',
            sku: item.Product?.id ? `SKU-${item.Product.id}` : 'SKU-N/A',
            description: item.Product?.description || '',
            quantity: item.quantity,
            price: `${settings.currencySymbol || '₹'}${parseFloat(item.price).toFixed(2)}`,
            amount: `${settings.currencySymbol || '₹'}${(parseFloat(item.price) * item.quantity).toFixed(2)}`,
        }));

        const customerAddress = typeof order.address === 'object'
            ? `${order.address.flatNo || ''}, ${order.address.area || ''}, ${order.address.landmark || ''}`
            : (order.address || 'N/A');

        const variablePayload = {
            'company.name': settings.companyName || 'BlueAgle',
            'company.logo': settings.companyLogo || '',
            'company.gstNumber': settings.gstNumber || 'N/A',
            'company.address': settings.address || '',
            'company.phone': settings.phone || '',
            'company.email': settings.email || '',
            'company.website': settings.website || '',
            'company.signature': settings.digitalSignature || '',
            'company.stamp': settings.companyStamp || '',
            'customer.name': order.User?.name || order.address?.contactName || 'Valued Customer',
            'customer.phone': order.User?.phone || order.address?.contactPhone || 'N/A',
            'customer.email': order.User?.email || 'N/A',
            'customer.address': customerAddress,
            'invoice.number': `INV-${order.id.toString().padStart(6, '0')}`,
            'invoice.date': new Date(order.createdAt).toLocaleDateString(),
            'invoice.dueDate': new Date(Date.now() + 7 * 86400000).toLocaleDateString(),
            'invoice.subtotal': `${settings.currencySymbol || '₹'}${parseFloat(order.totalAmount).toFixed(2)}`,
            'invoice.total': `${settings.currencySymbol || '₹'}${parseFloat(order.totalAmount).toFixed(2)}`,
            'invoice.paymentMethod': order.paymentMethod || 'Online',
            'invoice.status': order.paymentStatus || 'Paid',
            'invoice.footerNotes': settings.footerNotes || 'Thank you for shopping with BlueAgle!',
            'order.id': `#${order.id}`,
            'order.items': items,
        };

        return res.json({
            template: template ? template.toJSON() : null,
            variables: variablePayload,
            settings,
            order,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error rendering invoice' });
    }
};
