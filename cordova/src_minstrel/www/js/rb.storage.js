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

/** @namespace RB.Storage */
RB.Storage = RB.Storage || {};

/*

Storage

Each RB.Storage.Keys.* is stored in the localStorage with its own key.

The complete list of library items is stored in RB.Storage.Keys.LIBRARY_BOOKS
as a dictionary whose indices are the book IDs (e.g., "d1260b62").

Each library item data is stored in a dictionary associated to
RB.Storage.LIBRARY_ITEM_DATA_PREFIX + itemID
(e.g., "app_library_item_data_d1260b62")
This dictionary contains the following keys:

- static:   dictionary containing the same information stored in RB.Storage.Keys.LIBRARY_BOOKS
            for the current item. These should NOT be modified, as they get overwritten by the Librarian.

- library:  dictionary containing information used to display the item in the library.
            - isNew (bool)
            - lastTimeOpened (string)
            - showInLibrary (bool)
            - showStockThumbnailInLibrary (bool)
            - formattedDuration (string)

- metadata: dictionary containing metadata information about the item.
            It has several sub-keys, one for each supported rendition (e.g., an EPUB might have "epub" and "cbz" renditions).
            Each of these sub-keys might contain user-provided information
            and/or metadata computed by plugins (after the item has been discovered by the Librarian).
            - abz
              - parsed (dict)
              - tracks (array of dicts, each being { href: (string), title: (string), duration: (int) })
            - cbz
              - images (array of dicts, each being { href: (string), title: (string), duration: (int) })
              - parsed (dict)
            - epub
              - parsed (dict)
              - TBD

- position: dictionary containing information about the last rendered position within the publication.
            It has several sub-keys, one for each supported rendition, as for metadata.
            Each of these sub-keys contains the relevant information.
            - abz
              - seekTo (int)
              - track  (int)
            - cbz
              - image  (int)
            - epub
              - assetHref (string)
              - assetAnchor (string)
              - moID (string)
              - pagination (string)
              - currentpage (int)
              - currentscroll (int)

- settings: dictionary containing information about the rendering of the item.
            It has several sub-keys, one for each supported rendition, as for metadata.
            - epub
              - TBD
*/

// to access data for a library item, you need to concatenate
// LIBRARY_ITEM_DATA_PREFIX with its ID
// e.g.: RB.Storage.get(RB.Storage.LIBRARY_ITEM_DATA_PREFIX + itemID)
RB.Storage.LIBRARY_ITEM_DATA_PREFIX                     = 'app_library_item_data_';

// keys
// app
RB.Storage.Keys = {};
RB.Storage.Keys.MINSTREL_VERSION                        = 'app_minstrel_version_key';
RB.Storage.Keys.PLATFORM                                = 'app_platform_key';
RB.Storage.Keys.FILE_SEPARATOR                          = 'app_file_separator_key';
RB.Storage.Keys.EXTERNAL_STORAGE                        = 'app_external_storage_key';
RB.Storage.Keys.IOS_DOCUMENTS_DIRECTORY                 = 'app_ios_documents_directory_key';
RB.Storage.Keys.IOS_CACHE_DIRECTORY                     = 'app_ios_cache_directory_key';
RB.Storage.Keys.STORAGE_ROOTS                           = 'app_storage_roots_key';
RB.Storage.Keys.SCAN_DIR                                = 'app_scan_dir_key';
RB.Storage.Keys.SCAN_DIRECTORIES                        = 'app_scan_directories_key';
RB.Storage.Keys.SCAN_DIRECTORIES_CHANGED                = 'app_scan_directories_changed_key';
RB.Storage.Keys.UI_LANGUAGE                             = 'app_language_key';
RB.Storage.Keys.UI_NIGHT_MODE                           = 'app_ui_night_mode_key';
RB.Storage.Keys.UI_FONT                                 = 'app_ui_font_key';
RB.Storage.Keys.UI_ORIENTATION                          = 'app_ui_orientation_key';
RB.Storage.Keys.UI_ANIMATED_MENU                        = 'app_ui_animated_menu_key';
RB.Storage.Keys.UI_ENABLE_BRIGHTNESS                    = 'app_ui_enable_brightness_key';
RB.Storage.Keys.UI_BRIGHTNESS                           = 'app_ui_brightness_key';
RB.Storage.Keys.PLUGINS_LOADED                          = 'app_plugins_loaded_key';
RB.Storage.Keys.PLUGINS_LOADED_CHANGED                  = 'app_plugins_loaded_changed_key';
RB.Storage.Keys.MEDIAPLAYER_MODE                        = 'app_mediaplayer_mode_key';
RB.Storage.Keys.MEDIAPLAYER_ENABLE_PLAYBACK_SPEED       = 'app_reader_enable_playback_speed_key';
RB.Storage.Keys.OPEN_URLS_IN_SYSTEM_BROWSER             = 'app_open_urls_in_system_browser_key';

