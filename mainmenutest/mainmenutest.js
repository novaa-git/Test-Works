function TCSDatasets() {
    this.anamenuformdsetsorgu = null;
    this.anamenuformdset = null;
    this.owner = null;
    this.form = null;
    this.moduller = [];
    this.formlar = [];
};

TCSDatasets.prototype.setOwner = function(owner) {
    this.owner = owner;
    this.form = this.owner.getForm();

    this.modulSorgu = this.form.TCDataSet();
    this.modulSorgu.self = this;
    this.modelSorguL = this.form.TCDataSet();

    this.modulSorgu.setOwner(this.form);
    this.modulSorgu.setAction("./AnaMenuModuller.do");
    this.modulSorgu.onfields();
    this.modulSorgu.setAsync(true);  
    this.modulSorgu.setOnAfterLocate(this.setModulsAfterLocate);
    this.modulSorgu.setLocateDSet(this.modelSorguL);

    this.modelSorguL.setOwner(this.form);
    this.modelSorguL.setAction("./AnaMenuModuller.do");
    this.modelSorguL.onfields();
    
    this.formSorgu = this.form.TCDataSet();
    this.formSorgu.self = this;
    this.formSorguL = this.form.TCDataSet();

    this.formSorgu.setOwner(this.form);
    this.formSorgu.setAction("./AnaMenuFormlar.do");
    this.formSorgu.onfields();
    this.formSorgu.setAsync(true);
    this.formSorgu.setOnAfterLocate(this.setAfterLocate);
    this.formSorgu.setLocateDSet(this.formSorguL);
    
    this.formSorguL.setOwner(this.form);
    this.formSorguL.setAction("./AnaMenuFormlar.do");
    this.formSorguL.onfields();

    this.setModulSorguQuery();
};

TCSDatasets.prototype.setModulSorguQuery = function() {
    this.modulSorgu.FieldByName("FORMAD").setValue("");
    this.modulSorgu.FieldByName("YENIMENUTASARIMPARAMETRE").setValue("1");
    this.modulSorgu.FieldByName("USTMENUKRITERIUYGULAMA").setValue("E");
    this.modulSorgu.locate();
};

TCSDatasets.prototype.setFormSorguQuery = function() {
    this.formSorgu.FieldByName("MD_KEY").setValue(0);
    this.formSorgu.FieldByName("FORMAD").setValue("");
    this.formSorgu.FieldByName("YENIMENUTASARIMPARAMETRE").setValue("1");
    this.formSorgu.locate();
};

TCSDatasets.prototype.setModulsAfterLocate = function() {
    this.self.modulFormLoad(this.locateDSet, true, this.self.moduller);
    this.self.setFormSorguQuery();
};

TCSDatasets.prototype.setAfterLocate = function() {
    this.self.modulFormLoad(this.locateDSet, false, this.self.formlar);
    this.self.owner.setInitPanels();     
};

TCSDatasets.prototype.modulFormLoad = function(dataset, ismodul, sarray) {
    for (var i = 1; i <= dataset.recordCount(); i++) {
        var modul = this.datasetToModulForm(dataset, ismodul);
        sarray.push(modul);
        dataset.next();
    }
    var raporModul = {ismodul : true, modulno : 0, ustmdkey: 0, mdkey:0, baslik: "Raporlar", basliktr: "Raporlar", iconname: "sf-printer" };
    sarray.push(raporModul);
};

