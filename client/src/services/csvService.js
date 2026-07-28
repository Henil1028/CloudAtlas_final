export const exportToCSV = (data, filename = 'cloudatlas_billing_export.csv') => {
  if (!data || data.length === 0) return;

  const csvRows = [];
  // If data is already an array of arrays (pre-formatted rows)
  if (Array.isArray(data[0])) {
    data.forEach(row => {
      csvRows.push(row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','));
    });
  } else {
    // Append headers
    const headers = ['Date', 'Provider', 'Service', 'Region', 'Usage Type', 'Cost', 'Account ID'];
    csvRows.push(headers.join(','));
    
    // Format rows
    data.forEach((item) => {
      let formattedDate = 'N/A';
      try {
        if (item.date) {
          formattedDate = new Date(item.date).toISOString().split('T')[0];
        }
      } catch (e) {}
      
      const values = [
        formattedDate,
        (item.provider || 'N/A').toUpperCase(),
        `"${(item.service || 'N/A').replace(/"/g, '""')}"`,
        item.region || 'N/A',
        `"${(item.usageType || 'N/A').replace(/"/g, '""')}"`,
        item.cost || 0,
        item.accountId || 'N/A'
      ];
      csvRows.push(values.join(','));
    });
  }
  
  const csvString = csvRows.join('\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