// library
RB.Storage.Keys.LIBRARY_BOOKS                           = 'app_library_books_key';
RB.Storage.Keys.LIBRARY_SHOW_HIDDEN_BOOKS               = 'app_library_show_hidden_books_key';
RB.Storage.Keys.LIBRARY_OPEN_NEW_BOOK                   = 'app_library_open_new_book_key';
RB.Storage.Keys.LIBRARY_SORT                            = 'app_library_sort_key';
RB.Storage.Keys.LIBRARY_INVERT_SORT                     = 'app_library_invert_sort_key';
RB.Storage.Keys.LIBRARY_HIDE_BOOKS_ON_SORT              = 'app_library_hide_books_on_sort_key';
RB.Storage.Keys.LIBRARY_CACHE_METADATA                  = 'app_library_cache_metadata_key';

// used to communicate from library to preview/reader
RB.Storage.Keys.OPEN_ITEM_FILE_PATH                     = 'app_open_item_file_path_key';
RB.Storage.Keys.OPEN_ITEM_ID                            = 'app_open_item_id_key';

// EPUB reader
RB.Storage.Keys.EPUB_ENABLE_READBEYOND_HACKS            = 'app_epub_enable_readbeyond_hacks_key';
RB.Storage.Keys.EPUB_UNZIP_ALL                          = 'app_epub_unzip_all_key';
RB.Storage.Keys.EPUB_SHOW_HEADER                        = 'app_epub_show_header_key';
RB.Storage.Keys.EPUB_SHOW_NAVBAR                        = 'app_reader_show_bottom_bar_key';
RB.Storage.Keys.EPUB_SHOW_SLIDER                        = 'app_reader_show_slider_key';
RB.Storage.Keys.EPUB_SHOW_QUICKBAR                      = 'app_epub_show_quickbar_key';
RB.Storage.Keys.EPUB_FONT_FAMILY                        = 'app_reader_font_family_key';
RB.Storage.Keys.EPUB_FONT_SIZE                          = 'app_reader_font_size_key';
RB.Storage.Keys.EPUB_TEXT_TRANSFORM                     = 'app_reader_text_transform_key';
RB.Storage.Keys.EPUB_TEXT_ALIGN                         = 'app_reader_text_align_key';
RB.Storage.Keys.EPUB_LINE_SPACING_FACTOR                = 'app_reader_line_spacing_factor_key';
RB.Storage.Keys.EPUB_LEFT_MARGIN_SIZE                   = 'app_reader_left_margin_size_key';
RB.Storage.Keys.EPUB_RIGHT_MARGIN_SIZE                  = 'app_reader_right_margin_size_key';
RB.Storage.Keys.EPUB_CONTENT_BACKGROUND_COLOR           = 'app_reader_content_background_color_key';
RB.Storage.Keys.EPUB_CONTENT_FONT_COLOR                 = 'app_reader_content_font_color_key';
RB.Storage.Keys.EPUB_APPLY_HIGHLIGHT                    = 'app_reader_apply_highlight_key';
RB.Storage.Keys.EPUB_HIGHLIGHT_STYLE                    = 'app_reader_highlight_style_key';
RB.Storage.Keys.EPUB_AUTO_SCROLL                        = 'app_reader_auto_scroll_key';
RB.Storage.Keys.EPUB_TAP_TO_PLAY                        = 'app_reader_tap_to_play_key';
RB.Storage.Keys.EPUB_PLAYBACK_SPEED                     = 'app_reader_playback_speed_key';
RB.Storage.Keys.EPUB_PLAYBACK_VOLUME                    = 'app_reader_playback_volume_key';
RB.Storage.Keys.EPUB_PAGINATE_REFLOWABLE                = 'app_epub_paginate_reflowable_key';
RB.Storage.Keys.EPUB_APPLY_TYPO                         = 'app_reader_apply_typo_key';
RB.Storage.Keys.EPUB_RUN_JAVASCRIPT                     = 'app_reader_run_javascript_key';
RB.Storage.Keys.EPUB_STRIP_CSS                          = 'app_reader_strip_css_key';
RB.Storage.Keys.EPUB_INJECT_CUSTOM_CSS                  = 'app_reader_inject_custom_css_key';
RB.Storage.Keys.EPUB_CLOSE_TOC_IMMEDIATELY              = 'app_epub_close_toc_immediately_key';
RB.Storage.Keys.EPUB_CLOSE_PLAYLIST_IMMEDIATELY         = 'app_epub_close_playlist_immediately_key';
RB.Storage.Keys.EPUB_INVERT_SWIPE                       = 'app_epub_invert_swipe_key';
RB.Storage.Keys.EPUB_SCROLL_TO_TOP_ON_PREVIOUS_CHAPTER  = 'app_epub_scroll_to_top_on_previous_chapter_key';
RB.Storage.Keys.EPUB_SWIPE_GESTURE                      = 'app_reader_swipe_gesture_key';
RB.Storage.Keys.EPUB_BORDER_GESTURE                     = 'app_reader_border_gesture_key';
RB.Storage.Keys.EPUB_DOUBLE_TAP_GESTURE                 = 'app_reader_double_tap_gesture_key';
RB.Storage.Keys.EPUB_TWO_FINGERS_TAP_GESTURE            = 'app_reader_two_fingers_gesture_key';
RB.Storage.Keys.EPUB_BACKGROUND_AUDIO                   = 'app_reader_keep_playing_on_app_paused_key';
RB.Storage.Keys.EPUB_SMART_PLAY                         = 'app_reader_smart_play_key';
RB.Storage.Keys.EPUB_PRELOAD_PREV_NEXT                  = 'app_epub_preload_prev_next_key';
RB.Storage.Keys.EPUB_SHOW_WARNING_ON_NOT_AUDIOEBOOK     = 'app_reader_show_notice_popup_key';
RB.Storage.Keys.EPUB_SHOW_FIRST_TIME_POPUP              = 'app_reader_show_ftp_popup_key';
RB.Storage.Keys.EPUB_CONFIRM_QUIT                       = 'app_reader_confirm_quit_key';
RB.Storage.Keys.EPUB_OPEN_FIRST_CHAPTER_WITH_AUDIO      = 'app_reader_override_initial_page_key';
RB.Storage.Keys.EPUB_WAIT_BEFORE_TURNING_CHAPTER        = 'app_reader_wait_before_turning_chapter_key';
RB.Storage.Keys.EPUB_ENABLE_TRANSLATION_LINKS           = 'app_reader_enable_translation_links_key';
RB.Storage.Keys.EPUB_ENABLE_FOOTNOTE_LINKS              = 'app_reader_enable_footnote_links_key';
RB.Storage.Keys.EPUB_PAUSE_ON_EXTRA                     = 'app_reader_pause_on_extra_key';
RB.Storage.Keys.EPUB_ADD_LINK_EXTRA                     = 'app_reader_add_link_extra_key';
RB.Storage.Keys.EPUB_NOTE_LINK_DETECTION                = 'app_epub_note_link_detection_key';
RB.Storage.Keys.EPUB_HIGHLIGHT_NOTE_LINK_TARGET         = 'app_epub_highlight_note_link_target_key';
RB.Storage.Keys.EPUB_SKIP_NON_LINEAR                    = 'app_epub_skip_non_linear_key';
RB.Storage.Keys.EPUB_TREAT_NON_LINEAR_AS_CUL_DE_SAC     = 'app_epub_treat_non_linear_as_cul_de_sac_key';
RB.Storage.Keys.EPUB_ALLOW_FXL                          = 'app_epub_allow_fxl_key';
RB.Storage.Keys.EPUB_ACTION_ZONES_ENABLED               = 'app_epub_action_zones_enabled_key';
RB.Storage.Keys.EPUB_ACTION_ZONE_0                      = 'app_epub_action_zone_0_key';
RB.Storage.Keys.EPUB_ACTION_ZONE_1                      = 'app_epub_action_zone_1_key';
RB.Storage.Keys.EPUB_ACTION_ZONE_2                      = 'app_epub_action_zone_2_key';
RB.Storage.Keys.EPUB_ACTION_ZONE_3                      = 'app_epub_action_zone_3_key';
RB.Storage.Keys.EPUB_ACTION_ZONE_4                      = 'app_epub_action_zone_4_key';
RB.Storage.Keys.EPUB_ACTION_ZONE_5                      = 'app_epub_action_zone_5_key';
RB.Storage.Keys.EPUB_ACTION_ZONE_6                      = 'app_epub_action_zone_6_key';
RB.Storage.Keys.EPUB_ACTION_ZONE_7                      = 'app_epub_action_zone_7_key';
RB.Storage.Keys.EPUB_ACTION_ZONE_8                      = 'app_epub_action_zone_8_key';
RB.Storage.Keys.EPUB_SCROLL_AMOUNT                      = 'app_scroll_amount_key';
RB.Storage.Keys.EPUB_ANIMATED_SCROLL                    = 'app_animated_scroll_key';