TCSDatasets.prototype.datasetToModulForm = function(dset, ismodul) {
    var modulform = {};
    if (ismodul) {
        modulform.ismodul = true;
        modulform.modulno = dset.FieldByName("MODULNO").getValue();
        modulform.kullaniciTanimli = dset.FieldByName("KULLANICITANIMLI").getValue();
        modulform.mdkey = dset.FieldByName("MD_KEY").getAsInteger();
        modulform.baslik = dset.FieldByName("MODULAD").getValue();
        modulform.basliktr = dset.FieldByName("MODULADTR").getValue();
        modulform.iconname = dset.FieldByName("ICONNAME").getValue();
        modulform.ustmdkey = dset.FieldByName("USTMDKEY").getAsInteger();
        modulform.formlar = []; 
        modulform.moduller = [];             
    } else {
        modulform.ismodul = false;
        modulform.fr_key = dset.FieldByName("FR_KEY").getAsInteger();
        if (dset.FieldByName('MENUTEXTTR') != null) {
            modulform.baslik = dset.FieldByName("MENUTEXT").getValue();
            modulform.basliktr = dset.FieldByName("MENUTEXTTR").getValue();
        } else {
            modulform.baslik = dset.FieldByName("FORMAD").getValue(); // kısayollar.
            modulform.basliktr = modulform.wt;
            modulform.modal = dset.FieldByName("MODAL").getValue();
        }
        modulform.ww = dset.FieldByName("WIDTH").getValue();
        modulform.wh = dset.FieldByName("HEIGHT").getValue();
        modulform.mdkey = dset.FieldByName("MD_KEY").getAsInteger();
        modulform.md_fr_key = dset.FieldByName("MD_FR_KEY").getAsInteger();
        modulform.params = dset.FieldByName("PARAMS").getValue();
        modulform.raporadi = dset.FieldByName("RAPORADI").getValue();
        modulform.disBaglanti = dset.FieldByName("ERISIMADRESI").getValue();
        modulform.yeniSayfa = dset.FieldByName("YENISAYFA").getValue();
        modulform.iconname = dset.FieldByName("ICONNAME").getValue();
        modulform.renk = dset.FieldByName("RENK").getValue();
        modulform.isFind = false; // aramada bulundu
    }
    return modulform;
};

var paramStyleDark = 0;
var paramStyleLight = 1;

function TCSMenuColorStyle(item, style) {
    this.selectedColorDark = "rgba(0, 0, 0, 0.32)";
    this.selectOverColorDark = "rgb(0 0 0 / 14%)";
    
    this.selectedColorLight = "red";
    this.selectOverColorLight = "rgb(0, 120, 212)";

    this.selectFontColorDark = "black";
    this.selectFontColorWhite = "white";

    this.defaultBackColor = "transparent";
    this.defaultFontColor = "white";
    this.defaultFontColor = "white";

    this.style = style;
    this.menuItem = item;
};

TCSMenuColorStyle.prototype.setStyle = function(s) {
    this.style = s;
    this.initMenuItemStyle();
};

TCSMenuColorStyle.prototype.select = function() {
    if (this.menuItem.selected) {
        this.menuItem.el.style.background = (this.style == paramStyleDark) ? this.selectedColorDark : this.selectedColorLight;
    } else {
            this.menuItem.el.style.background = this.defaultBackColor;
        }
};

TCSMenuColorStyle.prototype.mouseOver = function() {
    if (!this.menuItem.selected) {
        this.menuItem.el.style.background = (this.style == paramStyleDark) ? this.selectOverColorDark : this.selectOverColorLight; 
        this.setItemFontColor(this.selectFontColorWhite);
    }
};

TCSMenuColorStyle.prototype.mouseLeave = function() {
    if (!this.menuItem.selected) {
        this.menuItem.el.style.background = this.defaultBackColor;
        this.setItemFontColor(this.defaultFontColor);
    }
};

TCSMenuColorStyle.prototype.setEnable = function(s) {
};

TCSMenuColorStyle.prototype.initMenuItemStyle = function() {
    this.defaultFontColor = (this.style == paramStyleDark) ? this.selectFontColorWhite : this.selectFontColorDark;
    this.setItemFontColor(this.defaultFontColor);
    
    this.defaultBackColor = (this.style == paramStyleDark) ? "transparent" : "#eee";
    this.menuItem.setBackColor(this.defaultBackColor); 
    
    if (this.style != paramStyleDark) {
        this.menuItem.el.style["border-left"] = "1px solid rgb(217, 217, 217)";
        this.menuItem.el.style["border-bottom"] = "1px solid rgb(217, 217, 217)";
    }
};

TCSMenuColorStyle.prototype.setItemFontColor = function(f) {
    this.menuItem.lblC.style.color = f;
    this.menuItem.lblIco.style.color = f; //"#00000082";
};

function getIconDiv(classn) {
    var ico = document.createElement('div');
    ico.style.position = "relative";
    ico.className = classn;
    ico.style.display = "flex";
    ico.style.background = "transparent"; // TODO
    ico.style.fontSize = "24px";
    ico.style.padding = "2px";
    ico.style.margin = "2px";
    ico.style.color = "black";
    return ico;        
};

