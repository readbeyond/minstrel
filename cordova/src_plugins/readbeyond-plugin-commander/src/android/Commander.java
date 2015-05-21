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

package it.readbeyond.minstrel.commander;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaPlugin;
import org.json.JSONObject;
import org.json.JSONArray;
import org.json.JSONException;

import android.app.Activity;
import android.content.pm.ActivityInfo;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.net.Uri;
import android.os.Environment;
import android.util.Log;
import android.view.View;
import android.view.WindowManager.LayoutParams;
import android.view.WindowManager;
import android.widget.Toast;

import java.io.File;
import java.io.BufferedInputStream;
import java.io.BufferedOutputStream;
import java.io.InputStream;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.nio.channels.FileChannel;
import java.io.FileWriter;
import java.io.IOException;

import java.util.ArrayList;
import java.util.List;

public class Commander extends CordovaPlugin {
    
    // plugin action
    public static final String ACTION_COMMANDER              = "commander";
   
    // argument names
    public static final String ARGUMENT_COMMAND              = "command";
    public static final String ARGUMENT_OPTION               = "option";

    // command values
    public static final String COMMAND_TOAST                 = "toast";
    public static final String COMMAND_DIM                   = "dim";
    public static final String COMMAND_SET_BRIGHTNESS        = "setbrightness";
    public static final String COMMAND_GET_BRIGHTNESS        = "getbrightness";
    public static final String COMMAND_ORIENT                = "orient";
    public static final String COMMAND_OPEN_EXTERNAL_URL     = "openExternalURL";
    public static final String COMMAND_FILESYSTEM_INFO       = "filesystemInfo";
    public static final String COMMAND_CHECK_FILE_EXISTS     = "checkFileExists";
    public static final String COMMAND_DELETE_RELATIVE       = "deleteRelative";
    public static final String COMMAND_DELETE_ABSOLUTE       = "deleteAbsolute";
    public static final String COMMAND_WRITE_TO_FILE         = "writeToFile";
    public static final String COMMAND_COPY                  = "copy";
    public static final String COMMAND_MOVE                  = "move";
    //public static final String COMMAND_LIST_DIRECTORY        = "listDirectory";
    public static final String COMMAND_LIST_SUBDIRECTORIES   = "listSubdirectories";
    public static final String COMMAND_COPY_FROM_ASSETS_WWW  = "copyFromAssetsWWW";
    //public static final String COMMAND_GET_STORAGE_ROOTS     = "getStorageRoots";
    //public static final String COMMAND_CREATE_DIRECTORY      = "createDirectory";
   
    // orient options 
    public static final String ORIENT_OPTION_AUTO            = "auto";
    public static final String ORIENT_OPTION_LANDSCAPE       = "landscape";
    public static final String ORIENT_OPTION_PORTRAIT        = "portrait";

    // return messages
    public static final String MESSAGE_REFRESH               = "refresh";
    public static final String MESSAGE_NO_REFRESH            = "norefresh";
    public static final String MESSAGE_FILE_EXISTS           = "fileexists";
    public static final String MESSAGE_FILE_DOES_NOT_EXIST   = "filedoesnotexist";
    public static final String MESSAGE_FILE_WRITTEN          = "filewritten";
    public static final String MESSAGE_FILE_NOT_WRITTEN      = "filenotwritten";
    public static final String MESSAGE_FILE_COPIED           = "filecopied";
    public static final String MESSAGE_FILE_MOVED            = "filemoved";
    public static final String MESSAGE_DIRECTORY_CREATED     = "directorycreated";
    public static final String MESSAGE_DIRECTORY_NOT_CREATED = "directorynotcreated";
    public static final String MESSAGE_ERROR_WHILE_COPYING   = "errorwhilecopying";

