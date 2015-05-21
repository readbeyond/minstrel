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

#import "ZipAsset.h"

@implementation ZipAsset

- (id)init:(NSString *)path medatada:(NSMutableDictionary *)metadata
{
    if (self == [super init]) {
        self.path       = path;
        self.metadata   = metadata;
    }
    return self;
}

- (NSComparisonResult)compare:(ZipAsset *)other {
    return [self.path compare:other.path];
}

- (id)toJSONObject
{
    NSMutableDictionary *obj = [[NSMutableDictionary alloc] init];
    [obj setValue:self.path     forKey:@"path"];
    [obj setValue:self.metadata forKey:@"metadata"];
    return obj;
}

- (NSString *)toString
{
    NSMutableString *result = [NSMutableString stringWithString:@"{"];
    
    [result appendString: @"\"path\": \""];
    [result appendString: [ZipAsset escape:self.path]];
    [result appendString: @"\","];
    
    [result appendString: @"\"metadata\": {"];
    if (self.metadata != nil) {
        NSEnumerator *keys = [self.metadata keyEnumerator];
        BOOL first = TRUE;
        for (NSString *k in keys) {
            NSString *v = [ZipAsset escape:[self.metadata objectForKey:k]];
            if (first) {
                first = FALSE;
            } else {
                [result appendString:@","];
            }
            [result appendString:[NSString stringWithFormat:@"\"%@\": \"%@\"", [ZipAsset escape:k], [ZipAsset escape:v]]];
        }
    }
    [result appendString: @"}"];
    
    [result appendString: @"}"];
    return result;
}

+ (NSString *)escape:(NSString *)unescaped
{
    if (unescaped == nil) {
        return @"";
    }
    return [unescaped stringByReplacingOccurrencesOfString:@"\"" withString:@"\\\""];
}

@end
