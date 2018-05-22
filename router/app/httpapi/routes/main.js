module.exports = (server) => (server.route({
    method: 'GET',
    path: '/',
    handler: () => 'Hello, this is main route, it is for test purpose only!'
}));
