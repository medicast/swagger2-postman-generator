# swagger2-postman-generator #

Command Line usage

Go to [Github](https://github.com/settings/tokens) and create a github token with repo, package:read, and package:write permissions.

~/.npmrc should have these lines:
```
@medicast:registry=https://npm.registry.github.com/
//registry.npmjs.org/:_authToken=<GithubToken>
strict-ssl=false
```


``` shell
npm install @medicast/swagger2-postman-generator -g
swaggerToPostman --url=blahblah.com --swaggerFile=spec.json --tier=myTier
uploadToPostman --collectionFile=postmanCollection.json --environmentFile=postmanEnv.json --postmanKey=<key>
```
