package com.sisoft.maintenance;

import com.cozumbil.bakim.CozumTabIslemleri;
import com.cozumbil.db.DbHelper;
import com.cozumbil.db.TCConnection;
import com.cozumbil.medula.THastaParametreler;
import com.cozumbil.taskmanager.TaskTimerServlet;
import com.cozumbil.util.ConverterUtils;
import com.cozumbil.util.TCozPassword;
import com.cozumbil.web.TCVersion;
import java.io.UnsupportedEncodingException;

import java.util.concurrent.CountDownLatch;

public class CzmReader extends CzmFileBase {

    public static Boolean isDebugMode = false;
    public static boolean stopForce = false;
    private Boolean startupKontrol = false;
    private int threadCount;
    private int vendor = -2; //default belirsiz
    private int endThreadCount = 0;
    private int order = -1;
    private CzmLogger logger;
    private Boolean isUtfEnable = false;
    private int usKey = 0;
    private int bakimType;
    private Boolean versiyondaBakimYapilamaz = false; 
    private final String ERR_ESKI_VERSIYONDA_BAKIM_YAPILAMAZ = "-98";
    private CzmService service = null;
    private static CountDownLatch latch = null;
        
    public CzmReader() {/**notdelete*/}

    public CzmReader(String filename, int threadcount, Boolean startup) {
        this.logger = new CzmLogger();
        this.startupKontrol = startup;
        this.threadCount = threadcount;
        this.setFileName(filename);
    }
    
    public CzmReader(String filename) {
        this.logger = new CzmLogger();
        this.setFileName(filename);
    }

    public void Execute() throws Exception {
        logger.setStartEndDate(true);
        Boolean isDebug = CzmReader.isDebugMode;
        
        if (!this.LoadFromFile(isDebug)) {
            logger.setStartEndDate(false);
            return;
        }
        
        if (this.tableCount == 0) {
            logger.setStartEndDate(false);
            return;
        }
        
        if (tableCount > 100) 
            progStepMax = (int)(tableCount / 100); 
            else {
                if (tableCount < 10)
                    this.threadCount = 1;
            progStepMax = tableCount;
        }
        
        if ((startupKontrol == false) && (service != null) && (service.getBakimTablolar() != null)) {
            bakimYapilacakTablolarAyir();
        }
        
        if (startupKontrol == true) {
            baslangicKontrolTablolariAyir();
        }
        
        // Bakım yapılıp yapılmayacağının kontrol edilmesi.
        this.bakimTablosuKontrol();
        
        if (this.versiyondaBakimYapilamaz == false) {
            // Bakım işleminin başlatılması
            this.schemaBakimBaslat();
        } else {
            setBakimDescription( ERR_ESKI_VERSIYONDA_BAKIM_YAPILAMAZ );
            this.endSchemaExecute();
        }
    }
    
    public void ReadFromMerge() throws Exception {
        this.LoadFromFile(false);
    }

    public void ReadFromOfficeSchema() throws Exception {
        this.LoadFromFile(false);
    }
    
    public CzmLogger getLogger() {
        return this.logger;
    }
    
    public Boolean getStartupControl() {
        return this.startupKontrol;
    }
    
    public void setStartAndEndTime() {}
    
    private void setThreadSetting(Boolean useHyperSql) {
        if ((useHyperSql) || (tableCount < 10))
            threadCount = 1;
    }
    
