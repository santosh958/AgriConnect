const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

function generateInvoice(order, res) {
    const doc = new PDFDocument({ margin: 50 });

    // Save to file (or directly stream to response)
    const invoicePath = path.join(__dirname, `../receipts/receipt_${order.id}.pdf`);
    doc.pipe(fs.createWriteStream(invoicePath));
    doc.pipe(res);

    // === HEADER ===
    doc
        .image(path.join(__dirname, '../assets/agri_logo.png'), 50, 45, { width: 80 }) // Your agri logo
        .fontSize(20)
        .fillColor('#2e7d32')
        .text('Agri Connect', 150, 50)
        .fontSize(10)
        .fillColor('#555')
        .text('Growing Connections, Growing Crops', 150, 70)
        .moveDown();

    // === BUYER DETAILS ===
    doc
        .fontSize(14)
        .fillColor('#2e7d32')
        .text('Invoice To:', 50, 150)
        .fontSize(12)
        .fillColor('#000')
        .text(order.customer_name, 50, 170)
        .text(order.shipping_address, 50, 185)
        .moveDown();

    // === ORDER DETAILS TABLE ===
    const tableTop = 250;
    doc
        .fontSize(14)
        .fillColor('#2e7d32')
        .text('Order Details', 50, tableTop - 20);

    generateTableRow(doc, tableTop, 'Crop', 'Farmer', 'Quantity', 'Price', 'Total');
    drawLine(doc, tableTop + 20);

    let position = tableTop + 30;
    order.items.forEach(item => {
        generateTableRow(
            doc,
            position,
            item.crop_name,
            item.farmer_name,
            `${item.quantity} kg`,
            `₹${item.price}`,
            `₹${item.quantity * item.price}`
        );
        position += 20;
    });

    // === TOTAL ===
    drawLine(doc, position + 10);
    doc.fontSize(12)
        .text(`Grand Total: ₹${order.total}`, 400, position + 20, { align: 'right' });

    // === FOOTER ===
    doc.moveDown(4)
        .fontSize(10)
        .fillColor('#777')
        .text('Thank you for buying from Agri Connect. Supporting farmers, one crop at a time.', { align: 'center' });

    doc.end();
}

function generateTableRow(doc, y, c1, c2, c3, c4, c5) {
    doc.fontSize(10)
        .text(c1, 50, y)
        .text(c2, 150, y)
        .text(c3, 250, y, { width: 90, align: 'right' })
        .text(c4, 350, y, { width: 90, align: 'right' })
        .text(c5, 450, y, { width: 90, align: 'right' });
}

function drawLine(doc, y) {
    doc.strokeColor('#2e7d32')
        .lineWidth(1)
        .moveTo(50, y)
        .lineTo(550, y)
        .stroke();
}

module.exports = generateInvoice;
