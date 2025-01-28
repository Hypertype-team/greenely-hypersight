import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronDown, ChevronUp, ExternalLink, Filter } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

export const TicketAnalysisTable = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedTheme, setSelectedTheme] = useState<string>("");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("All");
  const [sortAscending, setSortAscending] = useState(false);
  const [expandedTickets, setExpandedTickets] = useState<string[]>([]);

  const { data: allTickets, isLoading } = useQuery({
    queryKey: ["tickets"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ticket_analysis")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          <p>Loading ticket analysis data...</p>
        </div>
      </Card>
    );
  }

  // Get unique values for filters
  const reportPeriods = [...new Set(allTickets?.map(ticket => ticket.report_period))];
  
  // Filter tickets based on selected filters
  const filteredTickets = allTickets?.filter(ticket => {
    if (selectedPeriod && ticket.report_period !== selectedPeriod) return false;
    if (selectedCategory && ticket.category !== selectedCategory) return false;
    if (selectedTheme && ticket.subcategory !== selectedTheme) return false;
    if (selectedDepartment !== "All" && ticket.responsible_department !== selectedDepartment) return false;
    return true;
  });

  // Get categories with counts
  const categories = [...new Set(filteredTickets?.map(ticket => ticket.category))]
    .map(category => ({
      name: category,
      count: filteredTickets?.filter(t => t.category === category).length || 0
    }))
    .sort((a, b) => {
      if (a.name === "Batterier") return -1;
      if (b.name === "Batterier") return 1;
      if (a.name === "Andra") return 1;
      if (b.name === "Andra") return -1;
      return a.name.localeCompare(b.name);
    });

  // Get themes with counts for selected category
  const themes = selectedCategory ? 
    [...new Set(filteredTickets?.filter(t => t.category === selectedCategory)
      .map(ticket => ticket.subcategory))]
      .map(theme => ({
        name: theme,
        count: filteredTickets?.filter(t => t.subcategory === theme).length || 0
      }))
      .sort((a, b) => sortAscending ? a.count - b.count : b.count - a.count)
    : [];

  // Get departments
  const departments = ["All", ...new Set(filteredTickets?.map(ticket => ticket.responsible_department))];

  const handleSelectChange = (value: string, setter: (value: string) => void) => {
    setter(value);
    // Keep dropdown open by simulating a click
    setTimeout(() => {
      const event = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        view: window
      });
      document.querySelector('[role="combobox"]')?.dispatchEvent(event);
    }, 0);
  };

  // Group tickets by common issue
  const groupedByIssue = filteredTickets?.reduce((acc, ticket) => {
    const issue = ticket.common_issue || "Uncategorized";
    if (!acc[issue]) {
      acc[issue] = {
        tickets: [],
        count: 0,
        summary: ticket.issue_summary,
        department: ticket.responsible_department
      };
    }
    acc[issue].tickets.push(ticket);
    acc[issue].count += 1;
    return acc;
  }, {} as Record<string, { tickets: any[]; count: number; summary: string; department: string }>);

  const sortedIssues = Object.entries(groupedByIssue || {})
    .sort(([, a], [, b]) => sortAscending ? a.count - b.count : b.count - a.count);

  const toggleTickets = (issueId: string) => {
    setExpandedTickets(prev => 
      prev.includes(issueId) 
        ? prev.filter(id => id !== issueId)
        : [...prev, issueId]
    );
  };

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto">
      <Card className="overflow-hidden">
        <div className="p-6 bg-gradient-to-br from-purple-50 to-white">
          <div className="flex items-center gap-2 mb-6">
            <Filter className="w-5 h-5 text-purple-500" />
            <h2 className="text-lg font-semibold text-gray-900">Filter Tickets</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium block text-gray-700">Report Period</label>
              <Select 
                value={selectedPeriod} 
                onValueChange={(value) => handleSelectChange(value, setSelectedPeriod)}
              >
                <SelectTrigger className="w-full bg-white border-gray-200 hover:border-purple-200 transition-colors">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  {reportPeriods.map(period => (
                    <SelectItem key={period} value={period} className="hover:bg-purple-50">
                      {period}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium block text-gray-700">Category</label>
              <Select 
                value={selectedCategory} 
                onValueChange={(value) => handleSelectChange(value, setSelectedCategory)}
              >
                <SelectTrigger className="w-full bg-white border-gray-200 hover:border-purple-200 transition-colors">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(({ name, count }) => (
                    <SelectItem key={name} value={name} className="hover:bg-purple-50">
                      {name} ({count} tickets)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium block text-gray-700">Theme</label>
              <Select 
                value={selectedTheme} 
                onValueChange={(value) => handleSelectChange(value, setSelectedTheme)}
              >
                <SelectTrigger className="w-full bg-white border-gray-200 hover:border-purple-200 transition-colors">
                  <SelectValue placeholder="Select theme" />
                </SelectTrigger>
                <SelectContent>
                  {themes.map(({ name, count }) => (
                    <SelectItem key={name} value={name} className="hover:bg-purple-50">
                      {name} ({count} tickets)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium block text-gray-700">Department</label>
              <Select 
                value={selectedDepartment} 
                onValueChange={(value) => handleSelectChange(value, setSelectedDepartment)}
              >
                <SelectTrigger className="w-full bg-white border-gray-200 hover:border-purple-200 transition-colors">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map(dept => (
                    <SelectItem key={dept} value={dept} className="hover:bg-purple-50">
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-2 border-t pt-4 border-gray-100">
            <Checkbox
              id="sortOrder"
              checked={sortAscending}
              onCheckedChange={(checked) => setSortAscending(checked as boolean)}
              className="border-gray-300 data-[state=checked]:bg-purple-500 data-[state=checked]:border-purple-500"
            />
            <label htmlFor="sortOrder" className="text-sm text-gray-600 select-none cursor-pointer">
              Sort by Ticket Volume (Ascending)
            </label>
          </div>
        </div>
      </Card>

      <div className="space-y-6">
        {selectedTheme && (
          <h3 className="text-xl font-semibold text-gray-900">
            {selectedTheme} ({filteredTickets?.length || 0} total tickets)
          </h3>
        )}
        
        {sortedIssues.map(([issue, { tickets, count, summary, department }], index) => (
          <Card key={issue} className="p-6 bg-white shadow-sm">
            <div className="space-y-4">
              <div className="border-b pb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  {index + 1}. {issue} ({count} tickets)
                </h2>
                <p className="text-gray-700 mt-2">
                  <span className="font-medium">Summary:</span> {summary}
                </p>
                <p className="text-gray-700">
                  <span className="font-medium">Responsible Department:</span> {department}
                </p>
              </div>
              
              <div className="pt-2">
                <Button
                  variant="ghost"
                  className="text-gray-700 hover:text-gray-900"
                  onClick={() => toggleTickets(issue)}
                >
                  View Tickets {expandedTickets.includes(issue) ? <ChevronUp className="ml-2 h-4 w-4" /> : <ChevronDown className="ml-2 h-4 w-4" />}
                </Button>
                
                <Collapsible open={expandedTickets.includes(issue)}>
                  <CollapsibleContent className="space-y-4 mt-4">
                    {tickets.map((ticket, ticketIndex) => (
                      <div key={ticket.id} className="pl-4 border-l-2 border-gray-200">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-medium text-gray-900">Ticket {ticketIndex + 1}:</h3>
                          {ticket.link && (
                            <Button variant="link" size="sm" className="text-blue-600 hover:text-blue-700" asChild>
                              <a href={ticket.link} target="_blank" rel="noopener noreferrer">
                                View Issue <ExternalLink className="ml-1 h-4 w-4" />
                              </a>
                            </Button>
                          )}
                        </div>
                        <div className="space-y-2">
                          <div>
                            <p className="font-medium text-gray-900">Ticket Issue:</p>
                            <p className="text-gray-700">{ticket.issue}</p>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">Ticket Summary:</p>
                            <p className="text-gray-700">{ticket.summary}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};