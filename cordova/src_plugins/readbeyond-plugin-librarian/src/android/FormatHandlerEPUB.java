//
//            _           _            _ 
//           (_)         | |          | |
//  _ __ ___  _ _ __  ___| |_ _ __ ___| |
// | '_ ` _ \| | '_ \/ __| __| '__/ _ \ |
// | | | | | | | | | \__ \ |_| | |  __/ |
// |_| |_| |_|_|_| |_|___/\__|_|  \___|_|
//
// Author:      Alberto Pettarin (www.albertopettarin.it)
// Copyright:   Copyright 2013-2015, ReadBeyond Srl (www.readbeyond.it)
// License:     MIT
// Email:       minstrel@readbeyond.it
// Web:         http://www.readbeyond.it/minstrel/
// Status:      Production
//

package it.readbeyond.minstrel.librarian;

import android.util.Xml;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.util.zip.ZipEntry;
import java.util.zip.ZipFile;

import org.json.JSONObject;
import org.xmlpull.v1.XmlPullParser;
import org.xmlpull.v1.XmlPullParserException;

public class FormatHandlerEPUB extends FormatHandlerAbstractZIP {

    private final static String EPUB_FORMAT                                    = "epub";
    private final static String EPUB_NAMESPACE_XMLNS_CONTAINER                 = "urn:oasis:names:tc:opendocument:xmlns:container";
    private final static String EPUB_NAMESPACE_OPF                             = "http://www.idpf.org/2007/opf";
    private final static String EPUB_NAMESPACE_DC                              = "http://purl.org/dc/elements/1.1/";
    private final static String EPUB_CONTAINER_PATH                            = "META-INF/container.xml";
    private final static String EPUB_CONTAINER_CONTAINER                       = "container";
    private final static String EPUB_CONTAINER_ROOTFILES                       = "rootfiles";
    private final static String EPUB_CONTAINER_ROOTFILE                        = "rootfile";
    private final static String EPUB_CONTAINER_FULLPATH                        = "full-path";
    private final static String EPUB_CONTAINER_MEDIATYPE                       = "media-type";
    private final static String EPUB_CONTAINER_MEDIATYPE_OPF                   = "application/oebps-package+xml";
    private final static String EPUB_OPF_PACKAGE                               = "package";
    private final static String EPUB_OPF_METADATA                              = "metadata";
    private final static String EPUB_OPF_METADATA_TITLE                        = "title";
    private final static String EPUB_OPF_METADATA_CREATOR                      = "creator";
    private final static String EPUB_OPF_METADATA_LANGUAGE                     = "language";
    private final static String EPUB_OPF_METADATA_META                         = "meta";
    private final static String EPUB_OPF_METADATA_META_PROPERTY                = "property";
    private final static String EPUB_OPF_METADATA_META_PROPERTY_MEDIADURATION  = "media:duration";
    private final static String EPUB_OPF_METADATA_META_PROPERTY_MEDIANARRATOR  = "media:narrator";
    private final static String EPUB_OPF_METADATA_META_REFINES                 = "refines";
    private final static String EPUB_OPF_METADATA_META_NAME                    = "name";
    private final static String EPUB_OPF_METADATA_META_NAME_COVER              = "cover";
    private final static String EPUB_OPF_METADATA_META_NAME_SERIES             = "calibre:series";
    private final static String EPUB_OPF_METADATA_META_NAME_SERIES_INDEX       = "calibre:series_index";
    private final static String EPUB_OPF_METADATA_META_CONTENT                 = "content";
    private final static String EPUB_OPF_MANIFEST                              = "manifest";
    private final static String EPUB_OPF_MANIFEST_ITEM                         = "item";
    private final static String EPUB_OPF_MANIFEST_ITEM_ID                      = "id";
    private final static String EPUB_OPF_MANIFEST_ITEM_HREF                    = "href";
    private final static String EPUB_OPF_MANIFEST_ITEM_PROPERTIES              = "properties";
    private final static String EPUB_OPF_MANIFEST_ITEM_PROPERTIES_COVERIMAGE   = "cover-image";

