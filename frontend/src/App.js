import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { ethers } from "ethers";
import Navbar from "./components/Navbar";
import PropertyList from "./components/PropertyList";
import OwnedProperties from "./components/OwnedProperties";
import { uploadMetadata, uploadImage } from "./scripts/uploadToIPFS";
import ImmoToken from "./contracts/ImmoToken.json";
import "./styles.css";

const CONTRACT_ADDRESS = "0x0AEB6C8C113eaD4a1420FC7e4eE4cF0D0051c1C9";

const ImmoTokenABI = ImmoToken.abi;

function App() {
  const [account, setAccount] = useState(null);
  const [properties, setProperties] = useState([]);
  const [contract, setContract] = useState(null);

  useEffect(() => {
    loadBlockchainData();
  }, []);

  async function loadBlockchainData() {
    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const accounts = await provider.send("eth_requestAccounts", []);
      setAccount(accounts[0]);

      const contractInstance = new ethers.Contract(
        CONTRACT_ADDRESS,
        ImmoTokenABI,
        signer
      );
      setContract(contractInstance);

      const totalProperties = await contractInstance.getTotalProperties();
      const loadedProperties = [];
      for (let i = 0; i < totalProperties; i++) {
        const prop = await contractInstance.properties(i);
        loadedProperties.push({
          id: i,
          name: prop.name,
          description: prop.description,
          location: prop.location,
          area: prop.area.toString(),
          price: ethers.utils.formatEther(prop.price),
          metadataCID: prop.metadataCID,
        });
      }
      setProperties(loadedProperties);
    } else {
      alert("Veuillez installer Metamask !");
    }
  }

  return (
    <Router>
      <Navbar account={account} />
      <Routes>
        <Route path="/" element={<PropertyList properties={properties} contract={contract} />} />
        <Route path="/owned" element={<OwnedProperties contract={contract} account={account} />} />
      </Routes>
    </Router>
  );
}

export default App;
