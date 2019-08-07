#!/usr/bin/nodemon
'use strict'
/*
Converts saved json file to a simple to view and use txt file with episode file names.
*/

const fs = require('fs');

let filePath = 'downloads/Rick and Morty/'

let rawdata = fs.readFileSync(filePath + 'info.json');
let info = JSON.parse(rawdata);
// console.log(info.seriesName);
// console.log(info.overview);
// console.log(info.episodes.length);

let episodes = [];

//How many seasons in series
function findNumberOfSeasons() {
  let count = 0;
  let found = [];
  for (let i = 0; i < info.episodes.length; i++) {

    if (typeof found[info.episodes[i].airedSeason] === 'undefined') {
      // does not exist
      count++;
      found.push(info.episodes[i].airedSeason);
    } else {
      // does exist
    }
  };
  return count;
};

//Generate 3D array for seasons
function generateArray() {
  for (let i = 0; i < findNumberOfSeasons(); i++) {
    episodes.push(new Array());
  }
};
generateArray();

//Populates 3D array of seasons and episode names
function generateFileNames() {
  function n(n) {
    return n > 9 ? "" + n : "0" + n;
  };
  for (let i = 0; i < info.episodes.length; i++) {
    let season = n(info.episodes[i].airedSeason);
    let episodeNumber = n(info.episodes[i].airedEpisodeNumber);
    let episodeName = info.episodes[i].episodeName.replace(':', ',').replace('\'', '').replace('?', '');

    let fileName = info.seriesName + ' - S' + season + 'E' + episodeNumber + ' - ' + episodeName

    episodes[info.episodes[i].airedSeason].push(fileName);
  };
};
generateFileNames();

// Saves episode list to a text file
function generateTextEpisodeList() {
  // Checks to see if file already exists and if it does, deltes it.
  try {
    if (fs.existsSync(filePath + 'episode-list.txt')) {
      //file exists
      try {
        fs.unlinkSync(filePath + 'episode-list.txt')
        //file removed
      } catch (err) {
        console.error(err)
      }
    }
  } catch (err) {
    console.error(err)
  }

  var text = fs.createWriteStream(filePath + 'episode-list.txt', {
    flags: 'a' // 'a' means appending (old data will be preserved)
  })

  text.write(info.seriesName + '\n') // append string to your file
  text.write('' + '\n') // Blank Space
  text.write(info.overview + '\n') // again
  text.write('' + '\n') // Blank Space
  
  function n(n) {
    return n > 9 ? "" + n : "0" + n;
  };
  for (let i = 0; i < episodes.length; i++) { // Seasons
    if (i === 0) {
      text.write('Specials' + '\n')
    } else {
      text.write('Season ' + n(i) + '\n')
    }
    for (let j = 0; j < episodes[i].length; j++) { // Episodes
      text.write(episodes[i][j] + '\n')
    }
    text.write('' + '\n') // Blank Space
  }
  text.end() // close string
}

generateTextEpisodeList();
