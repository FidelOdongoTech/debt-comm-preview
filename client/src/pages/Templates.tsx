import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2, Copy, Plus } from "lucide-react";
import { toast } from "sonner";

// Define the shape of a template
interface Template {
  id: number;
  name: string;
  description: string;
  customerSegment: string;
  channel: "email" | "sms" | "whatsapp";
  tone: string;
  subject: string;
  content: string;
  tags: string;
}

export default function Templates() {
  const [showForm, setShowForm] = useState(false);
  
  // Fake database (Local State)
  const [templates, setTemplates] = useState<Template[]>([
    {
      id: 1,
      name: "Example Template",
      description: "A starter template",
      customerSegment: "new",
      channel: "email",
      tone: "Friendly",
      subject: "Welcome!",
      content: "Hello, welcome to our service.",
      tags: "welcome"
    }
  ]);

  // FIX: Explicitly tell TypeScript that channel can be email, sms, OR whatsapp
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    customerSegment: "long-term",
    channel: "email" as "email" | "sms" | "whatsapp", 
    tone: "",
    subject: "",
    content: "",
    tags: "",
  });

  const handleSaveTemplate = () => {
    if (!formData.name || !formData.content || !formData.tone) {
      toast.error("Please fill in all required fields");
      return;
    }

    const newTemplate: Template = {
      id: Date.now(),
      name: formData.name,
      description: formData.description,
      customerSegment: formData.customerSegment,
      channel: formData.channel,
      tone: formData.tone,
      subject: formData.subject,
      content: formData.content,
      tags: formData.tags
    };

    setTemplates([...templates, newTemplate]);
    toast.success("Template saved successfully!");
    
    setFormData({
      name: "",
      description: "",
      customerSegment: "long-term",
      channel: "email",
      tone: "",
      subject: "",
      content: "",
      tags: "",
    });
    setShowForm(false);
  };

  const handleDeleteTemplate = (templateId: number) => {
    setTemplates(templates.filter(t => t.id !== templateId));
    toast.success("Template deleted");
  };

  const handleCopyTemplate = (template: any) => {
    const text = `${template.subject ? `Subject: ${template.subject}\n\n` : ""}${template.content}`;
    navigator.clipboard.writeText(text);
    toast.success("Template copied to clipboard!");
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            Message Template Library
          </h1>
          <p className="text-slate-600">
            Save and organize successful message templates by customer segment
          </p>
        </div>

        {/* New Template Button */}
        <div className="mb-6">
          <Button
            onClick={() => setShowForm(!showForm)}
            className="bg-slate-900 hover:bg-slate-800 text-white flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Template
          </Button>
        </div>

        {/* New Template Form */}
        {showForm && (
          <Card className="dashboard-card p-6 mb-8 space-y-4">
            <h2 className="text-xl font-semibold text-slate-900">Create New Template</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-slate-700 font-medium">Template Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Medical Hardship - Email"
                  className="form-input-smooth"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-slate-700 font-medium">Customer Segment *</Label>
                <Select
                  value={formData.customerSegment}
                  onValueChange={(value) =>
                    setFormData({ ...formData, customerSegment: value })
                  }
                >
                  <SelectTrigger className="form-input-smooth">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="long-term">Long-term Customer</SelectItem>
                    <SelectItem value="new">New Customer</SelectItem>
                    <SelectItem value="chronic_defaulter">Chronic Defaulter</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-700 font-medium">Channel *</Label>
                {/* FIX: Cast the value here to ensure TypeScript knows it's safe */}
                <Select
                  value={formData.channel}
                  onValueChange={(value) => setFormData({ ...formData, channel: value as "email" | "sms" | "whatsapp" })}
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

              <div className="space-y-2">
                <Label className="text-slate-700 font-medium">Tone *</Label>
                <Input
                  value={formData.tone}
                  onChange={(e) => setFormData({ ...formData, tone: e.target.value })}
                  placeholder="e.g., empathetic and supportive"
                  className="form-input-smooth"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-700 font-medium">Description</Label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Optional description"
                className="form-input-smooth"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-700 font-medium">Subject (for email)</Label>
              <Input
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="Email subject line"
                className="form-input-smooth"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-700 font-medium">Content *</Label>
              <Textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Message content"
                className="form-input-smooth min-h-32"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-700 font-medium">Tags</Label>
              <Input
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="e.g., medical, urgent"
                className="form-input-smooth"
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleSaveTemplate}
                className="bg-slate-900 hover:bg-slate-800 text-white"
              >
                Save Template
              </Button>
              <Button
                onClick={() => setShowForm(false)}
                variant="outline"
                className="border-slate-300 text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </Button>
            </div>
          </Card>
        )}

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <Card key={template.id} className="dashboard-card p-4 space-y-3 hover:shadow-lg transition-shadow">
              <div>
                <h3 className="font-semibold text-slate-900 text-lg">{template.name}</h3>
                {template.description && (
                  <p className="text-sm text-slate-600 mt-1">{template.description}</p>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="text-xs font-semibold px-2 py-1 bg-blue-50 text-blue-700 rounded">
                  {template.customerSegment}
                </span>
                <span className="text-xs font-semibold px-2 py-1 bg-teal-50 text-teal-700 rounded">
                  {template.channel.toUpperCase()}
                </span>
              </div>

              <div className="bg-slate-50 p-3 rounded border border-slate-200 max-h-24 overflow-y-auto">
                <p className="text-sm text-slate-700 line-clamp-4">{template.content}</p>
              </div>

              <div className="flex gap-2 pt-2 border-t border-slate-200">
                <Button
                  onClick={() => handleCopyTemplate(template)}
                  size="sm"
                  variant="outline"
                  className="flex-1 border-slate-300 text-slate-700 hover:bg-slate-50 text-xs"
                >
                  <Copy className="w-3 h-3 mr-1" />
                  Copy
                </Button>
                <Button
                  onClick={() => handleDeleteTemplate(template.id)}
                  size="sm"
                  variant="outline"
                  className="flex-1 border-red-300 text-red-700 hover:bg-red-50 text-xs"
                >
                  <Trash2 className="w-3 h-3 mr-1" />
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {templates.length === 0 && !showForm && (
          <Card className="dashboard-card p-8 text-center">
            <p className="text-slate-600 mb-4">No templates yet. Create your first template!</p>
            <Button
              onClick={() => setShowForm(true)}
              className="bg-slate-900 hover:bg-slate-800 text-white"
            >
              Create Template
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}