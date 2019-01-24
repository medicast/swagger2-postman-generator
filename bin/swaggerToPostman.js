#! /usr/bin/env node
const Swagger2Postman = require('../swagger2-postman-generator');

const { url, tier, swaggerFile } = require('minimist')(process.argv.slice(2));

if (!url || !swaggerFile) {
  throw new Error("oops! usage: node swaggerToPostman.js --host=myHost --swaggerFile=spec.json");
}
console.log("Converting Swagger to Postman Files");

const fileObj = Swagger2Postman.convertSwagger().fromFile(swaggerFile)
fileObj.toPostmanEnvironmentFile("env1.json", { url, tier });
fileObj.toPostmanCollectionFile("collection1.json");
