var TCSvgConst = function () {
    this.xmlns = "http://www.w3.org/2000/svg";
    this.defLine = "#00000099";
    this.defLineSelect = "#317016b5";
    this.defBorderSelect = "#317016b5";
};
var svgConsts = new TCSvgConst();

var TCSvgItem = function () {
    this.el = document.createElement("div");
    this.el.style.position = "absolute";
    this.el.style.boxSizing = "border-box";
    
    //this.selected = false;
    //this.selectable = true;
    
    this.disBack = document.createElement("div");
    this.disBack.style.position = "absolute";
    this.disBack.style.left = makePX(0);
    this.disBack.style.top = makePX(0);
    this.disBack.style.boxSizing = "border-box";
    this.disBack.style.border = "dashed 2px transparent";
    this.disBack.style.cursor = "pointer";
        
    this.disBack.onmouseover = function () {
        this.style.borderColor = svgConsts.defBorderSelect;
    };
    
    this.disBack.onmouseout = function (){
        this.style.borderColor = "transparent";
    };

    this.disBack.onclick = function (e) {
    };
        
    this.boxWidth = 100;
    this.boxHeight = 100;

    this.svgElement = document.createElementNS(svgConsts.xmlns, "svg");
    this.svgElement.style.display = "block";

    this.gElement = document.createElementNS(svgConsts.xmlns, "g");
    this.gElement.setAttributeNS(null, 'transform', 'translate(0,90) scale(0.07, -0.08)');

    
    this.svgElement.appendChild(this.gElement);
    this.svgPath = [];
    this.disBack.appendChild(this.svgElement);
    this.el.appendChild(this.disBack);
};

TCSvgItem.prototype.setParent = function(parent) {
    parent.el.appendChild(this.el);
};

TCSvgItem.prototype.getPath = function(order) {
    if (this.svgPath.length == 0)
        return null;
    return this.svgPath[order];
};

TCSvgItem.prototype.setWidthHeight = function (w, h) {
    this.boxWidth = w;
    this.boxHeight = h;
    
    this.el.style.width = makePX(w);
    this.el.style.height = makePX(h);

    this.disBack.style.width = makePX(w);
    this.disBack.style.height = makePX(h-15);
    
    this.svgElement.setAttributeNS(null, "viewBox", "0 0 " + this.boxWidth + " " + this.boxHeight);
    this.svgElement.setAttributeNS(null, "width", this.boxWidth);
    this.svgElement.setAttributeNS(null, "height", this.boxHeight);
};

TCSvgItem.prototype.setLeftTop = function (l, t) {
    this.el.style.left = makePX(l);
    this.el.style.top = makePX(t);
};

TCSvgItem.prototype.setPathCoords = function (c) {
    var path = document.createElementNS(svgConsts.xmlns, "path");
    path.setAttributeNS(null, 'd', c);
    this.gElement.appendChild(path);
    this.svgPath.push(path);
};

TCSvgItem.prototype.setPathStroke = function (s) {
    if ((this.svgPath == null) || this.svgPath.length == 0)
        return;
    for (var i =0; i < this.svgPath.length; i++)
        this.getPath(i).setAttributeNS(null, 'stroke', s);
};

TCSvgItem.prototype.setPathStrokeDash = function (s) {
    if ((this.svgPath == null) || this.svgPath.length == 0)
        return;
    for (var i =0; i < this.svgPath.length; i++)
        this.getPath(i).setAttributeNS(null, 'stroke-dasharray', s);
};

TCSvgItem.prototype.setPathStrokeWidth = function (s) {
    if ((this.svgPath == null) || this.svgPath.length == 0)
        return;
    for (var i =0; i < this.svgPath.length; i++)
        this.getPath(i).setAttributeNS(null, 'stroke-width', s);
};

 
TCSvgItem.prototype.setElementFill = function (f) {
    this.gElement.setAttributeNS(null, 'fill', f);
};

TCSvgItem.prototype.setTransform = function (t) {
    this.gElement.setAttributeNS(null, 'transform', t);    
};

TCSvgItem.prototype.setBackBorder = function (b) {
    this.disBack.style.border = b;
};

TCSvgItem.prototype.setZoomScale = function (b) {
    var zoomF = b;
    var zoomA = (b - 20) / 1000;
    var zoomC = -1 * ((b - 10) / 1000);
    var translate = "translate(0,"+ zoomF + ") scale(" + zoomA + ","+ zoomC + ")";
    console.log(translate);
    console.log(zoomF + " " + zoomA + " " + zoomC);
    
    //translate(0.9) scale(0.07,-0.08)
    
    this.gElement.setAttributeNS(null, 'transform', translate);
};

    
