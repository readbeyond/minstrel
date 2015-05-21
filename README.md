# Minstrel 

**Minstrel** is a FLOSS hybrid reading app specifically designed for Audio-eBooks

* Version: 3.0.1
* Date: 2015-05-21
* Developed by: [ReadBeyond][rb]
* Lead Developer: [Alberto Pettarin][ap]
* License: the MIT License (MIT)
* Web Page: [Minstrel][webpage]
* Contact: [minstrel@readbeyond.it](mailto:minstrel@readbeyond.it)

## Installing the App

If you just want to install the app on your phone/tablet,
you can download [**Menestrello**][menestrello],
the official stable release of **Minstrel**
maintained by ReadBeyond, using:

1. [App Store][appstore] (iPhone/iPad)
2. [Google Play][googleplay] (Android devices)
3. [Android APK][apk] (Android devices, manual installation)


## Developing the App

### System Requirements

1. [Android SDK][androidsdk] (Android) and/or [Xcode][xcode] (iOS)
2. [Apache Cordova 5.0.0][cordova]

If you want to build the Android APK from command line,
make sure the Android SDK is in your `$PATH`
so that `cordova` can run it.

### Installation

1. Clone the GitHub repository and enter the `cordova` directory:
    
    ```bash
    $ git clone https://github.com/readbeyond/minstrel.git
    $ cd minstrel/cordova
    ```

2. Create the Cordova project directory:
   
    ```bash
    $ bash create_minstrel.sh
    or
    $ bash create_minstrel.sh android
    $ bash create_minstrel.sh ios
    ```

   The first command will create both versions of the app,
   the last two commands will create only the specified version.

3. Build the Android version:
    
    ```bash
    $ cd minstrel/
    $ bash build.sh
    ```

    will build the app and copy the generated APK into `/tmp/`.

4. Build the iOS version:

    ```bash
    $ open minstrel/platforms/ios/Minstrel.xcodeproj
    ```
    
    will open the generated project in Xcode.


## Documentation

Basically, all you have is
[the official Web page][webpage]
of the project and
the comments in the source code.

