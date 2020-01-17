'use strict';
// 'v1.0'

require('dotenv').config();
const fs = require('fs');
const request = require('node-fetch');
const requestURL = require('request');
const bodyParser = require('body-parser');
const { Mal } = require("node-myanimelist");

let scanLocation = 'downloads/'

// My Anime List
// https://www.npmjs.com/package/node-myanimelist

/*
 { mal_id: 121,
    url: 'https://myanimelist.net/anime/121/Fullmetal_Alchemist',
    image_url:
     'https://cdn.myanimelist.net/images/anime/10/75815.jpg?s=095ef966da07a873a75e38378080a466',
    title: 'Fullmetal Alchemist',
    airing: false,
    synopsis:
     'Edward Elric, a young, brilliant alchemist, has lost much in his twelve-year life: when he and his brother Alphonse try to resurrect their dead mother through the forbidden act of human transmutation,...',
    type: 'TV',
    episodes: 51,
    score: 8.26,
    start_date: '2003-10-04T00:00:00+00:00',
    end_date: '2004-10-02T00:00:00+00:00',
    members: 928230,
    rated: 'PG-13' }
*/

exports.searchAnime = function (animeName) {
  Mal.search().anime({ 
    q: animeName,
    type: Mal.types.AnimeType.tv
  })
  .then(data => {
    for(let i = 0; i < 5; i++){
      let title = data.data.results[i].title
      let id = data.data.results[i].mal_id
      console.log('Name:', title, 'ID:', id);
    }
  });
}

exports.searchAnimeTest = function (animeName) {
  Mal.search().anime({ 
    q: animeName,
    type: Mal.types.AnimeType.tv
  })
  .then(data => {
    console.log(data.data.results[0]);
    // for(let i = 0; i < 5; i++){
    //   // let title = data.data.results[i].title
    //   // let id = data.data.results[i].mal_id
    //   console.log(data.data.results[i]);
    // }
  });
}

exports.animeByID = function (aid) {
  let anime = Mal.anime(aid);
  anime.info().then(data => {

    console.log(data.data.related);
  })
}