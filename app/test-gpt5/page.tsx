"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

export default function TestGPT5Page() {
  const [prompt, setPrompt] = useState("");
  const [model, setModel] = useState("gpt-5-nano");
  const [verbosity, setVerbosity] = useState("medium");
  const [reasoningEffort, setReasoningEffort] = useState("low");
  const [enableWebSearch, setEnableWebSearch] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [output, setOutput] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setOutput(null);

    try {
      const formData = new FormData();
      formData.append("prompt", prompt);
      formData.append("model", model);
      formData.append("verbosity", verbosity);
      formData.append("reasoningEffort", reasoningEffort);
      formData.append("enableWebSearch", enableWebSearch.toString());

      if (file) {
        formData.append("file", file);
      }

      const response = await fetch("/api/test-gpt5", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setOutput(data.output);
      } else {
        setError(data.error || "Failed to process request");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-6xl py-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">GPT-5 Structured Testing</h1>
          <p className="text-slate-600 dark:text-slate-400">
            Test GPT-5-structured with custom prompts and file uploads
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Input Form */}
          <Card>
            <CardHeader>
              <CardTitle>Configuration</CardTitle>
              <CardDescription>
                Configure your GPT-5 request parameters
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="model">Model</Label>
                  <Select value={model} onValueChange={setModel}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gpt-5-nano">GPT-5 Nano (Dev)</SelectItem>
                      <SelectItem value="gpt-5">GPT-5 (Production)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="prompt">Prompt</Label>
                  <Textarea
                    id="prompt"
                    placeholder="Enter your prompt here..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="min-h-[120px]"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="file">Upload File (Optional)</Label>
                  <Input
                    id="file"
                    type="file"
                    accept=".csv,.xlsx,.xls,.pdf,.doc,.docx,.txt,.json"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                  />
                  {file && (
                    <p className="text-sm text-slate-600 mt-1">
                      Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="verbosity">Verbosity</Label>
                    <Select value={verbosity} onValueChange={setVerbosity}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="reasoning">Reasoning Effort</Label>
                    <Select value={reasoningEffort} onValueChange={setReasoningEffort}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="webSearch"
                    checked={enableWebSearch}
                    onChange={(e) => setEnableWebSearch(e.target.checked)}
                    className="rounded"
                  />
                  <Label htmlFor="webSearch" className="cursor-pointer">
                    Enable Web Search
                  </Label>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading || !prompt}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Run GPT-5"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Output Display */}
          <Card>
            <CardHeader>
              <CardTitle>Output</CardTitle>
              <CardDescription>
                GPT-5 response will appear here
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading && (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
                </div>
              )}

              {error && (
                <div className="rounded-lg bg-red-50 p-4 text-red-800">
                  <h3 className="font-semibold mb-2">Error</h3>
                  <p className="text-sm">{error}</p>
                </div>
              )}

              {output && !isLoading && (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Response:</h3>
                    <div className="rounded-lg bg-slate-50 dark:bg-slate-900 p-4">
                      <pre className="whitespace-pre-wrap text-sm overflow-x-auto">
                        {typeof output === "string"
                          ? output
                          : JSON.stringify(output, null, 2)}
                      </pre>
                    </div>
                  </div>
                </div>
              )}

              {!output && !error && !isLoading && (
                <div className="text-center py-12 text-slate-500">
                  <p>No output yet. Submit a prompt to get started.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Example Prompts */}
        <Card>
          <CardHeader>
            <CardTitle>Example Prompts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPrompt("Use the web to find a news article headline from today")}
              >
                News Headline (with web search)
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPrompt("Analyze the uploaded file and provide key insights and statistics")}
              >
                Analyze File
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPrompt("Generate a social media strategy for a luxury automotive brand targeting millennials in Southeast Asia")}
              >
                Social Media Strategy
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
