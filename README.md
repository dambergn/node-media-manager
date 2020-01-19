# node-media-manager
Media content management  
This project was designed and tested on ubuntu linux

# Setup
Before running the server make sure you have your API keys and run ./setup.sh from a terminal.  

## API requirements
- TheTVdb
- TheMoviedb

## Features / To Do List
- [ ] Scan files and folders
- [ ] determine media type
- [ ] get media information based of file names
- [ ] pull media metata data to populate databases
- [ ] Create people database to agrigate data.
  - [ ] Actors, Artists, Authors, Directors, Producers, etc.
- [ ] Download movie contents from the movie database
  - [ ] Get movie info
  - [ ] Get cast info
  - [ ] Save data to tmdb.json file
  - [ ] Create Folder infrastructure
  - [ ] Download images to img folder
  - [ ] Save Cast info to People database
- [ ] Download tv show contents from the tv database
  - [ ] Get Basic show info
  - [ ] Get Show Episodes
  - [ ] Get and save all images info
  - [ ] Get Cast information
  - [ ] Save all data to tvbd.json file
  - [ ] Format seasons and episodes for file nameing
    - [ ] Take into account differences between Specials, Season#'s and Season years 
  - [ ] Save txt file with series episodes
  - [ ] Create series file folder structure
  - [ ] Download and save images
    - [ ] Posters, Fanart, Season, Series
    - [ ] Episode Thumbnails with name formatting
  - [ ] Save Cast info to People database
- [ ] detect anime and get english names from myanimelist
  - [ ] Compare search to tvdb for english/japanise title
  - [ ] When determined matching series Agrigate data
  - [ ] Grab all associated seasons to single object
  - [ ] Save data to mal.json
- [ ] create front end to display downloaded data 
- [ ] novel database
- [ ] comic book database
- [ ] manga database
- [ ] light novel database

## Media File Types
### Containers & Extensions
AVI, MKV, MP3, MPEG, MP4, WMV, MOV

### Audio Codecs
AC3, AAC, FLAC, OGG

### Video Codecs
MPEG, Xvid, h.264, h.265, VC1

### Image Codecs
BMP, JPEG

### Video Resolutions
- 2160p, 4k, 4096x2160
- 1080p, 1920x1080
- 720p, 1280x720
- 480p, 640x480
- 360p
- 328p
- 240p
- 160p
