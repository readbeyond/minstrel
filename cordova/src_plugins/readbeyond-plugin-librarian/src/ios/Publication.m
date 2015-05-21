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

#import "Publication.h"

@implementation Publication

- (id)init
{
    if (self == [super init]) {
        self.formats = [[NSMutableArray alloc] init];
    }
    return self;
}

- (NSString *)getId
{
    return self.id;
}

- (void)addFormat:(Format *)format
{
    [self.formats addObject:format];
}
- (NSMutableArray *)getFormats
{
    return self.formats;
}

- (id)toJSONObject
{
    NSMutableDictionary *obj = [[NSMutableDictionary alloc] init];
    [obj setValue:self.id                                         forKey:@"id"];
    [obj setValue:self.absolutePath                               forKey:@"absolutePath"];
    [obj setValue:self.relativePath                               forKey:@"relativePath"];
    [obj setValue:self.absolutePathThumbnail                      forKey:@"absolutePathThumbnail"];
    [obj setValue:self.relativePathThumbnail                      forKey:@"relativePathThumbnail"];
    [obj setValue:self.mainFormat                                 forKey:@"mainFormat"];
    
    NSMutableDictionary *fs = [[NSMutableDictionary alloc] init];
    for (int i = 0; i < [self.formats count]; i++) {
        Format *f = [self.formats objectAtIndex:i];
        [fs setObject:[f toJSONObject] forKey:[f getName]];
    }
    [obj setValue:fs forKey:@"formats"];
    
    [obj setValue:self.title                                      forKey:@"title"];
    [obj setValue:[NSNumber numberWithUnsignedLongLong:self.size] forKey:@"size"];
    [obj setValue:[NSNumber numberWithBool:self.isSingleFile]     forKey:@"isSingleFile"];
    [obj setValue:[NSNumber numberWithBool:self.isValid]          forKey:@"isValid"];
    return obj;
}

@end
