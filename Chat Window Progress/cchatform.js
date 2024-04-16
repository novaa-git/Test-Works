/*
    if (!isPresent(Form.chatForm)) {
        jsmanager.loadlib(jsmanager.add("./jslib/cchatform.js"));
        Form.chatForm = new TCChatForm(Form);
    }
    Form.chatForm.showChatScreen();
*/

var TCChatForm = function (frm) {
    jsmanager.loadlib(jsmanager.add("./hbys/hasta/HastaLib.js"));
    jsmanager.loadlib(jsmanager.add("./css/chat.css", null, true));
    jsmanager.loadlib(jsmanager.add("./jslib/jbuttontype.js"));
    
    this.parentForm = frm;
    this.selectUserKey = 0;
    
    this.frmHeight = 700;
    this.frmWidth = 900;
    this.userPanelWidth = 320;
    
    this.chatFrm = createPanel({ form: this.parentForm, parent: this.parentForm.bgPanel,
        left: 10, top: 10, width: this.frmWidth, height: this.frmHeight, caption: "Web Mesajlaşma", grup: false, kapatevent: this.ekranKapatClick.bind(this),
        btn: [{tip: ttkullaniciekle, onclick: this.kullaniciEkleClick.bind(this), hint: "Kullanıcı Ekle"},
              {tip: ttkullanicicikar, onclick: this.kullaniciSilClick.bind(this), hint: "Kullanıcı Sil"}]    
        });

    this.userEkleBtn = getPanelButton(this.chatFrm, ttkullaniciekle);
    this.userSil = getPanelButton(this.chatFrm, ttkullanicicikar);
    
    this.chatPanelBack = this.parentForm.TCPanel();
    this.chatPanelBack.setParent(this.chatFrm);
    this.chatPanelBack.el.style.background = "#eee";
    this.chatPanelBack.el.style.top = "47px";
    this.chatPanelBack.el.style.left = "10px";
    this.chatPanelBack.el.style.height = makePX(this.frmHeight-55);
    this.chatPanelBack.el.style.width = makePX(this.frmWidth-19);
    
    this.chatPanelBack.chatLogLeft = this.userPanelWidth + 8;
    this.chatPanelBack.chatLogWidth = this.frmWidth - this.userPanelWidth - 80;

    this.divLine = document.createElement("div");
    this.divLine.style.background = "transparent";
    this.divLine.style.position = "absolute";
    this.divLine.style.top = makePX(0);
    this.divLine.style.left = makePX(this.chatPanelBack.chatLogLeft-6);
    this.divLine.style.width = makePX(2);
    this.divLine.style.height = makePX(this.chatPanelBack.getHeight());
    
    this.chatPanelBack.el.appendChild(this.divLine);

    this.createAndInit();
    this.loadChatUsers();
};

TCChatForm.prototype.ekranKapatClick = function() { 
    this.chatFormActive = false;    
    if (isPresent(this.checkTimer))
        clearTimeout(this.checkTimer);
};

TCChatForm.prototype.setTimerAndEvent = function() { 
    if (isPresent(this.checkTimer))
        clearTimeout(this.checkTimer);

    this.checkTimer = setTimeout(this.eskiMesajlarOku.bind(this), this.checkDelay);
    this.checkDelay = this.checkDelay + 25;
};

TCChatForm.prototype.showChatScreen = function() { 
   this.chatFormActive = true;
   this.setTimerAndEvent();
   this.chatFrm.setzIndex(999);
   this.chatFrm.altpanel.el.style.opacity = 0.2;
   showPanel(this.chatFrm);
   ActiveForm = this.parentForm;
};

