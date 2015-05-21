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

import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaPlugin;
import org.json.JSONObject;
import org.json.JSONArray;
import org.json.JSONException;

import android.os.Build;
import android.os.Environment;

import java.io.File;
import java.io.FileFilter;
import java.util.ArrayList;
import java.util.Map.Entry;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;

public class Librarian extends CordovaPlugin {
    
    // argument names and values
    public static final String   ARGUMENT_ID                              = "id";
    public static final String   ARGUMENT_MODE                            = "mode";
    public static final String   ARGUMENT_MODE_CREATE_THUMBNAIL_DIRECTORY = "createThumbnailDirectory";
    public static final String   ARGUMENT_MODE_EMPTY_THUMBNAIL_DIRECTORY  = "emptyThumbnailDirectory";
    public static final String   ARGUMENT_MODE_FULL                       = "full";
    public static final String   ARGUMENT_MODE_SINGLE                     = "single";
    public static final String   ARGUMENT_MODE_CUSTOM                     = "custom";
    public static final String   ARGUMENT_PATH                            = "path";
    public static final String   ARGUMENT_ARGS                            = "args";
    public static final String   ARGUMENT_ARGS_ENTIRE_VOLUME              = "entireVolume";
    public static final String   ARGUMENT_ARGS_PATHS                      = "paths";
    public static final String   ARGUMENT_ARGS_RECURSIVE                  = "recursive";
    public static final String   ARGUMENT_ARGS_IGNOREHIDDEN               = "ignoreHidden";
    public static final String   ARGUMENT_ARGS_FORMAT                     = "format";
    public static final String   ARGUMENT_ARGS_FORMATS                    = "formats";
    public static final String   ARGUMENT_ARGS_THUMBNAILDIRECTORY         = "thumbnailDirectory";
    public static final String   ARGUMENT_ARGS_THUMBNAILWIDTH             = "thumbnailWidth";
    public static final String   ARGUMENT_ARGS_THUMBNAILHEIGHT            = "thumbnailHeight";

    // formats
    public static final String   FORMAT_EPUB                              = "epub";
    public static final String   FORMAT_ABZ                               = "abz";
    public static final String   FORMAT_CBZ                               = "cbz";
    
    // defaults
    public static final boolean  DEFAULT_ENTIRE_VOLUME                    = false;
    public static final String   DEFAULT_FORMAT                           = FORMAT_EPUB;
    public static final boolean  DEFAULT_IGNOREHIDDEN                     = true;
    public static final boolean  DEFAULT_RECURSIVE                        = true;
    public static final String   DEFAULT_THUMBNAIL_DIRECTORY              = "minstrel/.thumbnails";
    public static final int      DEFAULT_THUMBNAIL_HEIGHT                 = 400;
    public static final int      DEFAULT_THUMBNAIL_WIDTH                  = 300;

