// Interfaces for future AI services. No provider is connected yet; every call throws.
import type { LanguageCode } from "../languages";

export interface SpeechRecognitionService { transcribe(audio: Blob, lang: LanguageCode): Promise<string> }
export interface TranslationService { translate(text: string, from: LanguageCode, to: LanguageCode): Promise<string> }
export interface TextToSpeechService { synthesize(text: string, lang: LanguageCode): Promise<Blob> }

const notConfigured = (name: string) => () => Promise.reject(new Error(`${name} is not configured yet.`));

export const speech: SpeechRecognitionService = { transcribe: notConfigured("Speech recognition") };
export const translation: TranslationService = { translate: notConfigured("Translation") };
export const tts: TextToSpeechService = { synthesize: notConfigured("Text-to-speech") };
