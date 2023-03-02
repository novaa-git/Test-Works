package com.sisoft.maintenance;

import com.cozumbil.db.DbHelper;
import com.cozumbil.db.TCConnection;
import com.cozumbil.util.ConverterUtils;
import java.util.ArrayList;

public class CzmWriter extends CzmFileBase {

    private String seciliTable;
    
    public CzmWriter(String filename, String isSeciliTable) {
        this.seciliTable = isSeciliTable;
        setFileName( filename );
    }
    
    public void Execute() throws Exception {
        TCConnection tcCon = new TCConnection();
        try {
            getVersion();
            DatasetToCzmFile(tcCon);
            if (this.tableCount > 0) {
                SaveToFile();
            }
        } finally {
            tcCon.close();
            tcCon = null;
        }
    }
    
    private String getEncodeDescription(String value) {
        String result = ConverterUtils.base64Encode(value);
        if ((result != null) && (result.length() > 0))
            result = result.replace("^","*");
        return result;
    }
            
    private String getFieldType(int istype) {
        String[] fieldType = {"NUMBER", "VARCHAR2", "DATE", "BLOB"};
        return fieldType[istype];
    }
    
    private void getTTable(DbHelper db, String tabname) {
        db.addSql("SELECT T.TABKEY, T.AD, T.TABAD, T.PROGRAM, T.ADEN, T.ADES, T.ADFR, T.ADSA, T.ADRU, T.ADAZ, T.ADKZ");
        db.addSql("FROM COZUMTAB T");
        db.addSql("WHERE INSTR( TO_CHAR(T.PROGRAM),'1') > 0");
        if ((tabname != null) && (tabname.length() > 0)) {
            db.addSql("WHERE T.TABAD=:AD");
            db.setVar("AD", tabname);
        }
        db.addSql("ORDER BY T.TABAD");
    }
    
    private String getFieldDesc(String value) {
        String result = value;
        String[] delStr = {"^" ,"=" ,"-" ,"&" ,"%" ,"/" ,"\\(" ,"\\)" ,"\\[" ,"\\]",
                           "," ,";", "|", ":", "\\?", "!", "'", "\\*", "\r\n","\r","\n",
                           "Primary","PRIMARY","SEQUENCE","Sequence","INDEX","index", "ALTER"};
        if (result !=null) {
            for (int i=0; i < delStr.length; i++)
                result = result.replaceAll( delStr[i], "" );
        } else 
            result = "";
        return result;
    }
    
    private String getTFields(TCConnection isCon, int tabKey, Boolean uzSinir) {
        String result="(";
        DbHelper db = isCon.getNewDbHelper();
        db.addSql("SELECT F.FIELDKEY, F.FIELDKOD, F.FIELDTIP, F.FIELDOND, F.REFINTTUR, F.FIELDTUR,");
        db.addSql("F.FIELDUZN, F.NOTNUL, F.BAGTABKEY, F.BAGFIELDKEY, F.AD, F.ADEN, F.ACIKLAMA,");
        db.addSql("(SELECT TB.TABAD FROM COZUMTAB TB WHERE TB.TABKEY = F.BAGTABKEY) AS BAGTABLENAME,");
        db.addSql("(SELECT CF.FIELDKOD FROM COZUMFLD CF");
        db.addSql("WHERE CF.TABKEY =F.BAGTABKEY AND CF.FIELDKEY = F.BAGFIELDKEY) AS BAGFIELDNAME");
        db.addSql("FROM COZUMFLD F WHERE F.TABKEY=:TABKEY");
        db.addSql("ORDER BY F.FIELDKEY");
        db.setVar("TABKEY", tabKey);
        try {
            db.open();
            while (db.next()) {
                result = result + "&" + db.getString("FIELDKOD") +" "+ 
                         getFieldType( db.getInt("FIELDTIP") );

                if ((db.getInt("FIELDTIP") == 0) && (db.getInt("FIELDUZN") > 0)) {
                    result = result + "(" + db.getString("FIELDUZN"); 
                    if (db.getInt("FIELDOND") > 0)
                        result = result + "." + db.getInt("FIELDOND"); else 
                        result = result + ""; 
                    result = result + ")"; 
                }
                
                if (db.getInt("FIELDTIP") == 1) {
                    result = result + "(";
                    if ( (uzSinir) && (db.getInt("FIELDOND") > 255) )
                        result = result + "255"; else 
                        result = result + db.getString("FIELDUZN");
                    result = result + ")"; 
                }
                
                if (db.getString("NOTNUL").equals("H"))
                    result = result + " NOT NULL"; 

                result = result + " " + "^" + 
                         db.getInt("FIELDKEY") + "^" + 
                         db.getString("BAGTABKEY") + "^" + 
                         db.getString("BAGFIELDKEY") + "^" + 
                         getFieldDesc( db.getString("AD") )+ "^" +  
                         db.getString("REFINTTUR") + "^"  + 
                         getFieldDesc( db.getString("ADEN") )+ "^" + 
                         db.getString("FIELDTUR") +"^" + 
                         getEncodeDescription( db.getBlobASString("ACIKLAMA") ) +"^";
                
                if (!db.isLast()) 
                    result = result + ", "; 
            }
        } catch (Exception e) {
            e.printStackTrace();
          } finally {
                db.close();
                db = null;
            }
        return result;
    }

