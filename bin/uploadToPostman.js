#! /usr/bin/env node
// USAGE: uploadToPostman uploadToPostman --collectionFile=blah.json --postmanKey=<key>
const fs = require("fs")
const request = require("sync-request")

const postmanCollections = "https://api.getpostman.com/collections";
const postmanEnvs = "https://api.getpostman.com/collections";
const workspace = "Cliff";

let { collectionFile, environmentFile, postmanKey } = require('minimist')(process.argv.slice(2));

collectionFile = collectionFile || "postmanEnv.json";
// environmentFile = environmentFile || "postmanCollection.json";

const readFile = (fileName) => {
  return fs.readFileSync(fileName);
}

const updatePostmanCollection = (idToUpdate, postmanSpec) => {
  return request("PUT", `${postmanCollections}/${idToUpdate}`,
    {
      headers: { "X-Api-Key": `${postmanKey}`, "Content-Type": "application/json" },
      json: postmanSpec
    });
}

const createPostmanCollection = (postmanSpec) => {
  return request("POST", `${postmanCollections}?workspace=${workspace}`,
  {
    headers: { "X-Api-Key": `${postmanKey}`, "Content-Type": "application/json" },
    json: postmanSpec
  });
}

const updatePostmanEnv = (idToUpdate, postmanSpec) => {
  return request("PUT", `${postmanEnvs}/${idToUpdate}?workspace=${workspace}`,
    {
      headers: { "X-Api-Key": `${postmanKey}`, "Content-Type": "application/json" },
      json: postmanSpec
    });
}

const createPostmanEnv = (postmanSpec) => {
  return request("POST", `${postmanEnvs}?workspace=${workspace}`,
  {
    headers: { "X-Api-Key": `${postmanKey}`, "Content-Type": "application/json" },
    json: postmanSpec
  });
}

console.log("Reading Postman files");
const postmanSpec = JSON.parse(readFile(collectionFile));
const environmentSpec = JSON.parse(readFile(environmentFile));

const stupidPostmanSpec = { collection: postmanSpec };
const stupidEnvironmentSpec = { environments: environmentSpec }

const allCollectionsResponse = request('GET', `${postmanCollections}?workspace=${workspace}`, { headers: { "X-Api-Key": `${postmanKey}` } });
const allEnvsResponse = request('GET', `${postmanEnvs}?workspace=${workspace}`, { headers: { "X-Api-Key": `${postmanKey}` } });

const collections = JSON.parse(allCollectionsResponse.getBody()).collections;
const envs = JSON.parse(allEnvsResponse.getBody()).environments;

console.log('collections: ', collections);

const collectionToUpdate = collections.find(x => x.name === postmanSpec.info.name);
if (collectionToUpdate) {
  const response = updatePostmanCollection(collectionToUpdate.id, stupidPostmanSpec);
  console.log('response!', response.getBody());
} else {
  console.log(`no collection found with name ${postmanSpec.info.name}.  Creating a new collection`);
  const response = createPostmanCollection(stupidPostmanSpec);
  console.log('response!', response.getBody());
}

const environmentToUpdate = envs.find(x => x.name === environmentSpec.name);
if (environmentToUpdate) {
  console.log(`updating environment ${environmentToUpdate.name}`)
  const response = updatePostmanEnv(environmentToUpdate.id, stupidEnvironmentSpec);
  console.log('response!', response.getBody());
} else {
  console.log(`no collection found with name ${environmentSpec.name}.  Creating a new collection`);
  const response = createPostmanEnv(stupidEnvironmentSpec);
  console.log('response!', response.getBody());
}
