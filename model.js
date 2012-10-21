; /* Model */ ;
namespace = window.namespace || {};

namespace.model = namespace.model || {};

namespace.model.relationship = {
    LEFT_SIBLING: 'left_sibling',
    RIGHT_SIBLING: 'right_sibling',
    CHILD: 'child',
    PARENT: 'parent'
}

namespace.model.Node = function(word, cartesianPosition) {
    this.word = word;
    this.hasLeft = false;
    this.hasRight = false;
    this.hasOuter = false;
    this.hasInner = false;
    this.cartesianPosition = cartesianPosition;
    this.possibleChildren = [];
}

namespace.model.Web = function(rootNode, spokes) {
    this.rootNode = rootNode;
    this.rings = [];
    this.spokes = spokes;
}

namespace.model.Spider = function() {
    this.edge = null;
    this.progress = 0;
}