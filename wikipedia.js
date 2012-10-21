; /* Wikipedia scraping. (C) 2012 David Byard.  Released under AGPLv3.  See LICENSE. */ ;

namespace = window.namespace || {};
namespace.util = namespace.util || {};

namespace.util.getWikipediaLinks = (function() {
  function processPageText(language, pageName, pageText, recursion, successCallback, failureCallback) {
    // Recursion?
    var redirectMatchIndex = pageText.toLowerCase().indexOf('#redirect');
    var redirectMatch = /#redirect *\[\[(.+?)\]\]/ig.exec(pageText);
    if (redirectMatch != null) {
      console.log('**WARN** Following redirect: ' + pageName + ' --> ' + redirectMatch[1]);
      if (recursion > 3) {
        failureCallback('Recursion limit hit fetching page');
      } else {
        getWikipediaLinks(language, redirectMatch[1], recursion + 1, successCallback, failureCallback);        
      }
    // Extract all links
    } else {
      var uniqueMatches = [];
      var popularityMap = {};
      var matches = pageText.match(/\[\[[^:/]*?\]\]/g);
      if (matches != null) {
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
      } else {
        successCallback([]);
      }
    }    
  }

  function processPageResponse(language, pageName, pageData, recursion, successCallback, failureCallback) {
    // Extract page text
    if (pageData.query && pageData.query.pages) {
      for (var pageId in pageData.query.pages) {
          var pageProperties = pageData.query.pages[pageId];
          if (pageProperties.revisions && pageProperties.revisions[0] && pageProperties.revisions[0]['*']) {
            var pageText = pageData.query.pages[pageId].revisions[0]['*'];
            processPageText(language, pageName, pageText, recursion, successCallback, failureCallback);
            return;
          }
      }      
    }
    
    // No page text
    successCallback([]);
  }

  function getWikipediaLinks(language, pageName, recursion, successCallback, failureCallback) {    
    var url = 'http://'
      + language
      + '.wikipedia.org/w/api.php?format=json&action=query&titles='
      + encodeURIComponent(pageName)
      + '&prop=revisions'
      + '&rvprop=content';
    $.ajax(url, {
        dataType: 'jsonp',
        success: function(data) {
          processPageResponse(language, pageName, data, recursion, successCallback, failureCallback);
        },
        error: function() {
          failureCallback('fetch problem for ' + pageName);
        }
      });    
  }
  
  return function(language, pageName, successCallback, failureCallback) {
    return getWikipediaLinks(language, pageName, 0, successCallback, failureCallback)
  }
})();