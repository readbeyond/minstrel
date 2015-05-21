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
#import "JSONPrintable.h"
#import "Format.h"

@interface Publication : NSObject<JSONPrintable>

@property NSString           *id;
@property NSString           *absolutePath;
@property NSString           *relativePath;
@property NSString           *absolutePathThumbnail;
@property NSString           *relativePathThumbnail;
@property NSString           *title;
@property NSString           *mainFormat;
@property NSMutableArray     *formats;
@property unsigned long long size;
@property BOOL               isSingleFile;
@property BOOL               isValid;

- (id)init;
- (NSString *)getId;
- (void)addFormat:(Format *)format;
- (NSMutableArray *)getFormats;

@end
