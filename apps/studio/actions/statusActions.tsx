import { useCallback, useState } from "react";
import type { DocumentActionComponent } from "sanity";
import { Box, Button, Flex, Text } from "@sanity/ui";

const setMetaStatus = (status: string): DocumentActionComponent => (props) => {
  const [isRunning, setIsRunning] = useState(false);

  return {
    label: status === "inReview" ? "Submit for Review" : status === "approved" ? "Approve" : status === "scheduled" ? "Schedule Publish" : "Set Status",
    disabled: isRunning,
    onHandle: async () => {
      setIsRunning(true);
      await props.patch.execute([{ set: { "meta.status": status } }]);
      if (status === "approved") {
        await props.patch.execute([{ set: { "meta.lastReviewedAt": new Date().toISOString() } }]);
      }
      props.onComplete();
    }
  };
};

export const submitForReviewAction = setMetaStatus("inReview");
export const approveAction = setMetaStatus("approved");
export const schedulePublishAction = setMetaStatus("scheduled");

export const publishNowAction: DocumentActionComponent = (props) => {
  const [isRunning, setIsRunning] = useState(false);
  return {
    label: "Publish Now",
    disabled: isRunning,
    onHandle: async () => {
      setIsRunning(true);
      await props.patch.execute([{ set: { "meta.status": "published", "visibility": "public" } }]);
      await props.publish?.();
      props.onComplete();
    }
  };
};

export const unpublishAction: DocumentActionComponent = (props) => {
  const [isRunning, setIsRunning] = useState(false);
  return {
    label: "Unpublish",
    tone: "critical",
    disabled: isRunning,
    onHandle: async () => {
      setIsRunning(true);
      await props.unpublish?.();
      await props.patch.execute([{ set: { "meta.status": "draft" } }]);
      props.onComplete();
    }
  };
};

const actions = [
  { key: "summarize", label: "Summarize" },
  { key: "seo", label: "SEO Description" },
  { key: "related", label: "Related Posts" },
  { key: "x_thread", label: "X Thread" },
  { key: "ig_caption", label: "IG Caption" }
];

export const lnlsBotAction: DocumentActionComponent = (props) => {
  const [open, setOpen] = useState(false);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [output, setOutput] = useState<string | null>(null);

  const doc = props.draft ?? props.published;

  const runAction = useCallback(
    async (actionKey: string) => {
      setLoadingAction(actionKey);
      try {
        const response = await fetch(`${window.location.origin.replace(/\/$/, "")}/api/ai-assist`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: actionKey, doc })
        });
        const json = await response.json();
        setOutput(typeof json.result === "string" ? json.result : JSON.stringify(json.result, null, 2));
      } catch (error) {
        setOutput(error instanceof Error ? error.message : "Unable to fetch AI assistance");
      } finally {
        setLoadingAction(null);
      }
    },
    [doc]
  );

  return {
    label: "LNLS Bot",
    onHandle: () => setOpen(true),
    dialog: open
      ? {
          type: "dialog",
          header: "LNLS Bot",
          onClose: () => setOpen(false),
          content: (
            <Flex direction="column" gap={4}>
              <Text size={2}>Generate assistive content for this document.</Text>
              <Flex gap={2} wrap="wrap">
                {actions.map((action) => (
                  <Button
                    key={action.key}
                    text={action.label}
                    tone="primary"
                    padding={3}
                    disabled={!!loadingAction}
                    onClick={() => runAction(action.key)}
                    loading={loadingAction === action.key}
                  />
                ))}
              </Flex>
              {output ? (
                <Box padding={3} style={{ backgroundColor: "#111827", borderRadius: "12px" }}>
                  <Text size={1}>{output}</Text>
                </Box>
              ) : null}
            </Flex>
          )
        }
      : undefined
  };
};
