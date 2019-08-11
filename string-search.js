'use strict'

var stringSimilarity = require('string-similarity');
 
// var similarity = stringSimilarity.compareTwoStrings('healed', 'sealed'); 

let searchList = ['Gravity Falls - S01E01 - Tourist Trapped',
  'Gravity Falls - S01E02 - The Legend of the Gobblewonker',
  'Gravity Falls - S01E03 - Headhunters',
  'Gravity Falls - S01E04 - The Hand That Rocks the Mabel',
  'Gravity Falls - S01E05 - The Inconveniencing',
  'Gravity Falls - S01E06 - Dipper vs. Manliness',
  'Gravity Falls - S01E07 - Double Dipper',
  'Gravity Falls - S01E08 - Irrational Treasure',
  'Gravity Falls - S01E09 - The Time Travelers Pig',
  'Gravity Falls - S01E10 - Fight Fighters',
  'Gravity Falls - S01E11 - Little Dipper',
  'Gravity Falls - S01E12 - Summerween',
  'Gravity Falls - S01E13 - Boss Mabel',
  'Gravity Falls - S01E14 - Bottomless Pit!',
  'Gravity Falls - S01E15 - The Deep End',
  'Gravity Falls - S01E16 - Carpet Diem',
  'Gravity Falls - S01E17 - Boyz Crazy',
  'Gravity Falls - S01E18 - Land Before Swine',
  'Gravity Falls - S01E19 - Dreamscaperers (1)',
  'Gravity Falls - S01E20 - Gideon Rises (2)',
  'Gravity Falls - S02E01 - Scary-oke',
  'Gravity Falls - S02E02 - Into the Bunker',
  'Gravity Falls - S02E03 - The Golf War',
  'Gravity Falls - S02E04 - Sock Opera',
  'Gravity Falls - S02E05 - Soos and the Real Girl',
  'Gravity Falls - S02E06 - Little Gift Shop of Horrors',
  'Gravity Falls - S02E07 - Society of the Blind Eye',
  'Gravity Falls - S02E08 - Blendins Game',
  'Gravity Falls - S02E09 - The Love God',
  'Gravity Falls - S02E10 - Northwest Mansion Mystery',
  'Gravity Falls - S02E11 - Not What He Seems',
  'Gravity Falls - S02E12 - A Tale of Two Stans',
  'Gravity Falls - S02E13 - Dungeons, Dungeons, & More Dungeons',
  'Gravity Falls - S02E14 - The Stanchurian Candidate',
  'Gravity Falls - S02E15 - The Last Mabelcorn',
  'Gravity Falls - S02E16 - Roadside Attraction',
  'Gravity Falls - S02E17 - Dipper and Mabel vs. the Future',
  'Gravity Falls - S02E18 - Weirdmageddon (1)',
  'Gravity Falls - S02E19 - Weirdmageddon (2), Escape From Reality',
  'Gravity Falls - S02E20 - Weirdmageddon (3), Take Back The Falls'
  ];

  let searchWord = 'Gravity.Falls.S02E20';
 
// var matches = stringSimilarity.findBestMatch(searchWord, searchList);

// console.log(matches);

// Check for properly formatted E00S00
function checkEpisode(episode){
  let splitted = episode.split('');
  for (let i = 0; i < splitted.length; i++){
    if ((splitted[0] === 'S' || splitted[0] === 's') && (splitted[3] === 'E' || splitted[3] === 'e')){
      return true;
    } else {
      return false;
    }
  }
}

function checkExtras(episode){
  let splitted = episode.split('');
  for (let i = 0; i < splitted.length; i++){
    if ((splitted[0] === '[') && (splitted[splitted.length] === ']')){
      return true;
    } else {
      return false;
    }
  }
}

function parseFilename(fileName){
  // remove extras first
  let fullSplit = fileName.split('');
  let startBracketFound = false
  let extraTmp = [];
  let noExtrasTmp = [];
  let extras = [];
  for(let j = 0; j < fullSplit.length; j++){
    if(fullSplit[j] === '['){
      // console.log('Starting bracket found:', fullSplit[j]);
      startBracketFound = true;
      extraTmp.push(fullSplit[j]);
    } else if(fullSplit[j] === ']'){
      // console.log('End bracket found:', fullSplit[j]);
      startBracketFound = false;
      extraTmp.push(fullSplit[j]);
      let stage = extraTmp.join();
      stage = stage.split(',').join('');
      // console.log('stage:', stage);
      extras.push(stage);
      extraTmp = [];
    } else if (startBracketFound === true) {
      extraTmp.push(fullSplit[j]);
    } else {
      noExtrasTmp.push(fullSplit[j]);
    }
  }
  fileName = noExtrasTmp.join().split(',').join('');
  

  let splitDash = fileName.split(' - ');
  let splitDot = fileName.split('.');

  if (splitDash.length > 2){
    let seriesName = splitDash[0];
    let episode = splitDash[1];
    let episodeName = splitDash[2];
    return episode;
  } else {
    let seriesName = [];
    let episode = '';
    let episodeName = [];
    
    let episodeFound = false;
    for (let i = 0; i < splitDot.length; i++){
      if(checkEpisode(splitDot[i]) === true){
        episode = splitDot[i];
        episodeFound = true;
      } else if (checkExtras(splitDot[i]) === true) {
        extras.push(splitDot[i]);
      } else {
        if(episodeFound === false){
          seriesName.push(splitDot[i]);
        } else {
          episodeName.push(splitDot[i]);
        }
      }
    }
    console.log('Series Name:', seriesName);
    console.log('Episode:', episode);
    console.log('Episode Name:', episodeName);
    console.log('Extras:', extras);
    return episode;
  }
  
}

console.log(parseFilename('Gravity Falls - S02E17 - Dipper and Mabel vs. the Future'));
// console.log(parseFilename('[galumpa]Gravity.Falls.S02E17.Dipper.and.Mabel.vs.the.Future[h.264 1080p]'));