'use strict';
// 'v1.0'

require('dotenv').config();
const fs = require('fs');
const request = require('node-fetch');
const requestURL = require('request');
const readline = require('readline');
const bodyParser = require('body-parser');

let scanLocation = 'downloads/'
// let ended = process.env.ENDED || scanLocation
let ended = scanLocation
// let continuing = process.env.CONTINUING || scanLocations
let continuing = scanLocation

// const rl = readline.createInterface({
//   input: process.stdin,
//   output: process.stdout
// });

// The TVDB
const TheTVDB_URL = 'https://api.thetvdb.com';
const TVDB_KEY = process.env.TVDB_API_KEY;
const TVDB_API_VERSION = 'v2.1.1';
const TVDB_AV_HEADER = `application/vnd.thetvdb.${TVDB_API_VERSION}`;
const TVDB = require('node-tvdb');
const tvdb = new TVDB(TVDB_KEY);

let seriesResults = '';

// Search for series name
exports.getSeries = function (seriesName) {
  let results = [];
  tvdb.getSeriesByName(seriesName)
    .then(response => {
      for (let i = 0; i < response.length; i++) {
        let series = {
          name: response[i].seriesName,
          id: response[i].id
        }
        let year = '';
        if (response[i].firstAired = 'null') {
          year = 'none'
        } else {
          response[i].firstAired.split('-')[0]
        }
        results.push(series);
        console.log('Name:', response[i].seriesName, '| Released:', year, "| Status:", response[i].status, '| ID:', response[i].id);
      };
      return results;
    })
    .catch(error => { throw (error) });
};

exports.getSeriesAllByID = function (seriesID) {
  let results = {
    info: "",
    episodes: {
      summary: "",
      list: "",
    },
    images: {
      posters: "",
      fanart: "",
      banners: "",
      series: "",
      seasonPosters: '',

    },
    cast: "",
  };
  let done = 0;
  tvdb.getSeriesById(seriesID)
    .then(response => {
      results.info = response;
      console.log("Status:", response.status)
      if (response.status === "Continuing") {
        scanLocation = continuing
      }
      if (response.status === "Ended") {
        scanLocation = ended
      }
      console.log("info done")
      done++;
    }).catch(error => {
      console.log("ERROR, GetSeries:", error);
    });

  tvdb.getEpisodesSummaryBySeriesId(seriesID)
    .then(response => {
      results.episodes.summary = response;
      results.episodes.summary.airedSeasons.sort(function (a, b) { return a - b });
      console.log("Episode Summary done")
      done++;
      nextStep()
      // console.log("summary:", response) 
    }).catch(error => { throw (error) });

  function nextStep() {
    tvdb.getEpisodesBySeriesId(seriesID)
      .then(response => {
        results.episodes.list = response;
        // console.log("Get EPISODES:", results.episodes.summary.airedSeasons)
        // console.log("lenght", results.episodes.summary.airedSeasons.length)
        let mod = 0;
        if (results.episodes.summary.airedSeasons[0] !== "0") {
          mod = mod + 1
        }
        /////////// Has issues with series that have no specials        
        for (let i = 0; i <= results.episodes.summary.airedSeasons.length; i++) {
          // console.log("TEST:",results.episodes.summary.airedSeasons)
          tvdb.getSeasonPosters(seriesID, results.episodes.summary.airedSeasons[i])
            .then(response2 => {
              // console.log("Season Posters response:", response2)
              // console.log(`seson ${results.episodes.summary[i]} posters:`, response)
              results.images.seasonPosters = response2
              if (i == results.episodes.summary.airedSeasons.length - 1) {
                console.log("Season Posters done")
                done++;
              }
              // }).catch(error => { throw (error) });
            }).catch(error => {
              console.log("seasonPosters:", error)
              if (error.response.status === 404) {
                console.log("No posters to download")
                results.images.seasonPosters = null;
                done++;
                // i = results.episodes.summary.airedSeasons.length;
              }
            });
        }
      }).catch(error => { throw (error) });
  }

  tvdb.getSeriesBanner(seriesID)
    .then(response => {
      results.images.banners = response;
      console.log("Banners done")
      done++;
    }).catch(error => { throw (error) });

  tvdb.getSeriesImages(seriesID, 'fanart')
    .then(response => {
      results.images.fanart = response
      console.log("Fanart done")
      done++;
    }).catch(error => { throw (error) });

  tvdb.getSeriesPosters(seriesID)
    .then(response => {
      results.images.posters = response
      console.log("Posters done")
      done++;
    }).catch(error => { throw (error) });

  tvdb.getSeriesImages(seriesID, 'series')
    .then(response => {
      results.images.series = response
      console.log("Series images done")
      done++;
    }).catch(error => { throw (error) });

  tvdb.getActors(seriesID)
    .then(response => {
      // console.log("cast:", response)
      results.cast = response
      console.log("Cast done")
      done++;
    }).catch(error => {
      console.log("Cast:", error)
      if (error.response.status === 404) {
        console.log("No posters to download")
        results.cast = null;
        done++;
      }
    });

  let timesChecked = 0
  let timeout = 60
  let checkGoal = 8
  let checking = setInterval(function () {
    if (done >= checkGoal) {
      // console.log("complete:", results);
      seriesResults = results;
      saveToJSON(results);
      saveToTextFile(results);
      createSeasonsFolders(results)
      TVDBdownloadImages(results)
      TVDBdownloadSeasonImages(results)
      TVDBdownloadThumbnails(results);
      TVDBdownloadCast(results);
      console.log("complete")
      clearInterval(checking);
    } else if (timesChecked >= timeout) {
      console.log("API timed out")
      clearInterval(checking);
    } else {
      timesChecked = timesChecked + 1
      // readline.clearLine(process.stdout, 0);  // clear current text
      // readline.cursorTo(process.stdout, 0, 0)
      // readline.clearScreenDown(process.stdout)
      console.log(`${done} of ${checkGoal} Complete | Timeout in ${timeout - timesChecked}`)

    }
  }, 1000);
};

