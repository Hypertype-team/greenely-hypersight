import { useState, useRef, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ChatMessage } from "./types";
import { ChatMessages } from "./ChatMessages";
import { ChatInput } from "./ChatInput";

export const ChatContainer = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      text: `# Welcome! 👋

I'm your Ticket Analysis Assistant. Ask me about:

* 📊 Common issues and trends
* 📑 Ticket summaries by category
* 🏢 Department justifications
* 📚 Documentation links

How can I help you today?`,
      isUser: false,
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setIsLoading(true);
    setMessages((prev) => [...prev, { text: userMessage, isUser: true }]);
    setInput("");

    // ✅ Correctly format chat history for OpenAI
    const chatHistory = messages.map(msg => ({
      role: msg.isUser ? "user" : "assistant",
      content: msg.text,
    }));

    // ✅ Convert messages into a formatted conversation history string
    // const conversationMemory = messages
    //   .slice(-9) // Limit memory to the last 5 messages
    //   .map(msg => `The ${msg.isUser ? "user" : "assistant"} said: ${msg.text}`)
    //   .join("\n");

    try {
      const { data, error } = await supabase.functions.invoke('analyze-tickets', {
        body: { query: userMessage, conversationMemory: chatHistory, company: 'greenely' }
      });

      if (error) {
        console.error('Function error:', error);
        throw error;
      }

      if (!data?.answer) {
        throw new Error('No answer received from analysis');
      }

      setMessages((prev) => [
        ...prev,
        {
          text: data.answer,
          isUser: false,
          followUpQuestions: [
            "What are the most common issues?",
            "Show me ticket summaries by category",
            "What are the department justifications?",
            "Are there any relevant documentation links?",
          ],
        },
      ]);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Analysis Failed",
        description: "I couldn't analyze the data right now. Please try again in a moment.",
        variant: "destructive",
      });
      setMessages((prev) => [
        ...prev,
        {
          text: "I apologize, but I encountered an error while analyzing the data. Please try asking your question again, or rephrase it slightly differently.",
          isUser: false,
          followUpQuestions: [
            "What are the most common issues?",
            "Show me ticket summaries by category",
            "What are the department justifications?",
            "Are there any relevant documentation links?",
          ],
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFollowUpClick = (question: string) => {
    setInput(question);
  };

  return (
    <div className="flex flex-col h-full bg-white shadow-lg">
      <div className="p-4 border-b bg-gradient-to-r from-purple-50 to-white">
        <h2 className="text-lg font-semibold text-gray-900">Ticket Analysis Assistant</h2>
        <p className="text-sm text-gray-700">Ask me anything about your tickets</p>
      </div>
      <ChatMessages 
        messages={messages} 
        onFollowUpClick={handleFollowUpClick} 
        scrollRef={scrollRef}
      />
      <ChatInput
        input={input}
        isLoading={isLoading}
        onInputChange={setInput}
        onSubmit={handleSubmit}
      />
    </div>
  );
};