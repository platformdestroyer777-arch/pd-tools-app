
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DEFAULT_COLOR = "#7950b5";

function isValidHexColor(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(value.trim())
  );
}

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("pd_tools_settings")
      .select("key, value")
      .in("key", [
        "tools",
        "site_name",
        "logo_url",
        "favicon_url",
        "primary_color",
        "site_description",
      ]);

    if (error) {
      console.error("Erro ao buscar configurações:", error);

      return NextResponse.json(
        { error: "Não foi possível carregar as configurações." },
        { status: 500 }
      );
    }

    const settings = Object.fromEntries(
      (data || []).map((item) => [item.key, item.value])
    );

    let disabledTools: string[] = [];

    if (settings.tools) {
      try {
        const savedTools =
          typeof settings.tools === "string"
            ? JSON.parse(settings.tools)
            : settings.tools;

        if (Array.isArray(savedTools)) {
          disabledTools = savedTools
            .filter(
              (tool) =>
                typeof tool?.id === "string" &&
                tool.enabled === false
            )
            .map((tool) => tool.id);
        }
      } catch (error) {
        console.error("Erro ao interpretar ferramentas:", error);
      }
    }

    const savedColor =
      typeof settings.primary_color === "string"
        ? settings.primary_color.trim()
        : "";

    const primaryColor = isValidHexColor(savedColor)
      ? savedColor
      : DEFAULT_COLOR;

    return NextResponse.json(
      {
        disabledTools,
        identity: {
          site_name: settings.site_name || "",
          logo_url: settings.logo_url || "",
          favicon_url: settings.favicon_url || "",
          primary_color: primaryColor,
          site_description: settings.site_description || "",
        },
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (error) {
    console.error("Erro na API de ferramentas:", error);

    return NextResponse.json(
      { error: "Erro ao consultar configurações." },
      { status: 500 }
    );
  }
}
