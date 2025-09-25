import fs from "fs";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js";
import { JSDOM } from "jsdom";

global.DOMParser = new JSDOM().window.DOMParser;

const svgString = fs.readFileSync("src/assets/images/headset.svg", "utf8");
const loader = new SVGLoader();
const { paths } = loader.parse(svgString);

const collected = [];

paths.forEach((path) => {
  path.subPaths.forEach((subPath) => {
    const points = subPath.getPoints(500); 
    points.forEach((pt) => {
      collected.push([pt.x, pt.y]);
    });
  });
});

fs.writeFileSync("src/headsetPoints.json", JSON.stringify(collected));
console.log("✅ headsetPoints.json written with", collected.length, "points");