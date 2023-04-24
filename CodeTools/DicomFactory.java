package com.pacs.service;

import java.awt.image.BufferedImage;

import java.io.BufferedInputStream;
import java.io.BufferedOutputStream;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.DataInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;

import java.util.ArrayList;
import java.util.Date;

import java.util.List;

import javax.imageio.ImageIO;

import org.dcm4che2.data.BasicDicomObject;
import org.dcm4che2.data.DicomObject;
import org.dcm4che2.data.Tag;
import org.dcm4che2.data.TransferSyntax;
import org.dcm4che2.data.UID;
import org.dcm4che2.data.VR;
import org.dcm4che2.io.DicomInputStream;
import org.dcm4che2.io.DicomOutputStream;
import org.dcm4che2.util.CloseUtils;
import org.apache.commons.io.IOUtils;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;

import org.dcm4che3.data.Attributes;
import org.dcm4che3.util.UIDUtils;

public class DicomFactory {

    public static BasicDicomObject GetFileToDicomObjectBasicDicomObject(String fileName) {
        BasicDicomObject basic = new BasicDicomObject();
        DicomInputStream dis = null;
        try {
            dis = new DicomInputStream(new File(fileName));
            dis.readDicomObject(basic, -1);
        } catch (IOException e) {
            e.printStackTrace();
        } finally {
            CloseUtils.safeClose(dis);
        }
        return basic;
    }   

    public static DicomObject GetFileToDicomObject(String fileName) {
        File dicomFile = new File(fileName);
        DicomInputStream input = null;
        DicomObject dicom = null;
        try {
            input = new DicomInputStream(dicomFile);
            dicom = input.readDicomObject();
        } catch (IOException ex) {
            ex.printStackTrace();
        } finally {
               CloseUtils.safeClose(input);
            }
        return dicom;    
    }
    
    public static void saveToDicomFile(DicomObject dcm, String fileName) {
        File file = new File(fileName);
        DicomOutputStream dos;
        try {
            dos = new DicomOutputStream(new BufferedOutputStream(new FileOutputStream(file)));
            dos.writeDataset(dcm, UID.ImplicitVRLittleEndian);
            CloseUtils.safeClose(dos);
         }  catch (IOException e) {
            e.printStackTrace();
        }
    }  
    
    public static BasicDicomObject getInputStreamToBasicDicomObject(InputStream stream) {
        BasicDicomObject basic = new BasicDicomObject();
        DicomInputStream dis = null;
        try {
            dis = new DicomInputStream(stream);
            dis.readDicomObject(basic, -1);
        } catch (IOException e) {
            e.printStackTrace();
        } finally {
            CloseUtils.safeClose(dis);
        }
        return basic;
    }   
    
    public static DicomObject getInputStreamToDicomObject(InputStream stream) {
        DicomObject basic = new BasicDicomObject();
        DicomInputStream dis = null;
        try {
            dis = new DicomInputStream(stream);
            dis.readDicomObject(basic, -1);
        } catch (IOException e) {
            e.printStackTrace();
        } finally {
            CloseUtils.safeClose(dis);
        }
        return basic;
    }
    
    public static byte[] getDicomManifestToBytes(BasicDicomObject obj) throws IOException {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        BufferedOutputStream bos = new BufferedOutputStream(baos);
        DicomOutputStream dos = new DicomOutputStream(bos);
        dos.writeDicomFile(obj);
        dos.flush();
        CloseUtils.safeClose( dos );
        byte[] data = baos.toByteArray();
        CloseUtils.safeClose( baos );
        CloseUtils.safeClose( bos );
        return data;
    }
    
    public static byte[] getDicomManifestToBytes(DicomObject obj) throws IOException {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        BufferedOutputStream bos = new BufferedOutputStream(baos);
        DicomOutputStream dos = new DicomOutputStream(bos);
        obj.putString(Tag.TransferSyntaxUID, VR.UI, "1.2.840.10008.1.2");
        dos.setTransferSyntax("1.2.840.10008.1.2");
        dos.writeDicomFile(obj);
        CloseUtils.safeClose( dos );
        byte[] data = baos.toByteArray();
            CloseUtils.safeClose( baos );
            CloseUtils.safeClose( bos );
        return data;
    }    

    public static void inStreamToOutputStream(InputStream in, OutputStream out) throws IOException {
        int readSize;
        int size = in.available();
        byte[] buffer = new byte[size];
        long totalSize = 0L;
        while ((readSize == in.read(buffer)) != -1) {
            totalSize += readSize;
            if (out != null)
                out.write(buffer, 0, readSize);
        }
    }
    
