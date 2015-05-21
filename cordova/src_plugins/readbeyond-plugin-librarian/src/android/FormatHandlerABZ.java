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
import java.util.zip.ZipEntry;
import java.util.zip.ZipFile;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.json.JSONObject;

public class FormatHandlerABZ extends FormatHandlerAbstractZIP {

    // ABZ format
    private static final String   ABZ_FORMAT             = "abz";
    private static final String   ABZ_DEFAULT_COVER_JPG  = "cover.jpg";
    private static final String   ABZ_DEFAULT_COVER_PNG  = "cover.png";
    private static final String   ABZ_EXTENSION_PLAYLIST = ".m3u";
    private static final String   ABZ_FILE_METADATA      = "metadata.txt";
    private static final String   ABZ_M3U_HEADER         = "#EXTM3U";
    private static final Pattern  ABZ_M3U_LINE_PATTERN   = Pattern.compile("#EXTINF:([0-9]+),(.*)");
    private static final String   ABZ_M3U_LINE_PREAMBLE  = "#EXTINF:";
    private static final String[] ABZ_AUDIO_EXTENSIONS   = { ".aac",
                                                             ".flac",
                                                             ".m4a",
                                                             ".mp3",
                                                             ".mp4",
                                                             ".oga",
                                                             ".ogg",
                                                             ".wav",
                                                             ".webm" };

    public FormatHandlerABZ() {
        super();
        this.setFormatName(ABZ_FORMAT);
    }

    public Publication parseFile(File file) {
        Publication p = super.parseFile(file);

        Format format = new Format(ABZ_FORMAT);

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
                
                if (lower.endsWith(ABZ_DEFAULT_COVER_JPG) || lower.endsWith(ABZ_DEFAULT_COVER_PNG)) {
                    zeCover = name;
                } else if (lower.endsWith(ABZ_EXTENSION_PLAYLIST)) {
                    zePlaylist = name;
                } else if (this.fileHasAllowedExtension(lower, ABZ_AUDIO_EXTENSIONS)) {
                    p.isValid(true);
                    assets.add(name);
                } else if (lower.endsWith(ABZ_FILE_METADATA)) {
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
            if ((! foundCover) && (zeCover != null)) {
                format.addMetadatum("internalPathCover", zeCover);
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
                        assets = this.getSortedListOfAssets(path, ABZ_AUDIO_EXTENSIONS);
                    } else {
                        assets = this.parseM3UPlaylistEntry(path, playlistEntry);
                    }
                    return Librarian.stringify(assets, "assets");
                }

            }
        }
        return "";
    }

    private List<ZipAsset> parseM3UPlaylistEntry(String path, String playlistEntry) {
        List<ZipAsset> assets = new ArrayList<ZipAsset>();
        try {
            ZipFile zipFile = new ZipFile(new File(path), ZipFile.OPEN_READ);
            ZipEntry ze     = zipFile.getEntry(playlistEntry);
            String text     = this.getZipEntryText(zipFile, ze);
            String[] lines  = text.split("\n");
            
            // check that the first line starts with the M3U header
            if ((lines.length > 0) && (lines[0].startsWith(ABZ_M3U_HEADER))) {
                for (int i = 1; i < lines.length; i++) {
                    String line = lines[i].trim();
                    
                    // if line starts with the M3U preamble, parse it
                    if (line.startsWith(ABZ_M3U_LINE_PREAMBLE)) {
                        HashMap<String, String> meta = new HashMap<String, String>();
                       
                        // get track duration and title 
                        Matcher m = ABZ_M3U_LINE_PATTERN.matcher(line);
                        if (m.find()) {
                            meta.put("duration",    m.group(1));
                            meta.put("title",       m.group(2));
                        }
                        String line2 = lines[i+1].trim();
                        
                        // generate entry path
                        File w = new File(new File(playlistEntry).getParent(), line2);
                        line2 = w.getAbsolutePath().substring(1);
                        
                        // add asset
                        assets.add(new ZipAsset(line2, meta));

                        // go to the next pair of lines
                        i += 1;
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
