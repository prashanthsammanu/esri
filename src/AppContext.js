import { createContext, useContext, useState } from 'react';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [fid, setFID] = useState(null);

  const setGlobalFID = (newFID) => {
    setFID(newFID);
  };

  return (
    <AppContext.Provider value={{ fid, setGlobalFID }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  return useContext(AppContext);
};