// gravity falls: 259972
// rick and morty: 275274
// mythbusters: 73388


// Global information
let filePath = '';
let episodes = [];
let numOfSeasons = '';

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

function zero(n) {
  return n > 9 ? "" + n : "0" + n;
};

function generateFileName(data, dataIndex) {
  let isYear = false;
  function seasonOrYear() {
    if (Number(data.episodes.list[dataIndex].airedSeason) > 1000) {
      isYear = true;
      return data.episodes.list[dataIndex].airedSeason
    } else {
      isYear = false;
      // console.log('found season special')
      return zero(data.episodes.list[dataIndex].airedSeason)
    }
  }
  let season = seasonOrYear();
  let episodeNumber = zero(data.episodes.list[dataIndex].airedEpisodeNumber);
  let episodeName = filenameFormat(data.episodes.list[dataIndex].episodeName);

  let fileName = filenameFormat(data.info.seriesName) + ' - S' + season + 'E' + episodeNumber + ' - ' + episodeName
  // console.log("Years:", yearCount, "Seasons:", seasonCount, "Season:", episodes)
  if (isYear = true) {
    let position = data.episodes.summary.airedSeasons.indexOf(data.episodes.list[dataIndex].airedSeason.toString())
    // console.log('season:', data.episodes.list[dataIndex].airedSeason, 'year pos:', position)
    episodes[position].push(fileName);
  } else {
    episodes[data.episodes.list[dataIndex].airedSeason].push(fileName);
  }
}

function TVDBdownloadImages(data) {
  // https://www.thetvdb.com/banners/posters/275274-7.jpg
  // https://www.thetvdb.com/banners/fanart/original/275274-9.jpg
  // data.images.fanart[]
  // data.images.series[] //Banners
  let formattedFileName = filenameFormat(data.info.seriesName);
  // download fanart
  for (let i = 0; i < data.images.fanart.length; i++) {
    let downloadURL = 'https://www.thetvdb.com/banners/' + data.images.fanart[i].fileName;
    let fileExt = downloadURL.substr(downloadURL.lastIndexOf('.') + 1);
    // console.log('posters ext:', fileExt)
    let saveFileName = filePath + 'img/' + formattedFileName + ' - fanart' + zero(i) + '[' + data.images.fanart[i].resolution + '].' + fileExt;
    download(downloadURL, saveFileName, function () {
    });
  }

  // download posters
  for (let i = 0; i < data.images.posters.length; i++) {
    let downloadURL = 'https://www.thetvdb.com/banners/' + data.images.posters[i].fileName;
    let fileExt = downloadURL.substr(downloadURL.lastIndexOf('.') + 1);
    // console.log('posters ext:', fileExt)
    let saveFileName = filePath + 'img/' + formattedFileName + ' - poster' + zero(i) + '[' + data.images.posters[i].resolution + '].' + fileExt;
    download(downloadURL, saveFileName, function () {
    });
  }

  // download banners
  for (let i = 0; i < data.images.series.length; i++) {
    let downloadURL = 'https://www.thetvdb.com/banners/' + data.images.series[i].fileName;
    let fileExt = downloadURL.substr(downloadURL.lastIndexOf('.') + 1);
    // console.log('posters ext:', fileExt)
    let saveFileName = filePath + 'img/' + formattedFileName + ' - banner' + zero(i) + '[' + data.images.series[i].resolution + '].' + fileExt;
    download(downloadURL, saveFileName, function () {
    });
  }
};

