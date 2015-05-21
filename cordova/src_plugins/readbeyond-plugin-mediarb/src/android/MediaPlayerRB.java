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

// IMPORTANT: this code requires API LEVEL 16 (Android 4.1, JellyBean)
//
// This code has been modified from Prestissimo by James Falcon:
//
// https://github.com/TheRealFalcon/Prestissimo
//
//Copyright 2012 James Falcon
//
//Licensed under the Apache License, Version 2.0 (the "License");
//you may not use this file except in compliance with the License.
//You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
//Unless required by applicable law or agreed to in writing, software
//distributed under the License is distributed on an "AS IS" BASIS,
//WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//See the License for the specific language governing permissions and
//limitations under the License.
//
// and the stock Android MediaPlayer class:
//
// https://github.com/android/platform_frameworks_base/blob/gingerbread/media/java/android/media/MediaPlayer.java
//
// This code uses the Sonic native library:
//
// https://github.com/waywardgeek/sonic-ndk
//
// which is released under the terms of the GNU LESSER GENERAL PUBLIC LICENSE 2.1
// (see libs/COPYING)

package it.readbeyond.minstrel.mediarb;

import org.vinuxproject.sonic.Sonic;

import java.io.IOException;
import java.io.FileDescriptor;
import java.nio.ByteBuffer;
import java.util.concurrent.locks.ReentrantLock;
import android.annotation.TargetApi;
import android.media.AudioFormat;
import android.media.AudioManager;
import android.media.AudioTrack;
import android.media.MediaCodec;
import android.media.MediaExtractor;
import android.media.MediaFormat;
import android.media.MediaPlayer.OnCompletionListener;
import android.media.MediaPlayer.OnErrorListener;
import android.media.MediaPlayer.OnPreparedListener;
import android.media.MediaPlayer.OnSeekCompleteListener;
import android.os.Build;
import android.os.Handler;
import android.os.Looper;
import android.os.Message;
import android.util.Log;

@TargetApi(Build.VERSION_CODES.JELLY_BEAN)
public class MediaPlayerRB {
	private AudioTrack mTrack;
	private Sonic mSonic;
	private MediaExtractor mExtractor;
	private MediaCodec mCodec;
	private Thread mDecoderThread;
	private String mSourcePath;
	private FileDescriptor mSourceFD;
	private long mSourceFDOffset;
	private long mSourceFDLength;
	private final ReentrantLock mLock;
	private final Object mDecoderLock;
	private boolean mContinue;
	private boolean mIsDecoding;
	private long mDuration;
	private float mSpeed;
	private float mPitch;
	private int mState;
	private int mNumberChannels;
	private int mSampleRate;
	protected OnCompletionListener mOnCompletionListener;
	protected OnErrorListener mOnErrorListener;
	protected OnPreparedListener mOnPreparedListener;
	protected OnSeekCompleteListener mOnSeekCompleteListener;
	private EventHandler mEventHandler;

    private String mMode;
    private boolean mUpdate;

	private final static int TRACK_NUM = 0;
	private final static String TAG_MP = "it.readbeyond.minstrel.mediarb";

	private final static int STATE_IDLE = 0;
	private final static int STATE_INITIALIZED = 1;
	private final static int STATE_PREPARING = 2;
	private final static int STATE_PREPARED = 3;
	private final static int STATE_STARTED = 4;
	private final static int STATE_PAUSED = 5;
	private final static int STATE_STOPPED = 6;
	private final static int STATE_PLAYBACK_COMPLETED = 7;
	private final static int STATE_END = 8;
	private final static int STATE_ERROR = 9;

	// NOT USED private static final int MEDIA_NOP = 0;
	private static final int MEDIA_PREPARED = 1;
	private static final int MEDIA_PLAYBACK_COMPLETE = 2;
	// NOT USED private static final int MEDIA_BUFFERING_UPDATE = 3;
	private static final int MEDIA_SEEK_COMPLETE = 4;
	// NOT USED private static final int MEDIA_SET_VIDEO_SIZE = 5;
	private static final int MEDIA_ERROR = 100;

	// NOT USED private static final int MEDIA_INFO = 200;

	// Not available in API 16
	// NOT USED private final static int MEDIA_ERROR_MALFORMED = 0xfffffc11;
	// NOT USED private final static int MEDIA_ERROR_IO = 0xfffffc14;

