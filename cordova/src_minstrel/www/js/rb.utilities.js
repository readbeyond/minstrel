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

// be strict, be safe
'use strict';

/** @namespace RB */
var RB = RB || {};

/**
    @classdesc A custom exception, with a tag and a message.
    @example
    throw new RB.Exception('Format.EPUB', 'Cannot parse OPF file.');
    @class
    @param {string} tag - The tag of this exception.
    @param {string} message - The message of this exception.
*/
RB.Exception = RB.Exception || function(tag, message) {
    this.tag = tag;
    this.message = message;
};
RB.Exception.prototype.toString = function() {
    return '[' + this.tag + '] ' + this.message;
};

/** @namespace RB.Utilities */
RB.Utilities = RB.Utilities || {};

/**
    Read the given file and return the corresponding XML object.
    @example
    var xml = RB.Utilities.loadXMLFile('path/to/dir/META-INF/container.xml')
    @param {string} file_name - The path to the XML file to be read. 
    @return {object} x- The corresponding XML object, or throw exception if not able to.
*/
RB.Utilities.loadXMLFile = function(file_name) {
    try {
        if (window.XMLHttpRequest !== null) {
            var xhttp = new XMLHttpRequest();
            xhttp.open('GET', file_name, false);
            xhttp.overrideMimeType('text/xml');
            xhttp.send(null);
            return xhttp.responseXML;
        }
    } catch (e) {
        throw new RB.Exception('Utilities.loadXMLFile', 'Cannot open ' + file_name);
    }
};
/**
    Read the given file and return its content as a string.
    @example
    var raw = RB.Utilities.loadTextFile('path/to/file.po')
    @param {string} file_name - The path to the PO file to be read. 
    @return {object} x- The contents of `file_name`, or throw exception if not able to.
*/
RB.Utilities.loadTextFile = function(file_name) {
    try {
        if (window.XMLHttpRequest !== null) {
            var xhttp = new XMLHttpRequest();
            xhttp.open('GET', file_name, false);
            xhttp.send(null);
            return xhttp.responseText;
        }
    } catch (e) {
        throw new RB.Exception('Utilities.loadTextFile', 'Cannot open ' + file_name);
    }
};
/**
    Get the parent directory of the given URL.
    @example
    var pd = RB.Utilities.getParentDirectory('foo');         // '' 
    var pd = RB.Utilities.getParentDirectory('foo/');        // 'foo/'
    var pd = RB.Utilities.getParentDirectory('foo/bar');     // 'foo/'
    var pd = RB.Utilities.getParentDirectory('foo/bar/');    // 'foo/bar/'
    var pd = RB.Utilities.getParentDirectory('foo/bar/baz'); // 'foo/bar/'
    @param {string} url - A URL whose parent directory is requested. 
    @return {string} x- The parent directory of url.
*/
RB.Utilities.getParentDirectory = function(url) {
    var last_slash = url.lastIndexOf('/');
    if (last_slash === -1) {
        // url does not contain '/'
        return '';
    }
    return url.slice(0, last_slash + 1);
};
/**
    Get the last component of the given URL.
    @example
    var pd = RB.Utilities.getLastPathComponent('foo');         // 'foo'
    var pd = RB.Utilities.getLastPathComponent('foo/');        // ''
    var pd = RB.Utilities.getLastPathComponent('foo/bar');     // 'bar'
    var pd = RB.Utilities.getLastPathComponent('foo/bar/baz'); // 'baz'
    @param {string} url - A URL whose last component is requested.
    @return {string} x- The last component of url.
*/
RB.Utilities.getLastPathComponent = function(url) {
    var last_slash = url.lastIndexOf('/');
    if (last_slash === -1) {
        return url;
    }
    if (last_slash === url.length - 1) {
        return '';
    }
    return url.slice(last_slash + 1);
};
/**
    Normalize the given URL, removing '../' and './'.
    @example
    var nd = RB.Utilities.normalizePath('foo');            // 'foo'
    var nd = RB.Utilities.normalizePath('foo/bar');        // 'foo/bar'
    var nd = RB.Utilities.normalizePath('foo/../bar/baz'); // 'bar/baz'
    var nd = RB.Utilities.normalizePath('foo/./bar/baz');  // 'foo/bar/baz'
    @todo Check this method (more robust code needed?)
    @param {string} url - The URL to be normalized. 
    @return {string} x- The normalized URL.
*/
RB.Utilities.normalizePath = function(url) {
    var u = url;
    if (u.indexOf('./') < 0) {
        // skip if we do not have './' or '../' to deal with
        return u;
    }
    
    // remove './' at the beginning
    if ((u.length >= 2) && (u.slice(0, 2) === './')) {
        u = u.slice(2); 
    }

    // replace all '/./' with '/'
    u = u.replace(/\/\.\//g, '/');
    
    // here url does not have '.' inside
    // split into components
    var arr_u = u.split('/');

    // note: the first element cannot be '..' (e.g., '../foo/bar')
    // note: in theory, last element might be '..' (e.g., 'foo/bar/..')
    for (var i = 1; i < arr_u.length - 1; i++) {
        if (arr_u[i] === '..') {
            arr_u[i] = null;
            var j = 1;
            while ((arr_u[i - j] === null) && (i-j-1 >= 0)) {
                j += 1;
            }
            arr_u[i - j] = null;
        }
    }
    u = '';
    for (var i = 0; i < arr_u.length - 1; i++) {
        if (arr_u[i] !== null) {
            u += arr_u[i] + '/';
        }
    }
    u += arr_u[arr_u.length - 1];
    return u;
};
/**
    Split the given URL file#anchor into [file, anchor].
    @example
    var a = RB.Utilities.splitHref('foo.xhtml');     // ['foo.xhtml', null]
    var a = RB.Utilities.splitHref('foo.xhtml#bar'); // ['foo.xhtml', 'bar']
    @param {string} url - The URL to be split. 
    @return {object} x- An array [file, anchor], where anchor might be `null`.
*/
RB.Utilities.splitHref = function(url) {
    var toReturn = [ url, null ];
    if (url !== null) {
        var index = url.indexOf('#');
        if ((index > -1) && (index + 1 < url.length)) {
            toReturn[0] = url.substring(0, index);
            toReturn[1] = url.substring(index + 1);
        }
    }
    return toReturn;
};
/**
    Look for `<ns:tag>` elements inside el, optionally parsing attributes [ a1, a2, ... ].
    Return an array [ sub1, sub2, ... ],
    where subN = { id: 'id', value: 'value', attributes: { a1: 'v1', a2: 'v2', ... } }
    @example
    var r = RB.Utilities.getElementValue(some_xml_element, 'meta', '*', [ 'refines', 'property' ]);
    @param {object} el - The root element.
    @param {string} tag - The tag to search for.
    @param {string} ns - The tag namespace. Use '*' to match any namespace.
    @param {object} attributes - An array of strings, specifying the attribute names to be included in the 'attributes' field of the returned data.
    @return {object} x- An array of dictionaries as described above. It might be empty.
*/
RB.Utilities.getElementValue = function(el, tag, ns, attributes) {
    var to_be_returned = [];
    var namespace = ns;
    if (namespace === null) {
        namespace = '*';
    }
    var found = el.getElementsByTagNameNS(namespace, tag);
    if ((found === null) || (found.length === 0)) {
        return to_be_returned;
    }
    for (var i = 0; i < found.length; i++) {
        // current node
        var node = found[i];

        // to be added
        var n = {};
        
        // store id
        n['id'] = node.getAttribute('id');
        
        // parsing innerValue
        n['value'] = null;
        if ((node.childNodes !== null) && (node.childNodes.length > 0) && (node.childNodes[0].length > 0)) {
            n['value'] = node.childNodes[0].nodeValue;
        }
        
        // parsing attributes
        n['attributes'] = {}; 
        for (var j = 0; j < attributes.length; j++) {
            var attribute = attributes[j];
            n['attributes'][attribute] = node.getAttribute(attribute);
        }
        
        // push current node 
        to_be_returned.push(n);
    }
    return to_be_returned;
};
/**
    Parse a clock value and return its (float) value in seconds.
    @example
    var c = RB.Utilities.clockValueToSeconds('123.45ms');     // 0.12345 
    var c = RB.Utilities.clockValueToSeconds('123.45s');      // 123.45
    var c = RB.Utilities.clockValueToSeconds('123.45h');      // 444420
    var c = RB.Utilities.clockValueToSeconds('123.45min');    // 7407
    var c = RB.Utilities.clockValueToSeconds('1');            // 1
    var c = RB.Utilities.clockValueToSeconds('12');           // 12
    var c = RB.Utilities.clockValueToSeconds('12.345');       // 12.345
    var c = RB.Utilities.clockValueToSeconds('01:02');        // 62
    var c = RB.Utilities.clockValueToSeconds('01:02.345');    // 62.345
    var c = RB.Utilities.clockValueToSeconds('01:02:03');     // 3723
    var c = RB.Utilities.clockValueToSeconds('01:02:03.456'); // 3723.456
    @todo We need more efficient code and/or we can ignore those silly formats using 'ms', 's', 'h', 'min'.
    @param {string} str - The clock value string.
    @return {float} x- The clock value, in seconds. It might be `null`, if str is `null`.
*/
RB.Utilities.clockValueToSeconds = function(str) {
    // parse duration into seconds (float)
    if ((str === null) || (str === undefined) || (str === '')) {
        return null;
    }
    var v = 0;

    if (str.indexOf('ms') > -1) {
        // 123.45ms
        // IMPORTANT test this before 's'
        v = parseFloat(str.replace('ms', '')) * 0.001;
    } else if (str.indexOf('s') > -1) {
        // 123.45s
        v = parseFloat(str.replace('s', ''));
    } else if (str.indexOf('h') > -1) {
        // 123.45h
        v = parseFloat(str.replace('h', '')) * 3600;
    } else if (str.indexOf('min') > -1) {
        // 123.45min
        v = parseFloat(str.replace('min', '')) * 60;
    } else {
        // H[H]*:M[M]*:S[S]*.m[m]*
        // H[H]*:M[M]*:S[S]*
        // M[M]*:SS
        // S[S]*
        var h = 0;
        var m = 0;
        var s = 0;
        var d = 0;
        var str_hms = str;
        if (str.indexOf('.') > - 1) {
            // has at least one decimal digit
            var str_d = str.slice(str.indexOf('.')+1);
            if (str_d.length > 0) {
                d = parseInt(str_d);
                d = d / Math.pow(10, str_d.length);
            }
            // hms will hold only the H[H]*:M[M]*:S[S]* part
            str_hms = str.slice(0, str.indexOf('.'));
        }
        var arr_hms = str_hms.split(':');
        var n = arr_hms.length;
        if (n >= 1) {
            s = parseInt(arr_hms[n-1]);
        }
        if (n >= 2) {
            m = parseInt(arr_hms[n-2]);
        }
        if (n >= 3) {
            h = parseInt(arr_hms[n-3]);
        }
        v = h * 3600 + m * 60 + s + d;
    }
    return v;  
};
/**
    Pretty print the given clock value, in HH:MM:SS or MM:SS format.
    @example
    var p = RB.Utilities.prettifyClockValue(12.345, false); //    00:12
    var p = RB.Utilities.prettifyClockValue(  3723, false); // 01:02:03
    var p = RB.Utilities.prettifyClockValue(  3723, true);  // 01:02:03
    var p = RB.Utilities.prettifyClockValue(    62, false); // 00:01:02
    var p = RB.Utilities.prettifyClockValue(    62, true);  //    01:02
    @param {float} value - The clock value, in seconds.
    @param {boolean} no_hours - If `true`, when the clock value is less than one hour, return it in MM:SS format. Otherwise, use the HH:MM:SS format.
    @return {string} x- The clock value, in the requested format.
*/
RB.Utilities.prettifyClockValue = function(value, no_hours) {
    var vv = value;
    var h = Math.floor(vv / 3600);
    var str_h = '' + h;
    vv -= h * 3600;
    var m = Math.floor(vv / 60);
    var str_m = '' + m;
    vv -= m * 60;
    var s = Math.floor(vv);
    var str_s = '' + s;
    while (str_h.length < 2) {
        str_h = '0' + str_h;
    }
    while (str_m.length < 2) {
        str_m = '0' + str_m;
    }
    while (str_s.length < 2) {
        str_s = '0' + str_s;
    }
    if ((no_hours) && (str_h === '00')) {
        return str_m + ':' + str_s;
    } else {
        return str_h + ':' + str_m + ':' + str_s;
    }
};
/**
    Pretty print the given clock value, passed as a string, in HH:MM:SS format.
    @example
    var p = RB.Utilities.clockStringToPrettyClockValue(  '12.345'); // 00:00:12
    var p = RB.Utilities.clockStringToPrettyClockValue(  '62');     // 00:01:02
    var p = RB.Utilities.clockStringToPrettyClockValue('3723');     // 01:02:03
    @param {string} str - The clock value string.
    @return {string} x- The clock value, in HH:MM:SS format.
*/
RB.Utilities.clockStringToPrettyClockValue = function(str) {
    if ((str === null) || (str === undefined) || (str === '')) {
        return '';
    }
    return RB.Utilities.prettifyClockValue(RB.Utilities.clockValueToSeconds(str), false);
};
/**
    Get the current date and time, in 'YYYY-MM-DD HH:MM:SS' format.
    @example
    var d = RB.Utilities.getCurrentDateTime(); // 2014-11-15 12:34:56
    @return {string} x- The current date and time, in 'YYYY-MM-DD HH:MM:SS' format.
*/
RB.Utilities.getCurrentDateTime = function() {
    var m = new Date();
    var dateString = m.getUTCFullYear()                      + '-' +
                     ('0' + (m.getUTCMonth() + 1)).slice(-2) + '-'+
                     ('0' + m.getUTCDate()).slice(-2)        + ' ' +
                     ('0' + m.getUTCHours()).slice(-2)       + ':' +
                     ('0' + m.getUTCMinutes()).slice(-2)     + ':' +
                     ('0' + m.getUTCSeconds()).slice(-2);
    return dateString;
};
/**
    Convert a given array of dictionaries,
    into a dictionary of dictionaries,
    using their 'id' as identifiers.
    @example
    var arr = [ { 'id': 'a', 'val': '1' }, { 'id': 'b', 'val': '2' } ];
    var d = RB.Utilities.array2dictionary(arr); // d = { 'a': '1', 'b': '2' }
    @param {object} arr - The array to be converted.
    @return {object} x- A dictionary of dictionaries as described above. It might be empty.
*/
RB.Utilities.array2dictionary = function(arr) {
    var d = {};
    if (arr) {
        for (var i = 0; i < arr.length; ++i) {
            var obj = arr[i];
            var id = obj['id'];
            d[id] = obj;
        }
    }
    return d;
};
/**
    Sort a given array of arrays [ [key1, sub1, obj1], [key2, sub2, obj2], ... ],
    using their first element as the main key, and their second element as the secondary key.
    @example
    var arr = [ ['a', 'B', 2], ['a', 'A', 3], ['b', 'B', 1] ];
    var s1 = RB.Utilities.sortByKey(arr, false); // s1 = [ ['a', 'A', 3], ['a', 'B', 2], ['b', 'B', 1] ]
    var s2 = RB.Utilities.sortByKey(arr, true);  // s2 = [ ['b', 'B', 1], ['a', 'A', 3], ['a', 'B', 2] ]
    @param {object} arr - The array to be sorted.
    @param {boolean} inverted - Invert the natural order of the main key. It does not affect the secondary key.
    @return {object} x- The sorted array as described above. It might be empty.
*/
RB.Utilities.sortByKey = function(arr, inverted) {
    var comparator = function(a, b) {
        var keyA = a[0];
        var subA = a[1];
        var keyB = b[0];
        var subB = b[1];
        var inv  = (inverted ? -1 : 1);
        
        if (keyA < keyB) {
            return -inv;
        } else if (keyA > keyB) {
            return inv;
        } else {
            if (subA < subB) {
                return -1;
            } else if (subA > subB) {
                return 1;
            } else {
                return 0;
            }
        }
    };
    return arr.sort(comparator);
};
/**
    Sort a given array of strings, according to the lexicographic order of their lowercased version.
    If two lowercased strings are the same, return according to the lexicographic order of their non-lowercased version.
    @example
    var arr = [ 'abc', 'ABC', 'Abc', 'BCD', 'abba', 'XYZ' ];
    var s1 = RB.Utilities.sortNoCase(arr, false); // s1 = [ 'abba', 'ABC', 'Abc', 'abc', 'BCD', 'XYZ' ]
    var s2 = RB.Utilities.sortNoCase(arr, true);  // s2 = [ 'XYZ', 'BCD', 'abc', 'Abc', 'ABC', 'abba' ]
    @param {object} arr - The array to be sorted.
    @param {boolean} inverted - Invert the natural order.
    @return {object} x- The sorted array as described above. It might be empty.
*/
RB.Utilities.sortNoCase = function(arr, inverted) {
    if ((!arr) || (!arr.length) || (arr.length < 1)) {
        return [];
    }
    var comparator = function(a, b) {
        var inv = (inverted ? -1 : 1);
        var la  = a.toLowerCase();
        var lb  = b.toLowerCase();
        if (la < lb) {
            return -inv;
        } else if (la > lb) {
            return inv;
        } else {
            if (a < b) {
                return -inv;
            } else if (a > b) {
                return inv;
            } else {
                return 0;
            }
        }
    };
    return arr.sort(comparator);
};
/**
    Pretty print the given size value.
    @example
    var p = RB.Utilities.prettifySizeValue(10);         // 10 B
    var p = RB.Utilities.prettifySizeValue(1023);       // 1023 B
    var p = RB.Utilities.prettifySizeValue(1024);       // 1 kB
    var p = RB.Utilities.prettifySizeValue(10000);      // 9 kB
    var p = RB.Utilities.prettifySizeValue(10240);      // 10 kB
    var p = RB.Utilities.prettifySizeValue(1048575);    // 999 kB
    var p = RB.Utilities.prettifySizeValue(1048576);    // 1 MB
    var p = RB.Utilities.prettifySizeValue(10485759);   // 9 MB
    var p = RB.Utilities.prettifySizeValue(10485760);   // 10 MB
    var p = RB.Utilities.prettifySizeValue(1048575999); // 999 MB
    var p = RB.Utilities.prettifySizeValue(1048576000); // 1000 MB
    @param {int} value - The size value, in bytes.
    @return {string} x- The size value, pretty printed.
*/
RB.Utilities.prettifySizeValue = function(value) {
    if (!value) {
        return null;
    }
    var kB = 1024;
    var MB = 1048576; // 1024 * 1024
    var v = parseInt(value);
    if (v < kB) {
        return v + ' B';
    }
    if (v < MB) {
        return Math.floor(v / kB) + ' kB';
    }
    return Math.floor(v / MB) + ' MB';
};
/**
    Determines whether the given file path has an extension in the given array.
    @example
    var images = [ 'gif', 'jpeg', 'jpg', 'png' ];
    var b1 = RB.Utilities.fileHasRecognizedExtension('/foo/bar/baz.jpg', images); // true
    var b1 = RB.Utilities.fileHasRecognizedExtension('/foo/bar/baz.JPG', images); // true
    var b2 = RB.Utilities.fileHasRecognizedExtension('/foo/baz/bar.zip', images); // false
    @param {string} filePath - The file path. Note that in the comparison the file extension will be lowercased.
    @param {array} extensions - An array of recognized extensions (specified as lowercase strings).
    @return {boolean} x- True if the given file has a recognized extension.
*/
RB.Utilities.fileHasRecognizedExtension = function(filePath, extensions) {
    var index = filePath.lastIndexOf('.');
    if (index > -1) {
        var lowercasedExtension = filePath.substring(index).toLowerCase();
        return (extensions.indexOf(lowercasedExtension) > -1);
    }
    return false;
};
/**
    Computes the modulo (remainder) a mod b, such that 0 <= a mod b < b.
    (a % b can be negative, if a is negative)
    @example
    var c = RB.Utilities.modulo( 0, 7); // 0
    var c = RB.Utilities.modulo( 1, 7); // 1
    var c = RB.Utilities.modulo( 7, 7); // 0
    var c = RB.Utilities.modulo( 8, 7); // 1
    var c = RB.Utilities.modulo(-1, 7); // 6
    var c = RB.Utilities.modulo(-7, 7); // 0
    @param {integer} a - The dividend.
    @param {integer} b - The divisor.
    @return {integer} x- The remainder of the integer division of a by b, between 0 and b-1.
*/
RB.Utilities.modulo = function(a, b) {
    var m = a;
    if (m < 0) {
        m += b * (-m);
    }
    return m % b;
};
/**
    Smartly joins the strings in the given array, using a given separator.
    @example
    var c = RB.Utilities.joinStrings(['a', 'b'],     ', ', '');  // 'a, b'
    var c = RB.Utilities.joinStrings(['a', 'b', ''], ', ', '');  // 'a, b'
    var c = RB.Utilities.joinStrings(['a'],          ', ', '');  // 'a'
    var c = RB.Utilities.joinStrings([],             ', ', '');  // ''
    @param {array} arr - The array of strings to be joined.
    @param {string} sep - The separator character.
    @param {string} defaultValue - The default value to be returned if the joined string is empty.
    @return {string} x-  The joined string.
*/
RB.Utilities.joinStrings = function(arr, sep, defaultValue) {
    if (arr) {
        var tmp = [];
        for (var i = 0; i < arr.length; i++) {
            if (arr[i]) {
                tmp.push(arr[i]);
            }
        }
        if (tmp.length > 0) {
            var s = tmp[0];
            for (var i = 1; i < tmp.length; i++) {
                s += sep + tmp[i];
            }
            return s;
        }
    }
    return defaultValue;
};
/**
    Remove from the given DOM all the <elementName> elements,
    for which filterFunction returns true, and return the modified DOM.
    @example
    var ff = function(element) {
        if (element.id) {
            return true;
        }
        return false;
    }
    myDOM = RB.Utilities.removeFromDOM(myDOM, 'a', ff); // removes all <a> with a valid id attribute from myDOM
    @param {object} dom - The DOM to be examined.
    @param {string} elementName - The name of the elements to be examined.
    @param {object} filterFunction - A function, taking a DOM element as parameter, and returning a boolean. If null or undefined, remove all <elementName> elements. 
    @return {object} dom-  The modified DOM.
*/
RB.Utilities.removeFromDOM = function(dom, elementName, filterFunction) {
    var elements = dom.getElementsByTagName(elementName);
    var i = 0;
    for (i = 0; i < elements.length; i++) {
        try {
            var element = elements[i];
            if ((! filterFunction) || (filterFunction(element))) {
                element.parentNode.removeChild(element);
                //
                // TODO refactor using RB.Utilities.filterElementsFromDOM ?
                //
                // NOTE: removeChild seems to alter elements,
                // so we decrement by 1 the running index i
                // so that the at next iteration will be incremented by 1
                // hence staying at the current index
                //
                i -= 1;
            }
        } catch (e) {
            // do nothing
        }
    }
    return dom;
};
/**
    Return an array containing all the <elementName> elements from the DOM,
    for which filterFunction returns true.
    @example
    var ff = function(element) {
        if (element.id) {
            return true;
        }
        return false;
    }
    var arr = RB.Utilities.filterElementsFromDOM(myDOM, 'a', ff); // arr contains all <a> elements with a valid id attribute
    @param {object} dom - The DOM to be examined.
    @param {string} elementName - The name of the elements to be examined.
    @param {object} filterFunction - A function, taking a DOM element as parameter, and returning a boolean. If null or undefined, matches all <elementName> elements. 
    @return {array} arr- An array containing the matched DOM elements.
*/
RB.Utilities.filterElementsFromDOM = function(dom, elementName, filterFunction) {
    var toBeReturned = [];
    var elements = dom.getElementsByTagName(elementName);
    for (var i = 0; i < elements.length; i++) {
        try {
            var element = elements[i];
            if ((! filterFunction) || (filterFunction(element))) {
                toBeReturned.push(element);
            }
        } catch (e) {
            // do nothing
        }
    }
    return toBeReturned;
};
/**
    Parse a viewport string into a dictionary with `width` and `height` properties.
    Note that the regex is quite lenient, allowing spaces around ',' and '=' characters, and float values.
    However, it still rejects malformed strings like 'width=1200, height=900, z=123'.
    @example
    var s1 = 'width=1200, height=900';
    var d1 = RB.Utilities.parseViewportString(s1); // d1 = { width: 1200, height: 900 }
    var s2 = 'height=900, width=1200';
    var d2 = RB.Utilities.parseViewportString(s2); // d2 = { width: 1200, height: 900 }
    var s3 = 'foo';
    var d3 = RB.Utilities.parseViewportString(s3); // d3 = null
    @param {string} s - The string to be parsed.
    @return {object} arr- A dictionary with `width` and `height` properties, or null.
*/
RB.Utilities.parseViewportString = function(s) {
    if (s) {
        s = s.trim();
        var regex = /^width[ ]*=[ ]*([0-9\.]*)[ px]*,[ ]*height[ ]*=[ ]*([0-9\.]*)[ px]*$/;
        var match = regex.exec(s);
        if (match) {
            return { 'width': Number(match[1]), 'height': Number(match[2]) };
        }
        
        regex = /^height[ ]*=[ ]*([0-9\.]*)[ px]*,[ ]*width[ ]*=[ ]*([0-9\.]*)[ px]*$/;
        match = regex.exec(s);
        if (match) {
            return { 'height': Number(match[1]), 'width': Number(match[2]) };
        }
    }
    return null;
};
/**
    Return the maximum value of the given array.
    @example
    var max1 = RB.Utilities.max([123]);             // 123
    var max2 = RB.Utilities.max([123, 456]);        // 456
    var max3 = RB.Utilities.max([123, 456, 789]);   // 789
    var max4 = RB.Utilities.max();                  // null
    var max5 = RB.Utilities.max([]);                // null
    @param {array} a - An array of numbers.
    @return {number} n- The maximum value in the given array, or null if a is not valid.
*/
RB.Utilities.max = function(arr) {
    if ((! arr) || (arr.length < 1)) {
        return null;
    }
    var max = arr[0];
    for (var i = 1; i < arr.length; i++) {
        if (arr[i] > max) {
            max = arr[i];
        }
    }
    return max;
};
/**
    Return the minimum value of the given array.
    @example
    var min1 = RB.Utilities.min([123]);             // 123
    var min2 = RB.Utilities.min([123, 456]);        // 123
    var min3 = RB.Utilities.min([123, 456, 789]);   // 123
    var min4 = RB.Utilities.min();                  // null
    var min5 = RB.Utilities.min([]);                // null
    @param {array} a - An array of numbers.
    @return {number} n- The minimum value in the given array, or null if a is not valid.
*/
RB.Utilities.min = function(arr) {
    if ((! arr) || (arr.length < 1)) {
        return null;
    }
    var min = arr[0];
    for (var i = 1; i < arr.length; i++) {
        if (arr[i] < min) {
            min = arr[i];
        }
    }
    return min;
};


