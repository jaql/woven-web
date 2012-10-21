; /* Controller */ ;

namespace = window.namespace || {};

namespace.Controller = function(word, initialTime) {
    // Constructor
    var that = this;
    var previousTime = initialTime;
    var text = 'Please wait...';
    var web = null;
    namespace.util.weaveWeb(word, 8, 4, function(progressText) {
        console.log('Progress reported: ' + progressText);
        text = progressText;
    }, function(wovenWeb) {
        web = wovenWeb;
        console.log('Loaded!');
        text = null;
    }, function(errorMessage) {
        text = errorMessage;
    });
    
    this.tick = function(newTime) {
        // Update time
        var absoluteSeconds = (newTime.getTime() - initialTime.getTime()) / 1000.0;
        var elapsedSeconds = (newTime.getTime() - previousTime.getTime()) / 1000.0;
        previousTime = newTime;
        
        // Create view
        return new namespace.View(absoluteSeconds, elapsedSeconds, text, web);
    }
}
