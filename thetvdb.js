#!/usr/bin/node

// const { timeout } = require('async');
const https = require('https');
const fs = require('fs')
const requestURL = require('request');
const { search } = require('superagent');
require('dotenv').config();
const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout,
});

// const postData = JSON.stringify(`{

//     "expand": [
//       "names"
//     ],
//     "jql": "project = \\"Central Tech\\" AND summary ~ \\"Splunk Dashboard\\" AND created > startOfDay(-0d)",
//     "maxResults": 6,
//     "fieldsByKeys": false,
//     "fields": [
//       "summary",
//       "status",
//       "assignee"
//     ],
//     "startAt": 0

// }`);

// The TVDB api
const API_KEY = process.env.TVDB_API_KEY
const API_PIN = process.env.TVDB_PIN
let auth = JSON.stringify({
  "apikey": `${API_KEY}`,
  "pin": `${API_PIN}`
})
// let auth = JSON.stringify({
//   "apikey": "cc086579-9744-4b42-ae41-c3e90dc5f919",
//   "pin": "4ZPQB7CC"
// })

let thetvdb_token = ""

function getToken() {
  const options = {
    host: 'api4.thetvdb.com',
    port: 443,
    path: '/v4/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      // 'Content-Length': Buffer.byteLength(auth)
    }
  };

  const req = https.request(options, (res) => {
    // console.log(`STATUS: ${res.statusCode}`);
    // console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
    res.setEncoding('utf8');
    res.on('data', (chunk) => {
      chunk2 = JSON.parse(chunk);
      // console.log("BODY:", chunk2.data.token);
      thetvdb_token = chunk2.data.token
    });
    res.on('end', () => {
      // console.log('No more data in response.');
    });
  });

  req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
  });

  // Write data to request body
  req.write(auth);
  req.end();
}

function formatString(str) {
  return str.replace(/ /g, "%20")
}

const storeData = (data, path) => {
  try {
    fs.writeFileSync(path, JSON.stringify(data))
  } catch (err) {
    console.error(err)
  }
}

