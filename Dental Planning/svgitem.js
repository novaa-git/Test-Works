var TCSvgConst = function () {
    this.xmlns = "http://www.w3.org/2000/svg";
    this.defLine = "#00000099";
    this.defLineSelect = "#317016b5";
    this.defBorderSelectOwer = "#317016b5";
    this.defBorderSelectOwer = "rgb(175 175 175)";
    this.defBorderSelect = "rgb(0, 120, 212)";
    //this.defBorderSelect = "rgb(175 175 175)";
    
    this.defBorder =  "#00000099";
    this.defDisNoBack = "#0078d4";
    this.defDisNoBack = "rgb(81 94 104)";
    this.defDisNoBack = this.defBorder;
    this.defDisNoBackIsIslem = "#009e60";
    
    this.defDisBackIsIslem = "rgb(244, 249, 253)";
    this.defDisBorderIsIslem = "rgb(0 0 0 / 35%)";
    
    
    this.defKayipBorder = "#c7c7c79e";
    this.defSelectBack = "rgb(222, 241, 255)";
    this.DefCeneLine = "rgb(181 184 200 / 53%)";
    
    this.defDisUpdateBack =  "#fff6db";
    this.defDisUpdateLine =  "#cea513";

    // islem renkleri
    this.defDisRenk_Curuk = "#555555ba";
    this.defRenk_Notes = "rgb(0, 120, 212)";
    
    this.defDisRenk_Pembe1 = "rgb(199 15 168 / 78%)";
    this.defDisRenk_Pembe2 = "rgb(199 15 168 / 40%)";

    this.defDisRenk_Red1 = "#de3163a6";
    this.defDisRenk_Yesil1 = "rgb(56 118 73 / 72%)";
    this.defDisRenk_Mavi1 = "rgb(61 93 165 / 72%)";
    this.defDisRenk_Siyah1 = "#000000a8";
        
};

var svgConsts = new TCSvgConst();

var TCPanelLine = function () {
    this.el = document.createElement("div");
    this.el.style.position = "absolute";
    this.el.style.boxSizing = "border-box";
    this.el.style.background = svgConsts.DefCeneLine;
    this.autoPos = true;
    this.parent = null;
};

TCPanelLine.prototype.setParent = function(parent) {
    this.parent = parent;
    parent.el.appendChild(this.el);
};

TCPanelLine.prototype.setLeftTop = function(l,t) {
    this.el.style.left = makePX(l);
    this.el.style.top = makePX(t);
};

TCPanelLine.prototype.setAutoPos = function(t) {
    this.autoPos = t;
};

TCPanelLine.prototype.setVertHorz = function(isVert) {
    this.el.style.width = makePX(2);
    this.el.style.height = makePX(2);
    if (isVert) {
            this.el.style.height = makePX(this.parent.getHeight());
            this.el.style.left = makePX((this.parent.getWidth() / 2)-1 );
        } else {
            this.el.style.width = makePX(this.parent.getWidth());
            this.el.style.top = makePX(this.parent.getHeight() / 2 );
        }
};

var TCSvgTool = function () {
    this.el = document.createElement("div");
    this.el.setAttribute('style', "font-family:monospace !important;");
    this.el.style.position = "absolute";
    this.el.style.boxSizing = "border-box";
    this.el.style.background = "transparent";
    this.parent = null;
};

TCSvgTool.prototype.setParent = function(parent) {
    this.parent = parent;
    parent.appendChild(this.el);
};

TCSvgTool.prototype.setLeftTop = function(l,t) {
    this.el.style.left = makePX(l);
    this.el.style.top = makePX(t);
};

TCSvgTool.prototype.setAngle = function(a) {
    this.el.style["rotate"] = a + "deg";
};

TCSvgTool.prototype.setSize = function(w,h) {
    this.el.style.width = makePX(w);
    this.el.style.height = makePX(h);
};

TCSvgTool.prototype.setClipPath = function(p,c,f) {
    this.el.className = "fillRule";
    this.el.style["clip-path"] = p;

    if (isPresent(c))
        this.el.style["clip-rule"] = c;
    if (isPresent(f))        
        this.el.style["fill-rule"] = f;
    
};

TCSvgTool.prototype.setBack = function(b) {
    this.el.style.background = b;
};

TCSvgTool.prototype.setUpdate = function(u) {
    this.isUpdate = u;
};

TCSvgTool.prototype.setCaption = function(c) {
    setDOMText(this.el, c); 
    this.el.style["text-align"] =  "center";
    this.el.style["font-size"] = "9px";
    this.el.style["color"] = "white";    
};

TCSvgTool.prototype.setTitle = function(t) {
    this.el.title = t;
};

TCSvgTool.prototype.setZoom = function(z) {
    this.el.style["zoom"] = z + "%"; // chrome, edge
};

