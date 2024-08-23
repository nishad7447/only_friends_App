import React, {useState, useRef, useEffect} from 'react';
import {TouchableOpacity, View, StyleSheet, Animated} from 'react-native';
import Video from 'react-native-video';
import Icon from 'react-native-vector-icons/Ionicons';

export default function VideoPlayer({fileUrl}: {fileUrl: string}) {
  const [paused, setPaused] = useState(true);
  const [muted, setMuted] = useState(true);
  const [controlsVisible, setControlsVisible] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const fadeAnim = new Animated.Value(1);
  const videoRef = useRef<any>(null);

  const togglePlayPause = () => {
    setPaused(!paused);
    showControls();
  };

  const toggleMute = () => {
    setMuted(!muted);
    showControls();
  };

  const showControls = () => {
    setControlsVisible(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // Hide controls after 3 seconds
    setTimeout(() => {
      hideControls();
    }, 3000);
  };

  const hideControls = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setControlsVisible(false);
    });
  };

  const handleVideoPress = () => {
    togglePlayPause();
    showControls();
  };

  const handleProgress = (progress: {currentTime: number}) => {
    setCurrentTime(progress.currentTime);
  };

  const handleLoad = (meta: {duration: number}) => {
    setDuration(meta.duration);
  };

  const calculateProgress = () => {
    return (currentTime / duration) * 100;
  };

  useEffect(() => {
    showControls();
  }, []);

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={handleVideoPress} style={styles.videoWrapper}>
        <Video
          ref={videoRef}
          source={{uri: fileUrl}}
          style={styles.video}
          paused={paused}
          muted={muted}
          repeat={true}
          onProgress={handleProgress}
          onLoad={handleLoad}
          onError={error => {
            console.log('Video error:', error);
          }}
          resizeMode="cover"
        />
        {controlsVisible && (
          <Animated.View style={[styles.controlOverlay, {opacity: fadeAnim}]}>
            <Icon
              name={paused ? 'play-circle' : 'pause-circle'}
              size={50}
              color="white"
              style={styles.playPauseIcon}
            />
          </Animated.View>
        )}
      </TouchableOpacity>

      {controlsVisible && (
        <TouchableOpacity
          onPress={toggleMute}
          style={[styles.muteButton, {opacity: fadeAnim}]}>
          <Icon
            name={muted ? 'volume-mute' : 'volume-high'}
            size={24}
            color="white"
          />
        </TouchableOpacity>
      )}

      <View style={styles.progressBarContainer}>
        <View
          style={[
            styles.progressBar,
            {width: `${calculateProgress()}%`},
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: '#000',
  },
  videoWrapper: {
    position: 'relative',
    width: '100%',
    height: '100%',
  },
  video: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  controlOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playPauseIcon: {
    opacity: 0.8,
  },
  muteButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 8,
    borderRadius: 50,
  },
  progressBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#1E90FF',
    borderRadius: 2,
  },
});
