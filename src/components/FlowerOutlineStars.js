import React from "react";
import flowerPoints from "../flowerPoints.json"; 
import OutlineStars from "./OutlineStars.js";

const FlowerOutlineStars = ({ active, position = [0, 0, 0] }) => (
  <OutlineStars
    active={active}
    position={position}
    pointsData={flowerPoints} 
    scale={0.8}
  />
);

export default FlowerOutlineStars;