	public MediaPlayerRB(String mode) {
		mMode = mode;
        mUpdate = mMode.equals("mode2");
        mState = STATE_IDLE;
		mSpeed = (float) 1.0;
		mPitch = (float) 1.0;
		mContinue = false;
		mIsDecoding = false;
		mSourcePath = null;
		mSourceFD = null;
		mSourceFDOffset = -1;
		mSourceFDLength = -1;
		mLock = new ReentrantLock();
		mDecoderLock = new Object();
		mOnCompletionListener = null;
		mOnErrorListener = null;
		mOnPreparedListener = null;
		mOnSeekCompleteListener = null;
		mNumberChannels = -1;
		mSampleRate = -1;

		Looper looper;
		if ((looper = Looper.myLooper()) != null) {
			mEventHandler = new EventHandler(looper);
		} else if ((looper = Looper.getMainLooper()) != null) {
			mEventHandler = new EventHandler(looper);
		} else {
			mEventHandler = null;
		}
	}

	// return current state of the MP
	public int getState() {
		return mState;
	}

	// return current position in ms
	public int getCurrentPosition() {
		switch (mState) {
		case STATE_ERROR:
			error();
			break;
		default:
			return (int) (mExtractor.getSampleTime() / 1000);
		}
		return 0;
	}

	public float getPlaybackSpeed() {
		return mSpeed;
	}

	public float getPlaybackPitch() {
		return mPitch;
	}

	// return duration in ms
	// call only after a prepare() or prepareAsync()
	public int getDuration() {
		switch (mState) {
		case STATE_INITIALIZED:
		case STATE_IDLE:
		case STATE_ERROR:
			error();
			break;
		default:
			return (int) (mDuration / 1000);
		}
		return 0;
	}

	// return 1 (Mono) or 2 (Stereo)
	public int getNumberChannels() {
		return mNumberChannels;
	}

	// return sample rate (e.g., 44100 for 44.1KHz)
	public int getSampleRate() {
		return mSampleRate;
	}

	// return true if MP is playing, false otherwise
	// raise error if MP is in STATE_ERROR
	public boolean isPlaying() {
		switch (mState) {
		case STATE_ERROR:
			error();
			break;
		default:
			return (mState == STATE_STARTED);
		}
		return false;
	}

	public void pause() {
		switch (mState) {
		case STATE_STARTED:
		case STATE_PAUSED:
			mTrack.pause();
			mState = STATE_PAUSED;
			Log.d(TAG_MP, "State changed to STATE_PAUSED");
			break;
		default:
			error();
		}
	}

	public void prepare() {
		switch (mState) {
		case STATE_INITIALIZED:
		case STATE_STOPPED:
			try {
				initStream();
			} catch (IOException e) {
				Log.e(TAG_MP, "Failed setting data source!", e);
				error();
				return;
			}
			mState = STATE_PREPARED;
			Log.d(TAG_MP, "State changed to STATE_PREPARED");

			try {
				Message m = new Message();
				m.what = MEDIA_PREPARED;
				mEventHandler.sendMessage(m);
			} catch (Exception e) {
				// Binder should handle our death
				Log.e(TAG_MP, "RemoteException calling onPrepared after prepare", e);
			}
			break;
		default:
			error();
		}
	}

	public void prepareAsync() {
		switch (mState) {
		case STATE_INITIALIZED:
		case STATE_STOPPED:
			mState = STATE_PREPARING;
			Log.d(TAG_MP, "State changed to STATE_PREPARING");

			Thread t = new Thread(new Runnable() {

				@Override
				public void run() {
					try {
						initStream();
					} catch (IOException e) {
						Log.e(TAG_MP, "Failed setting data source!", e);
						error();
						return;
					}
					if (mState != STATE_ERROR) {
						mState = STATE_PREPARED;
						Log.d(TAG_MP, "State changed to STATE_PREPARED");
					}
					try {
						Message m = new Message();
						m.what = MEDIA_PREPARED;
						mEventHandler.sendMessage(m);
					} catch (Exception e) {
						// Binder should handle our death
						Log.e(TAG_MP, "RemoteException trying to call onPrepared after prepareAsync", e);
					}
				}
			});
			t.setDaemon(true);
			t.start();

			break;
		default:
			error();
		}
	}

