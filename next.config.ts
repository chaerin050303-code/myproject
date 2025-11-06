const nextConfig = {
  // ✅ React Compiler 옵션 유지
  reactCompiler: true,

  // ✅ src/app 구조 인식 활성화
  experimental: {
    appDir: true,
  },

  // ✅ TypeScript / JavaScript 확장자 인식
  pageExtensions: ["tsx", "ts", "jsx", "js"],
};

export default nextConfig;
