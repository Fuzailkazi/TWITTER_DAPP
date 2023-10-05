import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import './Home.css';
import { Avatar, Loading, useNotification } from '@web3uikit/core';
import { defaultImgs } from '../defaultImgs';
import { Image } from '@web3uikit/icons';
import TweetInFeed from '../components/TweetInFeed';
import { ethers } from 'ethers';
import Web3Modal from 'web3modal';
import { TwitterContractAddress, web3StorageAPi } from '../config';
import { Web3Storage } from 'web3.storage';
import TwitterAbi from '../abi/Twitter.json';
const Home = () => {
  const inputFile = useRef(null);
  const [selectedImg, setSelectedImg] = useState();
  const [tweetText, setTweetText] = useState('');

  const UserImage = JSON.parse(localStorage.getItem('userImage'));
  const [selectedFile, setSelectedFile] = useState();
  const [uploading, setUploading] = useState(false);
  let ipfsUploadedURL = '';
  const notification = useNotification();

  async function storeFile() {
    const client = new Web3Storage({ token: web3StorageAPi });
    const rootCid = await client.put(selectedFile);
    ipfsUploadedURL = `https://${rootCid}.ipfs.dweb.link/${selectedFile[0].name}`;
  }

  const onImageClick = () => {
    inputFile.current.click();
  };

  const changeHandler = (event) => {
    const imgFile = event.target.files[0];
    setSelectedImg(URL.createObjectURL(imgFile));
    setSelectedFile(event.target.files);
  };

  async function addTweet() {
    if (tweetText.trim().length < 5) {
      notification({
        type: 'warning',
        message: ' Minimum 5 characters required',
        title: 'Tweet Field required',
        position: 'topR',
      });
      return;
    }
    setUploading(true);
    if (selectedImg) {
      await storeFile();
    }
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(
      TwitterContractAddress,
      TwitterAbi.abi,
      signer
    );
    const tweetValue = '0.00001';
    const price = ethers.utils.parseEther(tweetValue);
    try {
      const transaction = await contract.addTweet(tweetText, ipfsUploadedURL, {
        value: price,
      });
      await transaction.wait();
      notification({
        type: 'success',
        title: 'Tweet added successfully',
        position: 'topR',
      });
      setSelectedFile(null);
      setTweetText('');
      setSelectedFile(null);
      setUploading(false);
    } catch (error) {
      notification({
        type: 'error',
        title: 'Transaction Error',
        message: error.message,
        position: 'topR',
      });
      setUploading(false);
    }
  }
  return (
    <>
      <div className='mainContent'>
        <div className='profileTweet'>
          <div className='tweetSection'>
            <Avatar isRounded image={UserImage} theme='image' size={60} />
            <textarea
              name='TweetTxtArea'
              value={tweetText}
              placeholder='Whats going on?'
              className='textArea'
              onChange={(e) => setTweetText(e.target.value)}
            ></textarea>
          </div>
          <div className='tweetSection'>
            <div className='imgDiv' onClick={onImageClick}>
              <input
                type='file'
                ref={inputFile}
                onChange={changeHandler}
                style={{ display: 'none' }}
              />
              {selectedImg ? (
                <img src={selectedImg} width={150} />
              ) : (
                <Image fontSize={25} fill='#ffffff' />
              )}
            </div>
            <div className='tweet' onClick={addTweet}>
              {uploading ? <Loading /> : 'Tweet'}
            </div>
          </div>
        </div>
        <TweetInFeed profile={false} reload={uploading} />
      </div>
    </>
  );
};

export default Home;
