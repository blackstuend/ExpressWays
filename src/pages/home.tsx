// import { Languages } from 'lucide-react'
import GTranslateIcon from '@mui/icons-material/GTranslate';
import HistoryIcon from '@mui/icons-material/History';
import TranslateIcon from '@mui/icons-material/Translate';
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useState } from 'react';
import { Button } from "@/components/ui/button"
import TextFieldsIcon from '@mui/icons-material/TextFields';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import { Toaster } from "@/components/ui/sonner"
import { toast } from "sonner"
import VolumeMuteIcon from '@mui/icons-material/VolumeMute';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { createClient } from '@supabase/supabase-js'
import { Skeleton } from "@/components/ui/skeleton"
import { useEffect } from 'react';
import { Spinner } from '@/components/ui/spinner';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
const supabase = createClient(supabaseUrl, supabaseAnonKey);


type BadgeItem = {
  text: string
}


type ResultItem = {
  tag: string
  text: string
}

const defaultBadges: BadgeItem[] = [
  {
    text: '你好，今天過得怎麼樣？',
  },
  {
    text: '今天天氣真好，適合出去走走。',
  },
  {
    text: '你最喜歡什麼顏色？',
  },
  {
    text: '你最喜歡的食物是什麼？',
  },
]

type AudioStatus = {
  status: 'playing' | 'normal' | 'loading'
}

export function Card({item}: {item: ResultItem}) {
  const [audioStatus, setAudioStatus] = useState<AudioStatus>({
    status: 'normal'
  });

  const [audioData, setAudioData] = useState<ArrayBuffer | null>(null);

  async function playAudioBuffer(arrayBuffer: ArrayBuffer) {
    // Create audio context
    const audioContext = new (window.AudioContext)();
    
    try {
        // Clone the array buffer to prevent detached buffer issues
        const arrayBufferCopy = arrayBuffer.slice(0);
        
        // Decode the array buffer into an audio buffer
        const audioBuffer = await audioContext.decodeAudioData(arrayBufferCopy);
        
        // Create buffer source
        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        
        // Connect to audio destination (speakers)
        source.connect(audioContext.destination);
        
        // Play the audio
        source.start(0);

        setAudioStatus({
          status: 'playing'
        });

        // listen to the end of the audio
        source.onended = () => {
          setAudioStatus({
            status: 'normal'
          });

          audioContext.close();
        }
        
        return source; // Return source if you need to stop it later
    } catch (error) {
        console.error('Error playing audio:', error);
        setAudioStatus({
          status: 'normal'
        });
    }
}

  async function handleClickVolume(e: React.MouseEvent<HTMLDivElement>, text: string) {
    e.preventDefault();

    if(audioData) {
      playAudioBuffer(audioData);
      return;
    }

    setAudioStatus({
      status: 'loading'
    });
    // data will be back openai voice api response
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
    setAudioData(data.slice(0)); // Store a copy of the buffer

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
            <ContentCopyIcon className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-300 transition-colors" onClick={() => {
              navigator.clipboard.writeText(item.text);
              toast.success('Text copied to clipboard');
            }} />
            {
              audioStatus.status === 'normal' && (
                <VolumeMuteIcon onClick={(e)=>{
                  handleClickVolume(e, item.text);
                }} className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-300 transition-colors" />
              )
            }
            {
              audioStatus.status === 'loading' && (
                <div className="h-6 w-6">
                  <Spinner size="small" show={true} />
                </div>
              )
            }
            {
              audioStatus.status === 'playing' && (
                <VolumeUpIcon className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-300 transition-colors" />
              )
            }
          </div>
        </div>
      </div>
      <div className="text-gray-200 text-sm">
        {item.text}
      </div>
    </div>
  )
}

type HistoryItem = {
  created_at: string
  id: string
  question: string
}