    @Override
    public boolean execute(String action, final JSONArray args, final CallbackContext callbackContext) throws JSONException {
        cordova.getThreadPool().execute(new Runnable() {
            public void run() {
                
                try {
                    
                    // read arguments
                    JSONObject  argsJSONObject      = args.getJSONObject(0);
                    String      mode                = argsJSONObject.getString(ARGUMENT_MODE);
                    String      path                = argsJSONObject.getString(ARGUMENT_PATH);
                    JSONObject  parameters          = new JSONObject(argsJSONObject.getString(ARGUMENT_ARGS));
                    
                    boolean     entireVolume        = parameters.optBoolean(   ARGUMENT_ARGS_ENTIRE_VOLUME,      DEFAULT_ENTIRE_VOLUME);
                    String      format              = parameters.optString(    ARGUMENT_ARGS_FORMAT,             DEFAULT_FORMAT);
                    JSONObject  formats             = parameters.optJSONObject(ARGUMENT_ARGS_FORMATS);
                    boolean     ignoreHidden        = parameters.optBoolean(   ARGUMENT_ARGS_IGNOREHIDDEN,       DEFAULT_IGNOREHIDDEN);
                    JSONArray   paths               = parameters.optJSONArray( ARGUMENT_ARGS_PATHS);
                    boolean     recursive           = parameters.optBoolean(   ARGUMENT_ARGS_RECURSIVE,          DEFAULT_RECURSIVE);
                    String      thumbnailDirectory  = parameters.optString(    ARGUMENT_ARGS_THUMBNAILDIRECTORY, DEFAULT_THUMBNAIL_DIRECTORY);
                    int         thumbnailHeight     = parameters.optInt(       ARGUMENT_ARGS_THUMBNAILHEIGHT,    DEFAULT_THUMBNAIL_HEIGHT);
                    int         thumbnailWidth      = parameters.optInt(       ARGUMENT_ARGS_THUMBNAILWIDTH,     DEFAULT_THUMBNAIL_WIDTH);
                    

                    // make sure the thumbnail directory exists
                    if (mode.equals(ARGUMENT_MODE_CREATE_THUMBNAIL_DIRECTORY)) {
                        ensureThumbnailDirectoryExist(thumbnailDirectory, false);
                        callbackContext.success("");
                        return;
                    }

                    // empty the thumbnail directory (if any)
                    if (mode.equals(ARGUMENT_MODE_EMPTY_THUMBNAIL_DIRECTORY)) {
                        ensureThumbnailDirectoryExist(thumbnailDirectory, true);
                        callbackContext.success("");
                        return;
                    }

                    // mode full or single 
                    if (mode.equals(ARGUMENT_MODE_FULL) || mode.equals(ARGUMENT_MODE_SINGLE)) {
                       
                        // make sure the thumbnail directory exists
                        ensureThumbnailDirectoryExist(thumbnailDirectory, false);
                        List<Publication> publications = new ArrayList<Publication>();

                        // single
                        if (mode.equals(ARGUMENT_MODE_SINGLE)) {
                            FormatHandler fh = getFormatHandler(format);
                            if (fh != null) {
                                fh.setThumbnailInfo(thumbnailDirectory, thumbnailWidth, thumbnailHeight);
                                discoverSingleFile(new File(path), fh, publications);
                            }
                        }

                        // full
                        if (mode.equals(ARGUMENT_MODE_FULL)) { 
                            // get storagePaths
                            String[] storagePaths = null;
                            if (entireVolume) {
                                storagePaths = getStoragePaths(path);
                            } else {
                                storagePaths = JSONArrayToStringArray(paths);
                            }

                            // discover
                            if ((storagePaths != null) && (storagePaths.length > 0)) {
                                Iterator<String> iter = formats.keys();
                                while (iter.hasNext()) {
                                    String    f           = iter.next();
                                    JSONArray extensions  = formats.optJSONArray(f);
                                    String[]  extensions2 = JSONArrayToStringArray(extensions);
                                    FormatHandler fh      = getFormatHandler(f);
                                    if (fh != null) {
                                        // setup
                                        fh.addAllowedLowercasedExtensions(extensions2);
                                        fh.setThumbnailInfo(thumbnailDirectory, thumbnailWidth, thumbnailHeight);
                                        
                                        // discover publications
                                        for (String sp: storagePaths) {
                                            discoverPublications(sp, fh, publications);
                                        }
                                    }
                                }
                            }
                        }

                        for (Publication p : publications) {
                            try {
                                // TODO prioritize formats; right now we simply pick the first one
                                Format defaultFormat      = p.getFormats().get(0);
                                String defaultFormatTitle = defaultFormat.getMetadatum("title");
                                String defaultFormatRelativePathThumbnail = defaultFormat.getMetadatum("relativePathThumbnail");
                                p.setMainFormat(defaultFormat.getName());
                                if ((defaultFormatTitle != null) && (!defaultFormatTitle.equals(""))) {
                                    p.setTitle(defaultFormatTitle);
                                }
                                if ((defaultFormatRelativePathThumbnail != null) && (!defaultFormatRelativePathThumbnail.equals(""))) {
                                    p.setRelativePathThumbnail(defaultFormatRelativePathThumbnail);
                                    p.setAbsolutePathThumbnail((new File(thumbnailDirectory, defaultFormatRelativePathThumbnail)).getAbsolutePath());
                                }
                            } catch (Exception e) {
                                // nop
                            }
                        }
                        
                        // stringify and callback
                        callbackContext.success(stringify(publications, "publications"));
                        return;
                    }

                    // mode custom
                    if (mode.equals(ARGUMENT_MODE_CUSTOM)) {
                        String jsonString = ""; 
                        FormatHandler fh = getFormatHandler(format);
                        if (fh != null) {
                            jsonString = fh.customAction(path, parameters);
                        }

                        // callback
                        callbackContext.success(jsonString);
                        return;
                    }

                    // return JSON string
                    callbackContext.success("");

                } catch (Exception e) {
                
                    callbackContext.error("Exception " + e);
                
                } 
            }
        });
        return true;
    }

    private String[] JSONArrayToStringArray(JSONArray array) {
        if (array.length() < 1) {
            return null;
        }
        String[] ret = new String[array.length()];
        for (int i = 0; i < array.length(); i++) {
            ret[i] = array.optString(i, "");
        }
        return ret;
    }

    private FormatHandler getFormatHandler(String format) {
        if (format.equals(FORMAT_ABZ)) {
            return new FormatHandlerABZ();
        }
        if (format.equals(FORMAT_CBZ)) {
            return new FormatHandlerCBZ();
        }
        if (format.equals(FORMAT_EPUB)) {
            return new FormatHandlerEPUB();
        }
        return null;
    }

