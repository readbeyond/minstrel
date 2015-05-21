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

package it.readbeyond.minstrel;

import android.os.Bundle;
import org.apache.cordova.*;

// prevent the screen from sleeping
import android.view.WindowManager;
import android.view.Window;

// capture intents
import android.app.DownloadManager;
import android.content.BroadcastReceiver;
import android.content.ContentUris;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.pm.PackageManager;
import android.content.pm.ResolveInfo;
import android.database.Cursor;
import android.net.Uri;
import android.os.Build;
import android.os.Environment;
import android.provider.DocumentsContract;
import android.text.format.Time;
import android.widget.Toast;
import java.io.BufferedInputStream;
import java.io.BufferedOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.FileWriter;
import java.io.IOException;
import java.io.InputStream;
import java.util.List;

public class MainActivity extends CordovaActivity
{
    // the app directory (e.g., "minstrel", no "/" !)
    private static final String APP_DIRECTORY                        = "minstrel";

    // the name of the empty file signalling a refresh is needed
    private static final String REFRESH_DOWNLOADED                   = "downloaded"; 
    private static final String REFRESH_DOWNLOADING                  = "downloading"; 
    private static final String REFRESH_OPEN                         = "open"; 
    private static final String REFRESH_PLACEHOLDER                  = "refresh.me"; 
   
    // copy in chunks of 4 KB
    private static final int BUFFER                                  = 4096;

    // file mimetypes
    private static final String MIMETYPE_APPLICATION_ABZ             = "application/x-abz";
    private static final String MIMETYPE_APPLICATION_CBZ             = "application/x-cbz";
    private static final String MIMETYPE_APPLICATION_CSS             = "text/css";
    private static final String MIMETYPE_APPLICATION_EPUB            = "application/epub+zip";
    private static final String MIMETYPE_APPLICATION_OCTET_STREAM    = "application/octet-stream";
    private static final String MIMETYPE_APPLICATION_PDF             = "application/pdf";
    private static final String MIMETYPE_APPLICATION_ZIP             = "application/zip";

    // uri schemes
    private static final String SCHEME_CONTENT                       = "content://";
    private static final String SCHEME_FILE                          = "file://";
    private static final String SCHEME_HTTP                          = "http://";
    private static final String SCHEME_HTTPS                         = "https://";

    // download manager
    private DownloadManager downloadManager                          = null;
    private String          lastDownloadDestination                  = null;

    // download complete receiver
    BroadcastReceiver onDownloadComplete = new BroadcastReceiver() {
        public void onReceive(Context ctxt, Intent intent) {
            if (lastDownloadDestination != null) {
                //showToast("download of " + lastDownloadDestination + " completed!");
                String id = Integer.toHexString(lastDownloadDestination.hashCode());
                createRefreshMeFile(REFRESH_DOWNLOADED + "\n" + lastDownloadDestination + "\n" + id);
                lastDownloadDestination = null;
            }
        }
    };

    @Override
    public void onCreate(Bundle savedInstanceState)
    {
        super.onCreate(savedInstanceState);
      
        // create download manager 
        downloadManager = (DownloadManager)getSystemService(Context.DOWNLOAD_SERVICE);
        registerReceiver(onDownloadComplete, new IntentFilter(DownloadManager.ACTION_DOWNLOAD_COMPLETE));

        // prevent the screen from sleeping
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
     
        // process initial intent
        processIntent(getIntent());

        // set by <content src="index.html" /> in config.xml
        loadUrl(launchUrl);
    }

    // process intent arrived when the app was already opened
    @Override
    protected void onNewIntent(Intent intent) 
    {
        super.onNewIntent(intent);
        processIntent(intent);
    }

    @Override
    public void onDestroy() {
        unregisterReceiver(onDownloadComplete);
        super.onDestroy();
    }

    /**
     * @return the current date/time as a RFC 2445 string (i.e., "YYYYmmDDTHHMMSS")
     */
    private static String stringFromTime() {
        Time now = new Time();
        now.setToNow();
        return now.format2445();
    }

    // show toast for debug purposes
    private void showToast(String msg) {
        Toast toast = Toast.makeText(getApplicationContext(), msg, Toast.LENGTH_LONG);
        toast.show();
    }

    /**
     * @param mimetype mimetype string
     * @return true if the mimetype is supported
     */
    private static boolean supportedMimetype(String mimetype) {
        if (mimetype == null) {
            return false;
        }
        return (MIMETYPE_APPLICATION_EPUB.equals(mimetype)) ||
                (MIMETYPE_APPLICATION_OCTET_STREAM.equals(mimetype)) ||
                (MIMETYPE_APPLICATION_ABZ.equals(mimetype)) ||
                (MIMETYPE_APPLICATION_CBZ.equals(mimetype)) ||
                (MIMETYPE_APPLICATION_CSS.equals(mimetype)) ||
                (MIMETYPE_APPLICATION_PDF.equals(mimetype)) ||
                (MIMETYPE_APPLICATION_ZIP.equals(mimetype));
    }

