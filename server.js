var http = require('http'),
    io = require('node.io');

var period = 1000 * 60 * 5;
var countdown_seconds = period / 1000;
var countdown = countdown_seconds;

var html_template = '<html><head></head><body><h1>apache git commit pinger for ghetto cordova commit hooks</h1>';
html_template    += '<h2><span id="countdown">{countdown}</span> seconds left til refresh</h2>';
html_template    += '<script type="text/javascript">var start = ' + countdown_seconds + '; setInterval(function() { var el = document.getElementById("countdown");var remaining = parseInt(el.innerText); remaining--; if (remaining < 0) remaining = start; el.innerText = remaining; }, 1000);</script>';
html_template    += '</body></html>';

String.prototype.format = function(map) {
    var s = this;
    for (var token in map) s = s.replace(new RegExp("\{"+token+"\}","gi"), map[token]);
    return s;
};

var url_prefix = 'http://git-wip-us.apache.org/repos/asf?p=';
var url_suffix = '.git;a=log';
var shas = {
    'incubator-cordova-android':null
};
var query = function() {
    countdown = countdown_seconds;
    var post_data = {};
    var should_post = false;
    for (var repo in shas) if (shas.hasOwnProperty(repo)) {
        (function(lib) {
            io.scrape(function() {
                this.getHtml(url_prefix + lib + url_suffix, function(err, $) {
                    var href = $('.title_text .log_link a').first().attribs.href;
                    var latest_sha = /;h=([a-z0-9]*)$/.exec(href)[1];
                    if (shas[lib] != latest_sha) {
                        should_post = true;
                        post_data[lib] = latest_sha;
                        shas[lib] = latest_sha;
                    }
                });
            });
        })(repo);
    }
    if (should_post) {
        // compose a POST and fire it off to our CI server!
    }
};

query();
var iv = setInterval(query, period);
var cd_iv = setInterval(function() {
    countdown--;
}, 1000);

http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.write(html_template.format({
      countdown:countdown
  }));
  res.end();
}).listen(8899);

console.log('> http server has started on port 8899');
