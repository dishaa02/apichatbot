import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

export const models = [
  // Chat / QA
  { id: 'mistralai/mistral-7b-instruct', name: 'Mistral 7B Instruct', description: 'Chat / QA', category: 'Chat / QA', color: 'from-blue-500 to-cyan-600' },
  { id: 'mistralai/mistral-small-3.2-24b-instruct', name: 'Mistral Small 3.2 24B Instruct', description: 'Chat / QA', category: 'Chat / QA', color: 'from-blue-500 to-cyan-600' },
  { id: 'qwen/qwen3-14b', name: 'Qwen3 14B', description: 'Chat / QA', category: 'Chat / QA', color: 'from-blue-500 to-cyan-600' },
  { id: 'qwen/qwen3-30b-a3b', name: 'Qwen3 30B A3B', description: 'Chat / QA', category: 'Chat / QA', color: 'from-blue-500 to-cyan-600' },
  { id: 'qwen/qwen3-32b', name: 'Qwen3 32B', description: 'Chat / QA', category: 'Chat / QA', color: 'from-blue-500 to-cyan-600' },
  { id: 'qwen/qwen3-235b-a22b', name: 'Qwen3 235B A22B', description: 'Chat / QA', category: 'Chat / QA', color: 'from-blue-500 to-cyan-600' },
  // Coding
  { id: 'deepseek/deepseek-chat', name: 'DeepSeek Chat', description: 'Coding', category: 'Coding', color: 'from-green-500 to-emerald-600' },
  { id: 'deepseek/deepseek-chat-v3-0324', name: 'DeepSeek Chat v3 0324', description: 'Coding', category: 'Coding', color: 'from-green-500 to-emerald-600' },
  { id: 'qwen/qwen3-8b', name: 'Qwen3 8B', description: 'Coding', category: 'Coding', color: 'from-green-500 to-emerald-600' },
  // Experimental / General
  { id: 'meta-llama/llama-4-maverick', name: 'Llama 4 Maverick', description: 'Experimental / General', category: 'Experimental / General', color: 'from-purple-500 to-pink-600' },
  { id: 'mistralai/devstral-small', name: 'Devstral Small', description: 'Experimental / General', category: 'Experimental / General', color: 'from-purple-500 to-pink-600' },
  { id: 'deepseek/deepseek-r1', name: 'DeepSeek R1', description: 'Experimental / General', category: 'Experimental / General', color: 'from-purple-500 to-pink-600' },
];

interface ModelSelectorProps {
  selectedModel: string;
  onModelChange: (model: string) => void;
  disabled?: boolean;
}

export const ModelSelector = ({ selectedModel, onModelChange, disabled }: ModelSelectorProps) => {
  const currentModel = models.find(model => model.id === selectedModel);

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-slate-400 font-medium">Model:</span>
      <Select value={selectedModel} onValueChange={onModelChange} disabled={disabled}>
        <SelectTrigger className="w-[220px] bg-slate-800/50 border-slate-600 text-white hover:bg-slate-700/50 transition-all duration-200 shadow-lg">
          <SelectValue>
            <div className="flex items-center gap-3">
              <Badge 
                variant="outline" 
                className={`text-xs border-slate-600 bg-gradient-to-r ${currentModel?.color} text-white border-0`}
              >
                {currentModel?.category}
              </Badge>
              <span className="font-medium">{currentModel?.name}</span>
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="bg-slate-800 border-slate-700 shadow-2xl">
          {models.map((model) => (
            <SelectItem 
              key={model.id} 
              value={model.id}
              className="text-white hover:bg-slate-700 focus:bg-slate-700 cursor-pointer"
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3">
                  <Badge 
                    variant="outline" 
                    className={`text-xs bg-gradient-to-r ${model.color} text-white border-0`}
                  >
                    {model.category}
                  </Badge>
                  <span className="font-medium">{model.name}</span>
                </div>
                <span className="text-xs text-slate-400 ml-3">{model.description}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