function TCSMenuItem(parent) {
    this.classAdi = "TCSMenuItem";
    this.parent = parent;
    this.group = null;
    this.caption = "";
    this.icon = null;
    this.selected = false;
    this.enabled = true;
    this.order = 0;
    this.menuColorStyle = new TCSMenuColorStyle(this, paramStyleDark);
    this.onClick = null;
    this.modulform = null;
};

TCSMenuItem.prototype.setModulForm = function(m) {
    this.modulform = m;
    this.setItemCaption(this.modulform.baslik);
    this.setItemIcon(this.modulform.iconname);
    this.setItemOrder(this.modulform.mdkey);    
};

TCSMenuItem.prototype.setOwnerGroup = function(g) {
    this.group = g; 
};

TCSMenuItem.prototype.setItemCaption = function(c) {
    this.caption = c;
};

TCSMenuItem.prototype.setItemIcon = function(i) {
    this.icon = i;
};

TCSMenuItem.prototype.setItemOrder = function(i) {
    this.order = i;
};

TCSMenuItem.prototype.setSelected = function(s) {
    this.selected = s;
    this.menuColorStyle.select();
    if (this.selected) {
        this.group.mainMenu.setMenuItemOnClick(this.modulform, this.group.menuType);
    }
};
 
TCSMenuItem.prototype.getSelected = function() {
    return this.selected;
};

TCSMenuItem.prototype.setBackColor = function(c) {
    this.el.style.background = c;
};

TCSMenuItem.prototype.setColumCount = function(c) {
    if (c == 1)
        this.el.style.width = "100%";
         else 
            this.el.style.width = ((100 / c) - 2) + "%";
};

TCSMenuItem.prototype.initMenuItem = function() {
    this.el = document.createElement('div');
    this.el.style.position = "relative";
 
    this.el.style.display = "flex";
    this.el.style.width = "100%";
    this.el.style.height = "38px";
    
    this.el.style.boxSizing =  "border-box";
    this.el.style.padding = "4px";
    this.el.style.margin = "4px";
    this.el.style.borderRadius = "6.5px";
    this.el.style["align-items"] = "center";
    this.el.style.cursor = "pointer";
    /*
    var self_ = this;
    this.el.onfocus = function (e) {
        self_.el.style.backgroundColor ="red";
    };
    
    this.el.onblur = function (e) {
        self_.el.style.backgroundColor ="white";
    };
    */

    var self_ = this;

    this.el.onmouseover = function () {
        self_.menuColorStyle.mouseOver();
    };
    
    this.el.onmouseout = function (){
        self_.menuColorStyle.mouseLeave();
    };

    this.el.onclick = function (e) {
        self_.group.setSelected(self_.order);
    };

    this.initItemCaption();
    this.parent.appendChild(this.el);
};

TCSMenuItem.prototype.initItemCaption = function() {
    this.lblC = document.createElement('div');
    this.lblC.style.position = "relative";
    this.lblC.style.display = "flex";
    this.lblC.style.fontSize = "13px";
    this.lblC.style.marginLeft = "9px";

    setDOMText(this.lblC, this.caption);
    
    this.lblIco = getIconDiv(this.icon);

    this.el.appendChild(this.lblIco);
    this.el.appendChild(this.lblC);
};

function getNewItem(parent, modul) {
    var item = new TCSMenuItem(parent);
    item.setModulForm(modul);  
    item.initMenuItem();
    return item;
}

var menuTypeLeft = 0;
var menuTypeRight = 1;

function TCSMenuGroup(mainmenu, parent, menutype) {
    this.classAdi = "TCSMenuGroup";
    this.caption = "";
    this.groupItems = [];
    this.parent = parent;
    this.elCaption = null;
    this.colCount = 1;
    this.mainMenu = mainmenu;
    this.menuType = menutype;
};

TCSMenuGroup.prototype.setColumn = function(c) {
    this.colCount = c;
    for (var i=0; i < this.groupItems.length; i++) {
        this.groupItems[i].setColumCount(c);
    }    
};

TCSMenuGroup.prototype.setEndSettings = function(colcount, colorstyle) {
    if (colcount != null)
        this.setColumn(colcount);
    if (colorstyle != null)
        this.setColorStyle(colorstyle);
};

