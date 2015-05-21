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

@interface EPUBOPFParser : NSObject <NSXMLParserDelegate>
{
    NSXMLParser     *_parser;
    NSMutableString *_element;
    NSString        *_coverManifestID;
    BOOL            _shouldSetNarrator;
    BOOL            _shouldSetDuration;
}

@property NSString *pathThumbnailSourceRelativeToOPF;

@property NSString *title;
@property NSString *author;
@property NSString *language;
@property NSString *duration;
@property NSString *narrator;
@property NSString *series;
@property NSString *seriesIndex;

- (id)init:(NSData*)data;

@end