function searchShow(SEARCH) {
  const options = {
    host: 'api4.thetvdb.com',
    port: 443,
    path: `/v4/search?query=${formatString(SEARCH)}&language=eng`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${thetvdb_token}`
      // 'Content-Length': Buffer.byteLength(auth)
    }
  };
  // console.log(options.path)

  let results = "";
  const req = https.request(options, (res) => {
    // console.log(`STATUS: ${res.statusCode}`);
    // console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
    res.setEncoding('utf8');
    res.on('data', (chunk) => {
      // console.log("BODY:", chunk);
      results = results + chunk;
    });
    res.on('end', () => {
      // console.log('No more data in response.');
      // console.log("BODY:", chunk2);
      try {
        let parsed = JSON.parse(results);
        console.log("Results found:", parsed.data.length)
        let showResults = parsed.data.length;
        if (parsed.data.length > 10) {
          showResults = 10;
        }
        for (let i = 0; i < showResults; i++) {
          let name = parsed.data[i].name
          let year = parsed.data[i].year
          let status = parsed.data[i].status
          let id = parsed.data[i].tvdb_id
          console.log(`Name: ${name} | Year: ${year} | Status: ${status} | ID: ${id}`);
        }
      } catch (err) {
        console.log('error', err);
      }
    });
  });

  req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
  });

  // Write data to request body
  req.write(auth);
  req.end();
}

function saveShow(tvdbid) {
  let showInformation = {}
  let getShowDetailsFinished = false;
  let getEpisodesFinished = false;
  function getShowDetails() {
    const options = {
      host: 'api4.thetvdb.com',
      port: 443,
      path: `/v4/series/${tvdbid}/extended`,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${thetvdb_token}`
        // 'Content-Length': Buffer.byteLength(auth)
      }
    };
    // console.log(options.path)

    let results = "";
    const req = https.request(options, (res) => {
      // console.log(`STATUS: ${res.statusCode}`);
      // console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
      res.setEncoding('utf8');
      res.on('data', (chunk) => {
        // console.log("BODY:", chunk);
        results = results + chunk;
      });
      res.on('end', () => {
        // console.log('No more data in response.');
        // console.log("BODY:", chunk2);
        try {
          let parsed = JSON.parse(results);
          // console.log(parsed.data.seasons)
          // parsed.data.push(showInformation);
          showInformation = parsed.data;
          getShowDetailsFinished = true;
        } catch (err) {
          console.log('error', err);
        }
      });
    });

    req.on('error', (e) => {
      console.error(`problem with request: ${e.message}`);
    });

    // Write data to request body
    req.write(auth);
    req.end();
  }

  let seasons = []
  function getSeason(season_id) {
    const options = {
      host: 'api4.thetvdb.com',
      port: 443,
      path: `/v4/seasons/${season_id}/extended`,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${thetvdb_token}`
        // 'Content-Length': Buffer.byteLength(auth)
      }
    };
    // console.log(options.path)

    let results = "";
    const req = https.request(options, (res) => {
      // console.log(`STATUS: ${res.statusCode}`);
      // console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
      res.setEncoding('utf8');
      res.on('data', (chunk) => {
        // console.log("BODY:", chunk);
        results = results + chunk;
      });
      res.on('end', () => {
        // console.log('No more data in response.');
        // console.log("BODY:", chunk2);
        try {
          let parsed = JSON.parse(results);
          // console.log("Return:", parsed.data.type)
          seasons.push(parsed.data)
        } catch (err) {
          console.log('error', err);
        }
      });
    });

    req.on('error', (e) => {
      console.error(`problem with request: ${e.message}`);
    });

    // Write data to request body
    req.write(auth);
    req.end();
  }

  let download = function (uri, filename, callback) {
    if(uri === null || uri === undefined ){
      console.log("URL does not exist:", uri)
    } else {
      requestURL.head(uri, function (err, res, body) {
        requestURL(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
        if (err) {
          console.log("Image Download Error:", err)
        }
      });
    }
  };

  function fileNameFormat(fileName) {
    let formatted = ""
    if (fileName === null) {
      // console.log('null')
      formatted = 'NA'
    } else {
      formatted = fileName.replace(/:/g, ',').replace(/'/g, '').replace(/\?/g, '').replace(/\//g, '').replace(/\*/g, '');
    }
    return formatted
  }

  function zero(n) {
    return n > 9 ? "" + n : "0" + n;
  };

  function createFileDataStructure(filePath) {
    let folderName = fileNameFormat(showInformation.name)
    if (!fs.existsSync(`${filePath}${folderName}`)) {
      fs.mkdirSync(`${filePath}${folderName}`);
    };


    if (!fs.existsSync(`${filePath}${folderName}/Extras`)) {
      fs.mkdirSync(`${filePath}${folderName}/Extras`);
    };
    if (!fs.existsSync(`${filePath}${folderName}/Cast`)) {
      fs.mkdirSync(`${filePath}${folderName}/Cast`);
    };
    if (!fs.existsSync(`${filePath}${folderName}/img`)) {
      fs.mkdirSync(`${filePath}${folderName}/img`);
    };

    // console.log("testing:", showInformation.seasons.length)
    for (let i = 0; i < showInformation.seasons.length; i++) {
      if (showInformation.seasons[i].type.type === "official") {
        if (showInformation.seasons[i].number === 0) {
          if (!fs.existsSync(`${filePath}${folderName}/Specials`)) {
            fs.mkdirSync(`${filePath}${folderName}/Specials`);
          };
        } else if (showInformation.seasons[i].number > 1000) {
          if (!fs.existsSync(`${filePath}${folderName}/${showInformation.seasons[i].number}`)) {
            fs.mkdirSync(`${filePath}${folderName}/${showInformation.seasons[i].number}`);
          };
        } else {
          newFolder = zero(showInformation.seasons[i].number)
          if (!fs.existsSync(`${filePath}${folderName}/Season${newFolder}`)) {
            fs.mkdirSync(`${filePath}${folderName}/Season${newFolder}`);
          };
        }
      }
    }

    storeData(showInformation, `${filePath}${folderName}/thetvdb.json`);
    console.log("JSON file saved")
  }

  function downloadImages(filePath) {
    let seriesName = fileNameFormat(showInformation.name)
    /*
    Image Types
    Type 1 = Banners
    Type 2 = Posters
    Type 3 = Backgrounds
    Type 4 = 
    Type 5 = Icon
    Type 6 = 
    Type 7 = Season Poster
    Type 22 = Clearart
    Type 23 = Clearlogo
    */
    let banner = 0;
    let poster = 0;
    let background = 0;
    let icon = 0;
    let season_poster = 0;
    let clearart = 0;
    let clear_logo = 0;
    let unknown = 0;
    function getImageType(type) {
      if (type === 1) { banner++; return { "type": "banner", "count": banner } }
      else if (type === 2) { poster++; return { "type": "poster", "count": poster } }
      else if (type === 3) { background++; return { "type": "background", "count": background } }
      else if (type === 5) { icon++; return { "type": "icon", "count": icon } }
      else if (type === 7) { season_poster++; return { "type": "season_poster", "count": season_poster } }
      else if (type === 22) { clearart++; return { "type": "clearart", "count": clearart } }
      else if (type === 23) { clear_logo++; return { "type": "clear_logo", "count": clear_logo } }
      else { unknown++; return { "type": "unknown", "count": unknown } }
    }
    function mainImage() {
      let savePath = `${filePath}${seriesName}/`
      let fileExtension = showInformation.image.substr(showInformation.image.lastIndexOf('.') + 1)
      let fileName = `${seriesName}.${fileExtension}`
      download(showInformation.image, savePath + fileName, function () { });
    }
    function artworks() {
      for (let i = 0; i < showInformation.artworks.length; i++) {
        let imageType = getImageType(showInformation.artworks[i].type);
        let savePath = `${filePath}/${seriesName}/img/`
        let fileExtension = showInformation.artworks[i].image.substr(showInformation.artworks[i].image.lastIndexOf('.') + 1)
        let fileName = `${seriesName} - ${imageType.type}${zero(imageType.count)}[${showInformation.artworks[i].id}].${fileExtension}`
        download(showInformation.artworks[i].image, savePath + fileName, function () { });
      }
    }
    function characters() {
      for (let i = 0; i < showInformation.characters.length; i++) {
        if (showInformation.characters[i].image !== null && showInformation.characters[i].peopleType === "Actor") {
          let savePath = `${filePath}${seriesName}/Cast/`
          let fileExtension = showInformation.characters[i].image.substr(showInformation.characters[i].image.lastIndexOf('.') + 1)
          let character = fileNameFormat(showInformation.characters[i].name)
          let fileName = `${seriesName} - ${character} - ${showInformation.characters[i].personName}[${showInformation.characters[i].id}].${fileExtension}`
          download(showInformation.characters[i].image, savePath + fileName, function () { });
          if (showInformation.characters[i].personImgURL !== null || undefined) {
            // console.log("downloading actor:", showInformation.characters[i].personName,"image:", showInformation.characters[i].personImgURL)
            download(showInformation.characters[i].personImgURL, `${savePath}${showInformation.characters[i].personName}.${fileExtension}`, function () { });
          }
        }
      }

    }
    function seasons() {
      let seriesName = fileNameFormat(showInformation.name)
      for (let i = 0; i < showInformation.seasons.length; i++) { // seasons
        if(showInformation.seasons[i].type.type === "official"){
          if(showInformation.seasons[i].number === 0){
            let savePath = `${filePath}${seriesName}/Specials/`
            let fileExtension = showInformation.seasons[i].image.substr(showInformation.seasons[i].image.lastIndexOf('.') + 1)
            let fileName = `poster.${fileExtension}`
            download(showInformation.seasons[i].image, savePath + fileName, function () { });
          } else {
            let savePath = `${filePath}${seriesName}/Season${zero(showInformation.seasons[i].number)}/`
            let fileExtension = showInformation.seasons[i].image.substr(showInformation.seasons[i].image.lastIndexOf('.') + 1)
            let fileName = `poster.${fileExtension}`
            download(showInformation.seasons[i].image, savePath + fileName, function () { });
          }
          for(let j = 0; j < showInformation.seasons[i].episodes.length; j++){ // episodes
            if(showInformation.seasons[i].number === 0){
              let savePath = `${filePath}${seriesName}/Specials/`
              let fileExtension = showInformation.seasons[i].image.substr(showInformation.seasons[i].image.lastIndexOf('.') + 1)
              let episode = zero(showInformation.seasons[i].episodes[j].number)
              let fileName = `${seriesName} - S00E${episode}.${fileExtension}`
              download(showInformation.seasons[i].episodes[j].image, savePath + fileName, function () { });
            } else {
              let savePath = `${filePath}${seriesName}/Season${zero(showInformation.seasons[i].number)}/`
              let fileExtension = showInformation.seasons[i].image.substr(showInformation.seasons[i].image.lastIndexOf('.') + 1)
              let season = zero(showInformation.seasons[i].number)
              let episode = zero(showInformation.seasons[i].episodes[j].number)
              let fileName = `${seriesName} - S${season}E${episode}.${fileExtension}`
              download(showInformation.seasons[i].episodes[j].image, savePath + fileName, function () { });
            }
          }
        }
      }
    }

    mainImage()
    artworks()
    characters()
    seasons()
  }

  function processSeasons() {
    // showInformation.episodes = 0
    let numberOfSeasons = 0

    for (let i = 0; i < showInformation.seasons.length; i++) {
      if (showInformation.seasons[i].type.type === "official") {
        numberOfSeasons++
        for (let k = 0; k < showInformation.seasons[i].episodes.length; k++) {
          showInformation.episodes++
        }
      }
    }
    showInformation.numberOfSeasons = numberOfSeasons;
  }

  function createEpisodeListTxt(filePath){
    let seriesName = fileNameFormat(showInformation.name)
    try {
      if (fs.existsSync(`${filePath}/${seriesName}/episode-list.txt`)) {
        //file exists
        try {
          fs.unlinkSync(`${filePath}/${seriesName}/episode-list.txt`)
          //file removed
        } catch (err) {
          console.error(err)
        }
      }
    } catch (err) {
      console.error(err)
    }
    var text = fs.createWriteStream(`${filePath}/${seriesName}/episode-list.txt`, {
      flags: 'a' // 'a' means appending (old data will be preserved)
    })

    text.write(seriesName + '\n') // append string to your file
    text.write('' + '\n') // Blank Space
    text.write(showInformation.overview + '\n') // Show Synopsys
    text.write('' + '\n') // Blank Space
    for (let i = 0; i < showInformation.seasons.length; i++) {
      if (showInformation.seasons[i].type.type === "official") {
        let season = zero(showInformation.seasons[i].number)
        text.write(`Season${season}` + '\n') // 
        for (let k = 0; k < showInformation.seasons[i].episodes.length; k++) {
          let episode = zero(showInformation.seasons[i].episodes[k].number)
          let name = showInformation.seasons[i].episodes[k].name
          text.write(`${seriesName} - S${season}E${episode} - ${name}` + '\n')
        }
      }
      text.write('' + '\n') // Blank Space
    }
  }

  function sortSeries(){

  }

  function updateSeasons() {
    let timeout = 0;
    for (let i = 0; i < showInformation.seasons.length; i++) {
      getSeason(showInformation.seasons[i].id)
    }
    function runGetEpisodeDetails() {
      if (showInformation.seasons.length !== seasons.length) {
        // console.log("tmp:", showInformation.seasons.length, "to", seasons.length)
        setTimeout(runGetEpisodeDetails, 100); /* this checks the flag every 100 milliseconds*/
        if (timeout > 50) {
          console.log("Get Episodes has Timed out!")
        }
        timeout++;
      } else {
        // console.log("Seasons:", seasons);
        for (let j = 0; j < seasons.length; j++) {
          for (let k = 0; k < showInformation.seasons.length; k++) {
            if (showInformation.seasons[k].id === seasons[j].id) {
              showInformation.seasons[k] = seasons[j];
            }
          }
        }
        processSeasons();
        createFileDataStructure("./downloads/")
        downloadImages("./downloads/")
        createEpisodeListTxt("./downloads/")
      }
    }
    runGetEpisodeDetails();
  }

  function runGetShowDetails() {
    getShowDetails(tvdbid);
    if (getShowDetailsFinished === false) {
      setTimeout(runGetShowDetails, 100); /* this checks the flag every 100 milliseconds*/
    } else {
      // console.log(showInformation);
      updateSeasons();
    }
  }
  runGetShowDetails();
}

function removeFirstWord(str) {
  const indexOfSpace = str.indexOf(' ');
  if (indexOfSpace === -1) {
    return '';
  }
  return str.substring(indexOfSpace + 1);
}

function manual() {
  console.log("Available options: \n \
test - prints out a test console log \n \
token - Prints the current token \n \
search - search \"Name of Show\" \n \
save - save \"TVDBID\" \n \
exit - exits the program ")
}

function welcomeMessage() {
  console.log("type \"man\" to see available options");
}

function menu() {
  readline.question(`\n`, userInput => {
    if (userInput == "test") {
      console.log("This is a test input")
    } else if (userInput.split(" ")[0] == "token") {
      console.log("Token:", thetvdb_token)
    } else if (userInput.split(" ")[0] == "search") {
      console.log("Searching for TV Show:", removeFirstWord(userInput))
      searchShow(removeFirstWord(userInput));
    } else if (userInput.split(" ")[0] == "save") {
      console.log("Saving TV Show:", removeFirstWord(userInput))
      saveShow(removeFirstWord(userInput));
    } else if (userInput == "man") {
      manual();
    } else if (userInput == "exit") {
      readline.close();
      process.exit(1);
    } else {
      console.log("not a valid input");
    }
    // console.log(`Hi ${name}!`);
    menu()
    // console.log("done")
  });

}

getToken();
// manual();
welcomeMessage();
menu();