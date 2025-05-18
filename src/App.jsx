import React, { useState, useEffect } from "react";
import { collection, addDoc, getDocs, query, orderBy, limit } from "firebase/firestore";
import { db } from "./database/firebase"; 
import useGameLoop from "./hooks/useGameLoop";

import Meow from "./components/Meow";
import Pipe from "./components/Pipe";
import Ground from "./components/Ground";
import WalletConnection from "./wallet/WalletConnection"; 
import NFTDisplay from "./nft/NFTDisplay"; 
import TitleScreen from "./title/TitleScreen"; 

import backgroundImg from "./assets/background.png";
import { AptosWalletAdapterProvider } from "@aptos-labs/wallet-adapter-react";
import "./styles.css";


const wallets = [];

export default function App() {
  const [activeLayer, setActiveLayer] = useState("title"); 
  const [walletAddress, setWalletAddress] = useState("");
  const [meowdyCount, setMeowdyCount] = useState(1); 
  const [leaderboard, setLeaderboard] = useState([]); 
  const [isGameOver, setIsGameOver] = useState(false); 

  // For copy-to-clipboard popup
  const [copied, setCopied] = useState(false);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });

  const {
    MeowY,
    pipes,
    score,
    lives,
    jump,
    stopGame,
    startGame,
    isGameStarted,
    resetGame,
    isBlinking, 
    isVibrating, 
  } = useGameLoop(
    async () => {
      setIsGameOver(true);
      stopGame();

      // Save the score to Firestore
      if (walletAddress) {
        try {
          await addDoc(collection(db, "leaderboard"), {
            username: walletAddress,
            score: score,
            timestamp: new Date(),
          });
        } catch (error) {
          console.error("Error adding score to leaderboard:", error);
        }
      }
    },
    meowdyCount 
  );

  const handleJump = () => {
    if (isGameOver) {
      resetGame();
      setIsGameOver(false);
      startGame();
    } else if (!isGameStarted) {
      startGame();
    } else {
      jump();
    }
  };

  const handleMeowdyCountChange = (count) => {
    setMeowdyCount(count || 1); 
    resetGame(); 
  };

  // Fetch leaderboard data
  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const leaderboardQuery = query(
          collection(db, "leaderboard"),
          orderBy("score", "desc"),
          limit(10) // Limit to top 10 scores
        );
        const querySnapshot = await getDocs(leaderboardQuery);
        const scores = querySnapshot.docs.map((doc) => doc.data());
        setLeaderboard(scores);
      } catch (error) {
        console.error("Error fetching leaderboard data:", error);
      }
    };

    fetchLeaderboard();
  }, []);

  const commonBackgroundStyle = {
    backgroundImage: `url(${backgroundImg})`,
    backgroundSize: "cover",
    position: "relative",
    overflow: "hidden",
  };

  // Copy address handler for leaderboard
  const handleCopy = (address, event) => {
    navigator.clipboard.writeText(address);
    const x = event.clientX;
    const y = event.clientY;
    setPopupPosition({ x, y });
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <AptosWalletAdapterProvider plugins={wallets} autoConnect={false}>
      <div className={`app-container ${isVibrating ? "vibrating" : ""}`} style={commonBackgroundStyle}>
        {/* Title Screen */}
        {activeLayer === "title" && (
          <div className="title-screen" style={commonBackgroundStyle}>
            <TitleScreen
              onStartGame={() => setActiveLayer("game")} 
              onShowLeaderboard={() => setActiveLayer("leaderboard")} 
              onShowSocialLinks={() => setActiveLayer("social")} 
              onConnectWallet={() => setActiveLayer("sidebar-with-wallet")} 
            />
          </div>
        )}

        {/* Game Container */}
        {activeLayer === "game" && (
          <div
            className={`game-container${isVibrating ? " vibrating" : ""}`}
            onClick={handleJump}
            style={commonBackgroundStyle}
          >
            {/* Home Button */}
            <button
              className="home-button"
              onClick={() => setActiveLayer("title")}
              style={{
                position: "absolute",
                top: "10px",
                right: "10px",
                width: "40px",
                height: "40px",
                backgroundColor: "#fff",
                border: "2px solid #000",
                borderRadius: "5px",
                cursor: "pointer",
                zIndex: 10,
              }}
            >
              🏠
            </button>

            {/* Score Display */}
            {!isGameOver && (
              <div
                className="score-display"
                style={{
                  position: "absolute",
                  top: "10px",
                  left: "10px",
                  backgroundColor: "rgba(255, 255, 255, 0.8)",
                  padding: "5px 10px",
                  borderRadius: "5px",
                  fontWeight: "bold",
                  fontSize: "18px",
                  zIndex: 10,
                }}
              >
                Score: {score}
              </div>
            )}

            {/* Lives Display */}
            {!isGameOver && (
              <div
                className="lives-display"
                style={{
                  position: "absolute",
                  top: "10px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  backgroundColor: "rgba(255, 255, 255, 0.8)",
                  padding: "5px 10px",
                  borderRadius: "5px",
                  fontWeight: "bold",
                  fontSize: "18px",
                  zIndex: 10,
                }}
              >
                Lives: {lives}
              </div>
            )}

            {/* Game Over Screen */}
            {isGameOver && (
              <div className="game-over-screen">
                <h2>Game Over</h2>
                <p>Your Score: {score}</p>
                <p>Tap to Play Again</p>
              </div>
            )}

            <Meow position={MeowY} isBlinking={isBlinking} />
            {pipes.map((pipe, index) => (
              <Pipe key={index} {...pipe} />
            ))}
            <Ground />
            {!isGameStarted && !isGameOver && (
              <div className="starter">
                <p>Click or tap to start the game!</p>
              </div>
            )}
          </div>
        )}

        {/* Sidebar with Wallet and NFT Display */}
        {activeLayer === "sidebar-with-wallet" && (
          <div className="sidebar" style={commonBackgroundStyle}>
            <h4>CONNECT TO SEE YOUR MEOWDY CATS</h4>
            <WalletConnection setWalletAddress={setWalletAddress} />
            {walletAddress && <NFTDisplay onMeowdyCountChange={handleMeowdyCountChange} />}
            <button
              onClick={() => setActiveLayer("title")}
              className="back-to-title-button"
            >
              Back to Title
            </button>
          </div>
        )}

        {/* Leaderboard Sidebar */}
        {activeLayer === "leaderboard" && (
          <div className="sidebar" style={commonBackgroundStyle}>
            <div
              style={{
                backgroundColor: "rgba(0, 0, 0, 0.7)", 
                padding: "20px",
                borderRadius: "10px",
                width: "80%",
                maxWidth: "600px",
                margin: "0 auto",
                textAlign: "center",
                position: "relative",
              }}
            >
              <h4 style={{ color: "white", marginBottom: "20px" }}>Leaderboard</h4>
              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  color: "white",
                  fontSize: "14px", 
                  lineHeight: "1.5",
                }}
              >
                {leaderboard.map((entry, index) => (
                  <li
                    key={index}
                    style={{ marginBottom: "8px", cursor: "pointer", userSelect: "none" }}
                    onClick={(e) => handleCopy(entry.username, e)}
                    className="copy-address"
                    title="Click to copy address"
                  >
                    {index + 1}.{" "}
                    <span className="address-text">
                      {entry.username.slice(0, 20)}...
                    </span>{" "}
                    - {entry.score}
                  </li>
                ))}
              </ul>
              {/* Copied popup */}
              {copied && (
                <span
                  className="copied-popup"
                  style={{
                    position: "fixed",
                    left: popupPosition.x + 16,
                    top: popupPosition.y - 16,
                    zIndex: 9999,
                    pointerEvents: "none",
                  }}
                >
                  Copied
                </span>
              )}
              <button
                onClick={() => setActiveLayer("title")}
                className="back-to-title-button"
                style={{
                  marginTop: "20px",
                  padding: "10px 20px",
                  border: "none",
                  borderRadius: "5px",
                  backgroundColor: "#007BFF",
                  color: "white",
                  fontWeight: "bold",
                  fontSize: "16px",
                  cursor: "pointer",
                  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                }}
              >
                Back to Title
              </button>
            </div>
          </div>
        )}

        {/* Social Links Layer */}
        {activeLayer === "social" && (
          <div className="info-sidebar" style={commonBackgroundStyle}>
            <h4>Official Links</h4>
            <ul>
              <li>
                <a href="https://x.com/MeowdyCatsNFT" target="_blank" rel="meowdy cat twitter">
                  Twitter
                </a>
              </li>
              <li>
                <a href="https://discord.com/invite/GVCm4kqxjz" target="_blank" rel="meowdy cat discord">
                  Discord
                </a>
              </li>
                <li>
                <a href="https://launchpad.wapal.io/nft/meowdy" target="_blank" rel="meowdy cat discord">
                  Wapal
                </a>
              </li>
            </ul>
            <button
              onClick={() => setActiveLayer("title")}
              className="back-to-title-button"
            >
              Back to Title
            </button>
          </div>
        )}
      </div>
    </AptosWalletAdapterProvider>
  );
}