; /* Renderer.  (C) 2012 David Byard.  Released under AGPLv3.  See LICENSE. */ ;

namespace = window.namespace || {};

/* Renderer */
namespace.Renderer = function(canvas) {
    var context = canvas.getContext('2d');
    var centreX = canvas.width / 2;
    var centreY = canvas.height / 2;
    var rainGravity = canvas.height * 0.5;
    var lineNoiseVector = {x: 0.6 * 0.05 * canvas.width, y: -0.2 * 0.05 * canvas.height};

    var rainDrops = [];
    for (var i = 0; i < 1000; i++) {
        rainDrops.push({x: -canvas.width / 2 + Math.random() * 2 * canvas.width, y: Math.random() * canvas.height});
    }
    
    // Apply a 'noise' to the line by bending it x-wards.
    function drawNoisyLine(x1, y1, x2, y2, lineNoise) {
        var lineCentreX = (x1 + x2) / 2;
        var lineCentreY = (y1 + y2) / 2;
        var controlX = lineCentreX + lineNoiseVector.x * lineNoise;
        var controlY = lineCentreY + lineNoiseVector.y * lineNoise;
        context.beginPath();
        context.strokeStyle = '#666';
        context.moveTo(x1, y1);
        context.quadraticCurveTo(controlX, controlY, x2, y2);
        context.stroke();
    }
    
    function drawRain(elapsedTime, noise) {
        for (var i = 0; i < rainDrops.length; i++) {
            var rainDrop = rainDrops[i];
            
            // Update drop
            if (rainDrop.y > canvas.height) {
                rainDrop.x = -canvas.width / 2 + Math.random() * 2 * canvas.width;
                rainDrop.y = -Math.random() * canvas.height * 0.25;
            }
            rainDrop.x += lineNoiseVector.x * noise;
            rainDrop.y += lineNoiseVector.y * noise;
            rainDrop.y += elapsedTime * rainGravity;
            
            // Draw drop
            context.beginPath();
            context.strokeStyle = '#333';
            context.moveTo(rainDrop.x, rainDrop.y);
            context.lineTo(rainDrop.x + 5 * noise, rainDrop.y + 5);
            context.stroke();
        }
    }
    
    function drawWeb(web, noise) {
        // Draw central spokes
        for (var i = 0; i < web.rings[0].length; i++) {
            var consideredNode = web.rings[0][i];
            var outerNode = web.rings[1][i];
            if (consideredNode.hasOuter) {
                drawNoisyLine(centreX, centreY,
                        outerNode.cartesianPosition.x * canvas.width, outerNode.cartesianPosition.y * canvas.height,
                        noise);
            }
        }
        
        // Draw web
        for (var i = 1; i < web.rings.length; i++) {
            var ring = web.rings[i];
            
            // Draw the lines
            var firstNode = null;
            var leftNode = null;
            for (var j = 0; j < web.spokes; j++) {
                var consideredNode = ring[j];
                if (consideredNode != null) {
                    // Has outer?
                    if (consideredNode.hasOuter) {
                        var innerNode = web.rings[i + 1][j];
                        drawNoisyLine(consideredNode.cartesianPosition.x * canvas.width, consideredNode.cartesianPosition.y * canvas.height,
                                innerNode.cartesianPosition.x * canvas.width, innerNode.cartesianPosition.y * canvas.height,
                                noise);
                    }
                    
                    // Has left?
                    if (consideredNode.hasLeft && leftNode != null) {
                        // Found it
                        drawNoisyLine(consideredNode.cartesianPosition.x * canvas.width, consideredNode.cartesianPosition.y * canvas.height,
                                 leftNode.cartesianPosition.x * canvas.width, leftNode.cartesianPosition.y * canvas.height,
                                 noise);                        
                    }
                    
                    // First
                    if (firstNode == null) {
                        firstNode = consideredNode;
                    }
                    
                    // Next
                    leftNode = consideredNode;
                }                
            }
            
            // Close loop
            if (firstNode != null && leftNode != null && firstNode.hasLeft) {
                drawNoisyLine(firstNode.cartesianPosition.x * canvas.width, firstNode.cartesianPosition.y * canvas.height,
                             leftNode.cartesianPosition.x * canvas.width, leftNode.cartesianPosition.y * canvas.height,
                             noise);  
            }
        }
        
        // Draw text
        context.font = "8pt sans-serif";
        context.textAlign = "center";
        context.fillStyle = 'rgb(255, 255, 255)';
        context.fillText(web.rootNode.word, centreX, centreY);

        for (var i = 1; i < web.rings.length; i++) {
            var ring = web.rings[i];
            
            for (var j = 0; j < ring.length; j++) {
                var node = ring[j];
                
                if (node != null) {
                    var flicker = 0.4 * Math.abs(noise) + 0.5;
                    context.font = "8pt sans-serif";
                    context.textAlign = "center";
                    context.fillStyle = 'rgba(255, 255, 255, ' + flicker +')';
                    var lines = node.word.split(' ');
                    for (var k = 0; k < lines.length; k++) {
                        context.fillText(lines[k],
                                         node.cartesianPosition.x * canvas.width,
                                         node.cartesianPosition.y * canvas.height + 8 * k);
                    }

                }
            }
        }
    }
    
    function drawText(text, noise) {
        var x = canvas.width / 2;
        var y = canvas.height / 2;

        var flicker = 0.4 * Math.abs(noise) + 0.5;
        context.font = "8pt Josefin Sans";
        context.textAlign = "center";
        context.fillStyle = 'rgba(255, 255, 255, ' + flicker +')';
        context.fillText(text, centreX, centreY);
    }
    
    this.render = function(view) {
        // Clear
        context.fillStyle = "black";
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw edges
        var noise = namespace.util.perlin(view.absoluteTime);
        if (view.web != null) {
            drawWeb(view.web, noise);
            drawRain(view.elapsedTime, noise);
        }
        
        if (view.text != null) {
            drawText(view.text, noise);
        }
    }
}