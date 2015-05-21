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

#import "Format.h"

@implementation Format

- (id)init:(NSString *)name
{
    if (self == [super init]) {
        self.name     = name;
        self.version  = @"";
        self.metadata = [[NSMutableDictionary alloc] init];
    }
    return self;
}
- (id)init:(NSString *)name version:(NSString *)version
{
    if (self == [super init]) {
        self.name     = name;
        self.version  = @"";
        self.metadata = [[NSMutableDictionary alloc] init];
    }
    return self;
}

- (NSString *)getName
{
    return self.name;
}

- (void)addMetadatum:(NSString *)value forKey:(NSString *)name
{
    [self.metadata setValue:value forKey:name];
}

- (NSString *)getMetadatum:(NSString *)name
{
    return [self.metadata objectForKey:name];
}

- (BOOL)equals:(NSString *)otherName
{
    return [self.name isEqualToString:otherName];
}

- (BOOL)equals:(NSString *)otherName withVersion:(NSString *)otherVersion
{
    return [self.name isEqualToString:otherName] && [self.version isEqualToString:otherVersion];
}

- (id)toJSONObject
{
    NSMutableDictionary *obj = [[NSMutableDictionary alloc] init];
    [obj setValue:self.name     forKey:@"name"];
    [obj setValue:self.version  forKey:@"version"];
    [obj setValue:self.metadata forKey:@"metadata"];
    return obj;
}

@end
