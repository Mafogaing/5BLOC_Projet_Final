import { useContext, useState, useEffect } from 'react';
import Web3Context from './App';
import axios from 'axios';

function PropertyList() {
    const { account, contract } = useContext(Web3Context);
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadProperties = async () => {
            if (contract) {
                try {
                    setLoading(true);
                    const propertyCount = await contract.totalSupply();
                    const propertiesList = [];

                    for (let i = 1; i <= propertyCount; i++) {
                        const property = await contract.properties(i);
                        const metadata = await fetchMetadata(property.ipfsHash); // Assurez-vous que cette fonction existe
                        propertiesList.push({ ...property, metadata, id: i });
                    }

                    setProperties(propertiesList);
                } catch (error) {
                    console.error("Erreur lors du chargement des propriétés :", error);
                } finally {
                    setLoading(false);
                }
            }
        };

        loadProperties();
    }, [contract]);

    const fetchMetadata = async (ipfsHash) => {
        try {
            const response = await axios.get(`http://localhost:8080/ipfs/${ipfsHash}`); // Remplacez par votre passerelle IPFS
            return response.data;
        } catch (error) {
            console.error("Erreur lors de la récupération des métadonnées IPFS :", error);
            return null;
        }
    };

    return (
        <div>
            <h2>Liste des Propriétés</h2>
            {loading ? (
                <p>Chargement des propriétés...</p>
            ) : (
                <ul>
                    {properties.map((property) => (
                        <li key={property.id}>
                            <h3>{property.metadata?.name || 'Nom de la propriété'}</h3>
                            <p>Adresse: {property.metadata?.propertyAddress || 'Adresse inconnue'}</p>
                            <p>Prix: {ethers.utils.formatEther(property.price)} ETH</p>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default PropertyList;