TCSMenuGroup.prototype.setCaption = function(modulform) {
    this.caption = modulform.baslik;
    if (this.elCaptionParent == null) {
        this.elCaptionParent = document.createElement('div');
        this.elCaptionParent.style.position = "relative";
        this.elCaptionParent.style.display = "flex";
        this.elCaptionParent.style.width = "100%";
        this.elCaptionParent.style.height = "20px";
        this.elCaptionParent.style.boxSizing =  "border-box";
        this.elCaptionParent.style.padding = "2px";
        this.elCaptionParent.style.margin = "2px";
        this.elCaptionParent.style.marginBottom = "5px";
        
        this.elCaption = document.createElement('div');
        this.elCaption.style.position = "relative";
        this.elCaption.style.display = "flex";
        this.elCaption.style.width = "100%";
        this.elCaption.style.height = "20px";
        this.elCaption.style.boxSizing =  "border-box";
        this.elCaption.style.fontSize = "15.5px";
        //this.elCaption.style.fontWeight = "bold";
        this.elCaption.style.color = "black";
        this.elCaption.style.textShadow = "rgb(161 161 161 / 55%) 1px 1px 1px";

        setDOMText(this.elCaption, this.caption);

        if (isPresent(modulform.iconname)) {
            this.elCaptionParent.style.height = "25px";
            this.ico = getIconDiv(modulform.iconname);
            this.ico.className = "sf-stop"; // sf-folder-open-o
            this.ico.style.color = "#0095b6";
            this.ico.style.fontSize = "12px";
            this.ico.style.padding = "0px";
            this.ico.style.marginRight = "5px";
            this.elCaptionParent.appendChild(this.ico);
        }
        this.elCaptionParent.appendChild(this.elCaption);
       this.parent.appendChild(this.elCaptionParent);
    }
};

TCSMenuGroup.prototype.setColorStyle = function(c) {
    for (var i=0; i < this.groupItems.length; i++) {
        this.groupItems[i].menuColorStyle.setStyle(c);
    }    
    if (c == paramStyleLight) {
        this.elCaption.style.textShadow = "none";
        this.elCaption.style.fontSize = "14px";
    }
};

TCSMenuGroup.prototype.addItem = function(modul) {
    var item = getNewItem(this.parent, modul); 
    item.setOwnerGroup(this);
    this.groupItems.push(item);
};

TCSMenuGroup.prototype.setSelected = function(order) {
    for (var i=0; i < this.groupItems.length; i++) {
        if (this.groupItems[i].order == order) {
            this.groupItems[i].setSelected(true);
        } else 
            this.groupItems[i].setSelected(false);
    }
};

function TCWebtopAnaMenu() {
    this.parent = null;
    this.owner = null;
    this.classAdi = "TCWebtopAnaMenu";
    this.datasets = new TCSDatasets();

    this.elBack = document.createElement('div'); 
    this.elBack.style.position = "absolute";
    this.elBack.style.width = makePX(ActiveForm.getClientWidth());
    this.elBack.style.height = makePX(ActiveForm.getClientHeight());
    this.elBack.style.backgroundColor ="rgb(0 0 0 / 7%)";
    this.elBack.style.top = "0";
    this.elBack.style.left = "0px";
    this.elBack.style.boxSizing = "border-box";
    this.elBack.addEventListener("click", this.backOnClick);
    
    this.el = document.createElement('div'); 
    this.el.className = "customScrolls";
    this.el.style.position = "absolute";
    this.el.style.height = "700px";
    this.el.style.width = "900px";
    this.el.style.backgroundColor ="transparent";
    this.el.creator = this;
    this.el.style.top = "40px";
    this.el.style.left = "0px";
    this.el.style.top = "140px";
    this.el.style.left = "440px";
    this.el.style.boxSizing = "border-box";
    this.el.style.display = "flex";
    this.elBack.appendChild(this.el);

    this.leftSideParent = null;
    this.rightSideParent = null;
    this.selectedMdKey = 0;

    this.el.isDown = false;
    this.el.cursor = {x1: 0, y1: 0};
    var self_ = this.el;
    
    function onControlMouseDown(event) {
        if (isPresent(event.srcElement.tagName) && (event.srcElement.tagName == "DIV")) {
            self_.isDown = true;
            self_.cursor.x1 = event.clientX - self_.offsetLeft;
            self_.cursor.y1 = event.clientY - self_.offsetTop
        }
    };

    function onControlMouseUp(event) {
        event.preventDefault();
        if (isPresent(self_)) self_.isDown = false
    };

    function onControlMouseMove(event) {
        if (isPresent(self_) && self_.isDown) {
            event.preventDefault();
            var oLeft = event.clientX - self_.cursor.x1;
            var oTop = event.clientY - self_.cursor.y1;
            self_.style.left = makePX(oLeft);
            self_.style.top = makePX(oTop)
        }
    }

    this.el.onmousemove = onControlMouseMove;
    this.el.onmouseup = onControlMouseUp;
    this.el.onmousedown = onControlMouseDown;
    
    this.araTimer = null;
};
 
