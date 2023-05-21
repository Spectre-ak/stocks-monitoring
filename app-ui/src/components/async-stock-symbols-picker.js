import React, { useEffect, useState } from "react";
import { TagPicker } from 'rsuite';
import SpinnerIcon from '@rsuite/icons/legacy/Spinner';

const useStockSymbols = (defaultSymbols = []) => {
  const [stockSymbols, setUsers] = useState(defaultSymbols);
  const [loading, setLoading] = useState(false);
  const fetchSymbols = word => {
    setLoading(true);
    fetch(`/v1/stocks/search/${word}`)
      .then(response => response.json())
      .then(data => {
        setUsers(data.bestMatches.map(i => ({
          "label": `${i['1. symbol']}, ${i['2. name']}`,
          "symbol": i['1. symbol']
        })));
        setLoading(false);
      })
      .catch(e => console.log('Error fetching search options', e));
  };

  return [stockSymbols, loading, fetchSymbols];
};


const AsyncStockSymbolsSearchComponent = (props) => {
  const [stockSymbols, loading, fetchSymbols] = useStockSymbols();
  const [value, setValue] = React.useState([]);
  const [cacheData, setCacheData] = React.useState([]);
  const [searchText, setSearchText] = React.useState("");
  

  const handleSelect = (value, item, event) => {
    setCacheData([...cacheData, item]);
  };

  useEffect(() => {
    if(searchText === "")
      return;
    const searchWaitTimeoutId = setTimeout(() => fetchSymbols(searchText), 1500);
    return () => clearTimeout(searchWaitTimeoutId);
  }, [searchText]);

  useEffect(() => {
    props.setSelectedSymbols(value);
  }, [value])

  return (
    <TagPicker
      data={stockSymbols}
      cacheData={cacheData}
      value={value}
      style={{ width: "100%" }}
      placeholder="Search stock symbols using keywords, e.g. Google, Microsoft, AMZN, MSFT"
      size="lg"
      labelKey="label"
      valueKey="symbol"
      onChange={setValue}
      onSearch={setSearchText}
      onSelect={handleSelect}
      renderMenu={menu => {
        if (loading) {
          return (
            <p style={{ padding: 4, color: '#999', textAlign: 'center' }}>
              <SpinnerIcon spin /> Loading...
            </p>
          );
        }
        return menu;
      }}
    />
  );
};


export {AsyncStockSymbolsSearchComponent};