    //
    // Code to initiate file downloads and open intents
    // adapted from
    // http://stackoverflow.com/questions/3028306/download-a-file-with-android-and-showing-the-progress-in-a-progressdialog
    // TODO create an ad hoc plugin for managing this
    //

    /**
     * @param context used to check the device version and DownloadManager information
     * @return true if the download manager is available
     */
    private static boolean isDownloadManagerAvailable(Context context) {
        try {
            if (Build.VERSION.SDK_INT < Build.VERSION_CODES.GINGERBREAD) {
                return false;
            }
            Intent intent = new Intent(Intent.ACTION_MAIN);
            intent.addCategory(Intent.CATEGORY_LAUNCHER);
            intent.setClassName("com.android.providers.downloads.ui", "com.android.providers.downloads.ui.DownloadList");
            List<ResolveInfo> list = context.getPackageManager().queryIntentActivities(intent, PackageManager.MATCH_DEFAULT_ONLY);
            return (list.size() > 0);
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * @param originalName the original file name (no full path)
     * @param overwrite if true, overwrite existing file (if any), otherwise change destination name 
     * @return a File object, corresponding to a file path inside /storage/APP_DIRECTORY/ directory that can be safely written
     */
    private static File getDestinationFile(String originalName, boolean overwrite) {
        // make sure APP_DIRECTORY exists 
        File destinationDirectory = new File(Environment.getExternalStorageDirectory(), APP_DIRECTORY);
        if (!destinationDirectory.exists()) {
            destinationDirectory.mkdirs();
        }
    
        // create the File object to be returned    
        File destinationFile = new File(destinationDirectory, originalName);
        while ((destinationFile.exists()) && (!overwrite)) {
            // if the another file with the same name exists,
            // create a different destination file name
            destinationFile = new File(destinationDirectory, stringFromTime() + "-" + originalName);
        }

        // return the File object
        return destinationFile;
    }

    // create refresh.me file
    private static void createRefreshMeFile(String content) {
        try {
            File refreshMe = getDestinationFile(REFRESH_PLACEHOLDER, true);
            //refreshMe.createNewFile();
            FileWriter out = new FileWriter(refreshMe);
            out.write(content);
            out.flush();
            out.close();
        } catch (Exception e) {
            // do nothing
        }
    }

    // process intent
    private void processIntent(Intent intent) {
        if (intent != null) {
            try {
                String mimetype = intent.getType();
                Uri uri         = intent.getData();
                
                //showToast("here 0 " + mimetype + " => " + uri);

                if (uri != null) {
                    String u = "" + uri;

                    if ((u.startsWith(SCHEME_HTTP)) || (u.startsWith(SCHEME_HTTPS))) {
                        if (isDownloadManagerAvailable(getApplicationContext())) {
                            String destFilename  = uri.getLastPathSegment();
                            //showToast("Name: " + destFilename);
                            if (destFilename != null) {
                                File destinationFile = getDestinationFile(destFilename, false);
                                //showToast("Destination: " + destFilename);
                                DownloadManager.Request request = new DownloadManager.Request(uri);
                                //request.setDescription("");
                                //request.setTitle("");
                                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.HONEYCOMB) {
                                    //request.allowScanningByMediaScanner();
                                    request.setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE);
                                    //request.setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED);
                                }
                                request.setDestinationUri(Uri.fromFile(destinationFile));
                                lastDownloadDestination = destinationFile.getAbsolutePath();
                                String id = Integer.toHexString(lastDownloadDestination.hashCode());
                                createRefreshMeFile(REFRESH_DOWNLOADING + "\n" + lastDownloadDestination + "\n" + id);
                                downloadManager.enqueue(request);
                            }
                        }
                    } // END of http:// or https://

                    if ((u.startsWith(SCHEME_FILE)) || (u.startsWith(SCHEME_CONTENT))) {
                        //if ((mimetype != null) && (supportedMimetype(mimetype))) {
                        //
                            //showToast("here 1 " + u);
                            
                            File f = new File(getPath(getApplicationContext(), uri));
                            
                            //showToast("here 2 " + f);
                            
                            if (f.exists()) {
                                String originalFilePath = f.getAbsolutePath();
                                String id = Integer.toHexString(originalFilePath.hashCode());
                                createRefreshMeFile(REFRESH_OPEN + "\n" + originalFilePath + "\n" + id);
                            } // END if f.exists
                      //  
                      //} END if mimetype 
                      //
                    } // END of file:// or content://
                } // end if uri != null
            } catch (Exception e) {
                // do nothing
            }
        }
    }

