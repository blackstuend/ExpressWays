import { Skeleton } from "@/components/ui/skeleton";
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import HistoryIcon from '@mui/icons-material/History';

type HistoryItem = {
  created_at: string;
  id: string;
  question: string;
}

interface HistoryDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  historyLoading: boolean;
  history: HistoryItem[];
  onHistoryItemClick: (item: HistoryItem) => void;
  onDrawerTriggerClick: () => void;
}

export function HistoryDrawer({ 
  open, 
  onOpenChange, 
  historyLoading, 
  history, 
  onHistoryItemClick,
  onDrawerTriggerClick 
}: HistoryDrawerProps) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerTrigger asChild>
        <HistoryIcon 
          onClick={onDrawerTriggerClick} 
          className="w-6 h-6 text-white cursor-pointer hover:scale-110 transition-transform active:scale-95 hover:opacity-80" 
        />
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
                  <div 
                    onClick={() => onHistoryItemClick(item)} 
                    key={item.id} 
                    className="bg-gray-100 cursor-pointer hover:bg-gray-200 dark:bg-gray-800 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow duration-200"
                  >
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
        <DrawerFooter />
      </DrawerContent>
    </Drawer>
  );
} 