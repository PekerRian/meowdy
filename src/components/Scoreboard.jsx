import React from "react";

export default function Scoreboard({ score }) {
  return (
    <div
      className="scoreboard"
      style={{
        position: "absolute",
        top: 20,
        left: "50%",
        transform: "translateX(-50%)",
        fontSize: 32,
        fontWeight: "bold",
        color: "#fff",
        textShadow: "2px 2px 4px #000",
      }}
    >
      Score: {score}
    </div>
  );
}
