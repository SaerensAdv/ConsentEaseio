import { useState } from "react";
import DashboardLayout from "./layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Check, Undo2, Save, Monitor, Smartphone, Palette, Layout, Type, Shield } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function BannerConfigurator() {
  const [config, setConfig] = useState({
    // Content
    heading: "We value your privacy",
    description: "We use cookies to enhance your browsing experience, serve personalized ads or content, and analyze our traffic. By clicking \"Accept All\", you consent to our use of cookies.",
    acceptText: "Accept All",
    rejectText: "Reject All",
    settingsText: "Preferences",
    
    // Appearance
    position: "bottom", // bottom, center, top-bar
    theme: "light",
    primaryColor: "#726CEA",
    borderRadius: 12,
    showIcon: true,
    fontFamily: "Inter",
  });

  const [activeTab, setActiveTab] = useState("appearance");
  const [previewDevice, setPreviewDevice] = useState("desktop"); // desktop, mobile

  return (
    <DashboardLayout>
      <div className="flex flex-col h-[calc(100vh-8rem)]">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-display font-bold">Banner Design</h1>
            <p className="text-muted-foreground">Customize how the consent banner looks on your site.</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => setConfig({...config})}>
              <Undo2 className="w-4 h-4 mr-2" />
              Reset
            </Button>
            <Button size="sm" className="shadow-lg shadow-primary/20">
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </div>

        <div className="flex-1 grid lg:grid-cols-12 gap-8 min-h-0">
          {/* Controls Panel */}
          <Card className="lg:col-span-4 h-full overflow-hidden flex flex-col border-none shadow-lg">
            <div className="p-1">
              <Tabs defaultValue="appearance" value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="w-full grid grid-cols-3">
                  <TabsTrigger value="appearance" className="gap-2"><Palette className="w-4 h-4"/> Style</TabsTrigger>
                  <TabsTrigger value="content" className="gap-2"><Type className="w-4 h-4"/> Content</TabsTrigger>
                  <TabsTrigger value="layout" className="gap-2"><Layout className="w-4 h-4"/> Layout</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            
            <CardContent className="flex-1 overflow-y-auto p-6 space-y-8">
              {activeTab === "appearance" && (
                <div className="space-y-6 animate-in slide-in-from-left-4 duration-300">
                  <div className="space-y-3">
                    <Label>Brand Color</Label>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg border border-border shadow-sm overflow-hidden relative">
                        <input 
                          type="color" 
                          value={config.primaryColor}
                          onChange={(e) => setConfig({...config, primaryColor: e.target.value})}
                          className="absolute inset-[-50%] w-[200%] h-[200%] p-0 border-0 cursor-pointer"
                        />
                      </div>
                      <Input 
                        value={config.primaryColor}
                        onChange={(e) => setConfig({...config, primaryColor: e.target.value})}
                        className="font-mono uppercase"
                        maxLength={7}
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label>Theme</Label>
                    <div className="grid grid-cols-2 gap-3">
                      <button 
                        onClick={() => setConfig({...config, theme: "light"})}
                        className={`p-3 border rounded-lg flex flex-col items-center gap-2 transition-all ${config.theme === 'light' ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'hover:bg-secondary'}`}
                      >
                        <div className="w-full h-8 bg-white border border-gray-200 rounded shadow-sm"></div>
                        <span className="text-sm font-medium">Light</span>
                      </button>
                      <button 
                        onClick={() => setConfig({...config, theme: "dark"})}
                        className={`p-3 border rounded-lg flex flex-col items-center gap-2 transition-all ${config.theme === 'dark' ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'hover:bg-secondary'}`}
                      >
                        <div className="w-full h-8 bg-gray-900 border border-gray-800 rounded shadow-sm"></div>
                        <span className="text-sm font-medium">Dark</span>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Border Radius</Label>
                      <span className="text-xs text-muted-foreground">{config.borderRadius}px</span>
                    </div>
                    <Slider 
                      value={[config.borderRadius]} 
                      min={0} 
                      max={24} 
                      step={1}
                      onValueChange={(val) => setConfig({...config, borderRadius: val[0]})} 
                    />
                  </div>
                </div>
              )}

              {activeTab === "content" && (
                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                  <div className="space-y-3">
                    <Label>Heading</Label>
                    <Input 
                      value={config.heading}
                      onChange={(e) => setConfig({...config, heading: e.target.value})}
                    />
                  </div>
                  <div className="space-y-3">
                    <Label>Description</Label>
                    <textarea 
                      className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 min-h-[100px]"
                      value={config.description}
                      onChange={(e) => setConfig({...config, description: e.target.value})}
                    />
                  </div>
                  <Separator />
                  <div className="space-y-3">
                    <Label>Accept Button</Label>
                    <Input 
                      value={config.acceptText}
                      onChange={(e) => setConfig({...config, acceptText: e.target.value})}
                    />
                  </div>
                  <div className="space-y-3">
                    <Label>Reject Button</Label>
                    <Input 
                      value={config.rejectText}
                      onChange={(e) => setConfig({...config, rejectText: e.target.value})}
                    />
                  </div>
                </div>
              )}

              {activeTab === "layout" && (
                <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-300">
                  <div className="space-y-3">
                    <Label>Position</Label>
                    <div className="space-y-2">
                      <div 
                        className={`p-3 border rounded-lg flex items-center gap-3 cursor-pointer transition-all ${config.position === 'bottom' ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'hover:bg-secondary'}`}
                        onClick={() => setConfig({...config, position: "bottom"})}
                      >
                        <div className="w-10 h-8 bg-gray-100 rounded border border-gray-200 relative">
                          <div className="absolute bottom-1 left-1 right-1 h-2 bg-primary/50 rounded-sm"></div>
                        </div>
                        <span className="font-medium">Bottom Banner</span>
                      </div>
                      <div 
                        className={`p-3 border rounded-lg flex items-center gap-3 cursor-pointer transition-all ${config.position === 'center' ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'hover:bg-secondary'}`}
                        onClick={() => setConfig({...config, position: "center"})}
                      >
                        <div className="w-10 h-8 bg-gray-100 rounded border border-gray-200 relative flex items-center justify-center">
                          <div className="w-6 h-4 bg-primary/50 rounded-sm"></div>
                        </div>
                        <span className="font-medium">Center Modal</span>
                      </div>
                      <div 
                        className={`p-3 border rounded-lg flex items-center gap-3 cursor-pointer transition-all ${config.position === 'top-bar' ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'hover:bg-secondary'}`}
                        onClick={() => setConfig({...config, position: "top-bar"})}
                      >
                        <div className="w-10 h-8 bg-gray-100 rounded border border-gray-200 relative">
                          <div className="absolute top-0 left-0 right-0 h-2 bg-primary/50 rounded-t-sm"></div>
                        </div>
                        <span className="font-medium">Top Bar</span>
                      </div>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <Label htmlFor="show-icon">Show Icon</Label>
                    <Switch 
                      id="show-icon" 
                      checked={config.showIcon}
                      onCheckedChange={(checked) => setConfig({...config, showIcon: checked})}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Preview Area */}
          <div className="lg:col-span-8 bg-muted/30 rounded-2xl border border-border/50 relative overflow-hidden flex flex-col">
            {/* Preview Toolbar */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/80 dark:bg-black/50 backdrop-blur border border-border/50 rounded-full p-1 flex items-center gap-1 shadow-sm z-20">
              <button 
                onClick={() => setPreviewDevice("desktop")}
                className={`p-2 rounded-full transition-colors ${previewDevice === 'desktop' ? 'bg-primary text-white shadow-sm' : 'hover:bg-muted text-muted-foreground'}`}
              >
                <Monitor className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setPreviewDevice("mobile")}
                className={`p-2 rounded-full transition-colors ${previewDevice === 'mobile' ? 'bg-primary text-white shadow-sm' : 'hover:bg-muted text-muted-foreground'}`}
              >
                <Smartphone className="w-4 h-4" />
              </button>
            </div>

            {/* Preview Viewport */}
            <div className="flex-1 overflow-auto flex items-center justify-center p-8">
              <div 
                className={`bg-white shadow-2xl transition-all duration-500 relative overflow-hidden flex flex-col ${
                  previewDevice === 'mobile' ? 'w-[375px] h-[667px] rounded-[3rem] border-8 border-gray-900' : 'w-full h-full rounded-lg border border-border'
                }`}
              >
                {/* Fake Website Content */}
                <div className="w-full h-full bg-slate-50 relative overflow-y-auto">
                  {/* Fake Nav */}
                  <div className="h-14 bg-white border-b flex items-center px-4 justify-between sticky top-0 z-0">
                    <div className="w-24 h-4 bg-slate-200 rounded"></div>
                    <div className="flex gap-2">
                      <div className="w-16 h-4 bg-slate-100 rounded"></div>
                      <div className="w-16 h-4 bg-slate-100 rounded"></div>
                    </div>
                  </div>
                  {/* Fake Hero */}
                  <div className="h-64 bg-slate-100 m-4 rounded-xl"></div>
                  <div className="space-y-3 px-4">
                    <div className="h-6 w-3/4 bg-slate-200 rounded"></div>
                    <div className="h-4 w-full bg-slate-100 rounded"></div>
                    <div className="h-4 w-5/6 bg-slate-100 rounded"></div>
                    <div className="h-4 w-4/6 bg-slate-100 rounded"></div>
                  </div>
                  
                  {/* THE BANNER PREVIEW */}
                  <div className={`absolute inset-0 pointer-events-none z-50 flex ${
                    config.position === 'bottom' ? 'items-end p-4' : 
                    config.position === 'center' ? 'items-center justify-center p-4 bg-black/40 backdrop-blur-sm' : 
                    config.position === 'top-bar' ? 'items-start' : 'items-end'
                  }`}>
                    <motion.div 
                      layout
                      className={`pointer-events-auto shadow-2xl ${
                        config.position === 'top-bar' ? 'w-full p-4 flex items-center justify-between gap-4 flex-wrap' : 
                        config.position === 'center' ? 'max-w-md w-full p-6' : 
                        'w-full md:max-w-xl p-6 mb-4 md:mb-0'
                      }`}
                      style={{
                        backgroundColor: config.theme === 'light' ? '#ffffff' : '#1e1e1e',
                        color: config.theme === 'light' ? '#1e1e1e' : '#ffffff',
                        borderRadius: config.position === 'top-bar' ? 0 : config.borderRadius,
                      }}
                    >
                      <div className={`${config.position === 'top-bar' ? 'flex-1' : 'mb-4'}`}>
                        {config.showIcon && config.position !== 'top-bar' && (
                          <div className="mb-3">
                            <Shield className="w-8 h-8" style={{ color: config.primaryColor }} />
                          </div>
                        )}
                        <h3 className="font-bold text-lg mb-1">{config.heading}</h3>
                        <p className={`text-sm opacity-80 ${config.position === 'top-bar' ? 'line-clamp-2 md:line-clamp-1' : ''}`}>
                          {config.description}
                        </p>
                      </div>

                      <div className={`flex gap-3 ${config.position === 'top-bar' ? 'shrink-0' : 'flex-col sm:flex-row'}`}>
                        <button 
                          className="px-4 py-2 text-sm font-medium rounded-md transition-opacity hover:opacity-90"
                          style={{
                            backgroundColor: config.primaryColor,
                            color: '#ffffff',
                            borderRadius: Math.max(4, config.borderRadius - 4)
                          }}
                        >
                          {config.acceptText}
                        </button>
                        <button 
                          className="px-4 py-2 text-sm font-medium rounded-md border transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                          style={{
                            borderColor: config.theme === 'light' ? '#e5e7eb' : '#333',
                            borderRadius: Math.max(4, config.borderRadius - 4)
                          }}
                        >
                          {config.rejectText}
                        </button>
                        {config.position !== 'top-bar' && (
                          <button className="px-4 py-2 text-sm font-medium underline opacity-60 hover:opacity-100">
                            {config.settingsText}
                          </button>
                        )}
                      </div>
                    </motion.div>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}