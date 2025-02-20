import React from "react";
import { ethers } from "ethers";

function PropertyList({ properties, contract }) {
  const buyProperty = async (id, price) => {
    try {
      const tx = await contract.buyProperty(id, { value: ethers.utils.parseEther(price) });
      await tx.wait();
      alert("Achat réussi !");
      window.location.reload();
    } catch (error) {
      alert("Erreur lors de l'achat !");
      console.error(error);
    }
  };
  // console.log("ilage :" , properties);
  return (
    <div className="container mt-4">
      <h2>🏡 Propriétés disponibles</h2>
      <div className="row">
        {properties.map((property) => (
          <div key={property.id} className="col-md-4">
            <div className="card mb-4">
              <img src={`http://localhost:8080/ipfs/QmVsDfLZb8pUrSTPTGf31QfWNJD89HAH9cy7EVX4T6tKYL`} alt={property.name} className="card-img-top" /> 
              <div className="card-body">
                <h5 className="card-title">{property.name}</h5>
                <p className="card-text">{property.description}</p>
                <p><strong>Lieu:</strong> {property.location}</p>
                <p><strong>Surface:</strong> {property.area} m²</p>
                <p><strong>Prix:</strong> {property.price} ETH</p>
                <p className="card-text">sd{property.metadataCID}</p>
                <button className="btn btn-primary" onClick={() => buyProperty(property.id, property.price)}>Acheter 🏠</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PropertyList;
