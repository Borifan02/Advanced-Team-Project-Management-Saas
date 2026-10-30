import { useState } from "react";
import { useEnterpriseStore } from "@/context/enterprise-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Plus, Trash2, Calendar, User } from "lucide-react";
import { toast } from "@/hooks/use-toast";

import { useAuthContext } from "@/context/auth-provider";

interface ProjectDocsProps {
  projectId: string;
  projectName?: string;
}

export function ProjectDocs({ projectId, projectName = "Project" }: ProjectDocsProps) {
  const { user } = useAuthContext();
  const { documents, addDocument, deleteDocument } = useEnterpriseStore();

  const [isCreating, setIsCreating] = useState(false);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");

  const projectDocs = documents.filter((d) => d.projectId === projectId);
  const activeDoc = projectDocs.find((d) => d.id === selectedDocId) || projectDocs[0];

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    addDocument({
      projectId,
      title: newTitle.trim(),
      content: newContent.trim() || "# " + newTitle.trim() + "\n\nDraft specification content goes here.",
      author: user?.name || "Team Member",
    });

    setNewTitle("");
    setNewContent("");
    setIsCreating(false);

    toast({
      title: "Document Created",
      description: "Project specification document saved successfully.",
    });
  };

  const handleDelete = (id: string) => {
    deleteDocument(id);
    if (selectedDocId === id) {
      setSelectedDocId(null);
    }
    toast({
      title: "Document Deleted",
      description: "Document removed from workspace wiki.",
    });
  };

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl border border-border/70 bg-card/60 backdrop-blur-sm">
        <div>
          <h3 className="text-base font-bold tracking-tight">Project Documentation & Architecture Wiki</h3>
          <p className="text-xs text-muted-foreground">
            Centralized technical RFCs, sprint release criteria, and engineering specifications for {projectName}.
          </p>
        </div>
        <Button
          size="sm"
          className="gap-1.5 h-8 text-xs shadow-sm"
          onClick={() => setIsCreating(!isCreating)}
        >
          <Plus className="h-3.5 w-3.5" />
          {isCreating ? "Cancel" : "New Document"}
        </Button>
      </div>

      {isCreating && (
        <Card className="border-primary/40 shadow-md">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Create Technical Document / RFC</CardTitle>
            <CardDescription className="text-xs">
              Supports markdown headers, checklists, and code snippets.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              <Input
                placeholder="Document Title (e.g. Distributed Caching & Invalidation RFC)"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="text-sm"
                required
              />
              <Textarea
                placeholder="Enter markdown content..."
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                rows={8}
                className="font-mono text-xs"
              />
              <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" size="sm" onClick={() => setIsCreating(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm">
                  Save Document
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Two Column Docs Viewer */}
      <div className="grid gap-6 md:grid-cols-12">
        {/* Left: Document List */}
        <div className="md:col-span-4 space-y-2">
          <span className="text-xs font-semibold uppercase text-muted-foreground tracking-wider px-1">
            Documents ({projectDocs.length})
          </span>
          <div className="space-y-2">
            {projectDocs.length === 0 ? (
              <p className="text-xs text-muted-foreground p-4 text-center border rounded-xl">
                No documents yet. Click "New Document" to start writing.
              </p>
            ) : (
              projectDocs.map((doc) => {
                const isSelected = activeDoc?.id === doc.id;
                return (
                  <div
                    key={doc.id}
                    onClick={() => setSelectedDocId(doc.id)}
                    className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                      isSelected
                        ? "border-primary bg-primary/5 shadow-sm font-medium"
                        : "border-border/60 bg-card hover:bg-muted/30"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 truncate">
                        <FileText className={`h-4 w-4 shrink-0 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                        <span className="truncate text-foreground font-semibold">{doc.title}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-muted-foreground hover:text-destructive shrink-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(doc.id);
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="mt-1 flex items-center justify-between text-[10px] text-muted-foreground">
                      <span>By {doc.author}</span>
                      <span>Updated {doc.updatedAt}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Document Viewer / Reader */}
        <div className="md:col-span-8">
          {activeDoc ? (
            <Card className="border-border/70 bg-card shadow-sm">
              <CardHeader className="border-b border-border/50 bg-muted/20 pb-4">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-[10px]">
                    Technical Spec
                  </Badge>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> {activeDoc.updatedAt}
                  </span>
                </div>
                <CardTitle className="text-xl font-bold tracking-tight text-foreground mt-2">
                  {activeDoc.title}
                </CardTitle>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <User className="h-3 w-3" /> Author: {activeDoc.author}
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="prose dark:prose-invert max-w-none text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed font-sans">
                  {activeDoc.content}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-border/60 text-xs text-muted-foreground">
              Select a document to read its technical specifications.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
