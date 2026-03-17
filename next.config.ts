/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  reactStrictMode: false, // แนะนำให้เปิดเป็น true ในระหว่างพัฒนา
  devIndicators: false,

  // หากคุณต้องใช้รูปภาพจาก Domain ภายนอก ให้เปิดส่วนนี้
  // images: {
  //   remotePatterns: [
  //     {
  //       protocol: "https",
  //       hostname: "bucket-sahapan.s3.amazonaws.com",
  //     },
  //   ],
  // },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "foodsphere.sgp1.digitaloceanspaces.com",
      },
    ],
  },
};

export default nextConfig;