// src/components/QRCodeGenerator.tsx
import React from 'react';
import { QRCodeCanvas } from 'qrcode.react';

interface QRCodeGeneratorProps {
  link: string;
}

const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({ link }) => {
  return (
    <div>
      <QRCodeCanvas
        value={link}
        size={200}
        bgColor="#ffffff"
        fgColor="#000000"
        level="H"
        includeMargin={true}
      />
    </div>
  );
};

export default QRCodeGenerator;
