const fs = require("fs")
const request = require("sync-request")

// const Swagger2Postman = require("swagger2-to-postman");
const Swagger2Postman = require("swagger2-postman2-parser");
const Swagger2Object = require("swagger2-to-object"); 

const buildPostmanEnvironment = require("./buildPostmanEnvironment.js")

const ignoredVariables = ["scheme", "host", "port", "url"];

/* postman collection post-processing */
function populateRequestJsonIfDefined (postmanRequest, swaggerSpec, swaggerRefsLookup, options) {
    var url = postmanRequest.url;
    var basePath = swaggerSpec.basePath;

    var relativePath = url.replace(`{{scheme}}://{{host}}:{{port}}${basePath}`, "")
    var swaggerPath = ((relativePath.replace(/\/:([a-zA-Z0-9]+)/, "/{$1}")).split("?"))[0]

    var swaggerPathRoot = swaggerSpec.paths[swaggerPath];

    if (!swaggerPathRoot) {
        return;
    }

    var requestMethod = postmanRequest.method.toLowerCase();
    var swaggerPathDef = swaggerPathRoot[requestMethod]
    
    if (!swaggerPathDef) {
        return;
    }

    var sampleObj = Swagger2Object
        .generateObject()
        .for()
        .pathBodyUsingRefs(swaggerPathDef, swaggerRefsLookup, options);
    
    if (sampleObj) {
        postmanRequest.rawModeData = JSON.stringify(sampleObj, null, 4);
    }
}

function validateSwaggerJson (jsonString) {
    const { result, reason } = Swagger2Postman.validate(jsonString);
    if (!result) {
        throw new Error(`Swagger validation failed with reason: ${reason}`);
    }
}

/* swagger to postman conversions */
function convertSwaggerSpecToPostmanCollection (swaggerSpec) {
    validateSwaggerJson(swaggerSpec);
    const { status, collection } = Swagger2Postman.convert(swaggerSpec);
    if (!status) {
        throw new Error(`Swagger conversion with reason: ${reason}`);
    }
    return collection;
}

function convertSwaggerToPostman (swaggerSpec, options) {  
    var postmanCollection = convertSwaggerSpecToPostmanCollection(swaggerSpec);
    if (options && options.url) {
        postmanCollection.item.forEach((basicItem) => {
            basicItem.item.forEach((requestItem) => {
                requestItem.request.url.host = [ "{{url}}" ];
                requestItem.request.url.protocol = options.protocol;
            });
        });
    }
    return postmanCollection;
}

function convertSwaggerToPostmanJson (swaggerSpec, options) {
    var postmanCollection = convertSwaggerToPostman(swaggerSpec, options);

    if (options && options.prettyPrint) {
        return JSON.stringify(postmanCollection, null, 4);
    } else {
        return JSON.stringify(postmanCollection);
    }
}

/* swagger to postman environment conversions */
function buildEnvironmentVariable (name, value = "", type = "text", enabled = true) {
    return {
        key: name,
        value: value,
        type: type,
        enabled: enabled
    }
}

function convertSwaggerToPostmanEnvironment (swaggerSpec, options) {
    var postmanCollectionJson = convertSwaggerToPostmanJson(swaggerSpec, options);
    const swaggerName = JSON.parse(postmanCollectionJson).info.name;
    var environment = buildPostmanEnvironment(options, swaggerName);

    var uniqueVariables = [...new Set(postmanCollectionJson.match(/\{\{.+?\}\}/g))];

    if (options && options.environment && options.environment.name) {
        environment.name = `${options.environment.name}`
    }

    var environmentVariables = environment.values;
    var uniqueVariableDictionary = {}

    uniqueVariables.forEach((v) => {
        var sanitisedVariableName = v.replace(/^{{|}}$/gm, "");
        uniqueVariableDictionary[sanitisedVariableName] = true;

        if (ignoredVariables.includes(sanitisedVariableName)) {	
            return;	
        }
        var environmentVariable = buildEnvironmentVariable(sanitisedVariableName);
        environmentVariables.push(environmentVariable)
    });

    if (!options ||
        !options.environment ||
        !options.environment.customVariables ||
        options.environment.customVariables.length < 1) {
        return environment;
    }
    return environment;
}

