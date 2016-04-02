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

/** @namespace RB.Localization */
RB.Localization = RB.Localization || {};

/**
    Enumeration of language codes. 
    @todo Use `Object.freeze` to freeze the enum. (Currently not in place, due to a JSDoc bug.)
    @todo List more languages
    @readonly
    @enum {string}
*/
RB.Localization.LanguageEnum = {
    /** Danish */
    DA: 'da',

    /** German */
    DE: 'de',

    /** English */
    EN: 'en',

    /** Spanish */
    ES: 'es',

    /** French */
    FR: 'fr',

    /** Italian */
    IT: 'it',

    /** Japanese */
    JA: 'ja',

    /** Polish */
    PL: 'pl',

    /** Turkish */
    TR: 'tr',
};

/**
    @classdesc A localization manager which lets you easily change language and resolve strings from JS/JSON or PO files.
    @example
    // read only from RB.Localization.LocalizedStrings
    var manager = new RB.Localization.LocaleManager(RB.Localization.LanguageEnum.IT);
    
    // read from RB.Localization.LocalizedStrings and from PO files for EN and IT
    var language = RB.Localization.LanguageEnum.IT;
    var po_dir   = 'i18n/';
    var po_dict  = { RB.Localization.LanguageEnum.EN: 'en.po', RB.Localization.LanguageEnum.IT: 'it.po' };
    var manager  = new RB.Localization.LocaleManager(language, po_dir, po_dict);
    @class
    @param {RB.Localization.LanguageEnum} language - Set the current language. It might be `null`/`undefined`.
    @param {string} po_dir - The directory where PO files are. It might be `null`/`undefined`.
    @param {object} po_dict - A dictionary, associating languages to PO file names. It might be `null`/`undefined`.
*/
RB.Localization.LocaleManager = RB.Localization.LocaleManager || function(language, po_dir, po_dict) {
    
    // default language
    this.default_language = RB.Localization.LanguageEnum.EN;
   
    // current language 
    this.language = language;
    
    // directory where PO files are
    this.po_dir = po_dir;
    
    // dictionary associating languages and PO file names
    this.po_dict = po_dict;
   
    // store hardcoded ones 
    this.strings_from_js = RB.Localization.LocalizedStrings;

    // store those read from PO
    this.strings_from_po = {};
   
    // current localized strings 
    this.localized_strings = {};

    // load the localized strings 
    this.reloadLocalizedStrings();
};
/**
    Get an array containing all the keys of the localization strings.
    @example
    var manager = new RB.Localization.LocaleManager(RB.Localization.LanguageEnum.IT);
    var keys = manager.getKeys();
    @return {object} x- An array containing the keys of the localization strings.
*/
RB.Localization.LocaleManager.prototype.getKeys = function() {
    if (this.localized_strings) {
        return Object.keys(this.localized_strings);
    }
    return null;
};
/**
    Change the current language.
    @example
    var manager = new RB.Localization.LocaleManager(RB.Localization.LanguageEnum.IT);
    manager.changeLanguage(RB.Localization.LanguageEnum.EN);
    @param {RB.Localization.LanguageEnum} language - Set the current language.
*/
RB.Localization.LocaleManager.prototype.changeLanguage = function(language) {
    this.language = language;
    this.reloadLocalizedStrings();
};

