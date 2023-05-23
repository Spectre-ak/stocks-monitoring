import React, { useEffect, useState } from "react";
import { Button, Container, useToaster, Content, Divider, FlexboxGrid, Header, Input, InputGroup, List, Loader, Message, Modal, Placeholder, SelectPicker } from "rsuite"
import { AsyncStockSymbolsSearchComponent } from "./async-stock-symbols-picker";
import { checkUserSessionOver, fetcherApi, updateSelectedWatchlist } from "./utils";


const AddWatchListCheckMsg = (props) => {
    return (
        <Message closable showIcon type={props.type} header={props.header} style={{ marginTop: "inherit" }} onClose={() => props.setMsgOnClose("")}>
            {props.info}
        </Message>
    )
};


const ManageWatchlistModal = (props) => {
    const handleClose = () => props.setOpen(false);
    const [wathclistName, setWatchlistName] = useState(props.editWatchlist ? props.userInfo.watchlists[props.watchlistSelect].name : "");
    const [selectedSymbols, setSelectedSymbols] = useState();
    const [saveWatchListCheckMsg, setSaveWatchListCheckMsg] = useState();
    const [saveChangesButtonState, setSaveChangesButtonState] = useState(props.editWatchlist ? "Update Watchlist" : "Create Watchlist");
    const [defaultSelectedSymbols, setDefaultSelectedSymbols] = useState(props.editWatchlist ? props.userInfo.watchlists[props.watchlistSelect].symbols.map(e => ({ label: e, symbol: e })) : undefined);

    const handleSaveWatchlist = () => {
        console.log(wathclistName, selectedSymbols);
        if (wathclistName === "") {
            setSaveWatchListCheckMsg(
                <AddWatchListCheckMsg type="error" header="Error" info="Please add a watchlist name" setMsgOnClose={setSaveWatchListCheckMsg} />
            )
            return;
        } else setSaveWatchListCheckMsg("")
        setSaveChangesButtonState(<Loader content="Saving watchlist..." />);
        fetcherApi(
            props.editWatchlist ? '/v1/watchlist/update' : '/v1/watchlist/create',
            'POST',
            {
                selectedSymbols: selectedSymbols,
                wathclistName: wathclistName,
                username: props.userInfo.username,
                watchlistId: props.editWatchlist ? props.watchlistSelect : ""
            }
        ).then(response => {
            console.log(response);
            if (response.status) {
                updateSelectedWatchlist(response.watchlist_id)
                window.location.reload();
            }
        }).catch(error => {
            console.error(error);
            setSaveChangesButtonState(props.editWatchlist ? "Update Watchlist" : "Create Watchlist");
            setSaveWatchListCheckMsg(
                <AddWatchListCheckMsg type="error" header="Error" info={error.toString() === "Error: UNAUTHORIZED" ? "Session over, please login again" : "Something went wrong, unable to save watchlist"} setMsgOnClose={setSaveWatchListCheckMsg} />
            )
        });
    };

    return (
        <Modal size="lg" open={props.open} onClose={handleClose}>
            <Modal.Header>
                <Modal.Title>{props.editWatchlist ? "Edit" : "Add New"} Watchlist</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <InputGroup>
                    <InputGroup.Addon>Enter Watchlist name</InputGroup.Addon>
                    <Input onChange={setWatchlistName} size="lg" required={true} value={wathclistName} />
                </InputGroup>
                <br />
                <AsyncStockSymbolsSearchComponent setSelectedSymbols={setSelectedSymbols} defaultSelectedSymbols={defaultSelectedSymbols} />
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


const StocksWatchlistItem = (props) => {
    const [stockInfo, setStockInfo] = useState({
        open: "",
        high: "",
        low: "",
        price: "",
        volume: "",
        prev_close: ""
    });
    const [stockInfoLoader, setStockInfoLoader] = useState(<Loader />);
    const toaster = useToaster();

    const fetchMetrics = () => {
        setStockInfoLoader(<Loader />);
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
            console.log(error.toString());
            if(error.toString() === "Error: UNAUTHORIZED") toaster.push(<Message closable>Session over, please login again</Message>, {duration: 5000});
            else 
            toaster.push(
                <Message closable type="error">
                    API rate limit exceeded! Please try again after some time.
                </Message>,
                { placement: "topCenter", duration: 10000 }
            );
            setStockInfoLoader();
            setErrValsMetrics();
            
        });
    };
    useEffect(() => {
        fetchMetrics();
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            console.log("updating metrics for ", props.stockName);
            fetchMetrics();
        }, 70000);
        return () => clearInterval(interval);
    }, []);

    const setErrValsMetrics = () => {
        stockInfo.open = "--";
        stockInfo.high = "--";
        stockInfo.low = "--";
        stockInfo.price = "--";
        stockInfo.volume = "--";
        stockInfo.prev_close = "--";
    };


    return (
        <List.Item>
            <FlexboxGrid justify="space-between" style={{ textAlign: "center" }}>
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
        const symbolsList = props.symbols.map((stockName) => <StocksWatchlistItem key={stockName} stockName={stockName} />);
        setStockList(symbolsList);
    }, []);

    return (
        <Content justify="center">
            <Message closable type="info" style={{ marginBottom: "10px" }}>
                Stock Metrics will reload in 1min
            </Message>
            <List bordered hover>
                <List.Item>
                    <FlexboxGrid justify="space-between" style={{ textAlign: "center" }}>
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
    const [watchlistSelect, setWatchlistSelect] = useState(props.savedWatchlist);
    const [openWatchlistManageModal, setOpenWatchlistManageModal] = useState(false);
    const [editBtnDisabled, setEditBtnDisabled] = useState(false);
    const [userStockSymbolsView, setUserStockSymbolsView] = useState();
    const [editWatchlist, setEditwatchlist] = useState();
    const [watchlistManageModal, launchWatchlistManageModal] = useState();

    useEffect(() => {
        console.log(watchlistSelect);
        if (watchlistSelect === null || watchlistSelect === undefined) {
            setEditBtnDisabled(true);
            return;
        }
        else
            setEditBtnDisabled(false);

        console.log(watchlistSelect);
        console.log("sdfsdfsdfs");
        if (props.userInfo.watchlists[watchlistSelect].symbols.length === 0) {
            setUserStockSymbolsView(
                <AddWatchListCheckMsg style={{ marginTop: "10px" }} type="info" header="No stocks found in this watchlist" info="" setMsgOnClose={setUserStockSymbolsView} />
            );
        } else {
            console.log(props.userInfo.watchlists[watchlistSelect].symbols);
            console.log("selected symbol");
            setUserStockSymbolsView(
                <StocksWatchlistComponent symbols={props.userInfo.watchlists[watchlistSelect].symbols} key={Date.now()} />
            )
        }
        updateSelectedWatchlist(watchlistSelect);
    }, [watchlistSelect]);


    const editWatchlistClick = () => {
        console.log('clicked edit');
        setOpenWatchlistManageModal(true);
        launchWatchlistManageModal(<ManageWatchlistModal open={true} setOpen={setOpenWatchlistManageModal} userInfo={props.userInfo} watchlistSelect={watchlistSelect} editWatchlist={true} />);
    };

    const addNewWatchlistClick = () => {
        console.log('clicked add');
        setOpenWatchlistManageModal(true);
        launchWatchlistManageModal(<ManageWatchlistModal open={true} setOpen={setOpenWatchlistManageModal} userInfo={props.userInfo} watchlistSelect={watchlistSelect} editWatchlist={false} />);
    };

    useEffect(() => {
        if (!openWatchlistManageModal) {
            console.log('closed modal');
            launchWatchlistManageModal("");
        }
    }, [openWatchlistManageModal]);

    return (
        <Container>
            <Header>
                <h3><b>Stocks Monitoring Portal</b></h3>
            </Header>
            <br></br>
            <b>
                <h4>Welcome back {props.userInfo.username}!</h4>
                <Divider />
                <div>
                    {
                        Object.keys(props.userInfo.watchlists).length === 0 ?
                            <Message showIcon closable type="info" style={{ marginBottom: "10px" }}>
                                You dont have any watchlist
                            </Message>
                            :
                            <>
                                Select a watchlist to view &nbsp;
                                <SelectPicker
                                    data={Object.keys(props.userInfo.watchlists).map(item => ({ "label": props.userInfo.watchlists[item].name, "value": item }))}
                                    label="Watchlist"
                                    onChange={setWatchlistSelect}
                                    defaultValue={watchlistSelect}
                                />
                                <Button appearance="primary" style={{ marginLeft: "10px" }} onClick={editWatchlistClick} disabled={editBtnDisabled}>Edit watchlist</Button>
                            </>
                    }
                    <Button appearance="primary" style={{ marginLeft: "10px" }} onClick={addNewWatchlistClick}>Add watchlist</Button>
                </div>
            </b>

            {watchlistManageModal}
            <Divider />
            <Content>
                {userStockSymbolsView}
            </Content>
        </Container>
    )
}

export { Dashboard };