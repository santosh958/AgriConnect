const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

function generateOrderReceipt(order, callback) {
  const doc = new PDFDocument();
  const fileName = `receipt_${order.order_id}.pdf`;
  const folderPath = path.join(__dirname, 'receipts');

  if (!fs.existsSync(folderPath)) fs.mkdirSync(folderPath);

  const filePath = path.join(folderPath, fileName);
  const stream = fs.createWriteStream(filePath);
  doc.pipe(stream);

  // 🔰 Header
  doc.fontSize(20).fillColor('#2E8B57').text('🧾 AgriConnect - Order Receipt', { align: 'center' }).moveDown();

  // 📋 Order Info
  doc.fontSize(12).fillColor('black')
    .text(`📄 Order ID: ${order.order_id}`)
    .text(`👨‍🌾 Farmer: ${order.farmer_name}`)
    .text(`🧑‍💼 Buyer: ${order.buyer_name}`)
    .text(`📍 Location: ${order.location}`)
    .text(`🕒 Date: ${new Date().toLocaleString()}`)
    .moveDown();

  // 🌱 Crop Info
  const total = order.price_per_kg * order.quantity;
  doc.fontSize(14)
    .text(`🌾 Crop: ${order.crop_name}`)
    .text(`📦 Quantity: ${order.quantity} kg`)
    .text(`💰 Price per Kg: ₹${order.price_per_kg}`)
    .text(`🧾 Total Amount: ₹${total}`)
    .moveDown();

  // 🙏 Footer
  doc.fontSize(11).fillColor('gray')
    .text('Thank you for supporting Indian Farmers 🇮🇳💚', { align: 'center' });

  doc.end();

  stream.on('finish', () => callback(filePath));
}

module.exports = generateOrderReceipt;
