require('dotenv').config();
const S3 = require("aws-sdk/clients/s3");
const multer = require('multer');
const profileQueries = require('../../queries/profileQueries'); // Assuming this is the correct path

const accessKeyId = process.env.STORJ_ACCESS_KEY;
const secretAccessKey = process.env.STORJ_SECRET_KEY;
const bucketName = process.env.STORJ_BUCKET_NAME;
const endpoint = 'https://gateway.storjshare.io';

const s3 = new S3({
    accessKeyId,
    secretAccessKey,
    endpoint,
    s3ForcePathStyle: true,
    signatureVersion: "v4",
    connectTimeout: 0,
    httpOptions: { timeout: 0 }
});

// Initialize multer for handling file uploads
const upload = multer();

const profilePictureUpload = async (req, res) => {
    try {
        // Using multer to handle the file upload
        upload.single('image')(req, res, async (err) => {
            if (err) {
                return res.status(500).json({ msg: 'Error uploading file', error: err });
            }

            const file = req.file;
            const userId = req.body.email;
            
            if (!file) {
                return res.status(400).json({ msg: 'No file provided' });
            }

            // Create a unique key for the image (using original name + timestamp)
            const fileName = `${Date.now()}_${file.originalname}`;

            const params = {
                Bucket: bucketName,
                Key: fileName,
                Body: file.buffer,
                ContentType: file.mimetype,
                // ACL: 'public-read' // Make the object publicly accessible
            };

            // Upload the file to Storj
            await s3.upload(params, {
                partSize: 64 * 1024 * 1024
            }).promise();

            // Construct the public URL for the uploaded object
            const url = `${process.env.STORJ_BUCKET_LINK}${fileName}`;
            // Check if the user exists and update the profile picture URL
            profileQueries.getUserById(userId, (err, result) => {
                if (err) {
                    return res.status(500).json({ msg: 'Error checking user', error: err });
                }
                if (result.length > 0) {
                    profileQueries.updateUserProfilePicture(userId, url, (updateErr) => {
                        if (updateErr) {
                            return res.status(500).json({ msg: 'Error updating profile picture', error: updateErr });
                        }
                        return res.status(200).json({ msg: 'File uploaded and profile picture updated successfully', url });
                    });
                } else {
                    return res.status(404).json({ msg: 'User not found' });
                }
            });
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ msg: 'Server error', error: error.message });
    }
};

module.exports = profilePictureUpload;
