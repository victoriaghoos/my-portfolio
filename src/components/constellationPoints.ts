import catPoints from '../catPoints.json';
import cameraPoints from '../cameraPoints.json';
import bookPoints from '../bookPoints.json';
import flowerPoints from '../flowerPoints.json';
import headsetPoints from '../headsetPoints.json';

const constellationPoints = {
  cat: catPoints,
  camera: cameraPoints,
  book: bookPoints,
  flower: flowerPoints,
  headset: headsetPoints,
};

export type ConstellationPoints = typeof constellationPoints;
export default constellationPoints;
