import React from "react";
import headsetPoints from "../headsetPoints.json"; 
import OutlineStars from "./OutlineStars.js";

const HeadsetOutlineStars = ({ active, position = [0, 0, 0] }) => (
  <OutlineStars
    active={active}
    position={position}
    pointsData={headsetPoints} 
    scale={0.8}
  />
);

export default HeadsetOutlineStars;