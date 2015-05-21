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

import java.util.ArrayList;
import java.util.List;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

public class Publication implements JSONPrintable {
   
    String            id                          = "";                       // publication id, generated hashing file/dir path
    String            absolutePath                = "";                       // path to publication, absolute
    String            relativePath                = "";                       // path to publication, relative to app library dir
    String            absolutePathThumbnail       = "";                       // path to generated thumbnail, absolute
    String            relativePathThumbnail       = "";                       // path to generated thumbnail, relative to thumbnalis dir
    String            title                       = "";                       // title of the publication
    String            mainFormat                  = "";                       // main format of the publication
    ArrayList<Format> formats                     = new ArrayList<Format>();  // array of formats
    long              size                        = 0;                        // size of the publication, in bytes
    boolean           isSingleFile                = true;                     // true iff the publication is contained in a single file
    boolean           isValid                     = false;                    // true iff the publication seems well-formed, must be set explicitly to true

    public void setID(String id) {
        this.id = id;
    }
    public String getID() {
        return this.id;
    }
   
    public void setAbsolutePath(String absolutePath) {
        this.absolutePath = absolutePath;
    }
    public String getAbsolutePath() {
        return this.absolutePath;
    }

    public void setRelativePath(String relativePath) {
        this.relativePath = relativePath;
    }
    public String getRelativePath() {
        return this.relativePath;
    }

    public void setAbsolutePathThumbnail(String absolutePathThumbnail) {
        this.absolutePathThumbnail = absolutePathThumbnail;
    }
    public String getAbsolutePathThumbnail() {
        return this.absolutePathThumbnail;
    }

    public void setRelativePathThumbnail(String relativePathThumbnail) {
        this.relativePathThumbnail = relativePathThumbnail;
    }
    public String getRelativePathThumbnail() {
        return this.relativePathThumbnail;
    }

    public void setMainFormat(String mainFormat) {
        this.mainFormat = mainFormat;
    }
    public String getMainFormat() {
        return this.mainFormat;
    }

    public void addFormat(Format f) {
        this.formats.add(f);
    }
    public List<Format> getFormats() {
        return this.formats;
    }

    public void setTitle(String title) {
        this.title = title;
    }
    public String getTitle() {
        return this.title;
    }
    
    public void setSize(long size) {
        this.size = size;
    }
    public long getSize() {
        return this.size;
    }
    
    public void isSingleFile(boolean isSingleFile) {
        this.isSingleFile = isSingleFile;
    }
    public boolean isSingleFile() {
        return this.isSingleFile;   
    }

    public void isValid(boolean isValid) {
        this.isValid = isValid;
    }
    public boolean isValid() {
        return this.isValid;   
    }

    public JSONObject toJSONObject() {
        JSONObject obj = new JSONObject();
        try {
            obj.put("id",                          this.id);
            obj.put("absolutePath",                this.absolutePath);
            obj.put("relativePath",                this.relativePath);
            obj.put("absolutePathThumbnail",       this.absolutePathThumbnail);
            obj.put("relativePathThumbnail",       this.relativePathThumbnail);
            obj.put("mainFormat",                  this.mainFormat);
            
            JSONObject formats = new JSONObject();
            for (Format f : this.formats) {
                formats.put(f.getName(), f.toJSONObject()); 
            }
            obj.put("formats",                     formats);
            
            obj.put("title",                       this.title);
            obj.put("size",                        this.size);
            obj.put("isSingleFile",                this.isSingleFile);
            obj.put("isValid",                     this.isValid);
        } catch (Exception e) {
            // nop
        }
        return obj;
    }
}