	public void stop() {
		switch (mState) {
		case STATE_PREPARED:
		case STATE_STARTED:
		case STATE_STOPPED:
		case STATE_PAUSED:
		case STATE_PLAYBACK_COMPLETED:
			mState = STATE_STOPPED;
			Log.d(TAG_MP, "State changed to STATE_STOPPED");
			mContinue = false;
			mTrack.pause();
			mTrack.flush();
			break;
		default:
			error();
		}
	}

	public void start() {
		switch (mState) {
		case STATE_PREPARED:
		case STATE_PLAYBACK_COMPLETED:
			mState = STATE_STARTED;
			Log.d(TAG_MP, "State changed to STATE_STARTED");
			mContinue = true;
			mTrack.play();
			decode();
		case STATE_STARTED:
			break;
		case STATE_PAUSED:
			mState = STATE_STARTED;
			Log.d(TAG_MP, "State changed to STATE_STARTED");
			synchronized (mDecoderLock) {
				mDecoderLock.notify();
			}
			mTrack.play();
			break;
		default:
			mState = STATE_ERROR;
			Log.d(TAG_MP, "State changed to STATE_ERROR in start");
			if (mTrack != null) {
				error();
			} else {
				Log.d("start", "Attempting to start while in idle after construction.  Not allowed by no callbacks called");
			}
		}
	}

	public void release() {
		reset();
		mOnCompletionListener = null;
		mOnErrorListener = null;
		mOnPreparedListener = null;
		mOnSeekCompleteListener = null;
		mState = STATE_END;
	}

	public void reset() {
		mLock.lock();
		mContinue = false;
		try {
			if (mDecoderThread != null && mState != STATE_PLAYBACK_COMPLETED) {
				while (mIsDecoding) {
					synchronized (mDecoderLock) {
						mDecoderLock.notify();
						mDecoderLock.wait();
					}
				}
			}
		} catch (InterruptedException e) {
			Log.e(TAG_MP, "Interrupted in reset while waiting for decoder thread to stop.", e);
		}
		if (mCodec != null) {
			mCodec.release();
			mCodec = null;
		}
		if (mExtractor != null) {
			mExtractor.release();
			mExtractor = null;
		}
		if (mTrack != null) {
			mTrack.release();
			mTrack = null;
		}
		mEventHandler.removeCallbacksAndMessages(null);
		mState = STATE_IDLE;
		Log.d(TAG_MP, "State changed to STATE_IDLE");
		mLock.unlock();
	}

	public void seekTo(final int msec) {
		switch (mState) {
		case STATE_PREPARED:
		case STATE_STARTED:
		case STATE_PAUSED:
		case STATE_PLAYBACK_COMPLETED:
			Thread t = new Thread(new Runnable() {
				@Override
				public void run() {
					mLock.lock();
					if (mTrack == null) {
						return;
					}
					mTrack.flush();
					mExtractor.seekTo(((long) msec * 1000), MediaExtractor.SEEK_TO_CLOSEST_SYNC);
					try {
						Message m = new Message();
						m.what = MEDIA_SEEK_COMPLETE;
						mEventHandler.sendMessage(m);
					} catch (Exception e) {
						// Binder should handle our death
						Log.e(TAG_MP, "Received RemoteException trying to call onSeekComplete in seekTo", e);
					}
					mLock.unlock();
				}
			});
			t.setDaemon(true);
			t.start();
			break;
		default:
			error();
		}
	}

	// do nothing
	// this method is here to fake compliance
	// with the PhoneGap Media plugin
	public void setAudioStreamType(int param) {
		return;
	}

	// register completion listener
	// must be done before playing!
	public void setOnCompletionListener(OnCompletionListener listener) {
		switch (mState) {
		case STATE_IDLE:
			mOnCompletionListener = listener;
			Log.d(TAG_MP, "OnCompletionListener set");
			break;
		default:
			error();
		}
	}

	// register error listener
	// must be done before playing!
	public void setOnErrorListener(OnErrorListener listener) {
		switch (mState) {
		case STATE_IDLE:
			mOnErrorListener = listener;
			Log.d(TAG_MP, "OnErrorListener set");
			break;
		default:
			error();
		}
	}

	// register prepared listener
	// must be done before playing!
	public void setOnPreparedListener(OnPreparedListener listener) {
		switch (mState) {
		case STATE_IDLE:
			mOnPreparedListener = listener;
			Log.d(TAG_MP, "OnPreparedListener set");
			break;
		default:
			error();
		}
	}

