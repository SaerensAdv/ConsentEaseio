import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import DashboardLayout from "./layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Headset, Lightbulb, CheckCircle } from "@phosphor-icons/react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Spinner } from "@/components/ui/spinner";

export default function SupportPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("support");

  const [supportForm, setSupportForm] = useState({
    subject: "",
    message: "",
  });

  const [feedbackForm, setFeedbackForm] = useState({
    title: "",
    description: "",
    type: "feedback" as "feedback" | "feature-request" | "improvement",
  });

  const [supportSubmitted, setSupportSubmitted] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  const supportMutation = useMutation({
    mutationFn: async (data: typeof supportForm) => {
      const res = await apiRequest("POST", "/api/support/ticket", data);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Ticket submitted", description: "We'll get back to you as soon as possible." });
      setSupportForm({ subject: "", message: "" });
      setSupportSubmitted(true);
    },
    onError: () => {
      toast({ title: "Something went wrong", description: "Please try again later.", variant: "destructive" });
    },
  });

  const feedbackMutation = useMutation({
    mutationFn: async (data: typeof feedbackForm) => {
      const res = await apiRequest("POST", "/api/feedback", data);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Feedback submitted", description: "Thank you for your input!" });
      setFeedbackForm({ title: "", description: "", type: "feedback" });
      setFeedbackSubmitted(true);
    },
    onError: () => {
      toast({ title: "Something went wrong", description: "Please try again later.", variant: "destructive" });
    },
  });

  const handleSupportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportForm.subject.trim() || !supportForm.message.trim()) return;
    supportMutation.mutate(supportForm);
  };

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackForm.title.trim() || !feedbackForm.description.trim()) return;
    feedbackMutation.mutate(feedbackForm);
  };

  return (
    <DashboardLayout>
      <div className="p-6 max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-display font-bold" data-testid="text-support-title">
            Help & Feedback
          </h1>
          <p className="text-muted-foreground mt-1">
            Get support or share your ideas to help us improve ConsentEase.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setSupportSubmitted(false); setFeedbackSubmitted(false); }}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="support" className="gap-2" data-testid="tab-support">
              <Headset size={16} />
              Support Ticket
            </TabsTrigger>
            <TabsTrigger value="feedback" className="gap-2" data-testid="tab-feedback">
              <Lightbulb size={16} />
              Feedback
            </TabsTrigger>
          </TabsList>

          <TabsContent value="support" className="mt-6">
            {supportSubmitted ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <CheckCircle size={48} className="text-green-500 mb-4" />
                  <h3 className="text-lg font-semibold mb-2" data-testid="text-support-success">Ticket submitted!</h3>
                  <p className="text-muted-foreground mb-6 max-w-sm">
                    We've received your support request and will get back to you as soon as possible.
                  </p>
                  <Button variant="outline" onClick={() => setSupportSubmitted(false)} data-testid="button-new-ticket">
                    Submit another ticket
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Submit a Support Ticket</CardTitle>
                  <CardDescription>
                    Having an issue? Describe your problem and we'll help you resolve it.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSupportSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="support-subject">Subject</Label>
                      <Input
                        id="support-subject"
                        data-testid="input-support-subject"
                        placeholder="Brief description of the issue"
                        value={supportForm.subject}
                        onChange={(e) => setSupportForm({ ...supportForm, subject: e.target.value })}
                        maxLength={200}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="support-message">Message</Label>
                      <Textarea
                        id="support-message"
                        data-testid="input-support-message"
                        placeholder="Please describe the issue in detail. Include steps to reproduce if applicable."
                        rows={6}
                        value={supportForm.message}
                        onChange={(e) => setSupportForm({ ...supportForm, message: e.target.value })}
                        maxLength={5000}
                        required
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={supportMutation.isPending}
                      data-testid="button-submit-support"
                    >
                      {supportMutation.isPending ? (
                        <><Spinner size={16} className="mr-2" /> Submitting...</>
                      ) : (
                        "Submit Ticket"
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="feedback" className="mt-6">
            {feedbackSubmitted ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <CheckCircle size={48} className="text-green-500 mb-4" />
                  <h3 className="text-lg font-semibold mb-2" data-testid="text-feedback-success">Thank you!</h3>
                  <p className="text-muted-foreground mb-6 max-w-sm">
                    Your feedback helps us make ConsentEase better for everyone.
                  </p>
                  <Button variant="outline" onClick={() => setFeedbackSubmitted(false)} data-testid="button-new-feedback">
                    Share more feedback
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Share Your Feedback</CardTitle>
                  <CardDescription>
                    Have an idea or suggestion? We'd love to hear from you.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="feedback-type">Type</Label>
                      <Select
                        value={feedbackForm.type}
                        onValueChange={(v: "feedback" | "feature-request" | "improvement") =>
                          setFeedbackForm({ ...feedbackForm, type: v })
                        }
                      >
                        <SelectTrigger id="feedback-type" data-testid="select-feedback-type">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="feedback">General Feedback</SelectItem>
                          <SelectItem value="feature-request">Feature Request</SelectItem>
                          <SelectItem value="improvement">Improvement Suggestion</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="feedback-title">Title</Label>
                      <Input
                        id="feedback-title"
                        data-testid="input-feedback-title"
                        placeholder="Short summary of your feedback"
                        value={feedbackForm.title}
                        onChange={(e) => setFeedbackForm({ ...feedbackForm, title: e.target.value })}
                        maxLength={200}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="feedback-description">Description</Label>
                      <Textarea
                        id="feedback-description"
                        data-testid="input-feedback-description"
                        placeholder="Tell us more about your idea or suggestion..."
                        rows={6}
                        value={feedbackForm.description}
                        onChange={(e) => setFeedbackForm({ ...feedbackForm, description: e.target.value })}
                        maxLength={5000}
                        required
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={feedbackMutation.isPending}
                      data-testid="button-submit-feedback"
                    >
                      {feedbackMutation.isPending ? (
                        <><Spinner size={16} className="mr-2" /> Submitting...</>
                      ) : (
                        "Submit Feedback"
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
