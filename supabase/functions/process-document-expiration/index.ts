import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    console.log("[DOCUMENT-EXPIRATION] Starting document expiration process...");

    // 1. Notify documents expiring in 7 days
    const { data: notifyResult, error: notifyError } = await supabase.rpc(
      "notify_expiring_documents"
    );

    if (notifyError) {
      console.error("[DOCUMENT-EXPIRATION] Error notifying:", notifyError);
    } else {
      console.log(`[DOCUMENT-EXPIRATION] Notified ${notifyResult} documents`);
    }

    // 2. Soft-delete expired documents
    const { data: deleteResult, error: deleteError } = await supabase.rpc(
      "soft_delete_expired_documents"
    );

    if (deleteError) {
      console.error("[DOCUMENT-EXPIRATION] Error soft-deleting:", deleteError);
    } else {
      console.log(`[DOCUMENT-EXPIRATION] Soft-deleted ${deleteResult} documents`);
    }

    // 3. Delete files from storage for soft-deleted documents
    const { data: pendingFiles, error: filesError } = await supabase
      .from("document_expiration_logs")
      .select("id, file_path")
      .eq("deleted_from_storage", false)
      .limit(50);

    if (filesError) {
      console.error("[DOCUMENT-EXPIRATION] Error fetching files to delete:", filesError);
    } else if (pendingFiles && pendingFiles.length > 0) {
      console.log(`[DOCUMENT-EXPIRATION] Deleting ${pendingFiles.length} files from storage...`);

      for (const file of pendingFiles) {
        const { error: storageError } = await supabase.storage
          .from("company-documents")
          .remove([file.file_path]);

        if (storageError) {
          console.error(`[DOCUMENT-EXPIRATION] Error deleting file ${file.file_path}:`, storageError);
        } else {
          // Mark as deleted from storage
          await supabase
            .from("document_expiration_logs")
            .update({ deleted_from_storage: true })
            .eq("id", file.id);
        }
      }
    }

    // 4. Log audit event
    await supabase.from("audit_logs").insert({
      action_type: "document_expiration_cron",
      resource_type: "documents",
      success: true,
      metadata: {
        notified_count: notifyResult || 0,
        deleted_count: deleteResult || 0,
        storage_cleaned: pendingFiles?.length || 0,
        executed_at: new Date().toISOString(),
      },
    });

    return new Response(
      JSON.stringify({
        success: true,
        notified: notifyResult || 0,
        deleted: deleteResult || 0,
        storage_cleaned: pendingFiles?.length || 0,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("[DOCUMENT-EXPIRATION] Fatal error:", error);

    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});