> Git commit hooks for Apache projects: the stupid way 

Sometimes you can't do things for no good reason. When those situations arise, you do things _your own way_.

# Why?

I want git commit hooks for the Apache project I work on. I can't seem to get Apache Infra to work with me on this. So, instead, this module blindly scrape the git web frontend for Apache projects (http://git-wip-us.apache.org/repos/asf) every x minutes and fires your callback with an object hash of libraries -> shas.

It works, and I don't have to sit idly waiting for .. well, something. Win-win!

# Installation

    npm install apache-git-commit-hooks

# Usage

A function that takes two parameters:

  - a period on which to scrape, in milliseconds. Default is 30 minutes.
  - an array of project names to scrape. Defaults are the Cordova projects.

The return value is the interval timeout id, just in case you wanna clear the interval.

## Example

    var scraper = require('apache-git-commit-hooks');
    var interval_id = scraper({
        period:5000,
        libraries:['couchdb']
    }, function(shas) { 
        /* an object of libraries -> shas */
        console.log('The latest SHA from the couch git server is ' + shas['couchdb']);
    });

# License

(The MIT License)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
