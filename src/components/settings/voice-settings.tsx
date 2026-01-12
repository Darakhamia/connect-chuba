"use client";

import { useState, useEffect, useRef } from "react";
import { Mic, Volume2, Video, Monitor, Play, Square } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/hooks/use-settings-store";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface MediaDevice {
  deviceId: string;
  label: string;
}

export function VoiceSettings() {
  const {
    selectedAudioInput,
    selectedAudioOutput,
    selectedVideoInput,
    inputVolume,
    outputVolume,
    screenShareQuality,
    setSelectedAudioInput,
    setSelectedAudioOutput,
    setSelectedVideoInput,
    setInputVolume,
    setOutputVolume,
    setScreenShareQuality,
  } = useSettings();

  const [audioInputs, setAudioInputs] = useState<MediaDevice[]>([]);
  const [audioOutputs, setAudioOutputs] = useState<MediaDevice[]>([]);
  const [videoInputs, setVideoInputs] = useState<MediaDevice[]>([]);
  
  const [isTesting, setIsTesting] = useState(false);
  const [micLevel, setMicLevel] = useState(0);
  const [isVideoPreview, setIsVideoPreview] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    getDevices();
    return () => {
      stopMicTest();
      stopVideoPreview();
    };
  }, []);

  async function getDevices() {
    try {
      // Request permission
      await navigator.mediaDevices.getUserMedia({ audio: true, video: true }).then(s => s.getTracks().forEach(t => t.stop()));
      
      const devices = await navigator.mediaDevices.enumerateDevices();
      
      const inputs = devices
        .filter(d => d.kind === "audioinput")
        .map(d => ({ deviceId: d.deviceId, label: d.label || `Микрофон ${d.deviceId.slice(0, 5)}` }));
      
      const outputs = devices
        .filter(d => d.kind === "audiooutput")
        .map(d => ({ deviceId: d.deviceId, label: d.label || `Динамик ${d.deviceId.slice(0, 5)}` }));
      
      const videos = devices
        .filter(d => d.kind === "videoinput")
        .map(d => ({ deviceId: d.deviceId, label: d.label || `Камера ${d.deviceId.slice(0, 5)}` }));

      setAudioInputs(inputs);
      setAudioOutputs(outputs);
      setVideoInputs(videos);

      // Set defaults if not set
      if (!selectedAudioInput && inputs.length > 0) setSelectedAudioInput(inputs[0].deviceId);
      if (!selectedAudioOutput && outputs.length > 0) setSelectedAudioOutput(outputs[0].deviceId);
      if (!selectedVideoInput && videos.length > 0) setSelectedVideoInput(videos[0].deviceId);
    } catch (error) {
      console.error("Error accessing media devices:", error);
      toast.error("Не удалось получить доступ к устройствам");
    }
  }

  async function startMicTest() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { deviceId: selectedAudioInput ? { exact: selectedAudioInput } : undefined }
      });
      
      streamRef.current = stream;
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      
      analyserRef.current.fftSize = 256;
      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      setIsTesting(true);
      
      function updateLevel() {
        if (analyserRef.current) {
          analyserRef.current.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((a, b) => a + b) / bufferLength;
          setMicLevel(Math.min(100, (average / 128) * 100 * (inputVolume / 100)));
        }
        animationRef.current = requestAnimationFrame(updateLevel);
      }
      
      updateLevel();
      toast.success("Тест микрофона запущен");
    } catch (error) {
      console.error("Error starting mic test:", error);
      toast.error("Не удалось запустить тест");
    }
  }

  function stopMicTest() {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    setIsTesting(false);
    setMicLevel(0);
  }

  async function startVideoPreview() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: selectedVideoInput ? { exact: selectedVideoInput } : undefined }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsVideoPreview(true);
        toast.success("Превью камеры включено");
      }
    } catch (error) {
      console.error("Error starting video preview:", error);
      toast.error("Не удалось включить камеру");
    }
  }

  function stopVideoPreview() {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsVideoPreview(false);
  }

  const handleAudioInputChange = (deviceId: string) => {
    setSelectedAudioInput(deviceId);
    if (isTesting) {
      stopMicTest();
      setTimeout(startMicTest, 100);
    }
  };

  const handleVideoInputChange = (deviceId: string) => {
    setSelectedVideoInput(deviceId);
    if (isVideoPreview) {
      stopVideoPreview();
      setTimeout(startVideoPreview, 100);
    }
  };

  return (
    <div className="space-y-8">
      {/* Audio Input */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Mic className="w-5 h-5 text-zinc-400" />
          <h3 className="text-lg font-semibold text-white">Устройство ввода</h3>
        </div>

        <div className="space-y-3">
          <div className="space-y-2">
            <Label className="text-zinc-400">Микрофон</Label>
            <Select value={selectedAudioInput} onValueChange={handleAudioInputChange}>
              <SelectTrigger className="bg-zinc-900 border-zinc-700 text-white">
                <SelectValue placeholder="Выберите микрофон" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-700">
                {audioInputs.map((device) => (
                  <SelectItem 
                    key={device.deviceId} 
                    value={device.deviceId}
                    className="text-white hover:bg-zinc-800"
                  >
                    {device.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-zinc-400">Громкость ввода</Label>
              <span className="text-sm text-zinc-500">{inputVolume}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={inputVolume}
              onChange={(e) => setInputVolume(Number(e.target.value))}
              className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
          </div>

          {/* Input test */}
          <div className="p-3 rounded-lg bg-zinc-800/50">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-zinc-400">Проверка микрофона</p>
              <Button
                variant="outline"
                size="sm"
                onClick={isTesting ? stopMicTest : startMicTest}
                className="border-zinc-600"
              >
                {isTesting ? (
                  <>
                    <Square className="w-4 h-4 mr-1" />
                    Стоп
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-1" />
                    Тест
                  </>
                )}
              </Button>
            </div>
            <div className="h-3 bg-zinc-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-green-500 transition-all duration-75"
                style={{ width: `${micLevel}%` }}
              />
            </div>
            {isTesting && (
              <p className="text-xs text-zinc-500 mt-2">
                Говорите в микрофон — уровень должен меняться
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="h-[1px] bg-zinc-700" />

      {/* Audio Output */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Volume2 className="w-5 h-5 text-zinc-400" />
          <h3 className="text-lg font-semibold text-white">Устройство вывода</h3>
        </div>

        <div className="space-y-3">
          <div className="space-y-2">
            <Label className="text-zinc-400">Динамики</Label>
            <Select value={selectedAudioOutput} onValueChange={setSelectedAudioOutput}>
              <SelectTrigger className="bg-zinc-900 border-zinc-700 text-white">
                <SelectValue placeholder="Выберите динамики" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-700">
                {audioOutputs.map((device) => (
                  <SelectItem 
                    key={device.deviceId} 
                    value={device.deviceId}
                    className="text-white hover:bg-zinc-800"
                  >
                    {device.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-zinc-400">Громкость вывода</Label>
              <span className="text-sm text-zinc-500">{outputVolume}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={outputVolume}
              onChange={(e) => setOutputVolume(Number(e.target.value))}
              className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
          </div>
        </div>
      </div>

      <div className="h-[1px] bg-zinc-700" />

      {/* Video */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Video className="w-5 h-5 text-zinc-400" />
          <h3 className="text-lg font-semibold text-white">Видео</h3>
        </div>

        <div className="space-y-3">
          <div className="space-y-2">
            <Label className="text-zinc-400">Камера</Label>
            <Select value={selectedVideoInput} onValueChange={handleVideoInputChange}>
              <SelectTrigger className="bg-zinc-900 border-zinc-700 text-white">
                <SelectValue placeholder="Выберите камеру" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-700">
                {videoInputs.map((device) => (
                  <SelectItem 
                    key={device.deviceId} 
                    value={device.deviceId}
                    className="text-white hover:bg-zinc-800"
                  >
                    {device.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Video preview */}
          <div className="relative aspect-video bg-zinc-900 rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className={`w-full h-full object-cover ${isVideoPreview ? 'block' : 'hidden'}`}
            />
            
            {!isVideoPreview && (
              <div className="absolute inset-0 flex items-center justify-center text-center text-zinc-500">
                <div>
                  <Video className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Предпросмотр камеры</p>
                </div>
              </div>
            )}
            
            <div className="absolute bottom-3 right-3">
              <Button
                variant="secondary"
                size="sm"
                onClick={isVideoPreview ? stopVideoPreview : startVideoPreview}
              >
                {isVideoPreview ? "Выключить" : "Включить"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="h-[1px] bg-zinc-700" />

      {/* Screen share */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Monitor className="w-5 h-5 text-zinc-400" />
          <h3 className="text-lg font-semibold text-white">Демонстрация экрана</h3>
        </div>

        <div className="p-4 rounded-lg bg-zinc-800/50">
          <p className="text-sm text-zinc-400 mb-3">
            Настройки качества при демонстрации экрана
          </p>
          
          <div className="space-y-2">
            <Label className="text-zinc-400">Качество</Label>
            <Select value={screenShareQuality} onValueChange={(v) => setScreenShareQuality(v as "480" | "720" | "1080")}>
              <SelectTrigger className="bg-zinc-900 border-zinc-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-700">
                <SelectItem value="480" className="text-white hover:bg-zinc-800">480p (экономия трафика)</SelectItem>
                <SelectItem value="720" className="text-white hover:bg-zinc-800">720p (рекомендуется)</SelectItem>
                <SelectItem value="1080" className="text-white hover:bg-zinc-800">1080p (высокое качество)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}
