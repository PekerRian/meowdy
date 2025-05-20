import React, { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  limit,
  where,
  updateDoc,
} from "firebase/firestore";
import { db } from "./database/firebase";
import useGameLoop from "./hooks/useGameLoop";

import Meow from "./components/Meow";
import Pipe from "./components/Pipe";
import Ground from "./components/Ground";
import WalletConnection from "./wallet/WalletConnection";
import NFTDisplay from "./nft/NFTDisplay";
import TitleScreen from "./title/TitleScreen";

import backgroundImg from "./assets/background.png";
import background1 from './assets/background1.png';
import background2 from './assets/background2.png';
import background3 from './assets/background3.png';
import background4 from './assets/background4.png';
import background5 from './assets/background5.png';
import background6 from './assets/background6.png';
import background7 from './assets/background7.png';
import background8 from './assets/background8.png';
import background9 from './assets/background9.png';
import background10 from './assets/background10.png';
import background11 from './assets/background11.png';
import background12 from './assets/background12.png';
import background13 from './assets/background13.png';
import background14 from './assets/background14.png';
import background15 from './assets/background15.png';
import background16 from './assets/background16.png';

import { AptosWalletAdapterProvider } from "@aptos-labs/wallet-adapter-react";
import "./styles.css";

const backgroundImages = [
  background1,
  background2,
  background3,
  background4,
  background5,
  background6,
  background7,
  background8,
  background9,
  background10,
  background11,
  background12,
  background13,
  background14,
  background15,
  background16,
];

function getBackgroundImage(score) {
  const index = Math.min(Math.floor(score / 30), backgroundImages.length - 1);
  return backgroundImages[index];
}

const wallets = [];

