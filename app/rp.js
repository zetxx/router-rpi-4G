var rp = require('request-promise');

rp({
    uri: 'http://data.vivacom.bg',
    headers: {
        'Accept-Encoding': 'gzip'
    },
    gzip: true
})
.then((r) => {
    console.log(Buffer.from(r).length)
    debugger;
});