TCWebtopAnaMenu.prototype.setOwner = function(o) {
    this.owner = o;
    this.owner.AddControl(this);
    this.setParent(this.owner); 
    this.datasets.setOwner(this); 
};

TCWebtopAnaMenu.prototype.backOnClick = function(e) {
    if( e.target !== this) {
        return;
    }
    this.style.display = "none";
};

TCWebtopAnaMenu.prototype.setInitPanels = function(o) {
    this.initLeftSide();
    this.initRightSide();

    this.setLeftMenuFromOrder(315); // TODO

    if (this.selectedMdKey > 0) {
        this.lmGroupL.setSelected(this.selectedMdKey);
    }
};

TCWebtopAnaMenu.prototype.getForm = function(o) {
    return this.owner;
};

TCWebtopAnaMenu.prototype.setParent = function (p) { 
    this.parent = p;
    if (p.container) {
        p.el.appendChild(this.elBack);
    } else {
        document.body.appendChild(this.elBack);
    }
};


TCWebtopAnaMenu.prototype.initLeftSide = function () { 
    this.leftSideParent = document.createElement('div'); 
    this.leftSideParent.style.position = "relative";
    this.leftSideParent.style.backgroundColor ="rgb(201 201 201 / 23%)";
    this.leftSideParent.style.width = "35%";
    this.leftSideParent.style.height = "100%";
    this.leftSideParent.style.boxSizing = "border-box";
    this.leftSideParent.style.padding = "6px";
    this.leftSideParent.style.paddingTop = "10px";
    this.leftSideParent.style.paddingRight = "10px";
    this.leftSideParent.onclick = null;
    
    this.leftSideParent.style.backdropFilter = "saturate(180%) blur(25px)";
    
    var border = "2px solid rgb(161 161 161 / 18%)";
    this.leftSideParent.style.borderLeft = border;
    this.leftSideParent.style.borderTop = border;
    this.leftSideParent.style.borderBottom = border;
    this.leftSideParent.style["border-top-left-radius"] = "10px";
    this.leftSideParent.style["border-bottom-left-radius"] = "10px";    

    this.el.appendChild(this.leftSideParent);
    
    this.initSearchText();
    this.addSpaceDiv(this.leftSideParent, 15, true);
    this.initLeftSideMenus();
};