	// register seek listener
	// must be done before playing!
	public void setOnSeekCompleteListener(OnSeekCompleteListener listener) {
		switch (mState) {
		case STATE_IDLE:
			mOnSeekCompleteListener = listener;
			Log.d(TAG_MP, "OnSeekCompleteListener set");
			break;
		default:
			error();
		}
	}

	// load audio from file at path
	// and transition to STATE_INITIALIZED
	public void setDataSource(String path) {
		switch (mState) {
		case STATE_IDLE:
			mSourcePath = path;
			mState = STATE_INITIALIZED;
			Log.d(TAG_MP, "Moving state to STATE_INITIALIZED");
			break;
		default:
			error();
		}
	}

	// load audio from file descriptor
	// and transition to STATE_INITIALIZED
	public void setDataSource(FileDescriptor fd) {
		switch (mState) {
		case STATE_IDLE:
			mSourceFD = fd;
			mState = STATE_INITIALIZED;
			Log.d(TAG_MP, "Moving state to STATE_INITIALIZED");
			break;
		default:
			error();
		}
	}

	// load audio from file descriptor with given offset and length
	// and transition to STATE_INITIALIZED
	public void setDataSource(FileDescriptor fd, long offset, long length) {
		switch (mState) {
		case STATE_IDLE:
			mSourceFD = fd;
			mSourceFDOffset = offset;
			mSourceFDLength = length;
			mState = STATE_INITIALIZED;
			Log.d(TAG_MP, "Moving state to STATE_INITIALIZED");
			break;
		default:
			error();
		}
	}

	// set the playback pitch
	// must be done before preparing
	public void setPlaybackPitch(float f) {
		mPitch = f;
	}

	// set the playback speed
	// must be done before preparing
	public void setPlaybackSpeed(float f) {
		mSpeed = f;
	}

	// set the playback volume
	public void setVolume(float left, float right) {
		if (null != mTrack) {
			mTrack.setStereoVolume(left, right);
		}
	}

	// generic error
	public void error() {
		error(0);
	}

	// error with an additional error code
	public void error(int extra) {
		Log.e(TAG_MP, "Moved to error state!");
		mState = STATE_ERROR;
		try {
			boolean handled = mOnErrorListener.onError(null, MEDIA_ERROR, extra);
			if (!handled) {
				Message m = new Message();
				m.what = MEDIA_PLAYBACK_COMPLETE;
				mEventHandler.sendMessage(m);
			}
		} catch (Exception e) {
			// Binder should handle our death
			Log.e(TAG_MP, "Received RemoteException when trying to call onCompletion in error state", e);
		}
	}

	public void initStream() throws IOException {
		mLock.lock();
		mExtractor = new MediaExtractor();
		if (mSourcePath != null) {
			// load audio from file at mPath
			mExtractor.setDataSource(mSourcePath);
		} else if (mSourceFD != null) {
			// load audio from file descriptor
			if ((mSourceFDOffset > -1) && (mSourceFDLength > -1)) {
				mExtractor.setDataSource(mSourceFD, mSourceFDOffset, mSourceFDLength);
			} else {
				mExtractor.setDataSource(mSourceFD);
			}
		} else {
			throw new IOException();
		}

		final MediaFormat oFormat = mExtractor.getTrackFormat(TRACK_NUM);
		int sampleRate = oFormat.getInteger(MediaFormat.KEY_SAMPLE_RATE);
		int channelCount = oFormat.getInteger(MediaFormat.KEY_CHANNEL_COUNT);
		final String mime = oFormat.getString(MediaFormat.KEY_MIME);
		mDuration = oFormat.getLong(MediaFormat.KEY_DURATION);

		Log.v(TAG_MP, "Sample rate: " + sampleRate);
		Log.v(TAG_MP, "Channel count: " + channelCount);
		Log.v(TAG_MP, "Mime type: " + mime);

		initDevice(sampleRate, channelCount);
		mExtractor.selectTrack(TRACK_NUM);
		mCodec = MediaCodec.createDecoderByType(mime);
		mCodec.configure(oFormat, null, null, 0);
		mLock.unlock();
	}

