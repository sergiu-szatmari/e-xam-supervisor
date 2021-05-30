export const environment = {
  production: false,

  server: {
    url: 'localhost',
    port: 8080,
    path: '/signal',
    uploadUrl: 'http://localhost:8080/upload'
  },

  recording: {
    enabled: true,
    mimeType: 'video/webm;codecs=vp8'
  }
};