    @Override
    public boolean execute(String action, final JSONArray args, final CallbackContext callbackContext) throws JSONException {
        if (ACTION_COMMANDER.equals(action)) {
            
            cordova.getThreadPool().execute(new Runnable() {
                public void run() {
                    
                    try {
                        
                        JSONObject argsJSONObject = args.getJSONObject(0);
                        String     commandName    = argsJSONObject.getString(ARGUMENT_COMMAND);
                        JSONObject parameters     = new JSONObject(argsJSONObject.getString(ARGUMENT_OPTION));

                        // show toast
                        if (commandName.equals(COMMAND_TOAST)) {
                            toast(parameters.optString("message", ""), callbackContext);
                        }
                        
                        // dim/undim home/back/settings bar
                        if (commandName.equals(COMMAND_DIM)) {
                            dim(parameters.optBoolean("dim", false), callbackContext);
                        }
                        
                        // set screen brightness
                        if (commandName.equals(COMMAND_SET_BRIGHTNESS)) {
                            setBrightness(parameters.optString("value", "1.0"), callbackContext);
                        }

                        // get screen brightness
                        if (commandName.equals(COMMAND_GET_BRIGHTNESS)) {
                            getBrightness(callbackContext);
                        }

                        // set screen orientation
                        if (commandName.equals(COMMAND_ORIENT)) {
                            orient(parameters.optString("value", ORIENT_OPTION_AUTO), callbackContext);
                        }

                        // open external URL
                        if (commandName.equals(COMMAND_OPEN_EXTERNAL_URL)) {
                            openExternalURL(parameters.optString("url", "http://www.readbeyond.it/"), callbackContext);
                        }
                        
                        // get filesystem info
                        if (commandName.equals(COMMAND_FILESYSTEM_INFO)) {
                            callbackContext.success(getFilesystemInfoJSONString());
                        }
                        
                        // check whether the given file exists
                        if (commandName.equals(COMMAND_CHECK_FILE_EXISTS)) {
                            if (doesFileExist(parameters.optString("path", null))) {
                                callbackContext.success(MESSAGE_FILE_EXISTS);
                            }
                            callbackContext.success(MESSAGE_FILE_DOES_NOT_EXIST);
                        }
                        
                        // delete file or directory, where option is the path relative to external storage 
                        if (commandName.equals(COMMAND_DELETE_RELATIVE)) {
                            delete(new File(Environment.getExternalStorageDirectory(), parameters.optString("path", null)), callbackContext);
                        }
                        
                        // delete file or directory, where option is the absolute path in the file system
                        if (commandName.equals(COMMAND_DELETE_ABSOLUTE)) {
                            delete(new File(parameters.optString("path", null)), callbackContext);
                        }

                        // copy file option into option2
                        if (commandName.equals(COMMAND_COPY)) {
                            copyFile(parameters.optString("source", null), parameters.optString("destination", null), callbackContext);
                        }

                        // copy file option from assets/www/ into option2
                        if (commandName.equals(COMMAND_COPY_FROM_ASSETS_WWW)) {
                            copyFileFromAssetsWWW(parameters.optString("source", null), parameters.optString("destination", null), callbackContext);
                        }

                        // move file option into option2
                        if (commandName.equals(COMMAND_MOVE)) {
                            moveFile(parameters.optString("source", null), parameters.optString("destination", null), callbackContext);
                        }

                        // write string option2 to file option
                        if (commandName.equals(COMMAND_WRITE_TO_FILE)) {
                            callbackContext.success(writeStringToFile(parameters.optString("destination", null), parameters.optString("string", null)));
                        }

                        // list the subdirectories of the directory option, ignoring hidden subdirectories if option2 is true
                        if (commandName.equals(COMMAND_LIST_SUBDIRECTORIES)) {
                            callbackContext.success(getDirectoryListingJSONString(parameters.optString("path", null), parameters.optBoolean("recursive", false), parameters.optBoolean("ignoreHidden", true), true));
                        }

                        // call success 
                        callbackContext.success("");
                    
                    } catch (Exception e) {
                    
                        // call error
                        callbackContext.error("Exception " + e);
                    
                    } 
                }
            });
            return true;
        }
        callbackContext.error("Invalid action");
        return false;
    }

