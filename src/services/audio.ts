import { createAudioPlayer } from 'expo-audio';
import { useSystemStore } from '../store/useSystemStore';

export const SoundFX = {
  playLevelUp: async () => {
    if (!useSystemStore.getState().config.soundEnabled) return;
    try {
      const player = createAudioPlayer(require('../../musics/level-up.mp3'));
      player.play();
    } catch (e) {
      console.log('Error playing level up sound', e);
    }
  },
  
  playPenalty: async () => {
    if (!useSystemStore.getState().config.soundEnabled) return;
    try {
      const player = createAudioPlayer(require('../../musics/penalty.mp3'));
      player.play();
    } catch (e) {
      console.log('Error playing penalty sound', e);
    }
  },

  playNotification: async () => {
    if (!useSystemStore.getState().config.soundEnabled) return;
    try {
      const player = createAudioPlayer(require('../../musics/notification.mp3'));
      player.play();
    } catch (e) {
      console.log('Error playing notification sound', e);
    }
  },
  
  playQuestComplete: async () => {
    if (!useSystemStore.getState().config.soundEnabled) return;
    try {
      // Reutiliza o som de notificação para quando a quest for completada com sucesso
      const player = createAudioPlayer(require('../../musics/notification-for0penalty.mp3'));
      player.play();
    } catch (e) {
      console.log('Error playing quest complete sound', e);
    }
  }
};