    private XmlPullParser       parser;
    private String              pathThumbnailSourceRelativeToOPF;
    private String              coverManifestItemID;

    public FormatHandlerEPUB() {
        super();
        this.setFormatName(EPUB_FORMAT);
    }

    public Publication parseFile(File file) {
        Publication p                    = super.parseFile(file);
        Format format                    = new Format(EPUB_FORMAT);
        pathThumbnailSourceRelativeToOPF = null; 
        coverManifestItemID              = null;
        
        String OPFPath                   = this.getOPFPath(file);
        if (OPFPath != null) {
            try {
                ZipFile zipFile = new ZipFile(file, ZipFile.OPEN_READ);
                ZipEntry OPFEntry = zipFile.getEntry(OPFPath);
                if (OPFEntry != null) {
                    
                    InputStream is;

                    // first pass: parse metadata
                    is = zipFile.getInputStream(OPFEntry);
                    parser = Xml.newPullParser();
                    parser.setFeature(XmlPullParser.FEATURE_PROCESS_NAMESPACES, true);
                    parser.setInput(is, null);
                    parser.nextTag();
                    this.parsePackage(format, 1);
                    is.close();

                    // second pass: parse manifest
                    is = zipFile.getInputStream(OPFEntry);
                    parser = Xml.newPullParser();
                    parser.setFeature(XmlPullParser.FEATURE_PROCESS_NAMESPACES, true);
                    parser.setInput(is, null);
                    parser.nextTag();
                    this.parsePackage(format, 2);
                    is.close();

                    // item is valid
                    p.isValid(true);

                    // set the cover path, relative to the EPUB container (aka ZIP) root
                    if (pathThumbnailSourceRelativeToOPF != null) {
                        // concatenate OPFPath parent directory and pathThumbnailSourceRelativeToOPF
                        File tmp = new File(new File(OPFPath).getParent(), pathThumbnailSourceRelativeToOPF);
                        // remove leading "/"
                        format.addMetadatum("internalPathCover", tmp.getAbsolutePath().substring(1));
                    }
                    
                }
                zipFile.close();
            } catch (Exception e) {
                // invalidate item, so it will not be added to library
                p.isValid(false);
            }
        }

        p.addFormat(format);

        // extract cover
        super.extractCover(file, format, p.getID());

        return p;
    }

    //
    //
    // PRIVATE METHODS
    //
    //

    // get path of OPF file, relative to the EPUB container (aka ZIP) root
    private String getOPFPath(File f) {
        String ret = null;
        try {
            ZipFile zipFile = new ZipFile(f, ZipFile.OPEN_READ);
            ZipEntry containerEntry = zipFile.getEntry(EPUB_CONTAINER_PATH);
            if (containerEntry != null) {
                InputStream is = zipFile.getInputStream(containerEntry);
                parser = Xml.newPullParser();
                parser.setFeature(XmlPullParser.FEATURE_PROCESS_NAMESPACES, true);
                parser.setInput(is, null);
                parser.nextTag();
                ret = parseContainer();
                is.close();
            }
            zipFile.close();
        } catch (Exception e) {
            // nop
        }
        return ret;
    }
    private String parseContainer() throws XmlPullParserException, IOException {
        parser.require(XmlPullParser.START_TAG, EPUB_NAMESPACE_XMLNS_CONTAINER, EPUB_CONTAINER_CONTAINER);
        while (parser.next() != XmlPullParser.END_TAG) {
            if (parser.getEventType() != XmlPullParser.START_TAG) {
                continue;
            }
            String name = parser.getName();
            if (name.equals(EPUB_CONTAINER_ROOTFILES)) {
                return parseRootfiles();
            } else {
                skip();
            }
        }
        return null; 
    }
    private String parseRootfiles() throws XmlPullParserException, IOException {
        parser.require(XmlPullParser.START_TAG, EPUB_NAMESPACE_XMLNS_CONTAINER, EPUB_CONTAINER_ROOTFILES);
        while (parser.next() != XmlPullParser.END_TAG) {
            if (parser.getEventType() != XmlPullParser.START_TAG) {
                continue;
            }
            String name = parser.getName();
            if (name.equals(EPUB_CONTAINER_ROOTFILE)) {
                String fullpath = parseRootfile();
                if (fullpath != null) {
                    return fullpath;
                }
            } else {
                skip();
            }
        }
        return null; 
    }
    private String parseRootfile() throws XmlPullParserException, IOException {
        parser.require(XmlPullParser.START_TAG, EPUB_NAMESPACE_XMLNS_CONTAINER, EPUB_CONTAINER_ROOTFILE);
        String fullpath  = parser.getAttributeValue(null, EPUB_CONTAINER_FULLPATH);
        String mediatype = parser.getAttributeValue(null, EPUB_CONTAINER_MEDIATYPE);
        if ((fullpath != null) && (mediatype != null) && (mediatype.equals(EPUB_CONTAINER_MEDIATYPE_OPF))) {
            return fullpath;
        }
        return null; 
    }

