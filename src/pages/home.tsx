// import { Languages } from 'lucide-react'
import GTranslateIcon from '@mui/icons-material/GTranslate';
import TranslateIcon from '@mui/icons-material/Translate';
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button"

import TextFieldsIcon from '@mui/icons-material/TextFields';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import GitHubIcon from '@mui/icons-material/GitHub';
import { Toaster } from "@/components/ui/sonner"
import { toast } from "sonner"
import { createClient } from '@supabase/supabase-js'
import { Spinner } from '@/components/ui/spinner';
import { AnimatedGradientText } from "@/components/magicui/animated-gradient-text";
import { Card } from '@/components/Card';
import { HistoryDrawer } from '@/components/HistoryDrawer';



const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

type ResultItem = {
  tag: string
  text: string
}


type HistoryItem = {
  created_at: string
  id: string
  question: string
}

type LocalHistoryItem = {
  question: string;
}

export default function HomePage() {
  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState<ResultItem[] | null>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [localHistoryList, setLocalHistoryList] = useState<LocalHistoryItem[]>([]);

  useEffect(()=>{
    if(localHistoryList.length > 5) {
      setLocalHistoryList(localHistoryList.slice(0, 5));
    } 

    if(localHistoryList.length > 0) {
      localStorage.setItem('localHistory', JSON.stringify(localHistoryList));
    }
  }, [localHistoryList]);

  useEffect(()=>{
    const localHistory = localStorage.getItem('localHistory');
    if(localHistory) {
      setLocalHistoryList(JSON.parse(localHistory));
    }
  }, []);

  function handleClickBadge(item: LocalHistoryItem) {
    setInputText(item.question)

    setShouldFetch(true);
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

    // check if the inputText is already in the localHistoryList
    if(!localHistoryList.some(item => item.question === inputText)) {
      setLocalHistoryList([{ question: inputText }, ...localHistoryList]);
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
      <div className="h-screen flex flex-col">
        <Toaster position="top-center" />
        <div className="md:container mx-auto max-w-full md:max-w-3xl flex flex-col max-h-full h-fit md:py-4">
          <div className="bg-white dark:bg-gray-900 md:rounded-2xl card-shadow overflow-hidden animate__animated animate__fadeIn flex flex-col h-full">
            <div className="bg-gradient-to-r from-[#3949ab] to-[#1e88e5] p-6 flex justify-between items-center sticky top-0 z-10">
              <h1 className="text-2xl font-bold text-white flex items-center">
                <GTranslateIcon className="w-6 h-6 mr-2" />
                ExpressWays
              </h1>
              <div className="flex items-center gap-2">
                <div className="badge text-xs font-bold uppercase py-1 px-3 bg-white text-blue-700 rounded-full hidden md:block">
                  <AnimatedGradientText
                    speed={2}
                    colorFrom="#3949ab"
                    colorTo="#1e88e5"
                    className="text-xs font-semibold tracking-tight"
                  >
                    AI Powered
                  </AnimatedGradientText>
                </div>
                <HistoryDrawer 
                  open={historyOpen}
                  onOpenChange={setHistoryOpen}
                  historyLoading={historyLoading}
                  history={history}
                  onHistoryItemClick={handleClickHistory}
                  onDrawerTriggerClick={fetchHistory}
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-700 [&::-webkit-scrollbar-thumb]:rounded-full dark:[&::-webkit-scrollbar-thumb]:bg-gray-600">
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
                  <Textarea 
                    id="input-text" 
                    placeholder="Enter Chinese Text" 
                    className="resize-none" 
                    onKeyDown={(e)=> handleKeyDown(e)} 
                    onChange={(e)=> setInputText(e.target.value)}  
                    value={inputText}
                    onClear={() => setInputText('')}
                  />
                  <ul className="mt-4 flex flex-wrap gap-2">
                    {localHistoryList.map((item)=>{
                      return (
                        <li key={item.question} onClick={() => handleClickBadge(item)}>
                          <Badge variant="outline" className='cursor-pointer sample-phrase bg-gray-100 text-xs py-1 px-2 text-gray-700 hover:bg-blue-100 hover:text-blue-700 transition-colors'>
                            <span className="text-xs font-medium">
                              {item.question}
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
            </div>
            <div className='p-6 text-center text-gray-500 text-sm'>
                Made with
                <span className='text-red-600'> ♥ </span> for better translations
                <div className="mt-2 flex justify-center items-center">
                  <a 
                    href="https://github.com/blackstuend/ExpressWays" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className=" transition-colors flex items-center gap-1"
                  >
                    <GitHubIcon className="w-4 h-4" />
                  </a>
                </div>
              </div>
          </div>
        </div>
      </div>
    );
  }
