export const environment = {
  production: false,

  server: {
    url: 'localhost',
    port: 8080,
    signallingPath: '/peer/signal',
    baseUrl: 'http://localhost:8080',
  },

  recording: {
    enabled: false,
    mimeType: 'video/webm;codecs=vp8'
  }
};