TCChatForm.prototype.createAndInit = function() { 
    this.params = new Parameters();
    this.retparams = new ReturnParameters();
    this.KLretparams = new KullistRParameters();
    this.uskey = 0;
    this.checkTimer = null;
    this.KLTimer = null;
    this.msgServis = null;
    this.checkDelay = 10000;
    this.delayMax = 10000;
    this.msgWins = new Array();
    this.msgarrPool = new CZMVector;        
    this.gonkeyarrPool = new CZMVector;     
    this.hourarrPool = new CZMVector;       
    this.gonadsPool = new CZMVector;        

    this.panel = this.parentForm.TCPanel();    
    
    this.asmKontrol = false;
    this.paramsK = new ParametersK();
    this.retparamsK = new ReturnParametersK();   
    
    this.panel.setParent(this.chatPanelBack);
    this.panel.setPos(2, 2);
    this.panel.setSize(this.userPanelWidth, this.frmHeight - 63);
    this.panel.setBack("white");
    this.panel.el.style.border = "1px solid #e5e5ea";

    this.chatUserDataset = this.parentForm.TCDataSet();
    this.chatUserDataset.action = "";
    this.chatUserDataset.addKeyField("US_KEY");
    this.chatUserDataset.AddIntegerField("US_KEY", true);
    this.chatUserDataset.AddStringField("PR_KEY", false);
    this.chatUserDataset.AddStringField("PERAD", false);
    this.chatUserDataset.AddStringField("RESIM", false);
    this.chatUserDataset.AddStringField("AKTIF", false);
    this.chatUserDataset.AddStringField("SERVISAD", false);
    
    this.mesajmenuicw = this.parentForm.TCIconView();
    this.mesajmenuicw.setParent(this.panel);
    this.mesajmenuicw.setPos(3,3);
    var userListWidth = this.userPanelWidth-5;
    this.mesajmenuicw.setSize(userListWidth, this.frmHeight - 68 );
    this.mesajmenuicw.setDataSet(this.chatUserDataset);
    this.mesajmenuicw.setBorder("", "", ""); //kenarlar gözükmesin
   
    this.mesajmenuicw.setBackImage(""); //resim yok
    this.mesajmenuicw.setPanelWidthHeight(userListWidth-25, 50);
    this.mesajmenuicw.addLabel("", 45, 8, userListWidth-20, 20, "", "14px", "", "black", this.personelAdItem.bind(this));
    this.mesajmenuicw.addLabel("SERVISAD", 45, 28, userListWidth-20, 20, "", "11px", "", "black");
    this.mesajmenuicw.addImage(this.personelResmiMesaj.bind(this), 5, 5, 32, 36);
    
    this.mesajmenuicw.setColumnCount(1);
    this.mesajmenuicw.setOnSelect(this.chartUserSelectClick.bind(this));
    this.mesajmenuicw.setMargin(3,3);
    this.mesajmenuicw.setGap(3,1);
    this.mesajmenuicw.setImageKullanma(true);
    this.mesajmenuicw.setColorUserChatList();
    
    this.gidenMesaj = this.parentForm.TCMemo();
    this.gidenMesaj.setParent(this.chatPanelBack);
    this.gidenMesaj.setPos(this.userPanelWidth + 7, this.frmHeight - 112);

    regEvent("keydown", this.txtEnter.bind(this) ,this.gidenMesaj.el);    

    this.initSearchTextParent = document.createElement('div'); 
    this.initSearchTextParent.style.position = "absolute";
    this.initSearchTextParent.style.left = makePX(this.userPanelWidth + 8);
    this.initSearchTextParent.style.top = makePX(this.frmHeight - 110);
    this.initSearchTextParent.style.display = "flex";
    this.initSearchTextParent.style.width = makePX(this.chatPanelBack.chatLogWidth + 50);
    this.initSearchTextParent.style.height = makePX(51);
    this.initSearchTextParent.style.boxSizing = "border-box";
    this.initSearchTextParent.style.padding = "3px";
    this.initSearchTextParent.style.border = "1px solid #e5e5ea";
    this.initSearchTextParent.style.background = "white";
    this.chatPanelBack.el.appendChild(this.initSearchTextParent);
    
    this.initSearchTextParent.appendChild(this.gidenMesaj.el);
    
    this.gidenMesaj.el.style.position = "relative";
    this.gidenMesaj.el.style.width = "100%";
    this.gidenMesaj.el.style.height = "100%";
    this.gidenMesaj.el.style.left = "auto";
    this.gidenMesaj.el.style.top = "auto";
    this.gidenMesaj.el.style.background = "white";
    this.gidenMesaj.el.style.border = "none";
    //this.gidenMesaj.el.style.color = "black";
    this.gidenMesaj.el.style.boxSizing = "border-box";
    this.gidenMesaj.el.style.display = "block";
    this.gidenMesaj.el.style.outline = "none";
    this.gidenMesaj.el.style["font-size"] = "12px";
    this.gidenMesaj.el.style["resize"] = "none";
    
    this.kullaniciEkle = this.parentForm.TCGridSelector();
    this.kullaniciEkle.setTitle("Kullanıcı Arama");
    this.kullaniciEkle.setDefaultAlan(TDefaultAlan.daKullanici);
    this.kullaniciEkle.setFunction(this.kullaniciSecClick.bind(this));
};

