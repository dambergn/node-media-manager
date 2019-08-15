'use strict';

require('dotenv').config();
const fs = require('fs');
const path = require('path');

let scanLocation = 'downloads/';
// let scanLocation = '/run/user/1000/gvfs/smb-share:server=filesvrh01,share=tvshows/[NEW]';

// Process files and folders.
let walk = function (dir, done) {
  let results = [];
  fs.readdir(dir, function (err, list) {
    if (err) return done(err);
    let pending = list.length;
    if (!pending) return done(null, results);
    list.forEach(function (file) {
      file = path.resolve(dir, file);
      fs.stat(file, function (err, stat) {
        if (stat && stat.isDirectory()) {
          walk(file, function (err, res) {
            results = results.concat(res);
            if (!--pending) done(null, results);
          });
        } else {
          results.push(file);
          if (!--pending) done(null, results);
        };
      });
    });
  });
};

function formatDirectories(dir, folders) {
  let formatted = [];
  for (let i = 0; i < folders.length; i++) {
    let formatting = folders[i].replace(dir + '/', '');
    formatted.push(formatting);
  }
  // console.log(formatted);
  return formatted;
}

// Scan root folder
let mosy = function (dir, done) {
  fs.readdir(dir, (err, files) => {
    files.forEach(file => {
      console.log(file);
      return done
    });
  });
};

function mosyV2(dir, done){
  fs.readdir(dir, (err, files) => {
    let result = [];
    files.forEach(file => {
      // console.log(file);
      result.push(file);
    });
    done(result)
  });
}

function scanRoot(dir){
  mosyV2(dir, function (err, results) {
    if (err) console.log('Error:', err);
    console.log('Scan results:', results);
    return results;
  });
};

function scanFolder(dir) {
  let start = new Date().getTime();

  

  walk(dir, function (err, results) {
    if (err) throw err;
    let rootDir = mosy(dir, function (err, results) {
      if (err) throw err;
      // return results;
    });
    let end = new Date().getTime();
    let timeTook = (end - start) / 1000;
    let formattedResults = formatDirectories(dir, results);
    console.log(formattedResults);
    console.log('Processed ' + results.length + ' Files in ' + timeTook + ' Seconds');
    return formattedResults;
  });
}

// scanFolder(scanLocation);
console.log(scanRoot(scanLocation));