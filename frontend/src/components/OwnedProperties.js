import React, { useState, useEffect } from "react";

function OwnedProperties({ contract, account }) {
  const [ownedProperties, setOwnedProperties] = useState([]);

  useEffect(() => {
    async function fetchOwnedProperties() {
      if (!contract || !account) return;
      const totalProperties = await contract.getTotalProperties();
      const owned = [];

      for (let i = 0; i < totalProperties; i++) {
        const owner = await contract.ownerOf(i);
        if (owner.toLowerCase() === account.toLowerCase()) {
          const prop = await contract.properties(i);
          owned.push({
            id: i,
            name: prop.name,
            description: prop.description,
            metadataCID: prop.metadataCID,
          });
        }
      }
      setOwnedProperties(owned);
    }

    fetchOwnedProperties();
  }, [contract, account]);

  return (
    <div className="container mt-4">
      <h2>🛒 Mes propriétés</h2>
      <div className="row">
        {ownedProperties.map((property) => (
          <div key={property.id} className="col-md-4">
            <div className="card mb-4">
              <img src={`http://localhost:8080/ipfs/${property.metadataCID}`} alt={property.name} className="card-img-top" />
              <div className="card-body">
                <h5 className="card-title">{property.name}</h5>
                <p className="card-text">{property.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default OwnedProperties;
