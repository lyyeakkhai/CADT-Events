import { useState } from 'react';
import { ViewType } from '../App';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Separator } from '../components/ui/separator';
import GeneralSettingsView from './settings/GeneralSettingsView';
import SecuritySettingsView from './settings/SecuritySettingsView';
import IntegrationsView from './settings/IntegrationsView';

interface SettingsViewProps {
  onNavigate: (view: ViewType) => void;
}

export default function SettingsView({}: SettingsViewProps) {
  const [activeTab, setActiveTab] = useState('general');

  return (
    <div className="p-8 max-w-5xl mx-auto flex flex-col gap-8 pb-20 fade-in">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your system configuration, security, and integrations.
        </p>
      </div>

      <Separator />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col md:flex-row gap-8">
        <TabsList className="flex flex-col h-auto w-full md:w-64 items-stretch bg-transparent p-0 gap-1">
          <TabsTrigger 
            value="general"
            className="justify-start px-4 py-2 h-10 data-[state=active]:bg-muted data-[state=active]:shadow-none"
          >
            General
          </TabsTrigger>
          <TabsTrigger 
            value="security"
            className="justify-start px-4 py-2 h-10 data-[state=active]:bg-muted data-[state=active]:shadow-none"
          >
            Security & Authentication
          </TabsTrigger>
          <TabsTrigger 
            value="integrations"
            className="justify-start px-4 py-2 h-10 data-[state=active]:bg-muted data-[state=active]:shadow-none"
          >
            Integrations
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 w-full">
          <TabsContent value="general" className="mt-0 border-0 p-0">
            <GeneralSettingsView />
          </TabsContent>
          <TabsContent value="security" className="mt-0 border-0 p-0">
            <SecuritySettingsView />
          </TabsContent>
          <TabsContent value="integrations" className="mt-0 border-0 p-0">
            <IntegrationsView />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
