module.exports = function (host, port) {
  port = port || "80";
  return JSON.parse(JSON.stringify({
    id: "685825e6-1261-04aa-3cb6-04c1259b0977",
    name: "Swagger2 Environment",
    values: [
      {
        enabled: true,
        key: "scheme",
        value: "http",
        type: "text"
      },
      {
        enabled: true,
        key: "port",
        value: `${port}`,
        type: "text"
      }, 
      {
        enabled: true,
        key: "host",
        value: `${host}`,
        type: "text"
      }
    ],
    timestamp: 1509563973925,
    _postman_variable_scope: "environment",
    _postman_exported_at: "2017-11-03T23:56:14.998Z",
    _postman_exported_using: "Postman/5.3.2"
  }))
}