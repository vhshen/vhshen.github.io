// ---- Study configuration ----
// Edit this file to set up your study: add or remove clip pairs below.

const CONFIG = {
  // If true, participants must type something in both boxes and answer every
  // Likert statement for both clips before "Next" is enabled.
  requireResponses: true,

  // 7-point Likert statements asked about each clip. Shown identically for
  // both Clip 1 and Clip 2. `key` is used as the CSV column suffix.
  likertStatements: [
    { key: "interesting", text: "The audio was interesting" },
    { key: "pleasant", text: "The audio was pleasant" },
    { key: "fun", text: "It was fun to listen to the audio" },
    { key: "boring", text: "It was boring to listen to the audio" },
    { key: "confusing", text: "It was confusing to listen to the audio" },
    { key: "realistic", text: "The audio was realistic" },
    { key: "appropriate", text: "The audio was appropriate when and where I heard it" },
    // { key: "immersive", text: "The audio was immersive" },
  ],

  // One entry per pair the participant will see, in order.
  // Put your video files in the videos/ folder with matching names.
  //
  // `comparisonWord` fills the blank in the forced-choice question shown at
  // the bottom of each pair screen: "Which clip would you describe as
  // '<comparisonWord>'?" — edit each one to the word/phrase you want for
  // that specific pair.
  pairs: [
    { id: "pair1", clip1: "videos/carrots_aug.mp4", clip2: "videos/carrots_norm.mp4", comparisonWord: "crunchier" },
    { id: "pair2", clip1: "videos/opencan_norm.mp4", clip2: "videos/opencan_aug.mp4", comparisonWord: "fizzier" },
    { id: "pair3", clip1: "videos/vacuum_norm.mp4", clip2: "videos/vacuum_aug.mp4", comparisonWord: "more pleasant" },
    { id: "pair4", clip1: "videos/toothbrush_aug.mp4", clip2: "videos/toothbrush_norm.mp4", comparisonWord: "rougher" },
    { id: "pair5", clip1: "videos/engine_norm.mp4", clip2: "videos/engine_aug.mp4", comparisonWord: "sportier" },
  ],
};
