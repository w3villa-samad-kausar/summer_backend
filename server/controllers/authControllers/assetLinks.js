require("dotenv").config();

const assetLinkGenerator = (req, res) => {
  const assetLinks = [
    {
      relation: ["delegate_permission/common.handle_all_urls"],
      target: {
        namespace: "Summer",
        package_name: "com.summer",
        sha256_cert_fingerprints: [process.env.SHA256_CERT_FINGERPRINT]
      }
    }
  ];
  console.log(assetLinks)

  res.json(assetLinks);
};

module.exports=assetLinkGenerator