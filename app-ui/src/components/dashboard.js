import React, { useEffect, useState } from "react";
import { Button, Container, useToaster, Content, Divider, FlexboxGrid, Header, Input, InputGroup, List, Loader, Message, Modal, Placeholder, SelectPicker } from "rsuite"
import { AsyncStockSymbolsSearchComponent } from "./async-stock-symbols-picker";
import { fetcherApi } from "./utils";


const AddWatchListCheckMsg = (props) => {
  return(
    <Message closable showIcon type={props.type} header={props.header} style={{marginTop: "inherit"}} onClose={() => props.setMsgOnClose("")}>
      {props.info}
    </Message>
  )
};
  
const AddWatchListModal = (props) => {
  const handleClose = () => props.setOpen(false);
  const [wathclistName, setWatchlistName] = useState("");
  const [selectedSymbols, setSelectedSymbols] = useState();
  const [saveWatchListCheckMsg, setSaveWatchListCheckMsg] = useState();
  const [saveChangesButtonState, setSaveChangesButtonState] =  useState("Save Changes");
  const handleSaveWatchlist = () => {
    console.log(wathclistName, selectedSymbols);
    if(wathclistName === "") {
      setSaveWatchListCheckMsg(
        <AddWatchListCheckMsg type="error" header="Error" info="Please add a watchlist name" setMsgOnClose={setSaveWatchListCheckMsg}/>
      )
      return;
    } else setSaveWatchListCheckMsg("")
    setSaveChangesButtonState(<Loader content="Saving watchlist..." />);
    fetcherApi(
      '/v1/watchlist/create',
      'POST',
      {}
    ).then(response => {
      console.log(response.status);
    }).catch(error => {
      console.error(error);
      setSaveChangesButtonState("Save Changes");
      setSaveWatchListCheckMsg(
        <AddWatchListCheckMsg type="error" header="Error" info="Something went wrong, unable to save watchlist" setMsgOnClose={setSaveWatchListCheckMsg}/>
      )
    });
  };

  return(
    <Modal size="lg" open={props.open} onClose={handleClose}>
      <Modal.Header>
        <Modal.Title>Add New Watchlist</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <InputGroup>
          <InputGroup.Addon>Enter Watchlist name</InputGroup.Addon>
          <Input onChange={setWatchlistName} size="lg" required={true}/>
        </InputGroup>
        <br/>
        <AsyncStockSymbolsSearchComponent setSelectedSymbols={setSelectedSymbols}/>
        {saveWatchListCheckMsg}
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={handleClose} appearance="subtle">
          Cancel
        </Button>
        <Button onClick={handleSaveWatchlist} appearance="primary">
          {saveChangesButtonState}
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

const EditWatchListModal = (props) => {
  const handleClose = () => props.setOpen(false);
  return(
    <Modal size="lg" open={props.open} onClose={handleClose}>
      <Modal.Header>
        <Modal.Title>Edit Watchlist</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Placeholder.Paragraph />
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={handleClose} appearance="subtle">
          Cancel
        </Button>
        <Button onClick={handleClose} appearance="primary">
          Save Changes
        </Button>
      </Modal.Footer>
    </Modal>
  )
}


const StocksWatchlistItem = (props) => {
  const [stockInfo, setStockInfo] = useState({
    open: "",
    high: "",
    low: "",
    price: "",
    volume: "",
    prev_close: ""
  });
  const [stockInfoLoader, setStockInfoLoader] = useState(<Loader/>);
  const toaster = useToaster();

  const fetchMetrics = () => {
    setStockInfoLoader(<Loader/>);
    fetcherApi(
      `/v1/stocks/${props.stockName}`,
      'GET',
      {}
    ).then(response => {
      console.log(response);
      response = response["Global Quote"];
      setStockInfo({
        open: response["02. open"],
        high: response["03. high"],
        low: response["04. low"],
        price: response["05. price"],
        volume: response["06. volume"],
        prev_close: response["08. previous close"]
      })
      setStockInfoLoader();
    }).catch(error => {
      console.error(error);
      setStockInfoLoader();
      setErrValsMetrics();
      toaster.push(
        <Message closable type="error">
          API rate limit exceeded! Please try again after some time.
        </Message>, 
        { placement: "topCenter", duration: 10000 }
      );
    });
  };
  useEffect(() => {
    fetchMetrics();
  }, []);

  
  const setErrValsMetrics = () => {
    stockInfo.open = "--";
    stockInfo.high = "--";
    stockInfo.low = "--";
    stockInfo.price = "--";
    stockInfo.volume = "--";
    stockInfo.prev_close = "--";
  };


  return(
    <List.Item>
      <FlexboxGrid justify="space-between" style={{textAlign: "center"}}>
        <FlexboxGrid.Item colspan={3}>{props.stockName}</FlexboxGrid.Item>
        <FlexboxGrid.Item colspan={3}>{stockInfoLoader} {stockInfo.open}</FlexboxGrid.Item>
        <FlexboxGrid.Item colspan={3}>{stockInfoLoader} {stockInfo.high}</FlexboxGrid.Item>
        <FlexboxGrid.Item colspan={3}>{stockInfoLoader} {stockInfo.low}</FlexboxGrid.Item>
        <FlexboxGrid.Item colspan={3}>{stockInfoLoader} {stockInfo.price}</FlexboxGrid.Item>
        <FlexboxGrid.Item colspan={3}>{stockInfoLoader} {stockInfo.volume}</FlexboxGrid.Item>
        <FlexboxGrid.Item colspan={3}>{stockInfoLoader} {stockInfo.prev_close}</FlexboxGrid.Item>
      </FlexboxGrid>
    </List.Item>
  )
}


const StocksWatchlistComponent = (props) => {
  const [stocksList, setStockList] = useState([]);
  useEffect(() => {
    console.log("StocksWatchlistComponent ", props.symbols);
    const symbolsList = props.symbols.map((stockName) => <StocksWatchlistItem key={stockName} stockName={stockName}/>);
    setStockList(symbolsList);
  }, []);

  return(
    <Content justify="center">
      <Message closable type="info" style={{marginBottom:"10px"}}>
        Stock Metrics will reload in 1min
      </Message>
      <List bordered hover>
        <List.Item>
          <FlexboxGrid justify="space-between" style={{textAlign: "center"}}>
            {
              ["Stock Name", "Open", "High", "Low", "Price", "Volume", "Previous Close"].map((e) =>
                <FlexboxGrid.Item key={e} colspan={3}>{e}</FlexboxGrid.Item>
              )
            }
          </FlexboxGrid>
        </List.Item>
        {stocksList}
      </List>
      
    </Content>
  );
};


const Dashboard = (props) => {
  const [watchlistSelect, setWatchlistSelect] = useState(Object.keys(props.userInfo.watchlists)[0]);
  const [openAddWatchlist, setOpenAddWatchlist] = useState(false);
  const [openEditWatchlist, setOpenEditWatchlist] = useState(false);
  const [editBtnDisabled, setEditBtnDisabled] = useState(false);
  const [userStockSymbolsView, setUserStockSymbolsView] = useState();
  // <PageCenterLoader info="Loading stocks..."/>
  useEffect(() => {
    console.log(watchlistSelect);
    if(watchlistSelect === null || watchlistSelect === undefined){
      setEditBtnDisabled(true);
      return;
    }
    else
      setEditBtnDisabled(false);

    console.log(watchlistSelect);
    console.log("sdfsdfsdfs");
    if(props.userInfo.watchlists[watchlistSelect].symbols.length === 0) {
      setUserStockSymbolsView(
        <AddWatchListCheckMsg style={{marginTop: "10px"}} type="info" header="No stocks found in this watchlist" info="" setMsgOnClose={setUserStockSymbolsView}/>
      );
    } else {
      console.log(props.userInfo.watchlists[watchlistSelect].symbols);
      console.log("selected symbol");
      setUserStockSymbolsView(
        <StocksWatchlistComponent symbols={props.userInfo.watchlists[watchlistSelect].symbols} key={Date.now()}/>
      )
    }
  }, [watchlistSelect]);

  const addWatchList = () => {
    setOpenAddWatchlist(true);
  };

  const editWatchList = () => {
    setOpenEditWatchlist(true);
  };

  return(
    <Container>
      <Header>Dashboard content is here</Header>
      <b>
        <h4>Welcome {props.userInfo.username}!</h4>
        <Divider/>
        <div>
          {
            Object.keys(props.userInfo.watchlists).length === 0 ? 
              <Message showIcon closable type="info" style={{marginBottom:"10px"}}>
                You dont have any watchlist
              </Message>
            :
              <>
                Select a watchlist to view &nbsp;
                <SelectPicker
                  data={Object.keys(props.userInfo.watchlists).map(item => ({"label": props.userInfo.watchlists[item].name, "value": item}))}
                  label="Watchlist"
                  onChange={setWatchlistSelect}
                  defaultValue={watchlistSelect}
                />
                <Button appearance="primary" style={{marginLeft: "10px"}} onClick={editWatchList} disabled={editBtnDisabled}>Edit watchlist</Button>
              </> 
          }
          <Button appearance="primary" style={{marginLeft: "10px"}} onClick={addWatchList}>Add watchlist</Button>
        </div>
      </b>
      <AddWatchListModal open={openAddWatchlist} setOpen={setOpenAddWatchlist}/>
      <EditWatchListModal open={openEditWatchlist} setOpen={setOpenEditWatchlist}/>
      <Divider/>
      <Content>
        {userStockSymbolsView}
      </Content>
    </Container>
  )
}

export {Dashboard};