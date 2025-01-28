import { Layout } from "@/components/Layout";
import { TicketAnalysisTable } from "@/components/TicketAnalysisTable";
import { CategoryBreakdownChart } from "@/components/CategoryBreakdownChart";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Index = () => {
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState("Dec 01 - Dec 15");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [subcategoryFilter, setSubcategoryFilter] = useState("");
  const [commonIssueFilter, setCommonIssueFilter] = useState("");

  const { data: dashboardData } = useQuery({
    queryKey: ["dashboard-info"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ticket_analysis")
        .select("*");
      
      if (error) throw error;
      return data;
    },
  });

  const totalTickets = dashboardData?.length || 0;
  const categories = [...new Set(dashboardData?.map(ticket => ticket.category) || [])];

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">HyperSight Dashboard</h1>
        
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-6">
            <div className="space-y-2">
              <div>
                <span className="font-medium">Total Tickets: </span>
                <span>{totalTickets}</span>
              </div>
            </div>
            <div></div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Report Period</p>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger>
                  <SelectValue>{selectedPeriod}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Dec 01 - Dec 15">Dec 01 - Dec 15</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <TicketAnalysisTable />

        {showAnalysis && (
          <>
            <div 
              className="fixed inset-0 bg-black/20 z-40"
              onClick={() => setShowAnalysis(false)}
            />
            <div className="fixed top-0 right-0 w-full md:w-1/2 h-full bg-background p-6 shadow-lg animate-slideIn z-50">
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-4"
                onClick={() => setShowAnalysis(false)}
              >
                <X className="h-4 w-4" />
              </Button>
              <CategoryBreakdownChart showAnalysisPanel={true} />
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default Index;