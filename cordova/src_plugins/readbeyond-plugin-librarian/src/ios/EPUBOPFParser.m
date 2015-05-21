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

#import "EPUBOPFParser.h"

@implementation EPUBOPFParser

NSString * const EPUB_NAMESPACE_OPF                             = @"http://www.idpf.org/2007/opf";
NSString * const EPUB_NAMESPACE_DC                              = @"http://purl.org/dc/elements/1.1/";
NSString * const EPUB_OPF_PACKAGE                               = @"package";
NSString * const EPUB_OPF_METADATA                              = @"metadata";
NSString * const EPUB_OPF_METADATA_TITLE                        = @"title";
NSString * const EPUB_OPF_METADATA_CREATOR                      = @"creator";
NSString * const EPUB_OPF_METADATA_LANGUAGE                     = @"language";
NSString * const EPUB_OPF_METADATA_META                         = @"meta";
NSString * const EPUB_OPF_METADATA_META_PROPERTY                = @"property";
NSString * const EPUB_OPF_METADATA_META_PROPERTY_MEDIADURATION  = @"media:duration";
NSString * const EPUB_OPF_METADATA_META_PROPERTY_MEDIANARRATOR  = @"media:narrator";
NSString * const EPUB_OPF_METADATA_META_REFINES                 = @"refines";
NSString * const EPUB_OPF_METADATA_META_NAME                    = @"name";
NSString * const EPUB_OPF_METADATA_META_NAME_COVER              = @"cover";
NSString * const EPUB_OPF_METADATA_META_NAME_SERIES             = @"calibre:series";
NSString * const EPUB_OPF_METADATA_META_NAME_SERIES_INDEX       = @"calibre:series_index";
NSString * const EPUB_OPF_METADATA_META_CONTENT                 = @"content";
NSString * const EPUB_OPF_MANIFEST                              = @"manifest";
NSString * const EPUB_OPF_MANIFEST_ITEM                         = @"item";
NSString * const EPUB_OPF_MANIFEST_ITEM_ID                      = @"id";
NSString * const EPUB_OPF_MANIFEST_ITEM_HREF                    = @"href";
NSString * const EPUB_OPF_MANIFEST_ITEM_PROPERTIES              = @"properties";
NSString * const EPUB_OPF_MANIFEST_ITEM_PROPERTIES_COVERIMAGE   = @"cover-image";

- (id)init:(NSData *)data
{
    if (self == [super init]) {
        _coverManifestID        = nil;
        _shouldSetNarrator      = FALSE;
        _shouldSetDuration      = FALSE;
        
        _parser = [[NSXMLParser alloc] initWithData:data];
        [_parser setShouldProcessNamespaces:TRUE];
        [_parser setDelegate:self];
        [_parser parse];
   }      
   return self;
}

