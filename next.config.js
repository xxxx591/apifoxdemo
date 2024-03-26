const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:slug*',
        // destination: 'http://127.0.0.1:8080/:slug*',
        destination: 'http://124.71.37.69:8001/:slug*',
      },
    ]
  },
}
module.exports = nextConfig