// ABZ
RB.Storage.Keys.ABZ_WRAP_AROUND                         = 'app_abz_wrap_around_key';
RB.Storage.Keys.ABZ_AUTO_START_AUDIO                    = 'app_abz_auto_start_audio_key';
RB.Storage.Keys.ABZ_USE_PLAYLIST                        = 'app_abz_use_playlist_key';
RB.Storage.Keys.ABZ_BACKGROUND_AUDIO                    = 'app_abz_background_audio_key';
RB.Storage.Keys.ABZ_SHOW_LARGE_COVER                    = 'app_abz_show_large_cover_key';
RB.Storage.Keys.ABZ_SHOW_TRACK_NUMBER                   = 'app_abz_show_track_number_key';
RB.Storage.Keys.ABZ_PRELOAD_PREV_NEXT                   = 'app_abz_preload_prev_next_key';
RB.Storage.Keys.ABZ_UNZIP_ALL                           = 'app_abz_unzip_all_key';
RB.Storage.Keys.ABZ_PLAYBACK_SPEED                      = 'app_abz_playback_speed_key';
RB.Storage.Keys.ABZ_PLAYBACK_VOLUME                     = 'app_abz_playback_volume_key';

// CBZ
RB.Storage.Keys.CBZ_EXTRACT_COVER                       = 'app_cbz_extract_cover_key';
RB.Storage.Keys.CBZ_BACKGROUND_COLOR                    = 'app_cbz_background_color_key';
RB.Storage.Keys.CBZ_INFO_COLOR                          = 'app_cbz_info_color_key';
RB.Storage.Keys.CBZ_AUTOHIDE_MENU                       = 'app_cbz_autohide_menu_key';
RB.Storage.Keys.CBZ_AUTOHIDE_MENU_DURATION              = 'app_cbz_autohide_menu_duration_key';
RB.Storage.Keys.CBZ_DEFAULT_ZOOM_MODE                   = 'app_cbz_default_zoom_mode_key';
RB.Storage.Keys.CBZ_WRAP_AROUND                         = 'app_cbz_wrap_around_key';
RB.Storage.Keys.CBZ_BORDER                              = 'app_cbz_border_key';
RB.Storage.Keys.CBZ_SLIDESHOW_TIMER                     = 'app_cbz_slideshow_timer_key';
RB.Storage.Keys.CBZ_RESET_SCALE_ON_IMAGE_CHANGE         = 'app_cbz_reset_image_on_image_change_key';
RB.Storage.Keys.CBZ_LOCK_SCROLL_ON_FIT_OTHER            = 'app_cbz_lock_scroll_on_fit_other_key';
RB.Storage.Keys.CBZ_SNAP_TO_BORDER                      = 'app_cbz_snap_to_border_key';
RB.Storage.Keys.CBZ_SHOW_INFO                           = 'app_cbz_show_info_key';
RB.Storage.Keys.CBZ_PERSISTENT_INFO                     = 'app_cbz_persistent_info_key';
RB.Storage.Keys.CBZ_COMICS_MODE                         = 'app_cbz_comics_mode_key';
RB.Storage.Keys.CBZ_INVERT_SWIPE                        = 'app_cbz_invert_swipe_key';
RB.Storage.Keys.CBZ_PRELOAD_PREV_NEXT                   = 'app_cbz_preload_prev_next_key';
RB.Storage.Keys.CBZ_UNZIP_ALL                           = 'app_cbz_unzip_all_key';
RB.Storage.Keys.CBZ_ACTION_ZONE_0                       = 'app_cbz_action_zone_0_key';
RB.Storage.Keys.CBZ_ACTION_ZONE_1                       = 'app_cbz_action_zone_1_key';
RB.Storage.Keys.CBZ_ACTION_ZONE_2                       = 'app_cbz_action_zone_2_key';
RB.Storage.Keys.CBZ_ACTION_ZONE_3                       = 'app_cbz_action_zone_3_key';
RB.Storage.Keys.CBZ_ACTION_ZONE_4                       = 'app_cbz_action_zone_4_key';
RB.Storage.Keys.CBZ_ACTION_ZONE_5                       = 'app_cbz_action_zone_5_key';
RB.Storage.Keys.CBZ_ACTION_ZONE_6                       = 'app_cbz_action_zone_6_key';
RB.Storage.Keys.CBZ_ACTION_ZONE_7                       = 'app_cbz_action_zone_7_key';
RB.Storage.Keys.CBZ_ACTION_ZONE_8                       = 'app_cbz_action_zone_8_key';

