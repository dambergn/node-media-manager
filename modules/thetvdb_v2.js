'use strict'

require('dotenv').config();
const fs = require('fs');
const fetch = require('node-fetch');
const requestURL = require('request');
const bodyParser = require('body-parser');

const TVDBapi = require('./thetvdb_v2.js');

let scanLocation = 'downloads/'

// The TVDB
const TheTVDB_URL = 'https://api.thetvdb.com';
const TVDB_KEY = process.env.TVDB_API_KEY;
const TVDB_API_VERSION = 'v2.1.1';
const TVDB_AV_HEADER = `application/vnd.thetvdb.${TVDB_API_VERSION}`;

let TVDB_token = {}

function getToken() {
  fetch(`${TheTVDB_URL}/login`, {
    method: 'post',
    body: JSON.stringify({
      "apikey": process.env.TVDB_API_KEY,
      "userkey": process.env.TVDB_USR_KEY,
      "username": process.env.TVDB_USRNAME
    }),
    headers: { 'Content-Type': 'application/json' },
  })
    .then(res => res.json())
    .then(json => {
      console.log(json)
      TVDB_token = json
      // return json
    });
}
getToken()
// TVDB_token = getToken()

function refreshToken() {
  fetch(`${TheTVDB_URL}/refresh_token`, {
    method: 'get',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + TVDB_token.token,
    },
  })
    .then(res => res.json())
    .then(json => {
      // console.log("results:", json)
      TVDB_token = JSON.parse(json)
    });
}
// refreshToken()

exports.TVDB_search_name = function (search) {
  search = search.replace(/ /g, '%20')
  // console.log("searching for:", search)
  fetch(`${TheTVDB_URL}/search/series?name=${search}`, {
    method: 'get',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + TVDB_token.token,
    },
  })
    .then(res => res.json())
    .then(json => {
      for (let i = 0; i < json.data.length; i++) {
        console.log("Name:", json.data[i].seriesName, "| Released:", json.data[i].firstAired.split('-')[0], "| Status:", json.data[i].status, "| ID:", json.data[i].id)
        // console.log("temp:", json.data)
      }
      // return json
    });
}

let results = {}
exports.TVDB_save_by_id = async function (search) { //275274
  
  function TVDB_get_by_id(search) {
    fetch(`${TheTVDB_URL}/series/${search}`, {
      method: 'get',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + TVDB_token.token,
      },
    })
      .then(res => res.json())
      .then(json => {
        results.info = json.data
        TVDB_get_episodes_by_id(search)
      });
  }
  TVDB_get_by_id(search)

  function TVDB_get_episodes_by_id(search) {
    fetch(`${TheTVDB_URL}/series/${search}/episodes`, {
      method: 'get',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + TVDB_token.token,
      },
    })
      .then(res => res.json())
      .then(json => {
        results.episodes = json.data
        TVDB_get_images_by_id(search)
      });
  }

  function TVDB_get_images_by_id(search) {
    results.images = {}
    function get_summary(){
      fetch(`${TheTVDB_URL}/series/${search}/images`, {
        method: 'get',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + TVDB_token.token,
        },
      })
        .then(res => res.json())
        .then(json => {
          // console.log("IMAGES:", json)
          results.images = json.data
          get_posters()
        });
    }

    function get_posters(){
      fetch(`${TheTVDB_URL}/series/${search}/images/query?keyType=poster`, {
        method: 'get',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + TVDB_token.token,
        },
      })
        .then(res => res.json())
        .then(json => {
          // console.log("IMAGES:", json)
          results.images.poster = json.data
          get_fanart()
        });
    }

    function get_fanart(){
      fetch(`${TheTVDB_URL}/series/${search}/images/query?keyType=fanart`, {
        method: 'get',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + TVDB_token.token,
        },
      })
        .then(res => res.json())
        .then(json => {
          // console.log("IMAGES:", json)
          results.images.fanart = json.data
          get_season()
        });
    }

    function get_season(){
      fetch(`${TheTVDB_URL}/series/${search}/images/query?keyType=season`, {
        method: 'get',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + TVDB_token.token,
        },
      })
        .then(res => res.json())
        .then(json => {
          // console.log("IMAGES:", json)
          results.images.season = json.data
          get_series()
        });
    }

    function get_series(){
      fetch(`${TheTVDB_URL}/series/${search}/images/query?keyType=series`, {
        method: 'get',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + TVDB_token.token,
        },
      })
        .then(res => res.json())
        .then(json => {
          // console.log("IMAGES:", json)
          results.images.series = json.data
          TVDB_get_cast_by_id(search)
        });
    }
    get_summary()
  }


  function TVDB_get_cast_by_id(search) {
    fetch(`${TheTVDB_URL}/series/${search}/actors`, {
      method: 'get',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + TVDB_token.token,
      },
    })
      .then(res => res.json())
      .then(json => {
        // console.log("results:", json)
        results.cast = json.data
        // console.log("results:", results.info)
        saveToJSON(results)
        createSeasonsFolders(results);
      });
  }
}

