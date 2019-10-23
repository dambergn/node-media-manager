'use strict';
// 'v1.0'

require('dotenv').config();
const fs = require('fs');
const request = require('node-fetch');
const requestURL = require('request');
const bodyParser = require('body-parser');
const superAgent = require('superagent');

let scanLocation = 'downloads/'

// The Movie DB
const TheTMDB_URL = 'https://api.themoviedb.org/3/';
const TMDB_KEY = process.env.TMDB_API_KEY;


// gets movies based on user search by title
exports.searchMovie = function (movieName) {
  requestURL.get('/api/movies/:title', (req, res) => {
    let url_search = `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_KEY}&query=${movieName}`;
    superAgent.get(url_search)
      .then(data => {
        for(let i = 0; i < data.body.results.length; i++){
          let movieTitle = data.body.results[i].title;
          let movieID = data.body.results[i].id;
          console.log('Title:', movieTitle, 'ID:', movieID);
        }
        // res.send(data.body.results);
      })
      .catch(err => console.error(err));
  })
};

exports.saveMovie = function (movieName) {
  requestURL.get('/api/movies/one/:id', (req, res) => {
    let detail_Url = `https://api.themoviedb.org/3/movie/${movieName}?api_key=${TMDB_KEY}&append_to_response=videos,images`
    superAgent.get(detail_Url)
      .then(data => {
        // console.log(data.body);
        saveToJSON(data.body)
        // res.send(data.body);
      })
      .catch(err => console.error(err));
  });
}

function saveToJSON(data) {
  let formattedFileName = data.title;
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

  fs.writeFile(`${scanLocation}${formattedFileName}/tmdb.json`, JSON.stringify(data), 'utf8', function (err) {
    if (err) {
      return console.log(err);
    };
    console.log("The file was saved!");
    // saveToTextFile(`${scanLocation}${formattedFileName}/`, data);
  });

  downloadImages(data, formattedFileName);
};

let download = function (uri, filename, callback) {
  requestURL.head(uri, function (err, res, body) {
    requestURL(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
  });
};

function downloadImages (data, name) {
  let url = 'https://image.tmdb.org/t/p/original';
  console.log('downloadIMG: ', url + data.backdrop_path, scanLocation + name + '/img')
  // download(url + data.backdrop_path, scanLocation + name + '/img');

};