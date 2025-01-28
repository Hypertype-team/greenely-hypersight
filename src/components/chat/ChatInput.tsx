import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ChatInputProps {
  input: string;
  isLoading: boolean;
  onInputChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const ChatInput = ({
  input,
  isLoading,
  onInputChange,
  onSubmit,
}: ChatInputProps) => {
  return (
    <form onSubmit={onSubmit} className="border-t border-[#333] p-4 bg-[#1e1e1e]">
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          placeholder="Ask about your ticket data..."
          className="flex-1 bg-[#2A2A2A] border-[#333] text-[#D6BCFA] placeholder:text-[#666]"
          disabled={isLoading}
        />
        <Button 
          type="submit" 
          disabled={isLoading}
          className="bg-[#2A2A2A] hover:bg-[#333] text-white"
        >
          {isLoading ? "Analyzing..." : "Send"}
        </Button>
      </div>
    </form>
  );
};