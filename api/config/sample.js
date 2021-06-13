module.exports = {
  server: {
    port: process.env.PORT || 8080,
    dbConnectionUri: '',
    jwtSecret: '',
  },
  aws: {
    accessKeyId: '',
    secretAccessKey: '',
    region: '',
    bucketName: '',
  }
}