let download = function (uri, filename, callback) {
  requestURL.head(uri, function (err, res, body) {
    requestURL(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
  });
};

function filenameFormat(file) {
  // console.log('formatting:', file)
  let formatted = ""
  if (file === null) {
    // console.log('null')
    formatted = 'NA'
  } else {
    formatted = file.replace(':', ',').replace('\'', '').replace('?', '').replace('/', '').replace('*', '');
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
    if (fileExt != 'jpg' || fileExt != 'png') {
      fileExt = 'jpg'
    }
    // console.log('thumbnail ext:', fileExt)
    let saveFileName = ''
    if (data.episodes[i].airedSeason < 1) {
      let episodeName = filenameFormat(data.episodes[i].episodeName);
      saveFileName = scanLocation + formattedFileName + '/Specials/' + formattedFileName + ' - S' + n(data.episodes[i].airedSeason) + 'E' + n(data.episodes[i].airedEpisodeNumber) + ' - ' + episodeName + '[' + data.episodes[i].thumbWidth + 'x' + data.episodes[i].thumbHeight + '].' + fileExt;
    } else {
      let episodeName = filenameFormat(data.episodes[i].episodeName);
      if (data.episodes[i].airedSeason > 1000) {
        saveFileName = scanLocation + formattedFileName + '/Season' + data.episodes[i].airedSeason + '/' + formattedFileName + ' - S' + data.episodes[i].airedSeason + 'E' + n(data.episodes[i].airedEpisodeNumber) + ' - ' + episodeName + '[' + data.episodes[i].thumbWidth + 'x' + data.episodes[i].thumbHeight + '].' + fileExt;
      } else {
        saveFileName = scanLocation + formattedFileName + '/Season' + n(data.episodes[i].airedSeason) + '/' + formattedFileName + ' - S' + n(data.episodes[i].airedSeason) + 'E' + n(data.episodes[i].airedEpisodeNumber) + ' - ' + episodeName + '[' + data.episodes[i].thumbWidth + 'x' + data.episodes[i].thumbHeight + '].' + fileExt;
      }
    }
    if (data.episodes[i].episodeName != null && data.episodes[i].thumbWidth != null) {
      download(downloadURL, saveFileName, function () { });
    }
  }
};

function saveToJSON(data) {
  // console.log("save to json:", data.info.seriesName)
  let formattedFileName = filenameFormat(data.info.seriesName);
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

  // getSeriesPostersByID(data.info.seriesName, data.info.id);
  // getSeriesFanArtByID(data.info.seriesName, data.info.id);

};

// Save Episodes to Human Readable Text File
let filePath = '';
let episodes = [];

//How many seasons in series
function findNumberOfSeasons(data) {
  // console.log("find num Seasons:", data)
  let count = 0;
  let found = [];
  for (let i = 0; i < data.length; i++) {

    if (typeof found[data[i].airedSeason] === 'undefined') {
      // does not exist
      count++;
      found.push(data[i].airedSeason);
    } else {
      // does exist
    }
  };
  return count;
};

//Generate 3D array for seasons
function generateArray(data) {
  episodes = [];
  for (let i = 0; i < findNumberOfSeasons(data.episodes); i++) {
    episodes.push(new Array());
  }
};

//Populates 3D array of seasons and episode names
function generateFileNames(data) {
  // console.log("generateFileNames:", data)
  function n(n) {
    return n > 9 ? "" + n : "0" + n;
  };
  for (let i = 0; i < data.episodes.length; i++) {
    let season = '';
    let episodeNumber = n(data.episodes[i].airedEpisodeNumber);
    let episodeName = filenameFormat(data.episodes[i].episodeName);

    let fileName = filenameFormat(data.info.seriesName) + ' - S' + season + 'E' + episodeNumber + ' - ' + episodeName

    if (data.episodes[i].airedSeason > 1000) {
      season = data.episodes[i].airedSeason
      console.log("fileName:", episodes);
    } else {
      season = n(data.episodes[i].airedSeason);
      episodes[data.episodes[i].airedSeason].push(fileName);
    }
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

  text.write(data.info.seriesName + '\n') // append string to your file
  text.write('' + '\n') // Blank Space
  text.write(data.info.overview + '\n') // again
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
  let seasons = findNumberOfSeasons(data.episodes)
  let formattedFileName = filenameFormat(data.info.seriesName);

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
      if (data.episodes[i].airedSeason > 100) {
        if (!fs.existsSync(`${scanLocation}${formattedFileName}/Season${data.episodes[i].airedSeason}`)) {
          fs.mkdirSync(`${scanLocation}${formattedFileName}/Season${data.episodes[i].airedSeason}`);
        }
      } else {
        if (!fs.existsSync(`${scanLocation}${formattedFileName}/Season${n(i)}`)) {
          fs.mkdirSync(`${scanLocation}${formattedFileName}/Season${n(i)}`);
        };
      }
    }
  }
  TVDBdownloadThumbnails(data);
};