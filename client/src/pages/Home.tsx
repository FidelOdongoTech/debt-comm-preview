import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Send, Copy, CheckCircle2, Save, BookOpen } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";

interface GeneratedMessage {
  channel: string;
  tone: string;
  subject?: string;
  content: string;
}

export default function Home() {
  // Authentication state
  const { user, isAuthenticated } = useAuth();

  const [formData, setFormData] = useState({
    name: "Fidel Omondi",
    debt_amount: 50000,
    days_past_due: 45,
    customer_segment: "long-term",
    hardship_reason: "medical bills",
    preferred_channel: "email",
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [message, setMessage] = useState<GeneratedMessage | null>(null);
  const [copied, setCopied] = useState(false);
  const [messageHistory, setMessageHistory] = useState<any[]>([]);
  const [, setLocation] = useLocation();
  const saveMutation = trpc.templates.save.useMutation();

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "debt_amount" || name === "days_past_due"
          ? parseFloat(value) || 0
          : value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const generateMessage = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch("/api/trpc/debtComm.generateMessage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          json: formData,
        }),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to generate message");
      }

      const data = await response.json();
      console.log("API Response:", data);
      const messageData = data.result?.data?.json || data.result?.data;
      if (!messageData || !messageData.content) {
        console.error("Invalid message data:", messageData);
        throw new Error("Invalid response format");
      }
      setMessage(messageData);
      setMessageHistory(prev => [{ message: messageData, customerName: formData.name, timestamp: new Date() }, ...prev.slice(0, 9)]);
      toast.success("Message generated successfully!");
    } catch (error) {
      toast.error("Error generating message. Please try again.");
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    if (message) {
      const fullText = `${message.subject ? `Subject: ${message.subject}\n\n` : ""}${message.content}`;
      navigator.clipboard.writeText(fullText);
      setCopied(true);
      toast.success("Copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const saveAsTemplate = async () => {
    if (!message) return;
    try {
      await saveMutation.mutateAsync({
        name: `${formData.name} - ${formData.customer_segment}`,
        description: `Auto-saved from ${formData.preferred_channel} message`,
        customerSegment: formData.customer_segment as any,
        channel: formData.preferred_channel as any,
        tone: message.tone,
        subject: message.subject,
        content: message.content,
      });
      toast.success("Template saved! View in Templates library.");
    } catch (error) {
      toast.error("Failed to save template");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="container py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Debt Communication Engine
              </h1>
              <p className="text-slate-600 mt-1">
                AI-Powered Personalized Debt Collection Messages
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Button
                onClick={() => setLocation("/templates")}
                variant="outline"
                className="border-slate-300 text-slate-700 hover:bg-slate-50 flex items-center gap-2"
              >
                <BookOpen className="w-4 h-4" />
                Template Library
              </Button>
              <div className="inline-block px-4 py-2 bg-teal-50 border border-teal-200 rounded-lg">
                <span className="text-sm font-semibold text-teal-700">
                  Live Preview
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Form Section (60%) */}
          <div className="lg:col-span-3">
            <Card className="dashboard-card p-6 space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-slate-900 mb-4">
                  Customer Profile
                </h2>
                <p className="text-sm text-slate-600 mb-4">
                  Enter customer details to generate a personalized message
                </p>
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-xs font-semibold text-blue-700 mb-3">Quick Presets</p>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setFormData({
                        name: "Sarah Mwangi",
                        debt_amount: 75000,
                        days_past_due: 60,
                        customer_segment: "long-term",
                        hardship_reason: "medical bills",
                        preferred_channel: "email",
                      })}
                      className="text-xs"
                    >
                      Medical Hardship
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setFormData({
                        name: "James Kipchoge",
                        debt_amount: 150000,
                        days_past_due: 120,
                        customer_segment: "chronic_defaulter",
                        hardship_reason: "",
                        preferred_channel: "sms",
                      })}
                      className="text-xs"
                    >
                      Chronic Defaulter
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setFormData({
                        name: "Grace Omondi",
                        debt_amount: 25000,
                        days_past_due: 15,
                        customer_segment: "new",
                        hardship_reason: "job loss",
                        preferred_channel: "whatsapp",
                      })}
                      className="text-xs"
                    >
                      Job Loss
                    </Button>
                  </div>
                </div>
              </div>

              {/* Customer Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-slate-700 font-medium">
                  Customer Name
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., John Doe"
                  className="form-input-smooth"
                />
              </div>

              {/* Debt Amount */}
              <div className="space-y-2">
                <Label htmlFor="debt_amount" className="text-slate-700 font-medium">
                  Debt Amount (KSH)
                </Label>
                <Input
                  id="debt_amount"
                  name="debt_amount"
                  type="number"
                  step="0.01"
                  value={formData.debt_amount}
                  onChange={handleInputChange}
                  placeholder="e.g., 50000"
                  className="form-input-smooth"
                />
              </div>

              {/* Days Past Due */}
              <div className="space-y-2">
                <Label htmlFor="days_past_due" className="text-slate-700 font-medium">
                  Days Past Due
                </Label>
                <Input
                  id="days_past_due"
                  name="days_past_due"
                  type="number"
                  value={formData.days_past_due}
                  onChange={handleInputChange}
                  placeholder="e.g., 45"
                  className="form-input-smooth"
                />
              </div>

              {/* Customer Segment */}
              <div className="space-y-2">
                <Label className="text-slate-700 font-medium">
                  Customer Segment
                </Label>
                <Select
                  value={formData.customer_segment}
                  onValueChange={(value) =>
                    handleSelectChange("customer_segment", value)
                  }
                >
                  <SelectTrigger className="form-input-smooth">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="long-term">Long-term Customer</SelectItem>
                    <SelectItem value="new">New Customer</SelectItem>
                    <SelectItem value="chronic_defaulter">
                      Chronic Defaulter
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Hardship Reason */}
              <div className="space-y-2">
                <Label className="text-slate-700 font-medium">
                  Hardship Reason (Optional)
                </Label>
                <Select
                  value={formData.hardship_reason || "none"}
                  onValueChange={(value) =>
                    handleSelectChange("hardship_reason", value === "none" ? "" : value)
                  }
                >
                  <SelectTrigger className="form-input-smooth">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="medical bills">Medical Bills</SelectItem>
                    <SelectItem value="job loss">Job Loss</SelectItem>
                    <SelectItem value="family emergency">
                      Family Emergency
                    </SelectItem>
                    <SelectItem value="natural disaster">
                      Natural Disaster
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Preferred Channel */}
              <div className="space-y-2">
                <Label className="text-slate-700 font-medium">
                  Preferred Channel
                </Label>
                <Select
                  value={formData.preferred_channel}
                  onValueChange={(value) =>
                    handleSelectChange("preferred_channel", value)
                  }
                >
                  <SelectTrigger className="form-input-smooth">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="sms">SMS</SelectItem>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Generate Button */}
              <div className="flex gap-2">
                <Button
                  onClick={generateMessage}
                  disabled={isGenerating}
                  className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-semibold py-2 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Generate Message
                  </>
                )}
              </Button>
                {message && (
                  <Button
                    onClick={generateMessage}
                    disabled={isGenerating}
                    variant="outline"
                    className="px-4 border-slate-300 text-slate-700 hover:bg-slate-50"
                  >
                    Regenerate
                  </Button>
                )}
              </div>
            </Card>
          </div>

          {/* Preview Section (40%) */}
          <div className="lg:col-span-2">
            <Card className="dashboard-card p-6 h-full flex flex-col">
              <div className="mb-4">
                <h2 className="text-xl font-semibold text-slate-900">
                  Generated Message
                </h2>
                <p className="text-sm text-slate-600 mt-1">
                  Real-time preview
                </p>
              </div>

              {message ? (
                <div className="flex-1 flex flex-col space-y-4">
                  {/* Metadata */}
                  <div className="space-y-2 pb-4 border-b border-slate-200">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-semibold text-slate-500 uppercase">
                        Channel
                      </span>
                      <span className="text-sm font-medium text-teal-700 bg-teal-50 px-3 py-1 rounded-full">
                        {message?.channel?.toUpperCase() || 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-semibold text-slate-500 uppercase">
                        Tone
                      </span>
                      <span className="text-sm text-slate-700">
                        {message?.tone || 'N/A'}
                      </span>
                    </div>
                  </div>

                  {/* Message Content */}
                  <div className="flex-1 overflow-y-auto">
                    {message?.subject && (
                      <div className="mb-4">
                        <p className="text-xs font-semibold text-slate-500 uppercase mb-1">
                          Subject
                        </p>
                        <p className="text-sm font-medium text-slate-900">
                          {message.subject}
                        </p>
                      </div>
                    )}
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase mb-2">
                        Message
                      </p>
                      <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                        {message?.content || 'No message generated'}
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 mt-4">
                    <Button
                      onClick={copyToClipboard}
                      variant="outline"
                      className="flex-1 border-slate-300 text-slate-700 hover:bg-slate-50 text-sm"
                    >
                      {copied ? 'Copied!' : 'Copy'}
                    </Button>
                    <Button
                      onClick={() => {
                        const text = message.subject ? message.subject + '\n\n' + message.content : message.content;
                        const el = document.createElement('a');
                        el.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
                        el.setAttribute('download', 'message.txt');
                        el.style.display = 'none';
                        document.body.appendChild(el);
                        el.click();
                        document.body.removeChild(el);
                        toast.success('Downloaded!');
                      }}
                      variant="outline"
                      className="flex-1 border-slate-300 text-slate-700 hover:bg-slate-50 text-sm"
                    >
                      Download
                    </Button>
                    <Button
                      onClick={saveAsTemplate}
                      disabled={saveMutation.isPending}
                      className="flex-1 bg-teal-600 hover:bg-teal-700 text-white text-sm flex items-center justify-center gap-1"
                    >
                      <Save className="w-3 h-3" />
                      {saveMutation.isPending ? 'Saving...' : 'Save Template'}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-center">
                  <div>
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
                      <Send className="w-6 h-6 text-slate-400" />
                    </div>
                    <p className="text-slate-600 text-sm">
                      Fill in the customer profile and click "Generate Message"
                      to see the AI-powered personalized message here.
                    </p>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="dashboard-card p-6">
            <h3 className="font-semibold text-slate-900 mb-2">
              Empathetic Tone
            </h3>
            <p className="text-sm text-slate-600">
              Messages adapt to customer hardship reasons, showing genuine support
              and understanding.
            </p>
          </Card>
          <Card className="dashboard-card p-6">
            <h3 className="font-semibold text-slate-900 mb-2">
              Channel Optimized
            </h3>
            <p className="text-sm text-slate-600">
              Content is formatted specifically for email, SMS, or WhatsApp
              communication.
            </p>
          </Card>
          <Card className="dashboard-card p-6">
            <h3 className="font-semibold text-slate-900 mb-2">
              Compliance Ready
            </h3>
            <p className="text-sm text-slate-600">
              All messages maintain professional standards and regulatory
              compliance.
            </p>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-12">
        <div className="container py-6 text-center text-sm text-slate-600">
          <p>
            Debt Communication Engine Preview • Powered by AI • For testing
            purposes
          </p>
        </div>
      </footer>
    </div>
  );
}
