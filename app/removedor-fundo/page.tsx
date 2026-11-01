
"use client";

import { useState } from "react";

let removerPromise: Promise<any> | null = null;

export default function RemovedorFundo() {
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [original, setOriginal] = useState("");
  const [resultado, setResultado] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");

  async function processarImagem(file: File) {
    setCarregando(true);
    setErro("");
    setMensagem("Preparando o removedor de fundo...");

    try {
      if (!removerPromise) {
        const { pipeline } = await import("@huggingface/transformers");

        removerPromise = pipeline(
          "background-removal",
          "Xenova/modnet"
        );
      }

      setMensagem("Carregando o modelo. Na primeira utilização pode demorar...");

      const remover = await removerPromise;

      setMensagem("Removendo o fundo da imagem...");

      const imagemUrl = URL.createObjectURL(file);

      try {
        const output = await remover(imagemUrl);
        const imagem = Array.isArray(output) ? output[0] : output;
        const blob = await imagem.toBlob();

        const resultadoUrl = URL.createObjectURL(blob);

        setResultado((anterior) => {
          if (anterior) URL.revokeObjectURL(anterior);
          return resultadoUrl;
        });

        setMensagem("Fundo removido com sucesso!");
      } finally {
        URL.revokeObjectURL(imagemUrl);
      }
    } catch (error) {
      console.error(error);
      removerPromise = null;
      setErro(
        "Não foi possível remover o fundo. Verifique sua conexão e tente novamente."
      );
      setMensagem("");
    } finally {
      setCarregando(false);
    }
  }

  function selecionarArquivo(file?: File) {
    if (!file) return;

    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      setErro("Selecione uma imagem PNG, JPG ou WEBP.");
      return;
    }

    setArquivo(file);
    setOriginal(URL.createObjectURL(file));

    setResultado((anterior) => {
      if (anterior) URL.revokeObjectURL(anterior);
      return "";
    });

    setErro("");
    setMensagem("");
  }

  function baixarImagem() {
    if (!resultado) return;

    const link = document.createElement("a");
    link.href = resultado;
    link.download = "pd-tools-sem-fundo.png";
    link.click();
  }

  const painel = {
    background: "#111016",
    border: "1px solid #292531",
    borderRadius: "14px",
    padding: "22px",
  } as const;

  const botao = {
    background: "#8b5cf6",
    color: "#fff",
    border: "none",
    borderRadius: "9px",
    padding: "12px 18px",
    fontWeight: 700,
    cursor: "pointer",
    fontSize: "13px",
  } as const;

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#09080d",
        color: "#f7f5fb",
        padding: "0 20px 60px",
        fontFamily: "DM Sans, sans-serif",
      }}
    >
      <div style={{ maxWidth: "1000px", margin: "auto" }}>
        <header
          style={{
            height: "76px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid #292531",
          }}
        >
          <a href="/" style={{ fontWeight: 700, fontSize: "17px" }}>
            PD <span style={{ color: "#a78bfa" }}>TOOLS</span>
          </a>

          <a
            href="/"
            style={{ color: "#aaa5b4", fontSize: "13px" }}
          >
            ← Voltar ao início
          </a>
        </header>

        <section style={{ padding: "65px 0 30px" }}>
          <span
            style={{
              color: "#a78bfa",
              fontSize: "10px",
              letterSpacing: "2px",
              fontWeight: 700,
            }}
          >
            FERRAMENTA DE IMAGEM
          </span>

          <h1
            style={{
              fontSize: "clamp(30px, 5vw, 46px)",
              margin: "13px 0",
              letterSpacing: "-1.5px",
            }}
          >
            Removedor de <span style={{ color: "#a78bfa" }}>Fundo</span>
          </h1>

          <p style={{ color: "#9893a4", lineHeight: 1.7, maxWidth: "550px" }}>
            Remova o fundo das suas imagens automaticamente e baixe o
            resultado em PNG com transparência.
          </p>
        </section>

        <section style={painel}>
          <label
            htmlFor="imagem"
            style={{
              display: "block",
              border: "1px dashed #514263",
              borderRadius: "12px",
              padding: "35px 15px",
              textAlign: "center",
              cursor: "pointer",
              background: "#0d0b12",
            }}
          >
            <div style={{ fontSize: "30px", marginBottom: "12px" }}>＋</div>
            <strong>Escolha uma imagem</strong>
            <p style={{ color: "#898393", fontSize: "12px" }}>
              PNG, JPG ou WEBP
            </p>
            <input
              id="imagem"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={(e) => selecionarArquivo(e.target.files?.[0])}
              style={{ display: "none" }}
            />
          </label>

          {arquivo && (
            <div style={{ marginTop: "18px" }}>
              <p style={{ color: "#aaa5b4", fontSize: "12px" }}>
                Arquivo selecionado: {arquivo.name}
              </p>

              <button
                onClick={() => processarImagem(arquivo)}
                disabled={carregando}
                style={{
                  ...botao,
                  opacity: carregando ? 0.6 : 1,
                  cursor: carregando ? "wait" : "pointer",
                }}
              >
                {carregando ? "Processando..." : "Remover fundo"}
              </button>
            </div>
          )}

          {mensagem && (
            <p style={{ color: "#b99cff", fontSize: "13px", marginTop: "18px" }}>
              {mensagem}
            </p>
          )}

          {erro && (
            <p style={{ color: "#ff8585", fontSize: "13px", marginTop: "18px" }}>
              {erro}
            </p>
          )}
        </section>

        {(original || resultado) && (
          <section
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "18px",
              marginTop: "20px",
            }}
          >
            <div style={painel}>
              <h3 style={{ fontSize: "14px", marginTop: 0 }}>Imagem original</h3>
              {original && (
                <img
                  src={original}
                  alt="Imagem original"
                  style={{
                    width: "100%",
                    maxHeight: "350px",
                    objectFit: "contain",
                    borderRadius: "8px",
                  }}
                />
              )}
            </div>

            <div style={painel}>
              <h3 style={{ fontSize: "14px", marginTop: 0 }}>Resultado</h3>

              {resultado ? (
                <>
                  <div
                    style={{
                      backgroundColor: "#fff",
                      backgroundImage:
                        "linear-gradient(45deg,#ddd 25%,transparent 25%),linear-gradient(-45deg,#ddd 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#ddd 75%),linear-gradient(-45deg,transparent 75%,#ddd 75%)",
                      backgroundSize: "20px 20px",
                      backgroundPosition: "0 0,0 10px,10px -10px,-10px 0",
                      borderRadius: "8px",
                    }}
                  >
                    <img
                      src={resultado}
                      alt="Imagem sem fundo"
                      style={{
                        width: "100%",
                        maxHeight: "350px",
                        objectFit: "contain",
                        display: "block",
                      }}
                    />
                  </div>

                  <button
                    onClick={baixarImagem}
                    style={{ ...botao, marginTop: "15px", width: "100%" }}
                  >
                    ↓ Baixar PNG
                  </button>
                </>
              ) : (
                <div
                  style={{
                    minHeight: "180px",
                    display: "grid",
                    placeItems: "center",
                    color: "#777182",
                    fontSize: "12px",
                    textAlign: "center",
                  }}
                >
                  O resultado aparecerá aqui.
                </div>
              )}
            </div>
          </section>
        )}

        <p
          style={{
            color: "#777182",
            fontSize: "11px",
            textAlign: "center",
            marginTop: "35px",
            lineHeight: 1.7,
          }}
        >
          O processamento acontece no seu navegador. Na primeira utilização,
          será necessário baixar o modelo de inteligência artificial.
        </p>
      </div>
    </main>
  );
}
