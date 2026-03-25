import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

async function getDocumentContent(supabase: any, filePath: string, mimeType: string): Promise<string | null> {
  try {
    const { data, error } = await supabase.storage
      .from('ir-ai-documents')
      .download(filePath);
    
    if (error || !data) {
      console.error("Error downloading file:", error);
      return null;
    }

    // For PDFs and images, convert to base64
    const arrayBuffer = await data.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    let binary = '';
    for (let i = 0; i < uint8Array.length; i++) {
      binary += String.fromCharCode(uint8Array[i]);
    }
    const base64 = btoa(binary);
    
    return base64;
  } catch (e) {
    console.error("Error processing document:", e);
    return null;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) throw new Error("Unauthorized");

    const { declarationId, documentId, documentType, action } = await req.json();

    if (action === "analyze_document") {
      // Get document info
      const { data: docRecord } = await supabase
        .from("ir_ai_documents")
        .select("*")
        .eq("id", documentId)
        .single();

      if (!docRecord) throw new Error("Document not found");

      // Verify ownership AND that doc belongs to the correct declaration
      if (docRecord.user_id !== user.id) throw new Error("Unauthorized");
      if (docRecord.declaration_id !== declarationId) throw new Error("Document does not belong to this declaration");

      // Update status
      await supabase.from("ir_ai_documents").update({ ai_status: "processing" }).eq("id", documentId);

      // Download and read the actual document
      const fileMimeType = docRecord.mime_type || "application/pdf";
      const fileContent = await getDocumentContent(supabase, docRecord.file_path, fileMimeType);

      if (!fileContent) {
        await supabase.from("ir_ai_documents").update({ ai_status: "error" }).eq("id", documentId);
        return new Response(JSON.stringify({ error: "Não foi possível ler o documento." }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const systemPrompt = `Você é o maior contador do Brasil, especialista em Imposto de Renda Pessoa Física (IRPF).
Analise o documento enviado e extraia TODAS as informações relevantes para a declaração de IR.

Retorne SEMPRE em formato estruturado usando a função fornecida.

Tipos de documento e o que extrair:
- informe_rendimentos: fonte pagadora, CNPJ, rendimentos tributáveis, IRRF retido, 13º, férias
- comprovante_medico: nome do profissional/instituição, CNPJ/CPF, valor pago, data
- comprovante_educacao: instituição, CNPJ, valor pago, tipo (graduação, pós, escola)
- recibo_aluguel: endereço, locador, CPF/CNPJ, valor mensal, período
- nota_corretagem: ativo, quantidade, valor compra/venda, data, corretora
- darf: código receita, período apuração, valor pago, data pagamento
- other: extraia qualquer informação financeira/fiscal relevante

IMPORTANTE: Os valores devem ser em centavos (multiplique por 100). Ex: R$ 1.500,00 = 150000`;

      // Determine the media type for the content
      const isImage = fileMimeType.startsWith("image/");
      const isPdf = fileMimeType === "application/pdf";

      // Build the user message with the actual document content
      const userContent: any[] = [
        { 
          type: "text", 
          text: `Analise este documento do tipo "${documentType}" (arquivo: ${docRecord.file_name}). Extraia todos os dados fiscais relevantes para a declaração de Imposto de Renda.` 
        },
      ];

      if (isImage) {
        userContent.push({
          type: "image_url",
          image_url: {
            url: `data:${fileMimeType};base64,${fileContent}`,
          },
        });
      } else if (isPdf) {
        // For PDFs, send as inline data (Gemini supports this)
        userContent.push({
          type: "image_url",
          image_url: {
            url: `data:application/pdf;base64,${fileContent}`,
          },
        });
      }

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userContent },
          ],
          tools: [{
            type: "function",
            function: {
              name: "extract_ir_data",
              description: "Extrai dados fiscais de um documento para declaração de IR",
              parameters: {
                type: "object",
                properties: {
                  document_category: { type: "string", enum: ["rendimentos", "deducoes", "bens", "dividas", "pagamentos"] },
                  source_name: { type: "string", description: "Nome da fonte pagadora ou instituição" },
                  source_document: { type: "string", description: "CNPJ ou CPF da fonte" },
                  items: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        description: { type: "string" },
                        value_cents: { type: "number" },
                        category: { type: "string" },
                        period: { type: "string" },
                        deductible: { type: "boolean" },
                      },
                      required: ["description", "value_cents"],
                    },
                  },
                  total_value_cents: { type: "number" },
                  tax_withheld_cents: { type: "number" },
                  confidence_percent: { type: "number", description: "Confiança na extração (0-100)" },
                  observations: { type: "string" },
                },
                required: ["document_category", "items", "confidence_percent"],
              },
            },
          }],
          tool_choice: { type: "function", function: { name: "extract_ir_data" } },
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error("AI gateway error:", response.status, errText);
        await supabase.from("ir_ai_documents").update({ ai_status: "error" }).eq("id", documentId);
        
        if (response.status === 429) {
          return new Response(JSON.stringify({ error: "Rate limited, tente novamente em instantes." }), {
            status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        if (response.status === 402) {
          return new Response(JSON.stringify({ error: "Créditos insuficientes." }), {
            status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        throw new Error(`AI error: ${response.status}`);
      }

      const aiData = await response.json();
      let extractedData = {};
      
      const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
      if (toolCall?.function?.arguments) {
        try {
          extractedData = JSON.parse(toolCall.function.arguments);
        } catch { extractedData = { raw: toolCall.function.arguments }; }
      }

      await supabase.from("ir_ai_documents").update({
        ai_extracted_data: extractedData,
        ai_status: "extracted",
      }).eq("id", documentId);

      return new Response(JSON.stringify({ success: true, data: extractedData }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "generate_summary") {
      // Verify declaration ownership
      const { data: decl } = await supabase
        .from("ir_ai_declarations")
        .select("user_id")
        .eq("id", declarationId)
        .single();
      
      if (!decl || decl.user_id !== user.id) throw new Error("Unauthorized");

      const { data: docs } = await supabase
        .from("ir_ai_documents")
        .select("*")
        .eq("declaration_id", declarationId)
        .eq("ai_status", "extracted");

      if (!docs || docs.length === 0) {
        return new Response(JSON.stringify({ error: "Nenhum documento analisado ainda." }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      await supabase.from("ir_ai_declarations").update({ status: "ai_analysis" }).eq("id", declarationId);

      const extractedDataSummary = docs.map(d => ({
        type: d.document_type,
        file: d.file_name,
        data: d.ai_extracted_data,
      }));

      const summaryResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            {
              role: "system",
              content: `Você é o maior contador do Brasil. Com base nos dados extraídos dos documentos, 
gere um resumo completo da declaração de IR incluindo:
- Total de rendimentos tributáveis
- Total de deduções
- Imposto devido estimado
- Restituição estimada
- Recomendações de otimização fiscal
- Alertas de inconsistências

Use a tabela progressiva do IRPF 2025:
- Até R$ 2.259,20: isento
- De R$ 2.259,21 até R$ 2.826,65: 7,5% (dedução R$ 169,44)
- De R$ 2.826,66 até R$ 3.751,05: 15% (dedução R$ 381,44)
- De R$ 3.751,06 até R$ 4.664,68: 22,5% (dedução R$ 662,77)
- Acima de R$ 4.664,68: 27,5% (dedução R$ 896,00)

IMPORTANTE: Todos os valores devem ser em centavos.`,
            },
            {
              role: "user",
              content: `Dados extraídos dos documentos:\n${JSON.stringify(extractedDataSummary, null, 2)}`,
            },
          ],
          tools: [{
            type: "function",
            function: {
              name: "generate_ir_summary",
              description: "Gera resumo da declaração de IR",
              parameters: {
                type: "object",
                properties: {
                  total_income_cents: { type: "number" },
                  total_deductions_cents: { type: "number" },
                  tax_due_cents: { type: "number" },
                  refund_cents: { type: "number" },
                  confidence_percent: { type: "number" },
                  declaration_model: { type: "string", enum: ["simplificado", "completo"] },
                  recommended_model: { type: "string", enum: ["simplificado", "completo"] },
                  recommendation_reason: { type: "string" },
                  income_sources: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        source: { type: "string" },
                        value_cents: { type: "number" },
                        type: { type: "string" },
                      },
                    },
                  },
                  deduction_items: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        description: { type: "string" },
                        value_cents: { type: "number" },
                        category: { type: "string" },
                      },
                    },
                  },
                  alerts: { type: "array", items: { type: "string" } },
                  optimization_tips: { type: "array", items: { type: "string" } },
                },
                required: ["total_income_cents", "total_deductions_cents", "tax_due_cents", "refund_cents", "confidence_percent"],
              },
            },
          }],
          tool_choice: { type: "function", function: { name: "generate_ir_summary" } },
        }),
      });

      if (!summaryResponse.ok) {
        await supabase.from("ir_ai_declarations").update({ status: "error" }).eq("id", declarationId);
        throw new Error("Failed to generate summary");
      }

      const summaryData = await summaryResponse.json();
      let analysis = {};
      const tc = summaryData.choices?.[0]?.message?.tool_calls?.[0];
      if (tc?.function?.arguments) {
        try { analysis = JSON.parse(tc.function.arguments); } catch { analysis = {}; }
      }

      const typedAnalysis = analysis as Record<string, unknown>;

      await supabase.from("ir_ai_declarations").update({
        status: "review",
        ai_analysis: analysis,
        ai_confidence_percent: (typedAnalysis.confidence_percent as number) || 0,
        total_income_cents: (typedAnalysis.total_income_cents as number) || 0,
        total_deductions_cents: (typedAnalysis.total_deductions_cents as number) || 0,
        tax_due_cents: (typedAnalysis.tax_due_cents as number) || 0,
        refund_cents: (typedAnalysis.refund_cents as number) || 0,
      }).eq("id", declarationId);

      // Send email notification to user
      try {
        const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
        if (RESEND_API_KEY) {
          const { data: declData } = await supabase.from("ir_ai_declarations")
            .select("full_name, fiscal_year, user_id")
            .eq("id", declarationId)
            .single();
          
          if (declData) {
            const { data: profileData } = await supabase.from("profiles")
              .select("email")
              .eq("user_id", declData.user_id)
              .single();
            
            if (profileData?.email) {
              const resend = new Resend(RESEND_API_KEY);
              const firstName = (declData.full_name || "Cliente").split(" ")[0];
              const formatBRL = (cents: number) => `R$ ${(cents / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
              
              await resend.emails.send({
                from: "AtentAI <noreply@atentai.com.br>",
                to: [profileData.email],
                subject: `✅ Sua declaração IR ${declData.fiscal_year} está pronta!`,
                html: `
                  <div style="font-family: -apple-system, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 20px;">
                    <div style="text-align: center; margin-bottom: 24px;">
                      <h1 style="color: #7c3aed; font-size: 24px; margin: 0;">AtentAI - Contador IA</h1>
                    </div>
                    <h2 style="color: #111; font-size: 20px;">Olá, ${firstName}! 🎉</h2>
                    <p style="color: #555; line-height: 1.6;">Sua declaração de Imposto de Renda <strong>${declData.fiscal_year}</strong> foi analisada com sucesso pela nossa IA.</p>
                    <div style="background: #f8f5ff; border-radius: 12px; padding: 20px; margin: 20px 0;">
                      <p style="margin: 4px 0; color: #333;"><strong>Rendimentos:</strong> ${formatBRL((typedAnalysis.total_income_cents as number) || 0)}</p>
                      <p style="margin: 4px 0; color: #333;"><strong>Deduções:</strong> ${formatBRL((typedAnalysis.total_deductions_cents as number) || 0)}</p>
                      <p style="margin: 4px 0; color: #333;"><strong>Imposto devido:</strong> ${formatBRL((typedAnalysis.tax_due_cents as number) || 0)}</p>
                      <p style="margin: 4px 0; color: #10b981;"><strong>Restituição:</strong> ${formatBRL((typedAnalysis.refund_cents as number) || 0)}</p>
                    </div>
                    <div style="text-align: center; margin: 24px 0;">
                      <a href="https://atentaiinteligenciaartificial.lovable.app/contador-ia" style="display: inline-block; background: #7c3aed; color: white; padding: 12px 32px; border-radius: 999px; text-decoration: none; font-weight: bold;">Revisar minha declaração</a>
                    </div>
                    <p style="color: #999; font-size: 12px; text-align: center; margin-top: 32px;">AtentAI — Inteligência Artificial Contábil</p>
                  </div>
                `,
              });
              console.log("[ai-ir-analyze] Email notification sent to", profileData.email);
            }
          }
        }
      } catch (emailErr) {
        console.error("[ai-ir-analyze] Email notification failed:", emailErr);
        // Don't throw - email failure shouldn't block the response
      }

      return new Response(JSON.stringify({ success: true, analysis }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ai-ir-analyze error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
