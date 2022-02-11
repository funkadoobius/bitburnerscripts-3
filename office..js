/** @param {NS} ns **/
export async function main(ns) {
	const cities = ["Aevum", "Chongqing", "Sector-12", "New Tokyo", "Ishima", "Volhaven"];

	let corp = ns.corporation.getCorporation(); //refresh corp stats

	if (!ns.corporation.hasUnlockUpgrade("Warehouse API") && ns.corporation.getUnlockUpgradeCost("Warehouse API") > corp.funds) {
		throw new Error("FAILED: Insufficient funds for Warehouse API, required")
	} else if (!ns.corporation.hasUnlockUpgrade("Warehouse API") && ns.corporation.getUnlockUpgradeCost("Warehouse API") < corp.funds) {
		ns.corporation.unlockUpgrade("Warehouse API");
	}

	const jobs = [
		["Research & Development", 2],
		["Business", 1],
		["Engineer", 2],
		["Management", 2],
		["Operations", 2],
		["Training", 0]
	]

	const targetOfficeSize = 9;



	for (let div of corp.divisions) {
		let divExists = corp.divisions.find(d => d.type === "Agriculture"); //check for division
		if (divExists) {
			for (let cityName of cities) {

				let thisOffice = ns.corporation.getOffice(div.name, cityName);

				if (thisOffice.size < targetOfficeSize && ns.corporation.getOfficeSizeUpgradeCost(div.name, cityName, (targetOfficeSize - thisOffice.size)) < corp.funds) {

					ns.corporation.upgradeOfficeSize(div.name, cityName, (targetOfficeSize - thisOffice.size))
					ns.print("added ", (targetOfficeSize - thisOffice.size), " to office in ", cityName);
					await ns.sleep(1000);
				}


				ns.print("#employees: ", thisOffice.employees.length, " - office size: ", thisOffice.size)

				let i = 0;
				let newhires = thisOffice.size - thisOffice.employees.length;

				while (i < newhires) {

					ns.corporation.hireEmployee(div.name, cityName);
					ns.print("hired employee in ", cityName, ", ", (newhires - i), " left to go.");
					await ns.sleep(1000);
					i++;
				}

				jobs.forEach(job => {
					ns.print(cityName, " ", job[0], " ", job[1]);
					ns.corporation.setAutoJobAssignment(div.name, cityName, job[0], job[1]);

					//await ns.sleep(1000);
				});


			}

		}
	}


}