    public static byte[] dicomObjectToByteArray(DicomObject dicomObject) throws IOException {
         BasicDicomObject basicDicomObject = (BasicDicomObject) dicomObject;
         DicomOutputStream dos = null;
         try {
             ByteArrayOutputStream bcos = new ByteArrayOutputStream();
             ByteArrayOutputStream baos;

             if (basicDicomObject.fileMetaInfo().isEmpty()) {
                 try {
                     dos = new DicomOutputStream(bcos);
                     dos.writeDataset(basicDicomObject, TransferSyntax.ImplicitVRLittleEndian);
                 } finally {
                     IOUtils.closeQuietly(dos);
                 }

                 baos = new ByteArrayOutputStream(bcos.size());
                 dos = new DicomOutputStream(baos);
                 dos.writeDataset(basicDicomObject, TransferSyntax.ImplicitVRLittleEndian);
             } else {
                 try {
                     dos = new DicomOutputStream(bcos);
                     dos.writeDicomFile(basicDicomObject);
                 } finally {
                     IOUtils.closeQuietly(dos);
                 }

                 baos = new ByteArrayOutputStream(bcos.size());
                 dos = new DicomOutputStream(baos);
                 dos.writeDicomFile(basicDicomObject);
             }
             dicomObject.clear();
             return baos.toByteArray();
         } catch (IOException e) {
             throw e;
         } catch (Throwable t) {
             t.printStackTrace();
         } finally {
             IOUtils.closeQuietly(dos);
         }
     }    
    
    public static InputStream getToDicomObjectToInputStream(BasicDicomObject obj) throws IOException { 
        byte[] source =  getDicomManifestToBytes(obj);
        InputStream bis = new ByteArrayInputStream(source);                                                                  
        return bis;
    }
    
