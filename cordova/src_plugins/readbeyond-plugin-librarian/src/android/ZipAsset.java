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

import java.util.HashMap;
import java.util.Map.Entry;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

public class ZipAsset implements Comparable<ZipAsset>, JSONPrintable {
   
    String path = ""; //
    HashMap<String, String> metadata = new HashMap<String, String>(); //

    public ZipAsset(String path, HashMap<String, String> metadata) {
        this.path = path;
        this.metadata = metadata;
    }

    public void setPath(String path) {
        this.path = path;
    }
    public String getPath() {
        return this.path;
    }
    public void setMetadata(HashMap<String, String> metadata) {
        this.metadata = metadata;
    }
    public HashMap<String, String> getMetadata() {
        return this.metadata;
    }

    public int compareTo(ZipAsset other) {
        return this.path.compareTo(other.getPath());
    }

    public JSONObject toJSONObject() {
        JSONObject obj  =   new JSONObject();
        try {
            obj.put("path",     this.path);
            obj.put("metadata", new JSONObject(this.metadata));
        } catch (Exception e) {
            // nop
        }
        return obj;
    }
}
