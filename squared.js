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
        var days = 365;
        dates = dates.map(function(date) {
            var today = new Date();
            today = new Date(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
                return ((today - date)/(24*60*60*1000));
            }).map(function(diff) {
                //commits made today are (-1.0,0.0]
                return Math.floor(days - diff - 1);
            });

        //bucket dates

//        var zeros = new Array(days).
        var zeros = Array.apply(null, new Array(days)).map(Number.prototype.valueOf,0);
        var buckets = dates.reduce(function(bucks, day) {
            if (day < days) {
                bucks[day] = (bucks[day] || 0) + 1;
            }
            return bucks;
        }, zeros);

        var calendar1 = document.getElementById('calendar');
//        var calendar = document.createElement('g');

        var NS="http://www.w3.org/2000/svg";
        var calendar = document.createElementNS(NS, 'g');
        calendar.setAttribute('transform','translate(20,20)');
        calendar1.appendChild(calendar);
        var lastDayInColumn = new Date().getUTCDay();

        var currentDay = days-1;
        for (var column = Math.ceil(days/7); column >= 0; column--) {
            for (var row = lastDayInColumn; row >= 0 && currentDay >= 0; row--) {
                t++;
                var x = column*13;
                var y = row*13;
                var  bucket = buckets[currentDay];
                var transform = document.createElementNS(NS, 'g');
                transform.setAttribute('transform','translate('+x+','+y+')');

                var rect = document.createElementNS(NS,'rect');

                rect.setAttribute('class','day');
                rect.setAttribute('y','0');
                rect.setAttribute('width','11');
                rect.setAttribute('height','11');
                var color = (!bucket)?'000000':'555555';
                rect.setAttribute('style','fill: #'+color+';');
                transform.appendChild(rect);
                calendar.appendChild(transform);
                console.log(bucket || '0');
                currentDay = currentDay - 1;
            }
            lastDayInColumn = 6;
        }

        dates = buckets;

        message = dates;
        c.textContent = message;
    });
};