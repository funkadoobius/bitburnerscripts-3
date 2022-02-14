/**  
 * 
 @param {NS} ns */

 export async function main(ns) {
    const corp = eval("ns.corporation");

    let div = "ag";
    let division = corp.getDivision(div);
    let DBmeta = {
        "Research & Development": 0,
        "Business": 0,
        "Engineer": 0,
        "Management": 0,
        "Operations": 0,
        "Training": 0
    };


    let employeeDB = [];



    for (let cityName of division.cities) {

        let office = corp.getOffice(division.name, cityName);

        office.employees.forEach(name => {
            let tempEmployee = corp.getEmployee(div, cityName, name);
            employeeDB.push(tempEmployee);
        });



    }

// count the employees in each job title
    for (let employee of employeeDB) {
        DBmeta[employee.pos] = DBmeta[employee.pos] + 1;
        
    }
ns.print(DBmeta);
    //ns.print(employeeDB);
}