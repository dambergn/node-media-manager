'use strict';
// 'v1.0'

require('dotenv').config();
const fs = require('fs');
const request = require('node-fetch');
const requestURL = require('request');
const bodyParser = require('body-parser');

let scanLocation = 'downloads/'

// The TVDB
const TheTVDB_URL = 'https://api.thetvdb.com';
const TVDB_KEY = process.env.TVDB_API_KEY;
const TVDB_API_VERSION = 'v2.1.1';
const TVDB_AV_HEADER = `application/vnd.thetvdb.${TVDB_API_VERSION}`;
const TVDB = require('node-tvdb');
const tvdb = new TVDB(TVDB_KEY);

exports.getSeries = function (seriesName) {
  let results = [];
  tvdb.getSeriesByName(seriesName)
    .then(response => {
      for (let i = 0; i < response.length; i++) {
        let series = {
          name: response[i].seriesName,
          id: response[i].id
        }
        results.push(series);
        console.log('name:', response[i].seriesName, 'ID:', response[i].id);
      };
      // console.log(results);
      return results;
    })
    .catch(error => { throw (error) });
};

exports.getSeriesNameAPI = function (seriesName) {
  let results = [];
  tvdb.getSeriesByName(seriesName)
    .then(response => {
      for (let i = 0; i < response.length; i++) {
        let series = {
          name: response[i].seriesName,
          id: response[i].id
        }
        results.push(series);
        // console.log('name:', response[i].seriesName, 'ID:', response[i].id);
      };
      console.log('TVDB Raw:', JSON.stringify(results));
      return JSON.stringify(results);
    })
    .catch(error => { throw (error) });
};

function getSeriesID(seriesID) {
  tvdb.getSeriesById(seriesID)
    .then(response => { console.log(response) })
    .catch(error => { throw (error) });
};

function getEpisodesByID(seriesID) {
  tvdb.getEpisodesSummaryBySeriesId(seriesID)
    .then(response => { console.log(response) })
    .catch(error => { throw (error) });
};

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
};

function getSeriesFanArtByID(name, seriesID, response) {
  tvdb.getSeriesImages(seriesID, 'fanart')
    .then(response => {
      // console.log(response);
      TVDBdownloadFanart(name, seriesID, response);
      return response
    })
    .catch(error => { throw (error) });
};

function getSeriesPostersByID(name, seriesID) {
  tvdb.getSeriesPosters(seriesID)
    .then(response => {
      TVDBdownloadPosters(name, seriesID, response);
      return response
    })
    .catch(error => { throw (error) });
};

