import React from "react";
import bookPoints from "../bookPoints.json";
import OutlineStars from "./OutlineStars.js";

const BookOutlineStars = ({ active, position = [0, 0, 0] }) => (
  <OutlineStars
    active={active}
    position={position}
    pointsData={bookPoints}
    scale={0.8}
  />
);

export default BookOutlineStars;