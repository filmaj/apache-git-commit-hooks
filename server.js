var http = require('http'),
    io = require('node.io'),
    request = require('request');

// var url = '96.49.144.164'; // office
var url = '174.6.199.53'; // home
// var port = '6969'; // office
var port = '8088';

var period = 1000 * 60 * 5;
var countdown_seconds = period / 1000;
var countdown = countdown_seconds;
var url_prefix = 'http://git-wip-us.apache.org/repos/asf?p=';
var url_suffix = '.git;a=log';
var shas = {
    'incubator-cordova-android':null,
    'incubator-cordova-ios':null,
    'incubator-cordova-mobile-spec':null
};

var html_template = '<html><head></head><body><h1>apache git commit pinger for ghetto cordova commit hooks</h1>';
html_template    += '<h2><span id="countdown">{countdown}</span> seconds left til refresh</h2>';
html_template    += '<h3>latest SHAs for tracked projects</h3>';
for (var lib in shas) if (shas.hasOwnProperty(lib)) {
    html_template+= '<p><b>' + lib + '</b>:&nbsp;<a href="https://git-wip-us.apache.org/repos/asf?p=' + lib + '.git;a=commit;h={'+lib+'}">{'+lib+'}</a></p>';
};
html_template    += '<script type="text/javascript">var start = ' + countdown_seconds + '; setInterval(function() { var el = document.getElementById("countdown");var remaining = parseInt(el.innerText); remaining--; if (remaining < 0) remaining = start; el.innerText = remaining; }, 1000);</script>';
html_template    += '</body></html>';

String.prototype.format = function(map) {
    var s = this;
    for (var token in map) s = s.replace(new RegExp("\{"+token+"\}","gi"), map[token]);
    return s;
};

var query = function() {
    countdown = countdown_seconds;
    var should_post = false;
    var post_data = {};
    var counter = 0;
    var end = function() {
        if (++counter == 3) {
            if (should_post) {
                // compose a POST and fire it off to our CI server!
                console.log('issuing request');
                request.post({
                    uri:'http://' + url + ':' + port +'/commit',
                    body:JSON.stringify(post_data)
                }, function(error, response, body) {
                    if (error) console.log('holy shit there was an error sending POST to ' + url + ': ' + error);
                    if (response.statusCode >= 200 && response.statusCode < 300) console.log('successfully posted results at ' + new Date());
                    else console.log('received bad response code at ' + new Date());
                });
            }
        }
    };
    for (var repo in shas) if (shas.hasOwnProperty(repo)) {
        (function(lib) {
            io.scrape(function() {
                this.getHtml(url_prefix + lib + url_suffix, function(err, $) {
                    var href = $('.title_text .log_link a').first().attribs.href;
                    var latest_sha = /;h=([a-z0-9]*)$/.exec(href)[1];
                    if (shas[lib] != latest_sha) {
                        console.log('New commit for ' + lib + ' (' + latest_sha + ').');
                        should_post = true;
                        post_data[lib] = latest_sha;
                        shas[lib] = latest_sha;
                    }
                    end();
                });
            });
        })(repo);
    }
};

query();
var iv = setInterval(query, period);
var cd_iv = setInterval(function() {
    countdown--;
}, 1000);

http.createServer(function (req, res) {
    var data = {
        countdown:countdown
    };
    for (var lib in shas) if (shas.hasOwnProperty(lib)) {
        data[lib] = shas[lib];
    }
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write(html_template.format(data));
    res.end();
}).listen(8899);

console.log('> http server has started on port 8899');
