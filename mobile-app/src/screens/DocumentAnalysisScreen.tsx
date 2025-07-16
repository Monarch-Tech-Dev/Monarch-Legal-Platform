/**
 * Monarch Legal Platform - Mobile Document Analysis Screen
 * Native mobile interface for document contradiction detection
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
  ActivityIndicator,
  Dimensions
} from 'react-native';
import DocumentPicker from 'react-native-document-picker';
import { Camera, useCameraDevices } from 'react-native-vision-camera';
import Voice from '@react-native-voice/voice';
import RNFS from 'react-native-fs';
import NetInfo from '@react-native-community/netinfo';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { AnalysisResult, ContradictionViewer, SuccessProbabilityGauge } from '../components';
import { OfflineAnalysisEngine } from '../services/OfflineAnalysisEngine';
import { ApiService } from '../services/ApiService';
import { CacheManager } from '../services/CacheManager';

interface DocumentAnalysisScreenProps {
  navigation: any;
  route: any;
}

interface AnalysisState {
  isAnalyzing: boolean;
  isOnline: boolean;
  analysisResult: any | null;
  uploadProgress: number;
  cameraActive: boolean;
  voiceActive: boolean;
  selectedDocument: any | null;
}

const DocumentAnalysisScreen: React.FC<DocumentAnalysisScreenProps> = ({ navigation, route }) => {
  const [state, setState] = useState<AnalysisState>({
    isAnalyzing: false,
    isOnline: true,
    analysisResult: null,
    uploadProgress: 0,
    cameraActive: false,
    voiceActive: false,
    selectedDocument: null
  });

  const devices = useCameraDevices();
  const device = devices.back;
  const offlineEngine = new OfflineAnalysisEngine();
  const apiService = new ApiService();
  const cacheManager = new CacheManager();

  useEffect(() => {
    initializeScreen();
    setupNetworkListener();
    setupVoiceRecognition();
    
    return () => {
      cleanupVoice();
    };
  }, []);

  const initializeScreen = async () => {
    try {
      // Initialize offline analysis engine
      await offlineEngine.initialize();
      
      // Check camera permissions
      const cameraPermission = await Camera.getCameraPermissionStatus();
      if (cameraPermission !== 'authorized') {
        await Camera.requestCameraPermission();
      }
      
      Toast.show({
        type: 'success',
        text1: 'Monarch Legal Analysis Ready',
        text2: 'Upload document or use camera to begin'
      });
      
    } catch (error) {
      console.error('Error initializing screen:', error);
      Toast.show({
        type: 'error',
        text1: 'Initialization Error',
        text2: 'Some features may not be available'
      });
    }
  };

  const setupNetworkListener = () => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setState(prev => ({ ...prev, isOnline: state.isConnected || false }));
      
      if (state.isConnected) {
        // Sync any cached analysis results when coming back online
        syncCachedResults();
      }
    });

    return unsubscribe;
  };

  const setupVoiceRecognition = () => {
    Voice.onSpeechStart = onSpeechStart;
    Voice.onSpeechEnd = onSpeechEnd;
    Voice.onSpeechResults = onSpeechResults;
    Voice.onSpeechError = onSpeechError;
  };

  const cleanupVoice = () => {
    Voice.destroy().then(Voice.removeAllListeners);
  };

  const onSpeechStart = () => {
    setState(prev => ({ ...prev, voiceActive: true }));
  };

  const onSpeechEnd = () => {
    setState(prev => ({ ...prev, voiceActive: false }));
  };

  const onSpeechResults = (event: any) => {
    if (event.value && event.value[0]) {
      const transcription = event.value[0];
      processVoiceTranscription(transcription);
    }
  };

  const onSpeechError = (event: any) => {
    console.error('Voice recognition error:', event.error);
    setState(prev => ({ ...prev, voiceActive: false }));
    Toast.show({
      type: 'error',
      text1: 'Voice Recognition Error',
      text2: 'Please try again or use document upload'
    });
  };

  const selectDocument = async () => {
    try {
      const result = await DocumentPicker.pick({
        type: [DocumentPicker.types.pdf, DocumentPicker.types.images, DocumentPicker.types.plainText],
        allowMultiSelection: false
      });

      if (result && result[0]) {
        const document = result[0];
        setState(prev => ({ ...prev, selectedDocument: document }));
        
        Toast.show({
          type: 'success',
          text1: 'Document Selected',
          text2: `${document.name} ready for analysis`
        });
        
        // Automatically start analysis
        analyzeDocument(document);
      }
    } catch (error) {
      if (!DocumentPicker.isCancel(error)) {
        console.error('Document picker error:', error);
        Toast.show({
          type: 'error',
          text1: 'Document Selection Failed',
          text2: 'Please try again'
        });
      }
    }
  };

  const captureDocument = async () => {
    if (!device) {
      Toast.show({
        type: 'error',
        text1: 'Camera Not Available',
        text2: 'Please use document upload instead'
      });
      return;
    }

    setState(prev => ({ ...prev, cameraActive: true }));
    
    // Navigate to camera screen
    navigation.navigate('CameraCapture', {
      onCapture: (imageUri: string) => {
        setState(prev => ({ ...prev, cameraActive: false }));
        processImageCapture(imageUri);
      }
    });
  };

  const startVoiceRecognition = async () => {
    try {
      setState(prev => ({ ...prev, voiceActive: true }));
      await Voice.start('no-NO'); // Norwegian voice recognition
    } catch (error) {
      console.error('Voice start error:', error);
      setState(prev => ({ ...prev, voiceActive: false }));
    }
  };

  const stopVoiceRecognition = async () => {
    try {
      await Voice.stop();
      setState(prev => ({ ...prev, voiceActive: false }));
    } catch (error) {
      console.error('Voice stop error:', error);
    }
  };

  const processImageCapture = async (imageUri: string) => {
    try {
      setState(prev => ({ ...prev, isAnalyzing: true }));
      
      // Convert image to text using OCR (would integrate with ML Kit or similar)
      const extractedText = await extractTextFromImage(imageUri);
      
      if (extractedText) {
        const analysisResult = await performAnalysis(extractedText, 'image_capture');
        setState(prev => ({ 
          ...prev, 
          analysisResult, 
          isAnalyzing: false 
        }));
      } else {
        throw new Error('Could not extract text from image');
      }
      
    } catch (error) {
      console.error('Image processing error:', error);
      setState(prev => ({ ...prev, isAnalyzing: false }));
      Toast.show({
        type: 'error',
        text1: 'Image Processing Failed',
        text2: 'Please ensure document text is clearly visible'
      });
    }
  };

  const processVoiceTranscription = async (transcription: string) => {
    try {
      setState(prev => ({ ...prev, isAnalyzing: true }));
      
      const analysisResult = await performAnalysis(transcription, 'voice_input');
      setState(prev => ({ 
        ...prev, 
        analysisResult, 
        isAnalyzing: false 
      }));
      
    } catch (error) {
      console.error('Voice processing error:', error);
      setState(prev => ({ ...prev, isAnalyzing: false }));
    }
  };

  const analyzeDocument = async (document: any) => {
    try {
      setState(prev => ({ ...prev, isAnalyzing: true, uploadProgress: 0 }));
      
      // Read document content
      let documentContent: string;
      
      if (document.type === 'application/pdf') {
        documentContent = await extractTextFromPdf(document.uri);
      } else if (document.type.startsWith('image/')) {
        documentContent = await extractTextFromImage(document.uri);
      } else {
        documentContent = await RNFS.readFile(document.uri, 'utf8');
      }
      
      // Perform analysis
      const analysisResult = await performAnalysis(documentContent, 'document_upload', document);
      
      setState(prev => ({ 
        ...prev, 
        analysisResult, 
        isAnalyzing: false,
        uploadProgress: 100
      }));
      
    } catch (error) {
      console.error('Document analysis error:', error);
      setState(prev => ({ ...prev, isAnalyzing: false }));
      Toast.show({
        type: 'error',
        text1: 'Analysis Failed',
        text2: 'Please check document format and try again'
      });
    }
  };

  const performAnalysis = async (
    content: string, 
    sourceType: string, 
    originalDocument?: any
  ): Promise<any> => {
    try {
      let analysisResult;
      
      if (state.isOnline) {
        // Online analysis with full AI capabilities
        analysisResult = await apiService.analyzeDocument({
          content,
          sourceType,
          documentType: 'auto_detect',
          analysisMode: 'comprehensive',
          userContext: {
            jurisdiction: 'NO',
            language: 'no'
          }
        });
        
        // Cache result for offline access
        await cacheManager.cacheAnalysisResult(analysisResult);
        
      } else {
        // Offline analysis using local engine
        Toast.show({
          type: 'info',
          text1: 'Offline Analysis',
          text2: 'Using local contradiction detection'
        });
        
        analysisResult = await offlineEngine.analyzeDocument(content);
        
        // Queue for online sync when connection returns
        await cacheManager.queueForSync(analysisResult);
      }
      
      // Store in local database for history
      await storeAnalysisHistory(analysisResult, originalDocument);
      
      return analysisResult;
      
    } catch (error) {
      console.error('Analysis error:', error);
      throw error;
    }
  };

  const extractTextFromPdf = async (pdfUri: string): Promise<string> => {
    // PDF text extraction implementation
    // Would integrate with react-native-pdf or similar library
    throw new Error('PDF extraction not implemented');
  };

  const extractTextFromImage = async (imageUri: string): Promise<string> => {
    // OCR implementation using ML Kit or similar
    // Would extract text from image using computer vision
    throw new Error('OCR extraction not implemented');
  };

  const storeAnalysisHistory = async (result: any, originalDocument?: any) => {
    try {
      const historyEntry = {
        id: `analysis_${Date.now()}`,
        timestamp: new Date().toISOString(),
        result,
        originalDocument: originalDocument ? {
          name: originalDocument.name,
          type: originalDocument.type,
          size: originalDocument.size
        } : null,
        deviceInfo: {
          platform: Platform.OS,
          version: Platform.Version
        }
      };
      
      const existingHistory = await AsyncStorage.getItem('analysis_history');
      const history = existingHistory ? JSON.parse(existingHistory) : [];
      
      history.unshift(historyEntry);
      
      // Keep only last 50 analyses to manage storage
      const trimmedHistory = history.slice(0, 50);
      
      await AsyncStorage.setItem('analysis_history', JSON.stringify(trimmedHistory));
      
    } catch (error) {
      console.error('Error storing analysis history:', error);
    }
  };

  const syncCachedResults = async () => {
    try {
      await cacheManager.syncPendingResults();
      Toast.show({
        type: 'success',
        text1: 'Sync Complete',
        text2: 'Offline analyses have been synchronized'
      });
    } catch (error) {
      console.error('Sync error:', error);
    }
  };

  const shareAnalysisResult = async () => {
    if (!state.analysisResult) return;
    
    try {
      const shareText = `Monarch Legal Analysis Result:
      
Contradictions Found: ${state.analysisResult.contradictionsFound}
Success Probability: ${Math.round(state.analysisResult.successProbability * 100)}%
Recommended Strategy: ${state.analysisResult.recommendedStrategy?.strategy || 'N/A'}

Generated by Monarch Legal Platform
https://monarch.legal`;

      // Share using native sharing
      const Share = require('react-native-share');
      await Share.open({
        message: shareText,
        title: 'Monarch Legal Analysis'
      });
      
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  const renderConnectionStatus = () => (
    <View style={[styles.connectionStatus, { backgroundColor: state.isOnline ? '#4CAF50' : '#FF9800' }]}>
      <Text style={styles.connectionText}>
        {state.isOnline ? '🌐 Online - Full Analysis' : '📱 Offline - Basic Analysis'}
      </Text>
    </View>
  );

  const renderUploadOptions = () => (
    <View style={styles.uploadOptions}>
      <TouchableOpacity 
        style={styles.uploadButton}
        onPress={selectDocument}
        disabled={state.isAnalyzing}
      >
        <Text style={styles.uploadButtonText}>📄 Upload Document</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.uploadButton}
        onPress={captureDocument}
        disabled={state.isAnalyzing}
      >
        <Text style={styles.uploadButtonText}>📷 Capture Document</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.uploadButton, state.voiceActive && styles.activeVoice]}
        onPress={state.voiceActive ? stopVoiceRecognition : startVoiceRecognition}
        disabled={state.isAnalyzing}
      >
        <Text style={styles.uploadButtonText}>
          {state.voiceActive ? '🔴 Stop Voice' : '🎤 Voice Input'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderAnalysisProgress = () => (
    <View style={styles.progressContainer}>
      <ActivityIndicator size="large" color="#2196F3" />
      <Text style={styles.progressText}>
        {state.isOnline ? 'Analyzing with AI...' : 'Analyzing offline...'}
      </Text>
      {state.uploadProgress > 0 && (
        <Text style={styles.progressPercent}>{state.uploadProgress}%</Text>
      )}
    </View>
  );

  const renderAnalysisResult = () => {
    if (!state.analysisResult) return null;

    return (
      <ScrollView style={styles.resultContainer}>
        <View style={styles.resultHeader}>
          <Text style={styles.resultTitle}>Analysis Complete</Text>
          <TouchableOpacity 
            style={styles.shareButton}
            onPress={shareAnalysisResult}
          >
            <Text style={styles.shareButtonText}>Share</Text>
          </TouchableOpacity>
        </View>

        <SuccessProbabilityGauge 
          probability={state.analysisResult.successProbability}
          style={styles.successGauge}
        />

        <ContradictionViewer 
          contradictions={state.analysisResult.contradictions || []}
          style={styles.contradictionViewer}
        />

        {state.analysisResult.recommendations && (
          <View style={styles.recommendationsContainer}>
            <Text style={styles.recommendationsTitle}>Recommended Actions</Text>
            {state.analysisResult.recommendations.map((rec: any, index: number) => (
              <View key={index} style={styles.recommendationItem}>
                <Text style={styles.recommendationText}>{rec.description}</Text>
                <Text style={styles.recommendationSuccess}>
                  Success Rate: {Math.round(rec.successProbability * 100)}%
                </Text>
              </View>
            ))}
          </View>
        )}

        <TouchableOpacity 
          style={styles.newAnalysisButton}
          onPress={() => setState(prev => ({ 
            ...prev, 
            analysisResult: null, 
            selectedDocument: null 
          }))}
        >
          <Text style={styles.newAnalysisButtonText}>New Analysis</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      {renderConnectionStatus()}
      
      {!state.analysisResult && !state.isAnalyzing && renderUploadOptions()}
      {state.isAnalyzing && renderAnalysisProgress()}
      {state.analysisResult && renderAnalysisResult()}
      
      <Toast />
    </View>
  );
};

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5'
  },
  connectionStatus: {
    padding: 12,
    alignItems: 'center'
  },
  connectionText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14
  },
  uploadOptions: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20
  },
  uploadButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
    marginVertical: 8,
    width: width * 0.8,
    alignItems: 'center'
  },
  activeVoice: {
    backgroundColor: '#F44336'
  },
  uploadButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold'
  },
  progressContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  progressText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666'
  },
  progressPercent: {
    marginTop: 8,
    fontSize: 14,
    color: '#2196F3',
    fontWeight: 'bold'
  },
  resultContainer: {
    flex: 1,
    padding: 16
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333'
  },
  shareButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4
  },
  shareButtonText: {
    color: 'white',
    fontWeight: 'bold'
  },
  successGauge: {
    marginVertical: 16
  },
  contradictionViewer: {
    marginVertical: 16
  },
  recommendationsContainer: {
    marginTop: 24,
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  recommendationsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333'
  },
  recommendationItem: {
    marginBottom: 12,
    padding: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 6
  },
  recommendationText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4
  },
  recommendationSuccess: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: 'bold'
  },
  newAnalysisButton: {
    backgroundColor: '#FF9800',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 32
  },
  newAnalysisButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold'
  }
});

export default DocumentAnalysisScreen;