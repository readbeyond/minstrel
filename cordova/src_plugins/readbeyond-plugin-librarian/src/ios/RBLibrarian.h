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

#import <Cordova/CDV.h>

@interface RBLibrarian : CDVPlugin

- (void)librarian:(CDVInvokedUrlCommand *)command;
+ (NSString *)getDocumentsDirectoryPath;
+ (NSString *)stringify:(NSMutableArray *)items mainKey:(NSString *)mainKey;

@end