export default function HomePage() {
  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState<ResultItem[] | null>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);

  function handleClickBadge(item: typeof defaultBadges[0]) {
    setInputText(item.text)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if(e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      fetchTranslations();
    }
  }

  async function fetchTranslations() {
    if(isLoading) {
      return;
    }

    if(inputText.trim() === '') {
      toast('Please make sure to enter some text to translate');
      return;
    }


    setIsLoading(true);
    try {
      const response = await fetch(`${supabaseUrl}/functions/v1/ask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ pharse: inputText })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();

      setResult(data.results);
    } catch (error) {
      console.error('Failed to fetch translations:', error);
      // You may want to add error state handling here
      setResult(null);
    }

    setIsLoading(false);
  }

  function handleClickHistory(item: HistoryItem) {
    setInputText(item.question);
    setHistoryOpen(false);
    setShouldFetch(true);
  }

  const [shouldFetch, setShouldFetch] = useState(false);

  useEffect(() => {
    if (shouldFetch) {
      fetchTranslations();
      setShouldFetch(false);
    }
  }, [inputText, shouldFetch]);

  async function fetchHistory() {
    setHistoryLoading(true);

    await new Promise(resolve => setTimeout(resolve, 1000));
    const { data, error } = await supabase
      .from('History')
      .select('created_at, id, question')
      .limit(10)
      .order('created_at', { ascending: false });

    setHistoryLoading(false);

    if (error) {  
      console.error('Failed to fetch history:', error);
      return;
    }
    
    setHistory(data);
  }

    return (
      <div className="min-h-screen md:p-8">
        <Toaster position="top-center" />
        <div className="md:container mx-auto max-w-full md:max-w-3xl">
          <div className="bg-white dark:bg-gray-900  md:rounded-2xl card-shadow overflow-hidden animate__animated animate__fadeIn">
            <div className="bg-gradient-to-r from-[#3949ab] to-[#1e88e5] p-6 flex justify-between items-center">
              <h1 className="text-2xl font-bold text-white flex items-center">
                <GTranslateIcon className="w-6 h-6 mr-2" />
                ExpressWays
              </h1>
              <div className="flex items-center gap-2">
                <div className="badge text-xs  font-bold uppercase py-1 px-3 bg-white text-blue-700 rounded-full hidden md:block">
                  AI-Powered
                </div>
                <Drawer open={historyOpen} onOpenChange={setHistoryOpen}>
                  <DrawerTrigger asChild>
                    <HistoryIcon onClick={fetchHistory} className="w-6 h-6 text-white cursor-pointer hover:scale-110 transition-transform active:scale-95 hover:opacity-80" />
                  </DrawerTrigger>
                  <DrawerContent>
                    <DrawerHeader>
                      <DrawerTitle>Translation History</DrawerTitle>
                    </DrawerHeader>
                    <div className="px-4">
                      <div className="max-h-80 overflow-y-auto py-4">
                        {historyLoading ? (
                          <div className="space-y-3">
                            <Skeleton className="w-full h-10" />
                            <Skeleton className="w-full h-10" />
                            <Skeleton className="w-full h-10" />
                            <Skeleton className="w-full h-10" />
                          </div>
                            
                        ) : history.length === 0 ? (
                          <div className="text-center py-4 text-gray-500">
                            No translation history available.
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {history.map((item) => (
                              <div onClick={() => handleClickHistory(item)} key={item.id} className="bg-gray-100 cursor-pointer hover:bg-gray-200 dark:bg-gray-800 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow duration-200">
                                <div className="flex justify-between items-center">
                                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                                    {item.question}
                                  </span>
                                  <span className="text-xs text-gray-400">
                                    {new Date(item.created_at).toLocaleString('en-US', {
                                      month: '2-digit',
                                      day: '2-digit',
                                      hour: '2-digit',
                                      minute: '2-digit',
                                      hour12: false
                                    })}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <DrawerFooter>
                      <DrawerClose asChild>
                        <Button variant="outline">Close</Button>
                      </DrawerClose>
                    </DrawerFooter>
                  </DrawerContent>
                </Drawer>
              </div>
            </div>
            <div className="p-6 border-b border-gray-100">
              <div className="flex flex-col">
                <div className='flex justify-between items-center mb-3'>
                  <label htmlFor="input-text" className="text-sm font-medium text-gray-700 flex items-center">
                    <TextFieldsIcon className="w-6 h-6 text-blue-600 mr-2" />
                    <span className="text-gray-700 dark:text-gray-300">
                            Enter Chinese Text:
                    </span>
                  </label>
                </div>
                <Textarea id="input-text" placeholder="Enter Chinese Text" className="resize-none" onKeyDown={(e)=> handleKeyDown(e)} onChange={(e)=> setInputText(e.target.value)}  value={inputText} />
                <ul className="mt-4 flex flex-wrap gap-2">
                  {defaultBadges.map((item)=>{
                    return (
                      <li key={item.text} onClick={() => handleClickBadge(item)}>
                        <Badge variant="outline" className='cursor-pointer sample-phrase bg-gray-100 text-xs py-1 px-2 text-gray-700 hover:bg-blue-100 hover:text-blue-700 transition-colors'>
                          <span className="text-xs font-medium">
                            {item.text}
                          </span>
                        </Badge>
                      </li>
                    )
                  })}
                </ul>
                <Button onClick={fetchTranslations} className='mt-4 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center btn-hover pulse-btn'>
                  <TranslateIcon className='!w-[18px] !h-[18px]'></TranslateIcon>
                  Translate Now
                </Button>
              </div>
            </div>
            {
              isLoading && (
                <div className='p-6'>
                  <div className="flex justify-center items-center">
                    <Spinner size="large" show={true} />
                    <span className="ml-3 text-gray-600">Translating...</span>
                  </div>
                </div>
              )
            }
            {
              !isLoading && result && result.length > 0 && 
              (
                <div className='p-6'>
                  <h2 className="font-semibold text-lg mb-3 text-white flex items-center">
                      <AutoAwesomeIcon className='!w-24px !h-24px mr-2 text-blue-600'></AutoAwesomeIcon>
                      Translation Results
                  </h2>
                  {
                    result.map((item)=>{
                      return (
                        <Card item={item} key={item.text}></Card>
                      )
                    })
                  }
                </div>
              )
            }
            <div className='p-6 text-center text-gray-500 text-sm'>
                Made with
                <span className='text-red-600'> ♥ </span> for better translations
            </div>
          </div>
        </div>
      </div>
    );
  }