    // parse package
    private void parsePackage(Format format, int pass) throws XmlPullParserException, IOException {
        parser.require(XmlPullParser.START_TAG, EPUB_NAMESPACE_OPF, EPUB_OPF_PACKAGE);
        
        // first pass: metadata
        if (pass == 1) {
            while (parser.next() != XmlPullParser.END_TAG) {
                if (parser.getEventType() != XmlPullParser.START_TAG) {
                    continue;
                }
                String name = parser.getName();
                if (name.equals(EPUB_OPF_METADATA)) {
                    parseMetadata(format);
                    return;
                } else {
                    skip();
                }
            }
        }
       
        // second pass: manifest 
        if (pass == 2) {
            while (parser.next() != XmlPullParser.END_TAG) {
                if (parser.getEventType() != XmlPullParser.START_TAG) {
                    continue;
                }
                String name = parser.getName();
                if (name.equals(EPUB_OPF_MANIFEST)) {
                    parseManifest(format);
                    return;
                } else {
                    skip();
                }
            }
        }
    }

    // parse manifest
    private void parseManifest(Format format) throws XmlPullParserException, IOException {
        parser.require(XmlPullParser.START_TAG, EPUB_NAMESPACE_OPF, EPUB_OPF_MANIFEST);
        while (parser.next() != XmlPullParser.END_TAG) {
            if (parser.getEventType() != XmlPullParser.START_TAG) {
                continue;
            }
            String name = parser.getName();
            String ns = parser.getNamespace();
            if ((ns.equals(EPUB_NAMESPACE_OPF)) && (name.equals(EPUB_OPF_MANIFEST_ITEM))) {
                String id         = parser.getAttributeValue(null, EPUB_OPF_MANIFEST_ITEM_ID);
                String href       = parser.getAttributeValue(null, EPUB_OPF_MANIFEST_ITEM_HREF);
                String properties = parser.getAttributeValue(null, EPUB_OPF_MANIFEST_ITEM_PROPERTIES);
                if (href != null) {
                    // EPUB 3 cover specified by properties="cover-image"
                    if ((properties != null) && (properties.indexOf(EPUB_OPF_MANIFEST_ITEM_PROPERTIES_COVERIMAGE) > -1)) {
                        pathThumbnailSourceRelativeToOPF = href;
                    }
                    // EPUB 2 cover
                    if ((coverManifestItemID != null) && (id != null) && (id.equals(coverManifestItemID))) {
                        pathThumbnailSourceRelativeToOPF = href;
                    }

                    // if we got the cover, break
                    if (pathThumbnailSourceRelativeToOPF != null) {
                        return;
                    }
                }
            }
            skip();
        }
    }
    
