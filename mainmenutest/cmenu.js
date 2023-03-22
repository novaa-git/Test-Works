var paramStyleDark = 0;
var paramStyleLight = 1;
var paramMenuListModuls = 0;
var paramMenuListReports = 1;
var menuTypeLeft = 0;
var menuTypeRight = 1;
var paramShortcutMdKey = 99998;

function getCssClasses() {
    return null; /**!!*/
}

function getToolIcoBack() {
    var toolIcoBack = document.createElement('div'); 
    toolIcoBack.className = "wtmToolIcon";
    return toolIcoBack;
};

function TCSDatasets() {
    this.owner = null;
    this.form = null;
    this.moduller = [];
    this.formlar = [];
    this.raporlar = [];
    this.sonkullan = [];
    this.userForm = [];
    this.sbt_searchu = CZMtranslate(null, "Kayıt Bulunamadı");
    this.sbt_search = CZMtranslate(null, "Arama");
    this.sbt_reports = CZMtranslate(null, "Raporlar");
    this.sbt_settings = CZMtranslate(null, "Ayarlar");
    this.sbt_modules = CZMtranslate(null, "Modüller");
    this.sbt_kisayol = CZMtranslate(null, "Kısayollar");
    this.sbt_kisayolT = CZMtranslate(null, "Kısayolları Düzenle");
    this.sbt_sonkullan = CZMtranslate(null, "Son Kullanılanlar");
    this.sbt_kullaniciTanimli = CZMtranslate(null, "Kullanıcı Tanımlı Formlar");
    this.isReportExist = false;
    this.isUserPatient = (isPresent(MostParentWindow.HastaKey) && MostParentWindow.HastaKey > 0);
    this.isFullLoad = false;
};

TCSDatasets.prototype.quickAccesModul = function() {
    var qa = {ismodul : true, modulno : 0, ustmdkey: 0, mdkey:-2, baslik: this.sbt_sonkullan, basliktr: this.sbt_sonkullan, iconname: "sf-shortcut" };
    return qa;
};

TCSDatasets.prototype.userDefinedModul = function() {
    var qa = {ismodul : true, modulno : 0, ustmdkey: 0, mdkey:99999, baslik: this.sbt_kullaniciTanimli, basliktr: this.sbt_kullaniciTanimli, iconname: "sf-user-tie" };
    return qa;
};

TCSDatasets.prototype.shortcutModul = function() {
    var qa = {ismodul : true, modulno : 0, ustmdkey: 0, isshortcut: true, mdkey:paramShortcutMdKey, baslik: this.sbt_kisayol, basliktr: this.sbt_kisayol, iconname: "sf-shortcut" };
    return qa;
};

TCSDatasets.prototype.getNewDataset = function(action, afterlocate) {
    var returnDataset = this.form.TCDataSet();
    returnDataset.setOwner(this.form);
    returnDataset.setAction(action);
    returnDataset.onfields();
    returnDataset.setAsync(true);
    returnDataset.self = this;
    returnDataset.setOnAfterLocate(afterlocate);
    return returnDataset;
};

TCSDatasets.prototype.setOwner = function(owner) {
    this.owner = owner;
    this.form = this.owner.getForm();
    
    this.modulSorgu = this.getNewDataset("./AnaMenuModuller.do", this.setModulsAfterLocate);
    this.modulSorgu.setLocateDSet(this.getNewDataset("./AnaMenuModuller.do"));
 
    this.formSorgu = this.getNewDataset("./AnaMenuFormlar.do", this.setFormsAfterLocate); 
    this.formSorgu.setLocateDSet(this.getNewDataset("./AnaMenuFormlar.do"));

    this.raporSorgu = this.getNewDataset("./AnaMenuFormlar.do", this.setRaporAfterLocate); 
    this.raporSorgu.AddStringField("RAPOR", false);
    this.raporSorgu.setLocateDSet(this.getNewDataset("./AnaMenuFormlar.do"));
     
    this.kisayolList = this.getNewDataset("./KisayolList.do", this.setKisayolAfterLocate); 
    this.kisayolList.addKeyField("ANGULAR");
    this.kisayolList.setLocateDSet(this.getNewDataset("./AnaMenuModuller.do"));

    this.setModulSorguQuery();
};

TCSDatasets.prototype.setModulSorguQuery = function() {
    this.modulSorgu.FieldByName("YENIMENUTASARIMPARAMETRE").setValue("1");
    this.modulSorgu.FieldByName("USTMENUKRITERIUYGULAMA").setValue("E");
    this.modulSorgu.locate();
};

TCSDatasets.prototype.setFormSorguQuery = function() {
    this.formSorgu.FieldByName("YENIMENUTASARIMPARAMETRE").setValue("1");
    this.formSorgu.locate();
};

TCSDatasets.prototype.setRaporSorguQuery = function() {
    this.raporSorgu.FieldByName("RAPOR").setValue("E"); 
    this.raporSorgu.FieldByName("YENIMENUTASARIMPARAMETRE").setValue("1");
    this.raporSorgu.locate();
};

TCSDatasets.prototype.setKisayolSorguQuery = function() {
    this.kisayolList.FieldByName("ANGULAR").setValue("E"); 
    this.kisayolList.locate();
};

TCSDatasets.prototype.setModulsAfterLocate = function() {
    this.self.modulFormLoad(this.locateDSet, true, this.self.moduller, false, false);
    this.self.moduller.push(this.self.userDefinedModul());
    this.self.setKisayolSorguQuery();
};

TCSDatasets.prototype.setFormsAfterLocate = function() {
    this.self.modulFormLoad(this.locateDSet, false, this.self.formlar, false, false);
    this.self.afterModulFormLoad();
    this.self.owner.setInitPanels();   
    this.self.isFullLoad = true;
    this.self.setRaporSorguQuery();
};

TCSDatasets.prototype.setRaporAfterLocate = function() {
    if (!this.isUserPatient) {
        this.self.modulFormLoad(this.locateDSet, false, this.self.raporlar, true, false);
        if (!this.self.isReportExist) { 
            this.self.owner.tblReports.isActive = false;
            this.self.owner.tblReports.style.color = "#b7b7b7";
            this.self.owner.tblReports.style["text-shadow"] = "unset";
        }
    }
};

TCSDatasets.prototype.setKisayolAfterLocate = function() {
    if ((!this.isUserPatient) && (this.locateDSet.recordCount() > 0) ) {
        this.self.moduller.splice( 0, 0, this.self.shortcutModul());
        this.self.modulFormLoad(this.locateDSet, false, this.self.formlar, false, true);
    }
    this.self.setFormSorguQuery();
};

TCSDatasets.prototype.afterModulFormLoad = function() {
    for (var i=0; i < this.userForm.length; i++) {
     var mdKey = this.userForm[i].mdkey; // Kullanici tanimli formlar.
        for (var a=0; a < this.formlar.length; a++) {
            if (this.formlar[a].mdkey == mdKey)
                this.formlar[a].mdkey = 99999;
        }
    }
    /*
    this.userForm = this.userForm.sort((a, b) => {
        if (a.baslik < b.baslik) {
          return -1;
        }
      });    
      */
};

TCSDatasets.prototype.modulFormLoad = function(dataset, ismodul, sarray, isreport, isshortcut) {
    for (var i = 1; i <= dataset.recordCount(); i++) {
        var modul = this.datasetToModulForm(dataset, ismodul, isreport, isshortcut);
        if (modul != null) {
            if (modul.ismodul && modul.kullaniciTanimli == "E") {
                this.userForm.push(modul);
            } else {
                sarray.push(modul);
            }
        }
        dataset.next();
    }
};

TCSDatasets.prototype.getFormReport = function() {
    if (this.owner.menuListType == paramMenuListReports)
        return this.raporlar;
    return this.formlar;
};