let download = function (uri, filename, callback) {
  requestURL.head(uri, function (err, res, body) {
    requestURL(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
  });
};

function filenameFormat(file){
  // console.log('formatting:', file)
  let formatted = ""
  if(file === null){
    // console.log('null')
    formatted = 'NA'
  } else {
    formatted = file.replace(':', ',').replace('\'', '').replace('?', '').replace('/', '');
  }
  
  return formatted
}

function TVDBdownloadPosters(name, seriesID, data) {
  // https://www.thetvdb.com/banners/posters/275274-7.jpg
  let formattedFileName = filenameFormat(name);
  function n(n) {
    return n > 9 ? "" + n : "0" + n;
  };
  for (let i = 0; i < data.length; i++) {
    let downloadURL = 'https://www.thetvdb.com/banners/' + data[i].fileName;
    let fileExt = downloadURL.substr(downloadURL.lastIndexOf('.') + 1);
    // console.log('posters ext:', fileExt)
    let saveFileName = scanLocation + formattedFileName + '/img/' + formattedFileName + ' - poster' + n(i) + '[' + data[i].resolution + '].' + fileExt;
    download(downloadURL, saveFileName, function () {
    });
  }
};

function TVDBdownloadFanart(name, seriesID, data) {
  // https://www.thetvdb.com/banners/fanart/original/275274-9.jpg
  // console.log(data);
  let formattedFileName = filenameFormat(name);
  function n(n) {
    return n > 9 ? "" + n : "0" + n;
  };
  for (let i = 0; i < data.length; i++) {
    let downloadURL = 'https://www.thetvdb.com/banners/' + data[i].fileName;
    let fileExt = downloadURL.substr(downloadURL.lastIndexOf('.') + 1);
    // console.log('fanart ext:', fileExt)
    let saveFileName = scanLocation + formattedFileName + '/img/' + formattedFileName + ' - fanart' + n(i) + '[' + data[i].resolution + '].' + fileExt;

    download(downloadURL, saveFileName, function () { });
  }
};

function TVDBdownloadThumbnails(data) {
  // https://www.thetvdb.com/banners/episodes/275274/4711142.jpg
  let formattedFileName = filenameFormat(data.seriesName);
  function n(n) {
    return n > 9 ? "" + n : "0" + n;
  };
  for (let i = 0; i < data.episodes.length; i++) {
    let downloadURL = 'https://www.thetvdb.com/banners/' + data.episodes[i].filename;
    // console.log('Thumbnail URL:', downloadURL)
    let fileExt = downloadURL.substr(downloadURL.lastIndexOf('.') + 1);
    if(fileExt != 'jpg' || fileExt != 'png'){
      fileExt = 'jpg'
    }
    // console.log('thumbnail ext:', fileExt)
    let saveFileName = ''
    if (data.episodes[i].airedSeason < 1) {
      let episodeName = filenameFormat(data.episodes[i].episodeName);
      saveFileName = scanLocation + formattedFileName + '/Specials/' + formattedFileName + ' - S' + n(data.episodes[i].airedSeason) + 'E' + n(data.episodes[i].airedEpisodeNumber) + ' - ' + episodeName + '[' + data.episodes[i].thumbWidth + 'x' + data.episodes[i].thumbHeight + '].' + fileExt;
    } else {
      let episodeName = filenameFormat(data.episodes[i].episodeName);
      saveFileName = scanLocation + formattedFileName + '/Season' + n(data.episodes[i].airedSeason) + '/' + formattedFileName + ' - S' + n(data.episodes[i].airedSeason) + 'E' + n(data.episodes[i].airedEpisodeNumber) + ' - ' + episodeName + '[' + data.episodes[i].thumbWidth + 'x' + data.episodes[i].thumbHeight + '].' + fileExt;
    }
    if(data.episodes[i].episodeName != null && data.episodes[i].thumbWidth != null) {
      download(downloadURL, saveFileName, function () { });
    }
  }
};

function saveToJSON(data) {
  let formattedFileName = filenameFormat(data.seriesName);
  if (!fs.existsSync(scanLocation)) {
    fs.mkdirSync(scanLocation);
  };

  if (!fs.existsSync(`${scanLocation}${formattedFileName}`)) {
    fs.mkdirSync(`${scanLocation}${formattedFileName}`);
    fs.mkdirSync(`${scanLocation}${formattedFileName}/img`);
  };

  if (!fs.existsSync(`${scanLocation}${formattedFileName}/img`)) {
    fs.mkdirSync(`${scanLocation}${formattedFileName}/img`);
  };

  fs.writeFile(`${scanLocation}${formattedFileName}/tvdb.json`, JSON.stringify(data), 'utf8', function (err) {
    if (err) {
      return console.log(err);
    };
    console.log("The file was saved!");
    saveToTextFile(`${scanLocation}${formattedFileName}/`, data);
  });

  getSeriesPostersByID(data.seriesName, data.id);
  getSeriesFanArtByID(data.seriesName, data.id);

};

// Save Episodes to Human Readable Text File
let filePath = '';
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
  episodes = [];
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
    let episodeName = filenameFormat(data.episodes[i].episodeName);

    let fileName = filenameFormat(data.seriesName) + ' - S' + season + 'E' + episodeNumber + ' - ' + episodeName

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
};

let saveToTextFile = function (folder, data) {
  // console.log('Save to text file:', data)
  filePath = folder
  generateArray(data);
  generateFileNames(data);
  generateTextEpisodeList(data);
};

function createSeasonsFolders(data) {
  let seasons = findNumberOfSeasons(data)
  let formattedFileName = filenameFormat(data.seriesName);

  function n(n) {
    return n > 9 ? "" + n : "0" + n;
  };

  for (let i = 0; i < seasons; i++) {
    if (i < 1) {
      if (!fs.existsSync(`${scanLocation}${formattedFileName}/Specials`)) {
        fs.mkdirSync(`${scanLocation}${formattedFileName}/Specials`);
      };
      if (!fs.existsSync(`${scanLocation}${formattedFileName}/Extras`)) {
        fs.mkdirSync(`${scanLocation}${formattedFileName}/Extras`);
      };
    } else {
      if (!fs.existsSync(`${scanLocation}${formattedFileName}/Season${n(i)}`)) {
        fs.mkdirSync(`${scanLocation}${formattedFileName}/Season${n(i)}`);
      };
    }
  }
  TVDBdownloadThumbnails(data);
};