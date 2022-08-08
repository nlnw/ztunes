import songs from "./songs.json";

export const getRandomSong = () => {
  return songs[Math.floor(Math.random() * songs.length)];
};
