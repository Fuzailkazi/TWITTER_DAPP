import React, { useState, useEffect } from 'react';
// import { Link } from 'react-router-dom';
import './Settings.css';
import { Input, Upload, Loading, useNotification } from '@web3uikit/core';
import { ethers } from 'ethers';
import Web3Modal from 'web3modal';
import { TwitterContractAddress, web3StorageAPi } from '../config';
import { Web3Storage } from 'web3.storage';
import TwitterAbi from '../abi/Twitter.json';
const Settings = () => {
  const notification = useNotification();
  const userName = JSON.parse(localStorage.getItem('userName'));
  const userBio = JSON.parse(localStorage.getItem('userBio'));
  const userImg = JSON.parse(localStorage.getItem('userImg'));
  const userBanner = JSON.parse(localStorage.getItem('userBanner'));

  const [profileFile, setProfileFile] = useState();
  const [bannerFile, setBannerFile] = useState();
  const [name, setName] = useState(userName);
  const [bio, setBio] = useState(userBio);

  const [loading, setLoading] = useState(false);
  let profileUploadURL = userImg;
  let bannerUploadURL = userBanner;
  // let ipfsUploadedURL = '';

  async function storeFile(selectedFile) {
    const client = new Web3Storage({ token: web3StorageAPi });
    const rootCid = await client.put(selectedFile);
    let ipfsUploadedURL = `https://${rootCid}.ipfs.dweb.link/${selectedFile[0].name}`;
    return ipfsUploadedURL;
  }

  const bannerHandler = (event) => {
    if (event !== null) {
      setBannerFile(event);
    }
  };

  const profileHandler = (event) => {
    if (event !== null) {
      setProfileFile(event);
    }
  };

  useEffect(() => {}, [loading]);

  async function updateProfile() {
    setLoading(true);
    if (profileFile !== null) {
      let newProfileUploadURL = await storeFile([profileFile]);
      profileUploadURL = newProfileUploadURL;
    }

    if (bannerFile !== null) {
      let newBannerUploadURL = await storeFile([bannerFile]);
      bannerUploadURL = newBannerUploadURL;
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
    const transaction = await contract.updateUser(
      name,
      bio,
      profileUploadURL,
      bannerUploadURL
    );
    await transaction.wait();

    window.localStorage.setItem('userName', JSON.stringify(name));
    window.localStorage.setItem('userBio', JSON.stringify(bio));
    window.localStorage.setItem('userImg', JSON.stringify(profileUploadURL));
    window.localStorage.setItem('userBanner', JSON.stringify(bannerUploadURL));

    notification({
      type: 'success',
      title: 'Profile updated successfully',
      position: 'topR',
    });
    setLoading(false);
  }

  return (
    <>
      <div className='settingsPage'>
        <Input
          label='Name'
          name='NameChange'
          width='100%'
          labelBgColor='#141d26'
          onChange={(e) => setName(e.target.value)}
          value={userName}
        />
        <Input
          label='Bio'
          name='BioChange'
          width='100%'
          labelBgColor='#141d26'
          onChange={(e) => setBio(e.target.value)}
          value={userBio}
        />
        <div className='pfp'>Change Profile Image</div>
        <Upload onChange={profileHandler} />
        <div className='pfp'>Change Banner Image</div>
        <Upload onChange={bannerHandler} />
        {loading ? (
          <div className='save'>
            <Loading />
          </div>
        ) : (
          <div className='save' onClick={updateProfile}>
            Save
          </div>
        )}
      </div>
    </>
  );
};

export default Settings;
