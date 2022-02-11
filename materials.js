/** @param {NS} ns **/
export async function main(ns) {
	const cities = ["Aevum", "Chongqing", "Sector-12", "New Tokyo", "Ishima", "Volhaven"];
	const upgrades = ["FocusWires", "Neural Accelerators", "Speech Processor Implants",
		"Nuoptimal Nootropic Injector Implants", "Smart Factories"];

	let corp = ns.corporation.getCorporation(); //refresh corp stats

	if (!ns.corporation.hasUnlockUpgrade("Warehouse API") && ns.corporation.getUnlockUpgradeCost("Warehouse API") > corp.funds) {
		throw new Error("FAILED: Insufficient funds for Warehouse API, required")
	} else if (!ns.corporation.hasUnlockUpgrade("Warehouse API") && ns.corporation.getUnlockUpgradeCost("Warehouse API") < corp.funds) {
		ns.corporation.unlockUpgrade("Warehouse API");
	}
const phase = 1;

switch (phase){
	case 1:
	const materials = ["Hardware", "AI Cores", "Real Estate"];
	const hardware_amt = 2800;
	const core_amt = 2520;
	const realestate_amt = 146400;
	const robot_amt = 96;	
	break;

case 2:
	const materials = ["Hardware", "AI Cores", "Robots", "Real Estate"];
	const hardware_amt = 2800;
	const core_amt = 2520;
	const realestate_amt = 146400;
	const robot_amt = 96;
	break;

case 3:
	const materials = ["Hardware", "AI Cores", "Robots", "Real Estate"];
	const hardware_amt = 2800;
	const core_amt = 2520;
	const realestate_amt = 146400;
	const robot_amt = 96;

	default:
	break;

}


	for (let div of corp.divisions) {
		let divExists = corp.divisions.find(d => d.type === "Agriculture"); //check for division
		if (divExists) {
			for (let cityName of cities) {

				var wh_size = ns.corporation.getWarehouse(div.name, cityName).size;
				var wh_size_used = ns.corporation.getWarehouse(div.name, cityName).sizeUsed;
				var wh_percent_used = (wh_size_used / wh_size) * 100;

				while (wh_size < 2000) {
					ns.print(wh_size);
					ns.print(wh_percent_used.toFixed(0));
					ns.print(div.name);
					ns.print(cityName);
					ns.print(ns.corporation.getUpgradeWarehouseCost(div.name, cityName))
					ns.corporation.upgradeWarehouse(div.name, cityName);
					wh_size = ns.corporation.getWarehouse(div.name, cityName).size;
					wh_size_used = ns.corporation.getWarehouse(div.name, cityName).sizeUsed;
					wh_percent_used = (wh_size_used / wh_size) * 100;
					await ns.sleep(200);

				}

				for (let material in materials) {
					var amt = 0;
					let currentstock = ns.corporation.getMaterial(div.name, cityName, materials[material]).qty
					switch (materials[material]) {
						case "Hardware":
							if (currentstock < hardware_amt) amt = hardware_amt - currentstock;


							break;
						case "AI Cores":
							if (currentstock < core_amt) amt = core_amt - currentstock;
							break;
						case "Real Estate":
							if (currentstock < realestate_amt) amt = realestate_amt - currentstock;
							break;
						case "Robots":
							if (currentstock < robot_amt) amt = robot_amt - currentstock;
							break;
						default:
							amt = 0;
							break;
					}

					ns.print(div.name)
					ns.print(cityName);
					ns.print(materials[material]);
					ns.print(amt);
					if (amt > 0) ns.corporation.buyMaterial(div.name, cityName, materials[material], (0.1 * amt));
					await ns.sleep(1000)
					ns.corporation.buyMaterial(div.name, cityName, materials[material], 0)

				}


			}
		}


	}



}