    public static ArrayList dicomPdfToJpeg(String inDicomFileName) {
        ArrayList sonuc = null;
        if (new File(inDicomFileName).exists() == false)
            return null;
        
        String filePathName = ""; // TODO
        DicomObject dObject = DicomFactory.GetFileToDicomObject(inDicomFileName);
        //0042:0012
        String sopInstanceUid = dObject.getString(Tag.SOPInstanceUID);
        byte[] type = dObject.getBytes(0x00420012);
        byte[] data = dObject.getBytes(0x00420011);
        
        if (data == null) {
            dObject = null;
            return null;
        }
        
        filePathName += sopInstanceUid; 
        OutputStream out = null;
        try {
            out = new FileOutputStream(filePathName + ".pdf");
            out.write(data);
            out.close();
        } catch (Exception ex) {
            ex.printStackTrace();
            } finally {
                out = null;
            }
        
        try {
            File sourceFile = new File(filePathName + ".pdf");
            if (sourceFile.exists()) {
                sonuc = new ArrayList();
                sonuc.add(filePathName + ".pdf");
                PDDocument document = PDDocument.load(filePathName + ".pdf");
                @SuppressWarnings("unchecked")
                List<PDPage> list = document.getDocumentCatalog().getAllPages();
                int pageNumber = 1;
                for (PDPage page : list) {
                    BufferedImage image = page.convertToImage();
                    File outputfile = new File(inDicomFileName + "." + pageNumber + ".jpg");
                    ImageIO.write(image, "jpg", outputfile);
                    if (outputfile.exists()) {
                        /* Diğer eklenen dosya */
                        sonuc.add(inDicomFileName + "." + pageNumber + ".jpg");
                        if (pageNumber == 1) { // yalnızca ilk sayfa 
                            DicomFactory df = new DicomFactory();
                            df.jpegFileToDicom(outputfile, inDicomFileName, dObject);
                        }
                    }
                    pageNumber++;
                }
                document.close();
            } else {
                System.err.println(sourceFile.getName() + " dosya okuma hatasi");
            }
        } catch (Exception e) {
            e.printStackTrace();
            } finally {
                dObject = null; 
            }
        return sonuc;
    }        
    
    
    /**
     * Metod okunanbir jpeg dosyayın gönderilen dicomobject içine görüntü olarak kayıt eder.
     * */
    private File jpegFileToDicom(File jpegFileName, String outputFileName, DicomObject source) {
        File fileOutput = new File(outputFileName);
        try {   
            int jpgLen = (int) jpegFileName.length();  
            BufferedImage jpegImage = ImageIO.read(jpegFileName);  
            int colorComponents = jpegImage.getColorModel().getNumColorComponents();  
            int bitsPerPixel = jpegImage.getColorModel().getPixelSize();  
            int bitsAllocated = (bitsPerPixel / colorComponents);  
            int samplesPerPixel = colorComponents; 
            
            Attributes dicom = new Attributes();  
            dicom.setString(org.dcm4che3.data.Tag.PatientName, org.dcm4che3.data.VR.CS, source.getString(Tag.PatientName));     
            dicom.setString(org.dcm4che3.data.Tag.PatientID, org.dcm4che3.data.VR.LO, source.getString(Tag.PatientID));     
            dicom.setString(org.dcm4che3.data.Tag.PatientSex, org.dcm4che3.data.VR.CS, source.getString(Tag.PatientSex));     
            dicom.setString(org.dcm4che3.data.Tag.AccessionNumber, org.dcm4che3.data.VR.LO, source.getString(Tag.AccessionNumber));     
            dicom.setDate(org.dcm4che3.data.Tag.PatientBirthDate, org.dcm4che3.data.VR.DA, source.getDate(Tag.PatientBirthDate));
            dicom.setString(org.dcm4che3.data.Tag.StudyDescription, org.dcm4che3.data.VR.CS, source.getString(Tag.StudyDescription));  
            dicom.setString(org.dcm4che3.data.Tag.SeriesDescription, org.dcm4che3.data.VR.CS, source.getString(Tag.SeriesDescription) ); 
            dicom.setString(org.dcm4che3.data.Tag.Modality, org.dcm4che3.data.VR.CS, source.getString(Tag.Modality)); 
            dicom.setDate(org.dcm4che3.data.Tag.StudyDate, org.dcm4che3.data.VR.DA, source.getDate(Tag.StudyDate));
            if (source.getDate(Tag.SeriesDate) != null)
                dicom.setDate(org.dcm4che3.data.Tag.SeriesDate, org.dcm4che3.data.VR.DA, source.getDate(Tag.SeriesDate));
                else 
                    dicom.setDate(org.dcm4che3.data.Tag.SeriesDate, org.dcm4che3.data.VR.DA, new Date());
                
            if (source.getString(Tag.StudyTime) != null)     
                dicom.setString(org.dcm4che3.data.Tag.StudyTime, org.dcm4che3.data.VR.TM, source.getString(Tag.StudyTime));
            if (source.getString(Tag.SeriesTime)!=null)
                dicom.setString(org.dcm4che3.data.Tag.SeriesTime, org.dcm4che3.data.VR.TM, source.getString(Tag.SeriesTime));
            if (source.getString(Tag.ContentTime)!=null)
                dicom.setString(org.dcm4che3.data.Tag.ContentTime, org.dcm4che3.data.VR.TM, source.getString(Tag.ContentTime));
                      
            dicom.setString(org.dcm4che3.data.Tag.SpecificCharacterSet, org.dcm4che3.data.VR.CS, "ISO_IR 100");  
            dicom.setString(org.dcm4che3.data.Tag.PhotometricInterpretation, org.dcm4che3.data.VR.CS, samplesPerPixel == 3 ? "YBR_FULL_422" : "MONOCHROME2"); 

            dicom.setInt(org.dcm4che3.data.Tag.SamplesPerPixel, org.dcm4che3.data.VR.US, samplesPerPixel);           
            dicom.setInt(org.dcm4che3.data.Tag.Rows, org.dcm4che3.data.VR.US, jpegImage.getHeight());  
            dicom.setInt(org.dcm4che3.data.Tag.Columns, org.dcm4che3.data.VR.US, jpegImage.getWidth());  
            dicom.setInt(org.dcm4che3.data.Tag.BitsAllocated, org.dcm4che3.data.VR.US, bitsAllocated);  
            dicom.setInt(org.dcm4che3.data.Tag.BitsStored, org.dcm4che3.data.VR.US, bitsAllocated);  
            dicom.setInt(org.dcm4che3.data.Tag.HighBit, org.dcm4che3.data.VR.US, bitsAllocated-1);  
            dicom.setInt(org.dcm4che3.data.Tag.PixelRepresentation, org.dcm4che3.data.VR.US, 0); 
            dicom.setDate(org.dcm4che3.data.Tag.InstanceCreationDate, org.dcm4che3.data.VR.DA, new Date());  
            dicom.setDate(org.dcm4che3.data.Tag.InstanceCreationTime, org.dcm4che3.data.VR.TM, new Date());  
            dicom.setString(org.dcm4che3.data.Tag.StudyInstanceUID, org.dcm4che3.data.VR.UI, source.getString(Tag.StudyInstanceUID));  
            dicom.setString(org.dcm4che3.data.Tag.SeriesInstanceUID, org.dcm4che3.data.VR.UI, source.getString(Tag.SeriesInstanceUID));  
            dicom.setString(org.dcm4che3.data.Tag.SOPInstanceUID, org.dcm4che3.data.VR.UI, source.getString(Tag.SOPInstanceUID));  
            dicom.setString(org.dcm4che3.data.Tag.SOPClassUID, org.dcm4che3.data.VR.UI, "1.2.840.10008.5.1.4.1.1.7");  

            dicom.setString(org.dcm4che3.data.Tag.Manufacturer, org.dcm4che3.data.VR.CS, source.getString(Tag.Manufacturer)); 
            dicom.setString(org.dcm4che3.data.Tag.InstitutionName, org.dcm4che3.data.VR.CS, source.getString(Tag.InstitutionName)); 
            dicom.setString(org.dcm4che3.data.Tag.ReferringPhysicianName, org.dcm4che3.data.VR.CS, source.getString(Tag.ReferringPhysicianName)); 
            dicom.setString(org.dcm4che3.data.Tag.StationName, org.dcm4che3.data.VR.CS, source.getString(Tag.StationName)); 
            dicom.setString(org.dcm4che3.data.Tag.InstitutionalDepartmentName, org.dcm4che3.data.VR.CS, source.getString(Tag.InstitutionalDepartmentName)); 
            dicom.setString(org.dcm4che3.data.Tag.PhysiciansOfRecord, org.dcm4che3.data.VR.CS, source.getString(Tag.PhysiciansOfRecord)); 
            dicom.setString(org.dcm4che3.data.Tag.ManufacturerModelName, org.dcm4che3.data.VR.CS, source.getString(Tag.ManufacturerModelName)); 
            
            if (source.getBytes(0x00420010) != null)
                dicom.setBytes(0x00420010,org.dcm4che3.data.VR.OB,source.getBytes(0x00420010));
            if (source.getBytes(0x00420011) != null)                      
                dicom.setBytes(0x00420011,org.dcm4che3.data.VR.OB,source.getBytes(0x00420011));
            if (source.getBytes(0x00420012) != null)                      
                dicom.setBytes(0x00420012,org.dcm4che3.data.VR.OB,source.getBytes(0x00420012));
            
            //dicom.initFileMetaInformation(UID.JPEGBaseline1);  

          Attributes fmi = new Attributes();
             fmi.setString(org.dcm4che3.data.Tag.ImplementationVersionName, org.dcm4che3.data.VR.SH, "sisoHbys"); 
              fmi.setString(org.dcm4che3.data.Tag.ImplementationClassUID, org.dcm4che3.data.VR.UI, UIDUtils.createUID());
              fmi.setString(org.dcm4che3.data.Tag.TransferSyntaxUID, org.dcm4che3.data.VR.UI,org.dcm4che3.data.UID.JPEGBaseline1);
              fmi.setString(org.dcm4che3.data.Tag.MediaStorageSOPClassUID, org.dcm4che3.data.VR.UI, org.dcm4che3.data.UID.SecondaryCaptureImageStorage);
              fmi.setString(org.dcm4che3.data.Tag.MediaStorageSOPInstanceUID, org.dcm4che3.data.VR.UI,UIDUtils.createUID());
              fmi.setString(org.dcm4che3.data.Tag.FileMetaInformationVersion, org.dcm4che3.data.VR.OB, "1"); 
              fmi.setInt(org.dcm4che3.data.Tag.FileMetaInformationGroupLength, org.dcm4che3.data.VR.UL, dicom.size()+fmi.size());

             org.dcm4che3.io.DicomOutputStream dos = new org.dcm4che3.io.DicomOutputStream(fileOutput);  
             dos.writeDataset(fmi, dicom);  
             dos.writeHeader(org.dcm4che3.data.Tag.PixelData, org.dcm4che3.data.VR.OB, -1); 
             dos.writeHeader(org.dcm4che3.data.Tag.Item, null, 0);
             dos.writeHeader(org.dcm4che3.data.Tag.Item, null, (jpgLen+1)&~1);  

             FileInputStream fis = new FileInputStream(jpegFileName);  
             BufferedInputStream bis = new BufferedInputStream(fis);  
             DataInputStream dis = new DataInputStream(bis);  

             byte[] buffer = new byte[65536];         
             int b;  
             while ((b = dis.read(buffer)) > 0) {  
                 dos.write(buffer, 0, b);  
             }  
            
             if ((jpgLen & 1) != 0) dos.write(0);   
               dos.writeHeader(org.dcm4che3.data.Tag.SequenceDelimitationItem, null, 0);  
               dos.close();  


        } catch (Exception e) {
            e.printStackTrace();
        }
        return fileOutput;
    }

}

