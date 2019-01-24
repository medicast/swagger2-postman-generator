#! /usr/bin/env node
// USAGE: uploadToPostman uploadToPostman --collectionFile=blah.json --postmanKey=<key>
const fs = require("fs")
const request = require("sync-request")

const postmanCollectionPost = "https://api.getpostman.com/collections";

let { collectionFile, postmanKey } = require('minimist')(process.argv.slice(2));

collectionFile = collectionFile || "postmanEnv.json";
// environmentFile = environmentFile || "postmanCollection.json";

console.log("Uploading Postman files");

var collectionJson = fs.readFileSync(collectionFile);
const postmanSpec = JSON.parse(collectionJson);
const stupidPostmanSpec = { collection: postmanSpec };

console.log('collectionjson', stupidPostmanSpec);

const response = request("POST", postmanCollectionPost,
  {
    headers: { "X-Api-Key": `${postmanKey}`, "Content-Type": "application/json" },
    json: stupidPostmanSpec
  });
console.log('response!', response.getBody());
