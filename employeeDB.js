/**  
 * 
 @param {NS} ns */

 export async function main(ns) {
	const corp = eval(ns.corporation);

	let div = "Agriculture";
	let division = corp.getDivision(div);



	let employeeDB = [];



	for (cityName of division.cities) {

		let office = corp.getOffice(division.name, cityName);
		
		office.employees.forEach(name => {
			let tempEmployee = corp.getEmployee(div, cityName, name);
			employeeDB.push(tempEmployee);
		});



	}

	ns.print(employeeDB);
}
