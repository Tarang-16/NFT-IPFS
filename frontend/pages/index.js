import Head from "next/head";
import Image from "next/image";
import { Inter } from "@next/font/google";
import styles from "@/styles/Home.module.css";
import { useEffect, useState, useRef } from "react";
import { Contract, providers, utils } from "ethers";
import { abi, contractAddress } from "@/constants";
import Web3Modal from "web3modal";


export default function Home() {
  const [walletConnected, setWalletConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tokenIdsMinted, setTokenIdsMinted] = useState("0");

  const web3ModalRef = useRef();

  async function getProviderOrSigner(needSigner = false) {
    const provider = await web3ModalRef.current.connect();
    const web3Provider = new providers.Web3Provider(provider);

    const { chainId } = await web3Provider.getNetwork();
    if (chainId !== 80001) {
      window.alert("Change the network to Mumbai");
      throw new Error("Change network to Mumbai");
    }

    if (needSigner) {
      const signer = web3Provider.getSigner();
      return signer;
    }

    return web3Provider;
  }

  async function connectWallet() {
    try {
      await getProviderOrSigner();
      setWalletConnected(true);
    } catch (err) {
      console.log(err);
    }
  }

  async function publicMint() {
    try {
      const signer = await getProviderOrSigner(true);

      const nftContract = new Contract(contractAddress, abi, signer);

      const tx = await nftContract.mint({ value: utils.parseEther("0.01") });
      setLoading(true);
      await tx.wait();
      setLoading(false);
      window.alert("You successfully minted a LW3Punk!");
    } catch (err) {
      console.log(err);
    }
  }

  async function getTokenIdsMinted() {
    try {
      const provider = await getProviderOrSigner();

      const nftContract = new Contract(contractAddress, abi, provider);

      const _tokenIds = await nftContract.tokenIds();
      console.log("tokenIds", _tokenIds);

      setTokenIdsMinted(_tokenIds.toString());
    } catch (err) {
      console.log(err);
    }
  }

  useEffect(() => {
    if (!walletConnected) {
      web3ModalRef.current = new Web3Modal({
        network: "mumbai",
        providerOptions: {},
        disableInjectedProvider: false,
      });
      connectWallet();

      getTokenIdsMinted();

      setInterval(async function () {
        await getTokenIdsMinted();
      }, 5 * 1000);
    }
  }, [walletConnected]);

  const renderButton = () => {
    // If wallet is not connected, return a button which allows them to connect their wallet
    if (!walletConnected) {
      return (
        <button onClick={connectWallet} className={styles.button}>
          Connect your wallet
        </button>
      );
    }

    // If we are currently waiting for something, return a loading button
    if (loading) {
      return <button className={styles.button}>Loading...</button>;
    }

    return (
      <button className={styles.button} onClick={publicMint}>
        Public Mint ????
      </button>
    );
  };

  return (
    <div>
      <Head>
        <title>LW3Punks</title>
        <meta name="description" content="LW3Punks-Dapp" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles.main}>
        <div>
          <h1 className={styles.title}>Welcome to LW3Punks!</h1>
          <div className={styles.description}>
            Its an NFT collection for LearnWeb3 students.
          </div>
          <div className={styles.description}>
            {tokenIdsMinted}/10 have been minted
          </div>
          {renderButton()}
        </div>
        <div>
          <img className={styles.image} src="./LW3punks/1.png" />
        </div>
      </div>

      <footer className={styles.footer}>
        Made with &#10084; by Tarang Tyagi
      </footer>
    </div>
  );
}
