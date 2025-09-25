import React from "react";
import catPoints from "../catPoints.json";
import OutlineStars from "./OutlineStars.js";

const CatOutlineStars = ({ active, position = [0, 0, 0] }) => (
  <OutlineStars
    active={active}
    position={position}
    pointsData={catPoints}
    scale={1.3}
    pointSize={0.1}
  />
);

export default CatOutlineStars;