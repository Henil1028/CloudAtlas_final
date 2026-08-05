import React, { createContext, useContext, useState, useCallback } from 'react';

/**
 * DataContext — Global signal bus for CSV upload/dataset-switch events.
 *
 * Usage:
 *   const { lastUploadTime, notifyUpload, activeProvider } = useDataContext();
 *
 * When a CSV is uploaded or a dataset is activated, call `notifyUpload(fileId, provider)`.
 * Any page that includes `lastUploadTime` or `activeProvider` in its dependency array
 * will automatically re-sync.
 */
const DataContext = createContext({
  lastUploadTime: null,
  lastUploadFileId: null,
  activeProvider: 'aws',
  notifyUpload: () => {},
});

export const DataContextProvider = ({ children }) => {
  const [lastUploadTime, setLastUploadTime] = useState(() => Date.now());
  const [lastUploadFileId, setLastUploadFileId] = useState(() => {
    try {
      return localStorage.getItem('cloudatlas_active_file_id') || null;
    } catch (e) {
      return null;
    }
  });

  const [activeProvider, setActiveProvider] = useState(() => {
    try {
      return (
        localStorage.getItem('csv-detected-provider') ||
        localStorage.getItem('cloudatlas_active_provider') ||
        'aws'
      ).toLowerCase();
    } catch (e) {
      return 'aws';
    }
  });

  const notifyUpload = useCallback((fileId = null, provider = null) => {
    setLastUploadTime(Date.now());

    if (fileId) {
      setLastUploadFileId(fileId);
      try {
        localStorage.setItem('cloudatlas_active_file_id', fileId);
      } catch (e) {}
    } else {
      setLastUploadFileId(null);
      try {
        localStorage.removeItem('cloudatlas_active_file_id');
      } catch (e) {}
    }

    if (provider) {
      const p = provider.toLowerCase();
      setActiveProvider(p);
      try {
        localStorage.setItem('csv-detected-provider', p);
        localStorage.setItem('cloudatlas_active_provider', p);
      } catch (e) {}
    }
  }, []);

  return (
    <DataContext.Provider value={{ lastUploadTime, lastUploadFileId, activeProvider, notifyUpload }}>
      {children}
    </DataContext.Provider>
  );
};

export const useDataContext = () => useContext(DataContext);
export default DataContext;
