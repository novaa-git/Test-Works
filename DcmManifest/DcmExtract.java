package com.sisoft.pacs.tools;

import com.cozumbil.util.ConverterUtils;
import java.io.File;
import org.dcm4che3.data.Attributes;
import org.dcm4che3.io.DicomInputStream;
import org.dcm4che3.util.TagUtils;

public class DcmExtract {
    
    private static String float2Str(float[] val) {
        if ((val == null) || (val.length == 0))
            return "";
        String valReturn = "";
        for (int i=0; i < val.length; i++) {
            valReturn += ConverterUtils.formatDouble(val[i],2);
            if (i < val.length -1)
                valReturn += ",";
        }
        return valReturn;
    }
    
    private static String getTUp(String s) {
        return (s == null) ? null : "\"" + s + "\"";
    }
    
    private static String getTagValue(Attributes dataset, int tag) {
        if (TagUtils.isPrivateTag(tag)) 
            return "";
            
        String dicomTag = TagUtils.toString(tag);
        dicomTag = dicomTag.replace(",","");
        dicomTag = dicomTag.replaceAll("\\(","");
        dicomTag = dicomTag.replaceAll("\\)","");
        
        String vrTag = dataset.getVR(tag)+"";
        
        if (vrTag.equals("SQ"))
            return "";
        
        String dicomValue = dataset.getString(tag);
        
        if (vrTag.equals("CS") || vrTag.equals("PN") || vrTag.equals("LO") || vrTag.equals("AS") ||
            vrTag.equals("SH") || vrTag.equals("ST") ||
            vrTag.equals("TM") || vrTag.equals("DA") || vrTag.equals("UI") || vrTag.equals("LT") )
            dicomValue = getTUp(dataset.getString(tag));   
        
        if ( vrTag.equals("IS") || vrTag.equals("US") )
            dicomValue = dataset.getString(tag);   

        if (vrTag.equals("DS") || vrTag.equals("FL") || vrTag.equals("OF") )
            dicomValue = float2Str(dataset.getFloats(tag));
        
        if (dicomValue == null) {
            dicomValue = "";
        } 
        String valueLine = "";
        String sopUiTag = "00080018";
        String serUiTag = "0020000E";
        
        if (dicomTag.equals(sopUiTag) || dicomTag.equals(serUiTag) )
            valueLine = getTUp(dicomTag) + ":{" + getTUp("Value") + ":" + "[" +dicomValue + "]}";
        else 
            valueLine = getTUp(dicomTag) + ":{" + getTUp("vr") + ":" + getTUp(vrTag) + "," + getTUp("Value") + ":" + "[" +dicomValue + "]}";
        return valueLine;
    }
    
    private static String getLb() {
        return "";// System.getProperty("line.separator");
    }
    
    private static String getInfo() {
        return "\"00081010\":{\"vr\":\"SH\", \"Value\":[\"Sisoft\"]}";
    }
    
    private static String getTransyntaxUi(String t) {
        return "\"00083002\":{\"Value\":[\""+ t +"\"]}";
    }

    public static String readDicomTagsBase(String dicomFile) {
        String baseTag = "{" +  getLb();
        File isFile = new File(dicomFile);
        if (isFile.exists()) {
            try {
                Attributes dataset = null;
                DicomInputStream dis = new DicomInputStream(isFile);
                try {
                    
                    dataset = dis.readDataset(-1,org.dcm4che2.data.Tag.PixelData);
                    for (int i=0; i < dataset.tags().length; i++) {
                        String tagValue = getTagValue(dataset, dataset.tags()[i]);
                        if (!tagValue.equals("")) {
                            tagValue += ",";
                            baseTag += tagValue + getLb();
                        }
                    }
                    String tSyntax = dis.getTransferSyntax();
                    baseTag += getTransyntaxUi(tSyntax) + getLb();
                    //baseTag += getInfo() + "\n";
                } finally {
                    dis.close();
                }
            } catch (Exception ex) {
                ex.printStackTrace();
            }
        }
        baseTag += "}";
        return baseTag;
    }
    
    public static StringBuilder getMetadata(String[] files) {
        StringBuilder sb = new StringBuilder();
        sb.append("[" + getLb());
        for (int i=0; i < files.length; i++) {
            String imageTags = readDicomTagsBase(files[i]);
            if (i + 1 < files.length)
                sb.append(imageTags + ",");
                else 
                    sb.append(imageTags);
        }
        sb.append("]");
        return sb;   
    }
        
        
    public static void main(String[] args) {
     
        String[] files = new String[3];
        files[0] = "C:\\Users\\serkan.sert\\Desktop\\DICOM\\a2.dcm";
  //      files[1] = "C:\\Users\\serkan.sert\\Desktop\\DICOM\\a2.dcm";
//        files[2] = "C:\\Users\\serkan.sert\\Desktop\\DICOM\\a2.dcm";
        
        
        System.out.println( getMetadata(files).toString() );
        
        
        //(0008,0020) DA [20190319] StudyDate
        //(0008,0021) DA [20190319] SeriesDate
    }

 

}
