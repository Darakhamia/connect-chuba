"use client";

import { useState, useEffect } from "react";
import { Mic, Volume2, Video, Monitor } from "lucide-react";
import { Label } from "@/components/ui/label";
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
  const [audioInputs, setAudioInputs] = useState<MediaDevice[]>([]);
  const [audioOutputs, setAudioOutputs] = useState<MediaDevice[]>([]);
  const [videoInputs, setVideoInputs] = useState<MediaDevice[]>([]);
  
  const [selectedAudioInput, setSelectedAudioInput] = useState<string>("");
  const [selectedAudioOutput, setSelectedAudioOutput] = useState<string>("");
  const [selectedVideoInput, setSelectedVideoInput] = useState<string>("");
  
  const [inputVolume, setInputVolume] = useState(80);
  const [outputVolume, setOutputVolume] = useState(100);

  useEffect(() => {
    async function getDevices() {
      try {
        // Запрашиваем разрешение на доступ к устройствам
        await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
        
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

        if (inputs.length > 0) setSelectedAudioInput(inputs[0].deviceId);
        if (outputs.length > 0) setSelectedAudioOutput(outputs[0].deviceId);
        if (videos.length > 0) setSelectedVideoInput(videos[0].deviceId);
      } catch (error) {
        console.error("Error accessing media devices:", error);
      }
    }

    getDevices();
  }, []);

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
            <Select value={selectedAudioInput} onValueChange={setSelectedAudioInput}>
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
            <p className="text-sm text-zinc-400 mb-2">Проверка микрофона</p>
            <div className="h-2 bg-zinc-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-green-500 transition-all duration-100"
                style={{ width: "0%" }}
              />
            </div>
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
            <Select value={selectedVideoInput} onValueChange={setSelectedVideoInput}>
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
          <div className="aspect-video bg-zinc-900 rounded-lg flex items-center justify-center">
            <div className="text-center text-zinc-500">
              <Video className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Предпросмотр камеры</p>
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
            <Select defaultValue="720">
              <SelectTrigger className="bg-zinc-900 border-zinc-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-700">
                <SelectItem value="480" className="text-white hover:bg-zinc-800">480p</SelectItem>
                <SelectItem value="720" className="text-white hover:bg-zinc-800">720p</SelectItem>
                <SelectItem value="1080" className="text-white hover:bg-zinc-800">1080p</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}
