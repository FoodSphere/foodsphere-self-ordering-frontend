import { useQRCode } from 'next-qrcode';

interface QrCodeProps {
  data: string;
  width?: number;
}

const QrCode = ({
  data,
  width,
}: QrCodeProps) => {
  const { Image } = useQRCode();

  return (
    <Image
      text={data}
      options={{
        type: 'image/jpeg',
        quality: 1,
        errorCorrectionLevel: 'M',
        margin: 3,
        scale: 4,
        width: !!width ? width : 200,
        color: {
          dark: '#000',
          light: '#FFFFFF',
        },
      }}
    />
  );
};

export default QrCode;
