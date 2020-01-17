'use strict'

require('dotenv').config();
const fs = require('fs');
const fetch = require('node-fetch');
const requestURL = require('request');
const bodyParser = require('body-parser');

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
      "apikey": "853d02b51f42f250715167fd9ff918c6",
      "userkey": "ABK47Z8UBTJMGS9Y",
      "username": "nadpro"
    }),
    headers: { 'Content-Type': 'application/json' },
  })
    .then(res => res.json())
    .then(json => {
      console.log(json)
      TVDB_token = JSON.parse(json)
    });
}
// getToken()

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
      console.log("results:", json)
      TVDB_token = JSON.parse(json)
    });
}
// refreshToken()

let tempToken = { token: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE1Nzk4MzYyOTAsImlkIjoiTmljaG9sYXMgRGFtYmVyZyIsIm9yaWdfaWF0IjoxNTc5MjMwMjUwLCJ1c2VyaWQiOjExMzIzMSwidXNlcm5hbWUiOiJuYWRwcm8ifQ.cNYb3QPq1QiV99RWYzqV9mwU2kQfQ6A2G1nvPDSIAlo8XMGWUAPGxq1o2lhOY-hjHsMxpyvqa8e6SA0R2_MkrnoAayg2sXgzX_Ncf1DSQ1Ibaxf4DDBvpch9bLM8IyxG1KRuHEagdzI2iYrv-J9adMtBHbqxnwAp3rzYI31EQ2P9Zof2_-4RHgoZuFQDYPtm_WyNH2BxdDAUXu8NyaGIyuwPhOm1OxDV4ABQmiReya8IVFLiuj6rgK5cBReNTQ6OMc4o4CrL5qFCBgENg4YVND-8kiK2XAMO7QfUsmGwEgZiSc37iCZJ91vMcD9qBGKD_5DN-06dPzduCE9hbsondw' }

function TVDB_search_name(search) {
  search = search.replace(/ /g, '%20')
  console.log("searching for:", search)
  fetch(`${TheTVDB_URL}/search/series?name=${search}`, {
    method: 'get',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + tempToken.token,
    },
  })
    .then(res => res.json())
    .then(json => {
      console.log("results:", json)
    });
}

// TVDB_search("Rick and Morty")

function TVDB_get_by_id(search) {
  // search = search.replace(/ /g, '%20')
  console.log("searching for:", search)
  fetch(`${TheTVDB_URL}/series/${search}`, {
    method: 'get',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + tempToken.token,
    },
  })
    .then(res => res.json())
    .then(json => {
      console.log("results:", json)
    });
}

// TVDB_get_by_id('275274')

function TVDB_get_episodes_by_id(search) {
  // search = search.replace(/ /g, '%20')
  console.log("searching for:", search)
  fetch(`${TheTVDB_URL}/series/${search}/episodes`, {
    method: 'get',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + tempToken.token,
    },
  })
    .then(res => res.json())
    .then(json => {
      console.log("results:", json)
    });
}

TVDB_get_episodes_by_id('275274')