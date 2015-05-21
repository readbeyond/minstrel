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

public class Format implements JSONPrintable {
   
    String name                      = "";                              // name
    String version                   = "";                              // version
    HashMap<String, String> metadata = new HashMap<String, String>();   // metadata

    public Format(String name, String version) {
        this.name    = name;
        this.version = version;
    }
    public Format(String name) {
        this(name, "");
    }

    public String getName() {
        return this.name;
    }
    public String getVersion() {
        return this.version;
    }

    public void setMetadata(HashMap<String, String> metadata) {
        this.metadata = metadata;
    }
    public HashMap<String, String> getMetadata() {
        return this.metadata;
    }
    public void addMetadatum(String name, String value) {
        this.metadata.put(name, value);
    }
    public String getMetadatum(String name) {
        return this.metadata.get(name);
    }

    public boolean equals(String otherName) {
        return this.name.equals(otherName);
    }
    public boolean equals(String otherName, String otherVersion) {
        return this.name.equals(otherName) && this.version.equals(otherVersion);
    }

    public JSONObject toJSONObject() {
        JSONObject obj =        new JSONObject();
        try {
            obj.put("name",     this.name);
            obj.put("version",  this.version);
            JSONObject meta =   new JSONObject();
            for (Entry<String, String> e : this.metadata.entrySet()) {
                meta.put(e.getKey(), e.getValue());
            }
            obj.put("metadata", meta);
        } catch (Exception e) {
            // nop
        }
        return obj;
    }
}
