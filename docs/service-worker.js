"use strict";var precacheConfig=[["/react-rpg/index.html","9e42145e19b996e977820d76c7348935"],["/react-rpg/static/css/main.3830376f.css","2c8c52b99c42afdca39c89f2f9b8e1a4"],["/react-rpg/static/js/main.ef24ceaf.js","86144f04a4917162a22c47be22a60158"],["/react-rpg/static/media/Cup and Talon.6ef15b77.ttf","6ef15b77d8a641fe42932860a1821d61"],["/react-rpg/static/media/archer.8c6dcaed.png","8c6dcaedefadad6c05d44137b5e79a51"],["/react-rpg/static/media/armor.9cde3569.png","9cde3569925d9502b0f846d720552651"],["/react-rpg/static/media/backpack.933b2ea7.png","933b2ea71909fee42b86373c8ca18a18"],["/react-rpg/static/media/bat1.81fbd056.png","81fbd0566147abf56c4e0fc549f94985"],["/react-rpg/static/media/battle_bg.9ae3f937.jpg","9ae3f9370f602132e9af35cc537c6205"],["/react-rpg/static/media/beetle1.b991493d.png","b991493d2bf57a2df1ed58ef6009e6f1"],["/react-rpg/static/media/bite_attack.b6db250b.wav","b6db250b877885276dc256a284be4707"],["/react-rpg/static/media/boss1.34bfb467.png","34bfb4676411c8f2dfe7438e6f3cde6c"],["/react-rpg/static/media/boss1_attack.8f241a00.wav","8f241a000c5b16d466a9d2b67295e4ad"],["/react-rpg/static/media/bottle.1f413174.wav","1f4131749822833394065c503a959d5e"],["/react-rpg/static/media/bow.9bb2e184.png","9bb2e18419cb87a1da4687be2cfd71a3"],["/react-rpg/static/media/bow_attack.6c149142.wav","6c149142addcb88260b8c3bb139d80a1"],["/react-rpg/static/media/bubble.c7463dc9.wav","c7463dc9ab244159eee19fefaa79f1bb"],["/react-rpg/static/media/coin.a36bdfa9.wav","a36bdfa96f06a28525be48fed6d3ea4c"],["/react-rpg/static/media/dash.bddd641d.svg","bddd641da92cb1347723af16e13e90f9"],["/react-rpg/static/media/dungeon.9b7a94d1.jpg","9b7a94d15c33001ccd9779daf7868902"],["/react-rpg/static/media/fireball.0bbf5d67.svg","0bbf5d67fb1bb85e1efbb9da6719991a"],["/react-rpg/static/media/hammer.4e573b17.png","4e573b17b2067143b648f9e3b84cea80"],["/react-rpg/static/media/hand.91930fd4.svg","91930fd4b17ba9f17a76c918b910a277"],["/react-rpg/static/media/healing.61318d23.svg","61318d231fd4431850ef634de583d98f"],["/react-rpg/static/media/helmet.3bf80825.png","3bf8082590d85e8d1fefce700943be1c"],["/react-rpg/static/media/hills.3bf330e9.png","3bf330e9a10e219680b2a003b02e5793"],["/react-rpg/static/media/hollow01.172d4679.png","172d4679155be4c678089e1e41b74185"],["/react-rpg/static/media/hollow02.96eb8517.png","96eb8517812d09a9b4b942b47cb29804"],["/react-rpg/static/media/hollow03.5bc3b49e.png","5bc3b49ec65263f5e5a9cb5103b5654b"],["/react-rpg/static/media/hollow04.08f98aad.png","08f98aad754a71f0d1dd74e8f93894d8"],["/react-rpg/static/media/hollow05.ac188f89.png","ac188f891c0c90bf04f8d00162b60899"],["/react-rpg/static/media/hollow06.78bde493.png","78bde49364153432879b237d88d2d544"],["/react-rpg/static/media/hollow07.c34f2e65.png","c34f2e654869178d418d83946285a954"],["/react-rpg/static/media/hollow08.9b744667.png","9b744667802b74200a3a10e6280717bb"],["/react-rpg/static/media/hollow09.f10fe639.png","f10fe6390607446294d76e687e6f6951"],["/react-rpg/static/media/knight.0c8b88c0.png","0c8b88c01eb80f263db99876587acd17"],["/react-rpg/static/media/metal-ringing.c66898f0.wav","c66898f089e522f18a4d145ed89d7f45"],["/react-rpg/static/media/ogre1.180bbe7f.png","180bbe7fd865f7f8f60887f3b60c4d16"],["/react-rpg/static/media/ogre_attack.6257bd4c.wav","6257bd4cdc21e7cd4f69d21f688e814a"],["/react-rpg/static/media/ogre_damage.a731e928.wav","a731e9285e208f33101e6aaf2e56477e"],["/react-rpg/static/media/potionBlue.0b0e78cb.png","0b0e78cb9327f52f83e908c67dec0dcf"],["/react-rpg/static/media/potionGreen.84386c4d.png","84386c4d42db4a6d7ad7bad277289caa"],["/react-rpg/static/media/potionRed.33d0b0b8.png","33d0b0b88e839e407baf60a5cf38ed0e"],["/react-rpg/static/media/random1.cc4376aa.wav","cc4376aaa2ed797bbb5920c1fd3fa2d5"],["/react-rpg/static/media/shieldSmall.3deed664.png","3deed664f4c7cf7192e04f17e4447ea9"],["/react-rpg/static/media/slime1.5bc2f0ff.png","5bc2f0ff7f3229471896bc6f86811e4c"],["/react-rpg/static/media/slime_attack.ec56c0ae.wav","ec56c0aeba1f9d8b78b53d5d5644523a"],["/react-rpg/static/media/spell.506f0c01.wav","506f0c015dea581840c470e7d91bad75"],["/react-rpg/static/media/staff_attack.e8352bb6.wav","e8352bb689d55486ba5b93c7bd016132"],["/react-rpg/static/media/sword-skill1.e59bb71c.svg","e59bb71c1e5d1a85588904ddcca976e1"],["/react-rpg/static/media/swordWood.f8b0ea53.png","f8b0ea533e6d2820e2f33eddfc3691dd"],["/react-rpg/static/media/sword_attack.037cf920.wav","037cf920489132438466ebc2762e2171"],["/react-rpg/static/media/town.c310cd70.jpg","c310cd707cdb1e56a05600a46c563412"],["/react-rpg/static/media/victory.e5734919.mp3","e57349191baf1348eadae06b681f9cf6"],["/react-rpg/static/media/wand.5e95414d.png","5e95414d199fd2c55d8797cc373e70a6"],["/react-rpg/static/media/wizard.9233b622.png","9233b62252ff2b0c7d925d34b72924c4"]],cacheName="sw-precache-v3-sw-precache-webpack-plugin-"+(self.registration?self.registration.scope:""),ignoreUrlParametersMatching=[/^utm_/],addDirectoryIndex=function(e,a){var t=new URL(e);return"/"===t.pathname.slice(-1)&&(t.pathname+=a),t.toString()},cleanResponse=function(a){return a.redirected?("body"in a?Promise.resolve(a.body):a.blob()).then(function(e){return new Response(e,{headers:a.headers,status:a.status,statusText:a.statusText})}):Promise.resolve(a)},createCacheKey=function(e,a,t,c){var r=new URL(e);return c&&r.pathname.match(c)||(r.search+=(r.search?"&":"")+encodeURIComponent(a)+"="+encodeURIComponent(t)),r.toString()},isPathWhitelisted=function(e,a){if(0===e.length)return!0;var t=new URL(a).pathname;return e.some(function(e){return t.match(e)})},stripIgnoredUrlParameters=function(e,t){var a=new URL(e);return a.hash="",a.search=a.search.slice(1).split("&").map(function(e){return e.split("=")}).filter(function(a){return t.every(function(e){return!e.test(a[0])})}).map(function(e){return e.join("=")}).join("&"),a.toString()},hashParamName="_sw-precache",urlsToCacheKeys=new Map(precacheConfig.map(function(e){var a=e[0],t=e[1],c=new URL(a,self.location),r=createCacheKey(c,hashParamName,t,/\.\w{8}\./);return[c.toString(),r]}));function setOfCachedUrls(e){return e.keys().then(function(e){return e.map(function(e){return e.url})}).then(function(e){return new Set(e)})}self.addEventListener("install",function(e){e.waitUntil(caches.open(cacheName).then(function(c){return setOfCachedUrls(c).then(function(t){return Promise.all(Array.from(urlsToCacheKeys.values()).map(function(a){if(!t.has(a)){var e=new Request(a,{credentials:"same-origin"});return fetch(e).then(function(e){if(!e.ok)throw new Error("Request for "+a+" returned a response with status "+e.status);return cleanResponse(e).then(function(e){return c.put(a,e)})})}}))})}).then(function(){return self.skipWaiting()}))}),self.addEventListener("activate",function(e){var t=new Set(urlsToCacheKeys.values());e.waitUntil(caches.open(cacheName).then(function(a){return a.keys().then(function(e){return Promise.all(e.map(function(e){if(!t.has(e.url))return a.delete(e)}))})}).then(function(){return self.clients.claim()}))}),self.addEventListener("fetch",function(a){if("GET"===a.request.method){var e,t=stripIgnoredUrlParameters(a.request.url,ignoreUrlParametersMatching),c="index.html";(e=urlsToCacheKeys.has(t))||(t=addDirectoryIndex(t,c),e=urlsToCacheKeys.has(t));var r="/react-rpg/index.html";!e&&"navigate"===a.request.mode&&isPathWhitelisted(["^(?!\\/__).*"],a.request.url)&&(t=new URL(r,self.location).toString(),e=urlsToCacheKeys.has(t)),e&&a.respondWith(caches.open(cacheName).then(function(e){return e.match(urlsToCacheKeys.get(t)).then(function(e){if(e)return e;throw Error("The cached response that was expected is missing.")})}).catch(function(e){return console.warn('Couldn\'t serve response for "%s" from cache: %O',a.request.url,e),fetch(a.request)}))}});