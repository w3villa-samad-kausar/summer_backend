require("dotenv").config();

const assetLinkGenerator = (req, res) => {
  const assetLinks = [
    {
      relation: ["delegate_permission/common.handle_all_urls"],
      target: {
        namespace: "android_app",
        package_name: "com.yourapp",
        sha256_cert_fingerprints: [process.env.SHA256_FINGERPRINT]
      }
    }
  ];

  res.json(assetLinks);
};

module.exports=assetLinkGenerator