	// called by initStream()
	private void initDevice(int sampleRate, int numChannels) {
		mNumberChannels = numChannels;
		mSampleRate = sampleRate;
		mLock.lock();
		final int format = findFormatFromChannels(numChannels);
		final int minSize = AudioTrack.getMinBufferSize(sampleRate, format, AudioFormat.ENCODING_PCM_16BIT);
		mTrack = new AudioTrack(AudioManager.STREAM_MUSIC, sampleRate, format, AudioFormat.ENCODING_PCM_16BIT, minSize * 4, AudioTrack.MODE_STREAM);
		mSonic = new Sonic(sampleRate, numChannels);
		mLock.unlock();
	}

	public void decode() {
		mDecoderThread = new Thread(new Runnable() {
			@Override
			public void run() {
				mIsDecoding = true;
				mCodec.start();

				ByteBuffer[] inputBuffers = mCodec.getInputBuffers();
				ByteBuffer[] outputBuffers = mCodec.getOutputBuffers();

				boolean sawInputEOS = false;
				boolean sawOutputEOS = false;

				while (!sawInputEOS && !sawOutputEOS && mContinue) {
					if (mState == STATE_PAUSED) {
						try {
							synchronized (mDecoderLock) {
								mDecoderLock.wait();
							}
						} catch (InterruptedException e) {
							// Purposely not doing anything here
						}
						continue;
					}

					if (mSonic != null) {
						mSonic.setSpeed(mSpeed);
						mSonic.setPitch(mPitch);
					}

					/*
					  http://developer.android.com/reference/android/media/MediaCodec.html#dequeueInputBuffer(long)

					  public final int dequeueInputBuffer (long timeoutUs)
						Added in API level 16
						Returns the index of an input buffer to be filled with valid data
						or -1 if no such buffer is currently available.
						This method will return immediately if timeoutUs == 0,
						wait indefinitely for the availability of an input buffer if timeoutUs < 0
						or wait up to "timeoutUs" microseconds if timeoutUs > 0.

						timeoutUs: The timeout in microseconds, a negative timeout indicates "infinite".
					 */
					int inputBufIndex = mCodec.dequeueInputBuffer(200); // 0.2 ms
					if (inputBufIndex >= 0) {
						ByteBuffer dstBuf = inputBuffers[inputBufIndex];
						int sampleSize = mExtractor.readSampleData(dstBuf, 0);
						long presentationTimeUs = 0;
						if (sampleSize < 0) {
							sawInputEOS = true;
							sampleSize = 0;
						} else {
							presentationTimeUs = mExtractor.getSampleTime();
						}
						mCodec.queueInputBuffer(inputBufIndex, 0, sampleSize, presentationTimeUs, (sawInputEOS ? MediaCodec.BUFFER_FLAG_END_OF_STREAM : 0));
						if (!sawInputEOS) {
							mExtractor.advance();
						}
					}

					final MediaCodec.BufferInfo info = new MediaCodec.BufferInfo();
					byte[] modifiedSamples = new byte[info.size];

					int res;
					do {
						res = mCodec.dequeueOutputBuffer(info, 200);
						if (res >= 0) {
							int outputBufIndex = res;
							final byte[] chunk = new byte[info.size];
							outputBuffers[res].get(chunk);
							outputBuffers[res].clear();

							if (chunk.length > 0) {
								mSonic.putBytes(chunk, chunk.length);
							} else {
								mSonic.flush();
							}
							int available = mSonic.availableBytes();
							if (available > 0) {
								if (modifiedSamples.length < available) {
									modifiedSamples = new byte[available];
								}
								mSonic.receiveBytes(modifiedSamples, available);
								mTrack.write(modifiedSamples, 0, available);
							}

							mCodec.releaseOutputBuffer(outputBufIndex, false);

							if ((info.flags & MediaCodec.BUFFER_FLAG_END_OF_STREAM) != 0) {
								sawOutputEOS = true;
							}
						} else if (res == MediaCodec.INFO_OUTPUT_BUFFERS_CHANGED) {
							outputBuffers = mCodec.getOutputBuffers();
							Log.d("PCM", "Output buffers changed");
						} else if ((mUpdate) && (res == MediaCodec.INFO_OUTPUT_FORMAT_CHANGED)) {
					        mTrack.stop();
                            mLock.lock();
                            mTrack.release();
                            final MediaFormat oformat = mCodec.getOutputFormat();
						    Log.d("PCM", "Output format has changed to" + oformat);
                            initDevice(
                                    oformat.getInteger(MediaFormat.KEY_SAMPLE_RATE),
						            oformat.getInteger(MediaFormat.KEY_CHANNEL_COUNT));
						    outputBuffers = mCodec.getOutputBuffers();
						    mTrack.play();
                            mLock.unlock();
                        }
						// CUSTOM
                        /*
						 * Removed this code because it seemed to set
						 * channels to 2 for a mono MP3
						 *
						 * else if (res ==
						 * MediaCodec.INFO_OUTPUT_FORMAT_CHANGED) {
						 * mTrack.stop(); mLock.lock(); mTrack.release(); final
						 * MediaFormat oformat = mCodec .getOutputFormat();
						 * Log.d("PCM", "Output format has changed to" +
						 * oformat); initDevice(
						 * oformat.getInteger(MediaFormat.KEY_SAMPLE_RATE),
						 * oformat.getInteger(MediaFormat.KEY_CHANNEL_COUNT));
						 * outputBuffers = mCodec.getOutputBuffers();
						 * mTrack.play(); mLock.unlock(); }
						 */
					} while (res == MediaCodec.INFO_OUTPUT_BUFFERS_CHANGED || res == MediaCodec.INFO_OUTPUT_FORMAT_CHANGED);
				}
				Log.d(TAG_MP, "Decoding loop exited. Stopping codec and track");
				Log.d(TAG_MP, "Duration: " + (int) (mDuration / 1000));
				Log.d(TAG_MP, "Current position: " + (int) (mExtractor.getSampleTime() / 1000));
				mCodec.stop();
				mTrack.stop();
				Log.d(TAG_MP, "Stopped codec and track");
				Log.d(TAG_MP, "Current position: " + (int) (mExtractor.getSampleTime() / 1000));
				mIsDecoding = false;
				if (mContinue && (sawInputEOS || sawOutputEOS)) {
					mState = STATE_PLAYBACK_COMPLETED;
					Thread t = new Thread(new Runnable() {
						@Override
						public void run() {
							try {
								Message m = new Message();
								m.what = MEDIA_PLAYBACK_COMPLETE;
								mEventHandler.sendMessage(m);
							} catch (Exception e) {
								// Binder should handle our death
								Log.e(TAG_MP, "RemoteException trying to call onCompletion after decoding", e);
							}
						}
					});
					t.setDaemon(true);
					t.start();

				} else {
					Log.d(TAG_MP, "Loop ended before saw input eos or output eos");
					Log.d(TAG_MP, "sawInputEOS: " + sawInputEOS);
					Log.d(TAG_MP, "sawOutputEOS: " + sawOutputEOS);
				}
				synchronized (mDecoderLock) {
					mDecoderLock.notifyAll();
				}
			}
		});
		mDecoderThread.setDaemon(true);
		mDecoderThread.start();
	}