    private void bakimTablosuKontrol() {
        CzmDbSchema schema = new CzmDbSchema(this.logger, true);
        TCConnection con = null;
        try {
            con = new TCConnection();
            schema.setConnection(con);
            setThreadSetting( schema.isThreadHyperSql() );
            this.vendor = con.getVendor();
            this.functionKontrol(con);
            
            if (startupKontrol == false) {
                schema.EskiBakimTablolariSil();
            }
            
            if (schema.versiyondaBakimYapilabilir(this.getVersion()) || isDebugMode || (bakimType == CzmReaderThread.BAKIM_TYPE_TABLOTANIM) ) {
                this.isUtfEnable = schema.czmDbSchemaUtfControl();
                logger.logTableExist = schema.getBakimLogTablolari(this.tableList, this.getVersion());
                
                // Aud tablolarının COZUMTAB ve COZUMAUDIT içerisinde kontrolü
                if (startupKontrol == false) {
                    setBakimDescription("<COZUMTAB definition control>");
                    schema.setAuditTableToCozumTab(this.tableList);
                }
                setBakimDescription("<AUD TRIGGER definition control>");
                schema.getAudTriggerTablolari(this.audtList);
                
                // Tabloların aud aktiflik kontrolü, aud aktif değilse trigger bakımı yapılmayacak.
                this.setAudTablolariAktiflikKontrol();
            } else {
                this.versiyondaBakimYapilamaz = true;
                logger.setVersiyondaBakimYapilamaz( TCVersion.version , schema.getMaxBakimlogVer() );
            }
            
        } finally {
            if (con != null) {
                con.close();
                schema.setConnection(null);
            }
            schema = null;
        }
    }

    private void schemaBakimBaslat() {
        logger.setReaderInfo(this);
        if (isDebugMode && this.threadCount > 1) {
            latch = new CountDownLatch(this.threadCount);
            System.out.println("bakım toplam " + this.threadCount + " thread başlatılıyor");
        }
        for (int i = 0; i < this.threadCount; i++) {
            CzmReaderThread reader = new CzmReaderThread(this.logger, this, this.isUtfEnable, this.vendor);
            reader.setBakimType(bakimType);
            reader.setDebug(isDebugMode);
            reader.setUsKey(this.usKey);
            reader.setThreadId( i + 1 );
            reader.setLatch(latch);
            reader.start();
        }
        if (latch != null) {
            try {
                System.out.println("bakım tüm threadler bitene kadar bekleniyor");
                latch.await();
            } catch (Exception ex) {
                ex.printStackTrace();
            } finally {
            }
            System.out.println("bakım tüm threadlar bitti");
        }
    }

    private void baslangicKontrolTablolariAyir() {
        int startupTableCount = startupTableList().length;
        for (int i = 0; i < this.tableCount; i++) {
            Boolean listedeVar = false;
            CzmTable tblKontrol = (CzmTable)tableList.get(i);
            for (int ii = 0; ii < startupTableCount; ii++)
                if (tblKontrol.tName.equals(startupTableList()[ii])) {
                    listedeVar = true;
                    break;
                }
            if (listedeVar == false)
                tblKontrol.tLogState = "P";
        }
    }
    
    private void bakimYapilacakTablolarAyir() {
        int startupTableCount = service.getBakimTablolar().length;
        for (int i = 0; i < this.tableCount; i++) {
            Boolean listedeVar = false;
            CzmTable tblKontrol = (CzmTable)tableList.get(i);
            for (int ii = 0; ii < startupTableCount; ii++) {
                if (tblKontrol.tName.equals(service.getBakimTablolar()[ii])) {
                    listedeVar = true;
                    break;
                }
            }
            if (listedeVar == false)
                tblKontrol.tLogState = "P";
        }
    }
    
    public void tabloAlanReferansKontrol() {
        for (int i = 0; i < this.tableCount; i++) {
            CzmTable tblKontrol = (CzmTable)tableList.get(i);
            for (int ii = 0; ii < tblKontrol.getColumnCount(); ii++) {
                CzmColumns setCol = (CzmColumns) tblKontrol.tColumns.get(ii);
                if ((setCol.cParam.fbagfieldkey > 0) && setCol.cParam.getReference())
                    tabloAlanReferansGuncelle( setCol );
            }
        }
    }
    
