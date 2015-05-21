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

@interface Format : NSObject<JSONPrintable>

@property NSString            *name;
@property NSString            *version;
@property NSMutableDictionary *metadata;

- (id)init:(NSString *)name;
- (id)init:(NSString *)name version:(NSString *)version;
- (NSString *)getName;
- (void)addMetadatum:(NSString *)value forKey:(NSString *)name;
- (NSString *)getMetadatum:(NSString *)name;
- (BOOL)equals:(NSString *)otherName;
- (BOOL)equals:(NSString *)otherName withVersion:(NSString *)otherVersion;

@end
