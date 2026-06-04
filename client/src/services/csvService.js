export const exportToCSV = (data, filename = 'cloudatlas_billing_export.csv') => {
  if (!data || data.length === 0) return;

  const headers = ['Date', 'Provider', 'Service', 'Region', 'Usage Type', 'Cost', 'Account ID'];
  
  const csvRows = [];
  
  // Append headers
  csvRows.push(headers.join(','));
  
  // Format rows
  data.forEach((item) => {
    const values = [
      new Date(item.date).toISOString().split('T')[0],
      item.provider.toUpperCase(),
      `"${item.service.replace(/"/g, '""')}"`,
      item.region,
      `"${item.usageType.replace(/"/g, '""')}"`,
      item.cost,
      item.accountId || 'N/A'
    ];
    csvRows.push(values.join(','));
  });
  
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
