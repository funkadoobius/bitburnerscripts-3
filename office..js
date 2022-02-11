/** @param {NS} ns **/

const phase = args[0];
const targetOfficeSize = 0;
const jobs = [];

let corp = ns.corporation.getCorporation(); //refresh corp stats
const cities = ["Aevum", "Chongqing", "Sector-12", "New Tokyo", "Ishima", "Volhaven"];
const targetDiv = "Agriculture";

switch (phase) {
	case 1:
		jobs = [
			["Research & Development", 0],
			["Business", 1],
			["Engineer", 1],
			["Management", 0],
			["Operations", 1],
			["Training", 0]
		]
		targetOfficeSize = 3;
		break;

	case 2:
		jobs = [
			["Research & Development", 2],
			["Business", 1],
			["Engineer", 2],
			["Management", 2],
			["Operations", 2],
			["Training", 0]
		]
		targetOfficeSize = 9;
		break;

	case 3:
		jobs = [
			["Research & Development", 4],
			["Business", 2],
			["Engineer", 4],
			["Management", 4],
			["Operations", 4],
			["Training", 0]
		]
		targetOfficeSize = 18;
		break;

	default:
		break;
}


export function officeUpgrader(ns, divname, cityName, newsize) {

	let thisOffice = ns.corporation.getOffice(divname, cityName);

	if (thisOffice.size < targetOfficeSize && ns.corporation.getOfficeSizeUpgradeCost(divname, cityName, (targetOfficeSize - thisOffice.size)) < corp.funds) {

		ns.corporation.upgradeOfficeSize(divname, cityName, (newsize - thisOffice.size))
		ns.print("added ", (newsize - thisOffice.size), " to office in ", cityName);
		await ns.sleep(1000);
	}


}


export function fillOffice(ns, divname, cityName) {

	let i = 0;
	let newhires = thisOffice.size - thisOffice.employees.length;

	while (i < newhires) {
		ns.print("#employees: ", thisOffice.employees.length, " - office size: ", thisOffice.size)
		ns.corporation.hireEmployee(divname, cityName);
		ns.print("hired employee in ", cityName, ", ", (newhires - i), " left to go.");
		await ns.sleep(1000);
		i++;
	}

	jobs.forEach(job => {
		ns.print(cityName, " ", job[0], " ", job[1]);
		ns.corporation.setAutoJobAssignment(divname, cityName, job[0], job[1]);

		//await ns.sleep(1000);
	});
}

export async function main(ns) {


	if (!ns.corporation.hasUnlockUpgrade("Warehouse API") && ns.corporation.getUnlockUpgradeCost("Warehouse API") > corp.funds) {
		throw new Error("FAILED: Insufficient funds for Warehouse API, required")
	} else if (!ns.corporation.hasUnlockUpgrade("Warehouse API") && ns.corporation.getUnlockUpgradeCost("Warehouse API") < corp.funds) {
		ns.corporation.unlockUpgrade("Warehouse API");
	}

}

for (let div of corp.divisions) {

	let divExists = corp.divisions.find(d => d.type === targetDiv); //check for division

	if (divExists) {

		for (let cityName of cities) {

			officeUpgrader(div.name, cityName, targetOfficeSize);

			fillOffice(div.name, cityName);

		}

	}
}


