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

//
//  UIImage+SimpleResize.h
//
//  Created by Robert Ryan on 5/19/11.
//

#import <Foundation/Foundation.h>

@interface UIImage (SimpleResize)

- (UIImage*)scaleImageToSizeFill:(CGSize)newSize;
- (UIImage*)scaleImageToSizeAspectFill:(CGSize)newSize;
- (UIImage*)scaleImageToSizeAspectFit:(CGSize)newSize;

@end