function TVDBdownloadSeasonImages(data) {
  // https://www.thetvdb.com/banners/fanart/original/275274-9.jpg
  // data.images.seasonPosters[0][]
  if (data.images.seasonPosters != null) {
    let seasonImages = data.images.seasonPosters;
    let seasonInfo = data.episodes.summary.airedSeasons;
    let formattedFileName = filenameFormat(data.info.seriesName);
    for (let i = 0; i < seasonImages.length; i++) {
      function seasonOrYear() {
        if (Number(seasonImages[i].subKey) > 1000) {
          return 'Season' + seasonImages[i].subKey
        } else {
          if (seasonImages[i].subKey === "0") {
            return "Specials"
          }
          return 'Season' + zero(seasonImages[i].subKey)
        }
      }
      let season = seasonOrYear();
      let downloadURL = 'https://www.thetvdb.com/banners/' + seasonImages[i].fileName;
      let resolution = seasonImages[i].resolution
      let fileExt = downloadURL.substr(downloadURL.lastIndexOf('.') + 1);
      let saveFileName = filePath + season + '/' + formattedFileName + ' - ' + season + ' - poster' + zero(i) + '[' + resolution + '].' + fileExt
      download(downloadURL, saveFileName, function () { });
    }
  } else {
    console.log("No Season Posters to Download")
  }
};

function TVDBdownloadThumbnails(data) {
  // https://www.thetvdb.com/banners/episodes/275274/4711142.jpg
  let formattedFileName = filenameFormat(data.info.seriesName);
  for (let i = 0; i < data.episodes.list.length; i++) {
    let downloadURL = 'https://www.thetvdb.com/banners/' + data.episodes.list[i].filename;
    // console.log('Thumbnail URL:', downloadURL)
    let fileExt = downloadURL.substr(downloadURL.lastIndexOf('.') + 1);
    if (fileExt != 'jpg' || fileExt != 'png') {
      fileExt = 'jpg'
    }
    // console.log('thumbnail ext:', fileExt)
    let isYear = false;
    function seasonOrYear() {
      if (Number(data.episodes.list[i].airedSeason) > 1000) {
        isYear = true;
        return data.episodes.list[i].airedSeason
      } else {
        isYear = false;
        // console.log('found season special')
        return zero(data.episodes.list[i].airedSeason)
      }
    }
    let season = seasonOrYear();
    let episodeNumber = zero(data.episodes.list[i].airedEpisodeNumber);
    let episodeName = filenameFormat(data.episodes.list[i].episodeName);
    let imageWidth = data.episodes.list[i].thumbWidth
    let imageHeight = data.episodes.list[i].thumbHeight

    let saveFileName = ``
    if (data.episodes.list[i].airedSeason < 1) {
      // let episodeName = filenameFormat(data.episodes.list[i].episodeName);
      saveFileName = filePath + 'Specials/' + formattedFileName + ' - S' + season + 'E' + episodeNumber + ' - ' + episodeName + '[' + imageWidth + 'x' + imageHeight + '].' + fileExt;
    } else {
      // let episodeName = filenameFormat(data.episodes[i].episodeName);
      if (isYear = true) {
        saveFileName = filePath + 'Season' + season + '/' + formattedFileName + ' - S' + season + 'E' + episodeNumber + ' - ' + episodeName + '[' + imageWidth + 'x' + imageHeight + '].' + fileExt;
      } else {
        saveFileName = filePath + 'Season' + season + '/' + formattedFileName + ' - S' + season + 'E' + episodeNumber + ' - ' + episodeName + '[' + imageWidth + 'x' + imageHeight + '].' + fileExt;
      }
    }
    if (data.episodes.list[i].episodeName != null && imageWidth != null) {
      download(downloadURL, saveFileName, function () { });
    }
  }
};

