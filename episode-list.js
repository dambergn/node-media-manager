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

let specials = [];
let episodes = [];

for (let i = 0; i < info.episodes.length; i++) {

  function n(n) {
    return n > 9 ? "" + n : "0" + n;
  };

  let season = n(info.episodes[i].airedSeason);
  let episodeNumber = n(info.episodes[i].airedEpisodeNumber);
  let episodeName = info.episodes[i].episodeName.replace(':',',').replace('\'','').replace('?','');

  let fileName = info.seriesName + ' - S' + season + 'E' + episodeNumber + ' - ' + episodeName

  if (season === '00' ){
    specials.push(fileName);
  } else {
    episodes.push(fileName);
  }
};

console.log(specials);