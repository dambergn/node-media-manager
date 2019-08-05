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
const TVDB_JWT = TVDB_logIn(TVDB_KEY);
// const TVDB = require('node-tvdb');
// const tvdb = new TVDB(TVDB_KEY);

// function getSeries(seriesName){
//   tvdb.getSeriesByName(seriesName)
//   .then(response => { console.log(response) })
//   .catch(error => { throw(error) });
// };

// getSeries('stargate sg1');

function TVDB_logIn(TVDB_KEY) {
  const opts = {
    method: 'POST',
    body: JSON.stringify({ apikey: TVDB_KEY }),
    headers: {
      'Accept': TVDB_AV_HEADER,
      'Content-Type': 'application/json'
    }
  };

  return request(`${TheTVDB_URL}/login`, opts)
    .then(res => checkHttpError(res))
    .then(res => checkJsonError(res))
    .then(json => json.token);
};

function TVDB_GetSeriesByName(seriesName) {
  var options = {
    method: 'GET',
    url: 'https://api.thetvdb.com/search/series',
    headers:{
      Authorization: ` Bearer ${TVDB_JWT}`            
    },
    qs:
    {
      name: 'Stargate SG-1'
      //  imdbId: 'SOME_STRING_VALUE',
      //  zap2itId: 'SOME_STRING_VALUE' 
    }
  };

  request(options, function (error, response, body) {
    if (error) throw new Error(error);

    console.log(body);
  });
};


  app.listen(PORT, () => {
    console.log('Listening on port:', PORT, 'use CTRL+C to close.')
    console.log('Server started:', new Date());
    console.log('Currently running on', serverVersion)
  });

  // Error Checking
  function checkHttpError(res) {
    const contentType = res.headers.get('content-type') || '';

    if (res.status && res.status >= 400 && !contentType.includes('application/json')) {
      let err = new Error(res.statusText);
      err.response = {
        url: res.url,
        status: res.status,
        statusText: res.statusText
      };
      return Promise.reject(err);
    }
    return Promise.resolve(res);
  }

  function checkJsonError(res) {
    return res.json().then((json) => {
      if (json.Error) {
        let err = new Error(json.Error);
        err.response = {
          url: res.url,
          status: res.status,
          statusText: res.statusText
        };
        return Promise.reject(err);
      }
      return Promise.resolve(json);
    });
  }

  // Admin console commands
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.on('line', (input) => {
    if (input === 'thetvdbjwt') {
      console.log(TVDB_JWT);
    } else if (input === 'test') {
      TVDB_GetSeriesByName('star gate sg1');
    } else if (input === 'scan folder') {
      storage.scanFolder();
    } else if (input === 'version') {
      console.log(storage.serverVersion);
    } else if (input === 'update') {
      server.update();
    } else {
      console.log(input, 'is not a valid input')
    };
  });