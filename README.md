logsearch-flowdock-bot
======================

Monitor Flowdock and pull in flow related info which gets shipped in to LogSearch.

Events are stored in log file `flowdock.log` which can then be read as an input
to LogSearch. Flowdock api is called once every 5 minutes

install
=======
from shell run `npm install`
`$npm install`

Create a file caled `flowdockConfig.js` and define in your API key, organisation
and flow like so:
```js
exports.token = 'xxxxxxxx';
exports.flow = 'xxxxxxxx';
exports.organisation = 'xxxxxxxx';
```

run bot
=======
`node server.js`