// store into window.localStorage
RB.Storage.storage = window.localStorage;

// get value from key
RB.Storage.get = function(key) {
    return RB.Storage.storage.getItem(key);
};
RB.Storage.getArray = function(key) {
    var ret = [];
    var v = RB.Storage.storage.getItem(key);
    if (v) {
        if ((v.indexOf('[') === 0)) {
            ret = JSON.parse(v);
        } else {
            ret = [ v ];
        }
    }
    return ret;
};
RB.Storage.getDictionary = function(key) {
    var ret = {};
    var v = RB.Storage.storage.getItem(key);
    if (v) {
        if ((v.indexOf('{') === 0)) {
            ret = JSON.parse(v);
        }
    }
    return ret;
};

// set value for key
RB.Storage.set = function(key, value) {
    RB.Storage.storage.setItem(key, value);
    return value;
};
RB.Storage.setArray = function(key, value) {
    var v = JSON.stringify(value);
    RB.Storage.storage.setItem(key, v);
    return v;
};
RB.Storage.setDictionary = function(key, value) {
    var v = JSON.stringify(value);
    RB.Storage.storage.setItem(key, v);
    return v;
};

// flip boolean value for key
RB.Storage.flip = function(key) {
    var new_value = !RB.Storage.isAppParameterTrue(key);
    RB.Storage.storage.setItem(key, new_value);
    return new_value;
};

