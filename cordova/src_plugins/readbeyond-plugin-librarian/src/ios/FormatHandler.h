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

#import <Foundation/Foundation.h>
#import "Publication.h"

@protocol FormatHandler <NSObject>

// get the format name
- (NSString *)getFormatName;

// set thumbnail info
- (void)setThumbnailInfo:(NSString *)thumbnailDirectoryPath width:(long)thumbnailWidth height:(long)thumbnailHeight;

// determine whether the given file extension is supported by this FormatHandler
- (BOOL)isParsable:(NSString *)lowercasedFilename;

// add allowed (lowercased) extensions
- (void)addAllowedLowercasedExtensions:(NSArray *)allowedLowercasedExtensions;

// return the parsed Publication out of the given file
- (Publication *)parseFile:(NSString *)file;

// perform a custom action
- (NSString *)customAction:(NSString *)path parameters:(NSDictionary *)parameters;

@end
