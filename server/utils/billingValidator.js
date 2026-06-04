const fs = require('fs');
const csv = require('csv-parser');

const REQUIRED_HEADERS = ['date', 'service', 'cost', 'region', 'usage_type', 'provider'];

const validateBillingCSV = (filePath) => {
  return new Promise((resolve, reject) => {
    const results = [];
    const errors = [];
    let headers = null;
    let lineCount = 0;

    const stream = fs.createReadStream(filePath)
      .pipe(csv())
      .on('headers', (hdrList) => {
        headers = hdrList.map(h => h.trim().toLowerCase());
        
        // Check for missing headers
        const missing = REQUIRED_HEADERS.filter(h => !headers.includes(h));
        if (missing.length > 0) {
          errors.push(`Missing required columns: ${missing.join(', ')}`);
          stream.destroy();
          resolve({ isValid: false, errors, records: [] });
        }
      })
      .on('data', (row) => {
        lineCount++;
        
        // Check if row has data
        if (Object.keys(row).length === 0 || Object.values(row).every(v => v === '')) {
          errors.push(`Row ${lineCount}: Empty record detected.`);
          return;
        }

        const dateVal = row['date'] || row['Date'];
        const serviceVal = row['service'] || row['Service'];
        const costVal = row['cost'] || row['Cost'];
        const regionVal = row['region'] || row['Region'];
        const usageTypeVal = row['usage_type'] || row['Usage_type'] || row['Usage Type'] || row['usageType'];
        const providerVal = row['provider'] || row['Provider'];

        // Validate values presence
        if (!dateVal || !serviceVal || !costVal || !regionVal || !usageTypeVal || !providerVal) {
          errors.push(`Row ${lineCount}: Missing required fields. Got [Date: ${dateVal}, Service: ${serviceVal}, Cost: ${costVal}, Provider: ${providerVal}]`);
          return;
        }

        // Validate provider enum
        const provider = providerVal.trim().toLowerCase();
        if (!['aws', 'azure', 'gcp'].includes(provider)) {
          errors.push(`Row ${lineCount}: Invalid provider "${providerVal}". Allowed values are: aws, azure, gcp.`);
          return;
        }

        // Validate date format
        const dateObj = new Date(dateVal);
        if (isNaN(dateObj.getTime())) {
          errors.push(`Row ${lineCount}: Invalid date format "${dateVal}". Provide a valid date string (e.g. YYYY-MM-DD).`);
          return;
        }

        // Validate cost is numeric
        const cost = Number(costVal.trim().replace('$', '').replace(/,/g, ''));
        if (isNaN(cost) || cost < 0) {
          errors.push(`Row ${lineCount}: Cost "${costVal}" must be a valid non-negative number.`);
          return;
        }

        results.push({
          provider,
          date: dateObj,
          service: serviceVal.trim(),
          region: regionVal.trim(),
          usageType: usageTypeVal.trim(),
          cost,
          accountId: row['account_id'] || row['accountId'] || row['Account ID'] || 'N/A',
        });
      })
      .on('end', () => {
        if (lineCount === 0) {
          errors.push('The CSV file is empty.');
          resolve({ isValid: false, errors, records: [] });
          return;
        }

        if (errors.length > 0) {
          resolve({ isValid: false, errors: errors.slice(0, 50), records: [] }); // Limit errors list
        } else {
          resolve({ isValid: true, errors: [], records: results });
        }
      })
      .on('error', (err) => {
        reject(err);
      });
  });
};

module.exports = {
  validateBillingCSV,
};
