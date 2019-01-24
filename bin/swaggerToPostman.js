#! /usr/bin/env node
// USAGE: swaggerToPostman swaggerToPostman --url=localhost:3000 --swaggerFile=../cliff/api.spec.json --tier=PR123

const Swagger2Postman = require('../swagger2-postman-generator');

const { url, tier, swaggerFile, protocol = 'https' } = require('minimist')(process.argv.slice(2));

if (!url || !swaggerFile) {
  throw new Error("oops! usage: node swaggerToPostman.js --host=myHost --swaggerFile=spec.json");
}
console.log("Converting Swagger to Postman Files");

const fileObj = Swagger2Postman.convertSwagger().fromFile(swaggerFile)
fileObj.toPostmanEnvironmentFile("postmanEnv.json", { url, tier, protocol });
fileObj.toPostmanCollectionFile("postmanCollection.json", { url, tier, protocol });
