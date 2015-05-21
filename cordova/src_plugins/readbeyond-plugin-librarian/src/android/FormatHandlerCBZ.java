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

import java.io.File;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.zip.ZipEntry;
import java.util.zip.ZipFile;

import org.json.JSONObject;

public class FormatHandlerCBZ extends FormatHandlerAbstractZIP {
   
    // CBZ format
    private static final String   CBZ_FORMAT            = "cbz";
    private static final String   CBZ_DEFAULT_COVER_JPG = "cover.jpg";
    private static final String   CBZ_DEFAULT_COVER_PNG = "cover.png";
    private static final String   CBZ_FILE_METADATA     = "metadata.txt";
    private static final String   CBZ_FILE_PLAYLIST     = "playlist.txt";
    private static final String[] CBZ_IMAGE_EXTENSIONS  = { ".apng",
                                                            ".bmp",
                                                            ".gif",
                                                            ".jpeg",
                                                            ".jpg",
                                                            ".png",
                                                            ".svg",
                                                            ".tiff" };
    
    public FormatHandlerCBZ() {
        super();
        this.setFormatName(CBZ_FORMAT);
    }

    public Publication parseFile(File file) {
        Publication p = super.parseFile(file);

        Format format = new Format(CBZ_FORMAT);

        try {
            ZipFile zipFile = new ZipFile(file, ZipFile.OPEN_READ);
            Enumeration<? extends ZipEntry> zipFileEntries = zipFile.entries();
            boolean foundMetadataFile   = false;
            boolean foundCover          = false;
            boolean foundPlaylist       = false;
            String zeCover              = null;
            String zePlaylist           = null;
            List<String> assets         = new ArrayList<String>();
            while (zipFileEntries.hasMoreElements()) {
                ZipEntry ze = zipFileEntries.nextElement();
                String name = ze.getName();
                String lower = name.toLowerCase();
                
                if (lower.endsWith(CBZ_DEFAULT_COVER_JPG) || lower.endsWith(CBZ_DEFAULT_COVER_PNG)) {
                    p.isValid(true);
                    zeCover = name;
                    assets.add(name);
                } else if (lower.endsWith(CBZ_FILE_PLAYLIST)) {
                    zePlaylist = name;
                } else if (this.fileHasAllowedExtension(lower, CBZ_IMAGE_EXTENSIONS)) {
                    p.isValid(true);
                    assets.add(name);
                } else if (lower.endsWith(CBZ_FILE_METADATA)) {
                    p.isValid(true);
                    foundMetadataFile = true;
                    if (this.parseMetadataFile(zipFile, ze, format)) {
                        if (format.getMetadatum("internalPathPlaylist") != null) {
                            foundPlaylist = true;
                        }
                        if (format.getMetadatum("internalPathCover") != null) {
                            foundCover = true;
                        }
                    }
                } // end if metadata
            } // end while
            zipFile.close();
           
            // set cover
            if (! foundCover) {
                // no cover found from metadata
                // found default?
                if (zeCover != null) {
                    // use default
                    format.addMetadatum("internalPathCover", zeCover);
                } else {
                    // sort and use the first image found
                    if (assets.size() > 0) {
                        Collections.sort(assets);
                        format.addMetadatum("internalPathCover", assets.get(0));
                    }
                }
            }
           
            // default playlist found?
            if ((!foundPlaylist) && (zePlaylist != null)) {
                format.addMetadatum("internalPathPlaylist", zePlaylist);
            }
            
            // set number of assets
            format.addMetadatum("numberOfAssets", "" + assets.size());
            
        } catch (Exception e) {
            // invalidate publication, so it will not be added to library
            p.isValid(false);
        } // end try

        p.addFormat(format);

        // extract cover
        super.extractCover(file, format, p.getID());

        return p;
    }

    public String customAction(String path, JSONObject parameters) {
        if (parameters != null) {
            String command = parameters.optString("command", null);
            if (command != null) {
                
                // get sorted list of assets
                if (command.equals("getSortedListOfAssets")) {
                    String playlistEntry  = parameters.optString("internalPathPlaylist", null);
                    List<ZipAsset> assets = new ArrayList<ZipAsset>();
                    if ((playlistEntry == null) || (playlistEntry.equals(""))) {
                        assets = this.getSortedListOfAssets(path, CBZ_IMAGE_EXTENSIONS);
                    } else {
                        assets = this.parseImagePlaylistEntry(path, playlistEntry);
                    }
                    return Librarian.stringify(assets, "assets");
                }

            }
        }
        return "";
    }

    private List<ZipAsset> parseImagePlaylistEntry(String path, String playlistEntry) {
        List<ZipAsset> assets = new ArrayList<ZipAsset>();
        try {
            ZipFile zipFile = new ZipFile(new File(path), ZipFile.OPEN_READ);
            ZipEntry ze     = zipFile.getEntry(playlistEntry);
            String text     = this.getZipEntryText(zipFile, ze);
            String[] lines  = text.split("\n");
            
            // if we have lines 
            if (lines.length > 0) {
                for (int i = 0; i < lines.length; i++) {
                    String line = lines[i].trim();
                   
                    // do we have a file name? 
                    if ((line.length() > 0) && (!line.startsWith("#"))) {
                        HashMap<String, String> meta = new HashMap<String, String>();
                        
                        // duration
                        if (i + 1 < lines.length) {
                            String line2 = lines[i+1].trim();
                            if ((line2.length() > 0) && (!line2.startsWith("#"))) {
                                i += 1;
                                meta.put("duration", line2);
                                
                                // title 
                                if (i + 1 < lines.length) {
                                    String line3 = lines[i+1].trim();
                                    if ((line3.length() > 0) && (!line3.startsWith("#"))) {
                                        i += 1;
                                        meta.put("title", line3);
                                    }
                                }
                            }
                        }
                        
                        // generate entry path
                        File w = new File(new File(playlistEntry).getParent(), line);
                        line = w.getAbsolutePath().substring(1);
                        
                        // add asset
                        assets.add(new ZipAsset(line, meta));
                    } else {
                        // either comment or blank line => continue
                    }
                }
            }
            
            // close ZIP
            zipFile.close();
        } catch (Exception e) {
            // nothing
        } 
        return assets;
    } 
}
