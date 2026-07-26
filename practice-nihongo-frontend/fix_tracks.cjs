const fs = require('fs');
const path = require('path');

const srcDir = 'c:/practice-nihongo/practice-nihongo-frontend/src/data/listening';

function fixAudioSrc(filePath, lessonNum, trackNum) {
  const content = fs.readFileSync(filePath, 'utf8');
  // Replace old audioSrc format with the exact filename e.g., "34 Track 34.mp3"
  const newContent = content.replace(
    /audioSrc: "\/audio\/listening\/[^"]+"/,
    `audioSrc: "/audio/listening/Chukyu-Lesson ${lessonNum}/${trackNum} Track ${trackNum}.mp3"`
  );
  fs.writeFileSync(filePath, newContent);
}

// Lesson 8 tracks
fixAudioSrc(path.join(srcDir, 'lesson8', 'track34.js'), 8, 34);
fixAudioSrc(path.join(srcDir, 'lesson8', 'track36.js'), 8, 36);

// Lesson 9 tracks
fixAudioSrc(path.join(srcDir, 'lesson9', 'track37.js'), 9, 37);
fixAudioSrc(path.join(srcDir, 'lesson9', 'track39.js'), 9, 39);
fixAudioSrc(path.join(srcDir, 'lesson9', 'track40.js'), 9, 40);

// Lesson 10 tracks
fixAudioSrc(path.join(srcDir, 'lesson10', 'track42.js'), 10, 42);
fixAudioSrc(path.join(srcDir, 'lesson10', 'track44.js'), 10, 44);
fixAudioSrc(path.join(srcDir, 'lesson10', 'track45.js'), 10, 45);
fixAudioSrc(path.join(srcDir, 'lesson10', 'track46.js'), 10, 46);

const listeningDataContent = `import { track25 } from './listening/lesson6/track25';
import { track26 } from './listening/lesson6/track26';
import { track27 } from './listening/lesson6/track27';
import { track28 } from './listening/lesson6/track28';
import { track34 } from './listening/lesson8/track34';
import { track36 } from './listening/lesson8/track36';
import { track37 } from './listening/lesson9/track37';
import { track39 } from './listening/lesson9/track39';
import { track40 } from './listening/lesson9/track40';
import { track42 } from './listening/lesson10/track42';
import { track44 } from './listening/lesson10/track44';
import { track45 } from './listening/lesson10/track45';
import { track46 } from './listening/lesson10/track46';

export const listeningData = [
  {
    lesson: "Chukyu-Lesson 6",
    tracks: [
      track25,
      track26,
      track27,
      track28
    ]
  },
  {
    lesson: "Chukyu-Lesson 8",
    tracks: [
      track34,
      track36
    ]
  },
  {
    lesson: "Chukyu-Lesson 9",
    tracks: [
      track37,
      track39,
      track40
    ]
  },
  {
    lesson: "Chukyu-Lesson 10",
    tracks: [
      track42,
      track44,
      track45,
      track46
    ]
  }
];
`;

fs.writeFileSync(path.join(srcDir, '..', 'listeningData.js'), listeningDataContent);
console.log("Files updated successfully!");
