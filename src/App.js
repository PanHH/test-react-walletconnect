import logo from './logo.svg';
import './App.css';

import React from 'react';

import WalletConnect from "@walletconnect/client";
import QRCodeModal from "@walletconnect/qrcode-modal";

const INITIAL_STATE = {
  connector: null,
  fetching: false,
  connected: false,
  chainId: 1,
  showModal: false,
  pendingRequest: false,
  uri: "",
  accounts: [],
  address: "",
  result: null,
  assets: [],
};

class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      connector: null,
      fetching: false,
      connected: false,
      chainId: 1,
      showModal: false,
      pendingRequest: false,
      uri: "",
      accounts: [],
      address: "",
      result: null,
      assets: [],
    }
  }

  connect = async () => {
      // bridge url
      const bridge = "https://bridge.walletconnect.org";
  
      // create new connector
      const connector = new WalletConnect({ bridge, qrcodeModal: QRCodeModal });
  
      await this.setState({ connector });
  
      // check if already connected
      if (!connector.connected) {
        // create new session
        await connector.createSession();
      }
  
      // subscribe to events
      await this.subscribeToEvents();
  }

  subscribeToEvents = () => {
    const { connector } = this.state;

    if (!connector) {
      return;
    }

    connector.on("session_update", async (error, payload) => {
      console.log(`connector.on("session_update")`);

      if (error) {
        throw error;
      }

      const { chainId, accounts } = payload.params[0];
      this.onSessionUpdate(accounts, chainId);
    });

    connector.on("connect", (error, payload) => {
      console.log(`connector.on("connect")`);

      if (error) {
        throw error;
      }

      this.onConnect(payload);
    });

    connector.on("disconnect", (error, payload) => {
      console.log(`connector.on("disconnect")`);

      if (error) {
        throw error;
      }

      this.onDisconnect();
    });

    if (connector.connected) {
      const { chainId, accounts } = connector;
      const address = accounts[0];
      this.setState({
        connected: true,
        chainId,
        accounts,
        address,
      });
      this.onSessionUpdate(accounts, chainId);
    }

    this.setState({ connector });
  }

  disconnect = async () => {
    const { connector } = this.state;
    if (connector) {
      await connector.killSession();
    }
    this.resetApp();
  };

  onConnect = async (payload) => {
    const { chainId, accounts } = payload.params[0];
    const address = accounts[0];
    await this.setState({
      connected: true,
      chainId,
      accounts,
      address,
    });
    this.getAccountAssets();
  };

  onDisconnect = async () => {
    this.resetApp();
  };

  onSessionUpdate = async (accounts, chainId) => {
    const address = accounts[0];
    await this.setState({ chainId, accounts, address });
    await this.getAccountAssets();
  };

  resetApp = async () => {
    await this.setState({ ...INITIAL_STATE });
  };

  getAccountAssets = async () => {
    const { address, chainId } = this.state;
    console.log(`address:` + address);
    console.log(`chainId:` + chainId);
  //   this.setState({ fetching: true });
  //   try {
  //     // get account balances
  //     const assets = await apiGetAccountAssets(address, chainId);

  //     await this.setState({ fetching: false, address, assets });
  //   } catch (error) {
  //     console.error(error);
  //     await this.setState({ fetching: false });
  //   }
  };

  render() {
    const { address, chainId } = this.state;
    return (
      <div className="App">
          <header className="App-header">
              <img src={logo} className="App-logo" alt="logo" />
              <h3>Test React APP Wallet Connct</h3>
              <br />
              <div>
                <label>Address:{address}</label>
                <br/>
                <label>ChainId:{chainId}</label>
              </div>
              <button className="App-button" onClick={() => this.connect()}>Connect to WalletConnect</button>
              <button className="App-button" onClick={() => this.disconnect()}>Disconnect</button>
          </header>
      </div>
    );
  }
}

export default App;