	private int findFormatFromChannels(int numChannels) {
		switch (numChannels) {
		case 1:
			return AudioFormat.CHANNEL_OUT_MONO;
		case 2:
			return AudioFormat.CHANNEL_OUT_STEREO;
		default:
			return -1; // Error
		}
	}

	private class EventHandler extends Handler {
		public EventHandler(Looper looper) {
			super(looper);
		}

		@Override
		public void handleMessage(Message msg) {
			switch (msg.what) {
			case MEDIA_PREPARED:
				if (mOnPreparedListener != null)
					mOnPreparedListener.onPrepared(null);
				return;

			case MEDIA_PLAYBACK_COMPLETE:
				if (mOnCompletionListener != null)
					mOnCompletionListener.onCompletion(null);
				return;

			case MEDIA_SEEK_COMPLETE:
				if (mOnSeekCompleteListener != null)
					mOnSeekCompleteListener.onSeekComplete(null);
				return;

			case MEDIA_ERROR:
				Log.e(TAG_MP, "Error (" + msg.arg1 + "," + msg.arg2 + ")");
				boolean error_was_handled = false;
				if (mOnErrorListener != null) {
					error_was_handled = mOnErrorListener.onError(null, msg.arg1, msg.arg2);
				}
				if (mOnCompletionListener != null && !error_was_handled) {
					mOnCompletionListener.onCompletion(null);
				}
				return;

			default:
				Log.e(TAG_MP, "Unknown message type " + msg.what);
				return;
			}
		}
	}

}
