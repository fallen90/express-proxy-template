let express = require('express'),
    request = require('request'),
    cheerio = require('cheerio'),
    package = require('./package.json'),
    minify = require('html-minifier').minify,
    proxy = require('proxy-express'),
    cache = require('apicache').middleware,
    argv = require('minimist')(process.argv.slice(2)),
    path = require('path'),
    app = express(),
    url = require('url'),
    _ = require('underscore'),
    server = '',
    protocol = '',
    proxied_site = 'm.wuxiaworld.com';

app.use(require('compression')({ level: 9 }));
app.use(function(req, res, next) {
    server = req.get('host');
    protocol = req.protocol;
    next();
});

app.use(cache('1 minute'));
app.use(proxy(proxied_site, {
    request: {
        forceHttps: true,
        followRedirects: true,
        headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.8; rv:24.0) Gecko/20100101 Firefox/24.0',
            'Host': proxied_site,
            'Referer': 'http://' + proxied_site,
        }
    },
    post: function(proxyObj, callback) {
        // proxyObj contains 
        // { 
        //   req      : Object // express request 
        //   res      : Object // express request 
        //   proxyObj : Object // object used in the 'request' module request 
        //   result   : { 
        //     response : Object, // response object from the proxied request 
        //     body     : Mixed // response body from the proxied request 
        //   } 
        // } 
        console.log('ContentType', proxyObj.result.response.headers['Content-Type']);
        try {

            var $ = cheerio.load(proxyObj.result.body);
            proxyObj.result.body = minify($.html(), {
                html5: true,
                removeAttributeQuotes: true,
                removeTagWhitespace: true,
                removeScriptTypeAttributes: true,
                removeComments: true,
                collapseWhitespace: true,
                minifyURLs: true,
                minifyJS: true,
                minifyCSS: true,
                removeStyleLinkTypeAttributes: true
            });

            return callback();

        } catch (ex) {

            return callback();

        }
    }
}));

console.log('Application Listening at', '0.0.0.0:' + '8888');
app.listen(8888, '0.0.0.0');
