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

/** @namespace RB.Help */
RB.Help = RB.Help || {};

/* constants */
RB.Help.UI                   = {};
RB.Help.UI.colHelpContent4p1 = 'colHelpContent4p1';
RB.Help.UI.colHelpContent5p1 = 'colHelpContent5p1';
RB.Help.UI.colHelpContent6p1 = 'colHelpContent6p1';
RB.Help.UI.colHelpContent7p1 = 'colHelpContent7p1';

/* variables */

/* functions */

// initialize UI
// this method is called BEFORE the page is shown
// do NOT call plugins here
RB.Help.initializeUI = function() {
    // load localization
    RB.UI.loadLocalization();

    // set spinoff information in the help page
    RB.Help.setSpinoffInformation();
};

// initialize page
RB.Help.initializePage = function() {
    // bind events
    RB.Help.bindEvents();

    // dim system bar
    RB.UI.dimSystemBar();
};

// bind events
RB.Help.bindEvents = function() {
    // scroll when collapsible is expanded
    // RB.UI.bindScrollOnCollapsibleExpanded(RB.Help.UI);
};

// set spinoff information in the help page
RB.Help.setSpinoffInformation = function() {
    // add these strings to the help page
    RB.UI.setText('libAppVersion', RB.Config.Minstrel.publicVersion, true);
    RB.UI.setText('libAppBuild',   RB.Config.Minstrel.publicBuild,   true);
    RB.UI.setText('libAppDate',    RB.Config.Minstrel.publicDate,    true);
    if (RB.Config.isSpinoff) {
        // is spinoff
        RB.UI.setText('libAppSpinoffTitle', RB.Config.Spinoff.Help.title, true);
        RB.UI.hide('libAppSpinoffWebContainer');
        RB.UI.hide('libAppSpinoffMailContainer');
        for (var i = 0; i < 5; i++) {
            RB.UI.hide('libAppSpinoffP' + i);
            if (RB.Config.Spinoff.Help['p' + i]) {
                RB.UI.setText('libAppSpinoffP' + i, RB.Config.Spinoff.Help['p' + i], true);
                RB.UI.show('libAppSpinoffP' + i);
            }
        }
        if (RB.Config.Spinoff.Help.web) {
            RB.UI.setText('libAppSpinoffWeb', RB.Config.Spinoff.Help.web, true);
            RB.UI.setAttr('libAppSpinoffWebURL', 'href', RB.Config.Spinoff.Help.webURL);
            RB.UI.show('libAppSpinoffWebContainer');
        }
        if (RB.Config.Spinoff.Help.mail) {
            RB.UI.setText('libAppSpinoffMail', RB.Config.Spinoff.Help.mail, true);
            RB.UI.show('libAppSpinoffMailContainer');
        }
    } else {
        // is not a spinoff
        RB.UI.hide('libAppSpinoff');
    }
};



