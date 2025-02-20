const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ImmoToken Contract", function () {
  let ImmoToken, immoToken, owner, addr1, addr2;

  beforeEach(async function () {
    // Déploiement du contrat avant chaque test
    ImmoToken = await ethers.getContractFactory("ImmoToken");
    [owner, addr1, addr2] = await ethers.getSigners();
    immoToken = await ImmoToken.deploy();
    await immoToken.deployed();
  });

  it("Devrait être déployé avec succès", async function () {
    expect(immoToken.address).to.not.be.null;
  });

  it("Devrait permettre la création d'une propriété", async function () {
    const tx = await immoToken.createProperty(
      "Maison de test",
      "Une belle maison en bord de mer",
      "Paris, France",
      120,
      ethers.utils.parseEther("10"),
      "QmdftxxRJ2ojyg7nTonrQ5Rgr38bZw4VHVqisLL9jg5JWS"
    );
    await tx.wait();

    const property = await immoToken.properties(0);
    expect(property.name).to.equal("Maison de test");
    expect(property.description).to.equal("Une belle maison en bord de mer");
    expect(property.location).to.equal("Paris, France");
    expect(property.area).to.equal(120);
    expect(property.price).to.equal(ethers.utils.parseEther("10"));
    expect(property.metadataCID).to.equal("QmdftxxRJ2ojyg7nTonrQ5Rgr38bZw4VHVqisLL9jg5JWS");
  });

  it("Devrait permettre de récupérer une propriété", async function () {
    await immoToken.createProperty(
      "Appartement Luxe",
      "Appartement moderne au centre-ville",
      "Lyon, France",
      80,
      ethers.utils.parseEther("5"),
      "QmdftxxRJ2ojyg7nTonrQ5Rgr38bZw4VHVqisLL9jg5JWS'"
    );

    const property = await immoToken.properties(0);
    expect(property.name).to.equal("Appartement Luxe");
    expect(property.location).to.equal("Lyon, France");
  });

  it("Ne devrait pas permettre une propriété avec une surface ou un prix négatif", async function () {
    await expect(
      immoToken.createProperty(
        "Villa",
        "Superbe villa",
        "Nice, France",
        -200,
        ethers.utils.parseEther("15"),
        "QmdftxxRJ2ojyg7nTonrQ5Rgr38bZw4VHVqisLL9jg5JWS'"
      )
    ).to.be.revertedWith("Surface invalide");

    await expect(
      immoToken.createProperty(
        "Villa",
        "Superbe villa",
        "Nice, France",
        200,
        ethers.utils.parseEther("-5"),
        "QmdftxxRJ2ojyg7nTonrQ5Rgr38bZw4VHVqisLL9jg5JWS"
      )
    ).to.be.revertedWith("Prix invalide");
  });

  it("Devrait permettre à plusieurs utilisateurs de créer des propriétés", async function () {
    await immoToken.connect(addr1).createProperty(
      "Chalet en montagne",
      "Chalet chaleureux avec vue",
      "Annecy, France",
      150,
      ethers.utils.parseEther("8"),
      "QmdftxxRJ2ojyg7nTonrQ5Rgr38bZw4VHVqisLL9jg5JWS"
    );

    await immoToken.connect(addr2).createProperty(
      "Studio en ville",
      "Petit studio cosy",
      "Marseille, France",
      35,
      ethers.utils.parseEther("3"),
      "QmdftxxRJ2ojyg7nTonrQ5Rgr38bZw4VHVqisLL9jg5JWS"
    );

    const chalet = await immoToken.properties(0);
    const studio = await immoToken.properties(1);

    expect(chalet.name).to.equal("Chalet en montagne");
    expect(studio.name).to.equal("Studio en ville");
  });
});
