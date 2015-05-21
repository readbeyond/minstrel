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

package it.readbeyond.minstrel.unzipper;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaPlugin;
import org.json.JSONObject;
import org.json.JSONArray;
import org.json.JSONException;

import java.io.BufferedInputStream;
import java.io.BufferedOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Enumeration;
import java.util.Iterator;
import java.util.List;
import java.util.zip.ZipEntry;
import java.util.zip.ZipFile;

public class Unzipper extends CordovaPlugin {
   
    public static final String ARGUMENT_SRC_PATH                = "srcPath";
    public static final String ARGUMENT_DST_PATH                = "dstPath";
    public static final String ARGUMENT_MODE                    = "mode";
    public static final String ARGUMENT_ARGS                    = "args";
    public static final String ARGUMENT_ARGS_ENTRIES            = "entries";
    public static final String ARGUMENT_ARGS_EXCLUDE_EXTENSIONS = "excludeExtensions";
    public static final String ARGUMENT_ARGS_EXTENSIONS         = "extensions";
    public static final String ARGUMENT_ARGS_MAXIMUM_FILE_SIZE  = "maximumFileSize";

    public static final String ARGUMENT_MODE_ALL                = "all";
    public static final String ARGUMENT_MODE_ALL_NON_MEDIA      = "allNonMedia";
    public static final String ARGUMENT_MODE_ALL_SMALL          = "allSmall";
    public static final String ARGUMENT_MODE_ALL_STRUCTURE      = "allStructure";
    public static final String ARGUMENT_MODE_LIST               = "list";
    public static final String ARGUMENT_MODE_SELECTED           = "selected";
   
    public static final long DEFAULT_MAXIMUM_SIZE_FILE          = 4194304;  // 4 MB
    public static final int  BUFFER_SIZE                        = 4096;     // unzip in chunks of 4 KB

    @Override
    public boolean execute(String action, final JSONArray args, final CallbackContext callbackContext) throws JSONException {
        cordova.getThreadPool().execute(new Runnable() {
            public void run() {
                
                try {
                    
                    // read arguments 
                    JSONObject argsJSONObject = args.getJSONObject(0);
                    String srcPath            = argsJSONObject.getString(ARGUMENT_SRC_PATH);
                    String dstPath            = argsJSONObject.getString(ARGUMENT_DST_PATH);
                    String mode               = argsJSONObject.getString(ARGUMENT_MODE);
                    JSONObject parameters     = new JSONObject(argsJSONObject.getString(ARGUMENT_ARGS));
                    
                    String result             = "";
                    
                    if (mode.equals(ARGUMENT_MODE_LIST)) {
                        // list files in zip
                        result = list(srcPath);
                    } else {
                        // perform unzip
                        result = unzip(srcPath, dstPath, mode, parameters);
                        if (result == null) {
                            callbackContext.error("unzip failed");
                            return;
                        }
                    }
                    callbackContext.success(result);

                } catch(Exception e) {
                
                    callbackContext.error(e.getMessage());
                    return;
                
                } 
            }
        });
        return true;
    }
   
    private String list(String inputZip) throws IOException, JSONException {
        // list all files
        List<String> acc = new ArrayList<String>();
        File sourceZipFile = new File(inputZip);
        ZipFile zipFile = new ZipFile(sourceZipFile, ZipFile.OPEN_READ);
        Enumeration<? extends ZipEntry> zipFileEntries = zipFile.entries();
        while (zipFileEntries.hasMoreElements()) {
            acc.add(zipFileEntries.nextElement().getName());
        }
        zipFile.close(); 
        
        // sort
        Collections.sort(acc);

        // return JSON string
        return stringify(acc);
    }

