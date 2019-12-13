// React API
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
// Polkadot API
import { ApiPromise, WsProvider } from '@polkadot/api';
import keyring from '@polkadot/ui-keyring';
// Styles, tools
import { Container, Dimmer, Loader} from 'semantic-ui-react';
import types from './Type';
// Components
import MenuBar from './components/MenuBar';
import Balances from './Balances';
import NodeInfo from './NodeInfo';
import Transfer from './Transfer';
import CreateVote from './components/createVote';
import VoteListings from './components/VoteListings';
import VoteView from './components/VoteView';
import Certificate from './components/Certificate';

import 'semantic-ui-css/semantic.min.css'

export default function App () {
  const [api, setApi] = useState();
  const [apiReady, setApiReady] = useState();
  const [blockNumber, setBlockNumber] = useState('1');
  const WS_PROVIDER = 'ws://127.0.0.1:9944';

  useEffect(() => {
    const provider = new WsProvider(WS_PROVIDER);

    ApiPromise.create({provider, types})
      .then((api) => {
        setApi(api);
        api.isReady.then(() => setApiReady(true));
      })
      .catch((e) => console.error(e));
  }, []);

  useEffect(() => { 
    keyring.loadAll({
      isDevelopment: true
    });
  },[]); 

  useEffect(() => {
    if(apiReady){
      let unsubscribe;
      const getBlockNumber = () => {
        api.rpc.chain.getBlock(blockNumber => {
          setBlockNumber(blockNumber.block.header.number);
        })
        .then((unsub)=> {unsubscribe = unsub; })
        .catch((e) => console.error(e))
      }
      getBlockNumber();
      return ()=> unsubscribe && unsubscribe();
    }
  },[blockNumber, apiReady]);

  const loader = function (text){
    return (
      <Dimmer active>
        <Loader size='small'>{text}</Loader>
      </Dimmer>
    );
  };
  
  if(!apiReady){
    return loader('Connecting to the blockchain')
  }
  
  return (
    <Container>
      <NodeInfo
        api={api}
        blockNumber={blockNumber}
      />

      <Router>
        <div>
          <MenuBar/>
          <Switch>
            <Route 
              path="/vote/:id" 
              children={<VoteView api={api} keyring={keyring} blockNumber={blockNumber}/>}
            />
            <Route path="/vote">
            <VoteListings
              api={api}
              keyring={keyring}
              blockNumber={blockNumber}
            />
            <CreateVote
              api={api}
              keyring={keyring}
            />
            </Route>

            <Route path="/ballot">
              <h3>Ballot</h3>
            </Route>
            <Route path="/transfer">
            <Balances
              keyring={keyring}
              api={api}
            />
            <Transfer
              api={api}
              keyring={keyring}
            />
            </Route>
            <Route path="/certificate">
              <Certificate
                api={api}
                keyring={keyring}
              />
            </Route>
            <Route path="/">
              <h3>Home</h3>
            </Route>
          </Switch>
        </div>
      </Router>
    </Container>
  );
}