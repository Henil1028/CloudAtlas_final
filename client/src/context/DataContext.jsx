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
  const [lastUploadTime, setLastUploadTime] = useState(null);
  const [lastUploadFileId, setLastUploadFileId] = useState(null);

  const notifyUpload = useCallback((fileId = null) => {
    setLastUploadTime(Date.now());
    setLastUploadFileId(fileId || null);
  }, []);

  return (
    <DataContext.Provider value={{ lastUploadTime, lastUploadFileId, notifyUpload }}>
      {children}
    </DataContext.Provider>
  );
};

export const useDataContext = () => useContext(DataContext);
export default DataContext;
