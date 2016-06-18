# Rage Meter API

### Description

Used to troll in our team, decide to make a little API to integrate in our dev tools!
Today only in mem and with mocks.

### Features

Someone is on rage ? Vote for him to increase his level !!
Two votes are necessary to make his rage level up, also a cooldown
of 5 minutes between each vote.

### Services

[API](api.html) : generated with raml2html
[RAML](api.raml)

```
npm install
node index.js
```

### TODO

- reset on daily basis
- widget
- use database
- admin section security
- configuration (rage limits, cooldown, number of votes etc)