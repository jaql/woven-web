; /* Web weaving. (C) 2012 David Byard.  Released under AGPLv3.  See LICENSE.*/ ;

namespace = window.namespace || {};
namespace.util = namespace.util || {};

namespace.util.weaveWeb = (function() {
    // Private helpers
    function _relationshipExists(firstNode, secondNode) {
        var firstArray = firstNode.possibleChildren;
        var secondArray = secondNode.possibleChildren;
        
        if (firstArray.length == 0 || secondArray.length == 0) {
            return false;
        }
        var firstArrayMap = {};
        for (var i = 0; i < firstArray.length; i++) {
            firstArrayMap[firstArray[i]] = true;
        }
        for (var j = 0; j < secondArray.length; j++) {
            if (firstArrayMap[secondArray[j]] === true) {
                return true;
            }
        }
        return false;
    }
    
    function _computeNodeCartesianPosition(depth, targetDepth, spoke, spokes) {
        var targetRadius = (depth / targetDepth) * 0.4;
        var xOffset = targetRadius * Math.cos((spoke/spokes) * (Math.PI*2));
        var yOffset = targetRadius * Math.sin((spoke/spokes) * (Math.PI*2));
        return {x: 0.5 + xOffset,
            y: 0.5 + yOffset};
    }
    
    function _scrapeRing(ring, progressCallback, successCallback, errorCallback) {
        // Perform scraping for this layer
        var scraped = 0;
        $.each(ring, function(i, node) {
            function nodeScraped() {
                if (++scraped == ring.length) {
                    successCallback();
                }                
            }
            
            // If terminal, skip it.
            if (node == null) {
                nodeScraped();
                
            // Otherwise scrape it.
            } else {
                namespace.util.getWikipediaLinks('en', node.word, function(children) {
                    progressCallback('Scraped "' + node.word + '"...');
                    node.possibleChildren = children;
                    nodeScraped();
                }, function(errorMessage) {
                    errorCallback(errorMessage);
                });                                    
            }
        });
    }
        
    function _buildWebRing(web, depth, targetDepth, usedWords, progressCallback, successCallback, errorCallback) {
        // Weave this layer
        progressCallback('Weaving layer ' + depth + '...');
        var innerRing = web.rings[depth - 1];
        var currentRing = [];
        
        // Zeroth pass: create null nodes
        for (var i = 0; i < web.spokes; i++) {
            currentRing.push(null);
        }
        
        // First pass: create child nodes
        progressCallback('Weaving layer ' + depth + ', first pass: computing...');
        for (var i = 0; i < web.spokes; i++) {
            var innerNode = innerRing[i];
            var possibleWords = null;
            
            if (innerNode != null) {
                // Get possible words
                var possibleWords = innerNode.possibleChildren;
                
                if (possibleWords != null) {
                    // Find first usable node
                    var newWord = null;
                    for (var j = 0; j < possibleWords.length; j++) {
                        if (usedWords[possibleWords[j]] == undefined) {
                            var cartesianPosition = _computeNodeCartesianPosition(depth, targetDepth, i, web.spokes);
                            var newWord = possibleWords[j];
                            var newNode = new namespace.model.Node(newWord, cartesianPosition);
                            newNode.hasInner = true;
                            innerNode.hasOuter = true;
                            usedWords[newWord] = true;
                            currentRing[i] = newNode;
                            break;
                        }
                    }                    
                }
            }
        }
        
        // Load data required
        _scrapeRing(currentRing, function(text) {
            progressCallback('Weaving layer ' + depth + ', first pass: ' + text);
        }, function() {
            // Data loaded.
            // Second pass: create sibling-only nodes
            progressCallback('Weaving layer ' + depth + ', second pass: computing...');
            var leftNode = null;
            for (var i = 0; i < web.spokes; i++) {
                var consideredNode = currentRing[i];
                
                if (consideredNode != null) {
                    // This is now the left node.
                    if (consideredNode.possibleChildren.length > 0) {
                        leftNode = consideredNode;   
                    }
                    
                // Potential to create one.
                } else if (leftNode != null) {
                    var possibleWords = leftNode.possibleChildren;
                    // Create the node
                    for (var j = 0; j < possibleWords.length; j++) {
                        if (usedWords[possibleWords[j]] == undefined) {
                            var cartesianPosition = _computeNodeCartesianPosition(depth, targetDepth, i, web.spokes);
                            var newWord = possibleWords[j];
                            var newNode = new namespace.model.Node(newWord, cartesianPosition);
                            currentRing[i] = newNode;
                            usedWords[newWord] = true;
                            leftNode = null;
                            break;
                        }
                    }
                }                
            }
            
            // Load data required
            _scrapeRing(currentRing, function(text) {
                progressCallback('Weaving layer ' + depth + ', second pass: ' + text);
            }, function() {
                // Data loaded.
                // Final pass: link up siblings
                progressCallback('Weaving layer ' + depth + ', third pass: computing...');
                var firstNode = null;
                var leftNode = null;
                for (var i = 0; i < web.spokes; i++) {
                    var consideredNode = currentRing[i];
                    
                    if (consideredNode != null) {
                        // Link!
                        if (leftNode != null) {
                            if (_relationshipExists(consideredNode, leftNode)) {
                                leftNode.hasRight = true;
                                consideredNode.hasLeft = true;
                            }                                
                        }
                        
                        // First node?
                        if (firstNode == null) {
                            firstNode = consideredNode;
                        }
                        
                        // This is now the left node.
                        leftNode = consideredNode;
                    }
                }
                
                // Close the loop
                if (firstNode != null && leftNode != null) {
                    if (_relationshipExists(firstNode, leftNode)) {
                        leftNode.hasRight = true;
                        firstNode.hasLeft = true;
                    }
                }
                
                // Remove any nodes that have no links.
                // TODO: work out why this occurs.  Sibling issues, I think.
                for (var i = 0; i < currentRing.length; i++) {
                    if (currentRing[i] != null
                        && !currentRing[i].hasInner && !currentRing[i].hasOuter
                        && !currentRing[i].hasLeft && !currentRing[i].hasRight)
                    {
                        currentRing[i] = null;
                    }
                }
                
                // Finished.
                web.rings.push(currentRing);
                var empty = true;
                for (var i = 0; i < currentRing.length; i++) {
                    if (currentRing[i] != null) {
                        empty = false;
                    }
                }
                if (empty || depth == targetDepth) {
                    progressCallback('Reticulating splines...');
                    setTimeout(function() {
                        successCallback(web);
                    }, 1000);
                } else {
                    _buildWebRing(web, depth + 1, targetDepth, usedWords, progressCallback, successCallback, errorCallback)
                }
            }, errorCallback);
        }, errorCallback);                
    }
    
    // Return the function
    return function weaveWeb(word, spokes, targetDepth, progressCallback, successCallback, errorCallback) {
        var firstRing = [];
        var usedWords = {};
        usedWords[word] = true;
        var rootNode = new namespace.model.Node(word);
        var web = new namespace.model.Web(rootNode, spokes);
        
        progressCallback('Weaving root node...');
        for (var i = 0; i < spokes; i++) {
            firstRing.push(rootNode);
        }
        
        web.rings.push(firstRing);
        
        namespace.util.getWikipediaLinks('en', word, function(children) {
            progressCallback('Scraped root node "' + word + '"...');
            rootNode.possibleChildren = children;
            _buildWebRing(web, 1, targetDepth, usedWords, progressCallback, successCallback, errorCallback);
        }, function(errorMessage) {
            errorCallback(errorErrorMessage);
        });
    }
})();