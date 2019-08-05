#!/usr/bin/nodemon
'use strict'

const express = require('express');
const fs = require('fs');
require('dotenv').config();
const bodyParser = require('body-parser');
const cors = require('cors');
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
const TheTVDB = "https://api.thetvdb.com"
const TVDB_KEY = process.env.API_KEY;
const TVDB = require('node-tvdb');
const tvdb = new TVDB(TVDB_KEY);

function getSeries(seriesName){
  tvdb.getSeriesByName(seriesName)
  .then(response => { console.log(response) })
  .catch(error => { throw(error) });
};

getSeries('stargate sg1');

// app.post(`${TheTVDB}/login`, (req, res) => {
//   //{"apikey":"APIKEY","username":"USERNAME","userkey":"USERKEY"}

// });

app.listen(PORT, () => {
  console.log(`server is listening on ${PORT}`);
});