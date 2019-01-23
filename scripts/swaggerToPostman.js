const Swagger2Postman = require('../swagger2-postman-generator');

const { host, port, swaggerFile } = require('minimist')(process.argv.slice(2));

if (!host || !swaggerFile) {
    throw new Error("oops! usage: node swaggerToPostman.js --host=myHost --swaggerFile=spec.json");
}

console.log(host);
console.log("Converting Swagger to Postman Files");

const fileObj = Swagger2Postman.convertSwagger().fromFile(swaggerFile)
    fileObj.toPostmanEnvironmentFile("env.json", { host, port });
    fileObj.toPostmanCollectionFile("postmanCollection.json");
