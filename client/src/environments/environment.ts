export const environment = {
  production: false,

  server: {
    url: 'localhost',
    port: 8080,
    path: '/signal',
    baseUrl: 'http://localhost:8080',
  },

  recording: {
    enabled: true,
    mimeType: 'video/webm;codecs=vp8'
  }
};
