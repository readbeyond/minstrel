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

// based on the source code of the official Cordova Media plugin
// available under the Apache License Version 2.0 License
// https://github.com/apache/cordova-plugin-media

package it.readbeyond.minstrel.mediarb;

import java.io.FileDescriptor;
import java.io.IOException;

import android.media.MediaPlayer.OnCompletionListener;
import android.media.MediaPlayer.OnErrorListener;
import android.media.MediaPlayer.OnPreparedListener;
import android.media.MediaPlayer.OnSeekCompleteListener;

public class MediaPlayer {

	private boolean mUseMediaPlayerRB;
	private android.media.MediaPlayer mpAndroid;
	private it.readbeyond.minstrel.mediarb.MediaPlayerRB mpRB;

	// default constructor: let the platform decide
	public MediaPlayer(String mode) {
		if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.JELLY_BEAN) {
			mUseMediaPlayerRB = true;
			mpRB = new it.readbeyond.minstrel.mediarb.MediaPlayerRB(mode);
		} else {
			mUseMediaPlayerRB = false;
			mpAndroid = new android.media.MediaPlayer();
		}
	}

    /*
	// custom constructor: let the user explicitly decide
	public MediaPlayer(boolean useMediaPlayerRB) {
		this();
		mUseMediaPlayerRB = useMediaPlayerRB;
		if (mUseMediaPlayerRB) {
			mpRB = new it.readbeyond.minstrel.mediarb.MediaPlayerRB();
		} else {
			mpAndroid = new android.media.MediaPlayer();
		}
	}
    */

	public boolean isUsingMediaPlayerRB() {
		return mUseMediaPlayerRB;
	}

	// BEGIN MediaPlayerRB-only methods
	public void setPlaybackSpeed(float speed) {
		if (mUseMediaPlayerRB) {
			mpRB.setPlaybackSpeed(speed);
		}
	}

	public void setPlaybackPitch(float pitch) {
		if (mUseMediaPlayerRB) {
			mpRB.setPlaybackPitch(pitch);
		}
	}

	public float getPlaybackSpeed() {
		if (mUseMediaPlayerRB) {
			return mpRB.getPlaybackSpeed();
		}
		return 1.0f;
	}

	public float getPlaybackPitch() {
		if (mUseMediaPlayerRB) {
			return mpRB.getPlaybackPitch();
		}
		return 1.0f;
	}

	public int getNumberChannels() {
		if (mUseMediaPlayerRB) {
			return mpRB.getNumberChannels();
		}
		return -1;
	}

	public int getSampleRate() {
		if (mUseMediaPlayerRB) {
			return mpRB.getSampleRate();
		}
		return -1;
	}

	public int getState() {
		if (mUseMediaPlayerRB) {
			return mpRB.getState();
		}
		return -1;
	}
	// END MediaPlayerRB-only methods

	public boolean isPlaying() {
		if (mUseMediaPlayerRB) {
			return mpRB.isPlaying();
		}
		return mpAndroid.isPlaying();
	}

	public int getCurrentPosition() {
		if (mUseMediaPlayerRB) {
			return mpRB.getCurrentPosition();
		}
		return mpAndroid.getCurrentPosition();
	}

	public int getDuration() {
		if (mUseMediaPlayerRB) {
			return mpRB.getDuration();
		}
		return mpAndroid.getDuration();
	}

	public void pause() {
		if (mUseMediaPlayerRB) {
			mpRB.pause();
		} else {
			mpAndroid.pause();
		}
	}

	public void prepare() throws IOException {
		if (mUseMediaPlayerRB) {
			mpRB.prepare();
		} else {
			mpAndroid.prepare();
		}
	}

	public void prepareAsync() {
		if (mUseMediaPlayerRB) {
			mpRB.prepareAsync();
		} else {
			mpAndroid.prepareAsync();
		}
	}

	public void release() {
		if (mUseMediaPlayerRB) {
			mpRB.release();
		} else {
			mpAndroid.release();
		}
	}

	public void reset() {
		if (mUseMediaPlayerRB) {
			mpRB.reset();
		} else {
			mpAndroid.reset();
		}
	}

	public void seekTo(int milliseconds) {
		if (mUseMediaPlayerRB) {
			mpRB.seekTo(milliseconds);
		} else {
			mpAndroid.seekTo(milliseconds);
		}
	}

	public void setAudioStreamType(int ast) {
		if (mUseMediaPlayerRB) {
			// nop method in MediaPlayerRB
			mpRB.setAudioStreamType(ast);
		} else {
			mpAndroid.setAudioStreamType(ast);
		}
	}

	public void setDataSource(String path) throws IOException {
		if (mUseMediaPlayerRB) {
			mpRB.setDataSource(path);
		} else {
			mpAndroid.setDataSource(path);
		}
	}

	public void setDataSource(FileDescriptor fd) throws IOException, IllegalArgumentException, IllegalStateException {
		if (mUseMediaPlayerRB) {
			mpRB.setDataSource(fd);
		} else {
			mpAndroid.setDataSource(fd);
		}
	}

	public void setDataSource(FileDescriptor fd, long offset, long length) throws IOException, IllegalArgumentException, IllegalStateException {
		if (mUseMediaPlayerRB) {
			mpRB.setDataSource(fd, offset, length);
		} else {
			mpAndroid.setDataSource(fd, offset, length);
		}
	}

	public void setOnCompletionListener(OnCompletionListener listener) {
		if (mUseMediaPlayerRB) {
			mpRB.setOnCompletionListener(listener);
		} else {
			mpAndroid.setOnCompletionListener(listener);
		}
	}

	public void setOnPreparedListener(OnPreparedListener listener) {
		if (mUseMediaPlayerRB) {
			mpRB.setOnPreparedListener(listener);
		} else {
			mpAndroid.setOnPreparedListener(listener);
		}
	}

	public void setOnSeekCompleteListener(OnSeekCompleteListener listener) {
		if (mUseMediaPlayerRB) {
			mpRB.setOnSeekCompleteListener(listener);
		} else {
			mpAndroid.setOnSeekCompleteListener(listener);
		}
	}

	public void setOnErrorListener(OnErrorListener listener) {
		if (mUseMediaPlayerRB) {
			mpRB.setOnErrorListener(listener);
		} else {
			mpAndroid.setOnErrorListener(listener);
		}
	}

	public void setVolume(float left, float right) {
		if (mUseMediaPlayerRB) {
			mpRB.setVolume(left, right);
		} else {
			mpAndroid.setVolume(left, right);
		}
	}

	public void start() {
		if (mUseMediaPlayerRB) {
			mpRB.start();
		} else {
			mpAndroid.start();
		}
	}

	public void stop() {
		if (mUseMediaPlayerRB) {
			mpRB.stop();
		} else {
			mpAndroid.stop();
		}
	}


}
