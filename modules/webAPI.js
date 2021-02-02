'use strict';

require('dotenv').config();
const fs = require('fs');
const express = require('express');
const https = require('https');
const async = require('async');
const fetch = require('node-fetch');
const superagent = require('superagent')
const Router = express.Router;
const bodyParser = require('body-parser').json();

const TVDBapi = require('./thetvdb.js');
// const app = express();

const webAPI = new Router();

webAPI.get('/test', (req, res, next) => {
  res.setHeader('Content-Type', 'application/json');
  let testResponse = {
    response: "Test route hit"
  }
  console.log("test hit, should recive:", testResponse);
  res.write(JSON.stringify(testResponse));
  // res.sendStatus(200);
});

webAPI.get('/load', (req, res, next) => {
  res.setHeader('Content-Type', 'application/json');
  let testResponse = {
    response: "Test route hit"
  }
  console.log("test hit, should recive:", testResponse);
  res.write(JSON.stringify(testResponse));
});

webAPI.route('/search/:search').get((req, res) => {
  // console.log('WebAPI Results: ', TVDBapi.getSeriesNameAPI(req.params.search));

  async function theTVDBSearchResults(req){
    await Promise.resolve(TVDBapi.getSeriesNameAPI(req.params.search)).then(response => {
      let returned = false;
      let timeout = 0;
      while(returned === false){
        if(response === undefined){
          if(timeout > 5000){
            returned = true;
            console.log('Search timed out');
            res.send({'request' : 'Timed Out'})
          } else {
            console.log('searching', timeout);
            timeout++;
          }
        } else {
          returned = true;
          console.log('It worked:', response);
          res.send(JSON.stringify(response))
        }
      }
    })
  }
  theTVDBSearchResults(req)
  
  // async function getSearchResults(req){
  //   let response = await TVDBapi.getSeriesNameAPI(req.params.search)
  //   let data = await response
  //   while(data === undefined){
  //     if(data === undefined){
  //       console.log('async is worthless')
  //       // await res.send(JSON.stringify({'async':'worthless'}))
  //     } else {
  //       console.log('I cant belive it actually worked!')
  //       await console.log('inside Async:', data);
  //       await res.send(JSON.stringify(data));
  //     }
  //   // searchResults = data;
  // }
  // getSearchResults(req);
  // console.log('WebAPI Results: ', getSearchResults(req));

  // res.send(JSON.stringify(getSearchResults(req)));
  // res.send(JSON.stringify(searchResults));


  // console.log('WebAPI Results:', fetch(TVDBapi.getSeriesNameAPI(req.params.search)));

  // let results = TVDBapi.getSeriesNameAPI(req.params.search).then(console.log('WebAPI results:', results));

  // async function init(req) {
  //   let results = await TVDBapi.getSeriesNameAPI(req.params.search)
    
  //   console.log('WebAPI results:', results);
  // }
  // init(req);
  
  // async.series(TVDBapi.getSeriesNameAPI(req.params.search), function (err, result) {
  //   /* this code will run after all calls finished the job or
  //      when any of the calls passes an error */
  //   if (err) { return console.log(err) };
  //   console.log('async result:', result);
  // });

  // return new Promise((resolve, reject) => {
  //   const error = false;

  //   if(!error){
  //     console.log(TVDBapi.getSeriesNameAPI(req.params.search));
  //     resolve()
  //   } else {
  //     reject('response borked')
  //   }
  // })

});

module.exports = webAPI;