var TCSvgItem = function () {
    this.owner = null;
    this.el = document.createElement("div");
    this.el.style.position = "absolute";
    this.el.style.boxSizing = "border-box";
    
    this.selected = false;
    this.selectable = false;
    
    this.svgBack = document.createElement("div");
    this.svgBack.style.position = "absolute";
    this.svgBack.style.left = makePX(0);
    this.svgBack.style.top = makePX(0);
    this.svgBack.style.boxSizing = "border-box";
    this.svgBack.style.border = "dashed 1px transparent";
    this.svgBack.owner = this;
        
    this.svgBack.onmouseover = function () {
        if (this.owner.selectable) {
            this.style.borderColor = svgConsts.defBorderSelectOwer;
        }
    };
    
    this.svgBack.onmouseout = function (){
        if (this.owner.selectable) {
            if (this.owner.selected)
                this.style.borderColor = svgConsts.defBorderSelect;
            else 
                this.owner.setIslemControlRefresh();
                //this.style.borderColor = "transparent";
        }
    };

    this.svgBack.onclick = function (e) {
        this.owner.setSelected(!this.owner.selected);
    };
        
    this.boxWidth = 100;
    this.boxHeight = 100;

    this.svgElement = document.createElementNS(svgConsts.xmlns, "svg");
    this.svgElement.style.display = "block";
    this.elementPosXy = "0 0";

    this.gElement = document.createElementNS(svgConsts.xmlns, "g");
    this.gElement.setAttributeNS(null, 'transform', 'translate(0,90) scale(0.07, -0.08)');

    this.svgElement.appendChild(this.gElement);
    this.svgPath = [];
    this.svgBack.appendChild(this.svgElement);
    this.el.appendChild(this.svgBack);
    this.disClass = null;
    this.isUpdate = false;
    this.disIslems = [];
};

TCSvgItem.prototype.setOwner = function(w) {
    this.owner = w;
};

TCSvgItem.prototype.getDisBack = function() {
    return this.svgBack;        
};

TCSvgItem.prototype.setDisNo = function(d) {
    if (!isPresent(this.elDisNoLabel)) {
        this.elDisNoLabel = document.createElement("div");
        this.elDisNoLabel.setAttribute('style', "font-family:monospace !important;");
        this.elDisNoLabel.style.position = "absolute";
        this.elDisNoLabel.style.left = makePX(0);
        this.elDisNoLabel.style.top = makePX(0);
        this.elDisNoLabel.style.width = makePX(20);
        this.elDisNoLabel.style.height = makePX(16);
        this.elDisNoLabel.style.color = "white";
        this.elDisNoLabel.style.background = svgConsts.defDisNoBack;
        this.elDisNoLabel.style.fontSize = "11px";
        this.elDisNoLabel.style.alignItems ="center";
        this.elDisNoLabel.style.display = "flex";
        this.elDisNoLabel.style.justifyContent = "space-around";
        this.elDisNoLabel.style.boxShadow = "rgba(0, 0, 0, 0.15) 0px 0.1rem 0.2rem";
        setDOMText(this.elDisNoLabel, d); 
        this.elDisNoLabel.style.borderRadius = "3px";
        this.el.appendChild(this.elDisNoLabel);
    }
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

    this.svgBack.style.width = makePX(w);
    this.svgBack.style.height = makePX(h-15);
    
    this.svgElement.setAttributeNS(null, "viewBox", this.elementPosXy+ " " + this.boxWidth + " " + this.boxHeight);
    this.svgElement.setAttributeNS(null, "width", this.boxWidth);
    this.svgElement.setAttributeNS(null, "height", this.boxHeight);
    
    if (isPresent(this.elDisNoLabel)) {
        this.elDisNoLabel.style.left = makePX(w/2 -8); 
        
        if (this.disClass.getDisBolge() == disBolgeUst) { // ust
            this.elDisNoLabel.style.top = makePX(h-13);
        } else {
            this.svgBack.style.top = makePX(17);
            this.elDisNoLabel.style.top = makePX(-1);
        }
    }    
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
    this.svgBack.style.border = b;
};

TCSvgItem.prototype.setZoomScale = function (b) {
    var zoomF = b;
    var zoomA = ((b - 20) / 1000);
    var zoomC = -1 * ((b - 10) / 1000);
    var translate = "translate(0,"+ zoomF + ") scale(" + zoomA + "," + zoomC + ")";
    this.gElement.setAttributeNS(null, 'transform', translate);
};

TCSvgItem.prototype.setSelected = function (s) {
    this.selected = s;
    if (this.selectable) {
        if (s) {
            this.svgBack.style.borderColor = svgConsts.defBorderSelect;
            this.svgBack.style.background =  svgConsts.defSelectBack;
        } else {
            this.setIslemControlRefresh();
        }
    } 
};

TCSvgItem.prototype.setSelectable = function (s) {
    if (s) {
        this.svgBack.style.cursor = "pointer";
    }
    this.selectable = s;
};

TCSvgItem.prototype.setPosXy = function (xy) {
    this.elementPosXy = xy;
    this.svgElement.setAttributeNS(null, "viewBox", this.elementPosXy + " " + this.boxWidth + " " + this.boxHeight);
};

