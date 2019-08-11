#!/usr/bin/nodemon
'use strict'

const serverVersion = 'v0.3 Beta'
require('dotenv').config();
const express = require('express');
const fs = require('fs');
// const url = require('url');
// const request = require('node-fetch');
// const requestURL = require('request');
const bodyParser = require('body-parser');
const cors = require('cors');
const readline = require('readline');

const webAPI = require('./modules/webAPI.js');
const TVDBapi = require('./modules/thetvdb.js');
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

// app.use('/api', webAPI);

function serverIncriment() {
  let nodePackage = JSON.parse(fs.readFileSync('package.json'));
  
  console.log('pre:', nodePackage.version);
  let formatting = nodePackage.version.split('.');
  formatting[2]++;
  console.log('post:', nodePackage.version);

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
    TVDBapi.getSeries(input.substr(input.indexOf(' ') + 1));
  } else if (input.split(' ')[0] === 'test') {
    webAPI.test(input.substr(input.indexOf(' ') + 1));
  } else if (input.split(' ')[0] === 'getepisodesbyid') {
    getEpisodesByID(input.substr(input.indexOf(' ') + 1));
  } else if (input.split(' ')[0] === 'save') {
    TVDBapi.getSeriesAllByID(input.substr(input.indexOf(' ') + 1));
  } else if (input.split(' ')[0] === 'getbanner') {
    getSeriesBannerByID(input.substr(input.indexOf(' ') + 1));
  } else if (input.split(' ')[0] === 'getfanart') {
    getSeriesFanArtByID(input.substr(input.indexOf(' ') + 1));
  } else if (input.split(' ')[0] === 'getposter') {
    getSeriesPostersByID(input.substr(input.indexOf(' ') + 1));
  } else if (input.split(' ')[0] === 'savetotxt') {
    episodesToText.saveToTextFile(input.substr(input.indexOf(' ') + 1));
  } else if (input === 'update') {
    server.update();
  } else {
    console.log(input, 'is not a valid input')
  };
});