    private void  tabloAlanReferansGuncelle(CzmColumns setCol) {
        for (int i = 0; i < this.tableCount; i++) {
            CzmTable tblKontrol = (CzmTable)tableList.get(i);
            if (tblKontrol.getTableTabKey() == setCol.cParam.fbagtabkey ) {
                setCol.cParam.fbagtabname = tblKontrol.tName;
                for (int ii = 0; ii < tblKontrol.getColumnCount(); ii++) {
                    CzmColumns cols = (CzmColumns) tblKontrol.tColumns.get(ii);
                    if (cols.cParam.ffieldkey == setCol.cParam.fbagfieldkey) {
                        setCol.cParam.fbagtabfieldname = cols.cParam.fname;
                        break;
                    }
                }
                setCol.cParam.setReferenceOk();
                break;
            }
        }
    }

    private void sistemKullanicisinaMesaj() {
        int msgUserID = TaskTimerServlet.TaskUserId;
        CzmDbSchema schema = new CzmDbSchema(this.logger, true);
        schema.setUsKey( usKey );
        TCConnection con = null;
        try {
            con = new TCConnection();
            kullaniciYoksaOlustur(con);
            schema.setConnection(con);
            schema.setAdminKullanicisinaBakimMesaj(msgUserID);
        } finally {
            if (con != null) {
                con.close();
                schema.setConnection(null);
            }
            schema = null;
        }        
    }
    
    private void kullaniciYoksaOlustur(TCConnection con) {
        //hiç kullanıcı yoksa admin kullanıcısı oluşturuluyor.
        int kulsayi = 0;
        DbHelper db = con.getNewDbHelper();
        db.addSql("SELECT COUNT(US_KEY) AS SAYI FROM USERTABLE");
        try {
            db.open();
            if (db.next()) {
                kulsayi = db.getInt("SAYI");
            }
        } catch (Exception ex) {
            ex.printStackTrace();
        } finally {
            db.close();
        }
        if (kulsayi <= 1) { //taskuser oluşmuş olabilir
            //admin kullanıcısı yoksa oluşturalım.
            boolean adminvar = false;
            db.addSql("SELECT US_KEY FROM USERTABLE WHERE US_KOD = :US_KOD");
            db.setVar("US_KOD", "admin");
            try {
                db.open();
                if (db.next()) {
                    adminvar = true;
                }
            } catch (Exception ex) {
                ex.printStackTrace();
            } finally {
                db.close();
            }
            if (!adminvar) {
                int uskey = db.getSeqNextValDual("USERSEQ");
                if (uskey > 0) {
                    db.addSql("INSERT INTO USERTABLE (US_KEY, US_KOD, US_AD, SIFRE, PASTARIH, US_YETKI, US_YETTUR)");
                    db.addSql("VALUES (:US_KEY, :US_KOD, :US_AD, :SIFRE, :PASTARIH, :US_YETKI, :US_YETTUR)");
                    db.setVar("US_KEY", uskey);
                    db.setVar("US_KOD", "admin");
                    db.setVar("US_AD", "admin");
                    TCozPassword pw = new TCozPassword();
                    String sif = pw.EncryptData("admin");
                    try {
                        db.setVar("SIFRE", sif.getBytes(THastaParametreler.getDefaultCharSet()));
                    } catch (UnsupportedEncodingException ex) {
                        ex.printStackTrace();
                    }
                    //hemen girişte şifre değiştirmek zorunda kalmasın
                    db.setVar("PASTARIH", ConverterUtils.addMonth(ConverterUtils.getDate(), 2));
                    db.setVar("US_YETKI", "3");
                    db.setVar("US_YETTUR", 3);
                    try {
                        db.ex();
                        db.commit();
                    } catch (Exception ex) {
                        ex.printStackTrace();
                    } finally {
                        db.close();
                    }
                }
            }
        }
        db.addSql("SELECT US_KEY FROM USERTABLE WHERE US_KOD = 'TASKUSER'");
        try {
            db.open();
            if (db.next()) {
                if (db.getInt("US_KEY") > 0) {
                    TaskTimerServlet.TaskUserId = db.getInt("US_KEY");
                }

            }
            if (TaskTimerServlet.TaskUserId == 0) {
                TaskTimerServlet.TaskUserId = db.getSeqNextValDual("USERSEQ");

                if (TaskTimerServlet.TaskUserId > 0) {
                    db.close();
                    db.addSql("INSERT INTO USERTABLE (US_KEY, US_KOD, US_AD)");
                    db.addSql("VALUES (:US_KEY, 'TASKUSER','TASKUSER')");
                    db.setVar("US_KEY", TaskTimerServlet.TaskUserId);
                    db.ex();
                    con.commit();
                }
            }
        } catch (Exception ex) {
            ex.printStackTrace();
        } finally {
            db.close();
        }
    }

