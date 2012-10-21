; /* This woven web of lies */ ;
namespace = window.namespace || {};

/* Main loop */
window.addEventListener('load', function() {
    var width = 64;
    var height = 64;
    var canvas = document.getElementById('woven-web');
    
    var param = 'Knowledge';
    var paramIndex = window.location.href.indexOf('?word=');
    if (paramIndex != -1) {
        var potentialParam = window.location.href.substring(paramIndex + 6, window.location.length);
        if (potentialParam != '') {
            param = potentialParam;
        }
    }
    var controller = new namespace.Controller(param, new Date());
    var renderer = new namespace.Renderer(canvas);
    
    function loop() {
        var view = controller.tick(new Date());
        renderer.render(view);
        window.setTimeout(loop, 50);
    }
    loop();
});