import './styles/App.css';
import twitterLogo from './assets/twitter-logo.svg';
import React, {useEffect, useState} from 'react';
import {BrowserRouter as Router, Link} from 'react-router-dom';
import {ethers} from 'ethers';
import myEpicNft from './utils/MyEpicNFT.json';

const TWITTER_HANDLE = 'jwross24';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const OPENSEA_LINK =
  'https://testnets.opensea.io/collection/squarenft-qel2uw0nir';
const TOTAL_MINT_COUNT = 50;

const CONTRACT_ADDRESS = '0x62bfdE938293C56A309CB9d9f0e6B6265fE510Fa';

function App() {
  const [currentAccount, setCurrentAccount] = useState('');
  const [currentMinted, setCurrentMinted] = useState(0);

  async function checkIfWalletIsConnected() {
    const {ethereum} = window;

    if (!ethereum) {
      console.log('Make sure you have MetaMask!');
      return;
    } else {
      console.log('We have the Ethereum object: ', ethereum);
    }

    const chainId = await ethereum.request!({method: 'eth_chainId'});
    console.log('Connected to chain ' + chainId);

    const rinkebyChainId = '0x4';
    if (chainId !== rinkebyChainId) {
      alert('You are not connected to the Rinkeby Test Network!');
    }

    const accounts = await ethereum.request!({method: 'eth_accounts'});

    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log('Found an authorized account: ', account);
      setCurrentAccount(account);
      setupEventListener();
    } else {
      console.log('No authorized account found.');
    }
  }

  async function getCurrentTotalMinted() {
    try {
      const {ethereum} = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          myEpicNft.abi,
          signer
        );

        const mintedSoFar = await connectedContract.getTotalNFTsMintedSoFar();
        setCurrentMinted(mintedSoFar.toNumber());
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  }

  async function connectWallet() {
    try {
      const {ethereum} = window;

      if (!ethereum) {
        alert('Get MetaMask!');
        return;
      }

      const accounts = await ethereum.request!({method: 'eth_requestAccounts'});

      console.log('Connected', accounts[0]);
      setCurrentAccount(accounts[0]);
      setupEventListener();
    } catch (error) {
      console.log(error);
    }
  }

  async function setupEventListener() {
    try {
      const {ethereum} = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          myEpicNft.abi,
          signer
        );

        connectedContract.on('NewEpicNFTMinted', (from, tokenId) => {
          console.log(from, tokenId.toNumber());
          alert(
            `Hey there! We've minted your NFT and sent it to your wallet. It may be blank right now. It can take a maximum of 10 minutes to show up on OpenSea. Here's the link: https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`
          );
        });
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  }

  async function askContractToMintNft() {
    try {
      const {ethereum} = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          myEpicNft.abi,
          signer
        );

        console.log('Going to pop wallet now to pay gas...');
        const nftTxn = await connectedContract.makeAnEpicNFT();

        console.log('Mining... please wait.');
        await nftTxn.wait();

        console.log(
          `Mined, see transaction: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`
        );
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    checkIfWalletIsConnected();
    getCurrentTotalMinted();
  }, []);

  function renderMintText() {
    return (
      <p className="mint-count">
        {currentMinted}/{TOTAL_MINT_COUNT} minted so far!
      </p>
    );
  }

  function renderNotConnectedContainer() {
    return (
      <button
        onClick={connectWallet}
        className="cta-button connect-wallet-button"
      >
        Connect to Wallet
      </button>
    );
  }

  function renderMintUI() {
    return (
      <button onClick={askContractToMintNft} className="cta-button mint-button">
        Mint NFT
      </button>
    );
  }

  return (
    <Router>
      <div className="App">
        <div className="container">
          <div className="header-container">
            <p className="header gradient-text">My NFT Collection</p>
            <p className="sub-text">
              Each unique. Each beautiful. Discover your NFT today.
            </p>
            {currentAccount === ''
              ? renderNotConnectedContainer()
              : renderMintUI()}
            <br />
            {renderMintText()}
            <br />
            <Link to={{pathname: OPENSEA_LINK}} target="_blank">
              <button className="cta-button opensea-button">
                🌊 View Collection on OpenSea
              </button>
            </Link>
          </div>
          <div className="footer-container">
            <img
              alt="Twitter Logo"
              className="twitter-logo"
              src={twitterLogo}
            />
            <a
              className="footer-text"
              href={TWITTER_LINK}
              target="_blank"
              rel="noreferrer"
            >{`built on @${TWITTER_HANDLE}`}</a>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;