    // parse metadata
    private void parseMetadata(Format format) throws XmlPullParserException, IOException {
        // TODO for speed reasons,
        // this approach will just get the first metadatum of each kind
        // we might want to generalize it
        boolean lookForTitle    = true;
        boolean lookForAuthor   = true;
        boolean lookForLanguage = true;
        parser.require(XmlPullParser.START_TAG, EPUB_NAMESPACE_OPF, EPUB_OPF_METADATA);
        while (parser.next() != XmlPullParser.END_TAG) {
            if (parser.getEventType() != XmlPullParser.START_TAG) {
                continue;
            }
            String name = parser.getName();
            String ns = parser.getNamespace();
            if ((ns.equals(EPUB_NAMESPACE_OPF)) || (ns.equals(EPUB_NAMESPACE_DC))) {
                if ((lookForTitle) && (name.equals(EPUB_OPF_METADATA_TITLE))) {
                    format.addMetadatum("title", readElement(EPUB_NAMESPACE_DC, EPUB_OPF_METADATA_TITLE));
                    lookForTitle = false;
                } else if ((lookForAuthor) && (name.equals(EPUB_OPF_METADATA_CREATOR))) {
                    format.addMetadatum("author", readElement(EPUB_NAMESPACE_DC, EPUB_OPF_METADATA_CREATOR));
                    lookForAuthor = false;
                } else if ((lookForLanguage) && (name.equals(EPUB_OPF_METADATA_LANGUAGE))) {
                    format.addMetadatum("language", readElement(EPUB_NAMESPACE_DC, EPUB_OPF_METADATA_LANGUAGE));
                    lookForLanguage = false;
                } else if (name.equals(EPUB_OPF_METADATA_META)) {
                    parseMeta(format);
                } else {
                    skip();
                }
            } else {
                skip();
            }
        }
    }
    private void parseMeta(Format format) throws XmlPullParserException, IOException {
        parser.require(XmlPullParser.START_TAG, EPUB_NAMESPACE_OPF, EPUB_OPF_METADATA_META);
        String property = parser.getAttributeValue(null, EPUB_OPF_METADATA_META_PROPERTY);
        String refines  = parser.getAttributeValue(null, EPUB_OPF_METADATA_META_REFINES);
        String name     = parser.getAttributeValue(null, EPUB_OPF_METADATA_META_NAME);
        String content  = parser.getAttributeValue(null, EPUB_OPF_METADATA_META_CONTENT);
        if ((refines == null) && (property != null)) {
            if (property.equals(EPUB_OPF_METADATA_META_PROPERTY_MEDIADURATION)) {
                format.addMetadatum("duration", readElement(EPUB_NAMESPACE_OPF, EPUB_OPF_METADATA_META));
            } else if (property.equals(EPUB_OPF_METADATA_META_PROPERTY_MEDIANARRATOR)) {
                format.addMetadatum("narrator", readElement(EPUB_NAMESPACE_OPF, EPUB_OPF_METADATA_META));
            } else {
                skip();
            }
        } else if ((name != null) && (content != null)) {
            if (name.equals(EPUB_OPF_METADATA_META_NAME_COVER)) {
                coverManifestItemID = content;
            }
            if (name.equals(EPUB_OPF_METADATA_META_NAME_SERIES)) {
                format.addMetadatum("series", content);
            }
            if (name.equals(EPUB_OPF_METADATA_META_NAME_SERIES_INDEX)) {
                format.addMetadatum("seriesIndex", content);
            }
            skip();
        } else {
            skip();
        }
    }

    // skip current XML event
    private void skip() throws XmlPullParserException, IOException {
        if (parser.getEventType() != XmlPullParser.START_TAG) {
            throw new IllegalStateException();
        }
        int depth = 1;
        while (depth != 0) {
            switch (parser.next()) {
            case XmlPullParser.END_TAG:
                depth--;
                break;
            case XmlPullParser.START_TAG:
                depth++;
                break;
            }
        }
    }

    // read the text content of the current XML event
    private String readElement(String ns, String name) throws IOException, XmlPullParserException {
        parser.require(XmlPullParser.START_TAG, ns, name);
        String value = readText();
        parser.require(XmlPullParser.END_TAG, ns, name);
        return value;
    }

    // extract the text content of the current XML event
    private String readText() throws IOException, XmlPullParserException {
        String result = "";
        if (parser.next() == XmlPullParser.TEXT) {
            result = parser.getText();
            parser.nextTag();
        }
        return result;
    }
}
