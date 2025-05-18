import React from "react";
import MeowImg from "../assets/Meow.png";

export default function Meow({ position, isBlinking }) {
  return (
    <img
      src={MeowImg}
      alt="Meow"
      className={isBlinking ? "blinking" : ""}
      style={{
        position: "absolute",
        left: "100px",
        top: `${position}px`,
        width: "40px",
        height: "40px",
      }}
    />
  );
}