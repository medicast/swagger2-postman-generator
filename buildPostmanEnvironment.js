module.exports = function (options, swaggerName) {
  let { url, tier } = options;
  tier = tier || 'local';
  console.log('swagger name', swaggerName);
  return JSON.parse(JSON.stringify({
    id: "685825e6-1261-04aa-3cb6-04c1259b0977",
    name: `${swaggerName} - ${tier}`,
    values: [
      {
        enabled: true,
        key: "url",
        value: `${url}`,
        type: "text"
      },
    ],
    timestamp: 1509563973925,
    _postman_variable_scope: "environment",
    _postman_exported_at: "2017-11-03T23:56:14.998Z",
    _postman_exported_using: "Postman/5.3.2"
  }))
}
