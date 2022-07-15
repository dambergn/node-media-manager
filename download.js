#!/usr/bin/node

const path = require('path');
const fs = require('fs');
const { rawListeners } = require('process');
const TVDBapi = require('./modules/thetvdb_v2.js');

function getDirectories(path) {
    return fs.readdirSync(path).filter(function (file) {
      return fs.statSync(path+'/'+file).isDirectory();
    });
  }

let folders = getDirectories('/run/user/1001/gvfs/smb-share:server=192.168.1.20,share=anime2/Subbed/')

// console.log(folders)

// let search = TVDBapi.getSeries('ABCiee Working Diary');

// console.log(search);

async function firstAsync() {
    let promise = new Promise((res, rej) => {
        TVDBapi.getSeries('ABCiee Working Diary');
    });

    // wait until the promise returns us a value
    let result = await promise; 
  
    // "Now it's done!"
    console.log(result); 
};

firstAsync();



// async function getShow(){
//     show = TVDBapi.getSeries('ABCiee Working Diary');
// }

// getShow().then(console.log(show))