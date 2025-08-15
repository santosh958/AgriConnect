// generateGroupReceipt.js
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

function generateGroupReceipt(orders, callback) {
  const doc = new PDFDocument();
  const fileName = `group_receipt_${orders[0].group_id}.pdf`;
  const filePath = path.join(__dirname, 'receipts', fileName);

  if (!fs.existsSync(path.join(__dirname, 'receipts'))) {
    fs.mkdirSync(path.join(__dirname, 'receipts'));
  }

  const stream = fs.createWriteStream(filePath);
  doc.pipe(stream);

  doc.fontSize(22).fillColor('#2E8B57').text('🧾 AgriConnect - Combined Order Receipt', { align: 'center' }).moveDown();

  doc.fontSize(12).fillColor('black')
    .text(`🧑‍💼 Buyer: ${orders[0].buyer_name}`)
    .text(`📍 Location: ${orders[0].location}`)
    .text(`🕒 Date: ${new Date().toLocaleString()}`).moveDown();

  let total = 0;
  orders.forEach((order, i) => {
    const subtotal = order.price_per_kg * order.quantity;
    total += subtotal;

    doc.fontSize(12).fillColor('black')
      .text(`🔸 Crop #${i + 1}`)
      .text(`   🌱 Crop: ${order.crop_name}`)
      .text(`   👨‍🌾 Farmer: ${order.farmer_name}`)
      .text(`   📦 Qty: ${order.quantity} kg`)
      .text(`   💰 Price per Kg: ₹${order.price_per_kg}`)
      .text(`   🧾 Subtotal: ₹${subtotal}`)
      .moveDown();
  });

  doc.fontSize(14).fillColor('#000').text(`✅ Total Amount: ₹${total}`).moveDown();

  doc.fontSize(11).fillColor('gray').text('Thank you for supporting farmers! 💚', { align: 'center' });
  doc.end();

  stream.on('finish', () => callback(filePath));
}

module.exports = generateGroupReceipt;

