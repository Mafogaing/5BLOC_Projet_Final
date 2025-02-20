const ethers = require("ethers");
const { faker } = require('@faker-js/faker'); // Utilisation de Faker pour les données aléatoires
const { uploadImage, uploadMetadata } = require("./uploadToIPFS");

// Générer des comptes Ethereum aléatoires
function generateAccounts(numAccounts) {
    let accounts = [];
    for (let i = 0; i < numAccounts; i++) {
        let wallet = ethers.Wallet.createRandom();
        accounts.push({
            address: wallet.address,
            privateKey: wallet.privateKey,
            properties: [] // Initialisation des propriétés pour chaque compte
        });
    }
    return accounts;
}

// Générer des propriétés avec des images locales
function generateProperties(numProperties) {
    let properties = [];
    for (let i = 0; i < numProperties; i++) {
        if (faker.location && typeof faker.location.street === 'function') {
            properties.push({
                name: faker.location.street(),
                description: faker.lorem.sentence(),
                location: faker.location.city(),
                area: Math.floor(Math.random() * 300) + 50, // Surface entre 50 et 350 m²
                price: Math.round(Math.random() * 100), // Prix entre 0 et 100 ETH 

                image: `./images/property${i + 1}.${Math.random() > 0.5 ? "jpeg" : "jpeg"}`, // Alternance entre .avif et .jpeg
            });
        } else {
            console.log('faker.location.street n\'est pas disponible');
        }
    }
    return properties;
}

// Fonction pour uploader les images et métadonnées sur IPFS
async function uploadPropertiesToIPFS(properties) {
    let uploadedProperties = [];

    for (let property of properties) {
        try {
            console.log(`Upload de l'image: ${property.image}...`);
            const ipfsImageUrl = await uploadImage(property.image);

            if (!ipfsImageUrl) {
                console.error(`Impossible d'uploader l'image: ${property.image}`);
                continue;
            }

            console.log(`Upload des métadonnées pour ${property.name}...`);
            const metadataCid = await uploadMetadata({
                ...property,
                image: ipfsImageUrl, // On met bien l'URL IPFS ici !
            });

            if (!metadataCid) {
                console.error(`Impossible d'uploader les métadonnées pour ${property.name}`);
                continue;
            }

            uploadedProperties.push({
                ...property,
                image: ipfsImageUrl, // Remplace l'image locale par l'URL IPFS
                metadataCid,
            });

            console.log(`Propriété ajoutée sur IPFS: ${property.name}`);
        } catch (error) {
            console.error(`Erreur lors de l'upload IPFS: ${error.message}`);
        }
    }

    return uploadedProperties;
}

// Fonction pour associer les propriétés aux comptes aléatoirement
function assignPropertiesToAccounts(accounts, properties) {
    let assignedProperties = accounts.map(account => ({
        ...account,
        properties: []
    }));

    properties.forEach(property => {
        let randomIndex = Math.floor(Math.random() * accounts.length);
        assignedProperties[randomIndex].properties.push(property);
    });

    return assignedProperties;
}



// Exécuter la génération et l'upload IPFS
async function main() {
    const accounts = generateAccounts(5);
    console.log("Comptes Ethereum générés:");
    console.log(accounts);

    const properties = generateProperties(20);
    console.log("\nPropriétés générées (avant upload IPFS):");
    console.log(properties);

    const propertiesWithIPFS = await uploadPropertiesToIPFS(properties);

    console.log("\nPropriétés mises à jour avec IPFS:");
    console.log(propertiesWithIPFS);

    const assignedProperties = assignPropertiesToAccounts(accounts, propertiesWithIPFS);

    console.log("\nPropriétés associées aux comptes:");
    console.log(JSON.stringify(assignedProperties, null, 2));
}

main();

module.exports = { generateAccounts, generateProperties, uploadPropertiesToIPFS, assignPropertiesToAccounts };
