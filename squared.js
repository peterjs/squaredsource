window.onload = function(e) {


    //peter-mbp:squaredsource peter$ /opt/local/bin/git --version
    //git version 1.8.3.1
    //peter-mbp:squaredsource peter$ /usr/bin/git --version
    //git version 1.7.5.4
    //require at least git 1.8.3.1

    var which = require('./lib/which.js');
//    var gitExeFilename55 = which.sync('git');
//    var exec = require('child_process').exec;
//    console.log('giiiiiiiiiiiiiit ' + gitExeFilename55);
//
//    function checkVersion (git) {
//        var match = git.match(/^git version ([0-9]*).([0-9]*)/);
//        return match[1] == 1 && match[2] >= 8;
//    }
//
//    //creates an EventStream that delivers the given series of values to the first subscriber
//    var executables = Bacon.fromArray(gitExeFilename55);
//    var versions = executables.flatMap(function (ex) {return Bacon.fromNodeCallback(exec, ex + ' --version').filter(checkVersion).map(function(ver) {return {executable:ex, version:ver}});});
////    versions.log('versions ');
//    //.filter(function(git){return git.hasOwnProperty('version');}).
//
//    versions.onValue(function(val) {console.log ('AAAAAAAAAA ' + val['executable'] + ' veeer ' + val['version'] );});
//    pick the first git with sufficiently high version
//    var gitExeFilename = '/opt/local/bin/git';
//    console.log('found git: ' + gitExeFilename);
//var which = require('which');

    //var gitExeFilename = '/opt/local/bin/git';
    var gitExeFilename = '';
    var exec = require('child_process').exec;
//    console.log('giiiiiiiiiiiiiit ' + gitExeFilename55);

    function parseGitVersion(gitReturnVal) {
//        var match = git.match(/^git version ([0-9]*).([0-9]*)/);
//        return match[1] == 1 && match[2] >= 8;
        var match = gitReturnVal.match(/^git version ([0-9]*).([0-9]*).([0-9]*).([0-9]*)/);
        //remove the 0th element, which is the original string - i.e. rest
        return match?match.slice(1,match.length):false;
    }

    function checkGitVersion(gitVersion) {
        return gitVersion[0] == 1 && gitVersion[1] >= 8;
    }

    var gitExeFilenameArray = which.sync('git');

    var callbacksCount = 0;
    var inited = false;

    gitExeFilenameArray.forEach(function(execPath) {
        exec(execPath + ' --version', function(error, val) {
            callbacksCount = callbacksCount + 1;
            console.log('callbacksCount ' + callbacksCount);
            if (checkGitVersion(parseGitVersion(val))) {
                gitExeFilename = gitExeFilename || execPath;
            }
            if (gitExeFilename && !inited) {
                console.log('gitExeFilename ' + gitExeFilename + ' count ' + callbacksCount);
                foo(gitExeFilename);
                inited = true;
            }
        });
    });


function foo(gitExecPath){
    var fs = require('fs');
    var gw = require('./lib/gitWrapper');
    gw.setGit(gitExecPath);

    var t = function(x) {return x;};
    var toBool = function(x) {if (x) {return true;} else {return false;}};
    var isString = function(obj) {
        var toString = Object.prototype.toString;
        var test = (toString.call(obj) == '[object String]');
        console.log('testing ' + test + ' ' + obj);
        return toString.call(obj) == '[object String]';
    };
    var first = function(a,b){return a;};
    var not = function(x) {
        return function(arg) {
            return !x.call(arg);
        }
    };
    var getUserHome = function() {
        return process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
    };

    function textFieldValue(textField) {
        var textFieldEvenetStream = Bacon.fromEventTarget(textField, 'keyup');
        return textFieldEvenetStream.map(function(event) {
            return event.target.value;
        });
    }

    function SquaredModel() {
        //public in
        this.repoAdded = new Bacon.Bus();
        this.user = new Bacon.Bus();
        this.repoRemoved = new Bacon.Bus();

        function addRepo (newRepo) {return function (repos) {return repos.concat([newRepo]);};}
        function removeRepo (repoToRemove) {return function (repos) {return repos.filter(function(r) {return r !== repoToRemove;});}}
        var modifications = this.repoAdded.map(addRepo).merge(this.repoRemoved.map(removeRepo));
        //public out
        this.allRepos = modifications.scan([], function (repos, modification) {return modification(repos);});
        this.userProp = this.user.toProperty();

        var changes;

        //this.repoAdded.log('repo added: ');
        this.user.log('user added: ');
        this.userProp.log('user property: ');

        //persistence
        var read = Bacon.fromNodeCallback(fs.readFile, getUserHome() + '/.squaredsource/state.json');
        read.onError(function(error) {console.log("Error loading saved repositories: " + error);});
        //on error, no values are passed here
        //TODO add checking valid git repo to repoAdded
        //TODO replace isString with git repo check... or check this.repoAdded

        function useDefVal (defVal) {
            return function (val) {
                if (val.length === 0) {
                    return defVal;
                } else {
                    return val;
                }
            };
        }

        this.repoAdded.plug(read.map(useDefVal("{\"repos\":[]}")).map(JSON.parse).flatMap(function(reposArray){return Bacon.fromArray((reposArray['repos']).filter(isString));}));
        this.user.plug(read.map(useDefVal("{\"user\":\"username\"}")).map(JSON.parse).map(function(state){return state['user'];}));

        var persist = Bacon.combineTemplate({
            repos: this.allRepos.sampledBy(modifications,first),
            user: this.userProp
        }).map(JSON.stringify).onValue(function(reposJSON) {
                var dir = getUserHome() + '/.squaredsource/';
                var checkDir = Bacon.fromCallback(fs.exists, dir);
                checkDir.flatMap(function(dirContent) {
                    if (!!dirContent) {
                        return Bacon.once(true);
                    } else {
                        return Bacon.fromNodeCallback(fs.mkdir, dir);
                    }
                }).onValue(function(a) {
                        var write = Bacon.fromNodeCallback(fs.writeFile, dir + 'state.json', reposJSON);
                        write.onError(function(err) {console.log('saving failed ' + err);});
                    });
            });
    }

    function RepositoryCalendarView(path, model) {
        var colormap = function() {
            //colorbrewer2.org
            var colors = [[241,238,246], [189,201,225], [116,169,207], [42,140,190], [4,90,141]];
            var hexColors = colors.map(function (c) {
                return c.reduce(function (hexColor, val) {
                    var hexVal = val.toString(16);
                    if (val < 16) {hexVal = '0' + hexVal;}
                    return hexColor + hexVal;
                }, '#');
            });
            return hexColors;
        };

        var getColor = function(val, min, max, colormap) {
            if (max-min <= 0) {
                max = 100;
                min = 0;
            }
            var colorMapMax = colormap.length-1;
            return colormap[Math.ceil(val/(max-min)*colorMapMax)];
        };

        var element = document.createElement('div');

        var cal = model.userProp.combine(Bacon.once(), first).flatMapLatest(function(user) {
            return Bacon.fromNodeCallback(gw.log, path).map(function(logs) {
                while (element.firstChild) {
                    element.removeChild(element.firstChild);
                }
                var c = document.getElementById('c');
                c.textContent = "hello";
                logs = logs.filter(function(log) {return (log.hasOwnProperty('author') && (log.author.indexOf(user) === 0));});
                //use (var x in a) rather than (x in a) - don't want to create a global
                var dates = logs.map(function(log) {return log.authorDate;});
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

                var NS="http://www.w3.org/2000/svg";
                var calendarSvgElem = document.createElementNS(NS,'svg');
                element.appendChild(calendarSvgElem);

                calendarSvgElem.setAttribute('width', '784');
                calendarSvgElem.setAttribute('height', '110');

                var minBuckets = Math.min.apply(null, buckets);
                var maxBuckets = Math.max.apply(null, buckets);

                var calendar = document.createElementNS(NS, 'g');
                calendarSvgElem.appendChild(calendar);
                element.appendChild(calendarSvgElem);

                calendar.setAttribute('transform','translate(20,20)');

                var lastDayInColumn = new Date().getUTCDay();
                var currentDay = days-1;
                for (var column = Math.ceil(days/7); column >= 0; column--) {
                    for (var row = lastDayInColumn; row >= 0 && currentDay >= 0; row--) {
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
                        color = getColor(bucket,minBuckets,maxBuckets,colormap());
                        rect.setAttribute('style','fill: '+color+';');
                        transform.appendChild(rect);
                        calendar.appendChild(transform);
                        //                        console.log(bucket || '0');
                        currentDay = currentDay - 1;
                    }
                    lastDayInColumn = 6;
                }

                c.textContent = buckets;
            });
        });
        this.element = element;
        cal.onValue(function(val){});
    }

    function RepositoryHeaderView(path, model) {
        var element = document.createElement('div');
        var button = document.createElement('input');
        button.setAttribute('type','button');
        button.setAttribute('value','remove');
        button.setAttribute('id', path);
        element.appendChild(button);

        var removeEventStream = Bacon.fromEventTarget(button, 'click').map('.target').map('.id');
        removeEventStream.log('remove ');

        model.repoRemoved.plug(removeEventStream);


        this.element = element;
    }

    function RepositoryListView(repoListElem, model) {
        function addRepo(repo) {
            console.log('adding repo ' + repo);

            var listElem = document.createElement('ul');
            var repoElem = document.createElement('li');
            var repoHeader = new RepositoryHeaderView(repo, model);
            var repoCalendarView = new RepositoryCalendarView(repo, model);

            listElem.setAttribute('id',repo);
            repoElem.textContent = repo;

            repoListElem.appendChild(listElem);
            listElem.appendChild(repoElem);
            listElem.appendChild(repoHeader.element);
            listElem.appendChild(repoCalendarView.element);
        }

        function removeRepo(repo) {
            _.each(_.filter(repoListElem.children, function(elem) {return elem.id === repo;}), function(elem) {elem.remove();});
        }

        model.repoAdded.onValue(addRepo);
        model.repoRemoved.onValue(removeRepo);

        //        var repaint = model.repoDeleted;
        //        repaint.onValue(render);
    }

    function OmniboxView(folder) {
        folder.onValue(function(f){
            //from end to last / or \
           console.log('repo stem ' + f.match(/.*[\\/]/));
        });
    }

    function AddNewRepositoryView(model) {

        var repoTextField = document.getElementById('repos');
        var repo = textFieldValue(repoTextField).toProperty('.').skipDuplicates();
        //repo add / - on different platforms as last character

        var isValidFoldersReposFsExists = repo.flatMapLatest(function(path){
            return Bacon.fromCallback(fs.exists, path);
        });

        var isValidFoldersReposGetStatus = repo.sampledBy(isValidFoldersReposFsExists.filter(t)).flatMapLatest(function(path){
            return Bacon.fromNodeCallback(gw.getStatus, path);
        }).map(toBool).mapError(function(a){return false;}).toProperty(false);

        var isValidFoldersRepos = isValidFoldersReposFsExists.toProperty(false).and(isValidFoldersReposGetStatus);

        isValidFoldersRepos.onValue(function (valid) {
            var repoElement = document.getElementById('repos');
            if (valid) {
                repoElement.setAttribute('style', 'background-color: #f1eef6; border: 1px solid #bdc9e1; color: #434343;');
            } else {
                repoElement.setAttribute('style', 'background-color: #f8ccd6; border: 1px solid #bdc9e1; color: #434343;');
            }
        });

        var addButton = document.getElementById('addButton');
        var addEventStream = Bacon.fromEventTarget(addButton, 'click');
        var enterEventStream = Bacon.fromEventTarget(repoTextField, 'keydown').filter(function (key) {return (key.keyCode === 13);}).map(true);

        addEventStream = addEventStream.merge(enterEventStream);

        //a.sampledBy(b, function);
        //Like combine, but only outputs a new value on a new value to the b stream.
        //filter - use only true values
        //stream.map(property) maps the stream events to the current value of the given property. This is equivalent to property.sampledBy(stream).
        var repoListStream = isValidFoldersRepos.sampledBy(addEventStream).filter(function (a) {return a;}).map(repo);

        var addedReposProp = repoListStream.scan([], function(oldRepos, newRepo) {
            //push returns the length of the array, concat returns the new array
            return oldRepos.indexOf(newRepo)>=0?oldRepos:oldRepos.concat([newRepo]);
        });


        var omnibox = new OmniboxView(repo);

        model.repoAdded.plug(repoListStream);
    }

    function UserFilterView(model) {
        var userTextField = document.getElementById('user');
        model.userProp.combine(Bacon.once(), first).onValue(function(val)
        {
            userTextField.setAttribute('value', val);
        });
        var user = textFieldValue(userTextField).skipDuplicates();
        model.user.plug(user);
        model.user.push(userTextField.getAttribute('value'));
    }

    //    model.repoAdded.push('test string');
    //    model.repoAdded.push(4);

    function SquaredApp() {
        var model = new SquaredModel();
        //        model.repoAdded.plug(repoListStream);
        var repoListElem = document.getElementById('repo_list');
        var repoListView = new RepositoryListView(repoListElem,model);
        var filterView = new UserFilterView(model);
        var addRepoView = new AddNewRepositoryView(model);
    }

    new SquaredApp();
}
};
