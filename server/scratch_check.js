const mongoose = require('mongoose');

async function checkTotal() {
  try {
    await mongoose.connect('mongodb://localhost:27017/cloudatlas');
    const db = mongoose.connection.db;
    
    const latestFile = await db.collection('uploadedfiles').findOne({}, { sort: { createdAt: -1 } });
    if (latestFile) {
      console.log('ACTIVE_CSV_NAME:', latestFile.originalName);
      const records = await db.collection('billingdatas').find({
        $or: [{ fileId: latestFile._id }, { fileId: String(latestFile._id) }]
      }).toArray();
      let sum = 0;
      records.forEach(r => {
        const raw = r.cost ?? r.Cost ?? r.amount ?? r.price ?? 0;
        sum += (typeof raw === 'string' ? parseFloat(raw.replace(/[^0-9.-]+/g, '')) : Number(raw)) || 0;
      });
      console.log('TOTAL_RECORDS_IN_CSV:', records.length);
      console.log('EXACT_CSV_TOTAL_SPEND:', '$' + Math.round(sum).toLocaleString() + ` (${sum.toFixed(2)})`);
    } else {
      const records = await db.collection('billingdatas').find({}).toArray();
      let sum = 0;
      records.forEach(r => {
        sum += Number(r.cost) || 0;
      });
      console.log('TOTAL_RECORDS:', records.length);
      console.log('EXACT_TOTAL_SPEND:', '$' + Math.round(sum).toLocaleString());
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkTotal();
