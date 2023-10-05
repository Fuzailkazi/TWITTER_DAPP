import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Profile.css';
import { defaultImgs } from '../defaultImgs';
import TweetInFeed from '../components/TweetInFeed';
import { ethers } from 'ethers';
import Web3Modal from 'web3modal';
import { Matic } from '@web3uikit/icons';
const Profile = () => {
  const activeAccount = JSON.parse(localStorage.getItem('activeAccount'));
  const userName = JSON.parse(localStorage.getItem('userName'));
  const userBio = JSON.parse(localStorage.getItem('userBio'));
  const userImg = JSON.parse(localStorage.getItem('userImg'));
  const userBanner = JSON.parse(localStorage.getItem('userBanner'));

  const [accountBalance, setAccountBalance] = useState(0);

  async function getAccountBalance() {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    let provider = new ethers.providers.Web3Provider(connection);
    let balance = await provider.getBalance(activeAccount);
    balance = ethers.utils.formatEther(balance).substring(0, 4);
    setAccountBalance(balance);
  }

  useEffect(() => {
    getAccountBalance();
  }, []);

  return (
    <>
      <img src={userBanner} className='profileBanner' />
      <div className='pfpContainer'>
        <img src={userImg} className='profilePFP' />
        <div className='profileName'>{userName}</div>
        <div className='profileWallet'>
          {activeAccount} - <Matic /> {accountBalance} MATIC
        </div>
        <Link to='/settings'>
          <div className='profileEdit'>Edit Profile</div>
        </Link>
        <div className='profileBio'>{userBio}</div>
        <div className='profileTabs'>
          <div className='profileTab'>Your Tweets</div>
        </div>
      </div>
      <TweetInFeed profile={true} />
    </>
  );
};

export default Profile;