function TVDBdownloadCast(data) {
  // https://www.thetvdb.com/banners/episodes/275274/4711142.jpg
  // let formattedFileName = filenameFormat(data.info.seriesName);
  let castFolder = `${filePath}Cast`;

  let i = 0;
  let goal = 0;
  if (data.cast === null) {
    goal = 0
  } else {
    goal = data.cast.length
    let checking = setInterval(function () {
      let name = data.cast[i].name.trim();
      if (!fs.existsSync(`${castFolder}/${name}`)) {
        fs.mkdirSync(`${castFolder}/${name}`);
      };
      let downloadURL = 'https://www.thetvdb.com/banners/' + data.cast[i].image;
      let fileExt = downloadURL.substr(downloadURL.lastIndexOf('.') + 1);
      if (fileExt != 'jpg' || fileExt != 'png') {
        fileExt = 'jpg'
      }
      let saveFileName = `${castFolder}/${name}/${name} - as - ${data.cast[i].role.trim()}${zero(i)}.${fileExt}`;
      download(downloadURL, saveFileName, function () {
        if (i < goal - 1) {
          i++
          // console.log(`${i} of ${goal} complete.`);
        } else {
          console.log('Cast download complete');
          clearInterval(checking);
        }
      });
    }, 200);
  }



  // for (let i = 0; i < data.cast.length; i++){

  // }
}

function saveToJSON(data) {
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
    console.log("JSON file saved!");
  });
};


// Save Episodes to Human Readable Text File
function generateArray(data) {// Generate 3D array for seasons
  numOfSeasons = data.episodes.summary.airedSeasons.length
  episodes = [];
  for (let i = 0; i < numOfSeasons; i++) {
    episodes.push(new Array());
  }
  console.log("generateArray Complete")
};

function generateFileNames(data) {// Populates 3D array of seasons and episode names
  for (let i = 0; i < data.episodes.list.length; i++) {
    generateFileName(data, i)
  };
  console.log("Generate filenames complete")
};

function generateTextEpisodeList(data) {// Saves episode list to a text file
  // Checks to see if file already exists and if it does, deltes it.
  filePath = scanLocation + filenameFormat(data.info.seriesName) + '/'
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

  for (let i = 0; i < episodes.length; i++) { // Seasons
    if (i === 0) {
      text.write('Specials' + '\n')
    } else {
      text.write('Season ' + zero(i) + '\n')
    }
    for (let j = 0; j < episodes[i].length; j++) { // Episodes
      text.write(episodes[i][j] + '\n')
    }
    text.write('' + '\n') // Blank Space
  }
  text.end() // close string
  console.log("Text file saved")
};

let saveToTextFile = function (data) {
  generateArray(data);
  generateFileNames(data);
  generateTextEpisodeList(data);
};

function createSeasonsFolders(data) {
  if (!fs.existsSync(`${filePath}Specials`)) {
    fs.mkdirSync(`${filePath}Specials`);
  };
  if (!fs.existsSync(`${filePath}Extras`)) {
    fs.mkdirSync(`${filePath}Extras`);
  };
  if (!fs.existsSync(`${filePath}Cast`)) {
    fs.mkdirSync(`${filePath}Cast`);
  };
  for (let i = 0; i < numOfSeasons; i++) {
    if (data.episodes.summary.airedSeasons[i] !== "0") {
      if (data.episodes.summary.airedSeasons[i] > 1000) {
        if (!fs.existsSync(`${filePath}Season${data.episodes.summary.airedSeasons[i]}`)) {
          fs.mkdirSync(`${filePath}Season${data.episodes.summary.airedSeasons[i]}`);
        }
      } else {
        if (!fs.existsSync(`${filePath}Season${zero(data.episodes.summary.airedSeasons[i])}`)) {

          fs.mkdirSync(`${filePath}Season${zero(data.episodes.summary.airedSeasons[i])}`);
        };
      }
    }
  }
};