TCSDatasets.prototype.datasetToModulForm = function(dset, ismodul, isreport, isshortcut) {
    var modulform = {};
    if (ismodul) {
        modulform.ismodul = true;
        modulform.goster = true;
        modulform.isreport = false;
        modulform.isshortcut = false;
        modulform.modulno = dset.FieldByName("MODULNO").getValue();
        modulform.kullaniciTanimli = dset.FieldByName("KULLANICITANIMLI").getValue();
        modulform.baslik = dset.FieldByName("MODULAD").getValue();
        modulform.basliktr = dset.FieldByName("MODULADTR").getValue();
        modulform.mdkey = dset.FieldByName("MD_KEY").getAsInteger();
        modulform.ustmdkey = dset.FieldByName("USTMDKEY").getAsInteger();
        modulform.iconname = dset.FieldByName("ICONNAME").getValue();
        if (modulform.iconname.trim() == "") 
            modulform.iconname = "sf-folder-open-o";
    } else {
        modulform.itemId = 0;
        modulform.ismodul = false;
        modulform.isFind = false; // Memory değeri, aramada bulundu.

        modulform.kullaniciTanimli = false;
        modulform.fr_key = dset.FieldByName("FR_KEY").getAsInteger();
        modulform.mdkey = dset.FieldByName("MD_KEY").getAsInteger();
        modulform.md_fr_key = dset.FieldByName("MD_FR_KEY").getAsInteger();
        modulform.iconname = dset.FieldByName("ICONNAME").getValue();
        modulform.ww = dset.FieldByName("WIDTH").getValue();
        modulform.wh = dset.FieldByName("HEIGHT").getValue();
        modulform.renk = dset.FieldByName("RENK").getValue();
        modulform.raporadi = dset.FieldByName("RAPORADI").getValue();

        if (!isshortcut) {
            modulform.isshortcut = false;
            modulform.params = dset.FieldByName("PARAMS").getValue();
            modulform.disBaglanti = dset.FieldByName("ERISIMADRESI").getValue();
            modulform.disBaglantiOk = (isPresent(modulform.disBaglanti) && modulform.disBaglanti != "");
            modulform.yeniSayfa = dset.FieldByName("YENISAYFA").getValue();

            if (dset.FieldByName('MENUTEXTTR') != null) {
                modulform.baslik = dset.FieldByName("MENUTEXT").getValue();
                modulform.basliktr = dset.FieldByName("MENUTEXTTR").getValue();
            } else {
                modulform.baslik = dset.FieldByName("FORMAD").getValue(); // kısayollar.
                modulform.basliktr = modulform.wt;
                modulform.modal = dset.FieldByName("MODAL").getValue();
            }
        } else if (isshortcut) {
                modulform.isshortcut = true;
                modulform.mdkey = paramShortcutMdKey;
                modulform.baslik = dset.FieldByName("MENUTEXT").getValue();
                modulform.basliktr = dset.FieldByName("MENUTEXT").getValue();
            }
        
        modulform.isreport = isreport;
        if (isreport) {
            modulform.iconname = "sf-printer";
        }

        if (modulform.raporadi != "" && modulform.fr_key == "240") {
            this.isReportExist = true;
            modulform.iconname = "sf-printer";
        } else 
            if (isreport && (modulform.raporadi == "") && (modulform.fr_key != "240")) {
                return null; // Rapor içeriğinde gelip rapor parametreleri uygun değil!
            }
    }
    
    if (modulform.iconname == "") 
        modulform.iconname = "sf-z-file";
    else {
        modulform.iconname = modulform.iconname.replace("sf-moduleDefault","");  
        modulform.iconname = modulform.iconname.replace("sf ",""); // ??
    }
    modulform.iconname = modulform.iconname.replace("sf-moduleDefault","");  
    modulform.isLastOpen = false;
    return modulform;
};

