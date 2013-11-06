logsearch-flowdock-bot
======================

Monitor Flowdock and pull in flow related info which gets shipped in to LogSearch.

Events are stored in log file `flowdock.log` which can then be read as an input
to LogSearch. Flowdock api is called once every 5 minutes

install
=======
Clone this repo into your [Logsearch](https://github.com/cityindex/) 
installation:
```
cd logsearch/example
git clone https://github.com/cityindex/logsearch-flowdock-bot
```

Install nodejs dependencies
```
cd logsearch-flowdock-bot
$npm install
```

Create a file caled `flowdockConfig.js` and define your API key, organisation
and flow like so:
```js
exports.token = 'xxxxxxxx';
exports.flow = 'xxxxxxxx';
exports.organisation = 'xxxxxxxx';
```

run bot
=======
`node server.js`

run lumberjack
==============
Make sure the [logsearch vm is running](https://github.com/cityindex/logsearch/wiki/Quick-Start-Guide)
Then from within the `logsearch-flowdock-bot` repo, run:
`/opt/lumberjack/bin/lumberjack.sh -config config.json`

installing kibana dashboard
===========================
Once you have the logsearch vm running, you can install the dashboard by
 - navigating to http://localhost:4567 
 - click the `load` icon in the top
 - select `advanced`
 - upload `kibana.json` from this repo
