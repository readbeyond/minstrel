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

#import "EPUBContainerParser.h"

@implementation EPUBContainerParser

NSString * const EPUB_NAMESPACE_XMLNS_CONTAINER                 = @"urn:oasis:names:tc:opendocument:xmlns:container";
//NSString * const EPUB_CONTAINER_CONTAINER                       = @"container";
//NSString * const EPUB_CONTAINER_ROOTFILES                       = @"rootfiles";
NSString * const EPUB_CONTAINER_ROOTFILE                        = @"rootfile";
NSString * const EPUB_CONTAINER_FULLPATH                        = @"full-path";
NSString * const EPUB_CONTAINER_MEDIATYPE                       = @"media-type";
NSString * const EPUB_CONTAINER_MEDIATYPE_OPF                   = @"application/oebps-package+xml";

- (id)init:(NSData *)data
{
    if (self == [super init]) {
        self.OPFPath = nil;
        _parser = [[NSXMLParser alloc] initWithData:data];
        [_parser setShouldProcessNamespaces:TRUE];
        [_parser setDelegate:self];
        [_parser parse];
   }      
   return self;
}

- (void)parser:(NSXMLParser *)parser didStartElement:(NSString *)elementName namespaceURI:(NSString *)namespaceURI qualifiedName:(NSString *)qualifiedName attributes:(NSDictionary *)attributeDict
{
    if (([namespaceURI isEqualToString:EPUB_NAMESPACE_XMLNS_CONTAINER]) && ([elementName isEqualToString:EPUB_CONTAINER_ROOTFILE])) {
        NSString *fullpath  = [attributeDict objectForKey:EPUB_CONTAINER_FULLPATH];
        NSString *mediatype = [attributeDict objectForKey:EPUB_CONTAINER_MEDIATYPE];
        if ( (fullpath != nil) && (mediatype != nil) && ([mediatype isEqualToString:EPUB_CONTAINER_MEDIATYPE_OPF]) ) {
            self.OPFPath = fullpath;
        }
    }
}

@end