    private void copyFileFromAssetsWWW(String sourcePath, String destinationPath, final CallbackContext callbackContext) {
        String source      = "www" + File.separator + sourcePath;
        String destination = this.normalizePath(destinationPath);
        try {
            File d         = new File(destination);
            
            // create parent directory, if not existing
            File destinationParent = d.getParentFile();
            destinationParent.mkdirs();
                
            // TODO check for write permission?
            // copy in chunks of 4 KB
            final int BUFFER = 4096;
            BufferedInputStream is = new BufferedInputStream(cordova.getActivity().getApplicationContext().getAssets().open(source));
            int numberOfBytesRead;
            byte data[] = new byte[BUFFER];
            FileOutputStream fos = new FileOutputStream(d);
            BufferedOutputStream dest = new BufferedOutputStream(fos, BUFFER);
            while ((numberOfBytesRead = is.read(data, 0, BUFFER)) > -1) {
                dest.write(data, 0, numberOfBytesRead);
            }
            dest.flush();
            dest.close();
            is.close();
            fos.close();
            callbackContext.success(MESSAGE_FILE_COPIED);

        } catch (Exception e) {
            callbackContext.success(MESSAGE_ERROR_WHILE_COPYING);
        }
    }

    private void copyFile(String sourcePath, String destinationPath, final CallbackContext callbackContext) {
        String source      = this.normalizePath(sourcePath);
        String destination = this.normalizePath(destinationPath);
        try {
            File f = new File(source);
            if (f.exists()) {
                File d = new File(destination);
                
                // create parent directory, if not existing
                File destinationParent = d.getParentFile();
                destinationParent.mkdirs();
                    
                // TODO check for write permission?
                // copy file
                FileInputStream  inStream   = new FileInputStream(f);
                FileOutputStream outStream  = new FileOutputStream(d);
                FileChannel      inChannel  = inStream.getChannel();
                FileChannel      outChannel = outStream.getChannel();
                inChannel.transferTo(0, inChannel.size(), outChannel);
                inStream.close();
                outStream.close();
                callbackContext.success(MESSAGE_FILE_COPIED);

            } else {
                callbackContext.success(MESSAGE_FILE_DOES_NOT_EXIST);
            }
        } catch (Exception e) {
            callbackContext.success(MESSAGE_ERROR_WHILE_COPYING);
        }
    }

    private void moveFile(String sourcePath, String destinationPath, final CallbackContext callbackContext) {
        String source      = this.normalizePath(sourcePath);
        String destination = this.normalizePath(destinationPath);
        try {
            File f = new File(source);
            if (f.exists()) {
                File d = new File(destination);
                
                // create parent directory, if not existing
                File destinationParent = d.getParentFile();
                destinationParent.mkdirs();

                // TODO check for write permission?
                // move file
                f.renameTo(d);
                callbackContext.success(MESSAGE_FILE_MOVED);

            } else {
                callbackContext.success(MESSAGE_FILE_DOES_NOT_EXIST);
            }
        } catch (Exception e) {
            callbackContext.success(MESSAGE_ERROR_WHILE_COPYING);
        }
    }

    private String[] getStoragePaths() {
        String[] storagePaths = Storage.getStoragePaths();
        if ((storagePaths == null) || (storagePaths.length < 1)) {
            storagePaths    = new String[1];
            storagePaths[0] = Environment.getExternalStorageDirectory().getAbsolutePath();
        }
        return storagePaths;
    }

    private JSONArray getStorageRootsJSONArray() {
        String[] storagePaths = this.getStoragePaths();
        JSONArray arr = new JSONArray();
        for (String s : storagePaths) {
            arr.put(s);
        }
        return arr;
    }

    private String getFilesystemInfoJSONString() throws JSONException {
        JSONObject obj = new JSONObject();
        obj.put("root", Environment.getExternalStorageDirectory().getAbsolutePath());
        obj.put("separator", File.separator);
        obj.put("documentsDir", ""); // TODO
        obj.put("cacheDir", ""); // TODO
        obj.put("storageRoots", this.getStorageRootsJSONArray());
        return obj.toString();
    }

    private boolean doesFileExist(String path) {
        try {
            File f = new File(this.normalizePath(path));
            if (f.exists()) {
                return true;
            }
        } catch (Exception e) {
            // nop
        }
        return false;
    }