	private String unzip(String inputZip, String destinationDirectory, String mode, JSONObject parameters) throws IOException, JSONException {

        // store the zip entries to decompress
        List<String> list = new ArrayList<String>();

        // store the zip entries actually decompressed
        List<String> decompressed = new ArrayList<String>();

        // open input zip file
        File sourceZipFile = new File(inputZip);
		ZipFile zipFile = new ZipFile(sourceZipFile, ZipFile.OPEN_READ);
	
        // open destination directory, creating it if needed    
        File unzipDestinationDirectory = new File(destinationDirectory);
        unzipDestinationDirectory.mkdirs();
        
        // extract all files
        if (mode.equals(ARGUMENT_MODE_ALL)) {
    		Enumeration<? extends ZipEntry> zipFileEntries = zipFile.entries();
            while (zipFileEntries.hasMoreElements()) {
                list.add(zipFileEntries.nextElement().getName());
            }
        }

        // extract all files except audio and video
        // (determined by file extension)
        if (mode.equals(ARGUMENT_MODE_ALL_NON_MEDIA)) {
            String[] excludeExtensions = JSONArrayToStringArray(parameters.optJSONArray(ARGUMENT_ARGS_EXCLUDE_EXTENSIONS));
    		Enumeration<? extends ZipEntry> zipFileEntries = zipFile.entries();
            while (zipFileEntries.hasMoreElements()) {
                String name  = zipFileEntries.nextElement().getName();
                String lower = name.toLowerCase();
                if (!isFile(lower, excludeExtensions)) {
                    list.add(name);
                }
            }
        }
        
        // extract all small files
        // maximum size is passed in args parameter
        // or, if not passed, defaults to const DEFAULT_MAXIMUM_SIZE_FILE
        if (mode.equals(ARGUMENT_MODE_ALL_SMALL)) {
    	    long maximum_size = parameters.optLong(ARGUMENT_ARGS_MAXIMUM_FILE_SIZE, DEFAULT_MAXIMUM_SIZE_FILE);
            Enumeration<? extends ZipEntry> zipFileEntries = zipFile.entries();
            while (zipFileEntries.hasMoreElements()) {
                ZipEntry ze = zipFileEntries.nextElement();
                if (ze.getSize() <= maximum_size) {
                    list.add(ze.getName());
                }
            }
        }

        // extract only the requested files
        if (mode.equals(ARGUMENT_MODE_SELECTED)) {
            String[] entries = JSONArrayToStringArray(parameters.optJSONArray(ARGUMENT_ARGS_ENTRIES));
            for (String entry : entries) {
                ZipEntry ze = zipFile.getEntry(entry);
                if (ze != null) {
                    list.add(entry);
                }
            } 
        }

        // extract all "structural" files
        if (mode.equals(ARGUMENT_MODE_ALL_STRUCTURE)) {
            String[] extensions = JSONArrayToStringArray(parameters.optJSONArray(ARGUMENT_ARGS_EXTENSIONS));
            Enumeration<? extends ZipEntry> zipFileEntries = zipFile.entries();
            while (zipFileEntries.hasMoreElements()) {
                String name     = zipFileEntries.nextElement().getName();
                String lower    = name.toLowerCase();
                boolean extract = isFile(lower, extensions);
                if (extract) {
                    list.add(name);
                }
            }
        }

        // NOTE list contains only valid zip entries
        // perform unzip
        for (String currentEntry : list) {
            ZipEntry entry = zipFile.getEntry(currentEntry);
            File destFile = new File(unzipDestinationDirectory, currentEntry);
            
            File destinationParent = destFile.getParentFile();
            destinationParent.mkdirs();

            if (!entry.isDirectory()) {
                BufferedInputStream is = new BufferedInputStream(zipFile.getInputStream(entry));
                int numberOfBytesRead;
                byte data[] = new byte[BUFFER_SIZE];
                FileOutputStream fos = new FileOutputStream(destFile);
                BufferedOutputStream dest = new BufferedOutputStream(fos, BUFFER_SIZE);
                while ((numberOfBytesRead = is.read(data, 0, BUFFER_SIZE)) > -1) {
                    dest.write(data, 0, numberOfBytesRead);
                }
                dest.flush();
                dest.close();
                is.close();
                fos.close();
                decompressed.add(currentEntry);
            }
        }

        zipFile.close();
        return stringify(decompressed);
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

    private String stringify(List<String> entries) {
        JSONObject obj   = new JSONObject();
        try {
            JSONObject files = new JSONObject();
            JSONArray  items = new JSONArray();
            for (String s : entries) {
                items.put(s);
            }
            files.put("items", items);
            obj.put("files", files);
        } catch (Exception e) {
            // nop
        }
        return obj.toString();
    }

    private boolean isFile(String lower, String[] array) {
        for (String ext : array) {
            if (lower.endsWith(ext)) {
                return true;
            }
        }
        return false;
    };
}
