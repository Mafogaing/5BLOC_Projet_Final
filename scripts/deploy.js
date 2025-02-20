const hre = require("hardhat");
const axios = require("axios");
const { uploadMetadata,uploadImage } = require("./uploadToIPFS");
const { generateAccounts, generateProperties, assignPropertiesToAccounts } = require("./generateData");

const MAX_PARALLEL_TX = 5; // Nombre max de transactions en parallèle

// Vérifie si un CID est valide sur IPFS
async function verifyCID(cid) {
  try {
    const response = await axios.get(`http://localhost:8080/ipfs/${cid}`);
    return response.status === 200;
  } catch (error) {
    return false;
  }
}

// Exécute un traitement en batch pour éviter de surcharger le réseau
async function processInBatches(items, processFn, batchSize) {
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    await Promise.all(batch.map(processFn));
  }
}

async function main() {
  try {
    console.log("🔹 Génération des comptes et des propriétés...");

    // Générer des comptes et des propriétés
    const accounts = generateAccounts(5);
    let properties = generateProperties(20);

    if (!accounts.length) throw new Error("Aucun compte généré !");
    if (!properties.length) throw new Error("Aucune propriété générée !");

    console.log("Comptes et propriétés générés avec succès !");

    // Vérifier les propriétés avant upload
    properties.forEach((prop, index) => {
      if (!prop.name || !prop.description || !prop.location || 
          typeof prop.area !== 'number' || typeof prop.price !== 'number') {
        console.warn(`Propriété ${index + 1} invalide :`, prop);
      }
    });

    // Upload des propriétés sur IPFS en parallèle
    console.log("Upload des propriétés sur IPFS...");
    properties = await Promise.all(
      properties.map(async (property) => {
        console.log(`Upload de l'image: ${property.image}...`);
        const ipfsImageUrl = await uploadImage(property.image);
        // const ipfsImageUrl = "http://localhost:8080/ipfs/QmImageCid"; // Remplacer par l'URL d'image sur IPFS
        const metadataCid = await uploadMetadata(property, ipfsImageUrl);
        if (!metadataCid) throw new Error(`Impossible d'uploader la propriété ${property.name} sur IPFS.`);
        return { ...property, metadataCID: metadataCid };
      })
    );

    console.log("Upload sur IPFS terminé !");

    // Vérification des CID en parallèle
    console.log("🔹 Vérification des CID sur IPFS...");
    const verificationResults = await Promise.all(
      properties.map(async (prop) => ({
        prop,
        isValid: await verifyCID(prop.metadataCID),
      }))
    );

    const invalidCIDs = verificationResults.filter(({ isValid }) => !isValid);
    if (invalidCIDs.length > 0) {
      console.error("CID invalides sur IPFS :", invalidCIDs.map(({ prop }) => prop.metadataCID));
      throw new Error("Certains CID ne sont pas accessibles !");
    }

    console.log("Tous les CID sont valides et accessibles sur IPFS !");

    // Assigner les propriétés aux comptes
    console.log("Assignation des propriétés aux comptes...");
    const assignedProperties = assignPropertiesToAccounts(properties, accounts);

    if (!assignedProperties.length) throw new Error("L'assignation des propriétés a échoué !");

    console.log("Propriétés assignées avec succès !");

    // Déploiement du contrat
    console.log("Déploiement du contrat...");

    const ImmoToken = await hre.ethers.getContractFactory("ImmoToken");
    const contract = await ImmoToken.deploy();
    await contract.deployed();

    console.log("ImmoToken déployé à l'adresse :", contract.address);

    // Ajout des propriétés sur la blockchain en parallèle (batch limité)
    console.log("Ajout des propriétés sur la blockchain...");
    await processInBatches(assignedProperties, async (property) => {
      try {
        console.log(`Création de la propriété avec CID: ${property.metadataCID}...`);
        const tx = await contract.createProperty(
          property.name,
          property.description,
          property.location,
          property.area,
          property.price,
          property.metadataCID
        );
        await tx.wait();
        console.log(`Propriété ajoutée à la blockchain avec succès !`);
      } catch (txError) {
        console.error(`Erreur lors de l'ajout de la propriété :`, txError);
      }
    }, MAX_PARALLEL_TX);

    console.log("Toutes les propriétés valides ont été ajoutées à la blockchain !");
    console.log("ImmoToken déployé à l'adresse :", contract.address);

  } catch (error) {
    console.error("Erreur lors du déploiement :", error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error("Erreur inattendue :", error);
    process.exit(1);
  });
