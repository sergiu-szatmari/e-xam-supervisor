module.exports = {
  server: {
    port: process.env.PORT || 8080,
    dbConnectionUri: '',
    jwtSecret: '',
    isRecordingEnabled: false,
  },
  aws: {
    accessKeyId: '',
    secretAccessKey: '',
    region: '',
    bucketName: '',
  }
}
