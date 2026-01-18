/**
 * Configuration for Level One - Surface Facility
 * Contains room dimensions, prop positions, and constants
 */

export default {
  // Room dimensions
  roomWidth: 7,
  roomDepth: 8,
  wallHeight: 3,
  wallThickness: 0.2,
  doorWidth: 3,

  // Prop positions
  deskPosition: { x: -2, y: 0, z: -2.5 },

  // Barrel positions (calculated based on room dimensions)
  // Position 1: roomWidth/2 - 1 = 2.5, roomDepth/2 - 1 = 3
  // Position 2: -roomWidth/2 + 1.5 = -2, roomDepth/2 - 0.5 = 3.5
  // Position 3: -roomWidth/2 + 0.5 = -3, roomDepth/2 - 1.5 = 2.5
  barrelPositions: [
    { x: 2.5, z: 3 },
    { x: -2, z: 3.0 },
    { x: -3, z: 2.5 },
  ],

  // Dead body position
  deadBodyPosition: {
    x: 2.5, // roomWidth/2 - 1
    y: 0,
    z: -3, // -roomDepth/2 + 1
  },

  // Rotten window position
  rottenWindowPosition: {
    x: 3.31, // roomWidth/2 - 0.19
    y: 1.6,
    z: 0,
  },

  // Vault door position (on west wall)
  vaultDoorPosition: {
    x: -4.7, // -roomWidth/2 - 1.2
    y: 1.5, // wallHeight/2
    z: 0,
  },

  // Blood decal positions
  bloodPuddles: [
    { radius: 0.45, x: -2.7, z: -3.2 }, // -roomWidth/2 + 0.8, -roomDepth/2 + 0.8
    { radius: 0.35, x: -2.45, z: -3.05 }, // -roomWidth/2 + 1.05, -roomDepth/2 + 0.95
  ],

  // Radioactive spill center
  radioactiveSpillCenter: {
    x: -1, // -roomWidth/2 + 1.5
    z: -1, // -roomDepth/2 + 1.6
  },

  // Ceiling light positions
  ceilingLightPositions: [
    { x: 2, z: -1.5 },
    { x: 2, z: 1.5 },
  ],

  // Laboratory room (west of reception)
  lab: {
    width: 10, // Wider than reception
    depth: 12, // Deeper than reception
    wallHeight: 3,
    offsetX: -8.5, // West of reception room
    offsetZ: 0, // Aligned with reception on Z-axis
  },

  // Body scanning machine positions (in laboratory)
  bodyScanningMachinePositions: [
    { x: -11, y: 0, z: -3, rotation: 0, hasAlien: false },
    { x: -11, y: 0, z: 3, rotation: Math.PI, hasAlien: true },
    { x: -8, y: 0, z: -3, rotation: 0, hasAlien: true },
    { x: -8, y: 0, z: 3, rotation: Math.PI, hasAlien: false },
    { x: -5, y: 0, z: -3, rotation: 0, hasAlien: true },
    { x: -5, y: 0, z: 3, rotation: Math.PI, hasAlien: false },
  ],

  // Time machine position (at end of laboratory, centered between furthest beds)
  timeMachinePosition: {
    x: -12.5, // End of lab, past the furthest beds at x: -11
    y: 0,
    z: 0, // Centered between beds at z: -3 and z: 3
  },

  // Laboratory blood decals
  labBloodPuddles: [
    { radius: 0.5, x: -10.5, z: -4.5 }, // Near first bed
    { radius: 0.4, x: -7.8, z: 4.2 }, // Near second bed
    { radius: 0.35, x: -6, z: -2 }, // In the middle area
  ],

  // Laboratory radioactive spill center
  labRadioactiveSpillCenter: {
    x: -9, // Middle of the lab
    z: 0, // Centered on Z-axis
  },

  // Security camera position (top east corner of lab)
  securityCameraPosition: {
    x: -4, // East wall of lab (offsetX + width/2 - small offset)
    y: 2.7, // Near ceiling
    z: -6, // North wall of lab (offsetZ - depth/2 + small offset)
  },

  // Security camera look-at target (center of lab)
  securityCameraTarget: {
    x: -8.5, // Center of lab (same as lab.offsetX)
    y: 0, // Ground level
    z: 0, // Center on Z-axis
  },

  // Portal position (on time machine)
  portalPosition: {
    x: -12.5, // Same as time machine
    y: 2.0, // Above the time machine platform
    z: 0, // Same as time machine
  },
};
