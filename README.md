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

Cloud Foundry Setup
-------------------
Create a file called `flowdockConfig.yml` and define your API key & organisation
like so:
```yaml
---
env:
  FLOW_ORG: xxxxxxxx
  FLOW_TOKEN: xxxxxxxx
```

Local Setup
-----------
Create a file called `flowdockConfig.js` and define your API key & organisation
like so:
```js
exports.organization = 'xxxxxxx';
exports.token = 'xxxxxxx';
```


Run the bot locally
===============
To run the bot locally from the command line, first install [lumberjack](https://github.com/jordansissel/lumberjack) then run:
`node server.js local && /opt/lumberjack/bin/lumberjack.sh -config config.json`


installing kibana dashboard
===========================
Once you have the logsearch vm running, you can install the dashboard by
 - navigating to http://localhost:4567 
 - click the `load` icon in the top
 - select `advanced`
 - upload `kibana.json` from this repo
