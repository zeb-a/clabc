import React, { createContext, useContext, useState } from 'react';

const PageHelpContext = createContext({
  pageId: null,
  setPageId: () => {}
});

export function PageHelpProvider({ children }) {
  const [pageId, setPageId] = useState(null);
  return (
    <PageHelpContext.Provider value={{ pageId, setPageId }}>
      {children}
    </PageHelpContext.Provider>
  );
}

export function usePageHelp() {
  return useContext(PageHelpContext);
}