TCWebtopAnaMenu.prototype.initSearchText = function () { 
    this.initSearchTextParent = document.createElement('div'); 
    this.initSearchTextParent.style.position = "relative";
    this.initSearchTextParent.style.backgroundColor ="rgba(201, 201, 201, 0.23)";
    this.initSearchTextParent.style.display = "flex";
    this.initSearchTextParent.style.width = "100%";
    this.initSearchTextParent.style.height = "40px";
    this.initSearchTextParent.style.boxSizing = "border-box";
    this.initSearchTextParent.style.borderRadius = "7px";
    this.initSearchTextParent.style.padding = "6px";
    this.leftSideParent.appendChild(this.initSearchTextParent);
    
    this.menuLabelIcon = getIconDiv("sf sf-search");
    this.menuLabelIcon.style.fontSize = "20px";
    this.menuLabelIcon.style.marginRight = "5px";
    this.menuLabelIcon.style.color = "silver";

    this.initSearchTextParent.appendChild(this.menuLabelIcon);

    this.aramaText1 = new ActiveForm.TCText();
    this.aramaText1.setOwner(ActiveForm);
    this.aramaText1.setParent(this.initSearchTextParent);
    this.initSearchTextParent.appendChild(this.aramaText1.el);

    this.aramaText1.setFontSize(15);
    this.aramaText1.el.style.position = "relative";
    this.aramaText1.el.style.width = "100%";
    this.aramaText1.setNoStyleChange(true);
    this.aramaText1.el.style.background = "transparent";
    this.aramaText1.el.style.border = "none";
    this.aramaText1.el.style.color = "white";
    this.aramaText1.el.placeholder = "search";
    this.aramaText1.setKeyUp(this.searchKeyUp);
    this.aramaText1.self = this;

    var self_ = this;
    this.aramaText1.el.onfocus = function (e) {
        self_.initSearchTextParent.style.backgroundColor ="rgb(235 231 231 / 68%)";
        self_.initSearchTextParent.style.boxShadow = "0 1.6px 3.6px 0 rgb(0 0 0 / 13%), 0 0.3px 0.9px 0 rgb(0 0 0 / 11%)";
        
        self_.aramaText1.el.style.color = "black";
        self_.menuLabelIcon.style.color = "rgb(0, 149, 182)";
    };
    
    this.aramaText1.el.onblur = function (e) {
        self_.initSearchTextParent.style.backgroundColor ="rgba(201, 201, 201, 0.23)";
        self_.initSearchTextParent.style.boxShadow = "none";
        self_.aramaText1.el.style.color = "white";
        self_.menuLabelIcon.style.color = "silver";
    };
};

TCWebtopAnaMenu.prototype.addSpaceDiv = function(prnts, h, isline) {
    var spaceDiv = document.createElement('div');
    spaceDiv.style.position = "relative";
    spaceDiv.style.width = "100%";
    spaceDiv.style.height = makePX(h);
    if (isPresent(isline)) {
        var spaceDivLine = document.createElement('div');
        spaceDivLine.style.position = "relative";
        spaceDivLine.style.width = "100%";
        spaceDivLine.style.marginTop = "6px";
        spaceDivLine.style.height = makePX(1);
        spaceDivLine.style.background = "silver";
        spaceDivLine.style.boxShadow = "rgb(64 52 52 / 9%) 0px 0.1rem 0.1rem";
        spaceDiv.appendChild(spaceDivLine);
    }
    prnts.appendChild(spaceDiv);
};

TCWebtopAnaMenu.prototype.getMenusParent = function() {
    var menuParent = document.createElement('div');
    menuParent.style.position = "relative";
    menuParent.style.padding = "2px";
    menuParent.style.display = "flex";
    menuParent.style["flex-direction"] = "row";
    menuParent.style["flex-wrap"] = "wrap";
    menuParent.style.overflow = "auto";
    menuParent.style["align-content"] = "flex-start";
    return menuParent;
};

TCWebtopAnaMenu.prototype.initLeftSideMenus = function() {
    this.lsParentL = this.getMenusParent();
    this.lsParentL.style.height = makePX(500);
    this.leftSideParent.appendChild(this.lsParentL);    

    this.lmGroupL = new TCSMenuGroup(this, this.lsParentL, menuTypeLeft);
    var modulform = { baslik : CZMtranslate(this, "Modüller") , iconname : null };
    this.lmGroupL.setCaption(modulform);
    for (var i=0; i < this.datasets.moduller.length;i++) {
        var modul = this.datasets.moduller[i];
        if (modul.ustmdkey == 0)
            this.lmGroupL.addItem(modul);
    }
    this.lmGroupL.setColorStyle(paramStyleDark);        
   
};

TCWebtopAnaMenu.prototype.setLeftMenuFromOrder = function (mdkey) { 
    this.selectedMdKey = mdkey;
};

TCWebtopAnaMenu.prototype.initRightSide = function () { 
    this.rightSideParent = document.createElement('div'); 
    this.rightSideParent.style.position = "relative";
    this.rightSideParent.style.backgroundColor ="white";
    this.rightSideParent.style.width = "65%";
    this.rightSideParent.style.height = "100%";
    this.rightSideParent.style.boxSizing = "border-box";
    this.rightSideParent.style.padding = "10px";
    
    this.rightSideParent.style["border-top-right-radius"] = "10px";
    this.rightSideParent.style["border-bottom-right-radius"] = "10px";    
    this.el.appendChild(this.rightSideParent);

    this.addSpaceDiv(this.rightSideParent, 42);
    this.addSpaceDiv(this.rightSideParent, 20, true);
};

