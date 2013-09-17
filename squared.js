window.onload = function(e) {
//    peter-mbp:squaredsource peter$ /opt/local/bin/git --version
//    git version 1.8.3.1
//    peter-mbp:squaredsource peter$ /usr/bin/git --version
//    git version 1.7.5.4
//require at least git 1.8.3.1

    var which = require('which');
//    var gitExeFilename = which.sync('git');
    var gitExeFilename = '/opt/local/bin/git';
    console.log('found git: ' + gitExeFilename);

    var gw = require('./lib/gitWrapper');

    var c = document.getElementById('c');
    c.textContent = "hello";

    gw.log(".", function(err, logs) {
        console.log(logs);
        var message = '';
        //use (var x in a) rather than (x in a) - don't want to create a global
        //All objects in JS are associative
        var dates = [];
        for (var m in logs) {
            dates.push(logs[m].authorDate);
        }
        //filter undefined
        dates = dates.filter(function(d){ return d;});
        //months are 0-11
        dates = dates.map(function(date) {
            var today = new Date();
            today = new Date(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
                return ((today - date)/(24*60*60*1000));
            }).map(function(diff) {
                //commits made today are (-1.0,0.0]
                return Math.floor(365 - diff - 1);
            });

        //bucket dates
        var buckets = dates.reduce(function(bucks, day) {
            if (day < 365) {
                bucks[day] = (bucks[day] || 0) + 1;
            }
            return bucks;
        }, []);

        dates = buckets;

        message = dates;
        c.textContent = message;
    });
};