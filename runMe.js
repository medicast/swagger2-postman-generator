const Swagger2Postman = require('../swagger2-postman-generator');

const { swaggerFile, host, port } = require('minimist')(process.argv.slice(2));

if (!swaggerFile || !host) {
  throw Error("Usage: node swaggerToPostman.js --swaggerFile=mySpec.json --host=localhost")
}

console.log(host);
console.log("Converting Swagger to Postman Files");

const fileObj = Swagger2Postman.convertSwagger().fromFile(swaggerFile)
    fileObj.toPostmanEnvironmentFile("env.json", { host, port });
    fileObj.toPostmanCollectionFile("postmanCollection.json");
