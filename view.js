; /* View. (C) 2012 David Byard.  Released under AGPLv3.  See LICENSE. */ ;

namespace = window.namespace || {};

/* View */
namespace.View = function(absoluteTime, elapsedTime, text, web) {
    this.absoluteTime = absoluteTime;
    this.elapsedTime = elapsedTime;
    this.text = text;
    this.web = web;
}