function TCSMenuColorStyle(item, style) {
    this.selectedColorDark = "rgba(0, 0, 0, 0.32)";
    if (mobileAndTabletCheck())
        this.selectedColorDark = "rgb(0 120 212)";
    this.selectOverColorDark = "rgb(0 0 0 / 14%)";
    
    this.selectOverColorLight = "rgb(0, 120, 212)";
    this.selectedColorLight = this.selectOverColorLight;
    
    this.selectedColorLastOpenLight = "#FDEDBA";
    this.selectFontColorDark = "black";
    this.selectFontColorWhite = "white";
    this.defaultBackColor = "transparent";
    this.defaultFontColor = "white";
    this.defaultBackColorFrmRap = "rgb(204 212 219 / 60%)";
    
    this.searchBackColor = "rgba(204,232,255,255)";
    this.searchBorderColor = "rgba(159,205,242,255)";
    
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
        
        this.defaultFontColor = this.selectFontColorWhite;
        this.setItemFontColor(this.defaultFontColor);
    } else {
        this.menuItem.el.style.background = this.defaultBackColor;
        this.defaultFontColor = (this.style == paramStyleDark) ? this.selectFontColorWhite : this.selectFontColorDark;
        this.setItemFontColor(this.defaultFontColor);
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

TCSMenuColorStyle.prototype.setEnable = function(s) {};

TCSMenuColorStyle.prototype.initMenuItemStyle = function() {
    if (this.menuItem.getFormIsOpened()) {
        this.defaultBackColorFrmRap = this.selectedColorLastOpenLight;
    }
    this.defaultFontColor = (this.style == paramStyleDark) ? this.selectFontColorWhite : this.selectFontColorDark;
    this.setItemFontColor(this.defaultFontColor);
    this.defaultBackColor = (this.style == paramStyleDark) ? "transparent" : this.defaultBackColorFrmRap;  
    this.menuItem.setBackColor(this.defaultBackColor); 
};

TCSMenuColorStyle.prototype.setItemFontColor = function(f) {
    this.menuItem.lblC.style.color = f;
    this.menuItem.lblIco.style.color = f; 
};

function getIconDiv(classname, fontsize, color) {
    var ico = document.createElement('div');
    ico.className = classname + " wtmIconItem";
    if (isPresent(fontsize)) {
        ico.style.fontSize = fontsize;
    }
    if (isPresent(color)) {
        ico.style.color = color;
    }
    return ico;        
};

function TCControlBase() {
    this.el = document.createElement('div'); 
    this.tabStop = true;
    this.name = "";
    this.anamenu = null;
};

TCControlBase.prototype.setControlName = function(n) {
    this.name = n;
};

TCControlBase.prototype.setTabStop = function(t) {
    this.tabStop = t;
};

TCControlBase.prototype.getTabStop = function() {
    return this.tabStop;        
};

TCControlBase.prototype.getTabIndex = function() {
    return this.el.tabIndex;
};

TCControlBase.prototype.setTabIndex = function(i) {
    this.el.tabIndex = i;
};

TCControlBase.prototype.setAnaMenu = function(a) {
    this.anamenu = a;
};

TCControlBase.prototype.setFocus = function(i) {
};

TCSMenuItem.prototype = new TCControlBase();

function TCSMenuItem(parent) {
    this.classAdi = "TCSMenuItem";
    this.setControlName(this.classAdi);
    this.parent = parent;
    this.owner = null;
    this.group = null;
    this.caption = "";
    this.icon = null;
    this.selected = false;
    this.enabled = true;
    this.order = 0;
    this.menuColorStyle = new TCSMenuColorStyle(this, paramStyleDark);
    this.onClick = null;
    this.modulform = null;
    this.verhorz = "H";
    this.itemId = 0;    
};

TCSMenuItem.prototype.setModulForm = function(m) {
    this.modulform = m;
    this.setItemCaption(this.modulform.baslik);
    this.setItemIcon(this.modulform.iconname);
    this.setItemOrder(this.modulform.mdkey);    
};

TCSMenuItem.prototype.getFormIsOpened = function() {
    return false;
};

TCSMenuItem.prototype.setVerticalHorizontal = function(a) {
    this.verhorz = a;
};

TCSMenuItem.prototype.setOwnerGroup = function(g) {
    this.group = g; 
    this.owner = g.mainMenu;
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

TCSMenuItem.prototype.isLeftMenu = function(i) {
    return (this.group.isMenuTypeLeft());
};

var beforeTop = 0;


TCSMenuItem.prototype.setSelected = function(s, keycode) {
    if (isPresent(this.icoShortCut))
        this.icoShortCut.style.visibility =  s ? "visible" : "hidden";

    this.selected = s;
    if (keycode == 0) {
    }  else {
        var rect = this.el.getBoundingClientRect();
        var tp = rect.top ;
        var nextTrue = false;        

        if ((this.selected))  {
            if ((tp - beforeTop)  > 38 || (beforeTop - tp) > 38)
                nextTrue = true;

            beforeTop = tp;
             
            var elHeight = styleToPixel(this.el.style.height);
            var ownerHeight = styleToPixel(this.parent.style.height);
            tp += this.parent.scrollTop;   

            if (nextTrue) {
                if (((keycode == VK_UP) || (keycode== VK_LEFT)) && ((this.parent.scrollTop > 0) && (rect.top - elHeight < this.parent.scrollTop)) ) {  
                    this.parent.scrollTop = rect.top - elHeight;
                    if (this.parent.scrollTop < elHeight * 2)
                        this.parent.scrollTop = 0;
                } else 
                if ((keycode == VK_TAB) || (keycode == VK_DOWN) || (keycode== VK_RIGHT)) {
                    if (tp + elHeight > this.parent.scrollTop + ownerHeight) {  
                        var newT = tp - (ownerHeight + elHeight);
                        if (newT > 0)
                            this.parent.scrollTop = newT ;
                    }
                }
            }
        }
    }
    this.menuColorStyle.select();
};
 
TCSMenuItem.prototype.seItemClick = function() {
    this.group.mainMenu.setMenuItemOnClick(this.modulform, this.group.menuType);
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

    //if (this.group.menuType == menuTypeRight)
      //  this.setMenuItemVertical();
};

TCSMenuItem.prototype.setMenuItemVertical = function() { // TODO
    this.el.style.width = "120px";
    this.el.style.height = "100px";
    this.el.style.flexDirection = "column";
    this.el.style.justifyContent = "space-evenly";
    
    this.lblIco.style.fontSize = "32px";
    this.lblC.style.fontSize = "12.4px";
    this.lblC.style["text-align"] = "center";
};

TCSMenuItem.prototype.initMenuItem = function() {
    this.el = document.createElement('div');
    this.el.className =  "wtmMenuItem";
    var self_ = this;
    this.el.onmouseover = function () {
        self_.menuColorStyle.mouseOver();
    };
    
    this.el.onmouseout = function (){
        self_.menuColorStyle.mouseLeave();
    };

    this.el.onclick = function (e) {
        if (!self_.isLeftMenu() || (!self_.selected)) 
            self_.group.setSelected(self_.order, self_, true);
    };
    
    this.initItemCaption();
    this.parent.appendChild(this.el);
};

function setHighlightText(item, text) {
    var aranansplit = text.split(" ");
    if (aranansplit.length == 0)
        return;

    var innerHTML = "";
    var tmpStr = item.innerHTML;
    var beforeIndexOf = -1;
    
    //console.log("spllit count:" + aranansplit.length) ;
    
    for (var bb = 0; bb < aranansplit.length; bb++) { 
       var arananText = aranansplit[bb];
       if (arananText != "") {
           var bulIndex = isSearchTextExistPosition(arananText, tmpStr, null, beforeIndexOf);
           var devam = (bulIndex > -1);  
           if ((devam)) {
              innerHTML += "<span>" + tmpStr.substring(0, bulIndex).replaceAll(" ","&nbsp;") + "</span>" + 
                           "<span style='font-weight:bold; font-size:13px'>" + tmpStr.substring(bulIndex, bulIndex + arananText.length) + "</span>";
              tmpStr = tmpStr.substring(bulIndex + arananText.length);
             beforeIndexOf = bulIndex;
           }  
       }
       if (bb + 1 == aranansplit.length)
         innerHTML += "<span>" + tmpStr.replaceAll(" ","&nbsp;") + "</span>";
    }
    item.innerHTML = innerHTML;
}
 
TCSMenuItem.prototype.initItemCaption = function() {
    this.lblC = document.createElement('div');
    this.lblC.className = "wtmCaptionItem";

    if (this.isLeftMenu())
        this.lblC.style["text-shadow"] = "0 0 4px rgb(0 0 0 / 60%)";

    var ekleCaption = this.caption;
    if (this.isLeftMenu() && (ekleCaption.length > 45))
        ekleCaption = ekleCaption.substring(0,45) + "..";
    
    var isNoCaption = (mobileAndTabletCheck() && this.isLeftMenu());
    if (!isNoCaption)
        setDOMText(this.lblC, ekleCaption); 
        
    if (isPresent(this.group) && isPresent(this.group.mainMenu)) {
        var araText = this.group.mainMenu.getAraText();
        if (araText != "") {
            searchOn = true;
            setHighlightText(this.lblC, araText);
        }
    }

    this.lblIco = getIconDiv(this.icon);
    this.el.appendChild(this.lblIco);
    this.el.appendChild(this.lblC);

    if (this.isLeftMenu())
        this.lblIco.style["text-shadow"] = "0 0 4px rgb(0 0 0 / 40%)";

    if (isPresent(this.modulform.md_fr_key))
        this.el.title = this.caption + " / " + this.modulform.md_fr_key;

    if (!mobileAndTabletCheck() && (this.isLeftMenu()) && (this.modulform.mdkey == paramShortcutMdKey)) {
        this.icoShortCut = getIconDiv("sf-folder-open-o");
        this.icoShortCut.style.visibility = "hidden";
        this.icoShortCut.style.margin = "0px 4px 0px auto";
        this.icoShortCut.style.color = "white";
        this.icoShortCut.style.cursor = "pointer";
        this.icoShortCut.style.fontSize = "17px";
        this.icoShortCut.title = this.owner.datasets.sbt_kisayolT;
        this.icoShortCut.owner = this.owner;
        this.icoShortCut.onclick = function (e) {
            this.owner.setMenuKapat();
            ActiveForm.OpenModal(55);
        };
        this.el.appendChild(this.icoShortCut); 
    }
};

function getNewItem(owner, modul) {
    var item = new TCSMenuItem(owner.parent);
    item.setOwnerGroup(owner);
    item.setModulForm(modul);  
    item.initMenuItem();
    return item;
}

function TCSMenuGroup(mainmenu, parent, menutype) {
    this.classAdi = "TCSMenuGroup";
    this.caption = "";
    this.groupItems = [];
    this.parent = parent;
    this.elCaption = null;
    this.colCount = 1;
    this.mainMenu = mainmenu;
    this.menuType = menutype;
    this.mdKey = 0;
};

TCSMenuGroup.prototype.setColumn = function(c) {
    this.colCount = c;
    for (var i=0; i < this.groupItems.length; i++) {
        this.groupItems[i].setColumCount(this.colCount);
    }    
};

TCSMenuGroup.prototype.setEndSettings = function(colcount, colorstyle) {
    if (colcount != null)
        this.setColumn(colcount);
    if (colorstyle != null)
        this.setColorStyle(colorstyle);
};

function getRibbonColor(mdkey) {
    var COLOR_BLUE = "rgb(0, 120, 212)";
    var COLOR_GREEN = "#04AA6D";
    var COLOR_RED = "#de3163";
    if (mdkey == paramShortcutMdKey) {
        return COLOR_GREEN;
    } else 
        return COLOR_BLUE;
};

TCSMenuGroup.prototype.setCaption = function(modulform, issearch) {
    this.caption = modulform.baslik;
    if (this.elCaptionParent == null) {
        this.elCaptionParent = document.createElement('div');
        this.elCaptionParent.className = "wtmCaptionParent";

        this.elCaptionParent2 = document.createElement('div');
        this.elCaptionParent2.className = "ribbon-container";
        
        this.elCaptionParent.appendChild(this.elCaptionParent2);

        this.elCaption = document.createElement('div');
        this.elCaption.className = "ribbon-text";

        setDOMText(this.elCaption, this.caption);
        
        this.elCaptionParent2.appendChild(this.elCaption);
        this.elCaption.style.fontSize = "13px !important";
        
       if (issearch==false) {
            this.parent.appendChild(this.elCaptionParent);
       }

       var selectColor = getRibbonColor(modulform.mdkey);
       this.elCaptionParent2.style.setProperty('--selectcolor', selectColor);
       this.elCaption.style.setProperty('--selectcolor', selectColor);
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

TCSMenuGroup.prototype.addItem = function(modulform) {
    var item = getNewItem(this,  modulform); 
    item.itemId = modulform.itemId;
    this.groupItems.push(item);
    return item;
};

TCSMenuGroup.prototype.isMenuTypeLeft = function() {
    return (this.menuType == menuTypeLeft);
};

TCSMenuGroup.prototype.setSelected = function(order, item) {
    for (var i=0; i < this.groupItems.length; i++) {
        this.groupItems[i].setSelected(false, 0);
    }
    var findItem = null;   
    for (var i=0; i < this.groupItems.length; i++) {
        var kontrolItem = this.groupItems[i];
        if (this.isMenuTypeLeft() &&  (kontrolItem.order == order) ) {
            findItem = kontrolItem;
            kontrolItem.setSelected(true, 0);
            this.mainMenu.setLeftMenuFromOrder(order);
            break;
        } else 

      
        if ((this.menuType == menuTypeRight) && (kontrolItem.modulform.md_fr_key == item.modulform.md_fr_key) ) {
            findItem = kontrolItem;
            break;
        } 
    }

    if (isPresent(findItem)) {
        findItem.seItemClick();
    }
};

TCWebtopAnaMenu.prototype = new TCControlBase();

function TCWebtopAnaMenu() {
    var astyle = getCssClasses();
    document.getElementsByTagName('head')[0].appendChild(astyle);

    this.parent = null;
    this.owner = null;
    this.classAdi = "TCWebtopAnaMenu";
    this.setControlName(this.classAdi);
    
    this.datasets = new TCSDatasets();
    this.isVisible = false;
    this.elBack = document.createElement('div'); 
    this.elBack.style.position = "absolute";
    this.elBack.style.backgroundColor ="rgb(0 0 0 / 22%)";
    this.elBack.style.boxSizing = "border-box";
    this.elBack.isParent = this;
    this.elBack.style.display = "none";

    this.setBackPanelUpdate();

    // el objesi TCControlBase'den kalıtım ile geliyor. 
    this.el.style.position = "absolute";
    this.el.className = "frmmodal";

    if (mobileAndTabletCheck()) {
        this.el.style.height = makePX(ActiveForm.getClientHeight()-61);
        this.el.style.width = makePX(ActiveForm.getClientWidth());
    } else {
        this.el.style.height = "700px";
        this.el.style.width = "900px";
        //this.el.style.height = makePX(ActiveForm.getClientHeight()-40);
    }
    this.isFullScreen = false;
            
    this.el.style.backgroundColor ="transparent";
    this.el.creator = this;
    this.el.style.top = "0px";
    this.el.style.left = "1px";
    this.el.style.boxSizing = "border-box";
    this.el.style.display = "flex";
    
    this.elBack.appendChild(this.el);

    this.leftSideParent = null;
    this.rightSideParent = null;
    this.smdkey = 0;
    
    this.el.isowner = this;
    this.el.isDown = false;
    this.el.cursor = {x1: 0, y1: 0};
    
    var self_ = this.el;
    var self = this;
    
    function onControlMouseDown(event) {
        event.preventDefault();
        if (isPresent(event.target.tagName) && (event.target.tagName == "DIV")) {
            self.elBack.removeEventListener("click", self.backOnClick);
            self_.isDown = true;
            self_.cursor.x1 = event.clientX - self_.offsetLeft;
            self_.cursor.y1 = event.clientY - self_.offsetTop;
            stopEvent(event); 
            return false; 
        }
    };

    function onControlMouseUp(event) {
        event.preventDefault();
        if (isPresent(self_)) {
            self_.isDown = false;
            self.endOfMove();
        }
    };
    
    window.addEventListener('mouseup', function(evt) {
        if (isPresent(self_) && self_.isDown) {
            self_.isDown = false;
        }
    });

    function onControlMouseMove(event) {
        if (isPresent(self_) && self_.isDown) {
            var oLeft = event.clientX - self_.cursor.x1;
            if (oLeft < 0) {
                oLeft = 1;
            }
            var oTop = event.clientY - self_.cursor.y1;
            if ((oLeft + self_.isowner.getWidth() - 1) > ActiveForm.getClientWidth()) {
                self_.style.left = makePX(ActiveForm.getClientWidth() - self_.isowner.getWidth());
            } else 
                self_.style.left = makePX(oLeft);

            if (oTop < 0) {
                oTop = 1;
            }
            self_.style.top = makePX(oTop);
            var isActive = (oTop > 5) && (oLeft > 5);
                self_.isowner.borderRadiusChangeFL(isActive);
            if ((isActive) && (oLeft > 15) && (oLeft > 15) && (self_.isowner.isFullScreen))
                self_.isowner.setTamEkran();
            
            stopEvent(event); 
            return false;                 
        }
    }

   
    if (!mobileAndTabletCheck()) {
        this.el.onmousemove = onControlMouseMove;
        this.el.onmouseup = onControlMouseUp;
        this.el.onmousedown = onControlMouseDown;
    }
    
    this.araTimer = null;
    this.tempSearchText = null;
    this.menuListType = paramMenuListModuls;
    this.selectItemId = 0;
    this.itemIdList = [];
    this.addList = [];
    this.groupList = [];
    this.itemIdOrder = 1;
    this.menuActive = true; 
    this.araToplamSonuc = 0;
};

TCWebtopAnaMenu.prototype.endOfMove = function() {
    this.elBack.addEventListener("click", this.backOnClick);
    this.owner.changeAnamenuLeftTop( this.getLeft() , this.getTop());
    this.tiFullScreen.className = "sf-expand" + " wtmIconItem";
};

TCWebtopAnaMenu.prototype.setUserMenuLeftTop = function() {
    var lefttop = this.owner.getAnamenuLeftTop();
    if (isPresent(lefttop)) {
        lefttop = lefttop.split(",");
        if (isNumeric(lefttop[0])) this.el.style.left = makePX(lefttop[0]);
        if (isNumeric(lefttop[1])) this.el.style.top = makePX(lefttop[1]);
    }
};

TCWebtopAnaMenu.prototype.setOwner = function(o) {
    this.owner = o;
    this.owner.AddControl(this);
    this.setParent(this.owner); 
    this.datasets.setOwner(this); 
    this.setUserMenuLeftTop();
};

TCWebtopAnaMenu.prototype.getVisible = function() {
    return this.isVisible;
};

TCWebtopAnaMenu.prototype.getLeft = function() {
    return parseInt(this.el.style.left);
};

TCWebtopAnaMenu.prototype.getTop = function() {
    return parseInt(this.el.style.top);
};

TCWebtopAnaMenu.prototype.setBackCssControlUptate = function(isactive) {
    if (!isactive) 
        this.leftSideParent.style.backgroundColor ="rgb(77 89 100 / 71%)"; 
        else         
            this.leftSideParent.style.backgroundColor ="rgb(201 201 201 / 23%)";
    
    if (isNotCssSupport()) {
        this.leftSideParent.style.backgroundColor ="rgb(77 89 100)";
    }  
    this.leftSideParent.style["backdrop-filter"] = "saturate(180%) blur(25px)";
};

TCWebtopAnaMenu.prototype.setBackPanelUpdate = function() {
    this.elBack.style.zIndex = "9999";
    this.elBack.style.left = "-1px";
    this.elBack.style.width = makePX(ActiveForm.getClientWidth());
    this.elBack.style.height = makePX(ActiveForm.getClientHeight()-40);
    this.elBack.style.top = "40px";
    if (mobileAndTabletCheck()) {
        this.elBack.style.top = "60px";
    }

    if (isPresent(MostParentWindow.WebTopTaskBar)) {
        if (isPresent(this.leftSideParent)) {
            if (MostParentWindow.WebTopTaskBar.items.length > 0) {
                if (!mobileAndTabletCheck())
                    this.elBack.style.height = makePX(ActiveForm.getClientHeight()-70);
                this.setBackCssControlUptate(false);
            } else 
                this.setBackCssControlUptate(true);
        }
    }
    
    if ((this.getLeft() > 5) && (this.getTop() > 5)) {
        this.borderRadiusChangeFL(true);
    }
};

TCWebtopAnaMenu.prototype.backOnClick = function(e) {
    if( e.target !== this) {
        return;
    }
    this.isParent.setMenuKapat();
};

TCWebtopAnaMenu.prototype.getHeight = function() {
    return styleToPixel(this.el.style.height);
};

TCWebtopAnaMenu.prototype.getWidth = function() {
    return styleToPixel(this.el.style.width);
};

TCWebtopAnaMenu.prototype.setMenuListType = function(t) {
    this.menuListType = t;
    this.defaultListe();
};

TCWebtopAnaMenu.prototype.setInitPanels = function(o) {
    this.initLeftSide();
    this.initRightSide();
    if (isPresent(this.datasets.moduller) && this.datasets.moduller.length>0) {
        this.setLeftMenuFromOrder(this.datasets.moduller[0].mdkey); 
        if (this.smdkey > 0) {
            this.lmGroupL.setSelected(this.smdkey);
        }
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
        MostParentWindow.document.body.appendChild(this.elBack);
    }
};

TCWebtopAnaMenu.prototype.initLeftSide = function () { 
    this.leftSideParentBase = document.createElement('div'); 
    this.leftSideParentBase.style.position = "relative";
    this.leftSideParentBase.style.boxSizing = "border-box";
    this.leftSideParentBase.style.backgroundColor = "#00000029";
    this.leftSideParentBase.style.borderRadius = "10px";

    if (mobileAndTabletCheck()) 
        this.leftSideParentBase.style.width = "82px";
        else     
            this.leftSideParentBase.style.width = "35%";

    this.el.appendChild(this.leftSideParentBase);

    this.leftSideParent = document.createElement('div'); 
    this.leftSideParent.style.position = "relative";
    this.leftSideParent.style.width = "100%";
    this.leftSideParent.style.height = "100%";
    this.leftSideParent.style.boxSizing = "border-box";
    this.leftSideParent.style.padding = "6px";
    if (!mobileAndTabletCheck()) 
        this.leftSideParent.style.paddingTop = "10px";
        else
            this.leftSideParent.style.paddingTop = "5px";

    this.leftSideParent.style.paddingRight = "10px";
    this.leftSideParent.onclick = null;
    
    var border = "2px solid rgb(161 161 161 / 18%)";
    this.leftSideParent.style.borderLeft = border;
    this.leftSideParent.style.borderTop = border;
    this.leftSideParent.style.borderBottom = border;
    this.setBackCssControlUptate(true);
    
    this.leftSideParentBase.appendChild(this.leftSideParent);

    this.addSpaceDiv(this.leftSideParent, 4);
    this.leftTopToolsIcons();
 
    this.addSpaceDiv(this.leftSideParent, 11, true);
    this.initLeftSideMenus();
    
    if (!mobileAndTabletCheck()) {
        var imgParent = document.createElement('div'); 
        imgParent.style.position = "relative";
        imgParent.style.marginTop = "5px";
        this.leftSideParent.appendChild(imgParent);
        this.sisoftLogo = document.createElement('img'); 
        this.sisoftLogo.style.position = "relative";
        this.sisoftLogo.style.paddingLeft = "10px";
        this.sisoftLogo.style.height = "24px";
        this.sisoftLogo.src = "./images/webtopmenu/cozumhbystoolbartext.png";
        imgParent.appendChild(this.sisoftLogo);
    }
};

TCWebtopAnaMenu.prototype.getToolsLabel = function(isactive, mtype) {
    var tblLabel = document.createElement('div'); 
    tblLabel.className = "wtmMenuLabel";
    if (mobileAndTabletCheck()) 
        tblLabel.style.padding = "unset";
    tblLabel.menuListType = mtype;
    tblLabel.isActive = true;
    var self_ = this;
    tblLabel.onclick = function (e) {
        self_.setActiveMenuChange(this);
    };
    return tblLabel;
};

TCWebtopAnaMenu.prototype.setMenuActiveColor = function(label, isactive) {
    if (isactive) {
        label.style.boxShadow = "rgb(8 8 8 / 8%) 0px 0.1rem 0.3rem";
        label.style.backgroundColor = "rgb(0, 120, 212)";
    } else {
        label.style.boxShadow = "none";
        label.style.backgroundColor = "rgba(165, 185, 202, 0.42)";
    }
};

TCWebtopAnaMenu.prototype.setActiveMenuChange = function(label) {
    if (!label.isActive)
        return;

    if (label.menuListType == this.menuListType)
        return;
    this.setMenuActiveColor(this.activeMenu, false);
    this.activeMenu = label;
    this.setMenuActiveColor(this.activeMenu, true);
    this.setMenuListType(label.menuListType);
    this.aramaText1.setFocus();
};

TCWebtopAnaMenu.prototype.leftTopToolsIcons = function() {
    this.sparentR = document.createElement('div'); 
    this.sparentR.style.position = "relative";
    this.sparentR.style.backgroundColor ="transparent";
    this.sparentR.style.display = "flex";
    this.sparentR.style.width = "100%";
    this.sparentR.style.height = "36px";
    this.sparentR.style["justify-content"] = "center";
    
    this.sparentR.style.boxSizing = "border-box";
    this.leftSideParent.appendChild(this.sparentR);

    this.tLblModules = this.getToolsLabel(true, paramMenuListModuls);
    this.tLblModules.style.borderRadius =  "5px 0px 0px 5px";
    this.tLblModules.style.borderRight =  "1px solid #c0c0c08a";
    if (!mobileAndTabletCheck()) 
        setDOMText(this.tLblModules, this.datasets.sbt_modules);
        else {
            var tLblModulesIcons = getIconDiv("sf-folder-open-o", "16px");
            tLblModulesIcons.style.color = "white";
            tLblModulesIcons.style.margin = "5px";
            tLblModulesIcons.onclick = function (e) {
            };
            this.tLblModules.appendChild(tLblModulesIcons);
        }

    this.sparentR.appendChild(this.tLblModules);
    this.setMenuActiveColor(this.tLblModules, true);

    this.tblReports = this.getToolsLabel(false, paramMenuListReports);
    this.tblReports.style.borderRadius ="0px 5px 5px 0px";
    if (!mobileAndTabletCheck()) 
        setDOMText(this.tblReports, this.datasets.sbt_reports);
        else {
            var tblReportsIcons = getIconDiv("sf-printer", "16px");
            tblReportsIcons.style.color = "white";
            tblReportsIcons.style.margin = "5px";
            tblReportsIcons.onclick = function (e) {
            };
            this.tblReports.appendChild(tblReportsIcons);

        }
    this.sparentR.appendChild(this.tblReports);
    this.setMenuActiveColor(this.tblReports, false);

    this.activeMenu = this.tLblModules;
};

var searchTextSelectColor = "#eeeeeed9";
var searchTextDefaultColor = "#eeeef0";



TCWebtopAnaMenu.prototype.initSearchText = function () { 
    this.initSearchParent = document.createElement('div'); 
    this.initSearchParent.style.position = "relative";
    this.initSearchParent.style.backgroundColor = "transparent"; 
    this.initSearchParent.style.display = "flex";
    this.initSearchParent.style.width = "100%";
    this.initSearchParent.style.height = "42px";
    this.initSearchParent.style.boxSizing = "border-box";
    this.initSearchParent.style.padding = "2px";    
    
    this.rightSideParent.appendChild(this.initSearchParent);
    if (!mobileAndTabletCheck()) {
        var iconToolsPanel1 = getToolIcoBack();
        iconToolsPanel1.style["flex-direction"] = "unset";
        iconToolsPanel1.style.width = "34px";
        this.initSearchParent.appendChild(iconToolsPanel1);

        this.tiHizliAc = getIconDiv("sf-z-sort-amount-down","24px" , "#00000080");
        this.tiHizliAc.self = this;
        this.tiHizliAc.title = this.datasets.sbt_sonkullan;
        this.tiHizliAc.onclick = function (e) {
            this.self.sonKullanilanGoster();
        };
        iconToolsPanel1.appendChild(this.tiHizliAc);
    }

    this.initSearchTextParent = document.createElement('div'); 
    this.initSearchTextParent.style.position = "relative";
    this.initSearchTextParent.style.backgroundColor = searchTextDefaultColor; 
    this.initSearchTextParent.style.display = "flex";
    this.initSearchTextParent.style.width = "100%";
    this.initSearchTextParent.style.height = "100%";
    this.initSearchTextParent.style.boxSizing = "border-box";
    this.initSearchTextParent.style.borderRadius = "7px";
    this.initSearchTextParent.style.padding = "3px";
    this.initSearchTextParent.style.marginRight = "4px"; 
    this.initSearchTextParent.style.marginLeft = "4px"; 
    this.initSearchParent.appendChild(this.initSearchTextParent);
    
    // Edit icerisindeki iconlar
    this.menuLabelIcon = getIconDiv("sf sf-search","20px");
    this.menuLabelIcon.style.margin = "5px";
    this.menuLabelIcon.style.color = "#7f7f81";
    this.menuLabelIcon.style.transition = "all .3s cubic-bezier(.4,0,.2,1)";
    this.menuLabelIcon.style.transform = "scale(.8)";    

    this.initSearchTextParent.appendChild(this.menuLabelIcon);

    this.aramaText1 = new ActiveForm.TCText();
    this.aramaText1.setOwner(ActiveForm);
    this.aramaText1.setParent(ActiveForm); 
    this.initSearchTextParent.appendChild(this.aramaText1.el);

    this.aramaText1.el.style.position = "relative";
    this.aramaText1.el.style.width = "100%";
    this.aramaText1.el.style.left = "auto";
    this.aramaText1.el.style.top = "auto";
    this.aramaText1.el.style.background = "transparent";
    this.aramaText1.el.style.border = "none";
    this.aramaText1.el.style.color = "#7f7f81";
    this.aramaText1.el.style.boxSizing = "border-box";
    this.aramaText1.el.style.display = "block";
    this.aramaText1.el.style.outline = "none";
    this.aramaText1.setFontSize(15);
    this.aramaText1.setNoStyleChange(true);
    this.aramaText1.setKeyUp(this.searchKeyUp);
    this.aramaText1.setKeyDown(this.searchKeyDown);
    this.aramaText1.el.placeholder = this.datasets.sbt_search;

    this.aramaText1.self = this;

    var self_ = this;
    this.aramaText1.el.onfocus = function (e) {
        self_.searchAktifPasif(true);
    };
    
    this.aramaText1.el.onblur = function (e) {
        var isText = self_.aramaText1.getCaption().trim();
        if (isText.length == 0) {
            self_.searchAktifPasif(false);
        }
    };

    this.aramaSilIcon1 = getIconDiv("sf-times", "12px", "#00000080" );
    this.aramaSilIcon1.style.marginRight = "5px";
    this.aramaSilIcon1.style.alignItems = "center";    
    this.aramaSilIcon1.style.visibility = "hidden";
    this.aramaSilIcon1.onclick = function (e) {
        self_.searchEditFocusClear(true);
    };

    this.initSearchTextParent.appendChild(this.aramaSilIcon1);
    
    if (!mobileAndTabletCheck()) {
        var iconToolsPanel2 = getToolIcoBack();
        this.tiFullScreen = getIconDiv("sf-expand", "18px", "#00000080");
        this.tiFullScreen.style.width = "24px";
        this.tiFullScreen.onclick = function (e) {
            if (self_.isFullScreen == false) 
                this.className = "sf-shrink" + " wtmIconItem";
                else 
                    this.className = "sf-expand" + " wtmIconItem";
                    
            self_.setTamEkran();
        };
        iconToolsPanel2.appendChild(this.tiFullScreen);
        tiCloseIcon = getIconDiv("sf-cross", "16px", "#00000080");
        tiCloseIcon.onclick = function (e) {
            self_.setMenuKapat(true) ;
        };  
        iconToolsPanel2.appendChild(tiCloseIcon);
        this.initSearchParent.appendChild(iconToolsPanel2);
    }
};

TCWebtopAnaMenu.prototype.searchEditFocusClear = function(isclear) {
    this.aramaText1.setCaption("");
    if (isclear) {
        //this.searchAktifPasif(true);
        this.araQueryRun();
    }
    this.aramaText1.setFocus();
};

TCWebtopAnaMenu.prototype.searchAktifPasif = function(isAktif) {
    if (isAktif) {
        this.aramaText1.el.placeholder = "";
        this.aramaText1.el.style.color = "#000000a6";
        this.aramaText1.el.style.fontWeight = "bold";
        this.menuLabelIcon.style.color = "#008069";
        this.menuLabelIcon.style.transform = "scale(0.9) rotate(90deg)";
        this.menuLabelIcon.className ="sf-search";
    } else {
        this.initSearchTextParent.style.backgroundColor = searchTextDefaultColor; 
        this.menuLabelIcon.style.color = "#7f7f81";
        this.aramaText1.el.style.color = "#7f7f81";
        this.initSearchTextParent.style.borderRadius = "7px";
        this.initSearchTextParent.style.border = "none";
        this.aramaText1.el.style.fontWeight = "normal";
        this.menuLabelIcon.style.transform = "scale(.8) rotate(1turn)";    
        this.aramaText1.el.placeholder = this.datasets.sbt_search;
        this.menuLabelIcon.className ="sf-search";
    }
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
    var menuParent =  new TCControlBase();
    this.setControlName("menuParent");
    menuParent.el.className = "customScrolls" + " " + "wtmMenuParent";
    menuParent.setTabIndex(0);
    menuParent.el.style.outline = "none";
    return menuParent.el;
};

TCWebtopAnaMenu.prototype.getMenuHeight = function() {
    return parseInt(this.el.style.height); 
};

TCWebtopAnaMenu.prototype.initLeftSideMenus = function() {
    this.lsParentL = this.getMenusParent();
    this.lsParentL.style.height = makePX(this.getMenuHeight() - 110);
    this.leftSideParent.appendChild(this.lsParentL);    
    this.lmGroupL = new TCSMenuGroup(this, this.lsParentL, menuTypeLeft);
    
    for (var i=0; i < this.datasets.moduller.length;i++) {
        var modul = this.datasets.moduller[i];
        
        if (modul.ustmdkey == 0) {
            var bulundu = false;
            
            this.tempMdKeys = [];
            var mdkey = this.getSetMenuMdkeys(modul.mdkey);
            
            if (mdkey == modul.mdkey)
                this.tempMdKeys.push(mdkey);

                if (this.tempMdKeys.length > 0) {
                    for (var ii=0; ii < this.datasets.formlar.length; ii++) {
                        var form = this.datasets.formlar[ii];
                        for (var a=0; a < this.tempMdKeys.length; a++) 
                            if (form.mdkey == this.tempMdKeys[a]) {
                                bulundu = true;
                                break;
                            }
                        }
                }    
            
            if (bulundu)
                this.lmGroupL.addItem(modul);
        }
            
    }
    this.lmGroupL.setColorStyle(paramStyleDark);        
};

TCWebtopAnaMenu.prototype.setLeftMenuFromOrder = function (mdkey) { 
    this.smdkey = mdkey;
};

TCWebtopAnaMenu.prototype.borderRadiusChangeFL = function (isactive) { 
    this.borderRadiusChange(true, isactive);
    this.borderRadiusChange(false, isactive);
};

TCWebtopAnaMenu.prototype.borderRadiusChange = function (isright, isactive) { 
    var obj = this.leftSideParent;
    if (isright) {
        obj = this.rightSideParent;
    }
    if ((MostParentWindow.DilIsArabic) || !isright) {
        if (isactive)
            obj.style["border-top-left-radius"] = "10px";
            else 
                obj.style["border-top-left-radius"] = "unset";

        obj.style["border-bottom-left-radius"] = "10px";    
    } else {
        if (isactive)
            obj.style["border-top-right-radius"] = "10px";
            else obj.style["border-top-right-radius"] = "unset";
        obj.style["border-bottom-right-radius"] = "10px";    
    }
};

TCWebtopAnaMenu.prototype.initRightSide = function () { 
    this.rightSideParent = document.createElement('div'); 
    this.rightSideParent.style.position = "relative";
    this.rightSideParent.style.background ="#fdfdfd";

    if (mobileAndTabletCheck()) 
        this.rightSideParent.style.width = "100%";
        else
            this.rightSideParent.style.width = "65%";
    this.rightSideParent.style.height = "100%";
    this.rightSideParent.style.boxSizing = "border-box";
    this.rightSideParent.style.padding = "10px";
    if (mobileAndTabletCheck()) 
        this.rightSideParent.style.padding = "5px";

    this.el.appendChild(this.rightSideParent);
    
    this.initSearchText();
    this.addSpaceDiv(this.rightSideParent, 5, true );
    this.setInitSearchNoItemPanel();
};

TCWebtopAnaMenu.prototype.initRightSideParent = function() {
    this.itemIdList = [];
    this.selectItemId = 0;
    this.itemIdOrder = 1;

    if (isPresent(this.lsParentR)) {
        this.rightSideParent.removeChild(this.lsParentR);        
    }
    
    this.lsParentR = this.getMenusParent();
    this.lsParentR.style.height = makePX(this.getHeight()-104);
    this.lsParentR.style.background = "transparent";
    this.rightSideParent.appendChild(this.lsParentR);    
    
    this.setNotResultInfo(false);
};

TCWebtopAnaMenu.prototype.setInitSearchNoItemPanel = function() {
    this.noItemFoundParent = document.createElement('div');
    this.noItemFoundParent.className = "wtmItemNotFound";
    this.noItemFoundParent.style.height = makePX(this.getHeight()-114);
    
    this.rightSideParent.appendChild(this.noItemFoundParent);    
    setDOMText(this.noItemFoundParent, this.datasets.sbt_searchu);
    this.searchlblIco = getIconDiv("sf-magnifying-glass","90px");
    this.searchlblIco.style["justify-content"] = "center";
    this.noItemFoundParent.appendChild(this.searchlblIco);
    this.searchlblIco.style.color = "rgb(54 54 54 / 50%)";
};

TCWebtopAnaMenu.prototype.setNotResultInfo = function(noresult) {
    if (noresult) {
        this.noItemFoundParent.style.display = "flex";
        this.noItemFoundParent.style["place-content"] = "space-around";
        this.noItemFoundParent.style["flex-direction"] = "column-reverse";
        this.noItemFoundParent.style["justify-content"] = "center";
        this.lsParentR.style.display = "none";
    } else {
        this.noItemFoundParent.style.display = "none";
        this.lsParentR.style.display = "flex";
    }
};

TCWebtopAnaMenu.prototype.getModul = function(mdkey) {
    for (var i=0; i < this.datasets.moduller.length;i++) {
        if (this.datasets.moduller[i].mdkey == mdkey) {
            return this.datasets.moduller[i];
        }
    }
};

TCWebtopAnaMenu.prototype.searchKeyDown = function(keyCode, ctrlKey, shiftKey, altKey, oEvent) {
    if ((keyCode == VK_RETURN) && isPresent(this.self.isSelectedItem)) {
        this.self.setFormSelect(this.self.isSelectedItem.modulform);
        return keyStop(oEvent);
    }

    if (keyCode != VK_TAB && keyCode != VK_RETURN && keyCode != VK_UP && keyCode != VK_DOWN) {
        
    } else 
    if (keyCode == VK_ESCAPE) {
        this.self.setMenuKapat(true);
    } 
    else {
        this.self.selectNextMenu(keyCode);
        return keyStop(oEvent);
    } 
};

TCWebtopAnaMenu.prototype.searchKeyUp = function(keyCode, ctrl, shift) {
    if (keyCode == VK_ESCAPE) {
        if (!this.self.getAraTextActive())
            this.self.setMenuKapat(true);
        else {
            this.self.searchEditFocusClear(true);
            this.self.searchAktifPasif(true);
        }
     } else
     if (keyCode != VK_TAB && keyCode != VK_RETURN && keyCode != VK_UP && keyCode != VK_DOWN && keyCode != VK_LEFT && 
        keyCode != VK_RIGHT && keyCode != VK_HOME && keyCode != VK_END) {
        if (this.self.araTimer != null) {
            clearTimeout(this.self.araTimer);
        }
        this.self.araTimer = setTimeout(this.self.araQueryRun.bind(this.self), 400);
    } else {
        //console.log(keyCode);
    }
};

function isNumeric(num) {
    return !isNaN(num);
};

TCWebtopAnaMenu.prototype.getAraTextActive = function() {
    return this.getAraText() != "";
};

TCWebtopAnaMenu.prototype.getAraText = function() {
    if (isPresent(this.aramaText1)) {
        var aranan = this.aramaText1.getCaption();
        return aranan;
    }
    return "";
};

function getIndexUpperLower(first,second,isupper) {
    var lang = "tr";
    if (MostParentWindow.CalisilanDil != "TR")
        lang = "en-US";
    if (isupper) 
        return first.toLocaleUpperCase(lang).indexOf(second.toLocaleUpperCase(lang));
    else 
        return first.toLocaleLowerCase(lang).indexOf(second.toLocaleLowerCase(lang));
};

function isSearchTextExistPosition(aranan, primary, second, beforeindx) {
    if (beforeindx > -1) {
        aranan = " " + aranan;
    }
        
    var reIndex = getIndexUpperLower(primary, aranan, true);
    if (reIndex == -1)
        reIndex = getIndexUpperLower(primary, aranan, false);
    if (isPresent(second) && (reIndex == -1) && (MostParentWindow.CalisilanDil != "TR")) {
        reIndex = getIndexUpperLower(second, aranan, true);
        if (reIndex == -1)
            reIndex = getIndexUpperLower(second, aranan, false);
    }
    if ((reIndex > -1) && (reIndex < beforeindx)) {
        return -1;
    }
    
    if ((beforeindx > -1) && (reIndex > -1)) {
        reIndex = reIndex + 1;
    }
    return reIndex;
};

TCWebtopAnaMenu.prototype.araQueryRun = function() {
    this.araToplamSonuc = 0;
    var aranan = this.aramaText1.getCaption();
    var lc = MostParentWindow.CalisilanDil;
    var text = toLatinUtil(aranan);
    text = text.toLocaleLowerCase(lc); 

    if (aranan == "") {
        this.tempSearchText = null;
        this.aramaSilIcon1.style.visibility = "hidden";
        this.defaultListe();
        return;
    }
    
    if (isPresent(this.tempSearchText) && (this.tempSearchText == aranan)) {
        return;
    }

    this.tempSearchText = aranan;

    this.aramaSilIcon1.style.visibility = "visible";
    var aranansplit = aranan.split(" ");
    var mdKeys = [];
    if (aranansplit.length == 0) {
        return;
    }
    
    var arananNumeric = isNumeric(aranan);
    for (var ii=0; ii < this.datasets.getFormReport().length; ii++) {
        var form = this.datasets.getFormReport()[ii];
        if (form.isshortcut) {
            continue;
        }

        this.datasets.getFormReport()[ii].isFind = false;
        var devam = true; 
        if (arananNumeric) {
            devam = (form.md_fr_key == aranan);
        } else {
            var isExistCount = 0;
            var beforeIndexOf = -1;
            for (var bb = 0; bb < aranansplit.length; bb++) { 
                var tmpIndex = isSearchTextExistPosition(aranansplit[bb], form.baslik, form.basliktr, beforeIndexOf);
                if (tmpIndex > -1) {
                    beforeIndexOf = tmpIndex;
                }
                if (tmpIndex > -1)
                    isExistCount += 1;
            }
            devam = (isExistCount == aranansplit.length);
        }

        if (devam)  {
            this.datasets.getFormReport()[ii].isFind = true;
            var mdkey = this.datasets.getFormReport()[ii].mdkey;
            function isExist(element) {
                return element % mdkey == 0;
            }
            if (!mdKeys.find(isExist)) {
                mdKeys.push(mdkey);
            }
        }
    }

    if (mdKeys.length > 0) {
        this.araToplamSonuc = mdKeys.length;
        this.initRightSideParent();
        for (var i=0; i < mdKeys.length; i++) {
            var modul = this.getModul(mdKeys[i]);
            if (isPresent(modul)) {
                this.initRightSideMenus(modul, true);
            }
        }
    } else 
        this.setNotResultInfo(true); 
};

TCWebtopAnaMenu.prototype.defaultListe = function() {
    if (this.smdkey > 0) {
        this.lmGroupL.setSelected(this.smdkey);
    }
};

TCWebtopAnaMenu.prototype.initRightSideMenus = function(modulform, issearch) {
    this.addList = [];
    if (!issearch) {
        this.initRightSideParent();
    }
    this.initKontrolFormItems(modulform.mdkey, modulform, issearch, null, null);
    for (var i=0; i < this.datasets.moduller.length;i++) {
        var modul = this.datasets.moduller[i];
        
        if (modul.ustmdkey == modulform.mdkey) {
            this.tempMdKeys = [];
            this.tempMdKeys.push(modul.mdkey);

            var mdkey = this.getSetMenuMdkeys(modul.mdkey);
            if (mdkey == modul.mdkey)
                this.tempMdKeys.push(mdkey);
                if (this.tempMdKeys.length > 0) {
                    var isgroup = null;
                    for (var a = 0; a < this.tempMdKeys.length; a++) {
                        isgroup = this.initKontrolFormItems(this.tempMdKeys[a], modul, issearch, null, isgroup);
                }
            }
        }
    }
};

TCWebtopAnaMenu.prototype.initKontrolFormItems = function(mdkey, modul, issearch, issonkullan, isgroup) {
    var group = null; 
    if (isgroup != null)
        group = isgroup;

    if (isPresent(issonkullan) && (issonkullan == true) ) {
        var modula = this.datasets.quickAccesModul();
        for (var ii=0; ii < this.datasets.sonkullan.length; ii++) {
            var form = this.datasets.sonkullan[ii];
            if (group == null) {
                group = new TCSMenuGroup(this, this.lsParentR, menuTypeRight);
                group.setCaption(modula, false);
            }
            this.itemIdOrder += 1; 
            form.itemId = this.itemIdOrder; 
            this.itemIdList.push(group.addItem(form));
        }
    } else {
        for (var ii=0; ii < this.datasets.getFormReport().length; ii++) {
            var form = this.datasets.getFormReport()[ii];
            var devam = true;
            for (var cc = 0; cc < this.addList.length; cc++) {
                if (!form.isshortcut) {
                    if (this.addList[cc] == form.md_fr_key) {
                        devam = false;
                        break;
                    }
                }
            }
            
            if (devam) {
                if ((form.mdkey == mdkey && issearch == false) || (form.mdkey == mdkey && issearch && form.isFind && !form.isshortcut)) {
                    if (group == null) {
                        group = new TCSMenuGroup(this, this.lsParentR, menuTypeRight);
                        group.setCaption(modul, issearch);
                    }
                    this.itemIdOrder += 1; 
                    form.itemId = this.itemIdOrder; 
                    this.itemIdList.push(group.addItem(form));
                    this.addList.push(form.md_fr_key);
                }
            }
        }
    }

    if (group != null) {
        var columncount = 2;
        if ((issearch) || (this.menuListType == paramMenuListReports)) {
            columncount = 1;
        }

        if (mobileAndTabletCheck())
            columncount = 1;

        group.setEndSettings(columncount, paramStyleLight);
    }
    return group;
};

TCWebtopAnaMenu.prototype.setMenuItemOnClick = function(modulform, rightLeft) {
    if (rightLeft == menuTypeLeft) {
        this.initRightSideMenus(modulform, false);
    } else 
        this.setFormSelect(modulform);
};

TCWebtopAnaMenu.prototype.sonKullanilanGoster = function() {
    if (this.datasets.sonkullan.length == 0) {
        return;
    }
    this.initRightSideParent();
    this.initKontrolFormItems(0, null, false, true, null);
};

TCWebtopAnaMenu.prototype.getSetMenuMdkeys = function(mdkey) {
    var result = mdkey;
    for (var i=0; i < this.datasets.moduller.length;i++) {
        var modul = this.datasets.moduller[i];
        if (modul.ustmdkey == mdkey) {
            this.tempMdKeys.push(modul.mdkey);
            var findHim = this.getSetMenuMdkeys(modul.mdkey);
            result = findHim;
        } 
    }       
    return result; 
};

TCWebtopAnaMenu.prototype.setMenuKapat = function(isforce) {
    if (!this.getAraTextActive() || isforce) {
        this.el.classList.remove('open');
        this.isVisible = false;
        this.el.isDown = false;
        setTimeout(this.kapatEnd.bind(this), 100);
    }
};

TCWebtopAnaMenu.prototype.kapatEnd = function() {
    this.elBack.style.display = "none";
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

TCWebtopAnaMenu.prototype.setTamEkran = function() {
    if (this.isFullScreen == false) {
        this.el.style.height = makePX(ActiveForm.getClientHeight()-40);
        this.el.style.top = "0px"; 
        this.el.style.left = "0px";
        this.borderRadiusChangeFL(false);
    } else {
        this.el.style.height = makePX(700);
    }
    this.isFullScreen = !this.isFullScreen;
    this.lsParentL.style.height = makePX(this.getMenuHeight()-110);
    this.lsParentR.style.height = makePX(this.getHeight()-104);
    
    this.setScreenUpdateTimer();
};

TCWebtopAnaMenu.prototype.setScreenUpdateTimer = function() {
    var navigtr = navigator.userAgent.split('Chrome/')[1];
    if (navigtr != null) {
        this.leftSideParent.style.backgroundColor ="rgb(77 89 100)";
        this.leftSideParent.style["backdrop-filter"] = "inherit";
        this.leftSideParent.style["-webkit-backdrop-filter"] = "inherit";    
    }
    if (this.updateTimerId) {
        clearTimeout(this.updateTimerId);
    }
    var self = this;
    this.updateTimerId = setTimeout(function () { 
        self.setBackCssControlUptate(true);
    }, 10);
};

TCWebtopAnaMenu.prototype.setMenuGosterGizle = function(ishide, onlysize) {
    if (!this.datasets.isFullLoad)
        return;
    
    if (isPresent(onlysize)) {
        this.setBackPanelUpdate();
        return;
    }

    if ((this.isVisible) || (isPresent(ishide) && ishide))  {
        this.setMenuKapat(true);
    } else 
    if (!isPresent(ishide)) {
        this.elBack.style.display = "block";
        this.isVisible = true;
        this.setBackPanelUpdate();
        this.el.classList.add('open');
        setTimeout(this.focusEnd.bind(this), 100);
    }
};

TCWebtopAnaMenu.prototype.focusEnd = function() {
    this.searchEditFocusClear(this.araToplamSonuc == 0);
};

TCWebtopAnaMenu.prototype.setFormSelect = function(modulform) {
    this.setMenuKapat(true) ;
    
    var eklenmis = false;
    for (var i=0; i < this.datasets.sonkullan.length;i++) {
        var modul = this.datasets.sonkullan[i];
        if (modulform.md_fr_key == modul.md_fr_key) {
            eklenmis = true;
            break;
        }
    }       

    if ((eklenmis == false) && !mobileAndTabletCheck()) {
        //this.tiHizliAc.style.color = "rgba(10, 54, 84, 0.8)"; 
        this.datasets.sonkullan.push(modulform);
    }
    this.openFormReport(modulform);
};

TCWebtopAnaMenu.prototype.openFormReport = function(modulform) {
    if (parseInt(modulform.fr_key) > 0) {
        if (modulform.raporadi != "" && modulform.fr_key == "240") {
            var rapor = ActiveForm.WebReport(ActiveForm);
            rapor.addReport(modulform.raporadi);
            rapor.kriterFormAc("R", true, false, modulform.md_fr_key); 
        } else  
            if(modulform.disBaglantiOk) {
                if(modulform.yeniSayfa == "E") {
                    window.open(modulform.disBaglanti);
                } else {
                    ActiveForm.Open(1740, "erisimAdresi=" + B64.enc(modulform.disBaglanti), modulform.wt, modulform.ww, modulform.wh, null, null); 
                }
            } else {
                ActiveForm.open({modal:false, formno:modulform.fr_key, parameters: modulform.params, caption:modulform.wt, w:modulform.ww, h:modulform.wh, mdfrkey:modulform.md_fr_key});
            }
    }
};

TCWebtopAnaMenu.prototype.setMenuActive = function(a) {
    this.menuActive = a;
};

TCWebtopAnaMenu.prototype.getMenuActive = function(a) {
    return this.menuActive;
};

TCWebtopAnaMenu.prototype.selectNextMenu = function(keyCode) {
    if (this.isSelectedItem != null) {
        this.isSelectedItem.setSelected(false, 2);
    }
    var buldum = false;
    if ((keyCode == VK_TAB) || (keyCode == VK_DOWN)) {
        for (var i = 0; i < this.itemIdList.length; i++) {
            var menuItem = this.itemIdList[i];
            if (menuItem.itemId > this.selectItemId)  {
                this.selectItemId = menuItem.itemId;
                menuItem.setSelected(true, keyCode);
                this.isSelectedItem = menuItem;
                buldum = true;
                break;
            }
        }
    }
    
    if ((keyCode == VK_UP)) {
        for (var i = this.itemIdList.length-1; i > -1; i--) {
            var menuItem = this.itemIdList[i];
            if (menuItem.itemId < this.selectItemId)  {
                this.selectItemId = menuItem.itemId;
                menuItem.setSelected(true, keyCode);
                this.isSelectedItem = menuItem;
                buldum = true;
                break;
            }
        }
    }

    if (!buldum) {
        this.lsParentR.scrollTop = 0;
        this.selectItemId = 0;
    }
};

function isNotCssSupport() {
    var browserver = navigator.userAgent.split('Firefox/')[1];
    if (browserver != null) 
        return parseInt(browserver) < 110;
    
    browserver = navigator.userAgent.split('Chrome/')[1];
    if (browserver != null) 
        return parseInt(browserver) < 76;
    
    browserver = navigator.userAgent.split('Edg/')[1];
    if (browserver != null) 
        return parseInt(browserver) < 81;
            
    browserver = navigator.userAgent.split('Safari/')[1];
    if (browserver != null) 
        return parseInt(browserver) < 8;
    return false;
}; 
