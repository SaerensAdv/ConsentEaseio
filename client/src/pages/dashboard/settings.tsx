import { useState } from "react";
import DashboardLayout from "./layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { CreditCard, User, Mail, Shield, Check } from "lucide-react";

export default function Settings() {
  const [activeTab, setActiveTab] = useState<"profile" | "billing">("profile");

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-display font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage your account and subscription.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* Settings Navigation */}
        <div className="lg:col-span-3">
          <nav className="flex flex-col space-y-1">
            <button
              onClick={() => setActiveTab("profile")}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === "profile" 
                  ? "bg-primary/10 text-primary" 
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              <User className="w-4 h-4" />
              Profile
            </button>
            <button
              onClick={() => setActiveTab("billing")}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === "billing" 
                  ? "bg-primary/10 text-primary" 
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              <CreditCard className="w-4 h-4" />
              Billing
            </button>
          </nav>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-9 space-y-6">
          {activeTab === "profile" && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>Update your personal details.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center gap-6">
                    <Avatar className="w-20 h-20 border-2 border-border">
                      <AvatarImage src="https://github.com/shadcn.png" />
                      <AvatarFallback>JD</AvatarFallback>
                    </Avatar>
                    <div className="space-y-2">
                      <Button variant="outline" size="sm">Change Avatar</Button>
                      <p className="text-xs text-muted-foreground">JPG, GIF or PNG. Max 1MB.</p>
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>First Name</Label>
                      <Input defaultValue="John" />
                    </div>
                    <div className="space-y-2">
                      <Label>Last Name</Label>
                      <Input defaultValue="Doe" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input defaultValue="john@example.com" className="pl-9" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Security</CardTitle>
                  <CardDescription>Manage your password and authentication methods.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-primary/10 rounded-full text-primary">
                        <Shield className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-medium">Password</p>
                        <p className="text-sm text-muted-foreground">Last changed 3 months ago</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">Update</Button>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {activeTab === "billing" && (
            <>
              <Card className="border-primary shadow-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Current Plan</CardTitle>
                      <CardDescription>You are currently on the <span className="font-bold text-primary">Pro Plan</span>.</CardDescription>
                    </div>
                    <div className="px-3 py-1 bg-primary/10 text-primary text-sm font-bold rounded-full">
                      Active
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="p-4 bg-secondary/50 rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Price</p>
                      <p className="text-2xl font-bold">€12<span className="text-base font-normal text-muted-foreground">/mo</span></p>
                    </div>
                    <div className="p-4 bg-secondary/50 rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Websites</p>
                      <p className="text-2xl font-bold">2 <span className="text-base font-normal text-muted-foreground">/ 5</span></p>
                    </div>
                    <div className="p-4 bg-secondary/50 rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Pageviews</p>
                      <p className="text-2xl font-bold">15.6k <span className="text-base font-normal text-muted-foreground">/ 100k</span></p>
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-3">
                    <Button variant="outline">Cancel Subscription</Button>
                    <Button>Upgrade Plan</Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Payment Method</CardTitle>
                  <CardDescription>Manage your payment details.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-8 bg-slate-800 rounded flex items-center justify-center text-white font-bold text-xs">
                        VISA
                      </div>
                      <div>
                        <p className="font-medium">Visa ending in 4242</p>
                        <p className="text-sm text-muted-foreground">Expires 12/28</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">Edit</Button>
                  </div>
                  <Button variant="outline" className="mt-4 w-full border-dashed">
                    <CreditCard className="w-4 h-4 mr-2" />
                    Add Payment Method
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Billing History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { date: "Oct 25, 2025", amount: "€12.00", status: "Paid" },
                      { date: "Sep 25, 2025", amount: "€12.00", status: "Paid" },
                      { date: "Aug 25, 2025", amount: "€12.00", status: "Paid" },
                      { date: "Jul 25, 2025", amount: "€12.00", status: "Paid" },
                      { date: "Jun 25, 2025", amount: "€12.00", status: "Paid" },
                      { date: "May 25, 2025", amount: "€12.00", status: "Paid" },
                      { date: "Apr 25, 2025", amount: "€12.00", status: "Paid" },
                      { date: "Mar 25, 2025", amount: "€12.00", status: "Paid" },
                      { date: "Feb 25, 2025", amount: "€5.00", status: "Paid" },
                      { date: "Jan 25, 2025", amount: "€5.00", status: "Paid" },
                    ].map((invoice, i) => (
                      <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
                        <div>
                          <p className="font-medium">{invoice.date}</p>
                          <p className="text-sm text-muted-foreground">Pro Plan - Monthly</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-medium">{invoice.amount}</span>
                          <span className="flex items-center text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full dark:bg-green-900/30 dark:text-green-400">
                            <Check className="w-3 h-3 mr-1" /> {invoice.status}
                          </span>
                          <Button variant="ghost" size="sm">PDF</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}