function convertSwaggerToPostmanEnvironmentJson (swaggerSpec, options) {
    var postmanEnvironment = convertSwaggerToPostmanEnvironment(swaggerSpec, options);

    if (options && options.prettyPrint) {
        return JSON.stringify(postmanEnvironment, null, 4);
    } else {
        return JSON.stringify(postmanEnvironment);
    }
}

/* module function chain */
function convertSwagger (swaggerSpec, convertSwaggerOptions) {
    return { 
        toPostmanCollection: (options) => convertSwaggerToPostman(swaggerSpec, options),
        toPostmanCollectionJson: (options) => convertSwaggerToPostmanJson(swaggerSpec, options),
        toPostmanCollectionFile: (postmanCollectionFilename, options) => {
            if (options && options.debug) {
                console.log(`Saving Postman Collection to file...`);
            }

            var postmanCollectionJson = convertSwaggerToPostmanJson(swaggerSpec, options);

            fs.writeFileSync(postmanCollectionFilename, postmanCollectionJson); 

            if (options && options.debug) {
                console.log(`Saved Postman Collection to file ${postmanCollectionFilename}`)
            }
        },
        toPostmanCollectionPost: (url, options) => {
            var postmanCollectionJson = convertSwaggerToPostmanJson(swaggerSpec, options);
            var postJson = postmanCollectionJson;

            if (options && options.postJsonBuilder && 
                (typeof options.postJsonBuilder) === "function") {
                postJson = options.postJsonBuilder(postmanCollectionJson);
            }

            var response = request("POST", url, { json: postJson })
            
            return response;
        },
        toPostmanEnvironment: (options) => convertSwaggerToPostmanEnvironment(swaggerSpec, options),
        toPostmanEnvironmentJson: (options) => convertSwaggerToPostmanEnvironmentJson(swaggerSpec, options),
        toPostmanEnvironmentFile: (postmanEnvironmentFilename, options) => {
            if (options && options.debug) {
                console.log(`Saving Postman Collection to file...`);
            }

            var postmanCollectionJson = convertSwaggerToPostmanEnvironmentJson(swaggerSpec, options);

            fs.writeFileSync(postmanEnvironmentFilename, postmanCollectionJson); 

            if (options && options.debug) {
                console.log(`Saved Postman Collection to file ${postmanEnvironmentFilename}`)
            }
        },
        toPostmanEnvironmentPost: (url, options) => {
            var postmanEnvironmentJson = convertSwaggerToPostmanEnvironmentJson(swaggerSpec, options);
            var postJson = postmanEnvironmentJson;

            if (options && options.postJsonBuilder && 
                (typeof options.postJsonBuilder) === "function") {
                postJson = options.postJsonBuilder(postmanEnvironmentJson);
            }

            var response = request("POST", url, { json: postJson })
            
            return response;
        }
    }
}

function convertSwaggerJson (swaggerJson, convertSwagger, options) {
    if (options && options.debug) {
        console.log(`Parsing Swagger spec JSON...`);
    }

    var swaggerSpec = JSON.parse(swaggerJson);
    return convertSwagger(swaggerSpec, options);
}

/* module export */
module.exports = {
    convertSwagger: () => ({ 
        fromUrl: (url, options) => {
            if (options && options.debug) {
                console.log(`Reading Swagger spec from URL: ${url}...`);
            }

            var response = request("GET", url);
            var swaggerJson = response.getBody();

            return convertSwaggerJson(swaggerJson, convertSwagger, options);
        },
        fromFile: (filePath, options) => {
            if (options && options.debug) {
                console.log(`Reading Swagger spec from file: ${filePath}...`);
            }

            var swaggerJson = fs.readFileSync(filePath);

            return convertSwaggerJson(swaggerJson, convertSwagger, options);
        },
        fromJson: (swaggerJson, options) => convertSwaggerJson(swaggerJson, convertSwagger, options),
        fromSpec: (swaggerSpec, options) => convertSwagger(swaggerSpec, options)
    })
};
