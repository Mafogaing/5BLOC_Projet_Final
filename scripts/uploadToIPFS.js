    const { create } = require("ipfs-http-client");
    const fs = require("fs");

    const ipfs = create({ url: "http://127.0.0.1:5001" }); // Connexion à IPFS local

    // Fonction pour uploader une image sur IPFS
    async function uploadImage(imagePath) {
        try {
            const imageBuffer = fs.readFileSync(imagePath);
            const file = await ipfs.add({ content: Buffer.from(imageBuffer) });

            const ipfsUrl = `http://localhost:8080/ipfs/${file.cid.toString()}`;
            console.log(`Image uploadée sur IPFS: ${ipfsUrl}`);

            return ipfsUrl;
        } catch (error) {
            console.error(`Erreur lors de l'upload de l'image "${imagePath}": ${error.message}`);
            return null;
        }
    }

    // Fonction pour uploader les métadonnées sur IPFS
    async function uploadMetadata(property, ipfsImageUrl) {
        try {
            const metadata = {
                name: property.name,
                description: property.description,
                image: ipfsImageUrl, // URL IPFS de l'image
                attributes: [
                    { trait_type: "Location", value: property.location },
                    { trait_type: "Area", value: `${property.area} m²` },
                    { trait_type: "Price", value: `${property.price} ETH` },
                ],
            };

            const file = await ipfs.add({ content: JSON.stringify(metadata) });
            const metadataUrl = `http://localhost:8080/ipfs/${file.cid.toString()}`;
            
            console.log(`Métadonnées uploadées sur IPFS: ${metadataUrl}`);
            return file.cid.toString();
        } catch (error) {
            console.error(`Erreur lors de l'upload des métadonnées: ${error.message}`);
            return null;
        }
    }

    module.exports = { uploadImage, uploadMetadata };
