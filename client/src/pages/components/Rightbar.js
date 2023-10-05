import React from 'react';
import './Rightbar.css';
// import { Link } from 'react-router-dom';
import ethers from '../images/ethers.png';
import solidity from '../images/solidity.webp';
import react from '../images/react.png';
import metamaskimg from '../images/metamaskimg.png';
import { Input } from '@web3uikit/core';
import { Search } from '@web3uikit/icons';
const Rightbar = () => {
  const trends = [
    {
      img: solidity,
      text: 'Master smart contract development',
      link: '#',
    },
    {
      img: ethers,
      text: 'Learn how to build interactive dapps by ether js',
      link: '#',
    },
    {
      img: metamaskimg,
      text: 'Use metamask to interact with dapps',
      link: '#',
    },
    {
      img: react,
      text: 'React JS the popular js frontend framework',
      link: '#',
    },
  ];
  return (
    <>
      <div className='rightbarContent'>
        <Input
          label='search twitter'
          name='search twitter'
          prefixIcon={Search}
          labelBgColor='#141d26'
        ></Input>
        <div className='trends'>
          Trending
          {trends.map((e) => {
            return (
              <>
                <div className='trend' onClick={() => window.open(e.link)}>
                  <img src={e.img} className='trendImg' alt='' />
                  <div className='trendText'>{e.text}</div>
                </div>
              </>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default Rightbar;