/* 'PRIVATE' METHODS */
/**
    load the localized strings, in this order:
    1. load 'hardcoded' strings for default language
    2. load PO strings for default language
    3. load 'hardcoded' strings for this.language
    4. load PO strings for this.language
    @private
*/
RB.Localization.LocaleManager.prototype.reloadLocalizedStrings = function() {
    // 1. load 'hardcoded' strings for default language
    if ((this.strings_from_js) && (this.strings_from_js[this.default_language])) {
        this.updateLocalizedStrings(this.strings_from_js[this.default_language]);
    }

    // 2. load PO strings for default language
    if ((this.po_dir) && (this.po_dict) && (this.po_dict[this.default_language])) {
        if (! this.strings_from_po[this.default_language]) {
            this.strings_from_po[this.default_language] = this.load_strings_from_po(this.po_dir + this.po_dict[this.default_language]);
        }
        this.updateLocalizedStrings(this.strings_from_po[this.default_language]);
    }
   
    // 3. load 'hardcoded' strings for this.language
    if ((this.strings_from_js) && (this.strings_from_js[this.language])) {
        this.updateLocalizedStrings(this.strings_from_js[this.language]);
    }
    
    // 4. load PO strings for this.language
    if ((this.po_dir) && (this.po_dict) && (this.po_dict[this.language])) {
        if (! this.strings_from_po[this.language]) {
            this.strings_from_po[this.language] = this.load_strings_from_po(this.po_dir + this.po_dict[this.language]);
        }
        this.updateLocalizedStrings(this.strings_from_po[this.language]);
    }
};
RB.Localization.LocaleManager.prototype.updateLocalizedStrings = function(dict) {
    var keys = Object.keys(dict);
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        this.localized_strings[key] = dict[key];
    }
};
RB.Localization.LocaleManager.prototype.load_strings_from_po = function(po_file) {
    var tmp = {};
    var raw = RB.Utilities.loadTextFile(po_file);
    if (raw) {
        var strings = new RB.Localization.POParser(raw).parse();
        for (var i = 0; i < strings.length; i++) {
            var s = strings[i];
            var k = s.msgctxt;
            var v = s.msgstr;
            if ((k) && (v)) {
                if ((v.charAt(0) === '[') && (v.charAt(v.length - 1) === ']')) {
                    // array: eval it
                    tmp[k] = eval(v);
                } else if ((v.charAt(0) === '{') && (v.charAt(v.length - 1) === '}')) {
                    // dictionary: parse it
                    tmp[k] = JSON.parse(v);
                } else {
                    // simple string: get it
                    tmp[k] = v;
                }
            }
        }
    }
    return tmp;
};
RB.Localization.LocaleManager.prototype.getLocalizedObject = function(key, index) {
    var tmp = this.localized_strings[key];
    if ((tmp) && (index !== undefined) && (typeof tmp !== 'string')) {
        return tmp[index];
    }
    return tmp;
};



