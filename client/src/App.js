import { Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Sidebar from './components/Sidebar';
import './App.css';
import Rightbar from './components/Rightbar';
import { Button, useNotification, Loading } from '@web3uikit/core';
import { Twitter, Metamask } from '@web3uikit/icons';
import { useState, useEffect } from 'react';
import { ethers, utils } from 'ethers';
import Web3Modal from 'web3modal';
import { TwitterContractAddress } from './config';
import TwitterAbi from './abi/Twitter.json';
// import { waitFor } from '@testing-library/react';

var toonavatar = require('cartoon-avatar');
function App() {
  const [isAuth, setIsAuth] = useState(false);
  const [provider, setProvider] = useState(window.ethereum);
  const notification = useNotification();
  const [loading, setLoading] = useState(false);

  const warningNotification = () => {
    notification({
      type: 'warning',
      message: 'Change network to Polygon to visit the site',
      title: 'Switch to Polygon',
      position: 'topR',
    });
  };

  const infoNotification = (accountNum) => {
    notification({
      type: 'info',
      message: accountNum,
      title: 'Connected to Polygon',
      position: 'topR',
    });
  };

  useEffect(() => {
    if (!provider) {
      window.alert('No metamask installed');
      window.location.replace('https://metamask.io');
    }
    connectWallet();

    const handleAccountsChanged = (accounts) => {
      if (provider.chainId === '0x13881') {
        infoNotification(accounts[0]);
      }
      // just to prevent reloading twice for everytime
      if (JSON.parse(localStorage.getItem('activeAccount')) !== null) {
        setTimeout(() => {
          window.location.reload();
        }, 3000);
      }
    };

    const handleChainChanged = (chainId) => {
      if (chainId !== '0x13881') {
        warningNotification();
      }
      window.location.reload();
    };

    const handleDisconnected = () => {};

    provider.on('accountsChanged', handleAccountsChanged);
    provider.on('chainChanged', handleChainChanged);
    provider.on('disconnected', handleDisconnected);
  }, []);

  const connectWallet = async () => {
    const web3modal = new Web3Modal();
    const connection = await web3modal.connect();
    let provider = new ethers.providers.Web3Provider(connection);
    const getnetwork = await provider.getNetwork();
    const polygonChainId = 80001;
    if (getnetwork.chainId !== polygonChainId) {
      warningNotification();
      try {
        await provider.provider
          .request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: utils.hexValue(polygonChainId) }],
          })
          .then(() => {
            window.location.reload();
          }, 3000);
      } catch (switchError) {
        // this indicates that the chain has not been added to metamask
        // so will add metamask to their wallet
        if (switchError.code === 4902) {
          try {
            await provider.provider
              .request({
                method: 'wallet_addEthereumChain',
                params: [
                  {
                    chainId: utils.hexValue(polygonChainId),
                    chainName: 'Polygon Testnet',
                    rpcUrls: ['https://matic-mumbai.chainstacklabs.com'],
                    blockExplorerUrls: ['https://mumbai.polygonscan.com'],
                    nativeCurrency: {
                      symbol: 'MATIC',
                      decimals: 18,
                    },
                  },
                ],
              })
              .then(() => {
                window.location.reload();
              }, 3000);
          } catch (addError) {
            throw addError;
          }
        }
      }
    } else {
      // IT will execute if polygon chain is connected
      // here we will verify if user exists or not in our blockchian or else we will update the user in out contract as well as
      const signer = provider.getSigner();
      const signerAddress = await signer.getAddress();
      const contract = new ethers.Contract(
        TwitterContractAddress,
        TwitterAbi.abi,
        signer
      );
      const getUsetDetails = await contract.getUser(signerAddress);
      if (getUsetDetails['profileImg']) {
        // if user exists
        window.localStorage.setItem(
          'activeAccount',
          JSON.stringify(signerAddress)
        );
        window.localStorage.setItem(
          'userName',
          JSON.stringify(getUsetDetails['name'])
        );
        window.localStorage.setItem(
          'userBio',
          JSON.stringify(getUsetDetails['bio'])
        );
        window.localStorage.setItem(
          'userImg',
          JSON.stringify(getUsetDetails['profileImg'])
        );
        window.localStorage.setItem(
          'userBanner',
          JSON.stringify(getUsetDetails['profileBanner'])
        );
      } else {
        //first time user
        setLoading(true);
        let avatar = toonavatar.generate_avatar();
        let defualtBanner =
          'https://img.freepik.com/free-vector/pirate-buries-treasure-chest-island-beach_107791-4737.jpg';
        window.localStorage.setItem(
          'activeAccount',
          JSON.stringify(signerAddress)
        );
        window.localStorage.setItem(
          'userName',
          JSON.stringify(getUsetDetails['name'])
        );
        window.localStorage.setItem(
          'userBio',
          JSON.stringify(getUsetDetails['bio'])
        );
        window.localStorage.setItem(
          'userImg',
          JSON.stringify(getUsetDetails['avatar'])
        );
        window.localStorage.setItem(
          'userBanner',
          JSON.stringify(getUsetDetails['defaultBanner'])
        );

        try {
          const transaction = await contract.updateUser(
            '',
            '',
            avatar,
            defualtBanner
          );
          await transaction.wait();
        } catch (error) {
          console.log('error', error);
          notification({
            type: 'warning',
            message: 'Get Test Matic from Polygon Faucet',
            title: 'Require atleast 1 Matic',
            position: 'topR',
          });
          setLoading(false);
          return;
        }
      }

      setProvider(provider);
      setIsAuth(true);
    }
  };

  return (
    <>
      {isAuth ? (
        <div className='page'>
          <div className='sideBar'>
            <Sidebar />
          </div>
          <div className='mainWindow'>
            <Routes>
              <Route path='/' element={<Home />} />
              <Route path='/profile' element={<Profile />} />
              <Route path='/settings' element={<Settings />} />
            </Routes>
          </div>
          <div className='rightBar'>
            <Rightbar />
          </div>
        </div>
      ) : (
        <div className='loginPage'>
          <Twitter fill='#ffffff' fontSize={80} />
          {loading ? (
            <Loading size={50} spinnerColor='green' />
          ) : (
            <Button
              onClick={connectWallet}
              size='xl'
              text='Login with Metamask'
              theme='primary'
              icon={<Metamask />}
            />
          )}
        </div>
      )}
    </>
  );
}

export default App;
