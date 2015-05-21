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

import java.io.BufferedReader;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.StringTokenizer;

import android.os.Environment;

public class Storage {

    // based on http://stackoverflow.com/questions/5694933/find-an-external-sd-card-location/19982451#19982451

    public static String[] getStoragePaths() {
    	List<StorageInfo> list = getStorageList();
    	String[] paths = {};
    	if (list.size() > 0) {
    		paths = new String[list.size()];
    		int i = 0;
    		for (StorageInfo l : list) {
                paths[i++] = l.path;
    		}
    	}
    	return paths;
    }

    public static String getStoragePathsString() {
    	List<StorageInfo> list = getStorageList();
		StringBuilder s = new StringBuilder();
    	for (StorageInfo l : list) {
            s.append(l.path + " RO: " + l.readonly + " REMOVABLE: " + l.removable + "\n");
		}
    	return s.toString();
    }

    public static List<StorageInfo> getStoragePathsInfo() {
        return getStorageList();
    }

    // TODO this is really bad
    //      but it seems there is no real silver bullet 
    private static List<StorageInfo> getStorageList() {
        List<StorageInfo> list      = new ArrayList<StorageInfo>();
        int removableCounter = 1;
        String  def_path            = Environment.getExternalStorageDirectory().getPath();
        boolean def_path_removable  = Environment.isExternalStorageRemovable();
        String  def_path_state      = Environment.getExternalStorageState();
        boolean def_path_available  = def_path_state.equals(Environment.MEDIA_MOUNTED) || def_path_state.equals(Environment.MEDIA_MOUNTED_READ_ONLY);
        boolean def_path_readonly   = Environment.getExternalStorageState().equals(Environment.MEDIA_MOUNTED_READ_ONLY);
        HashSet<String> paths = new HashSet<String>();
        if (def_path_available) {
            paths.add(def_path);
            if (def_path_removable) {
                list.add(0, new StorageInfo(def_path, def_path_readonly, def_path_removable, removableCounter++));
            } else {
                list.add(0, new StorageInfo(def_path, def_path_readonly, def_path_removable, -1));
            }
        }
        
        BufferedReader buf_reader = null;
        try {
            buf_reader = new BufferedReader(new FileReader("/proc/mounts"));
            String line;
            while ((line = buf_reader.readLine()) != null) {
               
                boolean whitelist = (line.contains("vfat")            ||
                                     line.contains("sdcardfs")        ||
                                     line.contains("ext4")            ||
                                     line.contains("/dev/block/vold") ||
                                     line.contains("/sd")             ||
                                     line.contains("/storage")        ||
                                     line.contains("/mnt"));
                
                boolean blacklist = (line.contains("/acct")       ||
                                     line.contains("/asec")       ||
                                     line.contains("/cache")      ||
                                     line.contains("/data")       ||
                                     line.contains("/fac")        ||
                                     line.contains("/firmware")   ||
                                     line.contains("/lesw")       ||
                                     line.contains("/legacy")     ||
                                     line.contains("/obb")        ||
                                     line.contains("/secure")     ||
                                     line.contains("/shell")      ||
                                     line.contains("/sys")        ||
                                     line.contains("/persist")    ||
                                     line.contains("/proc")       ||
                                     line.contains("debugfs")     ||
                                     line.contains("devpts")      ||
                                     line.contains("rootfs")      ||
                                     line.contains("selinuxfs")   ||
                                     line.contains("sysfs")       ||
                                     line.contains("tmpfs"));
                
                if ((whitelist) && (!blacklist)) {
                    StringTokenizer tokens = new StringTokenizer(line, " ");
                    String device          = tokens.nextToken(); //device
                    String mountPoint      = tokens.nextToken(); //mount point
                    if (paths.contains(mountPoint)) {
                        continue;
                    }
                    String fs              = tokens.nextToken(); //file system
                    List<String> flags     = Arrays.asList(tokens.nextToken().split(",")); //flags
                    boolean readonly       = flags.contains("ro");
                    try {
                        File test = new File(mountPoint);
                        if ((test.exists()) && (!test.isHidden()) && (test.canRead())) {
                            paths.add(mountPoint);
                            list.add(new StorageInfo(mountPoint, readonly, true, removableCounter++));
                        }
                    } catch (Exception e) {
                        // nop
                    }
                }
            }
        } catch (Exception e) {
            // nop
        } finally {
            if (buf_reader != null) {
                try {
                    buf_reader.close();
                } catch (Exception e) {
                    // nop 
                }
            }
        }
        return list;
    }
}
