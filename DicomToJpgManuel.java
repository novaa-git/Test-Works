/**
Starting point error : 

java.lang.IllegalArgumentException: Raster ShortInterleavedRaster: 
width = 256 height = 512 #numDataElements 1 is incompatible with ColorModel IndexColorModel: #pixelBits = 8 numComponents = 3 color space = java.awt.color.ICC_ColorSpace@28ec9a1a transparency = 1 transIndex   = -1 has alpha = false isAlphaPre = false
   at java.awt.image.BufferedImage.<init>(BufferedImage.java:454)
*/

import javax.imageio.ImageReader;
import javax.imageio.stream.ImageInputStream;
import java.awt.image.BufferedImage;

import java.util.Iterator;
import javax.imageio.*;
import java.awt.image.Raster;
import org.dcm4che3.imageio.plugins.dcm.DicomImageReadParam;

import java.io.File;
import java.io.InputStream;
import java.io.FileInputStream;
 
public class App {

  
    public static void main(String[] args) throws Exception {
        
        Iterator<ImageReader> iter = ImageIO.getImageReadersByFormatName("DICOM");
        ImageReader reader = iter.next();
        DicomImageReadParam param = (DicomImageReadParam) reader.getDefaultReadParam();


        InputStream is = new FileInputStream(new File("D:\\DICOMS\\DICOM_DIS_TEST_TOKAT_ERBA\\1.dcm"));
        //is.close();

        ImageInputStream iis = ImageIO.createImageInputStream(is);
        reader.setInput(iis, true);
        
        Raster raster = reader.readRaster(0, param);
       
        BufferedImage bi = new BufferedImage(raster.getWidth(), raster.getHeight(), BufferedImage.TYPE_INT_RGB); 
        bi.getRaster().setRect(raster);
        
        File outputfile = new File("D:\\DICOMS\\DICOM_DIS_TEST_TOKAT_ERBA\\2.jpg");
        ImageIO.write(bi, "jpg", outputfile);

   }
}
