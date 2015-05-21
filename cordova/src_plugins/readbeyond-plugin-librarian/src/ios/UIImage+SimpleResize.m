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
//  UIImage+SimpleResize.m
//
//  Modified by Robert Ryan on 5/19/11.
//
//  Got the basic idea at http://ofcodeandmen.poltras.com/2008/10/30/undocumented-uiimage-resizing/
//  but had to rewrite to support AspectFill and AspectFit modes.
//
//  By the way, I was enticed by http://vocaro.com/trevor/blog/2009/10/12/resize-a-uiimage-the-right-way/
//  but it turns out that those routines just don't handle some stranger file formats (CMYK, etc.) well
//  because it tries to create a new context that mirrors the one of the image, some of which the
//  CGBitmapContextCreate() just chokes on.
//
//  I'm sure there are richer implementations, but my solution has benefit of being simple, and it works.

#import "UIImage+SimpleResize.h"

@implementation UIImage (SimpleResize)

- (UIImage *)cropWithinBounds:(CGRect)bounds
{
    CGImageRef imageRef = CGImageCreateWithImageInRect([self CGImage], bounds);
    UIImage *croppedImage = [UIImage imageWithCGImage:imageRef];
    CGImageRelease(imageRef);
    return croppedImage;
}

- (UIImage*)scaleImageToSizeFill:(CGSize)newSize
{
    UIGraphicsBeginImageContext(newSize);
    [self drawInRect:CGRectMake(0, 0, newSize.width, newSize.height)];
    UIImage* image = UIGraphicsGetImageFromCurrentImageContext();
    UIGraphicsEndImageContext();
    
    return image;
}

- (UIImage*)scaleImageToSize:(CGSize)newSize contentMode:(UIViewContentMode)contentMode
{
    if (contentMode == UIViewContentModeScaleToFill)
    {
        return [self scaleImageToSizeFill:newSize];
    }
    else if ((contentMode == UIViewContentModeScaleAspectFill) ||
             (contentMode == UIViewContentModeScaleAspectFit))
    {
        CGFloat horizontalRatio   = self.size.width  / newSize.width;
        CGFloat verticalRatio     = self.size.height / newSize.height;
        CGFloat ratio;
        
        if (contentMode == UIViewContentModeScaleAspectFill)
            ratio = MIN(horizontalRatio, verticalRatio);
        else
            ratio = MAX(horizontalRatio, verticalRatio);
        
        CGSize  sizeForAspectScale = CGSizeMake(self.size.width / ratio, self.size.height / ratio);
        
        UIImage *image = [self scaleImageToSizeFill:sizeForAspectScale];
        
        // if we're doing aspect fill, then the image still needs to be cropped
        
        if (contentMode == UIViewContentModeScaleAspectFill)
        {
            CGRect  subRect = CGRectMake(floor((sizeForAspectScale.width - newSize.width) / 2.0),
                                         floor((sizeForAspectScale.height - newSize.height) / 2.0),
                                         newSize.width,
                                         newSize.height);
            image = [image cropWithinBounds:subRect];
        }
        
        return image;
    }
    
    //    NSLog(@"%s unknown contentMode %d", __FUNCTION__, contentMode);
    return nil;
}

- (UIImage*)scaleImageToSizeAspectFill:(CGSize)newSize
{
    return [self scaleImageToSize:newSize contentMode:UIViewContentModeScaleAspectFill];
}

- (UIImage*)scaleImageToSizeAspectFit:(CGSize)newSize
{
    return [self scaleImageToSize:newSize contentMode:UIViewContentModeScaleAspectFit];
}

@end
