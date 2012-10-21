; /* Wikipedia scraping. (C) 2012 David Byard.  Released under AGPLv3.  See LICENSE. */ ;

namespace = window.namespace || {};
namespace.util = namespace.util || {};

namespace.util.getWikipediaLinks = (function() {
  function processPageText(pageName, pageText, successCallback, failureCallback) {
    // Extract all links
    var uniqueMatches = [];
    var popularityMap = {};
    var matches = pageText.match(/\[\[[^:/]*?\]\]/g);
    for (var i = 0; i < matches.length; i++) {
      var match = matches[i].substr(2, matches[i].length - 4).toLowerCase();  // chop off brackets, lower case
      var pipePosition = match.indexOf('|');
      if (pipePosition != -1) {
        match = match.substr(0, pipePosition);
      }
      if (popularityMap[match] == undefined) {
        popularityMap[match] = 1;
        uniqueMatches.push(match);
      } else {
        popularityMap[match] ++;
      }
    }
    uniqueMatches.sort(function(a, b) {
      return popularityMap[b] - popularityMap[a];
    });
    successCallback(uniqueMatches);
  }

  function processPageResponse(pageName, pageData, successCallback, failureCallback) {
    // Extract page text
    if (pageData.query && pageData.query.pages) {
      for (var pageId in pageData.query.pages) {
          var pageProperties = pageData.query.pages[pageId];
          if (pageProperties.revisions && pageProperties.revisions[0] && pageProperties.revisions[0]['*']) {
            var pageText = pageData.query.pages[pageId].revisions[0]['*'];
            processPageText(pageName, pageText, successCallback, failureCallback);
            return;
          }
      }      
    }
    
    // No page text
    successCallback([]);
  }

  return function(language, pageName, successCallback, failureCallback) {
    var url = 'http://'
      + language
      + '.wikipedia.org/w/api.php?format=json&action=query&titles='
      + encodeURIComponent(pageName)
      + '&prop=revisions'
      + '&rvprop=content';
    $.ajax(url, {
        dataType: 'jsonp',
        success: function(data) {
          processPageResponse(pageName, data, successCallback, failureCallback);
        },
        error: function() {
          failureCallback('fetch problem for ' + pageName);
        }
      });
  }
})();