    private String writeStringToFile(String path, String contents) {
        try {
            // TODO check for write permission?
            File f = new File(this.normalizePath(path));
            FileWriter out = new FileWriter(f);
            out.write(contents);
            out.flush();
            out.close();
            return MESSAGE_FILE_WRITTEN;
        } catch (Exception e) {
            // nop
        }
        return MESSAGE_FILE_NOT_WRITTEN;
    }

    private String getDirectoryListingJSONString(String path, boolean recursive, boolean ignoreHidden, boolean directoriesOnly) throws JSONException {
        JSONObject obj = new JSONObject();
        if ((path == null) || (path.equals(""))) {
            List<StorageInfo> storagePathsInfo = Storage.getStoragePathsInfo();
            for (int i = 0; i < storagePathsInfo.size(); i++) {
                StorageInfo si = storagePathsInfo.get(i);
                JSONObject sp  = new JSONObject();
                sp.put("internal",       !si.removable);
                sp.put("subdirectories", this.getDirectoryListingJSONArray(si.path, recursive, ignoreHidden, directoriesOnly));
                obj.put(si.path, sp);
            }
        } else {
            JSONObject sp = new JSONObject();
            sp.put("internal",       true); // dummy
            sp.put("subdirectories", this.getDirectoryListingJSONArray(path, recursive, ignoreHidden, directoriesOnly));
            obj.put(path, sp);
        }
        return obj.toString();
    }

    private JSONArray getDirectoryListingJSONArray(String path, boolean recursive, boolean ignoreHidden, boolean directoriesOnly) throws JSONException {
        List<String> acc = new ArrayList<String>();
        try {
            listRecursively(new File(this.normalizePath(path)), recursive, ignoreHidden, directoriesOnly, acc);
        } catch (Exception e) {
            // nothing
        }
        JSONArray arr = new JSONArray();
        for (String s : acc) {
            arr.put(s);
        }
        return arr;
    }

    private void listRecursively(File path, boolean recursive, boolean ignoreHidden, boolean directoriesOnly, List<String> acc) {
        File[] files = path.listFiles();
        for (File f : files) {
            if ((f.canRead()) && (! f.isHidden())) {
                String n = f.getName();
                if (!((n.startsWith(".")) && (ignoreHidden))) {
                    if (f.isDirectory()) {
                        if (directoriesOnly) {
                            acc.add(f.getAbsolutePath());
                        }
                        if (recursive) {
                            listRecursively(f, recursive, ignoreHidden, directoriesOnly, acc);
                        }
                    } else {
                        if (!directoriesOnly) {
                            acc.add(f.getAbsolutePath());
                        }
                    }
                }
            }
        }
    }

    // normalize path
    private String normalizePath(String path) {
        return this.normalizePath(path, Environment.getExternalStorageDirectory().getAbsolutePath());
    }
    private String normalizePath(String path, String base) {
        if ((path.length() > 0) && (path.startsWith(File.separator))) {
            // path is an absolute path, like /sdcard0/minstrel/foo => return it
            return path;
        } else if ((path.length() > 7) && (path.startsWith("file://"))) {
            // path is a prefixed path, like file:///sdcard0/minstrel/foo => strip file://
            return path.substring(7);
        } else {
            // path is relative => returns base/path
            return base + File.separator + path;
        }
    }

    // escape double quotes
    private String escape(String unescaped) {
        if (unescaped == null) {
            return "";
        }
        return unescaped.replace("\"","\\\"");
    }

    // delete
    private void delete(File f, final CallbackContext callbackContext) {
        try {
            deleteRecursively(f);
            callbackContext.success("");
        } catch (Exception e) {
            // nop
            callbackContext.error("Exception " + e);
        }
    }

    // delete recursively
    private void deleteRecursively(File f) {
        if (f.isDirectory()) {
            for (File child : f.listFiles()) {
                deleteRecursively(child);
            }
        }
        f.delete();
    }

    private void toast(final String msg, final CallbackContext callbackContext) {
        cordova.getActivity().runOnUiThread(new Runnable() {
            public void run() {
                Toast toast = Toast.makeText(cordova.getActivity().getApplicationContext(), msg, Toast.LENGTH_LONG);
                toast.show();
                callbackContext.success("");
            }
        });
    }