TCChatForm.prototype.personelAdItem = function (item) {
    item.fontFamily = "Calibri";
    item.fontWeight = "";
    if (this.chatUserDataset.FieldByName("AKTIF").getValue() == "O")
        item.setFontWeight("bold");

    item.setCaption(this.chatUserDataset.FieldByName("PERAD").getValue() );
};  

TCChatForm.prototype.personelResmiMesaj = function (item) {
    var resimVar = this.chatUserDataset.FieldByName("RESIM").getValue() == "E";
    var prKey = this.chatUserDataset.FieldByName("PR_KEY").getValue(true);
    resimgoster({imaj: item,  cinsiyet: "",  resimvar: resimVar,  resimtur: 2, key:prKey, yas: 0});
    if (!resimVar) 
        item.setSource("./perResimGetir?us_key=0");// gercek resimler ile renkli belirsiz cinsiyet iconu birbirine karışıyor.
    item.currentObject.style.boxShadow = "none"; // resim küçük olduğu için büyük gölge resmi bozuyor
    item.currentObject.style.borderRadius = "2px";
};

TCChatForm.prototype.txtEnter = function(e){
    if (e.keyCode == 13) {
        this.gonderClick();
        e.returnValue = 0;
    }
};

TCChatForm.prototype.gonderClick = function() {
    var saat = new Date();
    //mesaj içereiği boşlıktan farklıysa
    if (this.gidenMesaj.getValue() != ""){
        var servis = new MessageService();

        this.params.gonkey = "";
        this.params.alkey = this.selectUserKey;
        this.params.msg = this.gidenMesaj.getValue();
        this.params.hourtag = "";
    
        //servisin metodu çağrılıyor.
        servis.msgGonder(this.params, this.retparams);
        this.gidenMesaj.setValue("");
        this.eskiMesajlarOku();
    }
};

TCChatForm.prototype.loadChatUsers = function() {
    var srv = new MessageService();
    srv.setAsync(); 
    srv.setListener(this.loadChatUsersListener);
    
    this.KLretparams.self = this;
    this.KLretparams.uskeys = "";
       if (this.asmKontrol) {
        this.params.msgss = "AHBS";
    } else {
        this.params.msgss = "HBYS";
    }
    srv.kullistGetir(this.params, this.KLretparams);
};

TCChatForm.prototype.loadChatUsersListener =  function(xmlhttp, retparam) {
    var self = retparam.self;
    var usks = self.KLretparams.uskeys.split(",");
    var sts = self.KLretparams.status.split(",");
    var uads = self.KLretparams.usads.split(",");
    var setServisads = self.KLretparams.servisad.split(",");
    var resimDurums = self.KLretparams.resimDurum.split(",");
    var cinsiyets = self.KLretparams.cinsiyet.split(",");
    var prkeys = self.KLretparams.prKey.split(",");
    var unvans = "";
    if (self.KLretparams.unvans != "") {
        unvans = self.KLretparams.unvans.split(",");
    }
    var kulad = self.KLretparams.kulad;
    self.chatUserDataset.close();
    self.chatUserDataset.open();
    for (i = 0; ((i < usks.length) && usks != ""); i++) {
        if (i > 0) {
            self.chatUserDataset.appendRow();
        }
        self.chatUserDataset.FieldByName("US_KEY").setValue(usks[i]);
        self.chatUserDataset.FieldByName("PERAD").setValue(uads[i]);
        self.chatUserDataset.FieldByName("PR_KEY").setValue(prkeys[i]);
        self.chatUserDataset.FieldByName("RESIM").setValue(resimDurums[i]);
        self.chatUserDataset.FieldByName("SERVISAD").setValue(setServisads[i]);
        self.chatUserDataset.FieldByName("AKTIF").setValue(sts[i]);
        
        self.chatUserDataset.post();
    }
    self.chatUserDataset.first();
    self.mesajmenuicw.fillData(); 
    self.selectUserKey = self.chatUserDataset.FieldByName("US_KEY").getValue();
    self.eskiMesajlarOku();
};

TCChatForm.prototype.chartUserSelectClick = function(){
    var usKey = this.chatUserDataset.FieldByName("US_KEY").getValue();
    if (this.selectUserKey == usKey) {
        return;
    }
    this.selectUserKey = usKey;    
    this.eskiMesajlarOku();
};

