; /* View */ ;

namespace = window.namespace || {};

/* View */
namespace.View = function(absoluteTime, elapsedTime, text, web) {
    this.absoluteTime = absoluteTime;
    this.elapsedTime = elapsedTime;
    this.text = text;
    this.web = web;
}
