function getParentDoc(el) {
    if (el.ownerDocument) return el.ownerDocument;
    else {
        while (el.parentNode) {
            el = el.parentNode
        }
        return el
    }
};

function setCaptionObject(dobj, text) {
    while (dobj.childNodes.length > 0) 
	dobj.removeChild(dobj.childNodes[0]);
    var doc = getParentDoc(dobj);
    text = text + "";
	var tn = doc.createTextNode(text);
    dobj.appendChild(tn)
};

function TsAcordionPanelItem() {
	this.itemParent = document.createElement('details');
	this.itemParent.className = "groupStyle";
	this.parent = null;
	this.container = true;
	
    this.summary = document.createElement('summary');
	this.itemParent.appendChild(this.summary);	
	
    this.el = document.createElement('div');
	this.el.className = "tcgrupbarcontainer";
    this.el.style.height = "1px";
    this.el.style.backgroundColor = "white";		
	this.el.style.position = "relative";
	
	this.itemParent.appendChild(this.el);	
};

TsAcordionPanelItem.prototype.setParent = function(par) {
	this.parent = par;
    par.el.appendChild(this.itemParent);
};

TsAcordionPanelItem.prototype.addElement = function(ele) {
	this.el.appendChild(ele);
};

TsAcordionPanelItem.prototype.setCaption = function(c) {
	setCaptionObject(this.summary, c);
};

TsAcordionPanelItem.prototype.setHeight = function(h) {
	this.el.style.height = h + "px";
};

function TsPanelMenuGropup() {
    this.el = document.createElement('div');
    this.el.style.position = "absolute";
	this.el.style.left = "250px";
	this.el.style.top = "150px";
    this.el.style.width = "450px"; 
    this.el.style.height = "400px";
    this.el.style["overflow-y"] = "auto"; 
    this.el.unselectable = "on";
    this.el.style.borderWidth = "1px";
    this.el.style.backgroundColor = "rgb(245, 248, 251)";
	this.itemCount = 0;
    this.items = new Array();
};

TsPanelMenuGropup.prototype.setParent = function(par) {
	par.appendChild(this.el);
};

TsPanelMenuGropup.prototype.addTab = function(cap, h) {
	var contanier = new TsAcordionPanelItem();
		contanier.setParent(this);
		contanier.setCaption(cap);
		contanier.setHeight(h);
	this.items.push(contanier);
	return contanier;
};
