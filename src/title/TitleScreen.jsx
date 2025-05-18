import React, { useState } from 'react';
import './TitleScreen.css'; // Make sure to link the corresponding CSS file

const TitleScreen = ({ onStartGame, onShowLeaderboard, onShowSocialLinks, onConnectWallet }) => {
  const [customizeText, setCustomizeText] = useState("CUSTOMIZE");

  const handleMouseEnter = () => {
    setCustomizeText("COMING SOON");
  };

  const handleMouseLeave = () => {
    setCustomizeText("CUSTOMIZE");
  };

  return (
    <div className="title-screen">
      <h1 className="title">Meowdy Flight</h1>
      <div className="button-container">
        <button
          className="button"
          style={{ backgroundImage: "url('button.png')" }}
          onClick={onStartGame}
        >
          START GAME
        </button>
        <button
          className="button"
          style={{ backgroundImage: "url('button.png')" }}
          onClick={onShowLeaderboard}
        >
          LEADERBOARD
        </button>
        <button
          className="button"
          style={{ backgroundImage: "url('button.png')" }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {customizeText}
        </button>
        <button
          className="button"
          style={{ backgroundImage: "url('button.png')" }}
          onClick={onShowSocialLinks}
        >
          SOCIAL LINKS
        </button>
        <button
          className="button"
          style={{ backgroundImage: "url('button.png')" }}
          onClick={onConnectWallet}
        >
          CONNECT WALLET
        </button>
      </div>
    </div>
  );
};

export default TitleScreen;