// Username Modal Component
function UsernameModal({ onSubmit, loading, initialValue }) {
  const [username, setUsername] = useState(initialValue || "");

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
      background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000
    }}>
      <div style={{
        background: "#fff", padding: 32, borderRadius: 12, minWidth: 320,
        boxShadow: "0 8px 32px rgba(0,0,0,0.2)", textAlign: "center"
      }}>
        <h3>{initialValue ? "Edit Username" : "Create Username"}</h3>
        <input
          style={{ fontSize: 18, padding: 8, marginBottom: 16, borderRadius: 6, border: "1px solid #ccc", width: "90%" }}
          value={username}
          onChange={e => setUsername(e.target.value.replace(/[^\w\d_-]/g, ""))}
          placeholder="Enter username"
          maxLength={20}
          disabled={loading}
        />
        <div>
          <button
            style={{
              background: "#007bff", color: "#fff", border: "none", borderRadius: 4,
              padding: "8px 20px", fontWeight: "bold", fontSize: 16, cursor: "pointer"
            }}
            disabled={loading || !username}
            onClick={() => onSubmit(username)}
          >
            {loading ? "Saving..." : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [activeLayer, setActiveLayer] = useState("title");
  const [walletAddress, setWalletAddress] = useState("");
  const [userProfile, setUserProfile] = useState(null);
  const [showUsernameModal, setShowUsernameModal] = useState(false);
  const [usernameLoading, setUsernameLoading] = useState(false);
  const [meowdyCount, setMeowdyCount] = useState(1);
  const [leaderboard, setLeaderboard] = useState([]);
  const [isGameOver, setIsGameOver] = useState(false);

  // For copy-to-clipboard popup
  const [copied, setCopied] = useState(false);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });

  // Set browser tab title (general usage)
  useEffect(() => {
    document.title = "Meowdy Flight";
  }, []);

  // On wallet connect, check/create user, and show username modal if needed
  useEffect(() => {
    const checkOrCreateUser = async () => {
      if (!walletAddress) {
        setUserProfile(null);
        return;
      }
      try {
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("accountAddress", "==", walletAddress));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
          setShowUsernameModal(true);
        } else {
          setUserProfile(snapshot.docs[0].data());
        }
      } catch (err) {
        console.error("Error checking/creating user:", err);
        setUserProfile(null);
      }
    };

    checkOrCreateUser();
  }, [walletAddress]);

  // Handle Username Submission (create or update in Firestore)
  const handleUsernameSubmit = async (username) => {
    const cleanUsername = username.trim();
    if (!walletAddress || !cleanUsername) return;
    setUsernameLoading(true);
    try {
      const usersRef = collection(db, "users");
      // Check if username already taken by another account
      const usernameQuery = query(usersRef, where("username", "==", cleanUsername));
      const usernameSnap = await getDocs(usernameQuery);
      if (!usernameSnap.empty) {
        alert("Username is already taken, please choose another.");
        setUsernameLoading(false);
        return;
      }
      // Check if user already exists (shouldn't, but be defensive)
      const q = query(usersRef, where("accountAddress", "==", walletAddress));
      const snapshot = await getDocs(q);

      let userData = {
        accountAddress: walletAddress,
        username: cleanUsername,
        highscore: 0,
      };
      if (snapshot.empty) {
        await addDoc(usersRef, userData);
      } else {
        await updateDoc(snapshot.docs[0].ref, { username: cleanUsername });
        userData = { ...snapshot.docs[0].data(), username: cleanUsername };
      }
      setUserProfile(userData);
      setShowUsernameModal(false);
    } catch (err) {
      alert("Error saving username.");
      console.error(err);
    } finally {
      setUsernameLoading(false);
    }
  };

  const {
    MeowY,
    pipes,
    score,
    lives,
    jump,
    stopGame,
    startGame,
    resetGame,
    isGameStarted,
    isBlinking,
    isVibrating,
  } = useGameLoop(
    async () => {
      setIsGameOver(true);
      stopGame();

      // Save ONLY IF the new score is higher than highscore (users) and leaderboard (for wallet)
      if (walletAddress) {
        try {
          const leaderboardRef = collection(db, "leaderboard");
          const userQuery = query(leaderboardRef, where("username", "==", walletAddress));
          const userSnap = await getDocs(userQuery);

          if (userSnap.empty) {
            await addDoc(leaderboardRef, {
              username: walletAddress,
              score: score,
              timestamp: new Date(),
            });
          } else {
            const userDoc = userSnap.docs[0];
            const prevScore = userDoc.data().score;
            if (score > prevScore) {
              await updateDoc(userDoc.ref, {
                score: score,
                timestamp: new Date(),
              });
            }
          }

          if (userProfile && score > (userProfile.highscore || 0)) {
            const usersRef = collection(db, "users");
            const userQ = query(usersRef, where("accountAddress", "==", walletAddress));
            const userSnap = await getDocs(userQ);
            if (!userSnap.empty) {
              await updateDoc(userSnap.docs[0].ref, { highscore: score });
              setUserProfile({
                ...userProfile,
                highscore: score,
              });
            }
          }
        } catch (error) {
          console.error("Error updating leaderboard/user highscore:", error);
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

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const leaderboardQuery = query(
          collection(db, "leaderboard"),
          orderBy("score", "desc"),
          limit(50)
        );
        const querySnapshot = await getDocs(leaderboardQuery);
        const scoresRaw = querySnapshot.docs.map((doc) => doc.data());

        const unique = new Map();
        for (const entry of scoresRaw) {
          if (!unique.has(entry.username) || entry.score > unique.get(entry.username).score) {
            unique.set(entry.username, entry);
          }
        }
        const scores = Array.from(unique.values());
        scores.sort((a, b) => b.score - a.score);
        const topScores = scores.slice(0, 10);

        const addresses = Array.from(new Set(topScores.map(entry => entry.username)));
        let addressToUser = {};
        if (addresses.length) {
          const batches = [];
          for (let i = 0; i < addresses.length; i += 10) {
            batches.push(addresses.slice(i, i + 10));
          }
          for (const batch of batches) {
            const usersQuery = query(
              collection(db, "users"),
              where("accountAddress", "in", batch)
            );
            const usersSnap = await getDocs(usersQuery);
            usersSnap.forEach(doc => {
              const d = doc.data();
              addressToUser[d.accountAddress] = d.username;
            });
          }
        }

        const resolvedScores = topScores.map(entry => ({
          ...entry,
          displayName: addressToUser[entry.username] || entry.username
        }));

        setLeaderboard(resolvedScores);
      } catch (error) {
        console.error("Error fetching leaderboard data:", error);
      }
    };

    fetchLeaderboard();
  }, [isGameOver, walletAddress]);

  const commonBackgroundStyle = {
    backgroundImage: `url(${backgroundImg})`,
    backgroundSize: "cover",
    position: "relative",
    overflow: "hidden",
  };

  const gameBackgroundStyle = {
    ...commonBackgroundStyle,
    backgroundImage: `url(${getBackgroundImage(score)})`,
  };

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

        {activeLayer === "game" && (
          <div
            className={`game-container${isVibrating ? " vibrating" : ""}`}
            onClick={handleJump}
            style={gameBackgroundStyle}
          >
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

        {activeLayer === "sidebar-with-wallet" && (
          <div className="sidebar" style={commonBackgroundStyle}>
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
            <h4>CONNECT TO SEE YOUR MEOWDY CATS</h4>
            <WalletConnection setWalletAddress={setWalletAddress} />
            {walletAddress && <NFTDisplay onMeowdyCountChange={handleMeowdyCountChange} walletAddress={walletAddress} />}
            {userProfile && (
              <div
                style={{
                  margin: "20px 0",
                  background: "#fff",
                  color: "#222",
                  padding: "10px 20px",
                  borderRadius: "8px",
                  fontSize: "16px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
                }}
              >
                <div>
                  <strong>Username:</strong> {userProfile.username}
                  <button
                    style={{
                      marginLeft: 12, fontSize: 12, padding: "2px 10px",
                      border: "none", background: "#007bff", color: "#fff", borderRadius: 4, cursor: "pointer"
                    }}
                    onClick={() => setShowUsernameModal(true)}
                  >Edit</button>
                </div>
                <div>
                  <strong>Highscore:</strong> {userProfile.highscore}
                </div>
              </div>
            )}
            <button
              onClick={() => setActiveLayer("title")}
              className="back-to-title-button"
              style={{
                marginTop: "-10px",
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
        )}

        {showUsernameModal && (
          <UsernameModal
            onSubmit={handleUsernameSubmit}
            initialValue={userProfile ? userProfile.username : ""}
            loading={usernameLoading}
          />
        )}

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
              <h3 style={{ color: "gold", marginBottom: "10px" }}>prize pool = 5apt</h3>
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
                      {entry.displayName.length > 20
                        ? entry.displayName.slice(0, 20) + "..."
                        : entry.displayName}
                    </span>{" "}
                    - {entry.score}
                  </li>
                ))}
              </ul>
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
                <a href="https://launchpad.wapal.io/nft/meowdy" target="_blank" rel="meowdy cat wapal">
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