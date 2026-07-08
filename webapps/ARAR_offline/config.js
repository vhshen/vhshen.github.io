// ---- Study configuration ----
// Edit this file to set up your study: add or remove clip pairs below.

const CONFIG = {
  // If true, participants must type something in both boxes before "Next" is enabled.
  requireResponses: true,

  // One entry per pair the participant will see, in order.
  // Put your video files in the videos/ folder with matching names.
  pairs: [
    { id: "pair1", clip1: "videos/pair1_clip1.mp4", clip2: "videos/pair1_clip2.mp4" },
    { id: "pair2", clip1: "videos/pair2_clip1.mp4", clip2: "videos/pair2_clip2.mp4" },
    { id: "pair3", clip1: "videos/pair3_clip1.mp4", clip2: "videos/pair3_clip2.mp4" },
    { id: "pair4", clip1: "videos/pair4_clip1.mp4", clip2: "videos/pair4_clip2.mp4" },
    { id: "pair5", clip1: "videos/pair5_clip1.mp4", clip2: "videos/pair5_clip2.mp4" },
  ],
};