    @Override
    public void endSchemaExecute() {
        this.endThreadCount += 1;
        if (this.endThreadCount >= this.threadCount) {
            logger.setStartEndDate(false);
            logger.SaveToFile();
            logger = null;
            setBakimProgress(true);
            this.progress = -1;
            CzmReaderThread.TACTIVITY_RUNNING = false;
        }
    }
    
    public CzmTable getLogTable() {
        CzmTable table = new CzmTable();
        table.tLogState = "N";
        table.tVersion = this.getVersion();
        table.tName = "MAINTANCE";
        if (logger != null)
            table.setTLog( logger.getLogString() );
        return table;
    }

    private synchronized void progressKontrol() {
        if (progStepMax < progStep) {
            setBakimProgress(false);
            progStep = 0;
        };
        progStep += 1;
    }
    
    public void progressSet() {
        this.progressKontrol();
    }

    public void setOrderStartPos() {
        this.order = -1;    
    }
    
    public CzmTable getCzmTable(int indx) {
        CzmTable result = (CzmTable)tableList.get(indx);
        return result;
    }
    
    @Override
    public synchronized CzmTable getSchemaTable(int threadId) {
        progressKontrol();
        this.order += 1;
        if (this.order < this.tableCount && !stopForce) {
            CzmTable isTable = (CzmTable)tableList.get(this.order);
            setBakimDescription(isTable.tName);
            return isTable;
        }
        return null;
    }
    
    @Override
    public int getAudTriggerType(String istname) {
        for (int i = 0; i < this.audtList.size(); i++) {
            CzmObjectParam param = (CzmObjectParam)this.audtList.get(i);
            if (param.fname.equals(istname))
                return param.fobjecttype;
        }
        return -1;
    }

    private void setAudTablolariAktiflikKontrol() {
        for (int i=0; i < this.audtList.size(); i++) {
            CzmObjectParam param = (CzmObjectParam)this.audtList.get(i);
            for (int ii=0; ii < tableCount; ii++) {
                CzmTable table = (CzmTable)tableList.get(ii);
                if (table.tName.equals(param.fname)) {
                    table.setTaudAktif(param.fAuditAktif);
                    break;
                }
            }
        }
    }

    private void functionKontrol(TCConnection con) {
        CozumTabIslemleri t = new CozumTabIslemleri();
            t.setConnection( con );
            t.runfncCreateCheck();
            t.closeConnection();
    }

    public void setUsKey(int usKey) {
        this.usKey = usKey;
    }
    
    public void setProgressMax(int count) {
        progStepMax = (int)(count / 100); 
    }
    
    public void semaTabloAlanAciklamalariYukle() {
        CzmDbSchema schema = new CzmDbSchema(null, true);        
        TCConnection con = null;
        try {
            con = new TCConnection();
            schema.setConnection(con);
            schema.setReader(this);
            schema.schemaTabloColumnsCommentGuncelle();
        } finally {
            if (con != null) {
                con.close();
                schema.setConnection(null);
            }
            schema = null;
        }
    }

    public void setBakimType(int bakimType) {
        this.bakimType = bakimType;
    }

    public int getBakimType() {
        return bakimType;
    }

    public void setService(CzmService service) {
        this.service = service;
    }
}
