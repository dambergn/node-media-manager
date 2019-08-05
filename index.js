#!/usr/bin/nodemon
'use strict'

const serverVersion = 'v0.1 Beta'
require('dotenv').config();
const express = require('express');
const fs = require('fs');
// const url = require('url');
const request = require('node-fetch');
const bodyParser = require('body-parser');
const cors = require('cors');
const readline = require('readline');
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

// The TVDB
const TheTVDB_URL = 'https://api.thetvdb.com';
const TVDB_KEY = process.env.API_KEY;
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

function getSeriesAllByID(seriesID) {
  tvdb.getSeriesAllById(seriesID)
    .then(response => {
      response; // contains series data (i.e. `id`, `seriesName`)
      response.episodes; // contains an array of episodes
      // console.log(response);
      saveToJSON(response);
    })
    .catch(error => { throw (error) });
}

app.listen(PORT, () => {
  console.log('Listening on port:', PORT, 'use CTRL+C to close.')
  console.log('Server started:', new Date());
  console.log('Currently running on', serverVersion)
});

// Admin console commands
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.on('line', (input) => {
  if (input.split(' ')[0] === 'getseries') {
    getSeries(input.substr(input.indexOf(' ') + 1));
  } else if (input.split(' ')[0] === 'getseriesid') {
    getSeriesID(input.substr(input.indexOf(' ') + 1));
  } else if (input.split(' ')[0] === 'getepisodesbyid') {
    getEpisodesByID(input.substr(input.indexOf(' ') + 1));
  } else if (input.split(' ')[0] === 'getseriesallbyid') {
    getSeriesAllByID(input.substr(input.indexOf(' ') + 1));
  } else if (input === 'update') {
    server.update();
  } else {
    console.log(input, 'is not a valid input')
  };
});

function saveToJSON(data){
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
  });
};