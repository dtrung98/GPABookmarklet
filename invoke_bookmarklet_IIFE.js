// This file is the original javascript code that will be executed by the bookmarklet. It executes
// the real bookmarklet code, which is stored in a Github repository.
// The first javscript code executes the bookmarklet of new portal, the second one executes the bookmarklet of old portal.
// Choose a suitable one and convert it to the bookmarklet code by using the website https://www.yourjs.com/bookmarklet/. Then paste the converted result to the website tutorial.

javascript: (function () {
    var script = document.createElement('script');
    script.src = 'https://dreamywanderer.github.io/GPABookmarklet_Maintanence/bookmarklet_portal_v2.js';
    document.body.appendChild(script);
})();

javascript: (function () {
    var script = document.createElement('script');
    script.src = 'https://dreamywanderer.github.io/GPABookmarklet_Maintanence/bookmarklet.js';
    document.body.appendChild(script);
})();