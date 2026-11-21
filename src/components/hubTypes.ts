// Shared by Home (2D shell) and HubScene (WebGL), as types only, so importing them doesn't pull
// three.js into the main Home chunk.
export interface ScalingConfig {
  radius: number;
  iconScale: number;
  iconPlaneSize: number;
  ringInner: number;
  ringOuter: number;
  labelMargin: number;
  hologramScale: number;
  hologramRadius: number;
  hologramHalo: [number, number];
  hologramY: number;
}

export interface ConstellationScales {
  about: number;
  socials: number;
  resume: number;
  skills: number;
  projects: number;
}