TCWebtopAnaMenu.prototype.initRightSideParent = function() {
    if (isPresent(this.lsParentR)) {
        this.rightSideParent.removeChild(this.lsParentR);        
    }
    this.lsParentR = this.getMenusParent();
    this.lsParentR.style.height = makePX(600);
    this.lsParentR.style.background = "white";
    this.rightSideParent.appendChild(this.lsParentR);    
};

TCWebtopAnaMenu.prototype.getModul = function(mdkey) {
    for (var i=0; i < this.datasets.moduller.length;i++) {
        if (this.datasets.moduller[i].mdkey == mdkey) {
            return this.datasets.moduller[i];
        }
    }
};

TCWebtopAnaMenu.prototype.searchKeyUp = function(keyCode, ctrl, shift) {
    if (keyCode != VK_TAB && keyCode != VK_RETURN && keyCode != VK_UP && keyCode != VK_DOWN && keyCode != VK_LEFT && 
        keyCode != VK_RIGHT && keyCode != VK_HOME && keyCode != VK_END) {
        if (this.self.araTimer != null) {
            clearTimeout(this.self.araTimer);
        }
        this.self.araTimer = setTimeout(this.self.araQueryRun.bind(this.self), 400);
    }
};

TCWebtopAnaMenu.prototype.araQueryRun = function() {
    var aranan = this.aramaText1.getCaption();
    var mdKeys = [];
    
    //if aranan.length > 0

    for (var ii=0; ii < this.datasets.formlar.length; ii++) {
        var form = this.datasets.formlar[ii];
        
        this.datasets.formlar[ii].isFind = false;
        
        if (form.baslik.indexOf(aranan) > -1) {
            this.datasets.formlar[ii].isFind = true;
            var mdkey = this.datasets.formlar[ii].mdkey;
            function isExist(element) {
                return element % mdkey == 0;
            }
            if (!mdKeys.find(isExist)) {
                mdKeys.push(mdkey);
            }
        }
    }

    if (mdKeys.length > 0) {
        this.initRightSideParent();
        for (var i=0; i < mdKeys.length; i++) {
            var modul = this.getModul(mdKeys[i]);
            this.initRightSideMenus(modul, true);
        }
    } 

};


TCWebtopAnaMenu.prototype.initRightSideMenus = function(modulform, issearch) {
    if (!issearch)
        this.initRightSideParent();

    this.initKontrolFormItems(modulform.mdkey, modulform, issearch);
    
    for (var i=0; i < this.datasets.moduller.length;i++) {
        var modul = this.datasets.moduller[i];
        if (modul.ustmdkey == modulform.mdkey) {
            var kontrolMdKey = this.getLastFolder(modul.mdkey);
            this.initKontrolFormItems(kontrolMdKey, modul, issearch);
        }
    } 
};

TCWebtopAnaMenu.prototype.initKontrolFormItems = function(mdkey, modul, issearch) {
    var group = null; 
    for (var ii=0; ii < this.datasets.formlar.length; ii++) {
        var form = this.datasets.formlar[ii];
        if ((form.mdkey == mdkey && issearch == false) || (form.mdkey == mdkey && issearch && form.isFind)) {
            form.iconname = "sf-folder-open-o";
            if (group == null) {
                group = new TCSMenuGroup(this, this.lsParentR, menuTypeRight);
                group.setCaption(modul);
            }
            group.addItem(form);
        }
    }

    if (group != null) {
        var columncount = 2;
        group.setEndSettings(columncount, paramStyleLight);
        this.addSpaceDiv(this.lsParentR, 15);       
    }
};

TCWebtopAnaMenu.prototype.getLastFolder = function(mdkey) {
    var result = mdkey;
    for (var i=0; i < this.datasets.moduller.length;i++) {
        var modul = this.datasets.moduller[i];
        if (modul.ustmdkey == mdkey) {
            return this.getLastFolder(modul.mdkey);
        }
    }       
    return result; 
};

TCWebtopAnaMenu.prototype.setMenuItemOnClick = function(modulform, rightLeft) {
    if (rightLeft == menuTypeLeft) {
        this.initRightSideMenus(modulform, false);
    } else 
        alert("order");
};


