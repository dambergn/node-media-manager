#!/usr/bin/nodemon
'use strict'

const fs = require('fs');
var nodemon = require('nodemon');
try {
  if (!fs.existsSync('.env')) {
    console.log('***************************************************');
    console.log('***Please run ./setup.sh or configure .env file!***');
    console.log('***************************************************');
    nodemon.emit('quit');
  }
} catch(err) {console.error(err)}
require('dotenv').config();
const express = require('express');
// const url = require('url');
// const request = require('node-fetch');
// const requestURL = require('request');
const bodyParser = require('body-parser');
const cors = require('cors');
const readline = require('readline');
const cmd = require('node-cmd');

const webAPI = require('./modules/webAPI.js');
const TVDBapi = require('./modules/thetvdb.js');
// const TVDBapi = require('./modules/thetvdb_v2.js');
const TMDBapi = require('./modules/theMoviedb.js');
const myAL = require('./modules/myanimelist.js');
const scan = require('./modules/media-scanner.js');
const PORT = process.env.PORT || 3000;
const app = express();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//Web Front End
app.use(express.static('./public'));
app.get('/', (req, res) => {
  res.sendFile('index.html', { root: './public' });
});

app.use('/api', webAPI);

function serverIncriment() {
  let nodePackage = JSON.parse(fs.readFileSync('package.json'));
  
  // console.log('pre:', nodePackage.version);
  let formatting = nodePackage.version.split('.');
  formatting[2]++;
  // console.log('post:', nodePackage.version);

  // fs.writeFile('package.json', JSON.stringify(nodePackage), function (err) {
  //   if (err) return console.log(err);
  // });
  
  return nodePackage.version
}

app.listen(PORT, () => {
  console.log('Listening on port:', PORT, 'use CTRL+C to close.')
  console.log('Server started:', new Date());
  // console.log('Currently running on', serverVersion);
  console.log('Currently running on Version', serverIncriment())
});

// Admin console commands
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.on('line', (input) => {
  if (input.split(' ')[0] === 'search') {
    if (input.split(' ')[1] === 'movie') { // Movie
      // console.log('Searching for:', input.substr(input.indexOf(' ') + 7))
      TMDBapi.searchMovie(input.substr(input.indexOf(' ') + 7));
    } else if (input.split(' ')[1] === 'show') { // TVShow
      // TVDBapi.TVDB_search_name(input.substr(input.indexOf(' ') + 6));
      TVDBapi.getSeries(input.substr(input.indexOf(' ') + 6));
    } else if (input.split(' ')[1] === 'anime') { // Anime
      // console.log('Anime search is not yet available');
      myAL.searchAnime(input.substr(input.indexOf(' ') + 1));
    } else { // Error
      console.log('Please select movie, show, or anime to search');
    }
  } else if (input.split(' ')[0] === 'save') {
    if (input.split(' ')[1] === 'movie') { // Movie
      TMDBapi.saveMovie(input.substr(input.indexOf(' ') + 7));
    } else if (input.split(' ')[1] === 'show'){ // TVShow
      // TVDBapi.TVDB_save_by_id(input.substr(input.indexOf(' ') + 6));
      TVDBapi.getSeriesAllByID(input.substr(input.indexOf(' ') + 6));
    } else if (input.split(' ')[1] === 'anime') { // Anime
      console.log('Anime save is not yet available');
    } else { // Error
      console.log('Please select movie, show, or anime to save');
    } 
  } else if (input.split(' ')[0] === 'clear') {
    clearFolder();
  } else if (input.split(' ')[0] === 'getepisodesbyid') {
    getEpisodesByID(input.substr(input.indexOf(' ') + 1));
  } else if (input.split(' ')[0] === 'getbanner') {
    getSeriesBannerByID(input.substr(input.indexOf(' ') + 1));
  } else if (input.split(' ')[0] === 'getfanart') {
    getSeriesFanArtByID(input.substr(input.indexOf(' ') + 1));
  } else if (input.split(' ')[0] === 'getposter') {
    getSeriesPostersByID(input.substr(input.indexOf(' ') + 1));
  } else if (input.split(' ')[0] === 'test') {
    myAL.searchAnimeTest(input.substr(input.indexOf(' ') + 1));
  } else if (input.split(' ')[0] === 'test2') {
    myAL.animeByID(input.substr(input.indexOf(' ') + 1));
  } else if (input === 'scan') {
    scan.scanFolder();
  } else if (input === 'update') {
    server.update();
  } else {
    console.log(input, 'is not a valid input')
  };
});

function clearFolder(){
  cmd.get('rm -rf downloads/*', function (err, data, stderr) {
    if (err) console.log('err: ', err);
    if (stderr) console.log('stderr: ', stderr);
  });
}