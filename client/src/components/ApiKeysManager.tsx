import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { API_SCOPES, API_SCOPE_DESCRIPTIONS } from "@shared/api-scopes";
import type { PublicApiKey } from "@shared/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Key, Copy, Check, ArrowsClockwise, Trash, Plus, Warning } from "@phosphor-icons/react";

const formSchema = z.object({
  name: z.string().trim().min(1, "A name is required").max(100, "Name is too long"),
  scopes: z.array(z.string()).min(1, "Select at least one scope"),
});
type FormValues = z.infer<typeof formSchema>;

interface MintedResponse {
  apiKey: PublicApiKey;
  plaintext: string;
}

function formatDate(value: string | Date | null): string {
  if (!value) return "—";
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

type KeyStatus = { label: string; variant: "default" | "secondary" | "destructive" | "outline" };

function keyStatus(key: PublicApiKey): KeyStatus {
  if (key.revokedAt) return { label: "Revoked", variant: "secondary" };
  if (key.expiresAt && new Date(key.expiresAt).getTime() <= Date.now()) {
    return { label: "Expired", variant: "secondary" };
  }
  // A non-revoked key with a future expiry is one that has been rotated: it keeps
  // working through its grace window, then auto-expires.
  if (key.expiresAt) return { label: "Expiring", variant: "outline" };
  return { label: "Active", variant: "default" };
}

export default function ApiKeysManager() {
  const [revealed, setRevealed] = useState<{ plaintext: string; name: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [pendingRotate, setPendingRotate] = useState<PublicApiKey | null>(null);
  const [pendingRevoke, setPendingRevoke] = useState<PublicApiKey | null>(null);
  const { toast } = useToast();

  const { data: keys, isLoading } = useQuery<PublicApiKey[]>({
    queryKey: ["/api/api-keys"],
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", scopes: [...API_SCOPES] },
  });

  function revealMinted(res: MintedResponse) {
    setCopied(false);
    setRevealed({ plaintext: res.plaintext, name: res.apiKey.name });
    queryClient.invalidateQueries({ queryKey: ["/api/api-keys"] });
  }

  const createMutation = useMutation({
    mutationFn: async (values: FormValues): Promise<MintedResponse> => {
      const res = await apiRequest("POST", "/api/api-keys", values);
      return res.json();
    },
    onSuccess: (res) => {
      form.reset({ name: "", scopes: [...API_SCOPES] });
      revealMinted(res);
    },
    onError: (err: Error) =>
      toast({
        title: "Couldn't create key",
        description: err.message || "Failed to create API key",
        variant: "destructive",
      }),
  });

  const rotateMutation = useMutation({
    mutationFn: async (id: string): Promise<MintedResponse> => {
      const res = await apiRequest("POST", `/api/api-keys/${id}/rotate`);
      return res.json();
    },
    onSuccess: (res) => {
      setPendingRotate(null);
      revealMinted(res);
      toast({
        title: "Key rotated",
        description: "The old key keeps working for 24 hours, then expires.",
      });
    },
    onError: (err: Error) => {
      setPendingRotate(null);
      toast({
        title: "Couldn't rotate key",
        description: err.message || "Failed to rotate API key",
        variant: "destructive",
      });
    },
  });

  const revokeMutation = useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await apiRequest("POST", `/api/api-keys/${id}/revoke`);
    },
    onSuccess: () => {
      setPendingRevoke(null);
      queryClient.invalidateQueries({ queryKey: ["/api/api-keys"] });
      toast({ title: "API key revoked" });
    },
    onError: (err: Error) => {
      setPendingRevoke(null);
      toast({
        title: "Couldn't revoke key",
        description: err.message || "Failed to revoke API key",
        variant: "destructive",
      });
    },
  });

  async function copyPlaintext() {
    if (!revealed) return;
    try {
      await navigator.clipboard.writeText(revealed.plaintext);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: "Copy failed",
        description: "Could not copy to clipboard — copy it manually.",
        variant: "destructive",
      });
    }
  }

  function onSubmit(values: FormValues) {
    createMutation.mutate(values);
  }

  return (
    <div className="space-y-6" data-testid="section-api-keys">
      {/* Create */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key size={20} weight="duotone" />
            API Keys
          </CardTitle>
          <CardDescription>
            Create keys to access the ConsentEase Connect API (<code>/api/v1</code>) and connect
            agents or scripts. A key inherits only your own access. The secret is shown once at
            creation — store it somewhere safe.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Key name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. Production agent"
                        data-testid="input-api-key-name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="scopes"
                render={() => (
                  <FormItem>
                    <FormLabel>Scopes</FormLabel>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {API_SCOPES.map((scope) => (
                        <FormField
                          key={scope}
                          control={form.control}
                          name="scopes"
                          render={({ field }) => {
                            const checked = field.value?.includes(scope);
                            return (
                              <FormItem
                                className="flex items-start gap-3 space-y-0 rounded-md border p-3"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={checked}
                                    data-testid={`checkbox-scope-${scope}`}
                                    onCheckedChange={(value) => {
                                      const next = value
                                        ? [...(field.value ?? []), scope]
                                        : (field.value ?? []).filter((s) => s !== scope);
                                      field.onChange(next);
                                    }}
                                  />
                                </FormControl>
                                <div className="space-y-0.5 leading-tight">
                                  <FormLabel className="font-mono text-xs">{scope}</FormLabel>
                                  <p className="text-xs text-muted-foreground">
                                    {API_SCOPE_DESCRIPTIONS[scope]}
                                  </p>
                                </div>
                              </FormItem>
                            );
                          }}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={createMutation.isPending}
                data-testid="button-create-api-key"
              >
                <Plus size={16} className="mr-1.5" />
                {createMutation.isPending ? "Creating…" : "Create API key"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* List */}
      <Card>
        <CardHeader>
          <CardTitle>Your keys</CardTitle>
          <CardDescription>
            Secrets are never stored in full and cannot be shown again. Rotate to replace a key
            without downtime, or revoke to disable it immediately.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3" data-testid="loading-api-keys">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : !keys || keys.length === 0 ? (
            <div
              className="text-center py-10 text-muted-foreground"
              data-testid="empty-api-keys"
            >
              <Key size={32} className="mx-auto mb-2 opacity-40" />
              <p>You don't have any API keys yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Key</TableHead>
                    <TableHead>Scopes</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last used</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {keys.map((key) => {
                    const status = keyStatus(key);
                    // Only a clean, non-expiring key may be rotated; an Active or
                    // grace-window "Expiring" key may be revoked early.
                    const isActive = status.label === "Active";
                    const canRevoke = status.label === "Active" || status.label === "Expiring";
                    return (
                      <TableRow key={key.id} data-testid={`row-api-key-${key.id}`}>
                        <TableCell
                          className="font-medium"
                          data-testid={`text-api-key-name-${key.id}`}
                        >
                          {key.name}
                        </TableCell>
                        <TableCell>
                          <code
                            className="text-xs text-muted-foreground"
                            data-testid={`text-api-key-prefix-${key.id}`}
                          >
                            {key.keyPrefix}…
                          </code>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {(key.scopes ?? []).map((scope) => (
                              <Badge
                                key={scope}
                                variant="outline"
                                className="font-mono text-[10px]"
                                data-testid={`badge-scope-${key.id}-${scope}`}
                              >
                                {scope}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={status.variant} data-testid={`status-api-key-${key.id}`}>
                            {status.label}
                          </Badge>
                        </TableCell>
                        <TableCell
                          className="text-muted-foreground text-sm"
                          data-testid={`text-api-key-lastused-${key.id}`}
                        >
                          {formatDate(key.lastUsedAt)}
                        </TableCell>
                        <TableCell
                          className="text-muted-foreground text-sm"
                          data-testid={`text-api-key-created-${key.id}`}
                        >
                          {formatDate(key.createdAt)}
                        </TableCell>
                        <TableCell className="text-right">
                          {canRevoke && (
                            <div className="flex justify-end gap-1">
                              {isActive && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setPendingRotate(key)}
                                  data-testid={`button-rotate-api-key-${key.id}`}
                                >
                                  <ArrowsClockwise size={15} className="mr-1" />
                                  Rotate
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive hover:text-destructive"
                                onClick={() => setPendingRevoke(key)}
                                data-testid={`button-revoke-api-key-${key.id}`}
                              >
                                <Trash size={15} className="mr-1" />
                                Revoke
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reveal-once dialog */}
      <Dialog open={!!revealed} onOpenChange={(open) => !open && setRevealed(null)}>
        <DialogContent data-testid="dialog-api-key-revealed">
          <DialogHeader>
            <DialogTitle>Copy your API key now</DialogTitle>
            <DialogDescription>
              This is the only time the full secret for <strong>{revealed?.name}</strong> will be
              shown. Store it securely — you won't be able to see it again.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-md border bg-muted p-3 flex items-start gap-2">
            <code
              className="text-xs break-all flex-1"
              data-testid="text-revealed-api-key"
            >
              {revealed?.plaintext}
            </code>
            <Button
              variant="outline"
              size="sm"
              onClick={copyPlaintext}
              data-testid="button-copy-api-key"
            >
              {copied ? <Check size={15} className="mr-1" /> : <Copy size={15} className="mr-1" />}
              {copied ? "Copied" : "Copy"}
            </Button>
          </div>
          <div className="flex items-start gap-2 text-xs text-muted-foreground">
            <Warning size={16} className="mt-0.5 shrink-0" />
            <span>
              Treat this key like a password. Anyone with it can act on your account through the
              API.
            </span>
          </div>
          <DialogFooter>
            <Button onClick={() => setRevealed(null)} data-testid="button-close-revealed">
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rotate confirm */}
      <AlertDialog
        open={!!pendingRotate}
        onOpenChange={(open) => !open && setPendingRotate(null)}
      >
        <AlertDialogContent data-testid="dialog-confirm-rotate">
          <AlertDialogHeader>
            <AlertDialogTitle>Rotate this API key?</AlertDialogTitle>
            <AlertDialogDescription>
              A new secret will be generated for <strong>{pendingRotate?.name}</strong>. The
              current key keeps working for a 24-hour grace window so you can update your
              integrations, then it expires automatically.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-rotate">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => pendingRotate && rotateMutation.mutate(pendingRotate.id)}
              disabled={rotateMutation.isPending}
              data-testid="button-confirm-rotate"
            >
              {rotateMutation.isPending ? "Rotating…" : "Rotate key"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Revoke confirm */}
      <AlertDialog
        open={!!pendingRevoke}
        onOpenChange={(open) => !open && setPendingRevoke(null)}
      >
        <AlertDialogContent data-testid="dialog-confirm-revoke">
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke this API key?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{pendingRevoke?.name}</strong> will stop working immediately and cannot be
              restored. Any integration using it will lose access right away.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-revoke">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => pendingRevoke && revokeMutation.mutate(pendingRevoke.id)}
              disabled={revokeMutation.isPending}
              data-testid="button-confirm-revoke"
            >
              {revokeMutation.isPending ? "Revoking…" : "Revoke key"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
