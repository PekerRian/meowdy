import React, { useEffect, useState, useCallback } from "react";
import { request } from "graphql-request";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import "./NFTDisplay.css";

// Constants
const APTOS_GRAPHQL_URL = "https://indexer.mainnet.aptoslabs.com/v1/graphql";
const COLLECTION_ID = "0x1b33bf929377dbe1f17139d30b512186a7335d0ffc7766b8d69932c370e02a06";

const NFTDisplay = ({ onMeowdyCountChange }) => {
  const { connected, account } = useWallet();
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [meowdyCount, setMeowdyCount] = useState(0); // New state for Meowdy count

  // Utility function to convert Uint8Array to hex string
  const uint8ArrayToHex = (uint8Array) =>
    Array.from(uint8Array)
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");

  // Fetch NFTs based on the connected wallet
  const fetchNFTs = useCallback(async () => {
    if (!connected || !account) {
      console.log("Wallet not connected or account unavailable.");
      return;
    }

    const walletAddress = account.address.data
      ? `0x${uint8ArrayToHex(new Uint8Array(account.address.data))}`
      : account.address;

    console.log("Converted Wallet Address:", walletAddress);

    setLoading(true);
    setError("");

    try {
      // GraphQL query to fetch NFTs
      const query = `
        query GetAccountNfts($owner_address: String, $collection_id: String) {
          current_token_ownerships_v2(
            where: {
              owner_address: { _eq: $owner_address },
              amount: { _gt: "0" },
              current_token_data: {
                current_collection: { collection_id: { _eq: $collection_id } }
              }
            }
          ) {
            current_token_data {
              token_name
              token_uri
            }
            amount
          }
        }
      `;

      const variables = {
        owner_address: walletAddress,
        collection_id: COLLECTION_ID,
      };

      const response = await request(APTOS_GRAPHQL_URL, query, variables);
      console.log("GraphQL API Response:", response);

      const nftData = response?.current_token_ownerships_v2 || [];
      console.log("NFT Data Extracted:", nftData);

      if (!nftData.length) {
        setNfts([]);
        setMeowdyCount(0); // Update Meowdy count to 0 if no NFTs are found
        if (onMeowdyCountChange) onMeowdyCountChange(0); // Notify parent with 0 count
        return;
      }

      // Helper function to fetch metadata with retry logic
      const fetchMetadataWithRetry = async (tokenUri, retries = 3) => {
        for (let attempt = 0; attempt < retries; attempt++) {
          try {
            const metadataResponse = await fetch(tokenUri);
            if (!metadataResponse.ok) {
              throw new Error(`Failed to fetch metadata: ${metadataResponse.status}`);
            }
            return await metadataResponse.json();
          } catch (err) {
            console.error(`Retry ${attempt + 1} for metadata:`, err);
            if (attempt === retries - 1) throw err;
          }
        }
      };

      // Process NFTs in batches to avoid rate limits
      const batchSize = 5; // Limit to 5 parallel fetches
      const nftsWithMetadata = [];
      for (let i = 0; i < nftData.length; i += batchSize) {
        const batch = nftData.slice(i, i + batchSize);
        const batchResults = await Promise.allSettled(
          batch.map(async (nft) => {
            try {
              const metadata = await fetchMetadataWithRetry(nft.current_token_data.token_uri);
              return { ...nft, metadata };
            } catch (err) {
              console.error("Failed to fetch metadata for:", nft, err);
              return nft; // Return NFT without metadata if fetching fails
            }
          })
        );
        nftsWithMetadata.push(...batchResults.map((result) => (result.status === "fulfilled" ? result.value : null)));
      }

      setNfts(nftsWithMetadata.filter(Boolean)); // Remove failed results

      // Calculate the Meowdy count
      const meowdyCount = nftsWithMetadata.filter((nft) =>
        nft?.current_token_data?.token_name?.toLowerCase().includes("meowdy")
      ).length;
      setMeowdyCount(meowdyCount);
      if (onMeowdyCountChange) onMeowdyCountChange(meowdyCount); // Notify parent component with new count
    } catch (err) {
      if (err.response?.status === 429) {
        console.error("Rate limit exceeded. Retrying...");
        setTimeout(fetchNFTs, 5000); // Retry after 5 seconds
      } else {
        console.error("Error fetching NFTs:", err);
        setError("Failed to fetch NFTs. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  }, [connected, account, onMeowdyCountChange]);

  // Fetch NFTs on component mount or dependency change
  useEffect(() => {
    fetchNFTs();
  }, [fetchNFTs]);

  if (!connected) {
    return <p>Please connect your wallet to view NFTs.</p>;
  }

  return (
    <div className="nft-display">
      {loading && <p>Loading NFTs...</p>}
      {error && <p className="error">{error}</p>}
      {!loading && !error && nfts.length > 0 ? (
        <>
          <h3>Meowdy Count: {meowdyCount}</h3> {/* Display Meowdy Count */}
          <div className="nft-grid">
            {nfts.map((nft, index) => (
              <div key={index} className="nft-item">
                <img
                  src={nft.metadata?.image || nft.current_token_data.token_uri}
                  alt={`NFT ${index}`}
                  className="nft-image"
                />
              </div>
            ))}
          </div>
        </>
      ) : (
        !loading &&
        !error && <p>No NFTs found in the specified collection.</p>
      )}
    </div>
  );
};

export default NFTDisplay;