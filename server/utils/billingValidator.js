const fs = require('fs');
const csv = require('csv-parser');

const normalizeHeader = (h) => {
  return h.trim().toLowerCase().replace(/[\s\-_]/g, '');
};

const validateBillingCSV = (filePath, defaultProvider = 'aws', originalName = '') => {
  return new Promise((resolve, reject) => {
    const results = [];
    const errors = [];
    let lineCount = 0;

    const readStream = fs.createReadStream(filePath);
    const parser = readStream.pipe(csv());

    parser
      .on('headers', (rawHeaders) => {
        const normHeaders = rawHeaders.map(normalizeHeader);

        // Flexible column mapping
        const hasDate = normHeaders.some(h => ['date', 'timestamp', 'time', 'day', 'datetime'].includes(h));
        const hasService = normHeaders.some(h => ['service', 'servicename', 'product', 'resource', 'servicecode'].includes(h));
        const hasCost = normHeaders.some(h => ['cost', 'spend', 'amount', 'totalcost', 'unblendedcost'].includes(h));

        const missing = [];
        if (!hasDate) missing.push('date');
        if (!hasService) missing.push('service');
        if (!hasCost) missing.push('cost');

        if (missing.length > 0) {
          errors.push(`Missing required columns: ${missing.join(', ')}. Found: ${rawHeaders.join(', ')}`);
          readStream.on('close', () => {
            resolve({ isValid: false, errors, records: [] });
          });
          readStream.destroy();
        }
      })
      .on('data', (row) => {
        lineCount++;

        // Skip empty rows
        if (Object.keys(row).length === 0 || Object.values(row).every(v => !v || v.trim() === '')) {
          return;
        }

        // Normalize keys for lookups
        const normalizedRow = {};
        Object.keys(row).forEach(k => {
          normalizedRow[normalizeHeader(k)] = row[k];
        });

        const dateVal = normalizedRow['date'] || normalizedRow['timestamp'] || normalizedRow['time'] || normalizedRow['day'];
        const serviceVal = normalizedRow['service'] || normalizedRow['servicename'] || normalizedRow['product'] || normalizedRow['resource'] || 'Compute';
        const costVal = normalizedRow['cost'] || normalizedRow['spend'] || normalizedRow['amount'] || normalizedRow['totalcost'] || normalizedRow['unblendedcost'];
        const regionVal = normalizedRow['region'] || normalizedRow['location'] || normalizedRow['zone'] || 'us-east-1';
        const usageTypeVal = normalizedRow['usagetype'] || normalizedRow['type'] || normalizedRow['usage'] || 'StandardUsage';

        // --- Provider resolution: CSV column wins, then keyword scan, then filename ---
        // Normalize common provider name variants from CSV column
        const rawProviderCol = (normalizedRow['provider'] || normalizedRow['cloud'] || normalizedRow['platform'] || '').trim().toLowerCase();
        let resolvedProvider = '';

        if (rawProviderCol.includes('azure') || rawProviderCol.includes('microsoft')) {
          resolvedProvider = 'azure';
        } else if (rawProviderCol.includes('gcp') || rawProviderCol.includes('google')) {
          resolvedProvider = 'gcp';
        } else if (rawProviderCol.includes('aws') || rawProviderCol.includes('amazon')) {
          resolvedProvider = 'aws';
        } else if (['aws', 'azure', 'gcp'].includes(rawProviderCol)) {
          resolvedProvider = rawProviderCol;
        }

        // If CSV column had no recognized provider, fall back to keyword scan on row content
        if (!resolvedProvider) {
          const rowStr = JSON.stringify(normalizedRow).toLowerCase();
          if (rowStr.includes('azure') || rowStr.includes('meter') || rowStr.includes('subscription') || rowStr.includes('resourcegroup') || rowStr.includes('virtual machines') || rowStr.includes('blob') || rowStr.includes('microsoft')) {
            resolvedProvider = 'azure';
          } else if (rowStr.includes('gcp') || rowStr.includes('google') || rowStr.includes('bigquery') || rowStr.includes('compute engine') || rowStr.includes('cloud storage')) {
            resolvedProvider = 'gcp';
          } else if (rowStr.includes('aws') || rowStr.includes('ec2') || rowStr.includes('s3') || rowStr.includes('unblendedcost') || rowStr.includes('amazon')) {
            resolvedProvider = 'aws';
          } else {
            // Final fallback: use the defaultProvider passed from billingController (filename-based)
            resolvedProvider = defaultProvider;
          }
        }

        // Validate provider is one of the 3 known providers
        let provider = resolvedProvider;
        if (!['aws', 'azure', 'gcp'].includes(provider)) {
          errors.push(`Row ${lineCount}: Invalid cloud provider "${rawProviderCol || provider}". Only AWS, Azure, and GCP billing files are supported.`);
          return;
        }

        // Validate date format
        const dateObj = new Date(dateVal);
        if (isNaN(dateObj.getTime())) {
          errors.push(`Row ${lineCount}: Invalid date format "${dateVal}".`);
          return;
        }

        // Validate cost is numeric
        const cleanCostStr = String(costVal).trim().replace('$', '').replace(/,/g, '');
        const cost = Number(cleanCostStr);
        if (isNaN(cost) || cost < 0) {
          errors.push(`Row ${lineCount}: Invalid cost amount "${costVal}".`);
          return;
        }

        results.push({
          provider,
          date: dateObj,
          service: serviceVal.trim(),
          region: regionVal.trim(),
          usageType: usageTypeVal.trim(),
          cost,
          accountId: normalizedRow['accountid'] || normalizedRow['account'] || 'N/A',
        });
      })
      .on('end', () => {
        readStream.on('close', () => {
          if (lineCount === 0 || results.length === 0) {
            errors.push('The CSV file contains no valid data rows.');
            resolve({ isValid: false, errors, records: [] });
            return;
          }

          if (errors.length > 0 && results.length === 0) {
            resolve({ isValid: false, errors: errors.slice(0, 50), records: [] });
          } else {
            // Success: return validated records
            resolve({ isValid: true, errors: [], records: results });
          }
        });
        readStream.destroy();
      })
      .on('error', (err) => {
        readStream.on('close', () => {
          resolve({ isValid: false, errors: [err.message], records: [] });
        });
      });
  });
};

module.exports = {
  validateBillingCSV,
};
