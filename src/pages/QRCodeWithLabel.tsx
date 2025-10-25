x// src/pages/QRCodeWithLabel.tsx
import React, { useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";

interface QRCodeWithLabelProps {
  link: string;
  patrimonio: string;
  descricao?: string; // nova prop para a descrição
}

const QRCodeWithLabel: React.FC<QRCodeWithLabelProps> = ({ link, patrimonio, descricao = "" }) => {
  const qrRef = useRef<HTMLCanvasElement>(null);

  const handleDownload = () => {
    if (!qrRef.current) return;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const qrCanvas = qrRef.current;
    const qrSize = qrCanvas.width;
    const padding = 20;
    const fontSize = 24;
    const descricaoFontSize = 15;
    const maxDescricaoLength = 60; // aumente para 60 caracteres

    // Quebra a descrição em até 2 linhas de até 30 caracteres cada
    let descricaoLines: string[] = [];
    if (descricao.length > 30) {
      descricaoLines.push(descricao.substring(0, 30));
      descricaoLines.push(descricao.substring(30, maxDescricaoLength));
    } else {
      descricaoLines.push(descricao);
    }

    // altura total do canvas: QR + texto do patrimônio + 2 linhas de descrição + margens
    canvas.width = qrSize + padding * 2;
    canvas.height = qrSize + fontSize + descricaoFontSize * descricaoLines.length + padding * 4;

    // fundo branco
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Texto do patrimônio
    ctx.fillStyle = "#000000";
    ctx.font = `${fontSize}px Arial`;
    ctx.textAlign = "center";
    ctx.fillText(`${patrimonio}`, canvas.width / 2, fontSize + padding / 2);

    // QR Code
    ctx.drawImage(qrCanvas, padding, fontSize + padding, qrSize, qrSize);

    // Descrição abaixo do QR (até 2 linhas)
    ctx.font = `${descricaoFontSize}px Arial`;
    descricaoLines.forEach((line, idx) => {
      ctx.fillText(
        line,
        canvas.width / 2,
        fontSize + qrSize + padding * 2 + descricaoFontSize / 2 + idx * (descricaoFontSize + 2)
      );
    });

    // Criar link de download
    const linkEl = document.createElement("a");
    linkEl.download = `patrimonio-${patrimonio}.png`;
    linkEl.href = canvas.toDataURL("image/png");
    linkEl.click();
  };

  return (
    <div style={{ textAlign: "center" }}>
      <QRCodeCanvas
        ref={qrRef}
        value={link}
        size={200}
        bgColor="#ffffff"
        fgColor="#000000"
        level="H"
        includeMargin={true}
      />
      <p>{patrimonio}</p>
      {descricao && (
        <div style={{ whiteSpace: "pre-line" }}>
          {descricao.length > 60
            ? descricao.substring(0, 30) + "\n" + descricao.substring(30, 60) + "…"
            : descricao.length > 30
            ? descricao.substring(0, 30) + "\n" + descricao.substring(30)
            : descricao}
        </div>
      )}
      <button
        onClick={handleDownload}
        style={{
          marginTop: "10px",
          padding: "8px 16px",
          borderRadius: "8px",
          border: "none",
          background: "#2563eb",
          color: "#fff",
          cursor: "pointer",
        }}
      >
        📥 Baixar QR + Patrimônio
      </button>
    </div>
  );
};

export default QRCodeWithLabel;