Unfortunately, at the moment
we do not have enough resources
for properly documenting this project.
You can help us by 
[sponsoring this project](#supporting).


## Features

* Supported formats: EPUB 2, EPUB 3 (reflowable and pre-paginated), CBZ, ABZ (more can be added easily)
* Multilingual UI: EN, IT, DA, FR, DE, PL, ES, TR
* Import documents from: browser, Download Manager, Notifications, or the file system (Android); Safari and iTunes (iOS)
* Library sorted by: author, title, narrator, duration, language, series, or recently open
* Library titles can be filtered
* Display book metadata
* Reading settings saved per book, and globally customizable defaults
* Night mode, customizable colors, orientation lock, screen brightness
* Several reading fonts, including OpenDyslexic and TestMe fonts for dyslexic people
* Customizable touch zones
* Incremental unzipping of assets
* Nearly complete support for EPUB 3 Media Overlays (aka SMIL or read aloud)
* Tap-text-to-play-it, synchronous highlighting, autoscroll
* Keep playing audio while the app is in background
* Adjustable playback speed with rate-vs-pitch correction (0.5x-2.0x)
* Smart footnotes
* Image zooming
* Support for non linear contents
* Ignore book CSS, user-provided CSS overrules
* Enable/disable Javascript execution
* Presentation mode and image info in CBZ, M3U support in ABZ


## Limitations/Missing Features/TODO List

* Full text search, search in Google/Wikipedia/etc.
* Dictionary/vocabulary building
* Annotations/highlighting/bookmarks
* Asset drawers/extraction, e.g. image collection
* Sharing
* Cloud/personal server integration
* Downloading documents directly inside the app
* User-provided fonts
* UI for allowing the user to modify the book CSS on the fly (and save it)
* OPDS support
* EPUB parsing takes shortcuts here and there
* EPUB rendering should happen in its own `<iframe>` (=> no monkey patching)
* Better pagination, especially in Android
* Progress indicators of some sort
* Support for facing FXL pages
* Support for parallel texts, e.g. via EPUB 3 Multiple Renditions
* Split screens and other panels
* Document metadata page should show TOC/assets preview
* Reading metadata from ID3 tags of MP3 files
* Streaming audio from a remote server
* More robust unzipping, e.g. checking for the required space, etc.
* JS code should be refactored, e.g. using a sane framework
* User-provided localization, e.g. via PO files
* User manual/tutorial
* UI/UX could be drastically improved
* Accessibility testing
* Formal testing


## Supporting and Contributing

### Supporting

Would you like supporting the development of **Minstrel**?

We are open to accept sponsorships to

* fix bugs,
* add new features,
* improve the quality and the performance of the code,
* support other platforms (e.g., Web or Windows Phone),
* acquire devices for testing purposes,
* hire an accessibility expert to make the app accessible,
* hire an UI designer to redesign the app, and
* improve the documentation.

Feel free to [get in touch](mailto:minstrel@readbeyond.it).

### Contributing

If you are able to contribute code directly,
that's great!
Feel free to open a pull request,
we will be glad to have a look at it.

Please make your code consistent with
the existing code base style
and test your contributed code
before opening the pull request.

Create a new branch (e.g., `myfeature`)
for each logically-independent feature
you want to contribute.

Any contribution adding or altering
the JS/native plugin interfaces
must work for both Android and iOS
before the contribution can be merged
into the master branch of the app.
This policy ensures that both platforms
are supported and have the same features
at any given time.
Improvements to the existing native plugins
that do not alter the JS/native interfaces
are not subject to this rule.

**Please note that, by opening a pull request,
you automatically agree to apply
the MIT license
to the code you contribute.**

If you think you found a bug,
please use the
[GitHub issue tracker](https://github.com/readbeyond/minstrel/issues)
to file a bug report.


## Legal Information

### License

**Minstrel** is released under the terms of the MIT License (MIT).
See the [LICENSE](LICENSE) file for details.


### Privacy Policy

We value your privacy as much as we value ours.
ReadBeyond does not collect any data about your eBooks,
reading preferences, or reading statistics.
On Android, the Network connection permission is requested solely
because Minstrel uses a WebView ("in-app browser") to render the eBooks,
however the app does not send data to nor receive data from the Internet,
except for downloading a file when the user selects
"Open with Minstrel" in the browser.


### Font Licenses

#### Amaranth

Copyright © 2011, Gesine Todt (hallo@gesine-todt.de), with Reserved Font Name Amaranth. This Font Software is licensed under the SIL Open Font License, Version 1.1.

Web: [http://scripts.sil.org/OFL][sil_ofl_fonts]


#### Andika

Copyright © 2004-2011, SIL International (http://scripts.sil.org), with Reserved Font Names 'Andika' and 'SIL'. This Font Software is licensed under the SIL Open Font License, Version 1.1.

Web: [http://scripts.sil.org/OFL][sil_ofl_fonts]


#### Avería Serif

Copyright © 2011, Dan Sayers (i@iotic.com), with Reserved Font Name Avería Serif. This Font Software is licensed under the SIL Open Font License, Version 1.1.

Web: [http://scripts.sil.org/OFL][sil_ofl_fonts]


#### Charis SIL

This Font Software is Copyright © 1997-2011, SIL International (http://scripts.sil.org/) with Reserved Font Names "Charis" and "SIL". This Font Software is licensed under the SIL Open Font License, Version 1.1.

Web: [http://scripts.sil.org/OFL][sil_ofl_fonts]


#### Font Awesome

Copyright © 2014, Dave Gandy (http://fontawesome.io), with Reserved Font Name Font Awesome. This Font Software is licensed under the SIL Open Font License, Version 1.1.

Web: [http://scripts.sil.org/OFL][sil_ofl_fonts]


#### Gentium

Copyright © 2003-2008, SIL International (http://scripts.sil.org), with Reserved Font Names "Gentium" and "SIL". This Font Software is licensed under the SIL Open Font License, Version 1.1.

Web: [http://scripts.sil.org/OFL][sil_ofl_fonts]


#### EB Garamond

Copyright © 2010, 2011, 2012 Georg Duffner (http://www.georgduffner.at). This Font Software is licensed under the SIL Open Font License, Version 1.1.

Web: [http://scripts.sil.org/OFL][sil_ofl_fonts]


#### OpenDyslexic Font

Copying is an act of love. Please copy. OpenDyslexic(open-dyslexic) by Abelardo Gonzalez is licensed under a Creative Commons Attribution 3.0 Unported License. Based on a work at dyslexicfonts.com.

Web: [http://opendyslexic.org/][open_dyslexic_font]


#### Roboto

Copyright © 2012 Christian Robertson (https://plus.google.com/110879635926653430880/about). This Font Software is licensed under the Apache License, Version 2.0.

Web: [http://www.google.com/fonts/specimen/Roboto][roboto]


#### TestMe

Copyright © 2013 Luciano Perondi (www.synsemia.org|molotro@gmail.com). Derived from Titillium Copyright © 2008-2010, Accademia di Belle Arti di Urbino (www.campivisivi.net|direzione@accademiadiurbino.it), with Reserved Font Name TestMe. This Font Software is licensed under the SIL Open Font License, Version 1.1.

Web: [http://scripts.sil.org/OFL][sil_ofl_fonts]


#### Volkhov

Copyright © 2011, Cyreal (www.cyreal.org), with Reserved Font Name "Volkhov". This Font Software is licensed under the SIL Open Font License, Version 1.1.

Web: [http://scripts.sil.org/OFL][sil_ofl_fonts]


### Third-Party Licenses and Trademarks

#### Apache Cordova

This app has been compiled using `Apache Cordova 5.0.0` by the Apache Software Foundation, released under the terms of the Apache License, Version 2.0.

Web: [http://cordova.apache.org/][cordova]

#### cssbeautify.js

This app includes `cssbeautify.js` code by Ariya Hidayat (Sencha Inc.), released under the terms of the MIT License.

Web: [http://cssbeautify.com/][cssbeautify]

#### EPUB

`EPUB` is a registered trademark of the International Digital Publishing Forum (IDPF).

Web: [http://idpf.org/][epub]

#### Hammer.js

This app includes `Hammer.js` code by Jorik Tangelder, released under the terms of the MIT License.

Web: [https://github.com/EightMedia/hammer.js][hammer]

#### jQuery

This app includes `jQuery 1.9.1` code by the jQuery Foundation, released under the terms of the MIT License.

Web: [https://jquery.org/][jquery]

#### jQuery Mobile

This app includes `jQuery Mobile` code by the jQuery Foundation, released under the terms of the MIT License.

Web: [http://jquerymobile.com/][jquerymobile]

#### nativeDroid

The UI theme is `nativeDroid` by Raphael Wildhaber.

Web: [http://nativedroid.godesign.ch/][nativedroid]
          
#### Objective-Zip

On iOS, this app uses the `Objective-Zip` wrapper for Zlib and MiniZip, released under the terms of the New BSD License.

Web: [https://github.com/flyingdolphinstudio/Objective-Zip][objective_zip]
          
#### Sonic Library 

On Android, this app uses the `Sonic Library` by Bill Cox, released under the terms of the GNU Lesser General Public Licensee 2.1.

Web: [http://dev.vinux-project.org/sonic/][sonic]

#### sprintf.js 

This app includes `sprintf.js` code by Ash Searle, released under the terms of the "This code is unrestricted: you are free to use it however you like." license.




## Acknowledgments

* Antonio Tombolini and the technical staff of Simplicissimus Book Farm provided many useful comments.
* Marta D'Asaro designed the icon.
* Iacopo Balocco suggested embedding the OpenDyslexic font.
* Carlo Fantozzi and Nicola Zago suggested several UI enhancements.
* Several users of the SBF forum provided precious feedback.
* Marco Iannacone suggested embedding the TestMe font.
* Fabrizio Venerandi inspired the EPUB reader options for dealing with non linear spine items.

[rb]: http://www.readbeyond.it/
[ap]: http://www.albertopettarin.it/
[webpage]: http://www.readbeyond.it/minstrel/
[appstore]: https://itunes.apple.com/us/app/menestrello/id771746561
[googleplay]: https://play.google.com/store/apps/details?id=it.readbeyond.menestrello
[menestrello]: http://www.readbeyond.it/menestrello/
[apk]: http://www.readbeyond.it/menestrello/
[androidsdk]: https://developer.android.com/sdk/
[xcode]: https://developer.apple.com/xcode/
[cordova]: http://cordova.apache.org/
[cssbeautify]: http://cssbeautify.com/
[epub]: http://idpf.org/
[hammer]: https://github.com/EightMedia/hammer.js
[jquery]: https://jquery.org/
[jquerymobile]: http://jquerymobile.com/
[nativedroid]: http://nativedroid.godesign.ch/
[objective_zip]: https://github.com/flyingdolphinstudio/Objective-Zip
[open_dyslexic_font]: http://opendyslexic.org/
[roboto]: http://www.google.com/fonts/specimen/Roboto
[sil_ofl_fonts]: http://scripts.sil.org/OFL
[sonic]: http://dev.vinux-project.org/sonic/