TCChatForm.prototype.eskiMesajlarOku = function() {
    if (isPresent(this.chatFormActive) && (this.chatFormActive==false)) {
        return;
    }
    
    if (isPresent(this.chatPanel)) {
        this.parentForm.removeComponent(this.chatPanel.msgBack);
        this.chatPanel = null;
    }

    this.msgServis = new MessageService();
    this.params.gonkey = "";
    this.params.alkey = this.selectUserKey;   
    this.params.msg = "";
    this.params.hourtag = "";
    this.retparams.self = this;
    this.msgServis.eskiMesajlar(this.params, this.retparams);
    this.msgCheckListener();
};

TCChatForm.prototype.msgCheckListener = function() {
    this.setTimerAndEvent();
    if ((this.retparams.msgs == null) || this.retparams.msgs == "")
        return;
        
    var tarih = "";
    var msgarr = this.retparams.msgs.split("×");
    var gonkeyarr = this.retparams.gonkeys.split(",");
    var hourarr = this.retparams.hours.split(",");
    var gonads = this.retparams.gonads.split(",");
    var msgkeys = this.retparams.msgkeys.split(",");

    if (msgarr[0].length > 0) {
        for (i in msgarr) { 
            var msg = msgarr[i];
            var gon = gonads[i];
            var gonKey = gonkeyarr[i];
            var msgKey = msgkeys[i];
            if (tarih != hourarr[i]) {
                this.msgEkle(hourarr[i], 0, 0, 0);
                tarih = hourarr[i];
            }
            
            this.msgEkle(msg, gon, gonKey, msgKey);
        }
    }

    this.retparams.msgs = "";
    this.retparams.gonkeys = "";
    this.retparams.hours = "";
    this.retparams.gonads = "";
    
    if (isPresent(this.chatPanel)) {
        this.chatPanel.msgBack.scrollTop = this.chatPanel.msgBack.scrollHeight;
    }
    this.gidenMesaj.setFocus();
};

TCChatForm.prototype.msgEkle = function(msgText, gon, gonkey, msgkey){
    var saat = new Date();
    var gonderen = this.alad;
    
    if (isPresent(gon)) {
        gonderen = gon;
    }
    
    if (!isPresent(this.chatPanel)) {
        this.chatPanel = new TCChatPanel();
        this.chatPanel.setParent(this.chatPanelBack);
        this.chatPanel.setChatForm(this);
        this.chatPanel.setWidthHeight();
    }

    if (isPresent(gonkey) && (gonkey == MostParentWindow.KullaniciKey))
        this.chatPanel.addMessage(msgText, false, msgkey);
        else 
            if (gonkey > 0) {
                this.chatPanel.addMessage(msgText, true, msgkey);
            } else {
                this.chatPanel.addMessage(msgText);
            }
};

TCChatForm.prototype.kullaniciEkleClick = function() {
    this.kullaniciEkle.start();
};

TCChatForm.prototype.kullaniciSecClick = function (us_key) {
    if (MostParentWindow.KullaniciKey == us_key) {
        BilgiMesaj(10774);
        return;
    }

    if (us_key != "") {
        this.paramsK.us_key = MostParentWindow.KullaniciKey;
        this.paramsK.usl_key = us_key;
        this.msgServis.Ekle(this.paramsK, this.retparamsK);
        if(this.retparamsK.code == -1) {
            BilgiMesaj("mesaj.kuleklehata", 1, "Kullanıcı listede mevcut!");
        }
        else if(this.retparamsK.code == 0) {
            BilgiMesaj("mesaj.kuleklehata", 1, "Kullanıcı listeye eklenemedi!");
        }
        else{
          this.loadChatUsers(); // ekledikten sonra kullanıcıyı seçeceğiz..
        }
    }
};

TCChatForm.prototype.kullaniciSilClick = function() {
    EvetSoruMesaj("12686", null,  "", this.silmeOnayla.bind(this));
};

TCChatForm.prototype.silmeOnayla = function(btn) {
    if (btn == 2){
        if (this.selectUserKey != "") {
            this.paramsK.us_key = "";
            this.paramsK.usl_key = this.selectUserKey;
            this.msgServis.kulSil(this.paramsK, this.retparamsK);
            if (this.retparamsK.code == 0) {
                BilgiMesaj("mesaj.kuleklehata", 1, "Kullanıcı listeden silinemedi!");
            } else {
                this.selectUserKey = 0;
                this.loadChatUsers();
            }
        }
    }
};

