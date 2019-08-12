// tmdb.js

const utils = require('./utils');
const https = require("https");

const API_KEY = 'b16be6923fa8573acb76357563daf174';

// async function getBackdropPath(id, objectType, locale) {
//   const output = await getMovie(id, objectType, locale);
//   return output.backdrop_path;
// };

// async function getPosterPath(id, objectType, locale) {
//   const output = await getMovie(id, objectType, locale);
//   return 
// }

async function getImages(id, objectType, locale) {
  const response = await getMovie(id, objectType, locale);
  const output = {
    'backdrop': response.backdrop_path,
    'poster': response.poster_path
  };
  return output;
}

async function getMovie(id, objectType, locale) {
  return new Promise((resolve, reject) => {
    var options = {
        "method": "GET",
        "hostname": "api.themoviedb.org",
        "port": null,
        "path": `/3/${objectType}/${id}?api_key=${API_KEY}&language=${locale}`,
        "headers": {}
      };

      const request = https.request(options, (response) => {
        let returnData = '';
  
        response.on('data', (chunk) => {
          returnData += chunk;
        });
  
        response.on('end', () => {
          resolve(JSON.parse(returnData));
        });
  
        response.on('error', (error) => {
          reject(error);
        });
      });
      request.end();
    })
}

module.exports = {
  getImages,
};