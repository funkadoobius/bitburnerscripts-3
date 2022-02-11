const cities = ["Aevum", "Chongqing", "Sector-12", "New Tokyo", "Ishima", "Volhaven"];
const jobs = ["Operations", "Engineer", "Business", "Management", "Research & Development"];

/** @param {NS} ns **/
export async function main(ns) {
	const sourceFiles = ns.getOwnedSourceFiles();
	const player = ns.getPlayer();
	if (sourceFiles[3] !== 3 && !ns.corporation.hasUnlockUpgrade("Warehouse API")) throw new Error("This script requires the Warehouse API");
	if (sourceFiles[3] !== 3 && !ns.corporation.hasUnlockUpgrade("Office API")) throw new Error("This script requires the Office API");

	let multi = player.bitNodeN === 1 || player.bitNodeN === 3 ? 1 : 0;
	if (sourceFiles[5] > 0) multi = ns.getBitNodeMultipliers().CorporationValuation;
	if (multi != 1) throw new Error("This script does not know how to deal with BitNodes that have a valuation mod.");

	if (!player.hasCorporation) startCorp(ns);

	let roundOne = ns.corporation.getInvestmentOffer();

	if (roundOne.round === 1) {
		await prepRoundOne(ns);
		while (roundOne.funds < 2e11) {
			await ns.sleep(10 * 1000);
			roundOne = ns.corporation.getInvestmentOffer();
		}
		ns.corporation.acceptInvestmentOffer();
		const corp = ns.corporation.getCorporation();
		if (corp.funds < 2e11) throw new Error("Investment round 1 went a little wrong.")
	}

	ns.corporation.upgradeOfficeSize("Agriculture", "Aevum", 15);
	for (let i = 0; i < 15; i++) {
		ns.corporation.hireEmployee("Agriculture", "Aevum");
	}
	ns.print(await ns.corporation.setAutoJobAssignment("Agriculture", "Aevum", "Engineer", 16));

	const corp = ns.corporation.getCorporation();
	const tobacco = corp.divisions.find(d => d.type === "Tobacco");

	if (!tobacco) ns.corporation.expandIndustry("Tobacco", "Tobacco");

	const division = ns.corporation.getDivision("Tobacco");
	const prod1 = division.products.includes("product 1");

	if (!prod1) ns.corporation.makeProduct("Tobacco", "Sector-12", "product 1", 1e9, 1e9);

	let prod = ns.corporation.getProduct("Tobacco", "product 1");
	while (prod.developmentProgress < 100) {
		await ns.sleep(10 * 1000);
		prod = ns.corporation.getProduct("Tobacco", "product 1");
	}

	ns.corporation.goPublic(0);

	ns.corporation.bribe("Sector-12", 1e12, 1);
}

function startCorp(ns) {
	const player = ns.getPlayer();
	const selfFund = player.bitNodeN !== 3 || player.money >= 150e9; // self fund if we have the money even on bn3
	if (selfFund && player.money < 150e9) {
		throw new Error("Insufficient funds to start a corp.");
	}
	const success = ns.corporation.createCorporation("Corp", false);
	if (!success) {
		ns.print("Can't make a corp.");
		return;
	}
}