    //
    //
    //
    // Code to resolve a Uri into a filesystem path
    // adapted from
    // http://stackoverflow.com/questions/20067508/get-real-path-from-uri-android-kitkat-new-storage-access-framework
    //
    //
    //

    /**
     * Get a file path from a Uri. This will get the the path for Storage Access
     * Framework Documents, as well as the _data field for the MediaStore and
     * other file-based ContentProviders.
     *
     * @param context The context.
     * @param uri The Uri to query.
     * @author paulburke
     */
    private static String getPath(final Context context, final Uri uri) {

        final boolean isKitKat = Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT;

        // DocumentProvider
        if (isKitKat && DocumentsContract.isDocumentUri(context, uri)) {
            // ExternalStorageProvider
            if (isExternalStorageDocument(uri)) {
                final String docId = DocumentsContract.getDocumentId(uri);
                final String[] split = docId.split(":");
                final String type = split[0];

                if ("primary".equalsIgnoreCase(type)) {
                    return Environment.getExternalStorageDirectory() + "/" + split[1];
                }

                // TODO handle non-primary volumes
            }
            // DownloadsProvider
            else if (isDownloadsDocument(uri)) {

                final String id = DocumentsContract.getDocumentId(uri);
                final Uri contentUri = ContentUris.withAppendedId(Uri.parse("content://downloads/public_downloads"), Long.valueOf(id));

                return getDataColumn(context, contentUri, null, null);
            }
            // MediaProvider
            else if (isMediaDocument(uri)) {
                final String docId = DocumentsContract.getDocumentId(uri);
                final String[] split = docId.split(":");
                final String type = split[0];

                Uri contentUri = null;
                if ("image".equals(type)) {
                    contentUri = android.provider.MediaStore.Images.Media.EXTERNAL_CONTENT_URI;
                } else if ("video".equals(type)) {
                    contentUri = android.provider.MediaStore.Video.Media.EXTERNAL_CONTENT_URI;
                } else if ("audio".equals(type)) {
                    contentUri = android.provider.MediaStore.Audio.Media.EXTERNAL_CONTENT_URI;
                }

                final String selection = "_id=?";
                final String[] selectionArgs = new String[] {
                        split[1]
                };

                return getDataColumn(context, contentUri, selection, selectionArgs);
            }
        }
        // MediaStore (and general)
        else if ("content".equalsIgnoreCase(uri.getScheme())) {
            return getDataColumn(context, uri, null, null);
        }
        // File
        else if ("file".equalsIgnoreCase(uri.getScheme())) {
            return uri.getPath();
        }

        return null;
    }

    /**
     * Get the value of the data column for this Uri. This is useful for
     * MediaStore Uris, and other file-based ContentProviders.
     *
     * @param context The context.
     * @param uri The Uri to query.
     * @param selection (Optional) Filter used in the query.
     * @param selectionArgs (Optional) Selection arguments used in the query.
     * @return The value of the _data column, which is typically a file path.
     */
    private static String getDataColumn(android.content.Context context, Uri uri, String selection,
            String[] selectionArgs) {

        Cursor cursor = null;
        final String column = "_data";
        final String[] projection = {
                column
        };

        try {
            cursor = context.getContentResolver().query(uri, projection, selection, selectionArgs,
                    null);
            if (cursor != null && cursor.moveToFirst()) {
                final int column_index = cursor.getColumnIndexOrThrow(column);
                return cursor.getString(column_index);
            }
        } finally {
            if (cursor != null)
                cursor.close();
        }
        return null;
    }

    /**
     * @param uri The Uri to check.
     * @return Whether the Uri authority is ExternalStorageProvider.
     */
    private static boolean isExternalStorageDocument(Uri uri) {
        return "com.android.externalstorage.documents".equals(uri.getAuthority());
    }

    /**
     * @param uri The Uri to check.
     * @return Whether the Uri authority is DownloadsProvider.
     */
    private static boolean isDownloadsDocument(Uri uri) {
        return "com.android.providers.downloads.documents".equals(uri.getAuthority());
    }

    /**
     * @param uri The Uri to check.
     * @return Whether the Uri authority is MediaProvider.
     */
    private static boolean isMediaDocument(Uri uri) {
        return "com.android.providers.media.documents".equals(uri.getAuthority());
    }
}
