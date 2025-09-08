# Lommepenge App'en Sound Effects

This directory contains sound effects for the Lommepenge App'en (Pocket Money App) to enhance the user experience with audio feedback.

## Sound Categories

### Transaction Sounds
- `coin-drop.mp3` - Single coin drop sound for small transactions
- `coins-multiple.mp3` - Multiple coins sound for larger amounts
- `purchase-success.mp3` - Pleasant sound for successful purchases

### Celebration Sounds
- `celebration-reward.mp3` - Joyful sound for rewards
- `celebration-achievement.mp3` - Achievement unlock sound
- `celebration-allowance.mp3` - Weekly allowance celebration
- `celebration-bonus.mp3` - Bonus reward celebration
- `milestone.mp3` - Special milestone reached sound
- `danish-chime.mp3` - Danish-themed celebratory chime

### UI Feedback Sounds
- `button-click.mp3` - Gentle button click sound
- `button-success.mp3` - Success button press
- `ui-whoosh.mp3` - Smooth transition sound
- `ui-pop.mp3` - Quick UI feedback

### Notification Sounds
- `notification-gentle.mp3` - Soft notification for balance updates
- `notification-alert.mp3` - Gentle alert for important notifications

## Sound Design Guidelines

### Child-Friendly Audio
- **Pleasant and Non-Overwhelming**: All sounds should be gentle and not startling
- **Short Duration**: Most sounds should be 0.5-2 seconds to avoid disruption
- **Appropriate Volume**: Designed to be pleasant at medium volume levels
- **Positive Association**: Sounds should reinforce positive behaviors and achievements

### Danish Cultural Integration
- **Warm and Welcoming**: Sounds that feel homely and family-friendly
- **Nordic Minimalism**: Clean, simple sounds without excessive complexity
- **Cultural Appropriateness**: Audio that fits Danish family values and traditions

### Technical Requirements
- **Format**: MP3 or WAV format for broad compatibility
- **Quality**: 44.1kHz sample rate, stereo or mono acceptable
- **Size**: Keep files under 100KB each for optimal loading
- **Normalization**: All sounds should be normalized to prevent volume inconsistencies

## Fallback System

The app includes a comprehensive fallback system using Web Audio API:
- If sound files are missing, the system generates pleasant tones using Web Audio API
- Each sound type has predefined frequency and duration parameters
- Fallback tones are designed to be pleasant and contextually appropriate

## Sound Preferences

Users can control:
- **Master Volume**: Overall sound volume (0-100%)
- **Sound Categories**: Enable/disable celebrations, transactions, UI feedback, notifications
- **Complete Mute**: Toggle all sounds on/off
- **Individual Controls**: Fine-grained control over different sound types

## Implementation Notes

### Automatic Integration
The sound system automatically integrates with:
- **Transaction Service**: Plays appropriate sounds for money changes
- **Celebration Service**: Enhances visual celebrations with audio
- **UI Components**: Provides feedback for button interactions
- **Achievement System**: Celebrates milestones and goals

### Performance Optimizations
- **Audio Pooling**: Multiple audio instances prevent conflicts
- **Lazy Loading**: Sounds load only when needed
- **Caching**: Frequently used sounds are cached in memory
- **Preloading**: Essential sounds preload for instant playback

### Cross-Browser Compatibility
- **HTML5 Audio**: Primary audio system for maximum compatibility
- **Web Audio API**: Advanced features and fallback tone generation
- **iOS Safari**: Special handling for iOS audio restrictions
- **Autoplay Policies**: Respects browser autoplay restrictions

## Adding New Sound Files

1. **Create Audio Files**: Follow the technical requirements above
2. **Add to Directory**: Place files in this `/sounds` directory  
3. **Update Mappings**: The SoundService automatically maps file names to sound types
4. **Test Integration**: Use the built-in sound test functions to verify

## Usage Examples

```typescript
// Inject SoundService in your component
constructor(private soundService: SoundService) {}

// Play celebration sound
await this.soundService.playCelebrationForTransaction(TransactionType.REWARD, 50);

// Play UI feedback
await this.soundService.playUIFeedback('click');

// Play achievement milestone
await this.soundService.playMilestoneSound('First 100 DKK saved!');

// Test all sounds
await this.soundService.testSounds();
```

## Accessibility Considerations

- **User Control**: Always provide user control over sound settings
- **Reduced Motion**: Respects user's motion preferences for sound timing
- **Hearing Accessibility**: Visual feedback complements all audio cues
- **Cognitive Load**: Sounds enhance rather than distract from core functionality

The sound system is designed to create a magical, engaging experience for children while respecting user preferences and maintaining excellent performance.