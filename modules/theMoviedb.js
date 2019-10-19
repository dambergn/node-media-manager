'use strict';
// 'v1.0'

require('dotenv').config();
const fs = require('fs');
const request = require('node-fetch');
const requestURL = require('request');
const bodyParser = require('body-parser');

let scanLocation = 'downloads/'

// The Movie DB