// delete key
RB.Storage.deleteKey = function(key) {
    delete RB.Storage.storage[key];
};
// clear entire storage
RB.Storage.clear = function() {
    RB.Storage.storage.clear();
};



// generic switchers
// switch and save
RB.Storage.switchAndSaveParameter = function(arr, key, increment, circular) {
    // NOTE side-effects if refactored with switchParameter ???
    var index = arr.indexOf(RB.Storage.get(key));
    var next_index = (index + increment);
    if (circular) {
        next_index = (arr.length + next_index) % arr.length;
    } else {
        if (next_index >= arr.length) {
            next_index = arr.length - 1;
        }
        if (next_index < 0) {
            next_index = 0;
        }
    }
    RB.Storage.set(key, arr[next_index]);
};

// only switch
RB.Storage.switchParameter = function(arr, value, increment, circular) {
    var index = arr.indexOf(value);
    var next_index = (index + increment);
    if (circular) {
        next_index = (arr.length + next_index) % arr.length;
    } else {
        if (next_index >= arr.length) {
            next_index = arr.length - 1;
        }
        if (next_index < 0) {
            next_index = 0;
        }
    }
    return arr[next_index];
};

// determines whether the given JSON string
// is null or 'null'
RB.Storage.isJSONStringNull = function(str) {
    return ((str == null) || (str === 'null'));
};

// determines whether the given JSON string
// is true or 'true'
RB.Storage.isJSONStringTrue = function(str) {
    return (str === true) || (str === 'true');
};

// determine whether the given app parameter is true
RB.Storage.isAppParameterTrue = function(param) {
    return RB.Storage.isJSONStringTrue(RB.Storage.get(param));
};