var TCChatPanel = function () {
    this.msgBack = document.createElement("div");
    this.msgBack.style.background = "white";
    this.msgBack.className = "imessage";
    this.msgBack.style["overflow-y"] = "auto";
    this.msgBack.style.position = "absolute";
    this.msgBack.style["font-size"] = "12px";
    this.msgBack.style.top = "2px";
    this.parent = null;
};

TCChatPanel.prototype.setParent = function(parent){
    this.parent = parent;
    parent.el.appendChild(this.msgBack);
};

TCChatPanel.prototype.setChatForm = function(frm){
    this.form = frm;
};

TCChatPanel.prototype.setWidthHeight = function(){
    this.msgBack.style["max-width"] = makePX(this.parent.chatLogWidth);
    this.msgBack.style.width = makePX(this.parent.chatLogWidth);
    this.msgBack.style.height = makePX(this.parent.getHeight() - 112);
    this.msgBack.style.left = makePX(this.parent.chatLogLeft);
};

TCChatPanel.prototype.addMessage = function(msg, isleft, msgkey) {
    this.newMsg = document.createElement("p");
    this.newMsg.self = this.form;

    if (isPresent(isleft)) {
        if (isleft) {
            this.newMsg.className = "from-them no-tail";
        } else {
            this.newMsg.className = "from-me no-tail";
            if (isPresent(msgkey)) // kendi mesajlarini silebilsin 
                this.newMsg.msgKey = msgkey;
        }
            
    } else {
        this.newMsg.className = "comment";
    }

    setDOMText(this.newMsg, msg);
    this.msgBack.appendChild(this.newMsg);    
    
    this.newMsg.ondblclick = function() {
        if (this.msgKey > 0)
            this.self.charMesajSil(this.msgKey);
    }
};

TCChatForm.prototype.charMesajSil = function(msgKey) {
    this.msgServis = new MessageService();
    this.mesajSilPar = new mesajSilPar();
    this.mesajSilPar.logKey = msgKey;
    this.msgServis.eskiMesajSil(this.mesajSilPar, this.retparams);
    this.eskiMesajlarOku();
};

function MessageService () {
    TCRemote.call(this);
    this.setAction("../webimService.do"); //action ismi
};

MessageService.prototype = new TCRemote; //ana classtan türedi

MessageService.prototype.msgGetir = function(par, ret) {
    this.invoke("msgGetir", par, ret);
};

MessageService.prototype.kullistGetir = function(par, ret) {
    this.invoke("kulListGetir", par, ret);
};

MessageService.prototype.mesajGonderenBilgiGetir = function(par, ret) {
    this.invoke("mesajGonderenBilgiGetir", par, ret);
};

MessageService.prototype.offlineOL = function(par, ret) {
    this.invoke("goOff", par, ret);
};

MessageService.prototype.Ekle = function(par, ret) {
    this.invoke("Ekle", par, ret);
};

MessageService.prototype.kulSil = function(par, ret) {
    this.invoke("kulSil", par, ret);
};

MessageService.prototype.eskiMesajlar = function(par, ret) {
    this.invoke("eskiMesajlar", par, ret);   
};

MessageService.prototype.msgGonder = function(par, ret) {
    this.invoke("msgGonder", par, ret);   
};

MessageService.prototype.eskiMesajSil = function(par, ret) {
    this.invoke("eskiMesajSil", par, ret);   
};

function Parameters () {
    this.msgss = "a";      
};

function ReturnParameters () {
    TCRemoteReturn.call(this);
    this.gonkeys="";
    this.gonads="";
    this.hours="";
    this.msgs="";
    this.msgkeys="";
};

function KullistRParameters () {
    TCRemoteReturn.call(this);
    this.status="";
    this.uskeys="";
    this.usads="";
    this.servisad="";
    this.resimDurum="";
    this.cinsiyet="";
    this.kulad="";
    this.unvans="";
    this.prKey="";
};
KullistRParameters.prototype = new TCRemoteReturn;


function mesajSilPar() {
    this.logKey = 0;
};

function ParametersK () {
    this.us_key = "";
    this.usl_key = "";
};

function ReturnParametersK () {
    TCRemoteReturn.call(this);
    this.code=0;
};

ReturnParameters.prototype = new TCRemoteReturn;
