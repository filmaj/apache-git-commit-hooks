var http = require('http'),
    io = require('node.io');

var html_template = '<html><head></head><body><h1>apache git commit pinger for ghetto cordova commit hooks</h1>';
html_template    += '<h2>{countdown} seconds left til refresh</h2>';
html_template    += '</body></html>';

String.prototype.format = function(map) {
    var s = this;
    for (var token in map) s = s.replace(new RegExp("\{"+token+"\}","gi"), map[token]);
    return s;
};

console.log(html_template.format({countdown:12}));

return;

var period = 1000 * 60 * 30;
var countdown_seconds = period / 1000;
var countdown = countdown_seconds;
var url_prefix = 'http://git-wip-us.apache.org/repos/asf?p=';
var url_suffix = '.git;a=log';
var shas = {
    'incubator-cordova-android':null
};
var query = function() {
    countdown = countdown_seconds;
    for (var repo in shas) if (shas.hasOwnProperty(repo)) {
        io.scrape(function() {
            this.getHtml(url_prefix + repo + url_suffix, function(err, $) {
                var href = $('.title_text .log_link a').first().attribs.href;
                var latest_sha = /;h=([a-z0-9]*)$/.exec(href)[1];
                if (shas[repo] != latest_sha) {
                    // notify!
                }
            });
        });
    }
};

query();
var iv = setInterval(query, period);
var cd_iv = setInterval(function() {
    countdown--;
}, 1000);

http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.write(html_template.replace(/[[]]/, '<h2>'+countdown+' seconds left til refresh</h2><h3></h3>'));
  res.end();
}).listen(8899);

console.log('> http server has started on port 8899');
