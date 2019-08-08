'use strict';

require('dotenv').config();
const fs = require('fs');
const request = require('node-fetch');
const requestURL = require('request');
const bodyParser = require('body-parser');

// const episodesToText = require ('./episode-list.js');

// The TVDB
const TheTVDB_URL = 'https://api.thetvdb.com';
const TVDB_KEY = process.env.TVDB_API_KEY;
const TVDB_API_VERSION = 'v2.1.1';
const TVDB_AV_HEADER = `application/vnd.thetvdb.${TVDB_API_VERSION}`;
const TVDB = require('node-tvdb');
const tvdb = new TVDB(TVDB_KEY);

function getSeries(seriesName) {
  tvdb.getSeriesByName(seriesName)
    .then(response => { console.log(response) })
    .catch(error => { throw (error) });
};

function getSeriesID(seriesID) {
  tvdb.getSeriesById(seriesID)
    .then(response => { console.log(response) })
    .catch(error => { throw (error) });
}

function getEpisodesByID(seriesID) {
  tvdb.getEpisodesSummaryBySeriesId(seriesID)
    .then(response => { console.log(response) })
    .catch(error => { throw (error) });
}

exports.getSeriesAllByID = function (seriesID) {
  tvdb.getSeriesAllById(seriesID)
    .then(response => {
      response; // contains series data (i.e. `id`, `seriesName`)
      response.episodes; // contains an array of episodes
      // console.log(response);
      saveToJSON(response);
      createSeasonsFolders(response);
    })
    .catch(error => { throw (error) });
};

function getSeriesBannerByID(seriesID) {
  tvdb.getSeriesBanner(seriesID)
    .then(response => { console.log(response) })
    .catch(error => { throw (error) });
}

function getSeriesFanArtByID(name, seriesID, response) {
  tvdb.getSeriesImages(seriesID, 'fanart')
    .then(response => {
      // console.log(response);
      TVDBdownloadFanart(name, seriesID, response);
      return response
    })
    .catch(error => { throw (error) });
}

function getSeriesPostersByID(name, seriesID) {
  tvdb.getSeriesPosters(seriesID)
    .then(response => {
      TVDBdownloadPosters(name, seriesID, response);
      return response
    })
    .catch(error => { throw (error) });
}

let download = function (uri, filename, callback) {
  requestURL.head(uri, function (err, res, body) {
    requestURL(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
  });
};

function TVDBdownloadPosters(name, seriesID, data) {
  // https://www.thetvdb.com/banners/posters/275274-7.jpg
  function n(n) {
    return n > 9 ? "" + n : "0" + n;
  };
  for (let i = 0; i < data.length; i++) {
    let downloadURL = 'https://www.thetvdb.com/banners/' + data[i].fileName;
    let saveFileName = 'downloads/' + name + '/img/' + name + ' - poster' + n(i) + '[' + data[i].resolution + '].jpg';
    download(downloadURL, saveFileName, function () {
    });
  }
}

function TVDBdownloadFanart(name, seriesID, data) {
  // https://www.thetvdb.com/banners/fanart/original/275274-9.jpg
  // console.log(data);

  function n(n) {
    return n > 9 ? "" + n : "0" + n;
  };
  for (let i = 0; i < data.length; i++) {
    let downloadURL = 'https://www.thetvdb.com/banners/' + data[i].fileName;
    let saveFileName = 'downloads/' + name + '/img/' + name + ' - fanart' + n(i) + '[' + data[i].resolution + '].jpg';

    download(downloadURL, saveFileName, function () { });
  }
}

function TVDBdownloadThumbnails(name, seriesID, data) {
  // https://www.thetvdb.com/banners/episodes/275274/4711142.jpg
  function n(n) {
    return n > 9 ? "" + n : "0" + n;
  };
  for (let i = 0; i < data.length; i++) {
    let downloadURL = 'https://www.thetvdb.com/banners/' + data[i].fileName;
    let saveFileName = 'downloads/' + name + '/img/' + name + ' - fanart' + n(i) + '[' + data[i].resolution + '].jpg';

    download(downloadURL, saveFileName, function () { });
  }
}

function saveToJSON(data) {
  if (!fs.existsSync('downloads')) {
    fs.mkdirSync('downloads');
  };

  if (!fs.existsSync(`downloads/${data.seriesName}`)) {
    fs.mkdirSync(`downloads/${data.seriesName}`);
    fs.mkdirSync(`downloads/${data.seriesName}/img`);
  };

  fs.writeFile(`./downloads/${data.seriesName}/info.json`, JSON.stringify(data), 'utf8', function (err) {
    if (err) {
      return console.log(err);
    };
    console.log("The file was saved!");
    saveToTextFile(`./downloads/${data.seriesName}/info.json`, data);
  });

  getSeriesPostersByID(data.seriesName, data.id);
  getSeriesFanArtByID(data.seriesName, data.id);

};

// Save Episodes to Human Readable Text File
let filePath = '';
// let rawdata = '';
// let info = '';

// function collectData() {
//   rawdata = fs.readFileSync(filePath);
//   info = JSON.parse(rawdata);
//   // console.log(info.seriesName);
//   // console.log(info.overview);
//   // console.log(info.episodes.length);
// }


let episodes = [];

//How many seasons in series
function findNumberOfSeasons(data) {
  let count = 0;
  let found = [];
  for (let i = 0; i < data.episodes.length; i++) {

    if (typeof found[data.episodes[i].airedSeason] === 'undefined') {
      // does not exist
      count++;
      found.push(data.episodes[i].airedSeason);
    } else {
      // does exist
    }
  };
  return count;
};

//Generate 3D array for seasons
function generateArray(data) {
  for (let i = 0; i < findNumberOfSeasons(data); i++) {
    episodes.push(new Array());
  }
};


//Populates 3D array of seasons and episode names
function generateFileNames(data) {
  function n(n) {
    return n > 9 ? "" + n : "0" + n;
  };
  for (let i = 0; i < data.episodes.length; i++) {
    let season = n(data.episodes[i].airedSeason);
    let episodeNumber = n(data.episodes[i].airedEpisodeNumber);
    let episodeName = data.episodes[i].episodeName.replace(':', ',').replace('\'', '').replace('?', '');

    let fileName = data.seriesName + ' - S' + season + 'E' + episodeNumber + ' - ' + episodeName

    episodes[data.episodes[i].airedSeason].push(fileName);
  };
};


// Saves episode list to a text file
function generateTextEpisodeList(data) {
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

  text.write(data.seriesName + '\n') // append string to your file
  text.write('' + '\n') // Blank Space
  text.write(data.overview + '\n') // again
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

let saveToTextFile = function (folder, data) {
  filePath = folder
  // collectData()
  generateArray(data);
  generateFileNames(data);
  generateTextEpisodeList(data);
}

function createSeasonsFolders(data){
  let seasons = findNumberOfSeasons(data)

  function n(n) {
    return n > 9 ? "" + n : "0" + n;
  };
  
  for(let i = 0; i < seasons; i++){
    if(i < 1){
      if (!fs.existsSync(`downloads/${data.seriesName}/Specials`)) {
        fs.mkdirSync(`downloads/${data.seriesName}/Specials`);
      };
    } else {
      if (!fs.existsSync(`downloads/${data.seriesName}/Season${n(i)}`)) {
        fs.mkdirSync(`downloads/${data.seriesName}/Season${n(i)}`);
      };
    }
  }
}