async function prepRoundOne(ns) {
	let corp = ns.corporation.getCorporation();

	// Start Agri

	const agri = corp.divisions.find(d => d.type === "Agriculture");

	if (!agri) {
		corp = ns.corporation.getCorporation();
		if (ns.corporation.getExpandIndustryCost("Agriculture") > corp.funds) {
			throw new Error("Insufficient funds to expand into Agriculture");
		}
		ns.corporation.expandIndustry("Agriculture", "Agriculture");
	}

	// Buy Smart Supply

	const hasSmart = ns.corporation.hasUnlockUpgrade("Smart Supply");
	if (!hasSmart) {
		corp = ns.corporation.getCorporation();
		if (ns.corporation.getUnlockUpgradeCost("Smart Supply") > corp.funds) {
			throw new Error("Insufficient funds to buy Smart Supply");
		}
		ns.corporation.unlockUpgrade("Smart Supply");
	}

	// Get all Offices

	let division = ns.corporation.getDivision("Agriculture");
	ns.print(division.cities);
	if (division.cities.length < cities.length) {
		for (const city of cities) {
			if (!division.cities.includes(city)) {
				corp = ns.corporation.getCorporation();
				if (ns.corporation.getExpandCityCost() > corp.funds) {
					throw new Error(`Insufficient funds to expand into ${city}`);
				}
				ns.corporation.expandCity("Agriculture", city);
			}
		}
	}

	// 300 Storage
	for (const city of cities) {
		if (!ns.corporation.hasWarehouse("Agriculture", city)) {
			corp = ns.corporation.getCorporation();
			if (ns.corporation.getPurchaseWarehouseCost() > corp.funds) {
				throw new Error(`Insufficient funds to Purchase Warehouse in ${city}`);
			}
			ns.corporation.purchaseWarehouse("Agriculture", city);
		}
		let warehouse = ns.corporation.getWarehouse("Agriculture", city);
		while (warehouse.size < 300) {
			corp = ns.corporation.getCorporation();
			if (ns.corporation.getUpgradeWarehouseCost("Agriculture", city) > corp.funds) {
				throw new Error(`Insufficient funds to Upgrade Warehouse in ${city}`);
			}
			ns.corporation.upgradeWarehouse("Agriculture", city);
			warehouse = ns.corporation.getWarehouse("Agriculture", city);
		}

		if (!warehouse.smartSupplyEnabled) {
			ns.corporation.setSmartSupply("Agriculture", city, true);
			// TODO: add something to allow to toggle UseLeftovers see SmartSupplyModal.tsx
		}
	}

	// 1 x Advert.Inc
	if (ns.corporation.getHireAdVertCount("Agriculture") < 1) {
		corp = ns.corporation.getCorporation();
		if (ns.corporation.getHireAdVertCost("Agriculture") > corp.funds) {
			throw new Error(`Insufficient funds to Hire AdVert`);
		}
		ns.corporation.hireAdVert("Agriculture");
	}

	//Upgrades +1 level in this order (+2 max): 
	//FocusWires, Neural Accelerators, Speech Processor Implants, 
	//Nuoptimal Nootropic Injector Implants, Smart Factories
	const upgrades = ["FocusWires", "Neural Accelerators", "Speech Processor Implants",
		"Nuoptimal Nootropic Injector Implants", "Smart Factories"];
	for (let i = 1; i <= 2; i++) {
		for (const upgrade of upgrades) {
			const level = ns.corporation.getUpgradeLevel(upgrade);
			if (level >= i) continue;

			corp = ns.corporation.getCorporation();
			if (ns.corporation.getUpgradeLevelCost(upgrade) > corp.funds) {
				throw new Error(`Insufficient funds to Upgrade ${upgrade} to level ${i}`);
			}
			ns.corporation.levelUpgrade(upgrade);
		}
	}

	// Hardware 125 (12.5), AI Cores 75 (7.5), Real Estate 27k (2.7k)
	for (const city of cities) {
		let hardware = ns.corporation.getMaterial("Agriculture", city, "Hardware");
		let aiCores = ns.corporation.getMaterial("Agriculture", city, "AI Cores");
		let realEstate = ns.corporation.getMaterial("Agriculture", city, "Real Estate");

		while (hardware.qty < 125) {
			ns.corporation.buyMaterial("Agriculture", city, "Hardware", (125 - hardware.qty) / 10);
			hardware = ns.corporation.getMaterial("Agriculture", city, "Hardware");
			await ns.sleep(50);
		}
		ns.corporation.buyMaterial("Agriculture", city, "Hardware", 0);

		while (aiCores.qty < 75) {
			ns.corporation.buyMaterial("Agriculture", city, "AI Cores", (75 - aiCores.qty) / 10);
			aiCores = ns.corporation.getMaterial("Agriculture", city, "AI Cores");
			await ns.sleep(50);
		}
		ns.corporation.buyMaterial("Agriculture", city, "AI Cores", 0);

		while (realEstate.qty < 27000) {
			ns.corporation.buyMaterial("Agriculture", city, "Real Estate", (27000 - realEstate.qty) / 10);
			realEstate = ns.corporation.getMaterial("Agriculture", city, "Real Estate");
			await ns.sleep(50);
		}
		ns.corporation.buyMaterial("Agriculture", city, "Real Estate", 0);
	}

	// set prices
	for (const city of cities) {
		ns.corporation.sellMaterial("Agriculture", city, "Food", "MAX", "MP");
		ns.corporation.sellMaterial("Agriculture", city, "Plants", "MAX", "MP");
	}

	// set people
	for (const city of cities) {
		let office = ns.corporation.getOffice("Agriculture", city);
		if (office.employees.length < 3) {
			for (let i = 0; i < 3 - office.employees.length; i++) ns.corporation.hireEmployee("Agriculture", city);
		}
		office = ns.corporation.getOffice("Agriculture", city);
		await ns.corporation.assignJob("Agriculture", city, office.employees[0], "Operations");
		await ns.corporation.assignJob("Agriculture", city, office.employees[1], "Engineer");
		await ns.corporation.assignJob("Agriculture", city, office.employees[2], "Business");
	}
}