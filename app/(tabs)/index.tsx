/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react/react-in-jsx-scope */
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, Button, View, Dimensions } from 'react-native';
import {
  Frame,
  Camera as VisionCamera,
  useCameraDevice,
  useCameraPermission,
  useFrameProcessor,
} from 'react-native-vision-camera';
import { useIsFocused } from '@react-navigation/core';
import { useAppState } from '@react-native-community/hooks';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  // Camera,
  Face,
  FaceDetectionOptions,
} from 'react-native-vision-camera-face-detector';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Canvas from 'react-native-canvas';
import { useTextRecognition, Camera, useTranslate } from "react-native-vision-camera-text-recognition";
/**
 * Entry point component
 *
 * @return {JSX.Element} Component
 */
function HomeScreen(): JSX.Element {
  return (
    <SafeAreaProvider>
      <FaceDetection />
    </SafeAreaProvider>
  );
}

/**
 * Face detection component
 *
 * @return {JSX.Element} Component
 */
function FaceDetection(): JSX.Element {
  const { hasPermission, requestPermission } = useCameraPermission();
  const [cameraMounted, setCameraMounted] = useState<boolean>(false);
  const [cameraPaused, setCameraPaused] = useState<boolean>(false);
  const [autoScale, setAutoScale] = useState<boolean>(true);
  const [facingFront, setFacingFront] = useState<boolean>(false);
  const [textData, setTextData] = useState<String>('');

  const faceDetectionOptions = useRef<FaceDetectionOptions>({
    performanceMode: 'fast',
    classificationMode: 'all',
  }).current;
  const isFocused = useIsFocused();
  const appState = useAppState();
  const isCameraActive = !cameraPaused && isFocused && appState === 'active';
  const cameraDevice = useCameraDevice(facingFront ? 'front' : 'back');


  // vision camera ref
  const camera = useRef<VisionCamera>(null);

  // face rectangle position
  const aFaceW = useSharedValue(0);
  const aFaceH = useSharedValue(0);
  const aFaceX = useSharedValue(0);
  const aFaceY = useSharedValue(0);
  const aRot = useSharedValue(0);
  const animatedStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    borderWidth: 4,
    borderLeftColor: 'rgb(0,255,0)',
    borderRightColor: 'rgb(0,255,0)',
    borderBottomColor: 'rgb(0,255,0)',
    borderTopColor: 'rgb(255,0,0)',
    width: withTiming(aFaceW.value, {
      duration: 100,
    }),
    height: withTiming(aFaceH.value, {
      duration: 100,
    }),
    left: withTiming(aFaceX.value, {
      duration: 100,
    }),
    top: withTiming(aFaceY.value, {
      duration: 100,
    }),
    transform: [
      {
        rotate: `${aRot.value}deg`,
      },
    ],
  }));

  useEffect(() => {
    if (hasPermission) return;
    requestPermission();
  }, []);

  /**
   * Handle camera UI rotation
   *
   * @param {number} rotation Camera rotation
   */
  function handleUiRotation(rotation: number) {
    aRot.value = rotation;
  }

  /**
   * Hanldes camera mount error event
   *
   * @param {any} error Error event
   */
  function handleCameraMountError(error: any) {
    console.error('camera mount error', error);
  }

  /**
   * Handle detection result
   *
   * @param {Face[]} faces Detection result
   * @returns {void}
   */
  function handleFacesDetected(faces: Face[], frame: Frame): void {
    // console.log('faces', faces.length, 'frame', frame.toString());
    // if no faces are detected we do nothing
    if (Object.keys(faces).length <= 0) return;

    const { bounds } = faces[0];
    const { width, height, x, y } = bounds;
    console.log(bounds, 'bounds');
    aFaceW.value = width;
    aFaceH.value = height;
    aFaceX.value = x;
    aFaceY.value = y;

    // only call camera methods if ref is defined
    if (camera.current) {
      // take photo, capture video, etc...
    }
  }

  const handleCanvas = (canvas: {
    width: number;
    height: number;
    getContext: (arg0: string) => any;
  }) => {
    if (canvas) {
      canvas.width = Dimensions.get('window').width;
      canvas.height = Dimensions.get('window').height;

      const ctx = canvas.getContext('2d');
      const width = canvas.width;
      const height = canvas.height;

      // Draw horizontal lines
      ctx.beginPath();
      ctx.moveTo(0, height / 3);
      ctx.lineTo(width, height / 3);
      ctx.moveTo(0, (height / 3) * 2);
      ctx.lineTo(width, (height / 3) * 2);

      // Draw vertical lines
      ctx.moveTo(width / 3, 0);
      ctx.lineTo(width / 3, height);
      ctx.moveTo((width / 3) * 2, 0);
      ctx.lineTo((width / 3) * 2, height);

      // Set line properties
      ctx.strokeStyle = '#ffffff'; // Example: Red color
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  };

  const options = {
   language: 'devanagari'
  }
  const { scanText } = useTextRecognition(options)
  const scanTextFrameProcessor = useFrameProcessor((frame) => {
    'worklet'
    const data = scanText(frame)
    console.log(JSON.stringify(data, null, 4), 'recognize')
  }, [])

  // const { translate } = useTranslate(options)
  // const translateFrameProcessor = useFrameProcessor((frame) => {
  //   'worklet'
  //   const data = translate(frame)
  //   console.log(JSON.stringify(data, null, 4), 'translate')
  // }, [])
  return (
    <>
      <View
        style={[
          StyleSheet.absoluteFill,
          {
            alignItems: 'center',
            justifyContent: 'center',
          },
        ]}
      >
        {hasPermission && cameraDevice ? (
          <>
            {cameraMounted && (
              <>
                <VisionCamera
                  ref={camera}
                  style={StyleSheet.absoluteFill}
                  isActive={isCameraActive}
                  device={cameraDevice}
                  onError={handleCameraMountError}
                  // faceDetectionCallback={handleFacesDetected}
                  // outputOrientation={'device'}
                  // onUIRotationChanged={handleUiRotation}
                  // faceDetectionOptions={{
                  //   ...faceDetectionOptions,
                  //   autoScale,
                  // }}
                  mode={'recognize'}
                  frameProcessor={scanTextFrameProcessor}

                />

                {/* <Animated.View style={animatedStyle} /> */}
                {/* {textData.length > 0 && (
                  <Text
                    style={{
                      width: '100%',
                      backgroundColor: 'rgb(0,255,0)',
                      textAlign: 'center',
                    }}
                  >
                    {textData}
                  </Text>
                )
                } */}

                {cameraPaused && (
                  <Text
                    style={{
                      width: '100%',
                      backgroundColor: 'rgb(0,0,255)',
                      textAlign: 'center',
                      color: 'white',
                    }}
                  >
                    Camera is PAUSED
                  </Text>
                )}
                <Canvas
                  ref={handleCanvas}
                  style={{ position: 'absolute', top: 0, left: 0 }}
                />
              </>
            )}

            {!cameraMounted && (
              <Text
                style={{
                  width: '100%',
                  backgroundColor: 'rgb(255,255,0)',
                  textAlign: 'center',
                }}
              >
                Camera is NOT mounted
              </Text>
            )}
          </>
        ) : (
          <Text
            style={{
              width: '100%',
              backgroundColor: 'rgb(255,0,0)',
              textAlign: 'center',
              color: 'white',
            }}
          >
            No camera device or permission
          </Text>
        )}
      </View>

      <View
        style={{
          position: 'absolute',
          bottom: 20,
          left: 0,
          right: 0,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <View
          style={{
            width: '100%',
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-around',
          }}
        >
          <Button
            onPress={() => setFacingFront((current) => !current)}
            title={'Toggle Cam'}
          />

          <Button
            onPress={() => setAutoScale((current) => !current)}
            title={`${autoScale ? 'Disable' : 'Enable'} Scale`}
          />
        </View>
        <View
          style={{
            width: '100%',
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-around',
          }}
        >
          <Button
            onPress={() => setCameraPaused((current) => !current)}
            title={`${cameraPaused ? 'Resume' : 'Pause'} Cam`}
          />

          <Button
            onPress={() => setCameraMounted((current) => !current)}
            title={`${cameraMounted ? 'Unmount' : 'Mount'} Cam`}
          />
        </View>
      </View>
    </>
  );
}

export default HomeScreen;
