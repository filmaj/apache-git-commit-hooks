var io = require('node.io'),
    request = require('request');

var period = 1000 * 60 * 30; // 30 min default  interval period
var url_prefix = 'http://git-wip-us.apache.org/repos/asf?p=';
var url_suffix = '.git;a=log';
var shas = {
    'incubator-cordova-android':null,
    'incubator-cordova-ios':null,
    'incubator-cordova-mobile-spec':null,
    'incubator-cordova-blackberry-webworks':null
};

function scrape(callback) {
    var new_shas = {};
    var has_new_sha = false;
    var counter = 0;
    var end = function() {
        if (++counter == 4) {
            if (has_new_sha) callback(new_shas);
            else callback(null);
        }
    };
    for (var repo in shas) if (shas.hasOwnProperty(repo)) {
        (function(lib) {
            io.scrape(function() {
                this.getHtml(url_prefix + lib + url_suffix, function(err, $) {
                    var href = $('.title_text .log_link a').first().attribs.href;
                    var latest_sha = /;h=([a-z0-9]*)$/.exec(href)[1];
                    if (shas[lib] != latest_sha) {
                        has_new_sha = true;
                        new_shas[lib] = latest_sha;
                        shas[lib] = latest_sha;
                    }
                    end();
                });
            });
        })(repo);
    }
}
module.exports = function apache_git_commit_hooks(config, callback) {
    // configurable period
    if (config && config.period) period = config.period;

    // fire off the scraping immediately
    scrape(callback);

    // create an interval for the scrape and return the interval id
    return setInterval(function() {
        scrape(callback);
    }, period);
};