TCSvgItem.prototype.setDisClass = function (c) {
    this.disClass = c;
    this.setPathCoords(this.disClass.disSvg);
    this.setZoomScale(this.disClass.zoomScale);
    this.setElementFill(this.disClass.elementFill);
    if (this.owner.disSchemaType == schemaTypeEriskin)
        this.setDisNo(this.disClass.disNo);
        else 
            this.setDisNo(this.disClass.sutDisNo);
    this.setPosXy(this.disClass.posXY);
};

TCSvgItem.prototype.setIslemControlRefresh = function (c) {
    if (this.disIslems.length > 0) {
        this.elDisNoLabel.style.background = svgConsts.defDisNoBackIsIslem;
        this.svgBack.style.borderColor =  svgConsts.defDisBorderIsIslem;
        this.svgBack.style.borderStyle = "dotted";
        this.svgBack.style.background = "white";
    } else {
        this.elDisNoLabel.style.background = svgConsts.defDisNoBack;
        this.svgBack.style.borderColor = "transparent";
        this.svgBack.style.background = "transparent";
    }
};

TCSvgItem.prototype.addDisIslem = function (d) {
    this.disIslem = getDisIslem(d);
    if (isPresent(this.disIslem)) {
        this.disIslem.setParent(this);
        this.disIslem.setRefresh();
        this.disIslems.push(this.disIslem);
    }
    this.setIslemControlRefresh();
    return this.disIslem;
};

TCSvgItem.prototype.removeDisIslem = function () {
    if (isPresent(this.disIslems) &&  this.disIslems.length > 0) {
        for (var i=0; i < this.disIslems.length; i++) {
            this.getDisBack().removeChild(this.disIslems[i].getDisPath().el);
        }
        this.disIslems = [];
        this.setElementFill(svgConsts.defBorder); 
        this.setIslemControlRefresh();
    }
};

var TDisClass = function () {
    this.disNo = 0;
    this.sutDisNo = 0;
    this.disSvg = null;
    this.zoomScale = 80;
    this.elementFill = svgConsts.defBorder;
    this.posXY = "-3 -35";
    this.disBolge = 0;
};

TDisClass.prototype.getDisBolge = function () {
    if (this.disNo > 28)
        return 1;
    return 0;        
};

var TDisIslem = function () {
    this.islemId = 0; // her dis'e bir işlem numarası.
    this.toolRenk = svgConsts.defBorder;
    this.disRenk = null;
    this.owner = null; // hangi dişte (TCSvgItem gösterir)
    this.disPath = null; // ekrana cizilen sekil
    this.parent = null; // seklin cizildigi div 
    this.xyUstAlt = [0,0,0,0,false];
};
 
TDisIslem.prototype.getDisPath = function (p) {
    if (!isPresent(this.disPath)) {
        this.disPath = new TCSvgTool();
    }
    return this.disPath;
};

TDisIslem.prototype.setParent = function (p) {
    this.owner = p;
    this.parent = p.getDisBack();    
    this.getDisPath().setParent(this.parent);
};

TDisIslem.prototype.setLeftTop = function (l1, t1, l2, t2, isrotate) {
    this.xyUstAlt[0] = l1;
    this.xyUstAlt[1] = t1;
    this.xyUstAlt[2] = l2; // alt dislere erisim için.. 
    this.xyUstAlt[3] = t2;
    this.xyUstAlt[4] = isrotate;
    this.getDisPath().setLeftTop(l1,t1);
};

TDisIslem.prototype.setSize = function (w,h) {
    this.getDisPath().setSize(w,h);
};

TDisIslem.prototype.setDisPathClip = function (p, c, f) {
    this.getDisPath().setClipPath(p, c, f);
};

TDisIslem.prototype.setIslemId = function (i) {
    this.islemId = i;    
};

TDisIslem.prototype.setToolRenk = function (r) {
    this.toolRenk = r;   
    this.getDisPath().setBack(r);  
};

TDisIslem.prototype.setDisRenk = function (r) {
    this.disRenk = r;   
};

TDisIslem.prototype.setCaption = function (c) {
    this.getDisPath().setCaption(c);  
};

TDisIslem.prototype.setTitle = function (t) {
    this.getDisPath().setTitle(t);  
};

TDisIslem.prototype.setZoom = function (z) {
    this.getDisPath().setZoom(z);  
};

TDisIslem.prototype.setRefresh = function () {
    if (isPresent(this.owner)) {
        if (this.owner.disClass.getDisBolge() == disBolgeUst)  // ust
            this.getDisPath().setLeftTop(this.xyUstAlt[0], this.xyUstAlt[1]);
            else 
                this.getDisPath().setLeftTop(this.xyUstAlt[2], this.xyUstAlt[3]);
        
        if (isPresent(this.xyUstAlt[4]) && (this.xyUstAlt[4] == true) && (this.owner.disClass.getDisBolge() == disBolgeAlt) ) {
            this.getDisPath().setAngle(180); /** !! */
        }

        if (isPresent(this.disRenk))
            this.owner.setElementFill(this.disRenk);
    }
};

TDisIslem.prototype.onEventAfterLoad = function () {
};
