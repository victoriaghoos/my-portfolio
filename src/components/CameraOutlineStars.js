import React from "react";
import cameraPoints from "../cameraPoints.json";
import OutlineStars from "./OutlineStars.js";

const CameraOutlineStars = ({ active, position = [0, 0, 0] }) => (
  <OutlineStars
    active={active}
    position={position}
    pointsData={cameraPoints}
    scale={0.8}
  />
);

export default CameraOutlineStars;