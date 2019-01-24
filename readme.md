# swagger2-postman-generator #

Command Line usage

``` shell
npm install swagger2-postman-generator -g
swaggerToPostman --url=http://blahblah.com --swaggerFile=spec.json --tier=myTier
uploadToPostman --collectionFile=postmanCollection.json --postmanKey=<key> --environmentFile=postmanEnv.json
```

A simple interface for converting Swagger v2 JSON Specs to a Postman Collection, with samples of Swagger request models added as JSON request bodies.

Based on the [swagger2-to-postman](https://github.com/postmanlabs/swagger2-to-postman) NPM package and [Swagger UI](https://github.com/swagger-api/swagger-ui) JSON example request generator.

Features:

- Import Swagger Spec direct from URL, JSON file, raw JSON string and JavaScript object 

- Export Postman Collection to JavaScript object, raw JSON, JSON file or via a HTTP POST

- Export Postman Environment with all URL parameters and other variables - can be exported to JavaScript object, raw JSON, JSON file or via a HTTP POST

- Base URLs for endpoints are made generic with Postman environment placeholders for scheme (HTTP/HTTPS), host (some.website.com) and port (8080) -> http://some.website.com/api/do/stuff becomes {{scheme}}://{{host}}:{{port}}/api/do/stuff 

*Base URL parameters are included in any generated postman envrionment file*

NPM Package: https://www.npmjs.com/package/swagger2-postman-generator
GitHub: https://github.com/djfdyuruiry/swagger2-postman-generator

This package is part of a collection of three Swagger v2 converters I have created:

- swagger2-to-object: 
    [NPM](https://www.npmjs.com/package/swagger2-to-object) | [GitHub](https://github.com/djfdyuruiry/swagger2-to-object)
- swagger2-to-json:
    [NPM](https://www.npmjs.com/package/swagger2-to-json) | [GitHub](https://github.com/djfdyuruiry/swagger2-to-json)

---

## Install ##

``` shell
npm install swagger2-postman-generator
```

---

## Usage ##

This NPM module returns a single object which is used to access a chain of different import and generate functions. Import the module like so:

``` javascript
var Swagger2Postman = require("swagger2-postman-generator");

Swagger2Postman
    .convertSwagger()
    // do more stuff...
```

### Importing Swagger ###

This can then be followed by an import function

**Import Swagger URL**

``` javascript
Swagger2Postman
    .convertSwagger()
    .fromUrl("http://petstore.swagger.io/v2/swagger.json")
```

**Import Swagger JSON File**

``` javascript
Swagger2Postman
    .convertSwagger()
    .fromFile("swagger.json")
```

**Import Swagger JSON String**

``` javascript
Swagger2Postman
    .convertSwagger()
    .fromJson('{"swagger":"2.0",...')
```

**Import Swagger JavaScript Object**

``` javascript
var swaggerSpec = getSwaggerSpecFromSomewhere(); // example

Swagger2Postman
    .convertSwagger()
    .fromSpec(swaggerSpec)
```

### Exporting Postman ###

Once you have imported a Swagger spec, you have several options for generating the Postman collection output.


**Export to Postman JSON**

``` javascript
var collectionJson = Swagger2Postman
    .convertSwagger()
    .fromUrl("http://petstore.swagger.io/v2/swagger.json")
    .toPostmanCollectionJson()
```

**Export to Postman JSON File**

``` javascript
Swagger2Postman
    .convertSwagger()
    .fromFile("swagger.json")
    .toPostmanCollectionFile("postman_collection.json")
```

**Export to Postman JavaScript object**

``` javascript
var collection = Swagger2Postman
    .convertSwagger()
    .fromJson('{"swagger":"2.0",...')
    .toPostmanCollection()
```

**Export Postman via HTTP POST**

``` javascript
var swaggerSpec = getSwaggerSpecFromSomewhere(); // example

Swagger2Postman
    .convertSwagger()
    .fromSpec(swaggerSpec)
    .toPostmanCollectionPost("https://some.web.service/api/postman/collections")
```

**Export Postman Environment**

You can export a auto-generated Postman Environment JSON that contains the host, port, scheme and all the distinct parameters found in the Swagger spec.

``` javascript
var swagger2Postman = Swagger2Postman
    .convertSwagger()
    .fromJson('{"swagger":"2.0",...')
    
var options = getOptionsFromSomewhere(); // options for postman collection and environment

var env = swagger2Postman
    .toPostmanEnvironment(options)

var json = swagger2Postman
    .toPostmanEnvironmentJson(options)

swagger2Postman
    .toPostmanEnvironmentFile("env.json", options)

swagger2Postman
    .toPostmanEnvironmentPost("https://some.web.service/api/postman/environments", options)
```

---

## Options ##

You can pass an options object to the ```from``` and ```to``` functions as the last parameter. No specific options are supported yet for ```from``` functions. 

Note when dealing with a Postman request body, URL or headers you can use the environment variable syntax to add placeholders; e.g. ```token: {{tokenVariable}}```

**```from``` and ```to``` options**
- ```debug```: set this flag to ```true``` to turn on console logging of library calls, for debugging purposes only 

**```to``` function options**

- ```requestPreProcessor```: function that receives the postman request and swagger spec, called before request URL and body are processed


``` javascript
Swagger2Postman
    .convertSwagger()
    .fromFile("swagger.json")
    .toPostmanCollection({
        requestPreProcessor: (postmanRequest, swaggerSpec) => {
            // postmanRequest - request object from postman collection
            // swaggerSpec - Swagger spec object used to generate postman collection
        }
    })
```

*Postman request objects look like this:*

``` javascript
{
			"name": "OAuth1.0 Verify Signature",
			"dataMode": "params",
			"data": [
				{
					"key": "code",
					"value": "xWnkliVQJURqB2x1",
					"type": "text",
					"enabled": true
				}
			],
			"rawModeData": "{\"some\":\"json\"}",
			"descriptionFormat": null,
			"description": "OAuth1.0a is a specification that defines....",
			"headers": "Authorization: OAuth\n",
			"method": "GET",
			"pathVariables": {},
			"url": "https://echo.getpostman.com/oauth1",
			"preRequestScript": "",
			"tests": "responseCode.code === 200",
			"currentHelper": "normal",
			"helperAttributes": {}
		}
```

**In the request rawModeData is the request body as a string, and data is form data. A full schema for Postman v1 collections can be found [here](https://raw.githubusercontent.com/postmanlabs/schemas/develop/json/collection/v1.0.0/index.json)**

- **```globalHeaders```**: array of literal HTTP headers to add to all requests (useful for authentication headers etc.) e.g. ```Authorization: Basic {{base64Credentials}}```

``` javascript
Swagger2Postman
    .convertSwagger()
    .fromFile("swagger.json")
    .toPostmanCollection({
        globalHeaders: [
            "DNT: 0",
            "Authorization: Basic {{usernamePasswordBase64}}" // you can use postman variables here
        ]
    })
```

- **```requestPostProcessor```**: function that receives the postman request and swagger spec, called after request URL and body are processed

``` javascript
Swagger2Postman
    .convertSwagger()
    .fromFile("swagger.json")
    .toPostmanCollection({
        requestPostProcessor: (postmanRequest, swaggerSpec) => {
            // postmanRequest - request object from postman collection
            // swaggerSpec - Swagger spec object used to generate postman collection

            if (postmanRequest.url.includes("/some/special/route")) {
                // add extra form data and a custom header to a special route (e.g. login)
                postmanRequest.data.push({
                    "key": "someFormField",
                    "value": "someFormValue",
                    "type": "text",
                    "enabled": true
                });

                postmanRequest.headers += "Cache-Control: no-cache\n";
            }
        }
    })
```

- **```postJsonBuilder```**: a function that receives the postman collection as JSON and returns a custom JSON string to use as the POST body (only for ```toPostmanCollectionPost``` and ```toPostmanEnvironmentPost```)

``` javascript
Swagger2Postman
    .convertSwagger()
    .fromFile("swagger.json")
    .toPostmanCollectionPost("https://some.web.service/api/postman/collections", {
        postJsonBuilder: (postmanCollectionJson) => {
            // postmanCollectionJson - the postman collection as JSON

            // do some things here...

            return postmanCollectionJson;
        }
    })
```

- **```prettyPrint```**: boolean which when set to true will pretty print Postman JSON output (does not apply to ```toPostmanCollection```)

``` javascript
Swagger2Postman
    .convertSwagger()
    .fromFile("swagger.json")
    .toPostmanCollection({
        prettyPrint: true
    })
```
### Options for Postman Environments ###

*These options only apply when calling ```toPostmanEnvironment[Json|File|Post]``` functions.*

- **```environment.name```**: the name of the Environment shown in Postman UI

``` javascript
Swagger2Postman
    .convertSwagger()
    .fromFile("swagger.json")
    .toPostmanEnvironment({
        environment: {
            name = "Environment Name"
        }
    })
```

- **```environment.customVariables```**: list of custom variables to add to Environment

``` javascript
Swagger2Postman
    .convertSwagger()
    .fromFile("swagger.json")
    .toPostmanEnvironment({
        environment: {
            customVariables = [{ // list of custom variables to add
                name = "accessCode",
                value = "9283928", // optional, default is blank string
                enabled = true, // optional, default is true (shows as check box in Postman UI)
                type = "text" // optional, default is text
            }]
        }
    })
```
