const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadToCloudinary = async (file, folder) => {
    try {
        const result = await cloudinary.uploader.upload(file, {
            folder: `real-estate/${folder}`,
            resource_type: 'auto',
        });
        return {
            public_id: result.public_id,
            url: result.secure_url,
        };
    } catch (error) {
        throw new Error('Error uploading to Cloudinary');
    }
};

const deleteFromCloudinary = async (public_id) => {
    try {
        await cloudinary.uploader.destroy(public_id);
    } catch (error) {
        throw new Error('Error deleting from Cloudinary');
    }
};

module.exports = { uploadToCloudinary, deleteFromCloudinary };