/*
    Code adapted from
    https://github.com/andris9/node-gettext
    by Andris Reinman
    http://www.andrisreinman.com/
    released under the 
    MIT license
*/
RB.Localization.POParser = function(str) {
    this.str = str;
};
/**
    State constants for parsing FSM
    @private
*/
RB.Localization.POParser.prototype.states = {
    none:       0x01,
    comments:   0x02,
    key:        0x03,
    string:     0x04
};
/**
    Value types for lexer
    @private
*/
RB.Localization.POParser.prototype.types = {
    comments:   0x01,
    key:        0x02,
    string:     0x03
};
/**
    String matches for lexer
    @private
*/
RB.Localization.POParser.prototype.symbols = {
    quotes:     /['"]/,
    comments:   /\#/,
    whitespace: /\s/,
    key:        /[\w\-\[\]]/
};
/**
    Lexer for tokenizing the input PO file into a stream of typed tokens
    @private
    @return {Array} Array of typed tokens
*/
RB.Localization.POParser.prototype._lexer = function(){
    var chr,
        escaped = false,
        lex = [],
        node,
        state = this.states.none;

    for (var i = 0, len = this.str.length; i < len; i++) {
        chr = this.str.charAt(i);
        switch (state) {
            case this.states.none:
                if (chr.match(this.symbols.quotes)) {
                    node = {
                        type:  this.types.string,
                        value: '',
                        quote: chr
                    };
                    lex.push(node);
                    state = this.states.string;
                } else if (chr.match(this.symbols.comments)) {
                    node = {
                        type:  this.types.comments,
                        value: ''
                    };
                    lex.push(node);
                    state = this.states.comments;
                } else if (! chr.match(this.symbols.whitespace)) {
                    node = {
                        type:  this.types.key,
                        value: chr
                    };
                    lex.push(node);
                    state = this.states.key;
                }
                break;
            case this.states.comments:
                if (chr === '\n') {
                    state = this.states.none;
                } else if (chr !== '\r') {
                    node.value += chr;
                }
                break;
            case this.states.string:
                if (escaped) {
                    if (chr === 'n') {
                        node.value += '\n';
                    } else if (chr === 'r') {
                        node.value += '\r';
                    } else if (chr === 't') {
                        node.value += '\t';
                    } else {
                        node.value += chr;
                    }
                    escaped = false;
                }else{
                    if (chr === node.quote) {
                        state = this.states.none;
                    } else if (chr === '\\') {
                        escaped = true;
                        break;
                    } else {
                        node.value += chr;
                    }
                    escaped = false;
                }
                break;
            case this.states.key:
                if (! chr.match(this.symbols.key)) {
                    state = this.states.none;
                    i--;
                } else {
                    node.value += chr;
                }
                break;
        }
    }

    return lex;
};
/**
    Parses a PO file and returns an array of
    structured {msgid, msgctxt, msgstr} objects
    @private
    @return {Array} An array of translations
*/
RB.Localization.POParser.prototype.parse = function(){
    var lex = this._lexer(),
        response = [],
        lastNode,
        curContext,
        curComments;

    // join strings and comments
    for (var i = 0, len = lex.length; i < len; i++) {
        if ((lastNode) && (lex[i].type === this.types.string) && (lastNode.type === this.types.string)) {
            lastNode.value += lex[i].value;
        } else if ((lastNode) && (lex[i].type === this.types.comments) && (lastNode.type === this.types.comments)) {
            lastNode.value += '\n' + lex[i].value;
        } else {
            response.push(lex[i]);
            lastNode = lex[i];
        }
    }

    // parse comments
    lex.forEach((function(node){
        var comment, lines;

        if ((node) && (node.type === this.types.comments)) {
            comment = {code: [], comment: [], note: []};
            lines = (node.value || '').split(/\n/);
            lines.forEach(function(line){
                switch (line.charAt(0) || '') {
                    case ':':
                        comment.code.push(line.substr(1).trim());
                        break;
                    case '.':
                        comment.note.push(line.substr(1).replace(/^\s+/, ''));
                        break;
                    default:
                        comment.comment.push(line.replace(/^\s+/, ''));
                }
            });

            node.value = {};

            if (comment.comment.length) {
                node.value.comment = comment.comment.join('\n');
            }

            if (comment.note.length) {
                node.value.note = comment.note.join('\n');
            }

            if (comment.code.length) {
                node.value.code = comment.code.join('\n');
            }
        }
    }).bind(this));

    lex = response;
    response = [];
    lastNode = false;

    // match keys with values
    for (var i = 0, len = lex.length; i < len; i++) {
        if (lex[i].type === this.types.key) {
            lastNode = {
                key: lex[i].value
            };
            if ((i) && (lex[i-1].type === this.types.comments)) {
                lastNode.comments = lex[i-1].value;
            }
            lastNode.value = '';
            response.push(lastNode);
        } else if ((lex[i].type === this.types.string) && (lastNode)) {
            lastNode.value += lex[i].value;
        }
    }

    lex = response;
    response = [];
    lastNode = false;

    // group originals with translations and context
    for (var i = 0, len = lex.length; i < len; i++) {
        if (lex[i].key.toLowerCase() === 'msgctxt') {
            curContext = lex[i].value;
            curComments = lex[i].comments;
        } else if (lex[i].key.toLowerCase() === 'msgid') {
            lastNode = {
                msgid: lex[i].value
            };
            if(curContext){
                lastNode.msgctxt = curContext;
            }
            if(curComments){
                lastNode.comments = curComments;
            }
            if((lex[i].comments) && (! lastNode.comments)) {
                lastNode.comments = lex[i].comments;
            }
            curContext = false;
            curComments = false;
            response.push(lastNode);
        } else if (lex[i].key.substr(0, 6).toLowerCase() === 'msgstr') {
            if (lastNode) {
                lastNode.msgstr = '' + (lastNode.msgstr || []).concat(lex[i].value);
            }
            if ((lex[i].comments) && (! lastNode.comments)) {
                lastNode.comments = lex[i].comments;
            }
            curContext = false;
            curComments = false;
        }
    }

    return response;
}