    private String getTIndexs(TCConnection isCon, int tabKey, String tabName) {
        String result = "";
        String primary = "";
        String desc = "&";
        DbHelper db = isCon.getNewDbHelper();
        db.addSql("SELECT I.INDEXAD, I.ALANLAR FROM COZUMIND I WHERE I.TABKEY=:TABKEY");
        db.setVar("TABKEY", tabKey);
        try {
            db.open();
            while (db.next()) {
                String indAd = db.getString("INDEXAD");
                if ( (indAd != null) && (indAd.length() > 0))
                    if (indAd.equals("PRIMARY KEY"))
                        primary = ", &PRIMARY KEY (" + db.getString("ALANLAR") + "));"; 
                    else {
                        if (indAd.indexOf("UNIQUE") == 0) 
                            result = result + "&CREATE UNIQUE INDEX " + 
                                      indAd.substring(6, indAd.length()).trim();
                        else
                            result = result + "&CREATE INDEX "+ indAd;
                        result = result + " ON " + tabName + " (" + db.getString("ALANLAR") + ");";
                    }
              }
          } catch (Exception e) {
                e.printStackTrace();
            } finally {
                db.close();
                db = null;
            }
        if ((primary.length() > 0) && (result.length() > 0))
            result = primary + desc + result; else 
        if ((primary.length() > 0) && (result.length() == 0))           
            result = primary + desc; else 
        if ((primary.length() == 0) && (result.length() > 0))           
            result =  " &);"+ desc + result; else 
        if (result.length() == 0) 
            result = " &);" + desc;
        return result;
    }

    private String getTSequence(TCConnection isCon, int tabKey) {
        String result = "&";
        DbHelper db = isCon.getNewDbHelper();
        db.addSql("SELECT S.SEQAD FROM COZUMSEQ S WHERE S.TABKEY=:TABKEY");
        db.setVar("TABKEY", tabKey);
        try {
            db.open();
            while (db.next()) 
                result = result + "&CREATE SEQUENCE " + 
                         db.getString("SEQAD") + " MINVALUE 1 INCREMENT BY 1 NOCACHE NOCYCLE;";
        } catch (Exception e) {
                e.printStackTrace();
            } finally {
                db.close();
                db = null;
            }
        return result;
    }

    private void DatasetToCzmFile(TCConnection isCon) {
        this.tableList = new ArrayList();
        this.tableList.add("VER=" + this.getVersion());
        DbHelper dbTable = isCon.getNewDbHelper();
        getTTable(dbTable, this.seciliTable);
        this.tableCount = 0;
        try {
            dbTable.open();
            while (dbTable.next()) {
                this.tableCount += 1;
                String line = this.tableCount + "%" + dbTable.getString("PROGRAM") + "%"+ 
                              dbTable.getInt("TABKEY") +"%" + 
                              dbTable.getString("TABAD") + "%";
                line = line + getTFields(isCon, dbTable.getInt("TABKEY"), false);
                line = line + getTIndexs(isCon, dbTable.getInt("TABKEY"), dbTable.getString("TABAD"));
                line = line + getTSequence(isCon, dbTable.getInt("TABKEY"));
                
                Boolean isAllLang = true;
                if (isAllLang == false) {
                line = line + "&%" + 
                       // Türkçe = 0
                       dbTable.getString("AD").trim() + "%"+
                       // İngilizce = 1
                       getFieldDesc(dbTable.getString("ADEN")) +
                       "%%%%";
                } else {
                line = line + "&%" + 
                       // Türkçe = 0
                       dbTable.getString("AD").trim() + "%"+
                       // İngilizce = 1
                       getFieldDesc(dbTable.getString("ADEN")) + "%"+
                       // İspanyolca = 2
                       getFieldDesc(dbTable.getString("ADES")) + "%"+
                       // Fransızca = 3
                       getFieldDesc(dbTable.getString("ADFR")) + "%"+
                       // Arapça = 4
                       getFieldDesc(dbTable.getString("ADSA")) + "%"+
                       // Arapça = 5
                       getFieldDesc(dbTable.getString("ADRU")) + "%"+
                       // Azerice = 6
                       getFieldDesc(dbTable.getString("ADAZ")) + "%"+
                       // Kazakça = 7
                       getFieldDesc(dbTable.getString("ADKZ")) +
                       "%%%%"; 
                }
                this.tableList.add(line);
            }
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            dbTable.close();
            dbTable = null;
        }
    }
    
}
