import React, { useState, useEffect } from 'react';
import './TweetInFeed.css';
// import { defaultImgs } from '../defaultImgs';
import { Avatar, Loading, useNotification } from '@web3uikit/core';
import { MessageCircle, Matic, Bin, Calendar } from '@web3uikit/icons';
import { ethers } from 'ethers';
import Web3Modal from 'web3modal';
import { TwitterContractAddress } from '../config';
import TwitterAbi from '../abi/Twitter.json';
const TweetInFeed = (props) => {
  const onlyUser = props.profile;
  let reloadComponent = props.reload;
  const [tweets, setTweets] = useState([]);
  const [loadingState, setLoadingState] = useState('not-loaded');
  const notification = useNotification();

  useEffect(() => {
    if (onlyUser) {
      loadMyTweets();
    } else {
      loadAllTweets();
    }
  }, [reloadComponent]);

  async function loadMyTweets() {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(
      TwitterContractAddress,
      TwitterAbi.abi,
      signer
    );
    const data = await contract.getMyTweets();
    console.log(data);
    const userName = JSON.parse(localStorage.getItem('userName'));
    const userImg = JSON.parse(localStorage.getItem('userImg'));
    const result = await Promise.all(
      data.map(async (tweet) => {
        const unixTime = tweet.timestamp;
        const date = new Date(unixTime * 1000);
        const tweetDate = date.toLocaleDateString('fr-CH');

        let item = {
          tweeter: tweet.tweeter,
          id: tweet.id,
          tweetText: tweet.tweetText,
          tweetImg: tweet.tweetImg,
          isDeleted: tweet.isDeleted,
          userName: userName,
          userImg: userImg,
          date: tweetDate,
        };
        return item;
      })
    );
    setTweets(result.reverse());
    setLoadingState('loaded');
  }

  async function loadAllTweets() {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(
      TwitterContractAddress,
      TwitterAbi.abi,
      signer
    );

    // const tx = new ethers.providers.getCode(
    //   0x8ec8e189791467a77e2c338c8a59292a7d44376d
    // );
    // console.log(tx);
    const data = await contract.getAllTweets();
    console.log(data);
    const result = await Promise.all(
      data.map(async (tweet) => {
        const unixTime = tweet.timestamp;
        const date = new Date(unixTime * 1000);
        const tweetDate = date.toLocaleDateString('fr-CH');
        let getUserDetail = await contract.getUser(tweet.tweeter);
        let item = {
          tweeter: tweet.tweeter,
          id: tweet.id,
          tweetText: tweet.tweetText,
          tweetImg: tweet.tweetImg,
          isDeleted: tweet.isDeleted,
          userName: getUserDetail['name'],
          userImg: getUserDetail['profileImage'],
          date: tweetDate,
        };
        return item;
      })
    );
    setTweets(result.reverse());
    setLoadingState('loaded');
  }

  async function deleteTweet(tweetId) {
    setLoadingState('not-loaded');
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(
      TwitterContractAddress,
      TwitterAbi.abi,
      signer
    );
    const data = await contract.deleteTweet(tweetId, true);
    await data.wait();
    notification({
      type: 'success',
      title: 'Tweet deleted successfully',
      position: 'topR',
      from: <Bin />,
    });
    loadMyTweets();
  }

  if (loadingState === 'not-loaded')
    return (
      <div className='loading'>
        <Loading size={60} spinnerColor='#8247e5' />
      </div>
    );

  if (loadingState === 'loaded' && !tweets.length)
    return <h1 className='loading'>No tweet available</h1>;

  return (
    <>
      {tweets.map((tweet, i) => (
        <div className='FeedTweet'>
          <Avatar isRounded image={tweet.userImg} theme='image' size={60} />
          <div className='completeTweet'>
            <div className='who'>
              {tweet.userName}
              <div className='accWhen'>{tweet.tweeter}</div>
            </div>
            <div className='tweetContent'>
              {tweet.tweetText}
              {tweet.tweetImg !== '' && (
                <img src={tweet.tweetImg} alt='' className='tweetImg' />
              )}
            </div>
            <div className='interactions'>
              <div className='interactionNums'>
                <MessageCircle fontSize={20} /> 0
              </div>
              <div className='interactionNums'>
                <Calendar fontSize={20} />
                {tweet.date}
              </div>
              {onlyUser ? (
                <div className='interactionNum'>
                  <Bin
                    fontSize={20}
                    color='#ff0000'
                    onClick={() => deleteTweet(tweet.id)}
                  />
                </div>
              ) : (
                <div className='interactionNums'>
                  <Matic fontSize={20} />
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </>
  );
};

export default TweetInFeed;
