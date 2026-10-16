module.exports = {
  htmlLimitedBots: /.*/,
  allowedDevOrigins: ['192.168.2.118', "192.168.2.167", '192.168.2.120', '192.168.2.214', "192.168.2.215", '192.168.2.200', '192.168.2.166', '192.168.2.169', "192.168.2.159", "127.0.0.1"],
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '192.168.2.120',
        port: '2500',
        pathname: '/media/**',
      },
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: '**' },
    ],
  },
}