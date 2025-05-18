import React, { useEffect } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { WalletSelector } from "@aptos-labs/wallet-adapter-ant-design";
import "./WalletConnection.css";

const WalletConnection = ({ setWalletAddress }) => {
  const { connected, account, disconnect } = useWallet();

  useEffect(() => {
    console.log("Wallet Connection State - Connected:", connected);
    console.log("Account Object:", account);
    console.log("Account Address:", account?.address);
  }, [connected, account]);

  useEffect(() => {
    if (connected && account?.address) {
      setWalletAddress(`0x${account.address.toString()}`);
    } else {
      setWalletAddress(null);
    }
  }, [connected, account, setWalletAddress]);

  return (
    <div className="wallet-connection-container">
      {!connected ? (
        <div>
          <WalletSelector>
            <button className="connect-wallet-button">Connect Wallet</button>
          </WalletSelector>
        </div>
      ) : (
        <div className="wallet-info">
          <p>
            Connected Wallet:{" "}
            {account?.address
              ? `0x${account.address.toString().slice(0, 5)}...`
              : "No address found"}
          </p>
          <button className="disconnect-wallet-button" onClick={disconnect}>
            Disconnect Wallet
          </button>
        </div>
      )}
    </div>
  );
};

export default WalletConnection;