    private void discoverPublications(String storagePath, FormatHandler fh, List<Publication> publications) {
        FileFilter directoryFilter = new FileFilter() {
			public boolean accept(File file) {
				return file.isDirectory();
			}
		};

        FileFilter fileFilter = new FileFilter() {
			public boolean accept(File file) {
				return ! file.isDirectory();
			}
		};
        
        try {
            File d = new File(storagePath);
            if ((d.exists()) && (d.canRead()) && (d.isDirectory())) {
                discoverPublicationFiles(d, fh, publications, directoryFilter, fileFilter);
            }
        } catch (Exception e) {
            // nop
        }
    }
    private void discoverPublicationFiles(File rootDirectory, FormatHandler fh, List<Publication> publications, FileFilter directoryFilter, FileFilter fileFilter) {
        boolean ignoreHidden = true; // TODO
        boolean recursive    = true; // TODO

        File[] dirs = rootDirectory.listFiles(directoryFilter);
        for (File d : dirs) {
            if ((recursive) && (d.canRead()) && (! d.isHidden())) {
                discoverPublicationFiles(d, fh, publications, directoryFilter, fileFilter);
            }
        }

        File[] files = rootDirectory.listFiles(fileFilter);
        for (File f : files) {
            String n = f.getName();
            if ((!((ignoreHidden) && (n.startsWith(".")))) && (fh.isParsable(n.toLowerCase()))) { 
                discoverSingleFile(f, fh, publications);
            }
        }
    }
    private void discoverSingleFile(File f, FormatHandler fh, List<Publication> publications) {
        Publication p = fh.parseFile(f);
        if (p.isValid()) {
            publications.add(p);
        }
    }

    // get a String[]
    // each representing a path to be visited
    // (possibly recursively)
    // to discover LibraryItem objects
    //
    // arg can be "" or something like "minstrel/"
    private String[] getStoragePaths(String arg) {
        // try using the Storage facility
        String[] storagePaths = null;
        try {
            storagePaths = Storage.getStoragePaths();
        } catch (Exception e) {
            // nop
        }
        
        // if something went wrong, defaults to just the External Storage Directory
        if ((storagePaths == null) || (storagePaths.length < 1)) {
            storagePaths    = new String[1];
            storagePaths[0] = Environment.getExternalStorageDirectory().getAbsolutePath();
        }

        // storagePaths contains the paths to be visited
        for (int i = 0; i < storagePaths.length; i++) {
            storagePaths[i] = (new File(storagePaths[i], arg)).getAbsolutePath();
        }
        return storagePaths;
    }

    // make sure that after this call
    // the thumbnail directory exists and it is empty
    private boolean ensureThumbnailDirectoryExist(String pathThumbnailDirectory, boolean delete) {
        try {
            // create thumbnails directory and .nomedia file
            File thumbnailDirectory = new File(pathThumbnailDirectory);
            
            if ((delete) && (thumbnailDirectory.exists())) {
                // delete all thumbnails
                String[] thumbnailFileNames = thumbnailDirectory.list();
                for (int i = 0; i < thumbnailFileNames.length; i++) {
                    new File(thumbnailDirectory, thumbnailFileNames[i]).delete();
                }
                
                // delete directory
                //
                // old version
                // thumbnailDirectory.delete();
                //
                // new version, workaround for KitKat: rename before deleting
                final File to = new File(thumbnailDirectory.getAbsolutePath() + System.currentTimeMillis());
                thumbnailDirectory.renameTo(to);
                to.delete();
                thumbnailDirectory = null;
            }
           
            // create thumbnail directory 
            if (!thumbnailDirectory.exists()) {
                thumbnailDirectory = new File(pathThumbnailDirectory); 
                thumbnailDirectory.mkdirs();
            }

            // create .nomedia file to avoid Android indexing this directory 
            File nomediaFile = new File(thumbnailDirectory, ".nomedia");
            if (!(nomediaFile.exists())) {
                nomediaFile.createNewFile();
            }
            
            // all ok, return true
            return true;

        } catch (Exception e) {
            // nop
        }
        return false;
    }

    // JSON stringify the given list of LibraryItem objects
    public static String stringify(List items, String mainKey) {
        JSONObject obj  = new JSONObject();
        try {
            JSONObject main = new JSONObject();
            JSONArray  arr  = new JSONArray();
            for (Object item : items) {
                JSONPrintable jItem = (JSONPrintable)item;
                arr.put(jItem.toJSONObject());
            }
            main.put("items", arr);
            obj.put(mainKey, main);
        } catch (Exception e) {
            // nop
        }
        return obj.toString();
    }
}
