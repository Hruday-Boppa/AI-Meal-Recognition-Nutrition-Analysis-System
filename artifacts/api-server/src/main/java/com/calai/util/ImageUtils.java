package com.calai.util;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.imageio.IIOImage;
import javax.imageio.ImageIO;
import javax.imageio.ImageWriteParam;
import javax.imageio.ImageWriter;
import javax.imageio.stream.ImageOutputStream;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Iterator;

public class ImageUtils {

    private static final Logger log = LoggerFactory.getLogger(ImageUtils.class);
    private static final int MAX_DIMENSION = 1600;
    private static final float JPEG_QUALITY  = 0.90f;

    private ImageUtils() {}

    /**
     * Resize (if too large) and re-encode as JPEG at 85% quality.
     * Returns the compressed byte array.
     */
    public static byte[] compressAndResize(byte[] original, String mimeType) throws IOException {
        BufferedImage src;
        try (ByteArrayInputStream bis = new ByteArrayInputStream(original)) {
            src = ImageIO.read(bis);
        }
        if (src == null) {
            throw new IOException("Cannot decode image — unsupported format");
        }

        // Resize if either dimension exceeds MAX_DIMENSION
        BufferedImage scaled = resize(src);

        // Re-encode as JPEG with quality setting
        return encodeAsJpeg(scaled, JPEG_QUALITY);
    }

    private static BufferedImage resize(BufferedImage img) {
        int w = img.getWidth();
        int h = img.getHeight();
        if (w <= MAX_DIMENSION && h <= MAX_DIMENSION) return img;

        double ratio = (double) MAX_DIMENSION / Math.max(w, h);
        int newW = (int) (w * ratio);
        int newH = (int) (h * ratio);

        BufferedImage resized = new BufferedImage(newW, newH, BufferedImage.TYPE_INT_RGB);
        Graphics2D g = resized.createGraphics();
        g.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BILINEAR);
        g.setRenderingHint(RenderingHints.KEY_RENDERING, RenderingHints.VALUE_RENDER_QUALITY);
        g.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
        // Fill white background (prevents black bg for PNGs with transparency)
        g.setColor(Color.WHITE);
        g.fillRect(0, 0, newW, newH);
        g.drawImage(img, 0, 0, newW, newH, null);
        g.dispose();
        log.debug("Image resized from {}x{} to {}x{}", w, h, newW, newH);
        return resized;
    }

    private static byte[] encodeAsJpeg(BufferedImage img, float quality) throws IOException {
        // Ensure RGB (JPEG doesn't support alpha channel)
        if (img.getType() != BufferedImage.TYPE_INT_RGB) {
            BufferedImage rgb = new BufferedImage(img.getWidth(), img.getHeight(), BufferedImage.TYPE_INT_RGB);
            Graphics2D g = rgb.createGraphics();
            g.setColor(Color.WHITE);
            g.fillRect(0, 0, img.getWidth(), img.getHeight());
            g.drawImage(img, 0, 0, null);
            g.dispose();
            img = rgb;
        }

        Iterator<ImageWriter> writers = ImageIO.getImageWritersByFormatName("jpeg");
        if (!writers.hasNext()) throw new IOException("No JPEG writer found");
        ImageWriter writer = writers.next();

        ImageWriteParam params = writer.getDefaultWriteParam();
        params.setCompressionMode(ImageWriteParam.MODE_EXPLICIT);
        params.setCompressionQuality(quality);

        ByteArrayOutputStream bos = new ByteArrayOutputStream();
        try (ImageOutputStream ios = ImageIO.createImageOutputStream(bos)) {
            writer.setOutput(ios);
            writer.write(null, new IIOImage(img, null, null), params);
        } finally {
            writer.dispose();
        }
        return bos.toByteArray();
    }
}
