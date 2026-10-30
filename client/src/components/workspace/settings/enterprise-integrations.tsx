import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Key,
  Webhook,
  Shield,
  Copy,
  Check,
  RefreshCw,
  Github,
  Slack,
  Layers,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

export function EnterpriseIntegrations() {
  const [apiKey, setApiKey] = useState("teamsync_live_sec_89a3f912c4b78910e5d6");
  const [copied, setCopied] = useState(false);
  const [integrations, setIntegrations] = useState([
    {
      id: "slack",
      name: "Slack Notifications",
      description: "Broadcast task assignments, sprint alerts, and overdue notices to Slack channels.",
      icon: Slack,
      color: "text-amber-500",
      connected: true,
    },
    {
      id: "github",
      name: "GitHub Issues & PR Sync",
      description: "Link GitHub pull requests to tasks and auto-close issues upon merge.",
      icon: Github,
      color: "text-foreground",
      connected: true,
    },
    {
      id: "jira",
      name: "Atlassian Jira Bridge",
      description: "Bi-directional sync of enterprise epics and legacy Jira backlogs.",
      icon: Layers,
      color: "text-blue-500",
      connected: false,
    },
  ]);

  const copyKey = () => {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: "API Key Copied",
      description: "Workspace secret key copied to clipboard.",
    });
  };

  const regenerateKey = () => {
    const newKey = `teamsync_live_sec_${Math.random().toString(36).substring(2, 12)}${Math.random().toString(36).substring(2, 12)}`;
    setApiKey(newKey);
    toast({
      title: "API Key Regenerated",
      description: "Previous tokens will expire in 24 hours.",
    });
  };

  const toggleIntegration = (id: string) => {
    setIntegrations((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, connected: !item.connected } : item
      )
    );
    toast({
      title: "Integration Updated",
      description: "Webhook connection status updated.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Enterprise API Keys Card */}
      <Card className="border-border/70 bg-card/60 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Key className="h-4 w-4 text-primary" /> Enterprise REST & GraphQL API Keys
            </CardTitle>
            <Badge variant="outline" className="text-emerald-500 bg-emerald-500/10 border-emerald-500/20 text-[10px]">
              Active Token
            </Badge>
          </div>
          <CardDescription className="text-xs">
            Authenticate programmatic requests to ingest tasks, trigger automated workflows, and export audit trails.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            <Input
              readOnly
              value={apiKey}
              type="password"
              className="font-mono text-xs bg-muted/30"
            />
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 shrink-0"
              onClick={copyKey}
              title="Copy Key"
            >
              {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-9 text-xs gap-1.5 shrink-0"
              onClick={regenerateKey}
            >
              <RefreshCw className="h-3.5 w-3.5" /> Regenerate
            </Button>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Do not share secret tokens in client-side code or public repositories.
          </p>
        </CardContent>
      </Card>

      {/* Webhooks & Integrations */}
      <Card className="border-border/70 bg-card/60 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Webhook className="h-4 w-4 text-primary" /> Connected Enterprise Integrations
          </CardTitle>
          <CardDescription className="text-xs">
            Synchronize workspace events with developer tools and communication hubs.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {integrations.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-3.5 rounded-xl border border-border/50 bg-card hover:bg-muted/10 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-muted/40 ${item.color}`}>
                  <item.icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-foreground">{item.name}</span>
                    {item.connected && (
                      <Badge variant="outline" className="text-[10px] text-emerald-500 border-emerald-500/30 bg-emerald-500/5">
                        Connected
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </div>
              </div>

              <Button
                variant={item.connected ? "outline" : "default"}
                size="sm"
                className="h-8 text-xs shrink-0"
                onClick={() => toggleIntegration(item.id)}
              >
                {item.connected ? "Disconnect" : "Connect"}
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Security & Compliance SLA */}
      <Card className="border-border/70 bg-card/60 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Shield className="h-4 w-4 text-emerald-500" /> Security & Compliance Posture
          </CardTitle>
          <CardDescription className="text-xs">
            Enterprise tier governance, encryption standards, and compliance status.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 text-xs">
          <div className="p-3 rounded-xl border border-border/40 bg-card space-y-1">
            <span className="text-muted-foreground">Encryption In Transit & At Rest</span>
            <p className="font-semibold text-foreground">TLS 1.3 / AES-256 GCM</p>
          </div>
          <div className="p-3 rounded-xl border border-border/40 bg-card space-y-1">
            <span className="text-muted-foreground">Compliance Certifications</span>
            <p className="font-semibold text-foreground">SOC-2 Type II & GDPR Verified</p>
          </div>
          <div className="p-3 rounded-xl border border-border/40 bg-card space-y-1">
            <span className="text-muted-foreground">Session Invalidation Policy</span>
            <p className="font-semibold text-foreground">Automatic revocation on password change</p>
          </div>
          <div className="p-3 rounded-xl border border-border/40 bg-card space-y-1">
            <span className="text-muted-foreground">Disaster Recovery RPO / RTO</span>
            <p className="font-semibold text-foreground">5 min RPO / 15 min RTO Multi-Region</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
