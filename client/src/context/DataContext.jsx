import React, { createContext, useContext, useState, useCallback } from 'react';

/**
 * DataContext — Global signal bus for CSV upload events.
 *
 * Usage:
 *   const { lastUploadTime, notifyUpload } = useDataContext();
 *
 * When a CSV is uploaded successfully, call `notifyUpload()`.
 * Any page that includes `lastUploadTime` in its useEffect dependency array
 * will automatically re-fetch its data.
 */
const DataContext = createContext({
  lastUploadTime: null,
  lastUploadFileId: null,
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

  const notifyUpload = useCallback((fileId = null) => {
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
  }, []);

  return (
    <DataContext.Provider value={{ lastUploadTime, lastUploadFileId, notifyUpload }}>
      {children}
    </DataContext.Provider>
  );
};

export const useDataContext = () => useContext(DataContext);
export default DataContext;
