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

public class StorageInfo {

    // based on http://stackoverflow.com/questions/5694933/find-an-external-sd-card-location/19982451#19982451

    public String  path;
    public boolean readonly;
    public boolean removable;
    public int     number;

    StorageInfo(String path, boolean readonly, boolean removable, int number) {
        this.path       = path;
        this.readonly   = readonly;
        this.removable  = removable;
        this.number     = number;
    }

    public String toString() {
        StringBuilder res = new StringBuilder();
        if (!removable) {
            res.append("Internal memory");
        } else if (number > 0) {
            res.append("SD card " + number);
        } else {
            res.append("SD card");
        }
        if (readonly) {
            res.append(" (RO)");
        }
        return res.toString();
    }
}
