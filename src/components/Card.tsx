import { useState } from 'react';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeMuteIcon from '@mui/icons-material/VolumeMute';
import { Badge } from "@/components/ui/badge";
import { Spinner } from '@/components/ui/spinner';
import { toast } from "sonner";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;

type ResultItem = {
  tag: string;
  text: string;
}

type AudioStatus = {
  status: 'playing' | 'normal' | 'loading'
}

export function Card({item}: {item: ResultItem}) {
  const [audioStatus, setAudioStatus] = useState<AudioStatus>({
    status: 'normal'
  });

  const [audioData, setAudioData] = useState<ArrayBuffer | null>(null);

  async function playAudioBuffer(arrayBuffer: ArrayBuffer) {
    const audioContext = new (window.AudioContext)();
    
    try {
        const arrayBufferCopy = arrayBuffer.slice(0);
        const audioBuffer = await audioContext.decodeAudioData(arrayBufferCopy);
        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContext.destination);
        source.start(0);

        setAudioStatus({
          status: 'playing'
        });

        source.onended = () => {
          setAudioStatus({
            status: 'normal'
          });

          audioContext.close();
        }
        
        return source;
    } catch (error) {
        console.error('Error playing audio:', error);
        setAudioStatus({
          status: 'normal'
        });
    }
  }

  async function handleClickVolume(e: React.MouseEvent<SVGSVGElement>, text: string) {
    e.preventDefault();

    if(audioData) {
      playAudioBuffer(audioData);
      return;
    }

    setAudioStatus({
      status: 'loading'
    });

    const response = await fetch(`${supabaseUrl}/functions/v1/tts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ text })
    });

    if(!response.ok) {
      toast.error('Failed to fetch audio data');
      setAudioStatus({
        status: 'normal'
      });
      return;
    }

    const data = await response.arrayBuffer();
    setAudioData(data.slice(0));
    playAudioBuffer(data);
  }

  return (
    <div className="bg-gray-800 rounded-lg p-4 mb-4 shadow-md border border-gray-700">
      <div className="flex items-center mb-2">
        <Badge className="text-xs font-medium">
          {item.tag}
        </Badge>
        <div className="flex items-center justify-between ml-auto">
          <div className="flex items-center gap-2">
            <ContentCopyIcon 
              className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-300 transition-colors" 
              onClick={() => {
                navigator.clipboard.writeText(item.text);
                toast.success('Text copied to clipboard');
              }} 
            />
            {audioStatus.status === 'normal' && (
              <VolumeMuteIcon 
                onClick={(e)=> handleClickVolume(e, item.text)} 
                className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-300 transition-colors" 
              />
            )}
            {audioStatus.status === 'loading' && (
              <div className="h-6 w-6">
                <Spinner size="small" show={true} />
              </div>
            )}
            {audioStatus.status === 'playing' && (
              <VolumeUpIcon className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-300 transition-colors" />
            )}
          </div>
        </div>
      </div>
      <div className="text-gray-200 text-sm">
        {item.text}
      </div>
    </div>
  )
} 