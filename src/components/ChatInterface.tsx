import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Link2, Paperclip, Image, FileText, AlertCircle, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ModelSelector } from '@/components/ModelSelector';
import { CopyButton } from '@/components/CopyButton';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { apiService, chainModelsAPI, uploadFilesAPI } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { models } from '@/components/ModelSelector';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';

// Chain Model Selector Component
interface ChainModelSelectorProps {
  selectedModels: string[];
  onModelsChange: (models: string[]) => void;
}

const ChainModelSelector = ({ selectedModels, onModelsChange }: ChainModelSelectorProps) => {
  const addModel = (modelId: string) => {
    if (!selectedModels.includes(modelId)) {
      onModelsChange([...selectedModels, modelId]);
    }
  };

  const removeModel = (modelId: string) => {
    onModelsChange(selectedModels.filter(id => id !== modelId));
  };

  const moveModel = (fromIndex: number, toIndex: number) => {
    const newModels = [...selectedModels];
    const [movedModel] = newModels.splice(fromIndex, 1);
    newModels.splice(toIndex, 0, movedModel);
    onModelsChange(newModels);
  };

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-slate-400 font-medium">Chain Models:</span>
      <div className="flex items-center gap-2">
        {selectedModels.map((modelId, index) => {
          const model = models.find(m => m.id === modelId);
          return (
            <div key={modelId} className="flex items-center gap-2">
              <Badge 
                variant="outline" 
                className={`text-xs bg-gradient-to-r ${model?.color} text-white border-0 cursor-pointer hover:opacity-80 group relative`}
                onClick={() => removeModel(modelId)}
              >
                {model?.name}
                <span className="ml-1 text-xs group-hover:text-red-400">×</span>
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-slate-800 text-xs text-slate-300 px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                  Click to remove
                </div>
              </Badge>
              {index < selectedModels.length - 1 && (
                <span className="text-slate-400 text-xs">→</span>
              )}
            </div>
          );
        })}
        <Select onValueChange={addModel}>
          <SelectTrigger className="w-[140px] h-6 px-2 text-xs bg-slate-800/50 border-slate-600 text-slate-400 hover:text-emerald-400 hover:border-emerald-500">
            <SelectValue placeholder="+ Add Model" />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-700 shadow-2xl max-h-60">
            {models
              .filter(model => !selectedModels.includes(model.id))
              .map((model) => (
                <SelectItem 
                  key={model.id} 
                  value={model.id}
                  className="text-white hover:bg-slate-700 focus:bg-slate-700 cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="outline" 
                      className={`text-xs bg-gradient-to-r ${model.color} text-white border-0`}
                    >
                      {model.category}
                    </Badge>
                    <span className="text-sm">{model.name}</span>
                  </div>
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  model?: string;
  timestamp: Date;
  isChained?: boolean;
  chainResponses?: Array<{ model: string; response: string }>;
}

interface ChatInterfaceProps {
  chatId: string;
}

// Utility: Preprocess plain text to markdown for better formatting
function autoFormatMarkdown(text: string): string {
  // Convert 'Features:' or 'How to Use:' to headings
  let formatted = text.replace(/^(Features|How to Use|Conclusion|Future Trends|Applications of AI|Challenges and Ethical Considerations|Core AI Technologies|Key Types of AI):?/gim, (m) => `### ${m.replace(':','')}`);

  // Convert lines starting with dash, bullet, or similar to markdown bullets
  formatted = formatted.replace(/^(\s*[-•])\s?/gm, '- ');

  // Convert numbered steps to markdown ordered list
  formatted = formatted.replace(/^(\d+)\.\s+/gm, (m, n) => `${n}. `);

  // Add spacing before headings
  formatted = formatted.replace(/(\n)?(### )/g, '\n$2');

  // Remove duplicate blank lines
  formatted = formatted.replace(/\n{3,}/g, '\n\n');

  return formatted.trim();
}

export const ChatInterface = ({ chatId }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [selectedModel, setSelectedModel] = useState('mistralai/mistral-7b-instruct');
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [backendConnected, setBackendConnected] = useState<boolean | null>(null);
  const [chainMode, setChainMode] = useState(false);
  const [selectedChainModels, setSelectedChainModels] = useState<string[]>(['mistralai/mistral-7b-instruct', 'deepseek/deepseek-chat']);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Check backend connectivity on component mount
  useEffect(() => {
    const checkBackend = async () => {
      try {
        const isConnected = await apiService.healthCheck();
        setBackendConnected(isConnected);
        if (!isConnected) {
          toast({
            title: "Backend Connection Failed",
            description: "Unable to connect to the AI backend. Please ensure the server is running.",
            variant: "destructive",
          });
        }
      } catch (error) {
        setBackendConnected(false);
        toast({
          title: "Backend Connection Failed",
          description: "Unable to connect to the AI backend. Please ensure the server is running.",
          variant: "destructive",
        });
      }
    };
    
    checkBackend();
  }, [toast]);

  const callModelAPI = async (prompt: string, model: string): Promise<string> => {
    try {
      const result = await apiService.askModel(prompt, model);
      return result.response;
    } catch (error) {
      console.error(`Error calling model ${model}:`, error);
      throw error;
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setUploadedFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSend = async () => {
    if (!input.trim() && uploadedFiles.length === 0) return;
    if (backendConnected === false) {
      toast({
        title: "Backend Not Connected",
        description: "Please ensure the AI backend server is running before sending messages.",
        variant: "destructive",
      });
      return;
    }

    let messageContent = input;
    let extractedText = '';
    if (uploadedFiles.length > 0) {
      setIsLoading(true);
      try {
        const uploadResult = await uploadFilesAPI(uploadedFiles);
        extractedText = uploadResult.files.map((f: any) => `\n[${f.filename}]\n${f.text}`).join('\n\n');
      } catch (err) {
        toast({
          title: "File Processing Error",
          description: err instanceof Error ? err.message : String(err),
          variant: "destructive",
        });
      }
    }
    if (extractedText) {
      messageContent += `\n\n${extractedText}`;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      content: messageContent,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setUploadedFiles([]);
    setIsLoading(true);

    try {
      if (chainMode && selectedChainModels.length > 1) {
        // Chain mode: use multiple models
        const chainResponse = await chainModelsAPI(messageContent, selectedChainModels);
        const finalResponse = chainResponse.responses[chainResponse.responses.length - 1].response;
        const botMessage: Message = {
          id: `${Date.now()}-chain`,
          content: finalResponse,
          isUser: false,
          model: selectedChainModels.join(' → '),
          timestamp: new Date(),
          isChained: true,
          chainResponses: chainResponse.responses
        };
        setMessages(prev => [...prev, botMessage]);
      } else if (chainMode && selectedChainModels.length === 1) {
        // Chain mode with single model (fallback to single model)
        const response = await apiService.askModel(messageContent, selectedChainModels[0]);
        const botMessage: Message = {
          id: `${Date.now()}-single`,
          content: response.response,
          isUser: false,
          model: selectedChainModels[0],
          timestamp: new Date(),
          isChained: false
        };
        setMessages(prev => [...prev, botMessage]);
      } else {
        // Single model mode
        const response = await apiService.askModel(messageContent, selectedModel);
        const botMessage: Message = {
          id: `${Date.now()}-single`,
          content: response.response,
          isUser: false,
          model: selectedModel,
          timestamp: new Date(),
          isChained: false
        };
        setMessages(prev => [...prev, botMessage]);
      }
    } catch (error) {
      console.error('Error generating response:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate response",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="border-b border-slate-700/50 bg-slate-900/30 backdrop-blur-sm p-4 shadow-lg">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
            AI Assistant Pro
          </h1>
          <div className="flex items-center gap-4">
            {/* Backend Status Indicator */}
            {backendConnected !== null && (
              <Badge 
                variant={backendConnected ? "default" : "destructive"} 
                className={`text-xs ${backendConnected ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'}`}
              >
                {backendConnected ? 'Backend Connected' : 'Backend Offline'}
              </Badge>
            )}
            <Badge variant="outline" className="text-slate-400 border-slate-600 bg-slate-800/50">
              {selectedModel}
            </Badge>
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-6">
        <div className="max-w-4xl mx-auto space-y-8">
          {messages.length === 0 && (
            <div className="text-center py-20">
              <div className="bg-gradient-to-r from-emerald-500 to-teal-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
                <Bot className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-slate-200 mb-4">
                Welcome to AI Assistant Pro
              </h2>
              <p className="text-slate-400 max-w-md mx-auto mb-6">
                Start a conversation, upload files, or enable chain mode to connect multiple AI models for enhanced responses
              </p>
              <div className="max-w-lg mx-auto">
                <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
                  <h3 className="text-lg font-semibold text-emerald-400 mb-2 flex items-center gap-2">
                    <Link2 className="h-5 w-5" />
                    Chain Mode Features
                  </h3>
                  <ul className="text-sm text-slate-300 space-y-1 text-left">
                    <li>• Connect multiple AI models in sequence</li>
                    <li>• Each model's output becomes the next model's input</li>
                    <li>• Combine different model strengths (coding, chat, multilingual)</li>
                    <li>• View the complete chain process step-by-step</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
          
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-4 ${message.isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex gap-4 max-w-4xl ${message.isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                {/* Avatar */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg ${
                  message.isUser 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600' 
                    : 'bg-gradient-to-r from-emerald-500 to-teal-600'
                }`}>
                  {message.isUser ? (
                    <User className="h-5 w-5 text-white" />
                  ) : (
                    <Bot className="h-5 w-5 text-white" />
                  )}
                </div>
                
                {/* Message Content */}
                <div className={`rounded-2xl px-6 py-4 shadow-lg ${
                  message.isUser
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                    : 'bg-slate-800/80 text-slate-100 border border-slate-700/50 backdrop-blur-sm'
                }`}>
                  {!message.isUser && message.model && (
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs bg-slate-700 text-slate-300 border-slate-600">
                          {message.model}
                        </Badge>
                        {message.isChained && (
                          <Link2 className="h-3 w-3 text-emerald-400" />
                        )}
                      </div>
                      <CopyButton text={message.content} />
                    </div>
                  )}
                  {/* Markdown Message Content */}
                  <div className="prose prose-invert max-w-none text-slate-100">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeHighlight]}
                      components={{
                        code({node, inline, className, children, ...props}: any) {
                          return !inline ? (
                            <div className="relative group my-2">
                              <pre className={`rounded-lg bg-slate-900/80 border border-slate-700/60 p-4 overflow-x-auto text-sm font-mono ${className || ''}`}
                                {...props}
                              >
                                <code>{children}</code>
                              </pre>
                              <CopyButton
                                text={String(children)}
                              />
                            </div>
                          ) : (
                            <code className={`bg-slate-800/70 px-1.5 py-0.5 rounded text-emerald-300 font-mono text-sm ${className || ''}`}>{children}</code>
                          );
                        }
                      }}
                    >
                      {message.isUser ? message.content : autoFormatMarkdown(message.content)}
                    </ReactMarkdown>
                  </div>
                  
                  {/* Chain Responses */}
                  {message.isChained && message.chainResponses && message.chainResponses.length > 1 && (
                    <div className="mt-4 space-y-3">
                      <div className="text-xs text-slate-400 font-medium">Chain Process:</div>
                      {message.chainResponses.map((chainResponse, index) => (
                        <div key={index} className="bg-slate-700/30 rounded-lg p-3 border border-slate-600/50">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="text-xs bg-slate-600 text-slate-300 border-slate-500">
                              Step {index + 1}: {models.find(m => m.id === chainResponse.model)?.name || chainResponse.model}
                            </Badge>
                            {index < message.chainResponses!.length - 1 && (
                              <span className="text-slate-400 text-xs">→</span>
                            )}
                          </div>
                          <p className="text-sm text-slate-300 whitespace-pre-wrap">
                            {chainResponse.response}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex gap-4 justify-start">
              <div className="flex gap-4 max-w-4xl">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
                  <Bot className="h-5 w-5 text-white" />
                </div>
                <div className="bg-slate-800/80 rounded-2xl px-6 py-4 border border-slate-700/50 backdrop-blur-sm shadow-lg">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="border-t border-slate-700/50 bg-slate-900/30 backdrop-blur-sm p-6 shadow-2xl">
        <div className="max-w-4xl mx-auto space-y-4">
          {/* File Upload Area */}
          {uploadedFiles.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {uploadedFiles.map((file, index) => (
                <div key={index} className="flex items-center gap-2 bg-slate-800/50 rounded-lg px-3 py-2 border border-slate-600">
                  {file.type.startsWith('image/') ? (
                    <Image className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <FileText className="h-4 w-4 text-emerald-400" />
                  )}
                  <span className="text-sm text-slate-300 truncate max-w-32">{file.name}</span>
                  <button
                    onClick={() => removeFile(index)}
                    className="text-slate-400 hover:text-red-400 ml-1"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Controls */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-6">
              {/* Chain Mode Toggle */}
              <div className="flex items-center gap-3">
                <Switch
                  id="chain-mode"
                  checked={chainMode}
                  onCheckedChange={setChainMode}
                  className="data-[state=checked]:bg-emerald-600"
                />
                <Label htmlFor="chain-mode" className="text-sm text-slate-300 font-medium cursor-pointer">
                  Chain Mode
                </Label>
                {chainMode && (
                  <Badge variant="outline" className="text-xs bg-emerald-600/20 text-emerald-400 border-emerald-500">
                    <Link2 className="h-3 w-3 mr-1" />
                    {selectedChainModels.length} Models
                  </Badge>
                )}
              </div>
              
              {/* Chain Mode Warning */}
              {chainMode && selectedChainModels.length === 0 && (
                <Alert className="bg-amber-900/20 border-amber-600/50 text-amber-300">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Please add at least one model to the chain.
                  </AlertDescription>
                </Alert>
              )}
              
              {/* Model Selector */}
              {!chainMode ? (
                <ModelSelector
                  selectedModel={selectedModel}
                  onModelChange={setSelectedModel}
                />
              ) : (
                <ChainModelSelector
                  selectedModels={selectedChainModels}
                  onModelsChange={setSelectedChainModels}
                />
              )}
            </div>
          </div>
          
          {/* Input */}
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Type your message..."
                className="min-h-[80px] max-h-40 bg-slate-800/50 border-slate-600 text-white placeholder-slate-400 resize-none pr-20 rounded-2xl shadow-lg backdrop-blur-sm focus:border-emerald-500 focus:ring-emerald-500/20 transition-all duration-200"
                disabled={isLoading}
              />
              <div className="absolute bottom-3 right-3 flex gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                  accept="image/*,.pdf,.doc,.docx,.txt"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="h-8 w-8 p-0 text-slate-400 hover:text-emerald-400 hover:bg-slate-700/50"
                >
                  <Paperclip className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <Button
              onClick={handleSend}
              disabled={
                (!input.trim() && uploadedFiles.length === 0) || 
                isLoading || 
                (chainMode && selectedChainModels.length === 0)
              }
              className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white border-0 h-[80px] px-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
      
      <Input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileUpload}
        className="hidden"
        accept="image/*,.pdf,.doc,.docx,.txt"
      />
    </div>
  );
};
