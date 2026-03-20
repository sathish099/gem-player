import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Chess } from 'chess.js';
import Svg, { Line, Circle, Rect } from 'react-native-svg';
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-react-native';
import { getBestMove } from './src/api/chessAi';
import { analyzeBoard } from './src/services/boardVision';
import ChessBoardOverlay from './src/components/ChessBoardOverlay';
import { Scan, Play, RefreshCw, Cpu, Video, VideoOff } from 'lucide-react-native';

export default function App() {
  const [permission, requestPermission] = useCameraPermissions();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [game, setGame] = useState(new Chess());
  const [aiMove, setAiMove] = useState(null);
  const [isLive, setIsLive] = useState(false);
  const cameraRef = useRef(null);
  const analysisInterval = useRef(null);

  useEffect(() => {
    (async () => {
      await tf.ready();
      console.log('TensorFlow ready');
    })();
  }, []);

  useEffect(() => {
    if (isLive) {
      analysisInterval.current = setInterval(async () => {
        if (!isAnalyzing && cameraRef.current) {
          console.log('Periodic scan (simulated)');
          // handleScanBoard(); // Would be here
        }
      }, 5000);
    } else {
      clearInterval(analysisInterval.current);
    }
    return () => clearInterval(analysisInterval.current);
  }, [isLive, isAnalyzing]);

  if (!permission) return <View style={styles.container}><ActivityIndicator size="large" /></View>;
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to show the camera</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.text}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleScanBoard = async () => {
    if (cameraRef.current && !isAnalyzing) {
      setIsAnalyzing(true);
      try {
        const photo = await cameraRef.current.takePictureAsync({ quality: 0.5 });
        const detectedFen = await analyzeBoard(photo);
        if (detectedFen) {
          const newGame = new Chess(detectedFen);
          setGame(newGame);
          setAiMove(null);
          Alert.alert('Board Scanned', 'Game state updated from camera.');
        }
      } catch (error) {
        console.error('Scan error:', error);
      } finally {
        setIsAnalyzing(false);
      }
    }
  };

  const handleGetAiMove = async () => {
    setIsAnalyzing(true);
    try {
      const bestMove = await getBestMove(game.fen());
      if (bestMove) {
        setAiMove(bestMove);
        Alert.alert('AI Suggestion', `Best move: ${bestMove}`);
      }
    } catch (error) {
      console.error('AI Move error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setGame(new Chess());
    setAiMove(null);
  };

  const renderBoardGrid = () => (
    <View style={styles.gridContainer}>
      <Svg height="100%" width="100%" viewBox="0 0 100 100">
        {[...Array(9)].map((_, i) => (
          <React.Fragment key={i}>
            <Line
              x1={0} y1={i * 12.5} x2={100} y2={i * 12.5}
              stroke="rgba(255,255,255,0.3)" strokeWidth="0.5"
            />
            <Line
              x1={i * 12.5} y1={0} x2={i * 12.5} y2={100}
              stroke="rgba(255,255,255,0.3)" strokeWidth="0.5"
            />
          </React.Fragment>
        ))}
      </Svg>
      <ChessBoardOverlay uciMove={aiMove} />
    </View>
  );

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} ref={cameraRef}>
        <View style={styles.overlay}>
          {renderBoardGrid()}
          
          <View style={styles.header}>
            <Text style={styles.fenText}>{game.fen()}</Text>
          </View>

          {aiMove && (
            <View style={styles.aiOverlay}>
              <Text style={styles.aiMoveLabel}>Suggested Move</Text>
              <Text style={styles.aiMoveText}>{aiMove}</Text>
            </View>
          )}
          
          <View style={styles.controls}>
            <TouchableOpacity style={styles.iconButton} onPress={handleScanBoard} disabled={isAnalyzing}>
              <Scan color="white" size={28} />
              <Text style={styles.iconText}>Scan</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.iconButton, isLive ? styles.activeButton : {}]} 
              onPress={() => setIsLive(!isLive)}
            >
              {isLive ? <Video color="#4cd137" size={28} /> : <VideoOff color="white" size={28} />}
              <Text style={[styles.iconText, isLive ? {color: '#4cd137'} : {}]}>Live</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.iconButton, styles.aiButton]} onPress={handleGetAiMove} disabled={isAnalyzing}>
              <Cpu color="white" size={40} />
              <Text style={styles.iconText}>AI Move</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.iconButton} onPress={handleReset}>
              <RefreshCw color="white" size={28} />
              <Text style={styles.iconText}>Reset</Text>
            </TouchableOpacity>
          </View>

          {isAnalyzing && (
            <View style={styles.loader}>
              <ActivityIndicator size="large" color="#fff" />
              <Text style={styles.loaderText}>Processing...</Text>
            </View>
          )}
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  header: {
    position: 'absolute',
    top: 50,
    width: '100%',
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  fenText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 10,
    textAlign: 'center',
  },
  gridContainer: {
    position: 'absolute',
    top: '20%',
    left: '5%',
    width: '90%',
    aspectRatio: 1,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'flex-end',
    padding: 20,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 40,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 30,
    padding: 15,
  },
  iconButton: {
    alignItems: 'center',
  },
  aiButton: {
    transform: [{ scale: 1.2 }],
    marginHorizontal: 10,
  },
  activeButton: {
    borderColor: '#4cd137',
    borderWidth: 1,
    borderRadius: 10,
    padding: 5,
  },
  iconText: {
    color: 'white',
    fontSize: 10,
    marginTop: 5,
    fontWeight: 'bold',
  },
  aiOverlay: {
    position: 'absolute',
    top: 100,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,122,255,0.9)',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  aiMoveLabel: {
    color: 'white',
    fontSize: 10,
    textTransform: 'uppercase',
    opacity: 0.8,
  },
  aiMoveText: {
    color: 'white',
    fontSize: 24,
    fontWeight: '900',
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
    color: 'white',
  },
  button: {
    backgroundColor: '#2196F3',
    padding: 10,
    borderRadius: 5,
  },
  text: {
    color: 'white',
    fontWeight: 'bold',
  },
  loader: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  loaderText: {
    color: 'white',
    marginTop: 10,
    fontSize: 16,
  },
});