    private void dim(final boolean dim, final CallbackContext callbackContext) {
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.ICE_CREAM_SANDWICH) {
            cordova.getActivity().runOnUiThread(new Runnable() {
                public void run() {
                    try {
                        // getRootView is really necessary here!!! 
                        View rootView = cordova.getActivity().getWindow().getDecorView().getRootView();
                        if (rootView != null) {
                            if (dim) {
                                rootView.setSystemUiVisibility(View.SYSTEM_UI_FLAG_LOW_PROFILE);
                            } else {
                                rootView.setSystemUiVisibility(View.SYSTEM_UI_FLAG_VISIBLE);
                            }
                        }
                        callbackContext.success("");
                    }  catch (Exception e) {
                        callbackContext.error("Exception " + e);
                    }
                }
            });
        }
    }

    private void setBrightness(final String option, final CallbackContext callbackContext) {
        final float brightness  = (float)Double.parseDouble(option);
        final int   ibrightness = (int)(brightness * 255);
        try {
            cordova.getActivity().runOnUiThread(new Runnable() {
                public void run() {
                    //
                    // this changes the system brightness
                    //
                    // android.provider.Settings.System.putInt(cordova.getActivity().getApplicationContext().getContentResolver(), android.provider.Settings.System.SCREEN_BRIGHTNESS_MODE, android.provider.Settings.System.SCREEN_BRIGHTNESS_MODE_MANUAL);
                    // android.provider.Settings.System.putInt(cordova.getActivity().getApplicationContext().getContentResolver(), android.provider.Settings.System.SCREEN_BRIGHTNESS, ibrightness);     
                    //
                    
                    //
                    // this changes the brightness only for the app
                    //
                    WindowManager.LayoutParams layoutParams = cordova.getActivity().getWindow().getAttributes();
                    layoutParams.screenBrightness = brightness;
                    cordova.getActivity().getWindow().setAttributes(layoutParams);
                    callbackContext.success("");
                }
            });
        } catch (Exception e) {
            // nop
            callbackContext.error("Exception " + e);
        }
    }

    private void getBrightness(final CallbackContext callbackContext) {
        try {
            //cordova.getActivity().runOnUiThread(new Runnable() {
            //    public void run() {
                    WindowManager.LayoutParams layoutParams = cordova.getActivity().getWindow().getAttributes();
                    callbackContext.success("" + layoutParams.screenBrightness); 
            //    }
            //});
        } catch (Exception e) {
            // nop
            callbackContext.error("Exception " + e);
        }
    }

    private void orient(final String option, final CallbackContext callbackContext) {
        try {
            Activity activity = cordova.getActivity();
            if (option.equals(ORIENT_OPTION_PORTRAIT)) {
                // portrait or reverse portrait
                activity.setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_SENSOR_PORTRAIT);
            } else if (option.equals(ORIENT_OPTION_LANDSCAPE)) {
                // landscape or reverse portrait
                activity.setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_SENSOR_LANDSCAPE);
            } else if (option.equals(ORIENT_OPTION_AUTO)) {
                // unlock orientation
                activity.setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_UNSPECIFIED);
            } else {
                // default: unlock orientation
                activity.setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_UNSPECIFIED);
            }
            callbackContext.success("");
        } catch (Exception e) {
            // nop
            callbackContext.error("Exception " + e); 
        }
    }

    private void openExternalURL(final String url, final CallbackContext callbackContext) {
        try {
            Intent intent = null;
            intent = new Intent(Intent.ACTION_VIEW);
            Uri uri = Uri.parse(url);
            /*
            if ("file".equals(uri.getScheme())) {
                intent.setDataAndType(uri, webView.getResourceApi().getMimeType(uri));
            } else {
                intent.setData(uri);
            }
            */
            intent.setData(uri);
            cordova.getActivity().startActivity(intent);
            callbackContext.success("");
        } catch (Exception e) {
            // nop
            callbackContext.error("Exception " + e);
        }
    }
}