- (void)parser:(NSXMLParser *)parser didStartElement:(NSString *)elementName namespaceURI:(NSString *)namespaceURI qualifiedName:(NSString *)qualifiedName attributes:(NSDictionary *)attributeDict
{
    if (([namespaceURI isEqualToString:EPUB_NAMESPACE_OPF]) && ([elementName isEqualToString:EPUB_OPF_MANIFEST_ITEM])) {
        NSString *attr_id       = [attributeDict objectForKey:EPUB_OPF_MANIFEST_ITEM_ID];
        NSString *href          = [attributeDict objectForKey:EPUB_OPF_MANIFEST_ITEM_HREF];
        NSString *properties    = [attributeDict objectForKey:EPUB_OPF_MANIFEST_ITEM_PROPERTIES];
        
        if ((self.pathThumbnailSourceRelativeToOPF == nil) && (href != nil)) {
            if ((properties != nil) && ([properties rangeOfString:EPUB_OPF_MANIFEST_ITEM_PROPERTIES_COVERIMAGE].length > 0)) {
                self.pathThumbnailSourceRelativeToOPF = [href stringByTrimmingCharactersInSet:[NSCharacterSet whitespaceAndNewlineCharacterSet]];
            }
            if ((_coverManifestID != nil) && (attr_id != nil) && ([attr_id isEqualToString:_coverManifestID])) {
                self.pathThumbnailSourceRelativeToOPF = [href stringByTrimmingCharactersInSet:[NSCharacterSet whitespaceAndNewlineCharacterSet]];
            }
        }
    }
    
    if ([elementName isEqualToString:EPUB_OPF_METADATA_META]) {
        NSString *name          = [attributeDict objectForKey:EPUB_OPF_METADATA_META_NAME];
        NSString *content       = [attributeDict objectForKey:EPUB_OPF_METADATA_META_CONTENT];
        NSString *property      = [attributeDict objectForKey:EPUB_OPF_METADATA_META_PROPERTY];
        NSString *refines       = [attributeDict objectForKey:EPUB_OPF_METADATA_META_REFINES];
        
        if ((refines == nil) && (property != nil)) {
            if ((self.narrator == nil) && ([property isEqualToString:EPUB_OPF_METADATA_META_PROPERTY_MEDIANARRATOR])) {
                _shouldSetNarrator = TRUE;
            } else if ((self.duration == nil) && ([property isEqualToString:EPUB_OPF_METADATA_META_PROPERTY_MEDIADURATION])) {
                _shouldSetDuration = TRUE;
            }
        } else if ((name != nil) && (content != nil)) {
            if ((self.pathThumbnailSourceRelativeToOPF == nil) && ([name isEqualToString:EPUB_OPF_METADATA_META_NAME_COVER])) {
                _coverManifestID = [content stringByTrimmingCharactersInSet:[NSCharacterSet whitespaceAndNewlineCharacterSet]];
            }
            if ([name isEqualToString:EPUB_OPF_METADATA_META_NAME_SERIES]) {
                self.series = [content stringByTrimmingCharactersInSet:[NSCharacterSet whitespaceAndNewlineCharacterSet]];
            }
            if ([name isEqualToString:EPUB_OPF_METADATA_META_NAME_SERIES_INDEX]) {
                self.seriesIndex = [content stringByTrimmingCharactersInSet:[NSCharacterSet whitespaceAndNewlineCharacterSet]];
            }
        }
    }
    
    _element = [NSMutableString string];
}

- (void)parser:(NSXMLParser *)parser didEndElement:(NSString *)elementName namespaceURI:(NSString *)namespaceURI qualifiedName:(NSString *)qName
{
    if ([namespaceURI isEqualToString:EPUB_NAMESPACE_DC]) {
        if ((self.title == nil) && ([elementName isEqualToString:EPUB_OPF_METADATA_TITLE])) {
            self.title = [_element stringByTrimmingCharactersInSet:[NSCharacterSet whitespaceAndNewlineCharacterSet]];
        }
        if ((self.author == nil) && ([elementName isEqualToString:EPUB_OPF_METADATA_CREATOR])) {
            self.author = [_element stringByTrimmingCharactersInSet:[NSCharacterSet whitespaceAndNewlineCharacterSet]];
        }
        if ((self.language == nil) && ([elementName isEqualToString:EPUB_OPF_METADATA_LANGUAGE])) {
            self.language = [_element stringByTrimmingCharactersInSet:[NSCharacterSet whitespaceAndNewlineCharacterSet]];
        }
    }
    if ([elementName isEqualToString:EPUB_OPF_METADATA_META]) {
        if (_shouldSetNarrator) {
            self.narrator = [_element stringByTrimmingCharactersInSet:[NSCharacterSet whitespaceAndNewlineCharacterSet]];
            _shouldSetNarrator = FALSE;
        } else if (_shouldSetDuration) {
            self.duration = [_element stringByTrimmingCharactersInSet:[NSCharacterSet whitespaceAndNewlineCharacterSet]];
            _shouldSetDuration = FALSE;
        }
    }
}

- (void)parser:(NSXMLParser *)parser foundCharacters:(NSString *)string
{
    if (_element == nil) {
        _element = [[NSMutableString alloc] init];
    }
    [_element appendString:string];
}

@end
