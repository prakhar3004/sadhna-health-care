// Sadhna Health Care — Create Story Screen
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { useThemeColors } from '@/src/hooks/useTheme';
import { useAuthStore } from '@/src/store/authStore';
import { StoriesService } from '@/src/services/storiesService';
import { Spacing, Radius, FontSize } from '@/src/utils/constants';

const GRADIENTS = [
  { key: 'teal', label: 'Teal', colors: ['#14B8A6', '#0D9488'], bg: 'linear-gradient:from=#14B8A6&to=#0D9488' },
  { key: 'orange', label: 'Sunset', colors: ['#F59E0B', '#D97706'], bg: 'linear-gradient:from=#F59E0B&to=#D97706' },
  { key: 'purple', label: 'Purple', colors: ['#A855F7', '#7E22CE'], bg: 'linear-gradient:from=#A855F7&to=#7E22CE' },
  { key: 'night', label: 'Midnight', colors: ['#1E3A8A', '#0F172A'], bg: 'linear-gradient:from=#1E3A8A&to=#0F172A' },
  { key: 'pink', label: 'Rose', colors: ['#EC4899', '#BE185D'], bg: 'linear-gradient:from=#EC4899&to=#BE185D' },
];

export default function CreateStoryScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  const [mode, setMode] = useState<'text' | 'image'>('text');
  const [textContent, setTextContent] = useState('');
  const [selectedGradientIdx, setSelectedGradientIdx] = useState(0);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imageCaption, setImageCaption] = useState('');
  const [posting, setPosting] = useState(false);

  const activeGradient = GRADIENTS[selectedGradientIdx];

  const handlePickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'We need access to your gallery to pick an image.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [9, 16],
        quality: 0.4, // Compress to save database space
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        setImageUri(result.assets[0].uri);
        if (result.assets[0].base64) {
          setImageBase64(`data:image/jpeg;base64,${result.assets[0].base64}`);
        } else {
          setImageBase64(null);
        }
      }
    } catch (e) {
      console.warn('Failed to pick image:', e);
      Alert.alert('Error', 'Failed to pick image.');
    }
  };

  const handleShare = async () => {
    if (!user) return;

    if (mode === 'text' && !textContent.trim()) {
      Alert.alert('Empty Story', 'Please write something for your text story.');
      return;
    }

    if (mode === 'image' && !imageUri) {
      Alert.alert('No Image Selected', 'Please pick an image to share.');
      return;
    }

    setPosting(true);
    try {
      if (mode === 'text') {
        // Text stories: mediaUrl is the gradient code, caption holds the text content
        await StoriesService.createStory(user.id, activeGradient.bg, textContent.trim());
      } else {
        // Image stories: mediaUrl is the base64 or local path, caption is optional description
        const mediaSource = imageBase64 || imageUri;
        await StoriesService.createStory(user.id, mediaSource, imageCaption.trim());
      }

      Alert.alert('Story Shared! 🎉', 'Your story will be active for 24 hours.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (e: any) {
      Alert.alert('Sharing Failed', e.message || 'Could not post your story.');
    } finally {
      setPosting(false);
    }
  };

  if (!user) return null;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
          <Ionicons name="close" size={26} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Add Story</Text>
        <TouchableOpacity
          style={[
            styles.shareBtn,
            {
              backgroundColor:
                (mode === 'text' && textContent.trim()) || (mode === 'image' && imageUri)
                  ? colors.primary
                  : colors.surfaceSecondary,
            },
          ]}
          onPress={handleShare}
          disabled={posting}
        >
          {posting ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <Text
              style={[
                styles.shareBtnText,
                {
                  color:
                    (mode === 'text' && textContent.trim()) || (mode === 'image' && imageUri)
                      ? '#FFF'
                      : colors.textTertiary,
                },
              ]}
            >
              Share
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        {/* Toggle Mode */}
        <View style={styles.modeToggleContainer}>
          <View style={[styles.toggleBg, { backgroundColor: colors.surfaceSecondary }]}>
            <TouchableOpacity
              style={[styles.toggleTab, mode === 'text' && { backgroundColor: colors.surface }]}
              onPress={() => setMode('text')}
            >
              <Ionicons name="text" size={16} color={mode === 'text' ? colors.primary : colors.textSecondary} />
              <Text style={[styles.toggleTabText, { color: mode === 'text' ? colors.text : colors.textSecondary }]}>
                Text Story
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleTab, mode === 'image' && { backgroundColor: colors.surface }]}
              onPress={() => setMode('image')}
            >
              <Ionicons name="image-outline" size={16} color={mode === 'image' ? colors.primary : colors.textSecondary} />
              <Text style={[styles.toggleTabText, { color: mode === 'image' ? colors.text : colors.textSecondary }]}>
                Photo Story
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Workspace Area */}
        <View style={styles.workspace}>
          {mode === 'text' ? (
            /* TEXT STORY CREATOR */
            <LinearGradient
              colors={activeGradient.colors as [string, string]}
              style={[styles.previewContainer, { borderRadius: Radius.lg }]}
            >
              <TextInput
                style={styles.textCreatorInput}
                placeholder="Tap to write..."
                placeholderTextColor="rgba(255,255,255,0.6)"
                multiline
                maxLength={240}
                value={textContent}
                onChangeText={setTextContent}
              />
            </LinearGradient>
          ) : (
            /* IMAGE STORY CREATOR */
            <TouchableOpacity
              activeOpacity={0.9}
              style={[
                styles.previewContainer,
                {
                  backgroundColor: colors.surfaceSecondary,
                  borderColor: colors.border,
                  borderWidth: imageUri ? 0 : 2,
                  borderStyle: imageUri ? 'solid' : 'dashed',
                  borderRadius: Radius.lg,
                },
              ]}
              onPress={handlePickImage}
            >
              {imageUri ? (
                <View style={styles.flex}>
                  <Image source={{ uri: imageUri }} style={styles.fullImage} resizeMode="cover" />
                  <View style={styles.changePhotoBadge}>
                    <Ionicons name="camera-reverse" size={16} color="#FFF" />
                    <Text style={styles.changePhotoText}>Change Photo</Text>
                  </View>
                </View>
              ) : (
                <View style={styles.emptyImageContent}>
                  <Ionicons name="cloud-upload-outline" size={44} color={colors.primary} />
                  <Text style={[styles.emptyImageText, { color: colors.text }]}>Select Photo from Gallery</Text>
                  <Text style={[styles.emptyImageSub, { color: colors.textTertiary }]}>9:16 portrait fits best</Text>
                </View>
              )}
            </TouchableOpacity>
          )}
        </View>

        {/* Options / Customizations Bar */}
        <View style={[styles.customizerBar, { borderTopWidth: 1, borderColor: colors.borderLight }]}>
          {mode === 'text' ? (
            <View style={styles.gradientSelector}>
              <Text style={[styles.barLabel, { color: colors.textSecondary }]}>Background Gradient:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.gradientList}>
                {GRADIENTS.map((grad, idx) => (
                  <TouchableOpacity
                    key={grad.key}
                    onPress={() => setSelectedGradientIdx(idx)}
                    activeOpacity={0.7}
                  >
                    <LinearGradient
                      colors={grad.colors as [string, string]}
                      style={[
                        styles.gradientThumb,
                        selectedGradientIdx === idx && {
                          borderColor: colors.text,
                          borderWidth: 2,
                          transform: [{ scale: 1.1 }],
                        },
                      ]}
                    />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          ) : (
            <View style={styles.captionInputContainer}>
              <TextInput
                style={[
                  styles.captionInput,
                  {
                    color: colors.text,
                    backgroundColor: colors.surfaceSecondary,
                    borderColor: colors.border,
                  },
                ]}
                placeholder="Add story caption (optional)..."
                placeholderTextColor={colors.textTertiary}
                value={imageCaption}
                onChangeText={setImageCaption}
                maxLength={80}
              />
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  closeBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: FontSize.lg, fontWeight: '700' },
  shareBtn: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 70,
  },
  shareBtnText: { fontSize: FontSize.base, fontWeight: '700' },
  modeToggleContainer: {
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
  },
  toggleBg: {
    flexDirection: 'row',
    padding: 3,
    borderRadius: Radius.md,
    gap: 2,
  },
  toggleTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: Radius.sm,
    gap: 6,
  },
  toggleTabText: {
    fontSize: FontSize.xs,
    fontWeight: '700',
  },
  workspace: {
    flex: 1,
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.base,
  },
  previewContainer: {
    flex: 1,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  textCreatorInput: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    paddingHorizontal: Spacing.xl,
    lineHeight: 32,
  },
  fullImage: {
    width: '100%',
    height: '100%',
  },
  changePhotoBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  changePhotoText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
  },
  emptyImageContent: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
    gap: 12,
  },
  emptyImageText: {
    fontSize: FontSize.base,
    fontWeight: '700',
  },
  emptyImageSub: {
    fontSize: FontSize.xs,
  },
  customizerBar: {
    padding: Spacing.base,
    justifyContent: 'center',
  },
  barLabel: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },
  gradientSelector: {
    gap: Spacing.xs,
  },
  gradientList: {
    gap: Spacing.sm,
    paddingVertical: 4,
  },
  gradientThumb: {
    width: 38,
    height: 38,
    borderRadius: 19,
  },
  captionInputContainer: {
    alignSelf: 'stretch',
  },
  captionInput: {
    height: 44,
    borderRadius: Radius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    fontSize: FontSize.sm,
  },
});
