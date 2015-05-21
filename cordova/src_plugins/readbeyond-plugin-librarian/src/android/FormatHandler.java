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
import org.json.JSONObject;

public interface FormatHandler { 
    // get the format name   
    public String getFormatName();
    
    // set thumbnail info 
    public void setThumbnailInfo(String thumbnailDirectoryPath, int thumbnailWidth, int thumbnailHeight);

    // determine whether the given file extension is supported by this FormatHandler
    public boolean isParsable(String lowercasedExtension);

    // add allowed (lowercased) extensions
    public void addAllowedLowercasedExtensions(String[] allowedLowercasedExtensions);

    // return the parsed Publication out of the given file
    public Publication parseFile(File file);

    // perform a custom action
    public String customAction(String path, JSONObject parameters);
}
