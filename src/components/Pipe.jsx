import React from "react";
import pipeImg from "../assets/pipe.png";

const PIPE_WIDTH = 60;
const PIPE_GAP = 150;
const GAME_HEIGHT = 800;

export default function Pipe({ x, height }) {
  return (
    <>
      <img
        src={pipeImg}
        alt="pipe-top"
        style={{
          position: "absolute",
          left: `${x + 60}px`, 
          top: "0",
          width: `${PIPE_WIDTH}px`,
          height: `${height}px`,
          transform: "rotate(180deg)",
        }}
      />
      <img
        src={pipeImg}
        alt="pipe-bottom"
        style={{
          position: "absolute",
          left: `${x + 60}px`, 
          top: `${height + PIPE_GAP}px`,
          width: `${PIPE_WIDTH}px`,
          height: `${GAME_HEIGHT - (height + PIPE_GAP)}px`,
        }}
      />
    </>
  );
}
