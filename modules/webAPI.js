'use strict';

require('dotenv').config();
const fs = require('fs');
const express = require('express');
const Router = express.Router;
// const app = express();

const webAPI = new Router();

exports.test = function(){
    console.log('module hit');
};

webAPI.get('/test', (req, res) => {
    // res.sendFile('index.html', { root: './public' });
    res.write('route hit');
  });