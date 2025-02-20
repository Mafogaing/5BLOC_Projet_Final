import { create } from "ipfs-http-client";

const ipfs = create({ url: "http://127.0.0.1:5001" }); // Connexion à IPFS local

// Fonction pour uploader une image sur IPFS
async function uploadImage(file) {
    try {
        const reader = new FileReader();

        return new Promise((resolve, reject) => {
            reader.onloadend = async () => {
                try {
                    const fileBuffer = new Uint8Array(reader.result);
                    const addedFile = await ipfs.add(fileBuffer);
                    const ipfsUrl = `http://localhost:8080/ipfs/${addedFile.cid.toString()}`;

                    console.log(`Image uploadée sur IPFS: ${ipfsUrl}`);
                    resolve(ipfsUrl);
                } catch (error) {
                    console.error(`Erreur lors de l'upload de l'image: ${error.message}`);
                    reject(null);
                }
            };

            reader.onerror = () => reject(null);
            reader.readAsArrayBuffer(file);
        });
    } catch (error) {
        console.error(`Erreur lors du chargement du fichier: ${error.message}`);
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

        const addedFile = await ipfs.add(JSON.stringify(metadata));
        const metadataUrl = `http://localhost:8080/ipfs/${addedFile.cid.toString()}`;

        console.log(`Métadonnées uploadées sur IPFS: ${metadataUrl}`);
        return metadataUrl;
    } catch (error) {
        console.error(`Erreur lors de l'upload des métadonnées: ${error.message}`);
        return null;
    }
}

export { uploadImage, uploadMetadata };
